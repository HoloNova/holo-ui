# Vector Import Flow

### Description
A guarded vector-import flow for useImportExport: a preview panel (detected-format badge, total / with-vectors / text-only counts, detected dimensions, dimension-mismatch warning, Cancel/Confirm), a phased progress bar (parsing → validating → embedding → importing), a result stats banner (imported/skipped/re-embedded counts, source format, duration), and a record-preview table for row-level sanity checks before a destructive ingest. References the cross-family FormatDetectionBadge and inlines a minimal fallback so it builds independently. Data source useImportExport.

### Tokens
- scale: `standard`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `content`
- runtime: `react`

### When to use
Use `vector-import-flow` when a guarded vector-import flow for useimportexport: a preview panel (detected-format badge, total / with-vectors / text-only counts, detected dimensions, dimension-mismatch warning, cancel/confirm), a phased progress bar (parsing → validating → embedding → importing), a result stats banner (imported/skipped/re-embedded counts, source format, duration), and a record-preview table for row-level sanity checks before a destructive ingest. references the cross-family formatdetectionbadge and inlines a minimal fallback so it builds independently. data source useimportexport.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
