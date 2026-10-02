# Mask Token Input

### Description
A fill-mask / cloze textarea that detects a configurable mask token (default [MASK]), shows an inline highlighted preview of the mask span, a 'detected' vs 'Add [MASK]' validation hint, a randomize/sample button, and a Cmd+Enter submit badge. Presentational — feeds useFillMask.

### Tokens
- scale: `compact`
- placement: `embedded`
- interaction: `input`
- lifecycle: `persistent`
- motion: `none`
- category: `composer`
- runtime: `react`

### When to use
Use `mask-token-input` when a fill-mask / cloze textarea that detects a configurable mask token (default [mask]), shows an inline highlighted preview of the mask span, a 'detected' vs 'add [mask]' validation hint, a randomize/sample button, and a cmd+enter submit badge. presentational — feeds usefillmask.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
