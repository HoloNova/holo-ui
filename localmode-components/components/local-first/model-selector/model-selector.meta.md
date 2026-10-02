# Model Selector

### Description
A device-aware model picker: a list grouped by category, backend filter chips (WebGPU/ONNX/WASM/LiteRT) with live counts, per-model vision/tool-calling/cached badges, a download affordance for uncached models, and a delete-from-cache affordance for cached ones. Device-unfit models (e.g. a WebGPU-only model on a non-WebGPU device) are de-emphasized and labeled. Emits onSelect(modelId) and owns no selection state. Bind models to useModelRecommendations and hasWebGPU to useCapabilities.

### Tokens
- scale: `compact`
- placement: `embedded`
- interaction: `control`
- lifecycle: `persistent`
- motion: `none`
- category: `setting`
- runtime: `react`

### When to use
Use `model-selector` when a device-aware model picker: a list grouped by category, backend filter chips (webgpu/onnx/wasm/litert) with live counts, per-model vision/tool-calling/cached badges, a download affordance for uncached models, and a delete-from-cache affordance for cached ones. device-unfit models (e.g. a webgpu-only model on a non-webgpu device) are de-emphasized and labeled. emits onselect(modelid) and owns no selection state. bind models to usemodelrecommendations and haswebgpu to usecapabilities.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
