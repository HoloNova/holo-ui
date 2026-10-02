# Evaluation Metrics Dashboard

### Description
A composite evaluation dashboard: a KPI/stat-tile row (value + delta), a grid of metric cards (accuracy / precision / recall / F1), a color-coded N×N confusion matrix (diagonal success-tinted, off-diagonal error-tinted, intensity scaled to max cell, with legend), a radar/spider sub-view, and a threshold-calibration panel. Driven by useEvaluateModel + useCalibrateThreshold. All charts are minimal in-component SVG — no external chart library. Each section is optional.

### Tokens
- scale: `standard`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `content`
- runtime: `react`

### When to use
Use `evaluation-metrics-dashboard` when a composite evaluation dashboard: a kpi/stat-tile row (value + delta), a grid of metric cards (accuracy / precision / recall / f1), a color-coded n×n confusion matrix (diagonal success-tinted, off-diagonal error-tinted, intensity scaled to max cell, with legend), a radar/spider sub-view, and a threshold-calibration panel. driven by useevaluatemodel + usecalibratethreshold. all charts are minimal in-component svg — no external chart library. each section is optional.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
