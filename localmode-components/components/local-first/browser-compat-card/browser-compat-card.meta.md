# Browser Compat Card

### Description
A per-model runnability report for the current device — the feasibility check you want before a multi-GB download: a pass/fail RAM-headroom bar (model RAM vs device RAM), available storage, threading (cross-origin-isolation) status, estimated speed, and a warnings list, with a canRun boolean gating a success/error header. Ships an independently-usable RAMUsageBar. Extends the spirit of CapabilityGate; data source useCapabilities.

### Tokens
- scale: `standard`
- placement: `flow`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `content`
- runtime: `react`

### When to use
Use `browser-compat-card` when a per-model runnability report for the current device — the feasibility check you want before a multi-gb download: a pass/fail ram-headroom bar (model ram vs device ram), available storage, threading (cross-origin-isolation) status, estimated speed, and a warnings list, with a canrun boolean gating a success/error header. ships an independently-usable ramusagebar. extends the spirit of capabilitygate; data source usecapabilities.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
