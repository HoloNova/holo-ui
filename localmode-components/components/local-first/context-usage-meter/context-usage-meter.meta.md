# Context Usage Meter

### Description
A token / context-window budget meter (with composable Context/ContextTrigger/ContextContent/ContextInputUsage/ContextOutputUsage parts) breaking down input/output/reasoning/cache token usage against the model's context-window limit (a hard local GGUF/LiteRT KV-cache constraint), warning near the limit. Fed by usage.tokens from a generate result. Local-only — there is NO cost field. Complements StorageMeter (disk) with a token-budget gauge.

### Tokens
- scale: `compact`
- placement: `embedded`
- interaction: `output`
- lifecycle: `state-driven`
- motion: `none`
- category: `status`
- runtime: `react`

### When to use
Use `context-usage-meter` when a token / context-window budget meter (with composable context/contexttrigger/contextcontent/contextinputusage/contextoutputusage parts) breaking down input/output/reasoning/cache token usage against the model's context-window limit (a hard local gguf/litert kv-cache constraint), warning near the limit. fed by usage.tokens from a generate result. local-only — there is no cost field. complements storagemeter (disk) with a token-budget gauge.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
