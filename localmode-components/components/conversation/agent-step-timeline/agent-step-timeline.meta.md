# Agent Step Timeline

### Description
A vertical timeline of ReAct agent steps: collapsible per-step cards (color-coded tool badge, args, observation show-more, index, elapsed-ms), a finish final-answer card, auto-scroll, a Thinking row while running, a finish-reason badge (max_steps/timeout/loop_detected/error), and nested sub-agent/handoff rendering. Data source: useAgent.

### Tokens
- scale: `standard`
- placement: `flow`
- interaction: `output`
- lifecycle: `state-driven`
- motion: `none`
- category: `workflow`
- runtime: `react`

### When to use
Use `agent-step-timeline` when a vertical timeline of react agent steps: collapsible per-step cards (color-coded tool badge, args, observation show-more, index, elapsed-ms), a finish final-answer card, auto-scroll, a thinking row while running, a finish-reason badge (max_steps/timeout/loop_detected/error), and nested sub-agent/handoff rendering. data source: useagent.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
