"""Small public retrieval interface; metadata search is separate from asset reads."""

from .catalog import Catalog
from .retrieval import MAX_QUERY_LENGTH, Retrieval, normalize


class HoloUIEngine:
    def __init__(self, root_dir):
        self.catalog = Catalog(root_dir)
        self.components = self.catalog.components
        self.retrieval = Retrieval(self.catalog)

    def close(self):
        self.retrieval.close()

    def search_and_retrieve(self, query, style=None, category=None, interaction=None,
                            motion=None, scale=None, component_id=None, *, placement=None,
                            lifecycle=None, runtime=None, mode='full', limit=1, include_design=False):
        filters = {key: value for key, value in (
            ('style', style), ('category', category), ('interaction', interaction),
            ('motion', motion), ('scale', scale), ('placement', placement),
            ('lifecycle', lifecycle), ('runtime', runtime)) if value is not None}
        self._validate_request(query, filters, component_id, mode, limit, include_design)
        hits = self.retrieval.search(query, filters, component_id, limit)
        components = [self._component(cid, score, reasons) for cid, score, reasons in hits]
        is_id_lookup = component_id is not None or normalize(query) in self.catalog.ids
        if not components and not is_id_lookup:
            components = self._design_system(query, filters)
        if not components:
            return {'count': 0, 'components': [], 'selection_strategy': 'no_match',
                    'message': 'No matching asset. Refine the query or explicitly change constraints.'}
        result = {
            'count': len(components), 'components': components,
            'selection_strategy': 'direct_id_lookup' if is_id_lookup else 'constraint_lexical',
            'mode': mode,
            'instruction': 'Preserve declared runtime dependencies and accessibility. Adapt only when compatible with the target project.',
        }
        return self._hydrate(result, include_design) if mode == 'full' else result

    def _validate_request(self, query, filters, component_id, mode, limit, include_design):
        if not isinstance(query, str) or len(query) > MAX_QUERY_LENGTH:
            raise ValueError('query must be a string of at most 2000 characters')
        if component_id is not None and (not isinstance(component_id, str) or not component_id.strip()
                                         or len(component_id) > MAX_QUERY_LENGTH):
            raise ValueError('component_id must be a nonempty ID or route alias')
        if mode not in ('full', 'summary') or type(limit) is not int or not 1 <= limit <= 3:
            raise ValueError('mode must be full/summary and limit must be an integer from 1 to 3')
        if type(include_design) is not bool:
            raise ValueError('include_design must be boolean')
        self.catalog.validate_filters(filters)

    def _component(self, cid, score, reasons):
        comp = self.components[cid]
        return {
            **{key: comp[key] for key in ('id', 'name', 'style', 'when', 'when_not')},
            'tokens': dict(comp['tokens']), 'kind': 'component',
            'match_score': score, 'match_reasons': list(reasons),
            'snippet_path': comp['snippet'],
            'code_type': 'react' if comp['snippet'].endswith(('.jsx', '.tsx')) else 'html',
            'css_paths': list(self.catalog.css_paths(comp['style'])),
            'resources': [dict(r) for r in comp.get('resources', [])],
            'npm_dependencies': list(self.catalog.npm_dependencies[cid]),
        }

    def _design_system(self, query, filters):
        if any(key != 'style' for key in filters):
            return []
        hints = self.retrieval.hints(normalize(query))
        styles = [filters['style']] if 'style' in filters else list(dict.fromkeys(style for style, _ in hints))
        if len(styles) != 1 or any(comp['style'] == styles[0] for comp in self.components.values()):
            return []
        style_id = styles[0]
        style = self.catalog.styles[style_id]
        return [{
            'id': style_id.replace('_', '-') + '-tokens', 'kind': 'design_system',
            'name': style['name'], 'style': style_id,
            'when': '; '.join(style.get('when_to_use', [])),
            'when_not': '; '.join(style.get('when_not_to_use', [])),
            'css_paths': list(self.catalog.css_paths(style_id)), 'match_reasons': ['design_system'],
        }]

    def _asset_references(self, components, include_design):
        css = [(path, 'css') for comp in components for path in comp['css_paths']]
        resources = [(r['path'], r.get('kind', 'javascript')) for comp in components for r in comp.get('resources', [])]
        design = [(self.catalog.styles[c['style']]['design_md'], 'design') for c in components
                  if include_design and self.catalog.styles[c['style']].get('design_md')]
        presets = [(self.catalog.styles[c['style']]['prompt_preset'], 'guideline') for c in components
                   if c['kind'] == 'design_system' and self.catalog.styles[c['style']].get('prompt_preset')]
        assets = {}
        for path, kind in css + resources + design + presets:
            if path in assets and assets[path] != kind:
                raise ValueError(f"Conflicting asset kinds for '{path}': {assets[path]} vs {kind}")
            assets[path] = kind
        return assets

    def _hydrate(self, result, include_design):
        components = [{**comp, 'snippet': self.catalog.read_asset(comp['snippet_path'])}
                      if comp['kind'] == 'component' else comp for comp in result['components']]
        assets = {path: {'kind': kind, 'content': self.catalog.read_asset(path)}
                  for path, kind in self._asset_references(components, include_design).items()}
        return {**result, 'components': components, 'assets': assets}

    def tool_definition(self):
        filters = {**self.catalog.dimensions, 'style': list(self.catalog.styles)}
        return {
            'name': 'get_holo_ui_component',
            'description': (
                'Find UI primitives and design-system assets. Explicit style and feature filters are hard constraints. '
                'Translate user runtime/placement/lifecycle requirements into filters; do not silently relax them. '
                'Use summary mode to compare metadata without code, then component_id for the selected asset. '
                'Full mode defaults to one result with complete shared CSS. DESIGN.md is optional guidance, not source code.'),
            'inputSchema': {
                'type': 'object', 'additionalProperties': False,
                'properties': {
                    'query': {'type': 'string', 'maxLength': MAX_QUERY_LENGTH, 'description': 'Intent or keywords; empty is allowed with ID or filters.'},
                    **{key: {'type': 'string', 'enum': list(values), 'description': 'Required exact ' + key}
                       for key, values in filters.items()},
                    'component_id': {'type': 'string', 'minLength': 1, 'maxLength': MAX_QUERY_LENGTH,
                                     'description': 'Canonical ID or unique route alias; constraints still apply.'},
                    'mode': {'type': 'string', 'enum': ['full', 'summary'], 'default': 'full'},
                    'limit': {'type': 'integer', 'minimum': 1, 'maximum': 3, 'default': 1},
                    'include_design': {'type': 'boolean', 'default': False},
                },
                'required': ['query'],
            },
        }


