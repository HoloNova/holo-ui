# Waveform Activity Bars

### Description
A pure-CSS row of pulsing vertical bars (sinusoid-derived heights, staggered animation) that doubles as an active audio-processing indicator and an idle empty-state. Supports agent-state modes (connecting/listening/thinking/speaking), record/playback-scrub modes, and a live-volume mode that scales amplitude from a callback — decoupling the visual from the audio source. Ships its keyframe inline so it animates standalone after install.

### Tokens
- scale: `compact`
- placement: `dock`
- interaction: `output`
- lifecycle: `state-driven`
- motion: `css-loop`
- category: `content`
- runtime: `react`

### When to use
Use `waveform-activity-bars` when a pure-css row of pulsing vertical bars (sinusoid-derived heights, staggered animation) that doubles as an active audio-processing indicator and an idle empty-state. supports agent-state modes (connecting/listening/thinking/speaking), record/playback-scrub modes, and a live-volume mode that scales amplitude from a callback — decoupling the visual from the audio source. ships its keyframe inline so it animates standalone after install.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
