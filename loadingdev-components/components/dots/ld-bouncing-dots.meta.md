# Bouncing dots (ld-bouncing-dots)

**Category**: dots  
**Source**: https://loading.dev/  
**License**: MIT License  
**Default Duration**: `500ms`  
**Recommended Size**: `16px - 28px`  
**Tags**: dots, bouncing, typing, chat, message, conversational

---

## 1. Physical Metaphor & Visual Signature
Conversational typing bubble activity.

---

## 2. Decision Matrix

| Dimension | Guidance |
| :--- | :--- |
| **When to Use** | Chat bubble typing indicator ('Agent is typing...'), comment drafting, live messaging |
| **When NOT to Use** | Vertical-height-constrained table rows where bounce clips cells |

---

## 3. Dependencies
- `shared/base.css` (Provides keyframe animations, CSS variable bindings, and `prefers-reduced-motion` support)
- Zero external runtime JavaScript required

---

## 4. Customization Variables

| Variable / Class | Default | Description |
| :--- | :--- | :--- |
| `--ld-size` | `20px` | Dimension in pixels |
| `--ld-duration` | `500ms` | Cycle duration in ms |
| `--ld-play-state` | `running` | Set to `paused` to freeze animation |
| `color` | `currentColor` | Inherits parent typography color |






---

## 5. Usage Example

```html
<!-- Inline in a button -->
<button style="display: inline-flex; align-items: center; gap: 8px;">
  <span>Processing</span>
  <span style="display: inline-flex; align-items: center;">
    <div class="ld-bouncing-dots" aria-hidden="true" style="--ld-size: 16px;">
  <div class="ld-bouncing-dots-dot" style="--ld-step: 0;"></div>
  <div class="ld-bouncing-dots-dot" style="--ld-step: 1;"></div>
  <div class="ld-bouncing-dots-dot" style="--ld-step: 2;"></div>
</div>
  </span>
</button>
```
