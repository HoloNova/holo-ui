import json
import re
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

from holo_ui_mcp.catalog import Catalog
from holo_ui_mcp.engine import HoloUIEngine
from holo_ui_mcp.retrieval import phrase_matches, terms
from tools.build_index import (
    encode,
    main,
    migrate,
    render_dependency_view,
    render_views,
)

ROOT = Path(__file__).resolve().parents[1]
DOCUMENT = json.loads((ROOT / 'REGISTRY.json').read_text(encoding='utf-8'))


def changed_component(cid, **fields):
    return {**DOCUMENT, 'components': {**DOCUMENT['components'], cid: {
        **DOCUMENT['components'][cid], **fields}}}


class CatalogTests(unittest.TestCase):
    def test_every_route_alias_resolves_to_canonical_id(self):
        engine = HoloUIEngine(ROOT)
        self.addCleanup(engine.close)
        for cid, comp in engine.components.items():
            expected = engine.search_and_retrieve('', component_id=cid, mode='summary')
            for alias in comp.get('route_aliases', []):
                with self.subTest(alias=alias):
                    result = engine.search_and_retrieve('', component_id=alias, mode='summary')
                    self.assertEqual(expected, result)

    def test_alias_collision_rejected_but_search_synonyms_may_overlap(self):
        Catalog(ROOT)  # Several existing descriptive aliases intentionally overlap.
        with self.assertRaisesRegex(ValueError, 'unique'):
            Catalog(ROOT, changed_component('thinking-state', route_aliases=['loading-state']))

    def test_schema_identity_tokens_and_references_are_validated(self):
        documents = (
            {**DOCUMENT, 'schema_version': 2},
            {**DOCUMENT, 'components': {}},
            changed_component('thinking-state', id='different'),
            changed_component('thinking-state', tokens={}),
            changed_component('thinking-state', tokens={**DOCUMENT['components']['thinking-state']['tokens'], 'scale': 'huge'}),
            changed_component('thinking-state', aliases='wrong'),
            changed_component('thinking-state', name=None),
            {**DOCUMENT, 'functions': {'bad': {'items': ['unknown']}}},
            {**DOCUMENT, 'keywords': {'unknown': 'missing-style'}},
        )
        for document in documents:
            with self.subTest(document_keys=list(document)), self.assertRaises((ValueError, TypeError)):
                Catalog(ROOT, document)

    def test_paths_cannot_escape_asset_root(self):
        catalog = Catalog(ROOT)
        for path in ('../outside.css', '/etc/passwd', 'C:/Windows/win.ini',
                     'C:\\Windows\\win.ini', '', None, 'missing.css', '.'):
            with self.subTest(path=path), self.assertRaises(ValueError):
                catalog.asset_path(path)

    def test_resources_schema_and_path_validation(self):
        # 1. Valid resources passes
        valid_doc = changed_component('thinking-state', resources=[
            {'path': 'rewampui-components/shared/siteTheme.js', 'kind': 'javascript'}
        ])
        cat = Catalog(ROOT, valid_doc)
        self.assertEqual(cat.components['thinking-state']['resources'][0]['kind'], 'javascript')

        # 2. Missing resource file rejected
        missing_doc = changed_component('thinking-state', resources=[
            {'path': 'rewampui-components/shared/nonexistent.js', 'kind': 'javascript'}
        ])
        with self.assertRaises(ValueError):
            Catalog(ROOT, missing_doc)

        # 3. Path escaping asset root rejected
        escaping_doc = changed_component('thinking-state', resources=[
            {'path': '../outside.js', 'kind': 'javascript'}
        ])
        with self.assertRaises(ValueError):
            Catalog(ROOT, escaping_doc)

        # 4. Invalid kind rejected (only 'javascript' is supported)
        bad_kind_doc = changed_component('thinking-state', resources=[
            {'path': 'rewampui-components/shared/siteTheme.js', 'kind': 'wasm'}
        ])
        with self.assertRaises(ValueError):
            Catalog(ROOT, bad_kind_doc)

        # 5. Invalid structure rejected (not a list, or missing keys)
        for bad_res in ('invalid', [{'path': 'rewampui-components/shared/siteTheme.js'}], [{'kind': 'javascript'}]):
            with self.subTest(bad_res=bad_res), self.assertRaises((ValueError, TypeError)):
                Catalog(ROOT, changed_component('thinking-state', resources=bad_res))

        # 6. Duplicate resource paths in same component rejected
        dup_doc = changed_component('thinking-state', resources=[
            {'path': 'rewampui-components/shared/siteTheme.js', 'kind': 'javascript'},
            {'path': 'rewampui-components/shared/siteTheme.js', 'kind': 'javascript'},
        ])
        with self.assertRaises(ValueError):
            Catalog(ROOT, dup_doc)

        # 7. Invalid path types (non-string or empty string) rejected with TypeError or ValueError
        for bad_path in (None, 123, [], {}, ""):
            with self.subTest(bad_path=bad_path), self.assertRaises((TypeError, ValueError)):
                Catalog(ROOT, changed_component('thinking-state', resources=[
                    {'path': bad_path, 'kind': 'javascript'}
                ]))

        # 8. Valid cross-component resource sharing (same path, same kind) is accepted
        shared_doc = changed_component(
            'thinking-state',
            resources=[{'path': 'rewampui-components/shared/siteTheme.js', 'kind': 'javascript'}]
        )
        shared_doc['components']['loading-state'] = {
            **shared_doc['components']['loading-state'],
            'resources': [{'path': 'rewampui-components/shared/siteTheme.js', 'kind': 'javascript'}]
        }
        cat_shared = Catalog(ROOT, shared_doc)
        self.assertEqual(
            cat_shared.components['thinking-state']['resources'][0],
            cat_shared.components['loading-state']['resources'][0]
        )

        # 9. Conflict between resource and delivered shared CSS rejected
        css_conflict_doc = changed_component('thinking-state', resources=[
            {'path': 'beautifului-components/shared/base.css', 'kind': 'javascript'}
        ])
        with self.assertRaisesRegex(ValueError, 'Conflicting'):
            Catalog(ROOT, css_conflict_doc)

    def test_bad_registry_fails_instead_of_creating_empty_index(self):
        with TemporaryDirectory() as directory:
            with self.assertRaisesRegex(ValueError, 'Cannot load'):
                Catalog(directory)
            (Path(directory) / 'REGISTRY.json').write_text('{invalid', encoding='utf-8')
            with self.assertRaisesRegex(ValueError, 'Cannot load'):
                Catalog(directory)

    def test_duplicate_json_keys_are_rejected(self):
        with TemporaryDirectory() as directory:
            path = Path(directory) / 'REGISTRY.json'
            path.write_text('{"schema_version": 0,' + encode(DOCUMENT)[1:], encoding='utf-8')
            with self.assertRaisesRegex(ValueError, 'Duplicate JSON key'):
                Catalog(directory)

    def test_new_style_requires_only_metadata_not_engine_branches(self):
        original = DOCUMENT['components']['ld-arc']
        document = {
            **DOCUMENT,
            'styles': {**DOCUMENT['styles'], 'test_style': DOCUMENT['styles'][original['style']]},
            'components': {**DOCUMENT['components'], 'test-component': {
                **original, 'id': 'test-component', 'style': 'test_style', 'aliases': [], 'route_aliases': []}},
            'functions': {**DOCUMENT['functions'], 'test_group': {'items': ['test-component']}},
        }
        with patch('holo_ui_mcp.engine.Catalog', return_value=Catalog(ROOT, document)):
            engine = HoloUIEngine(ROOT)
        self.addCleanup(engine.close)
        result = engine.search_and_retrieve('', component_id='test-component', style='test_style')
        self.assertEqual(result['count'], 1)
        self.assertIn('loadingdev-components/shared/base.css', result['assets'])
        self.assertIn('test_style', engine.tool_definition()['inputSchema']['properties']['style']['enum'])

    def test_summary_never_reads_resource_contents(self):
        engine = HoloUIEngine(ROOT)
        self.addCleanup(engine.close)
        with patch.object(engine.catalog, 'read_asset', side_effect=AssertionError('Unexpected content read')):
            engine.search_and_retrieve('toggle', mode='summary', include_design=True)

    def test_request_validation(self):
        engine = HoloUIEngine(ROOT)
        self.addCleanup(engine.close)
        for kwargs in ({'query': None}, {'query': 'a' * 2001}, {'component_id': ''},
                       {'mode': 'unknown'}, {'limit': True}, {'limit': 0}, {'limit': 4},
                       {'include_design': 'yes'}, {'style': 'missing'}, {'runtime': []}):
            with self.subTest(kwargs=kwargs), self.assertRaises(ValueError):
                engine.search_and_retrieve(**{'query': '', **kwargs})

    def test_apple_is_a_design_asset_and_cannot_satisfy_component_filters(self):
        engine = HoloUIEngine(ROOT)
        self.addCleanup(engine.close)
        result = engine.search_and_retrieve('apple', include_design=True)
        self.assertEqual(result['components'][0]['kind'], 'design_system')
        self.assertTrue(any(asset['kind'] == 'design' for asset in result['assets'].values()))
        self.assertEqual(engine.search_and_retrieve('apple', style='apple_human_interface', runtime='html-css')['count'], 0)
        self.assertEqual(engine.search_and_retrieve('apple', style='minimal_theme_toggles')['count'], 0)

    def test_filters_do_not_starve_matches_and_do_not_modify_registry(self):
        engine = HoloUIEngine(ROOT)
        self.addCleanup(engine.close)
        before = encode(engine.catalog.document)
        for key, values in engine.catalog.dimensions.items():
            for value in values:
                result = engine.search_and_retrieve('', mode='summary', limit=3, **{key: value})
                self.assertTrue(all(c['tokens'][key] == value for c in result['components']))
        self.assertEqual(before, encode(engine.catalog.document))

    def test_tokenizer_and_literal_phrases(self):
        self.assertEqual(terms('The ARC-loader'), ('arc', 'loader'))
        self.assertEqual(terms('主题切换'), ('主题', '题切', '切换'))
        self.assertFalse(phrase_matches('hig', 'highlight'))
        self.assertFalse(phrase_matches('', 'anything'))
        self.assertTrue(phrase_matches('three.js', 'use three.js'))
        self.assertFalse(phrase_matches('three.js', 'use threeXjs'))
        engine = HoloUIEngine(ROOT)
        self.addCleanup(engine.close)
        for query in ('" OR * NEAR(a b)', '"; DROP TABLE documents;--', 'the please'):
            engine.search_and_retrieve(query, mode='summary')
        self.assertEqual(engine.search_and_retrieve('', component_id='ld-arc')['count'], 1)

    def test_design_md_color_tokens_match_css(self):
        # 1. BeautifulUI: Table 2.1 color tokens must match shared/base.css in both scopes
        b_doc = (ROOT / 'beautifului-components/DESIGN.md').read_text(encoding='utf-8')
        b_css = (ROOT / 'beautifului-components/shared/base.css').read_text(encoding='utf-8')
        dark_idx = b_css.find('.dark,')
        css_light, css_dark = b_css[:dark_idx], b_css[dark_idx:]

        b_rows = [line for line in b_doc.splitlines() if line.startswith('| `') and 'var(--' in line]
        self.assertTrue(b_rows, "BeautifulUI DESIGN.md must contain color tokens table")
        for row in b_rows:
            parts = [p.strip().strip('`') for p in row.split('|')[1:-1]]
            if len(parts) == 4:
                role, dark_val, light_val, var_token = parts
                var_name = var_token.replace('var(', '').replace(')', '').strip()
                m_l = re.search(rf'(?:^|\s){re.escape(var_name)}:\s*([^;]+);', css_light, re.MULTILINE)
                m_d = re.search(rf'(?:^|\s){re.escape(var_name)}:\s*([^;]+);', css_dark, re.MULTILINE)
                self.assertIsNotNone(m_l, f"Light mode variable {var_name} not found in base.css")
                self.assertIsNotNone(m_d, f"Dark mode variable {var_name} not found in base.css")
                self.assertEqual(light_val, m_l.group(1).strip(), f"Light mode mismatch for {var_name}")
                self.assertEqual(dark_val, m_d.group(1).strip(), f"Dark mode mismatch for {var_name}")

        # 2. Apple Design: Table 2.2 semantic color tokens must match tokens/tokens.css
        a_doc = (ROOT / 'guidelines/apple-design/DESIGN.md').read_text(encoding='utf-8')
        a_css = (ROOT / 'guidelines/apple-design/tokens/tokens.css').read_text(encoding='utf-8')
        a_rows = [line for line in a_doc.splitlines() if line.startswith('| `') and 'var(--apple-' in line and ('#' in line or 'rgba(' in line)]
        self.assertTrue(a_rows, "Apple DESIGN.md must contain semantic color tokens")
        for row in a_rows:
            parts = [p.strip().strip('`') for p in row.split('|')[1:-1]]
            if len(parts) == 4:
                role, light_val, dark_val, var_token = parts
                var_name = var_token.replace('var(', '').replace(')', '').strip()
                m_all = re.findall(rf'(?:^|\s){re.escape(var_name)}:\s*([^;]+);', a_css, re.MULTILINE)
                self.assertTrue(m_all, f"Variable {var_name} not found in apple tokens.css")
                self.assertEqual(light_val, m_all[0].strip(), f"Light value mismatch for {var_name}")
                if len(m_all) > 1:
                    self.assertEqual(dark_val, m_all[1].strip(), f"Dark value mismatch for {var_name}")

        # 3. RewampUI: Table 2.1 color tokens must match shared/tokens.css
        r_doc = (ROOT / 'rewampui-components/DESIGN.md').read_text(encoding='utf-8')
        r_css = (ROOT / 'rewampui-components/shared/tokens.css').read_text(encoding='utf-8')
        r_rows = [line for line in r_doc.splitlines() if line.startswith('| `') and 'var(--rewamp-' in line]
        self.assertTrue(r_rows, "RewampUI DESIGN.md must contain color matrix")
        for row in r_rows:
            parts = [p.strip().strip('`') for p in row.split('|')[1:-1]]
            role, hex_code, applied, var_token = parts
            var_name = var_token.replace('var(', '').replace(')', '').strip()
            m = re.search(rf'(?:^|\s){re.escape(var_name)}:\s*([^;]+);', r_css, re.MULTILINE)
            self.assertIsNotNone(m, f"Variable {var_name} not found in rewampui tokens.css")
            css_val = m.group(1).split('/*')[0].strip()
            self.assertEqual(hex_code.lower(), css_val.lower(), f"Mismatch for {var_name}")



