# Model Loading Panel

### Description
A full-height "waiting for model" splash — the richer blocking sibling of ModelDownloader — combining model metadata (size, context length, category, cached-vs-downloading badge) with a progress bar and a two-path help message (first-download vs cache-load). Composes the lower-level DownloadProgress; binds to useModelLoader/useModelStatus.

### Tokens
- scale: `region`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `content`
- runtime: `react`

### When to use
Use `model-loading-panel` when a full-height "waiting for model" splash — the richer blocking sibling of modeldownloader — combining model metadata (size, context length, category, cached-vs-downloading badge) with a progress bar and a two-path help message (first-download vs cache-load). composes the lower-level downloadprogress; binds to usemodelloader/usemodelstatus.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
