# Gather (ld-gather)

**Category**: geometric  
**Source**: https://loading.dev/  
**License**: MIT License  
**Default Duration**: `1600ms`  
**Recommended Size**: `20px - 36px`  
**Tags**: gather, docking, bundle, package, assembly, compile

---

## 1. Physical Metaphor & Visual Signature
Mechanical docking, packaging, and module assembly.

---

## 2. Decision Matrix

| Dimension | Guidance |
| :--- | :--- |
| **When to Use** | Module bundling (Webpack/Vite), package resolution, dependency build stage |
| **When NOT to Use** | Single continuous streaming data feeds |

---

## 3. Dependencies
- `shared/base.css` (Provides keyframe animations, CSS variable bindings, and `prefers-reduced-motion` support)
- Zero external runtime JavaScript required

---

## 4. Customization Variables

| Variable / Class | Default | Description |
| :--- | :--- | :--- |
| `--ld-size` | `20px` | Dimension in pixels |
| `--ld-duration` | `1600ms` | Cycle duration in ms |
| `--ld-play-state` | `running` | Set to `paused` to freeze animation |
| `color` | `currentColor` | Inherits parent typography color |






---

## 5. Usage Example

```html
<!-- Inline in a button -->
<button style="display: inline-flex; align-items: center; gap: 8px;">
  <span>Processing</span>
  <span style="display: inline-flex; align-items: center;">
    <div class="ld-gather" aria-hidden="true" style="--ld-size: 16px;">
  <div class="ld-gather-group">
    <div class="ld-gather-block" style="--ld-gather-x: 1; --ld-gather-y: 1;"></div>
    <div class="ld-gather-block" style="--ld-gather-x: -1; --ld-gather-y: 1;"></div>
    <div class="ld-gather-block" style="--ld-gather-x: 1; --ld-gather-y: -1;"></div>
    <div class="ld-gather-block" style="--ld-gather-x: -1; --ld-gather-y: -1;"></div>
  </div>
</div>
  </span>
</button>
```
