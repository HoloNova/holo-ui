# Chunk Boundary Visualizer

### Description
Visualizes a document split into distinct chunks: alternating accent-background segments each with a monospace C1/C2 badge; in semantic mode, inter-chunk boundary similarity scores (e.g. sim: 0.74) render as faint labels between segments. Takes a decoupled ChunkInfo[] (text, chunkIndex, rightSimilarity) + the active mode, pairing with useSemanticChunk. Display-only — owns no chunking logic.

### Tokens
- scale: `region`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `diagram`
- runtime: `react`

### When to use
Use `chunk-boundary-visualizer` when visualizes a document split into distinct chunks: alternating accent-background segments each with a monospace c1/c2 badge; in semantic mode, inter-chunk boundary similarity scores (e.g. sim: 0.74) render as faint labels between segments. takes a decoupled chunkinfo[] (text, chunkindex, rightsimilarity) + the active mode, pairing with usesemanticchunk. display-only — owns no chunking logic.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
