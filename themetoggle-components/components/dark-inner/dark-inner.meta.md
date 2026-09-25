# Dark Inner Theme Toggle (dark-inner)

**Category**: setting  
**Source**: [toggles.dev](https://toggles.dev/) / [@theme-toggles](https://github.com/alfiejones/theme-toggles)  
**License**: MIT License  
**Default Duration**: `400ms`  
**Recommended Size**: `20px - 32px` (`1.25rem - 2rem`)  
**Chinese Name**: 内旋日夜切换  
**Keywords**: 内旋日夜切换, 内向折叠, 极简主题切换, 暗黑模式切换, dark-inner-toggle, inward-toggle, compact-theme-switch

---

## 1. Physical Metaphor & Visual Signature
A glowing disk that rotates inward upon itself, creating a clean crescent cutout within the core silhouette.

---

## 2. Decision Matrix

| Dimension | Guidance |
| :--- | :--- |
| **When to Use** | Compact toolbars, floating navigation bars, and settings list items. |
| **When NOT to Use** | Playful landing pages requiring high-friction confirmation. |

---

## 3. 7-Dimension Feature Tokens

| Dimension | Value | Specification Context |
| :--- | :--- | :--- |
| **scale** | `compact` | Single standalone interactive toggle button widget (24x24 viewBox, scalable with font-size) |
| **placement** | `flow` | Standard document flow; comfortably embeds within headers, navbars, and setting cards |
| **interaction** | `control` | Discrete reversible theme setting switch without workflow blocking |
| **lifecycle** | `persistent` | Stable, persistent UI control in page headers or navigation |
| **motion** | `transition` | State-change SVG morphing and transform transitions with zero infinite loops |
| **category** | `setting` | Controls application color scheme and theme preference |
| **runtime** | `html-css` | Pure HTML/SVG and standard CSS variables; zero framework lock-in |

---

## 4. Dependencies
- `themetoggle-components/shared/base.css` (Provides keyframe transitions, clip-path morphing, and `prefers-reduced-motion` guards)
- Zero external runtime JavaScript required for rendering.

---

## 5. Usage Examples

### Pure HTML / Vanilla JS
```html
<!-- Link shared base stylesheet -->
<link rel="stylesheet" href="themetoggle-components/shared/base.css">

<!-- Self-toggling button (toggles .dark on the button) -->
<button
  type="button"
  class="theme-toggle"
  title="Toggle theme"
  aria-label="Toggle theme"
  aria-pressed="false"
  onclick="this.classList.toggle('dark'); this.setAttribute('aria-pressed', this.classList.contains('dark'))"
>
<svg width="1em" height="1em" viewBox="0 0 32 32" aria-hidden="true" fill="currentColor" style="--toggles-dark-inner--duration: 500ms">
      <path d="M16 9c3.9 0 7 3.1 7 7s-3.1 7-7 7" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-dark-inner--duration) motion-safe:toggles-dev--[transition-timing-function:ease] dark:toggles-dev--rotate-180" />
      <path d="M16 .5C7.4.5.5 7.4.5 16S7.4 31.5 16 31.5 31.5 24.6 31.5 16 24.6.5 16 .5zm0 28.1V23c-3.9 0-7-3.1-7-7s3.1-7 7-7V3.4C23 3.4 28.6 9 28.6 16S23 28.6 16 28.6z" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-dark-inner--duration) motion-safe:toggles-dev--[transition-timing-function:ease] dark:toggles-dev---rotate-180" />
    </svg>
</button>

<!-- Root-level theme toggle (toggles .dark on <html> for Tailwind / CSS frameworks) -->
<button
  type="button"
  class="theme-toggle"
  title="Toggle theme"
  aria-label="Toggle theme"
  onclick="document.documentElement.classList.toggle('dark'); this.setAttribute('aria-pressed', document.documentElement.classList.contains('dark'))"
>
<svg width="1em" height="1em" viewBox="0 0 32 32" aria-hidden="true" fill="currentColor" style="--toggles-dark-inner--duration: 500ms">
      <path d="M16 9c3.9 0 7 3.1 7 7s-3.1 7-7 7" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-dark-inner--duration) motion-safe:toggles-dev--[transition-timing-function:ease] dark:toggles-dev--rotate-180" />
      <path d="M16 .5C7.4.5.5 7.4.5 16S7.4 31.5 16 31.5 31.5 24.6 31.5 16 24.6.5 16 .5zm0 28.1V23c-3.9 0-7-3.1-7-7s3.1-7 7-7V3.4C23 3.4 28.6 9 28.6 16S23 28.6 16 28.6z" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-dark-inner--duration) motion-safe:toggles-dev--[transition-timing-function:ease] dark:toggles-dev---rotate-180" />
    </svg>
</button>
```

### React / Next.js
```tsx
import "themetoggle-components/shared/base.css";
import { useState } from "react";

export function DarkInnerToggle() {
  const [dark, setDark] = useState(false);

  return (
    <button
      type="button"
      className={`theme-toggle ${dark ? "dark" : ""}`}
      title="Toggle theme"
      aria-label="Toggle theme"
      aria-pressed={dark}
      onClick={() => setDark((prev) => !prev)}
    >
<svg width="1em" height="1em" viewBox="0 0 32 32" aria-hidden="true" fill="currentColor" style="--toggles-dark-inner--duration: 500ms">
      <path d="M16 9c3.9 0 7 3.1 7 7s-3.1 7-7 7" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-dark-inner--duration) motion-safe:toggles-dev--[transition-timing-function:ease] dark:toggles-dev--rotate-180" />
      <path d="M16 .5C7.4.5.5 7.4.5 16S7.4 31.5 16 31.5 31.5 24.6 31.5 16 24.6.5 16 .5zm0 28.1V23c-3.9 0-7-3.1-7-7s3.1-7 7-7V3.4C23 3.4 28.6 9 28.6 16S23 28.6 16 28.6z" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-dark-inner--duration) motion-safe:toggles-dev--[transition-timing-function:ease] dark:toggles-dev---rotate-180" />
    </svg>
    </button>
  );
}
```
