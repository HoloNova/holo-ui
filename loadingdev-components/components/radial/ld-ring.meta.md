# Ring (ld-ring)

**Category**: radial  
**Source**: https://loading.dev/  
**License**: MIT License  
**Default Duration**: `800ms`  
**Recommended Size**: `16px - 32px`  
**Tags**: ring, circle, radial, track, refresh, modal

---

## 1. Physical Metaphor & Visual Signature
Luminous halo orbiting a dim concentric ring.

---

## 2. Decision Matrix

| Dimension | Guidance |
| :--- | :--- |
| **When to Use** | Pull-to-refresh headers, modal dialog content loading, form submission |
| **When NOT to Use** | Extremely tight 12px inline badges |

---

## 3. Dependencies
- `shared/base.css` (Provides keyframe animations, CSS variable bindings, and `prefers-reduced-motion` support)
- Zero external runtime JavaScript required

---

## 4. Customization Variables

| Variable / Class | Default | Description |
| :--- | :--- | :--- |
| `--ld-size` | `20px` | Dimension in pixels |
| `--ld-duration` | `800ms` | Cycle duration in ms |
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
    <svg class="ld-ring" aria-hidden="true" role="presentation" viewBox="0 0 24 24" fill="none" style="--ld-size: 16px;">
  <circle cx="12" cy="12" opacity="0.2" r="10" stroke="currentColor" stroke-width="2.5"></circle>
  <circle class="ld-ring-spin" cx="12" cy="12" r="10" stroke="currentColor" stroke-dasharray="16 46.8" stroke-linecap="round" stroke-width="2.5"></circle>
</svg>
  </span>
</button>
```
