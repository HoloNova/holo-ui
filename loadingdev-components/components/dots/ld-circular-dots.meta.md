# Circular dots (ld-circular-dots)

**Category**: dots  
**Source**: https://loading.dev/  
**License**: MIT License  
**Default Duration**: `800ms`  
**Recommended Size**: `20px - 36px`  
**Tags**: circular-dots, led, rotary, dial, boot, widget

---

## 1. Physical Metaphor & Visual Signature
Rotary LED dial with sequential illumination.

---

## 2. Decision Matrix

| Dimension | Guidance |
| :--- | :--- |
| **When to Use** | Application initialization, dashboard widget initial load, firmware flashing |
| **When NOT to Use** | Inline text flow |

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






---

## 5. Usage Example

```html
<!-- Inline in a button -->
<button style="display: inline-flex; align-items: center; gap: 8px;">
  <span>Processing</span>
  <span style="display: inline-flex; align-items: center;">
    <svg class="ld-circular-dots" aria-hidden="true" role="presentation" viewBox="0 0 16 16" fill="currentColor" style="--ld-size: 16px;">
  <circle class="ld-circular-dots-dot" cx="8" cy="1.5" r="1.5" style="--ld-step: 0;"></circle>
  <circle class="ld-circular-dots-dot" cx="12.5962" cy="3.4038" r="1.5" style="--ld-step: 1;"></circle>
  <circle class="ld-circular-dots-dot" cx="14.5" cy="8" r="1.5" style="--ld-step: 2;"></circle>
  <circle class="ld-circular-dots-dot" cx="12.5962" cy="12.5962" r="1.5" style="--ld-step: 3;"></circle>
  <circle class="ld-circular-dots-dot" cx="8" cy="14.5" r="1.5" style="--ld-step: 4;"></circle>
  <circle class="ld-circular-dots-dot" cx="3.4038" cy="12.5962" r="1.5" style="--ld-step: 5;"></circle>
  <circle class="ld-circular-dots-dot" cx="1.5" cy="8" r="1.5" style="--ld-step: 6;"></circle>
  <circle class="ld-circular-dots-dot" cx="3.4038" cy="3.4038" r="1.5" style="--ld-step: 7;"></circle>
</svg>
  </span>
</button>
```
