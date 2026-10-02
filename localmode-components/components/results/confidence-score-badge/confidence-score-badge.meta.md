# Confidence Score Badge

### Description
Maps a 0–1 score to a semantic color tier (configurable thresholds; default high ≥ 0.8 success, medium ≥ 0.5 warning, low muted) and renders the formatted percentage as a flat pill badge or a radial dial (conic-gradient ring wired to CSS variables, not daisyUI). The shared scored-output atom replacing 12 copied score-color helpers; consumed cross-family by media-vision's ImageResultGallery. Pairs with useClassify / useClassifyZeroShot / useSemanticSearch / useAnswerQuestion. Self-contained and presentational; exports resolveTier().

### Tokens
- scale: `micro`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `status`
- runtime: `react`

### When to use
Use `confidence-score-badge` when maps a 0–1 score to a semantic color tier (configurable thresholds; default high ≥ 0.8 success, medium ≥ 0.5 warning, low muted) and renders the formatted percentage as a flat pill badge or a radial dial (conic-gradient ring wired to css variables, not daisyui). the shared scored-output atom replacing 12 copied score-color helpers; consumed cross-family by media-vision's imageresultgallery. pairs with useclassify / useclassifyzeroshot / usesemanticsearch / useanswerquestion. self-contained and presentational; exports resolvetier().

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
