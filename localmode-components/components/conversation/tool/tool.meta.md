# Tool

### Description
A single tool invocation card with a status taxonomy (pending/running/streaming/completed/error), expandable ToolInput/ToolOutput, a per-tool renderer registry with a Fallback for unregistered tools, and a ToolGroup that collapses consecutive calls behind a stacked-icon summary. Data source: useAgent / wllama/transformers tool calling.

### Tokens
- scale: `standard`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `content`
- runtime: `react`

### When to use
Use `tool` when a single tool invocation card with a status taxonomy (pending/running/streaming/completed/error), expandable toolinput/tooloutput, a per-tool renderer registry with a fallback for unregistered tools, and a toolgroup that collapses consecutive calls behind a stacked-icon summary. data source: useagent / wllama/transformers tool calling.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
