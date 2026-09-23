# Flip (ld-flip)

**Category**: geometric  
**Source**: https://loading.dev/  
**License**: MIT License  
**Default Duration**: `1200ms`  
**Recommended Size**: `18px - 32px`  
**Tags**: flip, 3d, tumble, card-flip, render, perspective

---

## 1. Physical Metaphor & Visual Signature
3D tumbling cube face with perspective.

---

## 2. Decision Matrix

| Dimension | Guidance |
| :--- | :--- |
| **When to Use** | 3D model loading, flashcard generation, shader compilation |
| **When NOT to Use** | Flat minimalist monochrome interfaces where 3D perspective looks out of place |

---

## 3. Dependencies
- `shared/base.css` (Provides keyframe animations, CSS variable bindings, and `prefers-reduced-motion` support)
- Zero external runtime JavaScript required

---

## 4. Customization Variables

| Variable / Class | Default | Description |
| :--- | :--- | :--- |
| `--ld-size` | `20px` | Dimension in pixels |
| `--ld-duration` | `1200ms` | Cycle duration in ms |
| `--ld-play-state` | `running` | Set to `paused` to freeze animation |
| `color` | `currentColor` | Inherits parent typography color |






---

## 5. Usage Example

```html
<!-- Inline in a button -->
<button style="display: inline-flex; align-items: center; gap: 8px;">
  <span>Processing</span>
  <span style="display: inline-flex; align-items: center;">
    <div class="ld-flip" aria-hidden="true" style="--ld-size: 16px;">
  <div class="ld-flip-face"></div>
</div>
  </span>
</button>
```
