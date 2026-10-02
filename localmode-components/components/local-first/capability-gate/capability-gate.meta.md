# Capability Gate

### Description
A true gate: renders its children only when the device meets a stated requirement (e.g. requires="webgpu"), otherwise a themed fallback slot with guidance. The capability check uses useCapabilities. Local models have hard device requirements (LiteRT Gemma is WebGPU-only), so gating prevents a broken experience. The read-only display sibling is DeviceBadge.

### Tokens
- scale: `standard`
- placement: `overlay`
- interaction: `confirmation`
- lifecycle: `on-demand`
- motion: `none`
- category: `gate`
- runtime: `react`

### When to use
Use `capability-gate` when a true gate: renders its children only when the device meets a stated requirement (e.g. requires="webgpu"), otherwise a themed fallback slot with guidance. the capability check uses usecapabilities. local models have hard device requirements (litert gemma is webgpu-only), so gating prevents a broken experience. the read-only display sibling is devicebadge.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
