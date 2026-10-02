# Passphrase Gate

### Description
A controlled passphrase screen with create and unlock modes: create renders passphrase + confirmation with a minimum-length gate and composes the password-strength-bar from caller-computed strength props; unlock renders a single field with an error surface (e.g. wrong passphrase) and busy state. Submits the passphrase via onSubmit; performs no crypto and retains no passphrase. Pairs with useEncryptedVault.

### Tokens
- scale: `standard`
- placement: `overlay`
- interaction: `confirmation`
- lifecycle: `on-demand`
- motion: `none`
- category: `gate`
- runtime: `react`

### When to use
Use `passphrase-gate` when a controlled passphrase screen with create and unlock modes: create renders passphrase + confirmation with a minimum-length gate and composes the password-strength-bar from caller-computed strength props; unlock renders a single field with an error surface (e.g. wrong passphrase) and busy state. submits the passphrase via onsubmit; performs no crypto and retains no passphrase. pairs with useencryptedvault.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
