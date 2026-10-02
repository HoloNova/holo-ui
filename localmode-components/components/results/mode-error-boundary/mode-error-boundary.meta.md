# Mode Error Boundary

### Description
A React error boundary that isolates a render failure in its subtree: it catches the error, renders a compact recoverable role=alert notice with the message and a Reset button that clears the error and re-renders the children, so one failing surface cannot blank the whole page. A structural copy-owned utility with local prop shapes.

### Tokens
- scale: `standard`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `content`
- runtime: `react`

### When to use
Use `mode-error-boundary` when a react error boundary that isolates a render failure in its subtree: it catches the error, renders a compact recoverable role=alert notice with the message and a reset button that clears the error and re-renders the children, so one failing surface cannot blank the whole page. a structural copy-owned utility with local prop shapes.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
