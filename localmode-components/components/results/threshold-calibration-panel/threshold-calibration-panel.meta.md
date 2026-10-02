# Threshold Calibration Panel

### Description
A presentational panel for similarity-threshold calibration results: the empirically calibrated threshold shown side-by-side with the model's preset default (or an explicit no-preset state), calibration metadata (percentile, sample size, model ID, distance function), the pairwise similarity-distribution statistics (mean / median / std-dev / min / max / pair count), and a reference list of known-good preset thresholds with the active model highlighted. Loading and empty states carry optional calibrate / cancel affordances. Designed from the ThresholdCalibration result shape; the full-fidelity standalone complement to evaluation-metrics-dashboard's embedded calibration sub-view. Driven by useCalibrateThreshold (pair presetThreshold with getDefaultThreshold and presets with MODEL_THRESHOLD_PRESETS). All in-component SVG-free token styling — no chart library.

### Tokens
- scale: `region`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `content`
- runtime: `react`

### When to use
Use `threshold-calibration-panel` when a presentational panel for similarity-threshold calibration results: the empirically calibrated threshold shown side-by-side with the model's preset default (or an explicit no-preset state), calibration metadata (percentile, sample size, model id, distance function), the pairwise similarity-distribution statistics (mean / median / std-dev / min / max / pair count), and a reference list of known-good preset thresholds with the active model highlighted. loading and empty states carry optional calibrate / cancel affordances. designed from the thresholdcalibration result shape; the full-fidelity standalone complement to evaluation-metrics-dashboard's embedded calibration sub-view. driven by usecalibratethreshold (pair presetthreshold with getdefaultthreshold and presets with model_threshold_presets). all in-component svg-free token styling — no chart library.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
