# Actions

### Description
Message-level controls — copy (with copied state), regenerate, read-aloud (wire to local Kokoro TTS), an overflow more-menu, and an on-device FeedbackBar (thumbs up/down, no telemetry).

### Tokens
- scale: `standard`
- placement: `embedded`
- interaction: `control`
- lifecycle: `persistent`
- motion: `none`
- category: `action`
- runtime: `react`

### When to use
Use `actions` when message-level controls — copy (with copied state), regenerate, read-aloud (wire to local kokoro tts), an overflow more-menu, and an on-device feedbackbar (thumbs up/down, no telemetry).

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
