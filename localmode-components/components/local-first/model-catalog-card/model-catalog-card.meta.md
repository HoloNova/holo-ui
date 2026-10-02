# Model Catalog Card

### Description
A rich tile for a single model catalog entry (wllama/webllm/transformers/litert/mediapipe shapes): name, a size badge, description, a metadata chip row (architecture, params, quantization, context), and a conditional capability sub-row (tools/vision/embedding/reranking/reasoning). Fires onClick(id) for selection with a selected ring. Complements (does not replace) ModelSelector; data source useModelRecommendations / model registry.

### Tokens
- scale: `standard`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `content`
- runtime: `react`

### When to use
Use `model-catalog-card` when a rich tile for a single model catalog entry (wllama/webllm/transformers/litert/mediapipe shapes): name, a size badge, description, a metadata chip row (architecture, params, quantization, context), and a conditional capability sub-row (tools/vision/embedding/reranking/reasoning). fires onclick(id) for selection with a selected ring. complements (does not replace) modelselector; data source usemodelrecommendations / model registry.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
