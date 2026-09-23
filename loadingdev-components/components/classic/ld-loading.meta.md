# Loading (ld-loading)

**Category**: classic  
**Source**: https://loading.dev/  
**License**: MIT License  
**Default Duration**: `1000ms`  
**Recommended Size**: `20px - 36px`  
**Tags**: loading, pixel, retro, brand, square-ring

---

## 1. Physical Metaphor & Visual Signature
Chunky 8-bit digital pixel wheel.

---

## 2. Decision Matrix

| Dimension | Guidance |
| :--- | :--- |
| **When to Use** | Tech devtools, retro cyber interfaces, platform brand loading mark |
| **When NOT to Use** | Strict clinical corporate enterprise forms |

---

## 3. Dependencies
- `shared/base.css` (Provides keyframe animations, CSS variable bindings, and `prefers-reduced-motion` support)
- Zero external runtime JavaScript required

---

## 4. Customization Variables

| Variable / Class | Default | Description |
| :--- | :--- | :--- |
| `--ld-size` | `20px` | Dimension in pixels |
| `--ld-duration` | `1000ms` | Cycle duration in ms |
| `--ld-play-state` | `running` | Set to `paused` to freeze animation |
| `color` | `currentColor` | Inherits parent typography color |






---

## 5. Usage Example

```html
<!-- Inline in a button -->
<button style="display: inline-flex; align-items: center; gap: 8px;">
  <span>Processing</span>
  <span style="display: inline-flex; align-items: center;">
    <svg class="ld-loading" aria-hidden="true" role="presentation" viewBox="0 0 15 15" fill="currentColor" style="--ld-size: 16px;">
  <g opacity="1" transform="translate(12 6)"><rect x="0" y="0" width="1" height="1"></rect><rect x="2" y="0" width="1" height="1"></rect><rect x="0" y="2" width="1" height="1"></rect><rect x="2" y="2" width="1" height="1"></rect></g>
  <g opacity="0.9" transform="translate(10 2)"><rect x="0" y="0" width="1" height="1"></rect><rect x="2" y="0" width="1" height="1"></rect><rect x="0" y="2" width="1" height="1"></rect><rect x="2" y="2" width="1" height="1"></rect></g>
  <g opacity="0.8" transform="translate(6 0)"><rect x="0" y="0" width="1" height="1"></rect><rect x="2" y="0" width="1" height="1"></rect><rect x="0" y="2" width="1" height="1"></rect><rect x="2" y="2" width="1" height="1"></rect></g>
  <g opacity="0.7" transform="translate(2 2)"><rect x="0" y="0" width="1" height="1"></rect><rect x="2" y="0" width="1" height="1"></rect><rect x="0" y="2" width="1" height="1"></rect><rect x="2" y="2" width="1" height="1"></rect></g>
  <g opacity="0.6" transform="translate(0 6)"><rect x="0" y="0" width="1" height="1"></rect><rect x="2" y="0" width="1" height="1"></rect><rect x="0" y="2" width="1" height="1"></rect><rect x="2" y="2" width="1" height="1"></rect></g>
  <g opacity="0.5" transform="translate(2 10)"><rect x="0" y="0" width="1" height="1"></rect><rect x="2" y="0" width="1" height="1"></rect><rect x="0" y="2" width="1" height="1"></rect><rect x="2" y="2" width="1" height="1"></rect></g>
  <g opacity="0.4" transform="translate(6 12)"><rect x="0" y="0" width="1" height="1"></rect><rect x="2" y="0" width="1" height="1"></rect><rect x="0" y="2" width="1" height="1"></rect><rect x="2" y="2" width="1" height="1"></rect></g>
  <g opacity="0.3" transform="translate(10 10)"><rect x="0" y="0" width="1" height="1"></rect><rect x="2" y="0" width="1" height="1"></rect><rect x="0" y="2" width="1" height="1"></rect><rect x="2" y="2" width="1" height="1"></rect></g>
</svg>
  </span>
</button>
```
