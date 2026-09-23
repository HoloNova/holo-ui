# Atom (ld-atom)

**Category**: orbital  
**Source**: https://loading.dev/  
**License**: MIT License  
**Default Duration**: `1000ms`  
**Recommended Size**: `24px - 48px`  
**Tags**: atom, orbital, quantum, physics, ai-deep-thinking, neural

---

## 1. Physical Metaphor & Visual Signature
Rutherford atom model with quantum orbital rings in 3D perspective.

---

## 2. Decision Matrix

| Dimension | Guidance |
| :--- | :--- |
| **When to Use** | Deep neural reasoning, scientific simulations, complex quantum/AI computation |
| **When NOT to Use** | Simple login button submission |

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





---

## 5. Usage Example

```html
<!-- Inline in a button -->
<button style="display: inline-flex; align-items: center; gap: 8px;">
  <span>Processing</span>
  <span style="display: inline-flex; align-items: center;">
    <div class="ld-atom" aria-hidden="true" style="--ld-size: 16px;">
  <div class="ld-atom-shell"></div>
  <div class="ld-atom-orbit" style="--ld-atom-tilt: 0deg;">
    <div class="ld-atom-spin" style="--ld-step: 0;"><div class="ld-atom-ring"></div></div>
  </div>
  <div class="ld-atom-orbit" style="--ld-atom-tilt: 60deg;">
    <div class="ld-atom-spin" style="--ld-step: 1;"><div class="ld-atom-ring"></div></div>
  </div>
  <div class="ld-atom-orbit" style="--ld-atom-tilt: 120deg;">
    <div class="ld-atom-spin" style="--ld-step: 2;"><div class="ld-atom-ring"></div></div>
  </div>
</div>
  </span>
</button>
```
