# Expand Theme Toggle (expand)

**Category**: setting  
**Source**: [toggles.dev](https://toggles.dev/) / [@theme-toggles](https://github.com/alfiejones/theme-toggles)  
**License**: MIT License  
**Default Duration**: `500ms`  
**Recommended Size**: `20px - 32px` (`1.25rem - 2rem`)  
**Chinese Name**: 膨胀日夜切换  
**Keywords**: 膨胀日夜切换, 径向展开, 极简主题切换, 暗黑模式切换, expand-toggle, radial-toggle, pulse-theme-switch

---

## 1. Physical Metaphor & Visual Signature
A pulsing celestial core that expands outward in scale before snapping into a serene night moon.

---

## 2. Decision Matrix

| Dimension | Guidance |
| :--- | :--- |
| **When to Use** | Prominent top navigation action buttons, interactive hero headers, and landing touchpoints. |
| **When NOT to Use** | Ultra-dense data tables. |

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
<svg width="1em" height="1em" viewBox="0 0 32 32" aria-hidden="true" fill="currentColor" style="--toggles-expand--duration: 500ms">
      <defs>
        <clipPath id="toggles.dev-expand-main-0">
          <path d="M0-11h25a1 1 0 0017 13v30H0Z" class="motion-safe:toggles-dev--transition-[d,translate] motion-safe:toggles-dev--[transition-duration:calc(var(--toggles-expand--duration)_*_0.6)] motion-safe:toggles-dev--[transition-timing-function:cubic-bezier(0,0,0.5,1)] motion-safe:toggles-dev--[transition-delay:0s] dark:toggles-dev--[d:path('M0_0h15A1_1_0_0032_15v17H0Z')] dark:not-supports-[d:path('M0_0')]:toggles-dev---translate-x-[5px] dark:not-supports-[d:path('M0_0')]:toggles-dev--translate-y-[11px] motion-safe:dark:toggles-dev--[transition-timing-function:cubic-bezier(0,0,0,1.25)] motion-safe:dark:toggles-dev--[transition-delay:calc(var(--toggles-expand--duration)_*_0.4)]" />
        </clipPath>
      </defs>
      <g clip-path="url(#toggles.dev-expand-main-0)">
        <circle cx="16" cy="16" r="8.4" class="toggles-dev--[transform-origin:center] motion-safe:toggles-dev--[transition:transform_calc(var(--toggles-expand--duration)_*_0.65)_cubic-bezier(0,0,0,1.25)_calc(var(--toggles-expand--duration)_*_0.35)] dark:toggles-dev--[transform:scale(1.6)] motion-safe:dark:toggles-dev--[transition:transform_calc(var(--toggles-expand--duration)_*_0.65)_cubic-bezier(0,0,0,1.25)]" />
        <path d="M18.3 3.2c0 1.3-1 2.3-2.3 2.3s-2.3-1-2.3-2.3S14.7.9 16 .9s2.3 1 2.3 2.3zm-4.6 25.6c0-1.3 1-2.3 2.3-2.3s2.3 1 2.3 2.3-1 2.3-2.3 2.3-2.3-1-2.3-2.3zm15.1-10.5c-1.3 0-2.3-1-2.3-2.3s1-2.3 2.3-2.3 2.3 1 2.3 2.3-1 2.3-2.3 2.3zM3.2 13.7c1.3 0 2.3 1 2.3 2.3s-1 2.3-2.3 2.3S.9 17.3.9 16s1-2.3 2.3-2.3zm5.8-7C9 7.9 7.9 9 6.7 9S4.4 8 4.4 6.7s1-2.3 2.3-2.3S9 5.4 9 6.7zm16.3 21c-1.3 0-2.3-1-2.3-2.3s1-2.3 2.3-2.3 2.3 1 2.3 2.3-1 2.3-2.3 2.3zm2.4-21c0 1.3-1 2.3-2.3 2.3S23 7.9 23 6.7s1-2.3 2.3-2.3 2.4 1 2.4 2.3zM6.7 23C8 23 9 24 9 25.3s-1 2.3-2.3 2.3-2.3-1-2.3-2.3 1-2.3 2.3-2.3z" class="toggles-dev--[transform-origin:center] motion-safe:toggles-dev--[transition:transform_calc(var(--toggles-expand--duration)_*_0.65)_cubic-bezier(0,0,0,1.25)_calc(var(--toggles-expand--duration)_*_0.35)] dark:toggles-dev--[transform:scale(0.75)] motion-safe:dark:toggles-dev--[transition:transform_calc(var(--toggles-expand--duration)_*_0.65)_cubic-bezier(0,0,0,1.25)]" />
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
<svg width="1em" height="1em" viewBox="0 0 32 32" aria-hidden="true" fill="currentColor" style="--toggles-expand--duration: 500ms">
      <defs>
        <clipPath id="toggles.dev-expand-main-0">
          <path d="M0-11h25a1 1 0 0017 13v30H0Z" class="motion-safe:toggles-dev--transition-[d,translate] motion-safe:toggles-dev--[transition-duration:calc(var(--toggles-expand--duration)_*_0.6)] motion-safe:toggles-dev--[transition-timing-function:cubic-bezier(0,0,0.5,1)] motion-safe:toggles-dev--[transition-delay:0s] dark:toggles-dev--[d:path('M0_0h15A1_1_0_0032_15v17H0Z')] dark:not-supports-[d:path('M0_0')]:toggles-dev---translate-x-[5px] dark:not-supports-[d:path('M0_0')]:toggles-dev--translate-y-[11px] motion-safe:dark:toggles-dev--[transition-timing-function:cubic-bezier(0,0,0,1.25)] motion-safe:dark:toggles-dev--[transition-delay:calc(var(--toggles-expand--duration)_*_0.4)]" />
        </clipPath>
      </defs>
      <g clip-path="url(#toggles.dev-expand-main-0)">
        <circle cx="16" cy="16" r="8.4" class="toggles-dev--[transform-origin:center] motion-safe:toggles-dev--[transition:transform_calc(var(--toggles-expand--duration)_*_0.65)_cubic-bezier(0,0,0,1.25)_calc(var(--toggles-expand--duration)_*_0.35)] dark:toggles-dev--[transform:scale(1.6)] motion-safe:dark:toggles-dev--[transition:transform_calc(var(--toggles-expand--duration)_*_0.65)_cubic-bezier(0,0,0,1.25)]" />
        <path d="M18.3 3.2c0 1.3-1 2.3-2.3 2.3s-2.3-1-2.3-2.3S14.7.9 16 .9s2.3 1 2.3 2.3zm-4.6 25.6c0-1.3 1-2.3 2.3-2.3s2.3 1 2.3 2.3-1 2.3-2.3 2.3-2.3-1-2.3-2.3zm15.1-10.5c-1.3 0-2.3-1-2.3-2.3s1-2.3 2.3-2.3 2.3 1 2.3 2.3-1 2.3-2.3 2.3zM3.2 13.7c1.3 0 2.3 1 2.3 2.3s-1 2.3-2.3 2.3S.9 17.3.9 16s1-2.3 2.3-2.3zm5.8-7C9 7.9 7.9 9 6.7 9S4.4 8 4.4 6.7s1-2.3 2.3-2.3S9 5.4 9 6.7zm16.3 21c-1.3 0-2.3-1-2.3-2.3s1-2.3 2.3-2.3 2.3 1 2.3 2.3-1 2.3-2.3 2.3zm2.4-21c0 1.3-1 2.3-2.3 2.3S23 7.9 23 6.7s1-2.3 2.3-2.3 2.4 1 2.4 2.3zM6.7 23C8 23 9 24 9 25.3s-1 2.3-2.3 2.3-2.3-1-2.3-2.3 1-2.3 2.3-2.3z" class="toggles-dev--[transform-origin:center] motion-safe:toggles-dev--[transition:transform_calc(var(--toggles-expand--duration)_*_0.65)_cubic-bezier(0,0,0,1.25)_calc(var(--toggles-expand--duration)_*_0.35)] dark:toggles-dev--[transform:scale(0.75)] motion-safe:dark:toggles-dev--[transition:transform_calc(var(--toggles-expand--duration)_*_0.65)_cubic-bezier(0,0,0,1.25)]" />
      </g>
    </svg>
</button>
```

### React / Next.js
```tsx
import "themetoggle-components/shared/base.css";
import { useState } from "react";

export function ExpandToggle() {
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
<svg width="1em" height="1em" viewBox="0 0 32 32" aria-hidden="true" fill="currentColor" style="--toggles-expand--duration: 500ms">
      <defs>
        <clipPath id="toggles.dev-expand-main-0">
          <path d="M0-11h25a1 1 0 0017 13v30H0Z" class="motion-safe:toggles-dev--transition-[d,translate] motion-safe:toggles-dev--[transition-duration:calc(var(--toggles-expand--duration)_*_0.6)] motion-safe:toggles-dev--[transition-timing-function:cubic-bezier(0,0,0.5,1)] motion-safe:toggles-dev--[transition-delay:0s] dark:toggles-dev--[d:path('M0_0h15A1_1_0_0032_15v17H0Z')] dark:not-supports-[d:path('M0_0')]:toggles-dev---translate-x-[5px] dark:not-supports-[d:path('M0_0')]:toggles-dev--translate-y-[11px] motion-safe:dark:toggles-dev--[transition-timing-function:cubic-bezier(0,0,0,1.25)] motion-safe:dark:toggles-dev--[transition-delay:calc(var(--toggles-expand--duration)_*_0.4)]" />
        </clipPath>
      </defs>
      <g clip-path="url(#toggles.dev-expand-main-0)">
        <circle cx="16" cy="16" r="8.4" class="toggles-dev--[transform-origin:center] motion-safe:toggles-dev--[transition:transform_calc(var(--toggles-expand--duration)_*_0.65)_cubic-bezier(0,0,0,1.25)_calc(var(--toggles-expand--duration)_*_0.35)] dark:toggles-dev--[transform:scale(1.6)] motion-safe:dark:toggles-dev--[transition:transform_calc(var(--toggles-expand--duration)_*_0.65)_cubic-bezier(0,0,0,1.25)]" />
        <path d="M18.3 3.2c0 1.3-1 2.3-2.3 2.3s-2.3-1-2.3-2.3S14.7.9 16 .9s2.3 1 2.3 2.3zm-4.6 25.6c0-1.3 1-2.3 2.3-2.3s2.3 1 2.3 2.3-1 2.3-2.3 2.3-2.3-1-2.3-2.3zm15.1-10.5c-1.3 0-2.3-1-2.3-2.3s1-2.3 2.3-2.3 2.3 1 2.3 2.3-1 2.3-2.3 2.3zM3.2 13.7c1.3 0 2.3 1 2.3 2.3s-1 2.3-2.3 2.3S.9 17.3.9 16s1-2.3 2.3-2.3zm5.8-7C9 7.9 7.9 9 6.7 9S4.4 8 4.4 6.7s1-2.3 2.3-2.3S9 5.4 9 6.7zm16.3 21c-1.3 0-2.3-1-2.3-2.3s1-2.3 2.3-2.3 2.3 1 2.3 2.3-1 2.3-2.3 2.3zm2.4-21c0 1.3-1 2.3-2.3 2.3S23 7.9 23 6.7s1-2.3 2.3-2.3 2.4 1 2.4 2.3zM6.7 23C8 23 9 24 9 25.3s-1 2.3-2.3 2.3-2.3-1-2.3-2.3 1-2.3 2.3-2.3z" class="toggles-dev--[transform-origin:center] motion-safe:toggles-dev--[transition:transform_calc(var(--toggles-expand--duration)_*_0.65)_cubic-bezier(0,0,0,1.25)_calc(var(--toggles-expand--duration)_*_0.35)] dark:toggles-dev--[transform:scale(0.75)] motion-safe:dark:toggles-dev--[transition:transform_calc(var(--toggles-expand--duration)_*_0.65)_cubic-bezier(0,0,0,1.25)]" />
      </g>
    </svg>
    </button>
  );
}
```
