# Prompt Input Attachments

### Description
Attachment surface for the composer: image/file attach via picker, paste, and drag-and-drop with preview thumbnails, per-item removal, a hovercard preview, media-category auto-detection, and upload-state chips. Produces attachments via a bundled readFileAsDataUrl helper (copy-owned); the shape matches common chat image-content models.

### Tokens
- scale: `compact`
- placement: `embedded`
- interaction: `input`
- lifecycle: `persistent`
- motion: `none`
- category: `composer`
- runtime: `react`

### When to use
Use `prompt-input-attachments` when attachment surface for the composer: image/file attach via picker, paste, and drag-and-drop with preview thumbnails, per-item removal, a hovercard preview, media-category auto-detection, and upload-state chips. produces attachments via a bundled readfileasdataurl helper (copy-owned); the shape matches common chat image-content models.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
