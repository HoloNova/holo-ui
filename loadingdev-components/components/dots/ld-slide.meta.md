# Slide (ld-slide)

**Category**: dots  
**Source**: https://loading.dev/  
**License**: MIT License  
**Default Duration**: `2400ms`  
**Recommended Size**: `18px - 28px`  
**Tags**: slide, puzzle, reorder, grid-shift, shuffle

---

## 1. Physical Metaphor & Visual Signature
15-puzzle sliding tiles rotating around a perimeter.

---

## 2. Decision Matrix

| Dimension | Guidance |
| :--- | :--- |
| **When to Use** | Layout rearrangement, card sorting/re-indexing, database partition re-balancing |
| **When NOT to Use** | Standard linear text labels |

---

## 3. Dependencies
- `shared/base.css` (Provides keyframe animations, CSS variable bindings, and `prefers-reduced-motion` support)
- Zero external runtime JavaScript required

---

## 4. Customization Variables

| Variable / Class | Default | Description |
| :--- | :--- | :--- |
| `--ld-size` | `20px` | Dimension in pixels |
| `--ld-duration` | `2400ms` | Cycle duration in ms |
| `--ld-play-state` | `running` | Set to `paused` to freeze animation |
| `color` | `currentColor` | Inherits parent typography color |






---

## 5. Usage Example

```html
<!-- Inline in a button -->
<button style="display: inline-flex; align-items: center; gap: 8px;">
  <span>Processing</span>
  <span style="display: inline-flex; align-items: center;">
    <div class="ld-slide" aria-hidden="true" style="--ld-size: 16px;">
  <div class="ld-slide-dot" style="--ld-step: 0; --ld-slide-rest: translate(0, 0);"></div>
  <div class="ld-slide-dot" style="--ld-step: 1; --ld-slide-rest: translate(158.8%, 0);"></div>
  <div class="ld-slide-dot" style="--ld-step: 2; --ld-slide-rest: translate(158.8%, 158.8%);"></div>
</div>
  </span>
</button>
```
