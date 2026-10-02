# Tool Approval

### Description
A human-in-the-loop confirmation card that gates a tool call before execution (pending tool + args with approve/reject), then re-renders read-only as an immutable receipt. Pairs with Tool and feeds the choice back into the agent loop. Data source: useAgent.

### Tokens
- scale: `standard`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `content`
- runtime: `react`

### When to use
Use `tool-approval` when a human-in-the-loop confirmation card that gates a tool call before execution (pending tool + args with approve/reject), then re-renders read-only as an immutable receipt. pairs with tool and feeds the choice back into the agent loop. data source: useagent.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
