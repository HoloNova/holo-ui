# Orbit (ld-orbit)

**Category**: orbital  
**Source**: https://loading.dev/  
**License**: MIT License  
**Default Duration**: `750ms`  
**Recommended Size**: `20px - 36px`  
**Tags**: orbit, satellite, cluster, distributed, sync, cloud

---

## 1. Physical Metaphor & Visual Signature
Satellite orbiting a planet along an elliptical gravitational track.

---

## 2. Decision Matrix

| Dimension | Guidance |
| :--- | :--- |
| **When to Use** | Distributed server cluster synchronization, multi-region database replication |
| **When NOT to Use** | Compact inline typography contexts |

---

## 3. Dependencies
- `shared/base.css` (Provides keyframe animations, CSS variable bindings, and `prefers-reduced-motion` support)
- Zero external runtime JavaScript required

---

## 4. Customization Variables

| Variable / Class | Default | Description |
| :--- | :--- | :--- |
| `--ld-size` | `20px` | Dimension in pixels |
| `--ld-duration` | `750ms` | Cycle duration in ms |
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
    <div class="ld-orbit" aria-hidden="true" style="--ld-size: 16px;">
  <div class="ld-orbit-dot"></div>
  <div class="ld-orbit-track ld-orbit-spin"></div>
</div>
  </span>
</button>
```
