# Adaptive Batch Card

### Description
Surfaces useAdaptiveBatchSize output: a prominent computed optimal batch number, a hardware summary (cores/RAM/GPU), the detection source (detected/estimated/override), and a collapsible reasoning string. Ships a compact AdaptiveBatchBadge variant (e.g. "Batch: 32") with a click-to-expand device-profile popover. Data source useAdaptiveBatchSize.

### Tokens
- scale: `standard`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `content`
- runtime: `react`

### When to use
Use `adaptive-batch-card` when surfaces useadaptivebatchsize output: a prominent computed optimal batch number, a hardware summary (cores/ram/gpu), the detection source (detected/estimated/override), and a collapsible reasoning string. ships a compact adaptivebatchbadge variant (e.g. "batch: 32") with a click-to-expand device-profile popover. data source useadaptivebatchsize.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
