# Arc (ld-arc)

**Category**: radial  
**Source**: https://loading.dev/  
**License**: MIT License  
**Default Duration**: `800ms`  
**Recommended Size**: `14px - 28px`  
**Tags**: arc, spinner, radial, button, inline, minimal

---

## 1. Physical Metaphor & Visual Signature
Minimal open circular stroke sweeping 360 degrees.

---

## 2. Decision Matrix

| Dimension | Guidance |
| :--- | :--- |
| **When to Use** | Compact button submitting, inline text status, search input trailing icon |
| **When NOT to Use** | Large fullscreen splash screens where hairline stroke feels too thin |

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
    <svg class="ld-arc" aria-hidden="true" role="presentation" viewBox="0 0 24 24" fill="none" style="--ld-size: 16px;">
  <circle class="ld-arc-spin" cx="12" cy="12" r="10" stroke="currentColor" stroke-dasharray="18 44.8" stroke-linecap="round" stroke-width="2.5"></circle>
</svg>
  </span>
</button>
```
