# Cascade (ld-cascade)

**Category**: wave-pulse  
**Source**: https://loading.dev/  
**License**: MIT License  
**Default Duration**: `1500ms`  
**Recommended Size**: `20px - 36px`  
**Tags**: cascade, spiral, nested, fan-out, heavy-job

---

## 1. Physical Metaphor & Visual Signature
Multi-tiered centrifugal governor snapping back into alignment.

---

## 2. Decision Matrix

| Dimension | Guidance |
| :--- | :--- |
| **When to Use** | High-throughput asynchronous job orchestration, fan-out query execution |
| **When NOT to Use** | Lightweight 14px button indicators |

---

## 3. Dependencies
- `shared/base.css` (Provides keyframe animations, CSS variable bindings, and `prefers-reduced-motion` support)
- Zero external runtime JavaScript required

---

## 4. Customization Variables

| Variable / Class | Default | Description |
| :--- | :--- | :--- |
| `--ld-size` | `20px` | Dimension in pixels |
| `--ld-duration` | `1500ms` | Cycle duration in ms |
| `--ld-play-state` | `running` | Set to `paused` to freeze animation |
| `color` | `currentColor` | Inherits parent typography color |

| Stroke cap | `round` | Add stroke-linecap="square" for sharp edge |




---

## 5. Usage Example

```html
<!-- Inline in a button -->
<button style="display: inline-flex; align-items: center; gap: 8px;">
  <span>Processing</span>
  <span style="display: inline-flex; align-items: center;">
    <svg class="ld-cascade" aria-hidden="true" role="presentation" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2" style="--ld-size: 16px;">
  <circle class="ld-cascade-arc" cx="12" cy="12" r="10.5" stroke-dasharray="16.493361431346415 49.480084294039244" style="--ld-step: 0;"></circle>
  <circle class="ld-cascade-arc" cx="12" cy="12" r="7" stroke-dasharray="10.995574287564276 32.98672286269283" style="--ld-step: 1;"></circle>
  <circle class="ld-cascade-arc" cx="12" cy="12" r="3.5" stroke-dasharray="5.497787143782138 16.493361431346415" style="--ld-step: 2;"></circle>
</svg>
  </span>
</button>
```
