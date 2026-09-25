# Simple Theme Toggle (simple)

**Category**: setting  
**Source**: [toggles.dev](https://toggles.dev/) / [@theme-toggles](https://github.com/alfiejones/theme-toggles)  
**License**: MIT License  
**Default Duration**: `500ms`  
**Recommended Size**: `20px - 32px` (`1.25rem - 2rem`)  
**Chinese Name**: 极简纯粹切换  
**Keywords**: 极简纯粹切换, 微型日夜, 极简主题切换, 暗黑模式切换, simple-toggle, clean-theme-switch, minimal-day-night

---

## 1. Physical Metaphor & Visual Signature
The simplest possible vector transformation: a radiant circle that seamlessly contracts into a moon crescent.

---

## 2. Decision Matrix

| Dimension | Guidance |
| :--- | :--- |
| **When to Use** | Everyday minimalist websites, personal portfolios, blogs, and documentation pages. |
| **When NOT to Use** | Complex multi-branch settings menus. |

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
<svg width="1em" height="1em" viewBox="0 0 32 32" aria-hidden="true" fill="currentColor" style="--toggles-simple--duration: 500ms">
      <defs>
        <clipPath id="toggles.dev-simple-main-0">
          <path d="M0-5h55v37h-55zm32 12a1 1 0 0025 0 1 1 0 00-25 0" class="motion-safe:toggles-dev--transition-[d,translate] motion-safe:toggles-dev--duration-(--toggles-simple--duration) motion-safe:toggles-dev--[transition-timing-function:cubic-bezier(0,0,0.15,1.25)] dark:toggles-dev--[d:path('M-18-1h55v37h-55zm32_12a1_1_0_0025_0_1_1_0_00-25_0')] dark:not-supports-[d:path('M0_0')]:toggles-dev---translate-x-[19px] dark:not-supports-[d:path('M0_0')]:toggles-dev--translate-y-[5px]" />
        </clipPath>
      </defs>
      <g clip-path="url(#toggles.dev-simple-main-0)">
        <circle cx="16" cy="16" r="15" />
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
<svg width="1em" height="1em" viewBox="0 0 32 32" aria-hidden="true" fill="currentColor" style="--toggles-simple--duration: 500ms">
      <defs>
        <clipPath id="toggles.dev-simple-main-0">
          <path d="M0-5h55v37h-55zm32 12a1 1 0 0025 0 1 1 0 00-25 0" class="motion-safe:toggles-dev--transition-[d,translate] motion-safe:toggles-dev--duration-(--toggles-simple--duration) motion-safe:toggles-dev--[transition-timing-function:cubic-bezier(0,0,0.15,1.25)] dark:toggles-dev--[d:path('M-18-1h55v37h-55zm32_12a1_1_0_0025_0_1_1_0_00-25_0')] dark:not-supports-[d:path('M0_0')]:toggles-dev---translate-x-[19px] dark:not-supports-[d:path('M0_0')]:toggles-dev--translate-y-[5px]" />
        </clipPath>
      </defs>
      <g clip-path="url(#toggles.dev-simple-main-0)">
        <circle cx="16" cy="16" r="15" />
      </g>
    </svg>
</button>
```

### React / Next.js
```tsx
import "themetoggle-components/shared/base.css";
import { useState } from "react";

export function SimpleToggle() {
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
<svg width="1em" height="1em" viewBox="0 0 32 32" aria-hidden="true" fill="currentColor" style="--toggles-simple--duration: 500ms">
      <defs>
        <clipPath id="toggles.dev-simple-main-0">
          <path d="M0-5h55v37h-55zm32 12a1 1 0 0025 0 1 1 0 00-25 0" class="motion-safe:toggles-dev--transition-[d,translate] motion-safe:toggles-dev--duration-(--toggles-simple--duration) motion-safe:toggles-dev--[transition-timing-function:cubic-bezier(0,0,0.15,1.25)] dark:toggles-dev--[d:path('M-18-1h55v37h-55zm32_12a1_1_0_0025_0_1_1_0_00-25_0')] dark:not-supports-[d:path('M0_0')]:toggles-dev---translate-x-[19px] dark:not-supports-[d:path('M0_0')]:toggles-dev--translate-y-[5px]" />
        </clipPath>
      </defs>
      <g clip-path="url(#toggles.dev-simple-main-0)">
        <circle cx="16" cy="16" r="15" />
      </g>
    </svg>
    </button>
  );
}
```
