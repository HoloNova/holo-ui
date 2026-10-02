# Model Recommendation Card

### Description
A single scored recommendation: a radial score dial (0–100), the model name, a monospace model id, a badge row (provider, size, speed/quality tiers, recommended device webgpu/wasm/cpu with a stable tier→color mapping), a description, and reason chips. Supports an optional onToggleCompare selection affordance. Data source useModelRecommendations.

### Tokens
- scale: `standard`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `content`
- runtime: `react`

### When to use
Use `model-recommendation-card` when a single scored recommendation: a radial score dial (0–100), the model name, a monospace model id, a badge row (provider, size, speed/quality tiers, recommended device webgpu/wasm/cpu with a stable tier→color mapping), a description, and reason chips. supports an optional ontogglecompare selection affordance. data source usemodelrecommendations.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
