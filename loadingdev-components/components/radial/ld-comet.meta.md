# Comet (ld-comet)

**Category**: radial  
**Source**: https://loading.dev/  
**License**: MIT License  
**Default Duration**: `700ms`  
**Recommended Size**: `20px - 40px`  
**Tags**: comet, glow, conic, gradient, ai, streaming

---

## 1. Physical Metaphor & Visual Signature
Comet head with radiant fading conic-gradient streak.

---

## 2. Decision Matrix

| Dimension | Guidance |
| :--- | :--- |
| **When to Use** | AI prompt generation buffer, token streaming warmup, high-tech crypto verification |
| **When NOT to Use** | Ultra-dense tabular data rows |

---

## 3. Dependencies
- `shared/base.css` (Provides keyframe animations, CSS variable bindings, and `prefers-reduced-motion` support)
- Zero external runtime JavaScript required

---

## 4. Customization Variables

| Variable / Class | Default | Description |
| :--- | :--- | :--- |
| `--ld-size` | `20px` | Dimension in pixels |
| `--ld-duration` | `700ms` | Cycle duration in ms |
| `--ld-play-state` | `running` | Set to `paused` to freeze animation |
| `color` | `currentColor` | Inherits parent typography color |
| `ld-*-spin-ease-in-out` | `linear` | Eased animation timing class |
| `ld-*-spin-stacked` | - | Stacked dual-speed rotation timing |





---

## 5. Usage Example

```html
<!-- Inline in a button -->
<button style="display: inline-flex; align-items: center; gap: 8px;">
  <span>Processing</span>
  <span style="display: inline-flex; align-items: center;">
    <div class="ld-comet" aria-hidden="true" style="--ld-size: 16px;">
  <div class="ld-comet-spin">
    <div class="ld-comet-tail"></div>
    <div class="ld-comet-head"></div>
  </div>
</div>
  </span>
</button>
```
