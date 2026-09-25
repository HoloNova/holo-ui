# Around Theme Toggle (around)

**Category**: setting  
**Source**: [toggles.dev](https://toggles.dev/) / [@theme-toggles](https://github.com/alfiejones/theme-toggles)  
**License**: MIT License  
**Default Duration**: `500ms`  
**Recommended Size**: `20px - 32px` (`1.25rem - 2rem`)  
**Chinese Name**: 环绕日夜切换  
**Keywords**: 环绕日夜切换, 轨道粒子, 极简主题切换, 暗黑模式切换, 昼夜切换, around-toggle, orbit-toggle, satellite-toggle, theme-toggle

---

## 1. Physical Metaphor & Visual Signature
A celestial body encircled by orbiting satellites that dissolve sequentially, while the central sphere rotates and transforms into a deep moon.

---

## 2. Decision Matrix

| Dimension | Guidance |
| :--- | :--- |
| **When to Use** | Tech SaaS headers, AI dashboards, and modern developer documentation toolbars. |
| **When NOT to Use** | Extremely compact 12px table cell status indicators. |

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
<svg width="1em" height="1em" viewBox="0 0 32 32" aria-hidden="true" fill="currentColor" style="--toggles-around--duration: 500ms">
      <defs>
        <clipPath id="toggles.dev-around-main-0" class="toggles-dev--[transform-origin:center] motion-safe:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.6)_ease] dark:toggles-dev--[transform:rotate(-90deg)] motion-safe:dark:toggles-dev--[transition:transform_var(--toggles-around--duration)_ease]">
          <path d="M0 0h42v30a1 1 0 00-16 13H0Z" class="motion-safe:toggles-dev--transition-[d,translate] motion-safe:toggles-dev--[transition-duration:calc(var(--toggles-around--duration)_*_0.6)] motion-safe:toggles-dev--[transition-timing-function:ease] dark:toggles-dev--[d:path('M-12_-14h42v30a1_1_0_00-16_13H0Z')] dark:not-supports-[d:path('M0_0')]:toggles-dev---translate-x-[12px] dark:not-supports-[d:path('M0_0')]:toggles-dev---translate-y-[14px] motion-safe:dark:toggles-dev--[transition-duration:var(--toggles-around--duration)]" />
        </clipPath>
      </defs>
      <g clip-path="url(#toggles.dev-around-main-0)">
        <circle cx="16" cy="16" r="8.4" class="toggles-dev--[transform-origin:center] motion-safe:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.6)_ease] dark:toggles-dev--[transform:scale(1.4)] motion-safe:dark:toggles-dev--[transition:transform_var(--toggles-around--duration)_ease]" />
        <g>
          <circle cx="16" cy="3.3" r="2.3" class="toggles-dev--[transform-origin:center] motion-safe:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.2)_ease_calc(var(--toggles-around--duration)_*_0.253)] dark:toggles-dev--[transform:scale(0)] motion-safe:dark:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.4)_ease]" />
          <circle cx="27" cy="9.7" r="2.3" class="toggles-dev--[transform-origin:center] motion-safe:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.2)_ease_calc(var(--toggles-around--duration)_*_0.348)] dark:toggles-dev--[transform:scale(0)] motion-safe:dark:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.4)_ease]" />
          <circle cx="27" cy="22.3" r="2.3" class="toggles-dev--[transform-origin:center] motion-safe:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.2)_ease_calc(var(--toggles-around--duration)_*_0.443)] dark:toggles-dev--[transform:scale(0)] motion-safe:dark:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.4)_ease]" />
          <circle cx="16" cy="28.7" r="2.3" class="toggles-dev--[transform-origin:center] motion-safe:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.2)_ease_calc(var(--toggles-around--duration)_*_0.538)] dark:toggles-dev--[transform:scale(0)] motion-safe:dark:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.4)_ease]" />
          <circle cx="5" cy="22.3" r="2.3" class="toggles-dev--[transform-origin:center] motion-safe:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.2)_ease_calc(var(--toggles-around--duration)_*_0.633)] dark:toggles-dev--[transform:scale(0)] motion-safe:dark:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.4)_ease]" />
          <circle cx="5" cy="9.7" r="2.3" class="toggles-dev--[transform-origin:center] motion-safe:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.2)_ease_calc(var(--toggles-around--duration)_*_0.728)] dark:toggles-dev--[transform:scale(0)] motion-safe:dark:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.4)_ease]" />
        </g>
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
<svg width="1em" height="1em" viewBox="0 0 32 32" aria-hidden="true" fill="currentColor" style="--toggles-around--duration: 500ms">
      <defs>
        <clipPath id="toggles.dev-around-main-0" class="toggles-dev--[transform-origin:center] motion-safe:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.6)_ease] dark:toggles-dev--[transform:rotate(-90deg)] motion-safe:dark:toggles-dev--[transition:transform_var(--toggles-around--duration)_ease]">
          <path d="M0 0h42v30a1 1 0 00-16 13H0Z" class="motion-safe:toggles-dev--transition-[d,translate] motion-safe:toggles-dev--[transition-duration:calc(var(--toggles-around--duration)_*_0.6)] motion-safe:toggles-dev--[transition-timing-function:ease] dark:toggles-dev--[d:path('M-12_-14h42v30a1_1_0_00-16_13H0Z')] dark:not-supports-[d:path('M0_0')]:toggles-dev---translate-x-[12px] dark:not-supports-[d:path('M0_0')]:toggles-dev---translate-y-[14px] motion-safe:dark:toggles-dev--[transition-duration:var(--toggles-around--duration)]" />
        </clipPath>
      </defs>
      <g clip-path="url(#toggles.dev-around-main-0)">
        <circle cx="16" cy="16" r="8.4" class="toggles-dev--[transform-origin:center] motion-safe:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.6)_ease] dark:toggles-dev--[transform:scale(1.4)] motion-safe:dark:toggles-dev--[transition:transform_var(--toggles-around--duration)_ease]" />
        <g>
          <circle cx="16" cy="3.3" r="2.3" class="toggles-dev--[transform-origin:center] motion-safe:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.2)_ease_calc(var(--toggles-around--duration)_*_0.253)] dark:toggles-dev--[transform:scale(0)] motion-safe:dark:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.4)_ease]" />
          <circle cx="27" cy="9.7" r="2.3" class="toggles-dev--[transform-origin:center] motion-safe:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.2)_ease_calc(var(--toggles-around--duration)_*_0.348)] dark:toggles-dev--[transform:scale(0)] motion-safe:dark:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.4)_ease]" />
          <circle cx="27" cy="22.3" r="2.3" class="toggles-dev--[transform-origin:center] motion-safe:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.2)_ease_calc(var(--toggles-around--duration)_*_0.443)] dark:toggles-dev--[transform:scale(0)] motion-safe:dark:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.4)_ease]" />
          <circle cx="16" cy="28.7" r="2.3" class="toggles-dev--[transform-origin:center] motion-safe:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.2)_ease_calc(var(--toggles-around--duration)_*_0.538)] dark:toggles-dev--[transform:scale(0)] motion-safe:dark:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.4)_ease]" />
          <circle cx="5" cy="22.3" r="2.3" class="toggles-dev--[transform-origin:center] motion-safe:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.2)_ease_calc(var(--toggles-around--duration)_*_0.633)] dark:toggles-dev--[transform:scale(0)] motion-safe:dark:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.4)_ease]" />
          <circle cx="5" cy="9.7" r="2.3" class="toggles-dev--[transform-origin:center] motion-safe:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.2)_ease_calc(var(--toggles-around--duration)_*_0.728)] dark:toggles-dev--[transform:scale(0)] motion-safe:dark:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.4)_ease]" />
        </g>
      </g>
    </svg>
</button>
```

### React / Next.js
```tsx
import "themetoggle-components/shared/base.css";
import { useState } from "react";

export function AroundToggle() {
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
<svg width="1em" height="1em" viewBox="0 0 32 32" aria-hidden="true" fill="currentColor" style="--toggles-around--duration: 500ms">
      <defs>
        <clipPath id="toggles.dev-around-main-0" class="toggles-dev--[transform-origin:center] motion-safe:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.6)_ease] dark:toggles-dev--[transform:rotate(-90deg)] motion-safe:dark:toggles-dev--[transition:transform_var(--toggles-around--duration)_ease]">
          <path d="M0 0h42v30a1 1 0 00-16 13H0Z" class="motion-safe:toggles-dev--transition-[d,translate] motion-safe:toggles-dev--[transition-duration:calc(var(--toggles-around--duration)_*_0.6)] motion-safe:toggles-dev--[transition-timing-function:ease] dark:toggles-dev--[d:path('M-12_-14h42v30a1_1_0_00-16_13H0Z')] dark:not-supports-[d:path('M0_0')]:toggles-dev---translate-x-[12px] dark:not-supports-[d:path('M0_0')]:toggles-dev---translate-y-[14px] motion-safe:dark:toggles-dev--[transition-duration:var(--toggles-around--duration)]" />
        </clipPath>
      </defs>
      <g clip-path="url(#toggles.dev-around-main-0)">
        <circle cx="16" cy="16" r="8.4" class="toggles-dev--[transform-origin:center] motion-safe:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.6)_ease] dark:toggles-dev--[transform:scale(1.4)] motion-safe:dark:toggles-dev--[transition:transform_var(--toggles-around--duration)_ease]" />
        <g>
          <circle cx="16" cy="3.3" r="2.3" class="toggles-dev--[transform-origin:center] motion-safe:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.2)_ease_calc(var(--toggles-around--duration)_*_0.253)] dark:toggles-dev--[transform:scale(0)] motion-safe:dark:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.4)_ease]" />
          <circle cx="27" cy="9.7" r="2.3" class="toggles-dev--[transform-origin:center] motion-safe:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.2)_ease_calc(var(--toggles-around--duration)_*_0.348)] dark:toggles-dev--[transform:scale(0)] motion-safe:dark:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.4)_ease]" />
          <circle cx="27" cy="22.3" r="2.3" class="toggles-dev--[transform-origin:center] motion-safe:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.2)_ease_calc(var(--toggles-around--duration)_*_0.443)] dark:toggles-dev--[transform:scale(0)] motion-safe:dark:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.4)_ease]" />
          <circle cx="16" cy="28.7" r="2.3" class="toggles-dev--[transform-origin:center] motion-safe:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.2)_ease_calc(var(--toggles-around--duration)_*_0.538)] dark:toggles-dev--[transform:scale(0)] motion-safe:dark:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.4)_ease]" />
          <circle cx="5" cy="22.3" r="2.3" class="toggles-dev--[transform-origin:center] motion-safe:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.2)_ease_calc(var(--toggles-around--duration)_*_0.633)] dark:toggles-dev--[transform:scale(0)] motion-safe:dark:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.4)_ease]" />
          <circle cx="5" cy="9.7" r="2.3" class="toggles-dev--[transform-origin:center] motion-safe:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.2)_ease_calc(var(--toggles-around--duration)_*_0.728)] dark:toggles-dev--[transform:scale(0)] motion-safe:dark:toggles-dev--[transition:transform_calc(var(--toggles-around--duration)_*_0.4)_ease]" />
        </g>
      </g>
    </svg>
    </button>
  );
}
```
