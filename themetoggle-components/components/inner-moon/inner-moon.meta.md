# Inner Moon Theme Toggle (inner-moon)

**Category**: setting  
**Source**: [toggles.dev](https://toggles.dev/) / [@theme-toggles](https://github.com/alfiejones/theme-toggles)  
**License**: MIT License  
**Default Duration**: `500ms`  
**Recommended Size**: `20px - 32px` (`1.25rem - 2rem`)  
**Chinese Name**: 内核月亮切换  
**Keywords**: 内核月亮切换, 月相变化, 极简主题切换, 暗黑模式切换, inner-moon-toggle, moon-phase-switch, lunar-toggle

---

## 1. Physical Metaphor & Visual Signature
An organic shadow that creeps across the internal face of the disc, mimicking monthly lunar phases.

---

## 2. Decision Matrix

| Dimension | Guidance |
| :--- | :--- |
| **When to Use** | Productivity workspaces, Linear/Raycast style dark themes, and developer CLI tools. |
| **When NOT to Use** | Complex checkout or critical action gates. |

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
<svg width="1em" height="1em" viewBox="0 0 32 32" aria-hidden="true" fill="currentColor" style="--toggles-inner-moon--duration: 500ms">
      <path d="M27.5 11.5v-7h-7L16 0l-4.5 4.5h-7v7L0 16l4.5 4.5v7h7L16 32l4.5-4.5h7v-7L32 16l-4.5-4.5zM16 25.4a9.39 9.39 0 1 1 0-18.8 9.39 9.39 0 1 1 0 18.8z" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-inner-moon--duration) motion-safe:toggles-dev--[transition-timing-function:cubic-bezier(0,0,0.15,1.25)] dark:toggles-dev--rotate-180" />
      <circle cx="16" cy="16" r="7.6" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--[transition-timing-function:cubic-bezier(0.4,0,0.2,1)] motion-safe:toggles-dev--[transition-duration:calc(var(--toggles-inner-moon--duration)/1.5)] dark:toggles-dev--translate-x-[15%]" />
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
<svg width="1em" height="1em" viewBox="0 0 32 32" aria-hidden="true" fill="currentColor" style="--toggles-inner-moon--duration: 500ms">
      <path d="M27.5 11.5v-7h-7L16 0l-4.5 4.5h-7v7L0 16l4.5 4.5v7h7L16 32l4.5-4.5h7v-7L32 16l-4.5-4.5zM16 25.4a9.39 9.39 0 1 1 0-18.8 9.39 9.39 0 1 1 0 18.8z" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-inner-moon--duration) motion-safe:toggles-dev--[transition-timing-function:cubic-bezier(0,0,0.15,1.25)] dark:toggles-dev--rotate-180" />
      <circle cx="16" cy="16" r="7.6" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--[transition-timing-function:cubic-bezier(0.4,0,0.2,1)] motion-safe:toggles-dev--[transition-duration:calc(var(--toggles-inner-moon--duration)/1.5)] dark:toggles-dev--translate-x-[15%]" />
    </svg>
</button>
```

### React / Next.js
```tsx
import "themetoggle-components/shared/base.css";
import { useState } from "react";

export function InnerMoonToggle() {
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
<svg width="1em" height="1em" viewBox="0 0 32 32" aria-hidden="true" fill="currentColor" style="--toggles-inner-moon--duration: 500ms">
      <path d="M27.5 11.5v-7h-7L16 0l-4.5 4.5h-7v7L0 16l4.5 4.5v7h7L16 32l4.5-4.5h7v-7L32 16l-4.5-4.5zM16 25.4a9.39 9.39 0 1 1 0-18.8 9.39 9.39 0 1 1 0 18.8z" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-inner-moon--duration) motion-safe:toggles-dev--[transition-timing-function:cubic-bezier(0,0,0.15,1.25)] dark:toggles-dev--rotate-180" />
      <circle cx="16" cy="16" r="7.6" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--[transition-timing-function:cubic-bezier(0.4,0,0.2,1)] motion-safe:toggles-dev--[transition-duration:calc(var(--toggles-inner-moon--duration)/1.5)] dark:toggles-dev--translate-x-[15%]" />
    </svg>
    </button>
  );
}
```
