# Redacted Text Display

### Description
An inline-annotated text renderer interleaving plain text with color-coded redaction tokens (e.g. [PER], [LOC]) styled per entity type with native tooltips, including a scanning loading skeleton and an empty placeholder. Takes source text + detected entity spans (start/end) from useExtractEntities; segments internally (overlaps resolved by earliest). Exports segmentText().

### Tokens
- scale: `standard`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `content`
- runtime: `react`

### When to use
Use `redacted-text-display` when an inline-annotated text renderer interleaving plain text with color-coded redaction tokens (e.g. [per], [loc]) styled per entity type with native tooltips, including a scanning loading skeleton and an empty placeholder. takes source text + detected entity spans (start/end) from useextractentities; segments internally (overlaps resolved by earliest). exports segmenttext().

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
