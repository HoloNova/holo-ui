# Model Downloader

### Description
The headline local-first card a user sees while a model loads on-device: model name, size, context length, category, a live progress bar, and a clear first-time-downloading vs loading-from-cache distinction (with a ready state). Includes a lower-level DownloadProgress (bar + percentage from a 0–1 fraction or {loaded,total,percent,cached}). Presentational — bind progress to useModelLoader/useModelStatus; it does not own the download. Lifted out of a chat empty-state into a reusable primitive.

### Tokens
- scale: `standard`
- placement: `embedded`
- interaction: `output`
- lifecycle: `transient`
- motion: `css-loop`
- category: `content`
- runtime: `react`

### When to use
Use `model-downloader` when the headline local-first card a user sees while a model loads on-device: model name, size, context length, category, a live progress bar, and a clear first-time-downloading vs loading-from-cache distinction (with a ready state). includes a lower-level downloadprogress (bar + percentage from a 0–1 fraction or {loaded,total,percent,cached}). presentational — bind progress to usemodelloader/usemodelstatus; it does not own the download. lifted out of a chat empty-state into a reusable primitive.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
