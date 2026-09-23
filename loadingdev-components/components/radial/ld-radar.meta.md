# Radar (ld-radar)

**Category**: radial  
**Source**: https://loading.dev/  
**License**: MIT License  
**Default Duration**: `1500ms`  
**Recommended Size**: `24px - 48px`  
**Tags**: radar, sonar, scan, discovery, bluetooth, agent-search

---

## 1. Physical Metaphor & Visual Signature
Active sonar/radar sweep scanning for targets in 360 degrees.

---

## 2. Decision Matrix

| Dimension | Guidance |
| :--- | :--- |
| **When to Use** | Device/bluetooth discovery, agent web exploration tool, security auditing |
| **When NOT to Use** | Minimalist button spinners |

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
| `ld-*-spin-ease-in-out` | `linear` | Eased animation timing class |
| `ld-*-spin-stacked` | - | Stacked dual-speed rotation timing |





---

## 5. Usage Example

```html
<!-- Inline in a button -->
<button style="display: inline-flex; align-items: center; gap: 8px;">
  <span>Processing</span>
  <span style="display: inline-flex; align-items: center;">
    <svg class="ld-radar" aria-hidden="true" role="presentation" viewBox="0 0 16 16" fill="none" style="--ld-size: 16px;">
  <defs>
    <radialGradient id="ld-radar-beam" cx="8" cy="8" r="8" gradientUnits="userSpaceOnUse">
      <stop offset="0.3334" stop-color="currentColor"></stop>
      <stop offset="1" stop-color="currentColor" stop-opacity="0"></stop>
    </radialGradient>
  </defs>
  <circle cx="8" cy="8" fill="currentColor" opacity="0.2" r="8"></circle>
  <circle cx="8" cy="8" opacity="0.2" r="5.5" stroke="currentColor"></circle>
  <path class="ld-radar-spin" d="M8 0C9.50657 0 10.9824 0.425672 12.2578 1.22754C13.5333 2.02953 14.557 3.17533 15.21 4.5332C15.8629 5.89107 16.1193 7.40626 15.9492 8.90332C15.7791 10.4001 15.1896 11.8184 14.249 12.9951L10.4707 9.69922C10.8037 9.21598 11 8.63123 11 8C11 6.34315 9.65685 5 8 5V0Z" fill="url(#ld-radar-beam)"></path>
  <circle cx="8" cy="8" fill="currentColor" r="2"></circle>
</svg>
  </span>
</button>
```
