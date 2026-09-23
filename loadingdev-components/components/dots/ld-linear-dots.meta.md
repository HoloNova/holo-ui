# Linear dots (ld-linear-dots)

**Category**: dots  
**Source**: https://loading.dev/  
**License**: MIT License  
**Default Duration**: `900ms`  
**Recommended Size**: `14px - 20px`  
**Tags**: linear-dots, ellipsis, inline, table, button-text, subtle

---

## 1. Physical Metaphor & Visual Signature
Gentle pulsating ellipsis (...) in place.

---

## 2. Decision Matrix

| Dimension | Guidance |
| :--- | :--- |
| **When to Use** | Inline button text suffix (e.g., 'Saving...'), table cell updates, status bar footers |
| **When NOT to Use** | Large prominent hero sections |

---

## 3. Dependencies
- `shared/base.css` (Provides keyframe animations, CSS variable bindings, and `prefers-reduced-motion` support)
- Zero external runtime JavaScript required

---

## 4. Customization Variables

| Variable / Class | Default | Description |
| :--- | :--- | :--- |
| `--ld-size` | `20px` | Dimension in pixels |
| `--ld-duration` | `900ms` | Cycle duration in ms |
| `--ld-play-state` | `running` | Set to `paused` to freeze animation |
| `color` | `currentColor` | Inherits parent typography color |






---

## 5. Usage Example

```html
<!-- Inline in a button -->
<button style="display: inline-flex; align-items: center; gap: 8px;">
  <span>Processing</span>
  <span style="display: inline-flex; align-items: center;">
    <div class="ld-linear-dots" aria-hidden="true" style="--ld-size: 20px;">
  <div class="ld-linear-dots-dot" style="--ld-step: 0;"></div>
  <div class="ld-linear-dots-dot" style="--ld-step: 1;"></div>
  <div class="ld-linear-dots-dot" style="--ld-step: 2;"></div>
</div>
  </span>
</button>
```
