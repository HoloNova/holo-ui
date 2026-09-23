# Pulse (ld-pulse)

**Category**: wave-pulse  
**Source**: https://loading.dev/  
**License**: MIT License  
**Default Duration**: `1200ms`  
**Recommended Size**: `16px - 32px`  
**Tags**: pulse, heartbeat, beacon, ping, live, status

---

## 1. Physical Metaphor & Visual Signature
Radio beacon ping or heartbeat expanding outward.

---

## 2. Decision Matrix

| Dimension | Guidance |
| :--- | :--- |
| **When to Use** | Live server status, WebSocket connection heartbeat, ambient sensor ping |
| **When NOT to Use** | Indeterminate lengthy calculations with no rhythmic frequency |

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
    <svg class="ld-pulse" aria-hidden="true" role="presentation" viewBox="0 0 16 16" fill="none" style="--ld-size: 16px;">
  <circle class="ld-pulse-ring" cx="8" cy="8" fill="currentColor" r="8"></circle>
  <circle cx="8" cy="8" fill="currentColor" r="2"></circle>
</svg>
  </span>
</button>
```
