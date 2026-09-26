import json
import subprocess
import sys
import unittest
from pathlib import Path
from typing import Any

from holo_ui_mcp.server import HoloUIEngine, format_tool_response

ROOT = Path(__file__).resolve().parents[1]


class RetrievalTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine = HoloUIEngine(str(ROOT))

    @classmethod
    def tearDownClass(cls):
        cls.engine.close()

    def test_empty_and_unknown_requests_do_not_fabricate_matches(self):
        requests: list[dict[str, Any]] = [
            {'query': ''}, {'query': 'zzzzunknown'},
            {'query': 'toggle', 'component_id': 'missing-id'},
        ]
        for args in requests:
            with self.subTest(args=args):
                self.assertEqual(self.engine.search_and_retrieve(**args)['count'], 0)

    def test_route_alias_preserves_canonical_metadata(self):
        canonical = self.engine.search_and_retrieve('', component_id='theme-toggle-classic')
        alias = self.engine.search_and_retrieve('', component_id='toggle-classic')
        self.assertEqual(alias['components'], canonical['components'])

    def test_longest_phrase_prefers_theme_toggle_style(self):
        result = self.engine.search_and_retrieve('theme toggle')
        self.assertEqual(result['components'][0]['style'], 'minimal_theme_toggles')

    def test_chinese_phrase_can_appear_inside_a_sentence(self):
        result = self.engine.search_and_retrieve('请给我一个主题切换按钮')
        self.assertEqual(result['components'][0]['style'], 'minimal_theme_toggles')

    def test_hig_does_not_match_highlight(self):
        result = self.engine.search_and_retrieve('highlight text')
        self.assertTrue(all(c['style'] != 'apple_human_interface' for c in result['components']))

    def test_explicit_constraints_apply_to_exact_id(self):
        result = self.engine.search_and_retrieve('', component_id='shimmer-button', motion='none')
        self.assertEqual(result['count'], 0)

    def test_query_exact_identity_enforces_strict_filtering_without_subword_degradation(self):
        # 1. Canonical ID with conflicting filters must return 0, no subword degradation
        self.assertEqual(self.engine.search_and_retrieve('thinking-state', scale='micro')['count'], 0)
        self.assertEqual(self.engine.search_and_retrieve('day-night-sky-toggle', style='minimal_theme_toggles')['count'], 0)
        self.assertEqual(self.engine.search_and_retrieve('diff-table', interaction='confirmation')['count'], 0)

        # 2. Canonical ID satisfying filters returns the component
        res_ok = self.engine.search_and_retrieve('thinking-state', scale='standard')
        self.assertEqual(res_ok['count'], 1)
        self.assertEqual(res_ok['components'][0]['id'], 'thinking-state')

        # 3. Route alias with conflicting filters returns 0
        self.assertEqual(self.engine.search_and_retrieve('toggle-classic', runtime='react-motion')['count'], 0)

        # 4. Route alias satisfying filters returns the canonical component
        res_alias = self.engine.search_and_retrieve('toggle-classic', runtime='html-css')
        self.assertEqual(res_alias['count'], 1)
        self.assertEqual(res_alias['components'][0]['id'], 'theme-toggle-classic')

        # 5. Case-insensitivity and whitespace normalization
        self.assertEqual(self.engine.search_and_retrieve('  THINKING-STATE \n', scale='micro')['count'], 0)
        res_ws = self.engine.search_and_retrieve('  THINKING-STATE \n', scale='standard')
        self.assertEqual(res_ws['count'], 1)
        self.assertEqual(res_ws['components'][0]['id'], 'thinking-state')
        self.assertEqual(self.engine.search_and_retrieve('  TOGGLE-CLASSIC  ', runtime='react-motion')['count'], 0)

        # 6. Explicit component_id takes precedence over query text
        res_prio = self.engine.search_and_retrieve('thinking-state', component_id='ld-arc')
        self.assertEqual(res_prio['count'], 1)
        self.assertEqual(res_prio['components'][0]['id'], 'ld-arc')

        # 7. Shared descriptive aliases are NOT forced to be single identity
        res_shared = self.engine.search_and_retrieve('dark-mode-toggle', limit=3)
        self.assertGreater(res_shared['count'], 0)

        # 8. Long sentence containing an ID is not treated as exact identity query
        res_sentence = self.engine.search_and_retrieve('please show thinking-state for reasonings')
        self.assertGreater(res_sentence['count'], 0)

        # 9. No design system fallback when exact component identity query has conflicting filter
        res_ds = self.engine.search_and_retrieve('theme-toggle-classic', style='apple_human_interface')
        self.assertEqual(res_ds['count'], 0)


    def test_all_seven_dimensions_are_hard_filters(self):
        expected: dict[str, Any] = {'scale': 'micro', 'placement': 'embedded', 'interaction': 'output',
                    'lifecycle': 'state-driven', 'motion': 'css-loop',
                    'category': 'status', 'runtime': 'html-css'}
        result = self.engine.search_and_retrieve('', **expected)
        self.assertGreater(result['count'], 0)
        for component in result['components']:
            self.assertEqual(component['tokens'], expected)

    def test_invalid_filter_is_rejected(self):
        with self.assertRaises(ValueError):
            self.engine.search_and_retrieve('toggle', runtime='not-a-runtime')

    def test_full_delivery_preserves_complete_shared_css(self):
        for cid, css_path in (
            ('ld-arc', 'loadingdev-components/shared/base.css'),
            ('thinking-state', 'beautifului-components/shared/base.css'),
            ('theme-toggle-classic', 'themetoggle-components/shared/base.css'),
        ):
            with self.subTest(cid=cid):
                result = self.engine.search_and_retrieve('', component_id=cid)
                text = format_tool_response(result)
                self.assertIn((ROOT / css_path).read_text(encoding='utf-8'), text)

    def test_summary_omits_source_and_design(self):
        result = self.engine.search_and_retrieve('toggle', mode='summary', limit=3)
        self.assertEqual(result['count'], 3)
        self.assertNotIn('assets', result)
        self.assertTrue(all('snippet' not in c and 'design_md' not in c for c in result['components']))

    def test_design_is_opt_in_and_formatted(self):
        args: dict[str, Any] = {'query': '', 'component_id': 'theme-toggle-classic'}
        design = (ROOT / 'themetoggle-components/DESIGN.md').read_text(encoding='utf-8')
        self.assertNotIn(design, format_tool_response(self.engine.search_and_retrieve(**args)))
        result = self.engine.search_and_retrieve(**args, include_design=True)
        self.assertIn(design, format_tool_response(result))

    def test_resources_are_deduplicated_in_multi_result_response(self):
        result = self.engine.search_and_retrieve('', style='minimal_theme_toggles', limit=3)
        text = format_tool_response(result)
        css = (ROOT / 'themetoggle-components/shared/base.css').read_text(encoding='utf-8')
        self.assertEqual(text.count(css), 1)

    def test_helper_resources_delivery_and_deduplication(self):
        # 1. Old components without resources behave unchanged
        old_res = self.engine.search_and_retrieve('', component_id='shimmer-button', mode='full')
        self.assertEqual(old_res['components'][0].get('resources', []), [])
        self.assertTrue(all(a.get('kind') != 'javascript' for a in old_res.get('assets', {}).values()))

        # 2. Both real components retrieve the full helper source
        for cid in ('day-night-sky-toggle', 'landscape-orb-toggle'):
            with self.subTest(cid=cid):
                full_res = self.engine.search_and_retrieve('', component_id=cid, mode='full')
                self.assertIn('rewampui-components/shared/siteTheme.js', full_res.get('assets', {}))
                asset = full_res['assets']['rewampui-components/shared/siteTheme.js']
                self.assertEqual(asset['kind'], 'javascript')
                self.assertIn('export function getSiteTheme', asset['content'])
                self.assertIn('export function setSiteTheme', asset['content'])

                # Formatted text contains javascript code block and instruction
                text = format_tool_response(full_res)
                self.assertIn('### Shared asset: rewampui-components/shared/siteTheme.js', text)
                self.assertIn('```javascript', text)
                self.assertIn('export function getSiteTheme', text)

        # 3. Multi-result shared helper deduplication: only output once
        multi_res = self.engine.search_and_retrieve('toggle', style='kinetic_motion_tactile', limit=3, mode='full')
        helper_path = 'rewampui-components/shared/siteTheme.js'
        if helper_path in multi_res.get('assets', {}):
            text = format_tool_response(multi_res)
            helper_src = (ROOT / helper_path).read_text(encoding='utf-8')
            self.assertEqual(text.count(helper_src), 1)

        # 4. Summary mode: returns dependency references, does NOT read helper
        summary_res = self.engine.search_and_retrieve('', component_id='day-night-sky-toggle', mode='summary')
        self.assertNotIn('assets', summary_res)
        self.assertEqual(summary_res['components'][0].get('resources'), [
            {'path': 'rewampui-components/shared/siteTheme.js', 'kind': 'javascript'}
        ])

        # 5. Conflicting kinds for same path raises ValueError
        conflicting_components = [
            {
                'id': 'c1', 'style': 'minimal_theme_toggles', 'kind': 'component',
                'css_paths': ['themetoggle-components/shared/base.css'], 'resources': [],
            },
            {
                'id': 'c2', 'style': 'minimal_theme_toggles', 'kind': 'component',
                'css_paths': [], 'resources': [{'path': 'themetoggle-components/shared/base.css', 'kind': 'javascript'}],
            },
        ]
        with self.assertRaisesRegex(ValueError, 'Conflicting'):
            self.engine._asset_references(conflicting_components, include_design=False)


