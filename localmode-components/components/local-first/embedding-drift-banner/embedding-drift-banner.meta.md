# Embedding Drift Banner

### Description
A warning panel shown when the active embedding model is incompatible with vectors already stored (model changed or dimension mismatch): explains stored vs current model ids, shows a reindex progress bar + phase label while re-embedding, and offers Re-embed All / Cancel actions. Data source useReindex + compatibility check.

### Tokens
- scale: `standard`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `content`
- runtime: `react`

### When to use
Use `embedding-drift-banner` when a warning panel shown when the active embedding model is incompatible with vectors already stored (model changed or dimension mismatch): explains stored vs current model ids, shows a reindex progress bar + phase label while re-embedding, and offers re-embed all / cancel actions. data source usereindex + compatibility check.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
