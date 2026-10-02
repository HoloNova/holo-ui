# Branch

### Description
A message-versioning navigator that pages between regenerated/edited assistant variants for one turn, with prev/next controls and an X of N indicator (hidden at N=1). Wraps an existing Message non-intrusively; pure client state. Data source: useChat.

### Tokens
- scale: `standard`
- placement: `embedded`
- interaction: `navigation`
- lifecycle: `persistent`
- motion: `none`
- category: `nav`
- runtime: `react`

### When to use
Use `branch` when a message-versioning navigator that pages between regenerated/edited assistant variants for one turn, with prev/next controls and an x of n indicator (hidden at n=1). wraps an existing message non-intrusively; pure client state. data source: usechat.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
