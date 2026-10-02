# Multi-Step Pipeline Tracker

### Description
Progress surfaces for local workflows: a horizontal numbered-step indicator (active/completed/pending), a stage+percentage variant for ingest, a Steps/Plan vertical outline with expandable detail, and an inference-queue surface grouped by priority. Maps to usePipeline onProgress and useInferenceQueue.

### Tokens
- scale: `standard`
- placement: `embedded`
- interaction: `output`
- lifecycle: `state-driven`
- motion: `none`
- category: `workflow`
- runtime: `react`

### When to use
Use `pipeline-tracker` when progress surfaces for local workflows: a horizontal numbered-step indicator (active/completed/pending), a stage+percentage variant for ingest, a steps/plan vertical outline with expandable detail, and an inference-queue surface grouped by priority. maps to usepipeline onprogress and useinferencequeue.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
