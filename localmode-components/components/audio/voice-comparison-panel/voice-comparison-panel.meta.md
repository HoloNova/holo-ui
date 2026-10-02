# Voice Comparison Panel

### Description
A/B voice comparison — two labeled columns, each with a language-grouped voice select (VoicePicker) and a native <audio> player shown once audio is set, a shared comparison textarea, and a Compare button with a loading state. Wire onCompare to two useSynthesizeSpeech runs and pass the resulting Blobs back per column.

### Tokens
- scale: `region`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `content`
- runtime: `react`

### When to use
Use `voice-comparison-panel` when a/b voice comparison — two labeled columns, each with a language-grouped voice select (voicepicker) and a native <audio> player shown once audio is set, a shared comparison textarea, and a compare button with a loading state. wire oncompare to two usesynthesizespeech runs and pass the resulting blobs back per column.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
