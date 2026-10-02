# Audio Scrub Player

### Description
A composable scrubbable audio player for local Blob/object-URL audio (Kokoro TTS output or recordings) — play/pause, a draggable seek bar, and a time/duration readout, managing its own <audio> element and object-URL lifecycle. Ships a standalone, controlled ScrubBar seek sub-primitive (pointer + keyboard). Pairs with useSynthesizeSpeech output.

### Tokens
- scale: `standard`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `content`
- runtime: `react`

### When to use
Use `audio-scrub-player` when a composable scrubbable audio player for local blob/object-url audio (kokoro tts output or recordings) — play/pause, a draggable seek bar, and a time/duration readout, managing its own <audio> element and object-url lifecycle. ships a standalone, controlled scrubbar seek sub-primitive (pointer + keyboard). pairs with usesynthesizespeech output.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
