# Reasoning

### Description
The model's own thinking tokens (DeepSeek-R1 style) in a collapsible region: auto-expands while streaming with an elapsed timer and auto-collapses on the final answer, plus a compact ThinkingBar one-line status strip. Tier of the thinking taxonomy: ThinkingBar -> Reasoning -> ChainOfThought.

### Tokens
- scale: `standard`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `ai-response`
- runtime: `react`

### When to use
Use `reasoning` when the model's own thinking tokens (deepseek-r1 style) in a collapsible region: auto-expands while streaming with an elapsed timer and auto-collapses on the final answer, plus a compact thinkingbar one-line status strip. tier of the thinking taxonomy: thinkingbar -> reasoning -> chainofthought.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
