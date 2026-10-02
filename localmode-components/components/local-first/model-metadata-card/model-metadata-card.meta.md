# Model Metadata Card

### Description
A structured key-value grid of parsed model metadata (GGUFMetadataCard, with a ModelMetadataCard alias) — architecture, parameter count, quantization, context length, embedding dimension, vocab size, head/layer counts, file size, optional author/license — driven by a field-descriptor array that skips absent fields. The GGUF shape originates from @localmode/wllama; the display is a generic metadata grid. Data source useModelStatus / model-loading metadata.

### Tokens
- scale: `standard`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `content`
- runtime: `react`

### When to use
Use `model-metadata-card` when a structured key-value grid of parsed model metadata (ggufmetadatacard, with a modelmetadatacard alias) — architecture, parameter count, quantization, context length, embedding dimension, vocab size, head/layer counts, file size, optional author/license — driven by a field-descriptor array that skips absent fields. the gguf shape originates from @localmode/wllama; the display is a generic metadata grid. data source usemodelstatus / model-loading metadata.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
