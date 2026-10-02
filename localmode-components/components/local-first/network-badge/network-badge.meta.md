# Network Badge

### Description
A reactive online/offline indicator (NetworkBadge) sourced from useNetworkStatus, plus an OfflineReady badge that signals the app's required model is cached on-device and can run with no network. Because local models keep working offline, offline is informational, not an error.

### Tokens
- scale: `micro`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `status`
- runtime: `react`

### When to use
Use `network-badge` when a reactive online/offline indicator (networkbadge) sourced from usenetworkstatus, plus an offlineready badge that signals the app's required model is cached on-device and can run with no network. because local models keep working offline, offline is informational, not an error.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
