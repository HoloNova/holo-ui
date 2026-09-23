# Classic (ld-classic)

**Category**: classic  
**Source**: https://loading.dev/  
**License**: MIT License  
**Default Duration**: `1200ms`  
**Recommended Size**: `20px - 36px`  
**Tags**: classic, apple, ios, macos, bars, system

---

## 1. Physical Metaphor & Visual Signature
Apple iOS/macOS UIActivityIndicatorView radial wheel.

---

## 2. Decision Matrix

| Dimension | Guidance |
| :--- | :--- |
| **When to Use** | Standard system-level waiting state, iOS hybrid mobile web views, modal confirmation |
| **When NOT to Use** | Futuristic dark-mode AI terminal aesthetics |

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
    <div class="ld-classic" aria-hidden="true" style="--ld-size: 16px;">
  <div class="ld-classic-inner">
    <div class="ld-classic-bar" style="--ld-step: 0;"></div>
    <div class="ld-classic-bar" style="--ld-step: 1;"></div>
    <div class="ld-classic-bar" style="--ld-step: 2;"></div>
    <div class="ld-classic-bar" style="--ld-step: 3;"></div>
    <div class="ld-classic-bar" style="--ld-step: 4;"></div>
    <div class="ld-classic-bar" style="--ld-step: 5;"></div>
    <div class="ld-classic-bar" style="--ld-step: 6;"></div>
    <div class="ld-classic-bar" style="--ld-step: 7;"></div>
    <div class="ld-classic-bar" style="--ld-step: 8;"></div>
    <div class="ld-classic-bar" style="--ld-step: 9;"></div>
    <div class="ld-classic-bar" style="--ld-step: 10;"></div>
    <div class="ld-classic-bar" style="--ld-step: 11;"></div>
  </div>
</div>
  </span>
</button>
```
