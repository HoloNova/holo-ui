# Slash Command Palette

### Description
A '/'-triggered command palette over a local tool/command list — name, category, description, and icon — to layer onto a PromptInput Tools slot. Purely presentational; the consumer opens it (e.g. when the composer starts with '/') and supplies the query. Built on the shadcn/ui Command (cmdk) primitive.

### Tokens
- scale: `standard`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `content`
- runtime: `react`

### When to use
Use `slash-command-palette` when a '/'-triggered command palette over a local tool/command list — name, category, description, and icon — to layer onto a promptinput tools slot. purely presentational; the consumer opens it (e.g. when the composer starts with '/') and supplies the query. built on the shadcn/ui command (cmdk) primitive.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