def format_tool_response(result):
    if not result['count']:
        return result['message']
    parts = [f"### Holo UI Vault (Matched {result['count']} assets)"]
    for comp in result['components']:
        parts.extend([
            f"#### {comp['name']} (ID: `{comp['id']}`)",
            f"- Style: `{comp['style']}`; kind: `{comp['kind']}`",
            '- Match: ' + ', '.join(comp['match_reasons']),
            '- Usage: ' + comp['when'], '- Avoid: ' + comp['when_not'],
        ])
        if comp.get('tokens'):
            parts.append('- Features: ' + ', '.join(f'{k}={v}' for k, v in comp['tokens'].items()))
        if comp['kind'] == 'component':
            packages = comp['npm_dependencies']
            parts.append('- Direct npm imports: ' + ', '.join(f'`{pkg}`' for pkg in packages)
                         if packages else '- No direct npm imports detected (static scan)')
        parts.append('- CSS assets: ' + ', '.join(comp['css_paths']))
        if comp.get('resources'):
            parts.append('- Helper resources: ' + ', '.join(r['path'] for r in comp['resources']))
        if 'snippet' in comp:
            language = 'tsx' if comp['code_type'] == 'react' else 'html'
            parts.append(f"```{language}\n{comp['snippet']}\n```")
    for path, asset in result.get('assets', {}).items():
        parts.append(f'### Shared asset: {path}')
        if asset['kind'] == 'css':
            parts.append(f"```css\n{asset['content']}\n```")
        elif asset['kind'] == 'javascript':
            parts.append(
                f"> Note: When moving this component, keep the relative directory structure or update the import path accordingly.\n\n```javascript\n{asset['content']}\n```"
            )
        else:
            parts.append(asset['content'])
    parts.append(result['instruction'])
    return '\n\n'.join(parts)
