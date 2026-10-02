# Device Capability Grid

### Description
The expanded sibling of DeviceBadge: a full device-capability diagnostic card reading useCapabilities — a stats bar (cores/memory/GPU), a status row per feature flag (WebGPU/WASM/SIMD/Threads/IndexedDB/Web Workers), a storage row, and a browser/OS footer, with a spinner while detection runs. Does not replace DeviceBadge.

### Tokens
- scale: `region`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `content`
- runtime: `react`

### When to use
Use `device-capability-grid` when the expanded sibling of devicebadge: a full device-capability diagnostic card reading usecapabilities — a stats bar (cores/memory/gpu), a status row per feature flag (webgpu/wasm/simd/threads/indexeddb/web workers), a storage row, and a browser/os footer, with a spinner while detection runs. does not replace devicebadge.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