class StdioTests(unittest.TestCase):
    def test_stdio_lists_full_schema_and_handles_constraints(self):
        requests = [
            {'jsonrpc': '2.0', 'id': 1, 'method': 'tools/list'},
            {'jsonrpc': '2.0', 'id': 2, 'method': 'tools/call', 'params': {
                'name': 'get_holo_ui_component', 'arguments': {
                    'query': '', 'component_id': 'shimmer-button', 'runtime': 'html-css'}}},
            {'jsonrpc': '2.0', 'id': 3, 'method': 'tools/call', 'params': {
                'name': 'get_holo_ui_component', 'arguments': {
                    'query': '', 'component_id': 'fluid-morph-orb', 'mode': 'summary'}}},
        ]
        run = subprocess.run([sys.executable, '-m', 'holo_ui_mcp.server'], cwd=ROOT,
                             input='\n'.join(json.dumps(r) for r in requests) + '\n',
                             capture_output=True, text=True, encoding='utf-8', timeout=30, check=False)
        self.assertEqual(run.returncode, 0, run.stderr)
        responses = [json.loads(line) for line in run.stdout.splitlines()]
        schema = responses[0]['result']['tools'][0]['inputSchema']['properties']
        for key in ('runtime', 'placement', 'lifecycle'):
            self.assertIn(key, schema)
        self.assertIn('minimal_theme_toggles', schema['style']['enum'])
        self.assertIn('No matching', responses[1]['result']['content'][0]['text'])
        self.assertIn('Direct npm imports: `react`, `three`', responses[2]['result']['content'][0]['text'])

    def test_protocol_errors_and_resource_reads(self):
        requests = [
            {'id': 1, 'method': 'initialize'},
            {'method': 'notifications/initialized'},
            {'id': 2, 'method': 'ping'},
            {'id': 3, 'method': 'resources/list'},
            {'id': 4, 'method': 'prompts/list'},
            {'id': 5, 'method': 'missing'},
            {'id': 6, 'method': 'tools/call', 'params': {'name': 'missing'}},
            {'id': 7, 'method': 'tools/call', 'params': {'name': 'get_holo_ui_component', 'arguments': []}},
            {'id': 8, 'method': 'tools/call', 'params': {'name': 'get_holo_ui_component', 'arguments': {
                'query': '', 'component_id': 'theme-toggle-classic', 'include_design': True}}},
        ]
        run = subprocess.run([sys.executable, '-m', 'holo_ui_mcp.server'], cwd=ROOT,
                             input='\ninvalid-json\n' + '\n'.join(json.dumps(r) for r in requests) + '\n',
                             capture_output=True, text=True, encoding='utf-8', timeout=30, check=False)
        self.assertEqual(run.returncode, 0, run.stderr)
        responses = {r['id']: r for r in map(json.loads, run.stdout.splitlines())}
        self.assertIn('serverInfo', responses[1]['result'])
        self.assertEqual(responses[5]['error']['code'], -32601)
        self.assertEqual(responses[6]['error']['code'], -32601)
        self.assertTrue(responses[7]['result']['isError'])
        self.assertNotIn(str(ROOT), responses[7]['result']['content'][0]['text'])
        self.assertIn('themetoggle-components/shared/base.css', responses[8]['result']['content'][0]['text'])

    def test_stdio_delivers_helper_resources(self):
        requests = [
            {'jsonrpc': '2.0', 'id': 1, 'method': 'tools/call', 'params': {
                'name': 'get_holo_ui_component', 'arguments': {
                    'query': '', 'component_id': 'day-night-sky-toggle', 'mode': 'full'}}},
        ]
        run = subprocess.run([sys.executable, '-m', 'holo_ui_mcp.server'], cwd=ROOT,
                             input='\n'.join(json.dumps(r) for r in requests) + '\n',
                             capture_output=True, text=True, encoding='utf-8', timeout=30, check=False)
        self.assertEqual(run.returncode, 0, run.stderr)
        resp = json.loads(run.stdout.strip())
        content_text = resp['result']['content'][0]['text']
        self.assertIn('rewampui-components/shared/siteTheme.js', content_text)
        self.assertIn('```javascript', content_text)
        self.assertIn('export function getSiteTheme', content_text)

    def test_cli_and_validation_entrypoints(self):
        for args in (['tools/mcp_server.py', '--test', 'thinking-state'],
                     ['tools/validate_tokens.py'], ['tools/build_index.py', '--check']):
            with self.subTest(args=args):
                run = subprocess.run([sys.executable, *args], cwd=ROOT, capture_output=True,
                                     text=True, encoding='utf-8', timeout=30, check=False)
                self.assertEqual(run.returncode, 0, run.stderr)


if __name__ == '__main__':
    unittest.main()
