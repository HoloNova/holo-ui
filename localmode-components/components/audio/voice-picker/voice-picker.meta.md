# Voice Picker

### Description
Language-grouped TTS voice selection from one KokoroVoice[] contract — a compact grouped <select> (VoicePicker) plus rich VoiceCard / VoiceGrid variants with a color-coded gender badge, monospace voice id, a circular play/stop preview button with loading state, a per-group count header, and search/filter. Wire onPreview to useSynthesizeSpeech for local Kokoro samples.

### Tokens
- scale: `compact`
- placement: `embedded`
- interaction: `control`
- lifecycle: `on-demand`
- motion: `none`
- category: `setting`
- runtime: `react`

### When to use
Use `voice-picker` when language-grouped tts voice selection from one kokorovoice[] contract — a compact grouped <select> (voicepicker) plus rich voicecard / voicegrid variants with a color-coded gender badge, monospace voice id, a circular play/stop preview button with loading state, a per-group count header, and search/filter. wire onpreview to usesynthesizespeech for local kokoro samples.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
