# Artifact

### Description
A Claude-style docked side-panel/canvas shell (header, title, description, copy/download/refresh/close toolbar, scrollable content) that renders generated code, docs, SVG, or HTML beside the chat. Presentational — driven by a local model via useGenerateText/useGenerateObject. No server, no sandbox.

### Tokens
- scale: `standard`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `content`
- runtime: `react`

### When to use
Use `artifact` when a claude-style docked side-panel/canvas shell (header, title, description, copy/download/refresh/close toolbar, scrollable content) that renders generated code, docs, svg, or html beside the chat. presentational — driven by a local model via usegeneratetext/usegenerateobject. no server, no sandbox.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
