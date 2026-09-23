# Dual (ld-dual)

**Category**: radial  
**Source**: https://loading.dev/  
**License**: MIT License  
**Default Duration**: `1000ms`  
**Recommended Size**: `20px - 36px`  
**Tags**: dual, counter, concentric, sync, handshake

---

## 1. Physical Metaphor & Visual Signature
Planetary counter-rotating gears in mechanical equilibrium.

---

## 2. Decision Matrix

| Dimension | Guidance |
| :--- | :--- |
| **When to Use** | Two-way data sync (cloud <-> local), bidirectional handshakes, compilation processes |
| **When NOT to Use** | Simple unidirectional instantaneous requests |

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
| `ld-*-spin-ease-in-out` | `linear` | Eased animation timing class |
| `ld-*-spin-stacked` | - | Stacked dual-speed rotation timing |
| Stroke cap | `round` | Add stroke-linecap="square" for sharp edge |




---

## 5. Usage Example

```html
<!-- Inline in a button -->
<button style="display: inline-flex; align-items: center; gap: 8px;">
  <span>Processing</span>
  <span style="display: inline-flex; align-items: center;">
    <svg class="ld-dual" aria-hidden="true" role="presentation" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2.5" style="--ld-size: 16px;">
  <circle class="ld-dual-spin" cx="12" cy="12" r="10" stroke-dasharray="18 44.8"></circle>
  <circle class="ld-dual-inner ld-dual-spin" cx="12" cy="12" r="5.5" stroke-dasharray="10 24.6"></circle>
</svg>
  </span>
</button>
```
