# Horizon Theme Toggle (horizon)

**Category**: setting  
**Source**: [toggles.dev](https://toggles.dev/) / [@theme-toggles](https://github.com/alfiejones/theme-toggles)  
**License**: MIT License  
**Default Duration**: `400ms`  
**Recommended Size**: `20px - 32px` (`1.25rem - 2rem`)  
**Chinese Name**: 地平线日夜切换  
**Keywords**: 地平线日夜切换, 日出日落, 极简主题切换, 暗黑模式切换, horizon-toggle, sunset-switch, sunrise-toggle

---

## 1. Physical Metaphor & Visual Signature
A natural dawn and dusk cycle with a horizontal dividing plane simulating sunrise and sunset.

---

## 2. Decision Matrix

| Dimension | Guidance |
| :--- | :--- |
| **When to Use** | Editorial blogs, lifestyle apps, travel platforms, and reading applications. |
| **When NOT to Use** | High-density technical code diff viewers. |

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
<svg width="1em" height="1em" viewBox="0 0 32 32" aria-hidden="true" fill="currentColor" style="--toggles-horizon--duration: 500ms">
      <defs>
        <clipPath id="toggles.dev-horizon-main-0">
          <path d="M0 0h32v29h-32z" />
        </clipPath>
      </defs>
      <path d="M30.7 29.9H1.3c-.7 0-1.3.5-1.3 1.1 0 .6.6 1 1.3 1h29.3c.7 0 1.3-.5 1.3-1.1.1-.5-.5-1-1.2-1z" />
      <g clip-path="url(#toggles.dev-horizon-main-0)">
        <path d="M16 8.8c-3.4 0-6.1 2.8-6.1 6.1s2.7 6.3 6.1 6.3 6.1-2.8 6.1-6.1-2.7-6.3-6.1-6.3zm13.3 11L26 15l3.3-4.8c.3-.5.1-1.1-.5-1.2l-5.7-1-1-5.7c-.1-.6-.8-.8-1.2-.5L16 5.1l-4.8-3.3c-.5-.4-1.2-.1-1.3.4L8.9 8 3.2 9c-.6.1-.8.8-.5 1.2L6 15l-3.3 4.8c-.3.5-.1 1.1.5 1.2l5.7 1 1 5.7c.1.6.8.8 1.2.5L16 25l4.8 3.3c.5.3 1.1.1 1.2-.5l1-5.7 5.7-1c.7-.1.9-.8.6-1.3zM16 22.5A7.6 7.6 0 0 1 8.3 15c0-4.2 3.5-7.5 7.7-7.5s7.7 3.4 7.7 7.5c0 4.2-3.4 7.5-7.7 7.5z" class="motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-horizon--duration) motion-safe:toggles-dev--[transition-timing-function:cubic-bezier(0,0,0.15,1)] dark:toggles-dev--translate-y-[50%]" />
      </g>
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
<svg width="1em" height="1em" viewBox="0 0 32 32" aria-hidden="true" fill="currentColor" style="--toggles-horizon--duration: 500ms">
      <defs>
        <clipPath id="toggles.dev-horizon-main-0">
          <path d="M0 0h32v29h-32z" />
        </clipPath>
      </defs>
      <path d="M30.7 29.9H1.3c-.7 0-1.3.5-1.3 1.1 0 .6.6 1 1.3 1h29.3c.7 0 1.3-.5 1.3-1.1.1-.5-.5-1-1.2-1z" />
      <g clip-path="url(#toggles.dev-horizon-main-0)">
        <path d="M16 8.8c-3.4 0-6.1 2.8-6.1 6.1s2.7 6.3 6.1 6.3 6.1-2.8 6.1-6.1-2.7-6.3-6.1-6.3zm13.3 11L26 15l3.3-4.8c.3-.5.1-1.1-.5-1.2l-5.7-1-1-5.7c-.1-.6-.8-.8-1.2-.5L16 5.1l-4.8-3.3c-.5-.4-1.2-.1-1.3.4L8.9 8 3.2 9c-.6.1-.8.8-.5 1.2L6 15l-3.3 4.8c-.3.5-.1 1.1.5 1.2l5.7 1 1 5.7c.1.6.8.8 1.2.5L16 25l4.8 3.3c.5.3 1.1.1 1.2-.5l1-5.7 5.7-1c.7-.1.9-.8.6-1.3zM16 22.5A7.6 7.6 0 0 1 8.3 15c0-4.2 3.5-7.5 7.7-7.5s7.7 3.4 7.7 7.5c0 4.2-3.4 7.5-7.7 7.5z" class="motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-horizon--duration) motion-safe:toggles-dev--[transition-timing-function:cubic-bezier(0,0,0.15,1)] dark:toggles-dev--translate-y-[50%]" />
      </g>
    </svg>
</button>
```

### React / Next.js
```tsx
import "themetoggle-components/shared/base.css";
import { useState } from "react";

export function HorizonToggle() {
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
<svg width="1em" height="1em" viewBox="0 0 32 32" aria-hidden="true" fill="currentColor" style="--toggles-horizon--duration: 500ms">
      <defs>
        <clipPath id="toggles.dev-horizon-main-0">
          <path d="M0 0h32v29h-32z" />
        </clipPath>
      </defs>
      <path d="M30.7 29.9H1.3c-.7 0-1.3.5-1.3 1.1 0 .6.6 1 1.3 1h29.3c.7 0 1.3-.5 1.3-1.1.1-.5-.5-1-1.2-1z" />
      <g clip-path="url(#toggles.dev-horizon-main-0)">
        <path d="M16 8.8c-3.4 0-6.1 2.8-6.1 6.1s2.7 6.3 6.1 6.3 6.1-2.8 6.1-6.1-2.7-6.3-6.1-6.3zm13.3 11L26 15l3.3-4.8c.3-.5.1-1.1-.5-1.2l-5.7-1-1-5.7c-.1-.6-.8-.8-1.2-.5L16 5.1l-4.8-3.3c-.5-.4-1.2-.1-1.3.4L8.9 8 3.2 9c-.6.1-.8.8-.5 1.2L6 15l-3.3 4.8c-.3.5-.1 1.1.5 1.2l5.7 1 1 5.7c.1.6.8.8 1.2.5L16 25l4.8 3.3c.5.3 1.1.1 1.2-.5l1-5.7 5.7-1c.7-.1.9-.8.6-1.3zM16 22.5A7.6 7.6 0 0 1 8.3 15c0-4.2 3.5-7.5 7.7-7.5s7.7 3.4 7.7 7.5c0 4.2-3.4 7.5-7.7 7.5z" class="motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-horizon--duration) motion-safe:toggles-dev--[transition-timing-function:cubic-bezier(0,0,0.15,1)] dark:toggles-dev--translate-y-[50%]" />
      </g>
    </svg>
    </button>
  );
}
```
