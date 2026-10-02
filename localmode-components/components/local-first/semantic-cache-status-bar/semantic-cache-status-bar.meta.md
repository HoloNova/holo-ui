# Semantic Cache Status Bar

### Description
A compact toolbar row for useSemanticCache complementing CacheBadge: entry count, hit-rate percentage, an icon-only clear-cache button (when entries > 0), and an enable/disable toggle (with a spinner while the embedding model loads). Pairs with a per-message CachedAnnotation ("Cached (38ms)"). Distinct from CacheBadge (model-download cache) — this surfaces semantic-cache hits on responses. Data source useSemanticCache.

### Tokens
- scale: `compact`
- placement: `dock`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `status`
- runtime: `react`

### When to use
Use `semantic-cache-status-bar` when a compact toolbar row for usesemanticcache complementing cachebadge: entry count, hit-rate percentage, an icon-only clear-cache button (when entries > 0), and an enable/disable toggle (with a spinner while the embedding model loads). pairs with a per-message cachedannotation ("cached (38ms)"). distinct from cachebadge (model-download cache) — this surfaces semantic-cache hits on responses. data source usesemanticcache.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
