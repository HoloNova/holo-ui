# Provider Badge

### Description
Displays the RESOLVED provider identity - composing ProviderFallbackBadge for the tier and name - alongside the model id that actually served the request. While providerName is null it shows a Resolving provider placeholder, so the badge never claims a provider before one has resolved. Takes generic display props (providerName / tier / modelId / note). Distinct from ProviderFallbackBadge (the tier chip it composes): this adds the resolved provider identity plus the served model id. Data source: a provider-fallback resolver.

### Tokens
- scale: `micro`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `status`
- runtime: `react`

### When to use
Use `provider-badge` when displays the resolved provider identity - composing providerfallbackbadge for the tier and name - alongside the model id that actually served the request. while providername is null it shows a resolving provider placeholder, so the badge never claims a provider before one has resolved. takes generic display props (providername / tier / modelid / note). distinct from providerfallbackbadge (the tier chip it composes): this adds the resolved provider identity plus the served model id. data source: a provider-fallback resolver.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
