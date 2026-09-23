# Snake (ld-snake)

**Category**: radial  
**Source**: https://loading.dev/  
**License**: MIT License  
**Default Duration**: `1400ms`  
**Recommended Size**: `18px - 32px`  
**Tags**: snake, elastic, buffer, video, stream, network

---

## 1. Physical Metaphor & Visual Signature
Fluid chord dynamically extending and snapping back along a circle.

---

## 2. Decision Matrix

| Dimension | Guidance |
| :--- | :--- |
| **When to Use** | Network bandwidth buffering, video/audio segment preloading, elastic wait times |
| **When NOT to Use** | Strict fixed-interval micro-delays |

---

## 3. Dependencies
- `shared/base.css` (Provides keyframe animations, CSS variable bindings, and `prefers-reduced-motion` support)
- Zero external runtime JavaScript required

---

## 4. Customization Variables

| Variable / Class | Default | Description |
| :--- | :--- | :--- |
| `--ld-size` | `20px` | Dimension in pixels |
| `--ld-duration` | `1400ms` | Cycle duration in ms |
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
    <svg class="ld-snake" aria-hidden="true" role="presentation" viewBox="0 0 24 24" fill="none" style="--ld-size: 16px;">
  <g class="ld-snake-spin">
    <circle class="ld-snake-dash" cx="12" cy="12" r="10" stroke="currentColor" stroke-linecap="round" stroke-width="2.5"></circle>
  </g>
</svg>
  </span>
</button>
```
