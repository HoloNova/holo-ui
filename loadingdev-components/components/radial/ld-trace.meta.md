# Trace (ld-trace)

**Category**: radial  
**Source**: https://loading.dev/  
**License**: MIT License  
**Default Duration**: `1200ms`  
**Recommended Size**: `24px - 48px`  
**Tags**: trace, perimeter, squircle, card, skeleton, border

---

## 1. Physical Metaphor & Visual Signature
Laser beam inspecting the perimeter of a squircle card.

---

## 2. Decision Matrix

| Dimension | Guidance |
| :--- | :--- |
| **When to Use** | Card container loading, skeleton avatar placeholders, bounding box scanning |
| **When NOT to Use** | Circular badge contexts where rectangular geometry clashes |

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
| `ld-*-spin-ease-in-out` | `linear` | Eased animation timing class |
| `ld-*-spin-stacked` | - | Stacked dual-speed rotation timing |
| Stroke cap | `round` | Add stroke-linecap="square" for sharp edge |




---

## 5. Usage Example

```html
<!-- Inline in a button -->
<button style="display: inline-flex; align-items: center; gap: 8px;">
  <span>Processing</span>
  <span style="display: inline-flex; align-items: center;">
    <svg class="ld-trace" aria-hidden="true" role="presentation" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="--ld-size: 16px;">
  <rect x="2.5" y="2.5" width="19" height="19" rx="5" opacity="0.2"></rect>
  <rect class="ld-trace-spin" x="2.5" y="2.5" width="19" height="19" rx="5" stroke-dasharray="15 50.13" stroke-linecap="round"></rect>
</svg>
  </span>
</button>
```
