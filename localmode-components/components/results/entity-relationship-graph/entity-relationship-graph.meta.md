# Entity Relationship Graph

### Description
An interactive force-directed graph of typed nodes + relationship-labeled edges with drag / zoom / pan / hover / click and SVG/PNG export — for visualizing VectorDB entity relationships, agent-memory connections, embedding clusters, or useExtractEntities (NER) co-occurrences. The layout runs entirely client-side over local data via a lightweight in-component force simulation (no d3-force, no network). Exports layoutGraph().

### Tokens
- scale: `standard`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `content`
- runtime: `react`

### When to use
Use `entity-relationship-graph` when an interactive force-directed graph of typed nodes + relationship-labeled edges with drag / zoom / pan / hover / click and svg/png export — for visualizing vectordb entity relationships, agent-memory connections, embedding clusters, or useextractentities (ner) co-occurrences. the layout runs entirely client-side over local data via a lightweight in-component force simulation (no d3-force, no network). exports layoutgraph().

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
