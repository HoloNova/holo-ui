# Wave (ld-wave)

**Category**: wave-pulse  
**Source**: https://loading.dev/  
**License**: MIT License  
**Default Duration**: `900ms`  
**Recommended Size**: `16px - 32px`  
**Tags**: wave, equalizer, audio, voice-playback, speech, vu-meter

---

## 1. Physical Metaphor & Visual Signature
Graphic equalizer or sound VU meter.

---

## 2. Decision Matrix

| Dimension | Guidance |
| :--- | :--- |
| **When to Use** | Voice speech synthesis (TTS) playback, audio stream buffering, music playback activity |
| **When NOT to Use** | Non-acoustic data requests (saving profile, updating email) |

---

## 3. Dependencies
- `shared/base.css` (Provides keyframe animations, CSS variable bindings, and `prefers-reduced-motion` support)
- Zero external runtime JavaScript required

---

## 4. Customization Variables

| Variable / Class | Default | Description |
| :--- | :--- | :--- |
| `--ld-size` | `20px` | Dimension in pixels |
| `--ld-duration` | `900ms` | Cycle duration in ms |
| `--ld-play-state` | `running` | Set to `paused` to freeze animation |
| `color` | `currentColor` | Inherits parent typography color |




| `ld-wave-bar-bottom` | `center` | Bottom-aligned equalizer bar variant |

---

## 5. Usage Example

```html
<!-- Inline in a button -->
<button style="display: inline-flex; align-items: center; gap: 8px;">
  <span>Processing</span>
  <span style="display: inline-flex; align-items: center;">
    <div class="ld-wave" aria-hidden="true" style="--ld-size: 16px;">
  <div class="ld-wave-bar ld-wave-bar-center" style="--ld-step: 0;"></div>
  <div class="ld-wave-bar ld-wave-bar-center" style="--ld-step: 1;"></div>
  <div class="ld-wave-bar ld-wave-bar-center" style="--ld-step: 2;"></div>
  <div class="ld-wave-bar ld-wave-bar-center" style="--ld-step: 3;"></div>
  <div class="ld-wave-bar ld-wave-bar-center" style="--ld-step: 4;"></div>
</div>
  </span>
</button>
```
