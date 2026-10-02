# Vault Item Card

### Description
A lock-state-aware card for an encrypted note or text document: locked renders a masked body with disabled actions (no plaintext in the DOM); unlocked renders title/timestamp with reveal/hide toggling of caller-supplied decrypted content and a delete action, all via callbacks. Never receives ciphertext or key material. Pairs with useEncryptedVault.

### Tokens
- scale: `standard`
- placement: `flow`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `content`
- runtime: `react`

### When to use
Use `vault-item-card` when a lock-state-aware card for an encrypted note or text document: locked renders a masked body with disabled actions (no plaintext in the dom); unlocked renders title/timestamp with reveal/hide toggling of caller-supplied decrypted content and a delete action, all via callbacks. never receives ciphertext or key material. pairs with useencryptedvault.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
