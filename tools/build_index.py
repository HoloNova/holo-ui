"""One-time lossless migration and deterministic legacy view generation."""

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


def load(path):
    from holo_ui_mcp.catalog import read_document

    return read_document(path)


def migrate(index, router):
    items = [item for group in index['by_function'].values() for item in group['items']]
    canonical = {item['id']: item for item in items}
    if any(item != canonical[item['id']] for item in items):
        raise ValueError('Conflicting duplicate component; review manually')
    routes = router['components']
    if any(cid not in routes for cid in canonical):
        raise ValueError('Canonical component has no route')
    paths = {routes[cid]: cid for cid in canonical}
    if len(paths) != len(canonical):
        raise ValueError('Several canonical IDs share a path; review manually')
    if any(path not in paths for path in routes.values()):
        raise ValueError('Route has no canonical component')
    components = {cid: {**comp, 'snippet': routes[cid], 'route_aliases': sorted(
        alias for alias, path in routes.items() if alias not in canonical and path == routes[cid])}
        for cid, comp in canonical.items()}
    return {
        'schema_version': 1,
        'index_metadata': {k: v for k, v in index.items() if k not in ('by_style', 'by_function')},
        'router_metadata': {k: v for k, v in router.items() if k not in ('styles', 'keywords', 'components')},
        'styles': index['by_style'],
        'functions': {key: {**group, 'items': [c['id'] for c in group['items']]}
                      for key, group in index['by_function'].items()},
        'keywords': router['keywords'],
        'components': components,
    }


def render_views(document):
    components = document['components']
    index = {
        **document['index_metadata'], 'by_style': document['styles'],
        'by_function': {key: {**group, 'items': [
            {k: v for k, v in components[cid].items() if k not in ('snippet', 'route_aliases')}
            for cid in group['items']]}
            for key, group in document['functions'].items()},
    }
    styles = {key: {
        'desc': style['aesthetic'],
        **{out: style[src] for src, out in (
            ('manifest', 'manifest'), ('design_md', 'design_md'),
            ('shared_style', 'shared_css'), ('tokens_css', 'tokens_css')) if style.get(src)},
    } for key, style in document['styles'].items()}
    router = {
        **document['router_metadata'], 'styles': styles, 'keywords': document['keywords'],
        'components': {alias: comp['snippet'] for cid, comp in components.items()
                       for alias in [cid] + comp.get('route_aliases', [])},
    }
    return {'INDEX.json': index, 'ROUTER.json': router}


IMPORT_LINE = re.compile(r'''^import\s+(?:.+?\s+from\s+)?(['"])([^'"]+)\1\s*;?$''')


def direct_imports(source):
    """Recognize simple static ES imports; reject syntax we cannot certify."""
    packages = set()
    for line in source.splitlines():
        stripped = line.strip()
        if re.search(r'\b(?:import|require)\s*\(', stripped) or re.match(r'^export\b.*\bfrom\b', stripped):
            raise ValueError('Unsupported dynamic import, require, or re-export')
        if not re.match(r'^import\b', stripped):
            if re.search(r'\bimport\b', stripped):
                raise ValueError('Unrecognized import syntax: ' + stripped)
            continue
        match = IMPORT_LINE.fullmatch(stripped)
        if match is None:
            raise ValueError('Unsupported ES import syntax: ' + stripped)
        specifier = match.group(2)
        if specifier.startswith('.'):
            continue
        if specifier.startswith(('/', '#', 'node:')) or '://' in specifier:
            raise ValueError('Unsupported module specifier: ' + specifier)
        segments = specifier.split('/')
        package = '/'.join(segments[:2]) if specifier.startswith('@') else segments[0]
        if not package or (specifier.startswith('@') and len(segments) < 2):
            raise ValueError('Invalid module specifier: ' + specifier)
        packages.add(package)
    return tuple(sorted(packages))


def render_dependency_view(document, root):
    return {'schema_version': 1, 'components': {
        cid: list(direct_imports((root / comp['snippet']).read_text(encoding='utf-8')))
        for cid, comp in sorted(document['components'].items())}}


def encode(document):
    return json.dumps(document, ensure_ascii=False, indent=2) + '\n'


def main(argv=None):
    from holo_ui_mcp.catalog import Catalog

    parser = argparse.ArgumentParser(description=__doc__)
    modes = parser.add_mutually_exclusive_group(required=True)
    modes.add_argument('--migrate', action='store_true')
    modes.add_argument('--write', action='store_true')
    modes.add_argument('--check', action='store_true')
    args = parser.parse_args(argv)
    try:
        path = ROOT / 'REGISTRY.json'
        if args.migrate:
            if path.exists():
                raise ValueError('REGISTRY.json already exists; migration will not overwrite it')
            document = migrate(load(ROOT / 'INDEX.json'), load(ROOT / 'ROUTER.json'))
        else:
            document = load(path)
        catalog = Catalog(ROOT, document)
        views = {**render_views(document), 'DEPENDENCIES.json': render_dependency_view(document, ROOT)}
        if args.check:
            stale = [name for name, data in views.items() if load(ROOT / name) != data]
            if stale:
                raise ValueError('Generated views are stale: ' + ', '.join(stale))
        else:
            if args.migrate:
                path.write_text(encode(document), encoding='utf-8')
            for name, data in views.items():
                (ROOT / name).write_text(encode(data), encoding='utf-8')
        print(f'Validated {len(catalog.components)} canonical components and {len(catalog.ids)} ID routes')
        return 0
    except (ValueError, KeyError, TypeError, OSError) as error:
        print(f'Index build failed: {error}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
