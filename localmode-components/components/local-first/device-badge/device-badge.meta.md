# Device Badge

### Description
A local-first capability badge. Detects WebGPU / WASM / IndexedDB support via a bundled useCapabilities() hook (copy-owned, reads navigator — no @localmode dependency) and renders a themed status pill. Use it to gate model-download UIs behind device support.

### Tokens
- scale: `micro`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `status`
- runtime: `react`

### When to use
Use `device-badge` when a local-first capability badge. detects webgpu / wasm / indexeddb support via a bundled usecapabilities() hook (copy-owned, reads navigator — no @localmode dependency) and renders a themed status pill. use it to gate model-download uis behind device support.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
