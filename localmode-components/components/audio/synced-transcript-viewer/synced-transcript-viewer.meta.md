# Synced Transcript Viewer

### Description
A karaoke-style transcript viewer that highlights words in lockstep with audio playback using word-level alignment timestamps — the playback-time -> word-index sync is pure client-side (binary search on timeupdate). Clicking a word seeks the audio to its start. Driven by useTranscribe word-level timestamps over a local audio Blob.

### Tokens
- scale: `region`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `transition`
- category: `content`
- runtime: `react`

### When to use
Use `synced-transcript-viewer` when a karaoke-style transcript viewer that highlights words in lockstep with audio playback using word-level alignment timestamps — the playback-time -> word-index sync is pure client-side (binary search on timeupdate). clicking a word seeks the audio to its start. driven by usetranscribe word-level timestamps over a local audio blob.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
