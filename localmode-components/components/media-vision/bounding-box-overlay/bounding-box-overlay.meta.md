# Bounding Box Overlay

### Description
Color-coded detection boxes (with a companion DetectionLabelLegend) positioned over an image as percentage offsets from its natural dimensions, so placement is display-size independent. Serves object / face / hand / pose output.

### Tokens
- scale: `standard`
- placement: `overlay`
- interaction: `output`
- lifecycle: `transient`
- motion: `transition`
- category: `content`
- runtime: `react`

### When to use
Use `bounding-box-overlay` when color-coded detection boxes (with a companion detectionlabellegend) positioned over an image as percentage offsets from its natural dimensions, so placement is display-size independent. serves object / face / hand / pose output.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
