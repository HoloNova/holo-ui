# Indexed Document Card

### Description
A card for a single locally-indexed document: truncated filename (native tooltip), chunk count, optional page count and file size, and a hover/focus-revealed delete with loading state. Presentational — page/chunk counts come from the app's ingest state (e.g. useSemanticChunk output length), not a single hook.

### Tokens
- scale: `standard`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `content`
- runtime: `react`

### When to use
Use `indexed-document-card` when a card for a single locally-indexed document: truncated filename (native tooltip), chunk count, optional page count and file size, and a hover/focus-revealed delete with loading state. presentational — page/chunk counts come from the app's ingest state (e.g. usesemanticchunk output length), not a single hook.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
