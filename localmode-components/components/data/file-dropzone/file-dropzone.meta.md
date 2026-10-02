# File Dropzone

### Description
A generic, format-agnostic drag-and-drop + click-to-browse upload zone for non-image files (PDF/CSV/JSON/vector exports). Validates each file with a bundled validateFile helper (copy-owned — no @localmode dependency) against an accept MIME list and maxSize, emitting only valid files via onUpload; rejected files go to onReject. Disabled/processing overlay blocks input. Distinct from media-vision's MediaDropzone (no image-preview semantics).

### Tokens
- scale: `standard`
- placement: `embedded`
- interaction: `input`
- lifecycle: `persistent`
- motion: `none`
- category: `composer`
- runtime: `react`

### When to use
Use `lm-file-dropzone` when a generic, format-agnostic drag-and-drop + click-to-browse upload zone for non-image files (pdf/csv/json/vector exports). validates each file with a bundled validatefile helper (copy-owned — no @localmode dependency) against an accept mime list and maxsize, emitting only valid files via onupload; rejected files go to onreject. disabled/processing overlay blocks input. distinct from media-vision's mediadropzone (no image-preview semantics).

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
