# Cache Badge

### Description
Annotates a result as served from the semantic cache, optionally with the hit latency (e.g. "cached · 12ms"). Drive cached/latencyMs from a useSemanticCache lookup result. Renders nothing when cached is false, so it is safe to drop next to any result. Self-contained and presentational.

### Tokens
- scale: `micro`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `status`
- runtime: `react`

### When to use
Use `cache-badge` when annotates a result as served from the semantic cache, optionally with the hit latency (e.g. "cached · 12ms"). drive cached/latencyms from a usesemanticcache lookup result. renders nothing when cached is false, so it is safe to drop next to any result. self-contained and presentational.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
