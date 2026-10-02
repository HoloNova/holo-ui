# Mic Selector

### Description
A microphone input-device picker with permission handling and live device enumeration — fully offline, using only browser device APIs (getUserMedia for the permission prompt, enumerateDevices for the list, a devicechange listener to stay current). Emits the chosen deviceId for a getUserMedia constraint; pairs with VoiceButton / VoiceOrb / useLiveTranscribe.

### Tokens
- scale: `compact`
- placement: `embedded`
- interaction: `control`
- lifecycle: `persistent`
- motion: `none`
- category: `setting`
- runtime: `react`

### When to use
Use `mic-selector` when a microphone input-device picker with permission handling and live device enumeration — fully offline, using only browser device apis (getusermedia for the permission prompt, enumeratedevices for the list, a devicechange listener to stay current). emits the chosen deviceid for a getusermedia constraint; pairs with voicebutton / voiceorb / uselivetranscribe.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
