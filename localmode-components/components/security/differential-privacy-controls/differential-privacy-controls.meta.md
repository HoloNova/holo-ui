# Differential Privacy Controls

### Description
A collapsible DP settings panel (enable toggle, epsilon slider with derived High/Balanced/Low label, privacy-budget bar that warns/errors as budget is consumed) plus a compact "DP Applied" provenance badge (epsilon used, embedding dimensionality). Driven by the app's dpEmbeddingMiddleware/dpClassificationMiddleware + DP-budget state; the component only renders. No turnkey hook.

### Tokens
- scale: `standard`
- placement: `embedded`
- interaction: `control`
- lifecycle: `persistent`
- motion: `none`
- category: `code`
- runtime: `react`

### When to use
Use `differential-privacy-controls` when a collapsible dp settings panel (enable toggle, epsilon slider with derived high/balanced/low label, privacy-budget bar that warns/errors as budget is consumed) plus a compact "dp applied" provenance badge (epsilon used, embedding dimensionality). driven by the app's dpembeddingmiddleware/dpclassificationmiddleware + dp-budget state; the component only renders. no turnkey hook.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
