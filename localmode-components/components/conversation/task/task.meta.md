# Task

### Description
A multi-step agent process as an ordered list of steps (index, tool, status, args, observation) with the final-answer step distinguished. Its data shape aligns with @localmode/react useAgent steps so agent UIs wire up without adapters.

### Tokens
- scale: `standard`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `content`
- runtime: `react`

### When to use
Use `task` when a multi-step agent process as an ordered list of steps (index, tool, status, args, observation) with the final-answer step distinguished. its data shape aligns with @localmode/react useagent steps so agent uis wire up without adapters.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