class MigrationTests(unittest.TestCase):
    def test_migration_preserves_original_component_metadata(self):
        views = render_views(DOCUMENT)
        migrated = migrate(views['INDEX.json'], views['ROUTER.json'])
        self.assertEqual(migrated, DOCUMENT)
        self.assertEqual(render_views(migrated), views)

    def test_conflicting_duplicate_and_routes_require_manual_review(self):
        views = render_views(DOCUMENT)
        index, router = views['INDEX.json'], views['ROUTER.json']
        first = next(iter(DOCUMENT['components'].values()))
        base = {k: v for k, v in first.items() if k not in ('snippet', 'route_aliases')}
        bad_group = {'items': [base, {**base, 'name': 'conflicting'}]}
        with self.assertRaisesRegex(ValueError, 'Conflicting'):
            migrate({**index, 'by_function': {'bad': bad_group}}, router)
        for routes in ({}, {**router['components'], 'extra': 'unknown.snippet.html'},
                       {**router['components'], 'thinking-state': router['components']['loading-state']}):
            with self.assertRaises(ValueError):
                migrate(index, {**router, 'components': routes})

    def test_write_check_and_migration_overwrite_guard(self):
        # Reuse real resource validation, but keep all script writes in a temporary root.
        with TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'REGISTRY.json').write_text(encode(DOCUMENT), encoding='utf-8')
            with patch('tools.build_index.ROOT', root), patch('holo_ui_mcp.catalog.Catalog', return_value=Catalog(ROOT)), \
                    patch('tools.build_index.render_dependency_view', side_effect=lambda doc, _: render_dependency_view(doc, ROOT)):
                self.assertEqual(main(['--write']), 0)
                self.assertEqual(main(['--check']), 0)
                self.assertEqual(main(['--migrate']), 1)
                (root / 'ROUTER.json').write_text('{}', encoding='utf-8')
                self.assertEqual(main(['--check']), 1)
                self.assertEqual(main(['--write']), 0)
                self.assertEqual(main(['--check']), 0)
                (root / 'DEPENDENCIES.json').write_text('{}', encoding='utf-8')
                self.assertEqual(main(['--check']), 1)
                self.assertEqual(main(['--write']), 0)
                self.assertEqual(main(['--check']), 0)

    def test_migrate_helpers_idempotency(self):
        from tools.migrate_helpers import migrate_helpers
        self.assertEqual(migrate_helpers(ROOT), 0)


if __name__ == '__main__':
    unittest.main()
