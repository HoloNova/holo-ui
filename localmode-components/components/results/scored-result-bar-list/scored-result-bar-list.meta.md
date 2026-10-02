# Scored Result Bar List

### Description
A ranked vertical list of {label, score} pairs — each row shows the label, a confidence percentage (via ConfidenceScoreBadge), and an animated horizontal fill bar proportional to the 0–1 score, with the top row highlighted. Ships skeleton-loading and empty-state slots. One data contract serves useClassify / useClassifyZeroShot / useDetectObjects / useFillMask / useSemanticSearch.

### Tokens
- scale: `compact`
- placement: `dock`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `data`
- runtime: `react`

### When to use
Use `scored-result-bar-list` when a ranked vertical list of {label, score} pairs — each row shows the label, a confidence percentage (via confidencescorebadge), and an animated horizontal fill bar proportional to the 0–1 score, with the top row highlighted. ships skeleton-loading and empty-state slots. one data contract serves useclassify / useclassifyzeroshot / usedetectobjects / usefillmask / usesemanticsearch.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
