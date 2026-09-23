# Eclipse (ld-eclipse)

**Category**: dots  
**Source**: https://loading.dev/  
**License**: MIT License  
**Default Duration**: `1200ms`  
**Recommended Size**: `20px - 32px`  
**Tags**: eclipse, binary, dual-star, ab-testing, transfer

---

## 1. Physical Metaphor & Visual Signature
Binary star system passing in front and behind each other.

---

## 2. Decision Matrix

| Dimension | Guidance |
| :--- | :--- |
| **When to Use** | Model comparison (A/B testing), token/asset balance transfers, dual-agent collaboration |
| **When NOT to Use** | Simple solitary item loading |

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






---

## 5. Usage Example

```html
<!-- Inline in a button -->
<button style="display: inline-flex; align-items: center; gap: 8px;">
  <span>Processing</span>
  <span style="display: inline-flex; align-items: center;">
    <div class="ld-eclipse" aria-hidden="true" style="--ld-size: 16px;">
  <div class="ld-eclipse-dot" style="--ld-step: 0;"></div>
  <div class="ld-eclipse-dot" style="--ld-step: 1;"></div>
</div>
  </span>
</button>
```
