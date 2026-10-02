# Image Processing Overlay

### Description
A full-bleed overlay over a dimmed source image while vision inference runs — spinner ring + icon + status + optional cancel, plus an animated scan variant (keyframes shipped inline). Renders nothing when idle. Driven by any vision hook's isLoading.

### Tokens
- scale: `standard`
- placement: `overlay`
- interaction: `output`
- lifecycle: `transient`
- motion: `transition`
- category: `content`
- runtime: `react`

### When to use
Use `image-processing-overlay` when a full-bleed overlay over a dimmed source image while vision inference runs — spinner ring + icon + status + optional cancel, plus an animated scan variant (keyframes shipped inline). renders nothing when idle. driven by any vision hook's isloading.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
