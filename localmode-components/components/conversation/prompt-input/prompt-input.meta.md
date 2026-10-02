# Prompt Input

### Description
Form-based, auto-resizing chat composer: Enter submits, Shift+Enter inserts a newline, the submit control swaps to a stop control while streaming, with optional controlled value/onValueChange, a PromptInputProvider, a voice/dictation mic toggle (wire to local Whisper), and a slash-command / + picker.

### Tokens
- scale: `compact`
- placement: `embedded`
- interaction: `input`
- lifecycle: `persistent`
- motion: `none`
- category: `composer`
- runtime: `react`

### When to use
Use `prompt-input` when form-based, auto-resizing chat composer: enter submits, shift+enter inserts a newline, the submit control swaps to a stop control while streaming, with optional controlled value/onvaluechange, a promptinputprovider, a voice/dictation mic toggle (wire to local whisper), and a slash-command / + picker.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
