# Blocks (ld-blocks)

**Category**: geometric  
**Source**: https://loading.dev/  
**License**: MIT License  
**Default Duration**: `1300ms`  
**Recommended Size**: `20px - 36px`  
**Tags**: blocks, matrix, grid, spreadsheet, batch, compute

---

## 1. Physical Metaphor & Visual Signature
Cellular automaton or matrix spreadsheet calculation wave.

---

## 2. Decision Matrix

| Dimension | Guidance |
| :--- | :--- |
| **When to Use** | Spreadsheet math calculation, batch image processing, matrix data transformation |
| **When NOT to Use** | Narrow text inline label spaces |

---

## 3. Dependencies
- `shared/base.css` (Provides keyframe animations, CSS variable bindings, and `prefers-reduced-motion` support)
- Zero external runtime JavaScript required

---

## 4. Customization Variables

| Variable / Class | Default | Description |
| :--- | :--- | :--- |
| `--ld-size` | `20px` | Dimension in pixels |
| `--ld-duration` | `1300ms` | Cycle duration in ms |
| `--ld-play-state` | `running` | Set to `paused` to freeze animation |
| `color` | `currentColor` | Inherits parent typography color |


| `ld-blocks-cell-rows` | `diagonal` | Row-by-row sweep variant |
| `ld-blocks-cell-columns` | `diagonal` | Column-by-column sweep variant |



---

## 5. Usage Example

```html
<!-- Inline in a button -->
<button style="display: inline-flex; align-items: center; gap: 8px;">
  <span>Processing</span>
  <span style="display: inline-flex; align-items: center;">
    <div class="ld-blocks" aria-hidden="true" style="--ld-size: 16px;">
  <div class="ld-blocks-cell ld-blocks-cell-diagonal" style="--ld-step: 0;"></div>
  <div class="ld-blocks-cell ld-blocks-cell-diagonal" style="--ld-step: 1;"></div>
  <div class="ld-blocks-cell ld-blocks-cell-diagonal" style="--ld-step: 2;"></div>
  <div class="ld-blocks-cell ld-blocks-cell-diagonal" style="--ld-step: 1;"></div>
  <div class="ld-blocks-cell ld-blocks-cell-diagonal" style="--ld-step: 2;"></div>
  <div class="ld-blocks-cell ld-blocks-cell-diagonal" style="--ld-step: 3;"></div>
  <div class="ld-blocks-cell ld-blocks-cell-diagonal" style="--ld-step: 2;"></div>
  <div class="ld-blocks-cell ld-blocks-cell-diagonal" style="--ld-step: 3;"></div>
  <div class="ld-blocks-cell ld-blocks-cell-diagonal" style="--ld-step: 4;"></div>
</div>
  </span>
</button>
```
