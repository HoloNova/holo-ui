# Message

### Description
Role-aware chat message (data-role) rendering string or ContentPart[] — markdown text, image thumbnails with a fullscreen dialog, and file download chips from local bytes — with contained/flat variants and an inter-message Checkpoint savepoint marker. Matches @localmode/react's message model.

### Tokens
- scale: `standard`
- placement: `flow`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `content`
- runtime: `react`

### When to use
Use `message` when role-aware chat message (data-role) rendering string or contentpart[] — markdown text, image thumbnails with a fullscreen dialog, and file download chips from local bytes — with contained/flat variants and an inter-message checkpoint savepoint marker. matches @localmode/react's message model.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
