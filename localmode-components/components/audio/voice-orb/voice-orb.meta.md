# Voice Orb

### Description
An animated Canvas 2D voice-agent orb/visualizer that reflects discrete agent states (idle/connecting/listening/thinking/speaking/muted) and pulses with input/output audio volume via getInputVolume()/getOutputVolume() callbacks, with color/glow variants. Visual state is fully decoupled from the audio source — feed volume from a local AnalyserNode. Driven by useLiveTranscribe / useTurnTaker.

### Tokens
- scale: `standard`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `css-loop`
- category: `avatar`
- runtime: `react`

### When to use
Use `voice-orb` when an animated canvas 2d voice-agent orb/visualizer that reflects discrete agent states (idle/connecting/listening/thinking/speaking/muted) and pulses with input/output audio volume via getinputvolume()/getoutputvolume() callbacks, with color/glow variants. visual state is fully decoupled from the audio source — feed volume from a local analysernode. driven by uselivetranscribe / useturntaker.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
