# Light Switch Theme Toggle (light-switch)

**Category**: setting  
**Source**: [toggles.dev](https://toggles.dev/) / [@theme-toggles](https://github.com/alfiejones/theme-toggles)  
**License**: MIT License  
**Default Duration**: `350ms`  
**Recommended Size**: `20px - 32px` (`1.25rem - 2rem`)  
**Chinese Name**: 墙壁开关  
**Keywords**: 墙壁开关, 拟物拨动开关, 极简主题切换, 暗黑模式切换, light-switch-toggle, wall-switch, rocker-toggle

---

## 1. Physical Metaphor & Visual Signature
A miniature architectural light switch with a tactile rocker mechanism flipping up and down.

---

## 2. Decision Matrix

| Dimension | Guidance |
| :--- | :--- |
| **When to Use** | Smart home IoT dashboards, hardware companion apps, and playful interactive settings. |
| **When NOT to Use** | Ultra-thin inline text hyperlinks. |

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
<svg width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true" style="--toggles-light-switch--duration: 350ms">
      <defs>
        <clipPath id="toggles.dev-light-switch-paddle-0">
          <path d="M7 3h10v9H7Z" class="motion-safe:toggles-dev--transition-[d,translate] motion-safe:toggles-dev--duration-(--toggles-light-switch--duration) motion-safe:toggles-dev--[transition-timing-function:cubic-bezier(0,0,0.15,1.25)] dark:toggles-dev--[d:path('M7_12h10v9H7Z')] dark:not-supports-[d:path('M0_0')]:toggles-dev--translate-y-[9px]" />
        </clipPath>
      </defs>
      <rect x="5" y="1" width="14" height="22" rx="2" stroke="currentColor" fill="none" stroke-width="1.5" />
      <rect x="7" y="3" width="10" height="18" rx="1" stroke="currentColor" fill="none" stroke-width="1" />
      <rect x="8" y="4" width="8" height="16" rx="0.5" fill="currentColor" clip-path="url(#toggles.dev-light-switch-paddle-0)" />
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
<svg width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true" style="--toggles-light-switch--duration: 350ms">
      <defs>
        <clipPath id="toggles.dev-light-switch-paddle-0">
          <path d="M7 3h10v9H7Z" class="motion-safe:toggles-dev--transition-[d,translate] motion-safe:toggles-dev--duration-(--toggles-light-switch--duration) motion-safe:toggles-dev--[transition-timing-function:cubic-bezier(0,0,0.15,1.25)] dark:toggles-dev--[d:path('M7_12h10v9H7Z')] dark:not-supports-[d:path('M0_0')]:toggles-dev--translate-y-[9px]" />
        </clipPath>
      </defs>
      <rect x="5" y="1" width="14" height="22" rx="2" stroke="currentColor" fill="none" stroke-width="1.5" />
      <rect x="7" y="3" width="10" height="18" rx="1" stroke="currentColor" fill="none" stroke-width="1" />
      <rect x="8" y="4" width="8" height="16" rx="0.5" fill="currentColor" clip-path="url(#toggles.dev-light-switch-paddle-0)" />
    </svg>
</button>
```

### React / Next.js
```tsx
import "themetoggle-components/shared/base.css";
import { useState } from "react";

export function LightSwitchToggle() {
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
<svg width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true" style="--toggles-light-switch--duration: 350ms">
      <defs>
        <clipPath id="toggles.dev-light-switch-paddle-0">
          <path d="M7 3h10v9H7Z" class="motion-safe:toggles-dev--transition-[d,translate] motion-safe:toggles-dev--duration-(--toggles-light-switch--duration) motion-safe:toggles-dev--[transition-timing-function:cubic-bezier(0,0,0.15,1.25)] dark:toggles-dev--[d:path('M7_12h10v9H7Z')] dark:not-supports-[d:path('M0_0')]:toggles-dev--translate-y-[9px]" />
        </clipPath>
      </defs>
      <rect x="5" y="1" width="14" height="22" rx="2" stroke="currentColor" fill="none" stroke-width="1.5" />
      <rect x="7" y="3" width="10" height="18" rx="1" stroke="currentColor" fill="none" stroke-width="1" />
      <rect x="8" y="4" width="8" height="16" rx="0.5" fill="currentColor" clip-path="url(#toggles.dev-light-switch-paddle-0)" />
    </svg>
    </button>
  );
}
```
