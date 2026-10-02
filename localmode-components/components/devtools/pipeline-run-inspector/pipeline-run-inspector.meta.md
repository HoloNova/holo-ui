# Pipeline Run Inspector

### Description
Per-run pipeline observability cards: status badge (running pulses on primary, completed emerald, failed destructive), a completed/total progress bar, the current step while running, total duration on completion, and optional expandable per-step timing rows. The runs record mirrors the @localmode/devtools PipelineSnapshot shape, so useDevToolsPipelineRuns() output feeds it directly; works with any backend.

### Tokens
- scale: `standard`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `workflow`
- runtime: `react`

### When to use
Use `pipeline-run-inspector` when per-run pipeline observability cards: status badge (running pulses on primary, completed emerald, failed destructive), a completed/total progress bar, the current step while running, total duration on completion, and optional expandable per-step timing rows. the runs record mirrors the @localmode/devtools pipelinesnapshot shape, so usedevtoolspipelineruns() output feeds it directly; works with any backend.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
