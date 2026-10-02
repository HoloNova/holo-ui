# Storage Meter

### Description
Shows origin/IndexedDB storage usage against quota as a meter, with a warning state past a configurable threshold and a graceful unavailable state (estimates are approximate and blocked in Safari private mode). Bind to useStorageQuota (default) or pass an explicit quota. Complements ContextUsageMeter (the token-budget gauge).

### Tokens
- scale: `compact`
- placement: `embedded`
- interaction: `output`
- lifecycle: `state-driven`
- motion: `none`
- category: `status`
- runtime: `react`

### When to use
Use `storage-meter` when shows origin/indexeddb storage usage against quota as a meter, with a warning state past a configurable threshold and a graceful unavailable state (estimates are approximate and blocked in safari private mode). bind to usestoragequota (default) or pass an explicit quota. complements contextusagemeter (the token-budget gauge).

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
