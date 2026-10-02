# Voice Button

### Description
A press-to-record / release-to-transcribe push-to-talk button with an explicit visual state machine: idle -> recording (pulse rings + live waveform) -> processing (loader) -> success/error. Recording uses getUserMedia/MediaRecorder (useVoiceRecorder); transcription routes to local Whisper (useTranscribe). Controlled — the app advances the state.

### Tokens
- scale: `micro`
- placement: `embedded`
- interaction: `control`
- lifecycle: `persistent`
- motion: `none`
- category: `action`
- runtime: `react`

### When to use
Use `voice-button` when a press-to-record / release-to-transcribe push-to-talk button with an explicit visual state machine: idle -> recording (pulse rings + live waveform) -> processing (loader) -> success/error. recording uses getusermedia/mediarecorder (usevoicerecorder); transcription routes to local whisper (usetranscribe). controlled — the app advances the state.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
