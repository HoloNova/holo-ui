# Eclipse Theme Toggle (eclipse)

**Category**: setting  
**Source**: [toggles.dev](https://toggles.dev/) / [@theme-toggles](https://github.com/alfiejones/theme-toggles)  
**License**: MIT License  
**Default Duration**: `500ms`  
**Recommended Size**: `20px - 32px` (`1.25rem - 2rem`)  
**Chinese Name**: 日蚀切换  
**Keywords**: 日蚀切换, 月食主题, 极简主题切换, 暗黑模式切换, eclipse-toggle, lunar-eclipse, solar-toggle

---

## 1. Physical Metaphor & Visual Signature
An astronomical eclipse where one heavenly body passes directly in front of another, casting a sharp shadow.

---

## 2. Decision Matrix

| Dimension | Guidance |
| :--- | :--- |
| **When to Use** | Astronomy, dark-first tech products, creative portfolios, and futuristic web portals. |
| **When NOT to Use** | Standard corporate business forms. |

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
<svg width="1em" height="1em" viewBox="0 0 32 32" aria-hidden="true" fill="currentColor" style="--toggles-eclipse--duration: 500ms">
      <defs>
        <clipPath id="toggles.dev-eclipse-main-0">
          <path d="M0 0h64v32h-64zm38 16a1 1 0 0020 0 1 1 0 00-20 0" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-[d,translate] motion-safe:toggles-dev--[transition-duration:var(--toggles-eclipse--duration)] motion-safe:toggles-dev--[transition-timing-function:cubic-bezier(0,0,0.05,1.15)] motion-safe:toggles-dev--[transition-delay:0s] dark:toggles-dev--[d:path('M-16_-16h64v64h-64zm22_32a1_1_0_0020_0_1_1_0_00-20_0')] dark:not-supports-[d:path('M0_0')]:toggles-dev---translate-x-[32px] motion-safe:dark:toggles-dev--[transition-duration:calc(var(--toggles-eclipse--duration)_*_0.8)] motion-safe:dark:toggles-dev--[transition-delay:calc(var(--toggles-eclipse--duration)_*_0.2)]" />
        </clipPath>
      </defs>
      <g clip-path="url(#toggles.dev-eclipse-main-0)">
        <circle cx="16" cy="16" r="16" class="toggles-dev--[transform-origin:center] motion-safe:toggles-dev--[transition-property:transform] motion-safe:toggles-dev--[transition-duration:var(--toggles-eclipse--duration)] motion-safe:toggles-dev--[transition-timing-function:cubic-bezier(0,0,0.05,1.15)]" />
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
<svg width="1em" height="1em" viewBox="0 0 32 32" aria-hidden="true" fill="currentColor" style="--toggles-eclipse--duration: 500ms">
      <defs>
        <clipPath id="toggles.dev-eclipse-main-0">
          <path d="M0 0h64v32h-64zm38 16a1 1 0 0020 0 1 1 0 00-20 0" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-[d,translate] motion-safe:toggles-dev--[transition-duration:var(--toggles-eclipse--duration)] motion-safe:toggles-dev--[transition-timing-function:cubic-bezier(0,0,0.05,1.15)] motion-safe:toggles-dev--[transition-delay:0s] dark:toggles-dev--[d:path('M-16_-16h64v64h-64zm22_32a1_1_0_0020_0_1_1_0_00-20_0')] dark:not-supports-[d:path('M0_0')]:toggles-dev---translate-x-[32px] motion-safe:dark:toggles-dev--[transition-duration:calc(var(--toggles-eclipse--duration)_*_0.8)] motion-safe:dark:toggles-dev--[transition-delay:calc(var(--toggles-eclipse--duration)_*_0.2)]" />
        </clipPath>
      </defs>
      <g clip-path="url(#toggles.dev-eclipse-main-0)">
        <circle cx="16" cy="16" r="16" class="toggles-dev--[transform-origin:center] motion-safe:toggles-dev--[transition-property:transform] motion-safe:toggles-dev--[transition-duration:var(--toggles-eclipse--duration)] motion-safe:toggles-dev--[transition-timing-function:cubic-bezier(0,0,0.05,1.15)]" />
      </g>
    </svg>
</button>
```

### React / Next.js
```tsx
import "themetoggle-components/shared/base.css";
import { useState } from "react";

export function EclipseToggle() {
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
<svg width="1em" height="1em" viewBox="0 0 32 32" aria-hidden="true" fill="currentColor" style="--toggles-eclipse--duration: 500ms">
      <defs>
        <clipPath id="toggles.dev-eclipse-main-0">
          <path d="M0 0h64v32h-64zm38 16a1 1 0 0020 0 1 1 0 00-20 0" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-[d,translate] motion-safe:toggles-dev--[transition-duration:var(--toggles-eclipse--duration)] motion-safe:toggles-dev--[transition-timing-function:cubic-bezier(0,0,0.05,1.15)] motion-safe:toggles-dev--[transition-delay:0s] dark:toggles-dev--[d:path('M-16_-16h64v64h-64zm22_32a1_1_0_0020_0_1_1_0_00-20_0')] dark:not-supports-[d:path('M0_0')]:toggles-dev---translate-x-[32px] motion-safe:dark:toggles-dev--[transition-duration:calc(var(--toggles-eclipse--duration)_*_0.8)] motion-safe:dark:toggles-dev--[transition-delay:calc(var(--toggles-eclipse--duration)_*_0.2)]" />
        </clipPath>
      </defs>
      <g clip-path="url(#toggles.dev-eclipse-main-0)">
        <circle cx="16" cy="16" r="16" class="toggles-dev--[transform-origin:center] motion-safe:toggles-dev--[transition-property:transform] motion-safe:toggles-dev--[transition-duration:var(--toggles-eclipse--duration)] motion-safe:toggles-dev--[transition-timing-function:cubic-bezier(0,0,0.05,1.15)]" />
      </g>
    </svg>
    </button>
  );
}
```
