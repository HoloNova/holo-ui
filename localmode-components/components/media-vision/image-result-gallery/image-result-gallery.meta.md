# Image Result Gallery

### Description
A responsive grid / list of image result cards sharing one data contract — in-flight overlay, hover metadata, confidence score, multi-select, delete, and staggered fade-in. Composes ConfidenceScoreBadge (Results family) via a registry dependency, with a minimal score-badge fallback inlined so it builds independently. Pairs with useClassifyImageZeroShot / useEmbedImage / useCaptionImage.

### Tokens
- scale: `region`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `data`
- runtime: `react`

### When to use
Use `image-result-gallery` when a responsive grid / list of image result cards sharing one data contract — in-flight overlay, hover metadata, confidence score, multi-select, delete, and staggered fade-in. composes confidencescorebadge (results family) via a registry dependency, with a minimal score-badge fallback inlined so it builds independently. pairs with useclassifyimagezeroshot / useembedimage / usecaptionimage.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
