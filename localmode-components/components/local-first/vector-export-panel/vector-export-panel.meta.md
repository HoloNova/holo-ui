# Vector Export Panel

### Description
An export surface for vector data — the counterpart to VectorImportFlow: a record/dimension count line, a row per export format (native JSON with vectors, CSV, JSONL — label, description, vectors-included / text-only indicator, per-format export action emitting onExport(formatId)), a busy state that disables all actions with a spinner on the active format, a zero-records disabled state, and an optional last-export banner (format, records, human-readable size, filename). Works with any backend; data source useImportExport (exportCSV, exportJSONL) plus a native JSON export.

### Tokens
- scale: `region`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `content`
- runtime: `react`

### When to use
Use `vector-export-panel` when an export surface for vector data — the counterpart to vectorimportflow: a record/dimension count line, a row per export format (native json with vectors, csv, jsonl — label, description, vectors-included / text-only indicator, per-format export action emitting onexport(formatid)), a busy state that disables all actions with a spinner on the active format, a zero-records disabled state, and an optional last-export banner (format, records, human-readable size, filename). works with any backend; data source useimportexport (exportcsv, exportjsonl) plus a native json export.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
