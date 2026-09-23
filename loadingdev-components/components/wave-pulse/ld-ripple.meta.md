# Ripple (ld-ripple)

**Category**: wave-pulse  
**Source**: https://loading.dev/  
**License**: MIT License  
**Default Duration**: `1200ms`  
**Recommended Size**: `24px - 48px`  
**Tags**: ripple, acoustic, voice, listening, broadcast

---

## 1. Physical Metaphor & Visual Signature
Water droplet ripples or sound wave acoustic propagation.

---

## 2. Decision Matrix

| Dimension | Guidance |
| :--- | :--- |
| **When to Use** | Voice assistant listening state ('Listening...'), audio recording, broadcast signal sending |
| **When NOT to Use** | Tight table cell inline status |

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



| `ld-ripple-ring-in` | `out` | Inward contracting ripple variant |


---

## 5. Usage Example

```html
<!-- Inline in a button -->
<button style="display: inline-flex; align-items: center; gap: 8px;">
  <span>Processing</span>
  <span style="display: inline-flex; align-items: center;">
    <div class="ld-ripple" aria-hidden="true" style="--ld-size: 16px;">
  <div class="ld-ripple-ring ld-ripple-ring-out" style="--ld-step: 0;"></div>
  <div class="ld-ripple-ring ld-ripple-ring-out" style="--ld-step: 1;"></div>
  <div class="ld-ripple-ring ld-ripple-ring-out" style="--ld-step: 2;"></div>
</div>
  </span>
</button>
```
