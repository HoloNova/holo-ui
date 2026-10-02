# Copy Button

### Description
A copy-to-clipboard button that shows a 2-second Copied confirmation, disables itself when there is nothing to copy, and treats an unavailable clipboard (insecure context or denied permission) as a silent no-op. Fully controlled via value; presentational. Pairs with any generated-text or result surface.

### Tokens
- scale: `micro`
- placement: `embedded`
- interaction: `control`
- lifecycle: `persistent`
- motion: `none`
- category: `action`
- runtime: `react`

### When to use
Use `lm-copy-button` when a copy-to-clipboard button that shows a 2-second copied confirmation, disables itself when there is nothing to copy, and treats an unavailable clipboard (insecure context or denied permission) as a silent no-op. fully controlled via value; presentational. pairs with any generated-text or result surface.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
