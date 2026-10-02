# Provider Fallback Badge

### Description
Surfaces the active AI backend tier — a zero-download built-in (Chrome AI) vs a model-download provider (Transformers.js) — plus a WASM threading variant (Multi-thread when cross-origin isolated / SharedArrayBuffer is available, else Single-thread). A software-side sibling to DeviceBadge; data source useCapabilities (crossOriginIsolated) + provider identifier.

### Tokens
- scale: `micro`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `status`
- runtime: `react`

### When to use
Use `provider-fallback-badge` when surfaces the active ai backend tier — a zero-download built-in (chrome ai) vs a model-download provider (transformers.js) — plus a wasm threading variant (multi-thread when cross-origin isolated / sharedarraybuffer is available, else single-thread). a software-side sibling to devicebadge; data source usecapabilities (crossoriginisolated) + provider identifier.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
