# Response

### Description
Streaming markdown renderer for assistant output: shows a cursor while streaming, tolerates partial/unterminated markdown without layout breakage, supports an optional typewriter reveal, and routes LaTeX/Mermaid blocks to swappable renderers gated behind props (declare katex/mermaid if used).

### Tokens
- scale: `standard`
- placement: `flow`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `ai-response`
- runtime: `react`

### When to use
Use `response` when streaming markdown renderer for assistant output: shows a cursor while streaming, tolerates partial/unterminated markdown without layout breakage, supports an optional typewriter reveal, and routes latex/mermaid blocks to swappable renderers gated behind props (declare katex/mermaid if used).

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
