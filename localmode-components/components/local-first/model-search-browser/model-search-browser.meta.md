# Model Search Browser

### Description
A cmdk-based searchable model-repo browser: a controlled search input, a sort selector (downloads/likes/last-modified), result rows (repo id, author, compact download/like counts, relative last-modified, capped tag badges), load-more pagination, and a per-repo expandable file list (filename, quantization badge, human-readable size) with per-file select actions — plus loading, empty, and error-with-retry states. Purely presentational: every value arrives via props and every action leaves via a callback, so any backend can feed it (recommended wiring: the HuggingFace Hub API; a private registry or static fixtures work identically).

### Tokens
- scale: `standard`
- placement: `flow`
- interaction: `input`
- lifecycle: `persistent`
- motion: `none`
- category: `content`
- runtime: `react`

### When to use
Use `model-search-browser` when a cmdk-based searchable model-repo browser: a controlled search input, a sort selector (downloads/likes/last-modified), result rows (repo id, author, compact download/like counts, relative last-modified, capped tag badges), load-more pagination, and a per-repo expandable file list (filename, quantization badge, human-readable size) with per-file select actions — plus loading, empty, and error-with-retry states. purely presentational: every value arrives via props and every action leaves via a callback, so any backend can feed it (recommended wiring: the huggingface hub api; a private registry or static fixtures work identically).

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
