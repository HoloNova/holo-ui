"""Validated metadata and asset access; REGISTRY.json is the only input."""

import json
from pathlib import Path, PureWindowsPath


def _unique_keys(pairs):
    result = dict(pairs)
    if len(result) != len(pairs):
        raise ValueError('Duplicate JSON key in registry or generated view')
    return result


def read_document(path):
    try:
        return json.loads(Path(path).read_text(encoding='utf-8'), object_pairs_hook=_unique_keys)
    except (OSError, UnicodeError, json.JSONDecodeError) as error:
        raise ValueError('Cannot load ' + Path(path).name + '; rebuild or reinstall the asset package') from error


class Catalog:
    def __init__(self, root_dir, document=None):
        self.root = Path(root_dir).resolve()
        self.document = document if document is not None else read_document(self.root / 'REGISTRY.json')
        if self.document.get('schema_version') != 1:
            raise ValueError('Unsupported registry schema_version')
        self.components = self.document['components']
        self.styles = self.document['styles']
        self.dimensions = self.document['index_metadata']['feature_tokens_schema']['dimensions']
        self.keywords = self.document['keywords']
        self._validate()
        pairs = [(alias.casefold(), cid) for cid, comp in self.components.items()
                 for alias in [cid] + comp.get('route_aliases', [])]
        if len({a for a, _ in pairs}) != len(pairs):
            raise ValueError('Canonical IDs and route aliases must be unique')
        self.ids = dict(pairs)

    def asset_path(self, relative):
        if not isinstance(relative, str) or not relative:
            raise ValueError('Asset path must be a nonempty relative string')
        if Path(relative).is_absolute() or PureWindowsPath(relative).drive or '\\' in relative:
            raise ValueError('Absolute or platform-dependent asset path')
        path = (self.root / relative).resolve()
        if self.root not in path.parents:
            raise ValueError('Asset path escapes registry root')
        if not path.is_file():
            raise ValueError('Declared asset is missing: ' + relative)
        return path

    def read_asset(self, relative):
        return self.asset_path(relative).read_text(encoding='utf-8')

    def css_paths(self, style):
        metadata = self.styles[style]
        return tuple(dict.fromkeys(metadata[key] for key in ('tokens_css', 'shared_style')
                                   if metadata.get(key)))

    def _validate(self):
        if not self.components or not self.styles or not self.dimensions:
            raise ValueError('Registry must contain components, styles and dimensions')
        declared_asset_kinds = {}
        for style in self.styles.values():
            for key in ('manifest', 'tokens_css', 'shared_style', 'design_md', 'prompt_preset', 'guide'):
                path = style.get(key)
                if path:
                    self.asset_path(path)
                    if key in ('tokens_css', 'shared_style'):
                        declared_asset_kinds[path] = 'css'
                    elif key == 'design_md':
                        declared_asset_kinds[path] = 'design'
                    elif key == 'prompt_preset':
                        declared_asset_kinds[path] = 'guideline'
        for cid, comp in self.components.items():
            if comp.get('id') != cid or comp.get('style') not in self.styles:
                raise ValueError('Invalid component identity or style: ' + cid)
            if set(comp.get('tokens', {})) != set(self.dimensions):
                raise ValueError('Missing or extra feature dimensions: ' + cid)
            for key, choices in self.dimensions.items():
                if comp['tokens'][key] not in choices:
                    raise ValueError('Invalid feature value: ' + cid + '/' + key)
            for key in ('aliases', 'route_aliases'):
                values = comp.get(key, [])
                if not isinstance(values, list) or any(not isinstance(v, str) or not v.strip() for v in values):
                    raise ValueError('Invalid aliases: ' + cid)
            for key in ('name', 'when', 'when_not'):
                if not isinstance(comp.get(key), str):
                    raise TypeError('Invalid text field: ' + cid + '/' + key)
            self.asset_path(comp.get('snippet'))
            if 'resources' in comp:
                resources = comp['resources']
                if not isinstance(resources, list):
                    raise TypeError('resources must be a list: ' + cid)
                seen_paths = set()
                for res in resources:
                    if not isinstance(res, dict) or set(res.keys()) != {'path', 'kind'}:
                        raise ValueError('Invalid resource structure: ' + cid)
                    res_path = res.get('path')
                    if not isinstance(res_path, str):
                        raise TypeError('Resource path must be a string: ' + cid)
                    if not res_path.strip():
                        raise ValueError('Resource path must be a nonempty string: ' + cid)
                    if res.get('kind') != 'javascript':
                        raise ValueError('Unsupported resource kind: ' + str(res.get('kind')))
                    if res_path in seen_paths:
                        raise ValueError('Duplicate resource path declared in component: ' + cid)
                    if res_path in declared_asset_kinds and declared_asset_kinds[res_path] != res['kind']:
                        raise ValueError(
                            f"Conflicting resource kind for '{res_path}': declared as {res['kind']} in {cid}, "
                            f"previously declared as {declared_asset_kinds[res_path]}"
                        )
                    seen_paths.add(res_path)
                    declared_asset_kinds[res_path] = res['kind']
                    self.asset_path(res_path)
        references = [cid for group in self.document['functions'].values() for cid in group['items']]
        if set(references) != set(self.components):
            raise ValueError('Function groups must reference every component and no unknown IDs')
        if any(style not in self.styles for style in self.keywords.values()):
            raise ValueError('Keyword references an unknown style')

    def validate_filters(self, filters):
        allowed = {**self.dimensions, 'style': tuple(self.styles)}
        for key, value in filters.items():
            if key not in allowed or not isinstance(value, str) or value not in allowed[key]:
                raise ValueError('Invalid filter: ' + key)

    def matches(self, component, filters):
        return all((component['style'] if key == 'style' else component['tokens'][key]) == value
                   for key, value in filters.items())
