# Format Detection Badge

### Description
A small badge displaying an auto-detected data format (PINECONE / CHROMA / CSV / JSONL or custom) with a per-format color map, used to confirm a detected source format after parsing. Fully self-contained and presentational — pass a format string and an optional colorMap; unknown formats fall back to neutral and a nullish format shows a pending state. Pairs with useImportExport (parseResult.format); also consumed by the local-first VectorImportFlow as a registry dependency.

### Tokens
- scale: `micro`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `status`
- runtime: `react`

### When to use
Use `format-detection-badge` when a small badge displaying an auto-detected data format (pinecone / chroma / csv / jsonl or custom) with a per-format color map, used to confirm a detected source format after parsing. fully self-contained and presentational — pass a format string and an optional colormap; unknown formats fall back to neutral and a nullish format shows a pending state. pairs with useimportexport (parseresult.format); also consumed by the local-first vectorimportflow as a registry dependency.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
