# Video Canvas

### Description
A mirrored 16:9 webcam surface — a video element with a pixel-aligned transparent canvas overlay for landmark / skeleton drawing, an FPS badge, and a child slot. A shell for the MediaPipe streaming trackers (useDetectHands / useDetectPose / useDetectFace / useRecognizeGesture); the app supplies the stream and draw callback.

### Tokens
- scale: `viewport`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `transition`
- category: `content`
- runtime: `react`

### When to use
Use `video-canvas` when a mirrored 16:9 webcam surface — a video element with a pixel-aligned transparent canvas overlay for landmark / skeleton drawing, an fps badge, and a child slot. a shell for the mediapipe streaming trackers (usedetecthands / usedetectpose / usedetectface / userecognizegesture); the app supplies the stream and draw callback.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
