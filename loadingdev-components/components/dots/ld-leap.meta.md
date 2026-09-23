# Leap (ld-leap)

**Category**: dots  
**Source**: https://loading.dev/  
**License**: MIT License  
**Default Duration**: `1800ms`  
**Recommended Size**: `18px - 28px`  
**Tags**: leap, queue, pipeline, staged, progress, hop

---

## 1. Physical Metaphor & Visual Signature
Leapfrog progression through a stage pipeline.

---

## 2. Decision Matrix

| Dimension | Guidance |
| :--- | :--- |
| **When to Use** | Job queue advancement, ingestion pipeline step transitions, background task workers |
| **When NOT to Use** | Instantaneous micro-feedback under 200ms |

---

## 3. Dependencies
- `shared/base.css` (Provides keyframe animations, CSS variable bindings, and `prefers-reduced-motion` support)
- Zero external runtime JavaScript required

---

## 4. Customization Variables

| Variable / Class | Default | Description |
| :--- | :--- | :--- |
| `--ld-size` | `20px` | Dimension in pixels |
| `--ld-duration` | `1800ms` | Cycle duration in ms |
| `--ld-play-state` | `running` | Set to `paused` to freeze animation |
| `color` | `currentColor` | Inherits parent typography color |






---

## 5. Usage Example

```html
<!-- Inline in a button -->
<button style="display: inline-flex; align-items: center; gap: 8px;">
  <span>Processing</span>
  <span style="display: inline-flex; align-items: center;">
    <div class="ld-leap" aria-hidden="true" style="--ld-size: 16px;">
  <div class="ld-leap-wrapper" style="--ld-step: 0;"><div class="ld-leap-dot"></div></div>
  <div class="ld-leap-wrapper" style="--ld-step: 1;"><div class="ld-leap-dot"></div></div>
  <div class="ld-leap-wrapper" style="--ld-step: 2;"><div class="ld-leap-dot"></div></div>
</div>
  </span>
</button>
```
