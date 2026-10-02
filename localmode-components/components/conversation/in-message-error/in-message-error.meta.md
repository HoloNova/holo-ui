# In-Message Error

### Description
An accessible per-message error/retry block rendered inline on a failed assistant message (not a global toast), with auto-extracted error text, a classified hint (OOM / WebGPU lost / model load), and a retry action. Data source: useChat error state.

### Tokens
- scale: `standard`
- placement: `flow`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `content`
- runtime: `react`

### When to use
Use `in-message-error` when an accessible per-message error/retry block rendered inline on a failed assistant message (not a global toast), with auto-extracted error text, a classified hint (oom / webgpu lost / model load), and a retry action. data source: usechat error state.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
