# Error Alert

### Description
A compact, dismissible error surface with an optional retry action - a role=alert region showing the message, a Retry button (only when onRetry is provided), and a dismiss control. Presentational: the consumer owns the operation state and decides what retry and dismiss do. The deduped shared alert for operation feedback near a result. Pairs with any hook that surfaces an error string.

### Tokens
- scale: `standard`
- placement: `embedded`
- interaction: `output`
- lifecycle: `transient`
- motion: `none`
- category: `content`
- runtime: `react`

### When to use
Use `error-alert` when a compact, dismissible error surface with an optional retry action - a role=alert region showing the message, a retry button (only when onretry is provided), and a dismiss control. presentational: the consumer owns the operation state and decides what retry and dismiss do. the deduped shared alert for operation feedback near a result. pairs with any hook that surfaces an error string.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
