# Model Cache Table

### Description
Cached-model observability table: model ID (monospace, truncated), status badge (loaded/loading/error), load duration, and relative last-used time per model — with a human-formatted size column only when entries carry sizeBytes and a per-row evict control only when onEvict is provided. Recommended producer: useDevToolsModelCache from @localmode/devtools/react.

### Tokens
- scale: `standard`
- placement: `embedded`
- interaction: `navigation`
- lifecycle: `persistent`
- motion: `none`
- category: `data`
- runtime: `react`

### When to use
Use `model-cache-table` when cached-model observability table: model id (monospace, truncated), status badge (loaded/loading/error), load duration, and relative last-used time per model — with a human-formatted size column only when entries carry sizebytes and a per-row evict control only when onevict is provided. recommended producer: usedevtoolsmodelcache from @localmode/devtools/react.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
