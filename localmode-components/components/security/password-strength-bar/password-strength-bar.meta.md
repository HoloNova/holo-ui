# Password Strength Bar

### Description
A presentational password/passphrase strength meter — a themed bar + label driven by a caller-computed 0–100 strength score. The app computes strength (pairs with @localmode/core deriveKey/crypto); the component only renders. No turnkey hook.

### Tokens
- scale: `compact`
- placement: `dock`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `content`
- runtime: `react`

### When to use
Use `password-strength-bar` when a presentational password/passphrase strength meter — a themed bar + label driven by a caller-computed 0–100 strength score. the app computes strength (pairs with @localmode/core derivekey/crypto); the component only renders. no turnkey hook.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
