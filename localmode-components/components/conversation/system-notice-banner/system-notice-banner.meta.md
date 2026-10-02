# System Notice Banner

### Description
An in-conversation info/warning banner (not a message bubble) for local-first state changes: offline/online, model switch, capability-unavailable, WebGPU->WASM fallback, cache eviction, or download-required. Data source: useNetworkStatus / useCapabilities.

### Tokens
- scale: `standard`
- placement: `embedded`
- interaction: `output`
- lifecycle: `transient`
- motion: `none`
- category: `content`
- runtime: `react`

### When to use
Use `system-notice-banner` when an in-conversation info/warning banner (not a message bubble) for local-first state changes: offline/online, model switch, capability-unavailable, webgpu->wasm fallback, cache eviction, or download-required. data source: usenetworkstatus / usecapabilities.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
