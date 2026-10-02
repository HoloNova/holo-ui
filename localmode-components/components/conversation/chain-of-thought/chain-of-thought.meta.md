# Chain of Thought

### Description
A structured step-by-step reasoning timeline (distinct from free-text Reasoning): labeled steps with per-step status and icons, and nested slots for embedded retrieved sources and images, collapsing to one line on completion. Data source: useGenerateText reasoning-mode + local RAG.

### Tokens
- scale: `standard`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `content`
- runtime: `react`

### When to use
Use `chain-of-thought` when a structured step-by-step reasoning timeline (distinct from free-text reasoning): labeled steps with per-step status and icons, and nested slots for embedded retrieved sources and images, collapsing to one line on completion. data source: usegeneratetext reasoning-mode + local rag.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
