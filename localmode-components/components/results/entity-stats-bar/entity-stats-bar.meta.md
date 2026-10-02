# Entity Stats Bar

### Description
A horizontal stats bar showing the total detected-entity count plus per-type breakdown badges (PER / LOC / ORG / MISC — colored dot + count + label), computing counts internally from a DetectedEntity[] (or a pre-computed counts map) against a color/label registry. Pairs with useExtractEntities. Self-contained; exports countByType().

### Tokens
- scale: `compact`
- placement: `dock`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `data`
- runtime: `react`

### When to use
Use `entity-stats-bar` when a horizontal stats bar showing the total detected-entity count plus per-type breakdown badges (per / loc / org / misc — colored dot + count + label), computing counts internally from a detectedentity[] (or a pre-computed counts map) against a color/label registry. pairs with useextractentities. self-contained; exports countbytype().

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
