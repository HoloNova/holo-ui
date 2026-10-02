# Streaming Speech Panel

### Description
A streaming-TTS status surface: active state (WaveformActivityBars + spinner, synthesizing/playing label, processed-clause count, highlighted now-playing clause box) and finished state (clause-count summary, a generated-locally privacy note, and a Download WAV action). Driven by useStreamSpeech (isSynthesizing/isPlaying/currentClause/clauses); download via downloadBlob.

### Tokens
- scale: `region`
- placement: `embedded`
- interaction: `output`
- lifecycle: `state-driven`
- motion: `css-loop`
- category: `content`
- runtime: `react`

### When to use
Use `streaming-speech-panel` when a streaming-tts status surface: active state (waveformactivitybars + spinner, synthesizing/playing label, processed-clause count, highlighted now-playing clause box) and finished state (clause-count summary, a generated-locally privacy note, and a download wav action). driven by usestreamspeech (issynthesizing/isplaying/currentclause/clauses); download via downloadblob.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
