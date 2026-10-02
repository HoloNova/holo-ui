# Event Log Viewer

### Description
Newest-first devtools event log: relative timestamps (absolute on hover), namespace-colored type badges (vectordb/embedding/model/queue/pipeline/storage), serialized payloads, a case-insensitive substring type filter, a visible cap (default 100) with an overflow line, distinct no-events and no-match empty states, and an optional Clear affordance. Recommended data source: useDevToolsEvents from @localmode/devtools/react.

### Tokens
- scale: `region`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `transition`
- category: `content`
- runtime: `react`

### When to use
Use `event-log-viewer` when newest-first devtools event log: relative timestamps (absolute on hover), namespace-colored type badges (vectordb/embedding/model/queue/pipeline/storage), serialized payloads, a case-insensitive substring type filter, a visible cap (default 100) with an overflow line, distinct no-events and no-match empty states, and an optional clear affordance. recommended data source: usedevtoolsevents from @localmode/devtools/react.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
