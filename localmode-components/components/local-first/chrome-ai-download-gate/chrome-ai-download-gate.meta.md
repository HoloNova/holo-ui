# Chrome AI Download Gate

### Description
The gate a user sees when a Chrome Built-in AI capability exists but its on-device model has not been fetched yet. Chrome refuses to start the model download outside a user activation, so the button is the only way to trigger it. Renders the download prompt, in-flight progress, the failed-attempt message, and the terminal unsupported / cannot-run-here states; returns null once the model is available. Includes ChromeAIReadyBadge. Presentational — bind availability/progress to a provider-fallback hook and pass its download action as onDownload.

### Tokens
- scale: `standard`
- placement: `overlay`
- interaction: `confirmation`
- lifecycle: `on-demand`
- motion: `none`
- category: `gate`
- runtime: `react`

### When to use
Use `chrome-ai-download-gate` when the gate a user sees when a chrome built-in ai capability exists but its on-device model has not been fetched yet. chrome refuses to start the model download outside a user activation, so the button is the only way to trigger it. renders the download prompt, in-flight progress, the failed-attempt message, and the terminal unsupported / cannot-run-here states; returns null once the model is available. includes chromeaireadybadge. presentational — bind availability/progress to a provider-fallback hook and pass its download action as ondownload.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
