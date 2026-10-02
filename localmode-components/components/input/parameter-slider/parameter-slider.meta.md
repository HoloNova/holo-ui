# Parameter Slider

### Description
An inline range slider with a live value readout for reversible adjustment of a local generation parameter — temperature, top-k, top-p, maxTokens, nGpuLayers, KV-cache quant. Fully controlled; the emitted value feeds straight into useGenerateText/useChat options. Built on the shadcn/ui Slider primitive.

### Tokens
- scale: `compact`
- placement: `embedded`
- interaction: `control`
- lifecycle: `state-driven`
- motion: `none`
- category: `status`
- runtime: `react`

### When to use
Use `parameter-slider` when an inline range slider with a live value readout for reversible adjustment of a local generation parameter — temperature, top-k, top-p, maxtokens, ngpulayers, kv-cache quant. fully controlled; the emitted value feeds straight into usegeneratetext/usechat options. built on the shadcn/ui slider primitive.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
