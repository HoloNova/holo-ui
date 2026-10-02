# Inference Queue Monitor

### Description
Per-queue inference observability: one card per registered queue showing pending, active, completed, failed, and average latency, with a live pulsing badge + emerald accent on active counts, amber on pending, and destructive on failures. Empty state directs users to registerQueue(). Recommended data source: useDevToolsQueueStats from @localmode/devtools/react — the hook snapshot spreads straight into the queues prop.

### Tokens
- scale: `standard`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `workflow`
- runtime: `react`

### When to use
Use `inference-queue-monitor` when per-queue inference observability: one card per registered queue showing pending, active, completed, failed, and average latency, with a live pulsing badge + emerald accent on active counts, amber on pending, and destructive on failures. empty state directs users to registerqueue(). recommended data source: usedevtoolsqueuestats from @localmode/devtools/react — the hook snapshot spreads straight into the queues prop.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
