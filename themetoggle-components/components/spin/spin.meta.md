# Spin Theme Toggle (spin)

**Category**: setting  
**Source**: [toggles.dev](https://toggles.dev/) / [@theme-toggles](https://github.com/alfiejones/theme-toggles)  
**License**: MIT License  
**Default Duration**: `500ms`  
**Recommended Size**: `20px - 32px` (`1.25rem - 2rem`)  
**Chinese Name**: 旋转日夜切换  
**Keywords**: 旋转日夜切换, 射线收缩, 极简主题切换, 暗黑模式切换, spin-toggle, whirl-toggle, kinetic-sun-switch

---

## 1. Physical Metaphor & Visual Signature
A kinetic sun wheel that spins rapidly on its axis as its rays retract into a curved crescent silhouette.

---

## 2. Decision Matrix

| Dimension | Guidance |
| :--- | :--- |
| **When to Use** | Creative studios, dynamic landing showcases, and animated web portfolios. |
| **When NOT to Use** | Static data-dense financial applications. |

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
<svg width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true" style="--toggles-spin--duration: 400ms">
      <defs>
        <clipPath id="toggles.dev-spin-main-0">
          <path d="M0 0h25a1 1 0 0010 10v14H0Z" class="motion-safe:toggles-dev--transition-[d,translate] motion-safe:toggles-dev--duration-(--toggles-spin--duration) motion-safe:dark:toggles-dev--delay-[calc(var(--toggles-spin--duration)*0.15)] dark:toggles-dev--[d:path('M0_2h13a1_1_0_0010_10v14H0Z')] dark:not-supports-[d:path('M0_0')]:toggles-dev---translate-x-3.25 dark:not-supports-[d:path('M0_0')]:toggles-dev--translate-y-0.5" />
        </clipPath>
      </defs>
      <g stroke="currentColor" stroke-linecap="round">
        <circle cx="12" cy="12" r="5" fill="currentColor" clip-path="url(#toggles.dev-spin-main-0)" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-spin--duration) dark:toggles-dev--scale-170" />
        <path d="M12 1.4v2.4" fill="none" stroke-width="2" stroke-linejoin="round" stroke-miterlimit="0" paint-order="stroke markers fill" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-spin--duration) motion-safe:toggles-dev--delay-[calc(var(--toggles-spin--duration)*0.15)] motion-safe:dark:toggles-dev--delay-0 dark:toggles-dev--rotate-45 dark:toggles-dev--scale-0" />
        <path d="m20.3 3.7-2.5 2.5" fill="none" stroke-width="2" stroke-linejoin="round" stroke-miterlimit="0" paint-order="stroke markers fill" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-spin--duration) motion-safe:toggles-dev--delay-[calc(var(--toggles-spin--duration)*0.15)] motion-safe:dark:toggles-dev--delay-0 dark:toggles-dev--rotate-45 dark:toggles-dev--scale-0" />
        <path d="M22.6 12h-2.4" fill="none" stroke-width="2" stroke-linejoin="round" stroke-miterlimit="0" paint-order="stroke markers fill" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-spin--duration) motion-safe:toggles-dev--delay-[calc(var(--toggles-spin--duration)*0.15)] motion-safe:dark:toggles-dev--delay-0 dark:toggles-dev--rotate-45 dark:toggles-dev--scale-0" />
        <path d="M12 22.6v-2.4" fill="none" stroke-width="2" stroke-linejoin="round" stroke-miterlimit="0" paint-order="stroke markers fill" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-spin--duration) motion-safe:toggles-dev--delay-[calc(var(--toggles-spin--duration)*0.15)] motion-safe:dark:toggles-dev--delay-0 dark:toggles-dev--rotate-45 dark:toggles-dev--scale-0" />
        <path d="M1.4 12h2.4" fill="none" stroke-width="2" stroke-linejoin="round" stroke-miterlimit="0" paint-order="stroke markers fill" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-spin--duration) motion-safe:toggles-dev--delay-[calc(var(--toggles-spin--duration)*0.15)] motion-safe:dark:toggles-dev--delay-0 dark:toggles-dev--rotate-45 dark:toggles-dev--scale-0" />
        <path d="m20.3 20.3-2.5-2.5" fill="none" stroke-width="2" stroke-linejoin="round" stroke-miterlimit="0" paint-order="stroke markers fill" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-spin--duration) motion-safe:toggles-dev--delay-[calc(var(--toggles-spin--duration)*0.15)] motion-safe:dark:toggles-dev--delay-0 dark:toggles-dev--rotate-45 dark:toggles-dev--scale-0" />
        <path d="m3.7 20.3 2.5-2.5" fill="none" stroke-width="2" stroke-linejoin="round" stroke-miterlimit="0" paint-order="stroke markers fill" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-spin--duration) motion-safe:toggles-dev--delay-[calc(var(--toggles-spin--duration)*0.15)] motion-safe:dark:toggles-dev--delay-0 dark:toggles-dev--rotate-45 dark:toggles-dev--scale-0" />
        <path d="m3.7 3.7 2.5 2.5" fill="none" stroke-width="2" stroke-linejoin="round" stroke-miterlimit="0" paint-order="stroke markers fill" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-spin--duration) motion-safe:toggles-dev--delay-[calc(var(--toggles-spin--duration)*0.15)] motion-safe:dark:toggles-dev--delay-0 dark:toggles-dev--rotate-45 dark:toggles-dev--scale-0" />
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
<svg width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true" style="--toggles-spin--duration: 400ms">
      <defs>
        <clipPath id="toggles.dev-spin-main-0">
          <path d="M0 0h25a1 1 0 0010 10v14H0Z" class="motion-safe:toggles-dev--transition-[d,translate] motion-safe:toggles-dev--duration-(--toggles-spin--duration) motion-safe:dark:toggles-dev--delay-[calc(var(--toggles-spin--duration)*0.15)] dark:toggles-dev--[d:path('M0_2h13a1_1_0_0010_10v14H0Z')] dark:not-supports-[d:path('M0_0')]:toggles-dev---translate-x-3.25 dark:not-supports-[d:path('M0_0')]:toggles-dev--translate-y-0.5" />
        </clipPath>
      </defs>
      <g stroke="currentColor" stroke-linecap="round">
        <circle cx="12" cy="12" r="5" fill="currentColor" clip-path="url(#toggles.dev-spin-main-0)" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-spin--duration) dark:toggles-dev--scale-170" />
        <path d="M12 1.4v2.4" fill="none" stroke-width="2" stroke-linejoin="round" stroke-miterlimit="0" paint-order="stroke markers fill" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-spin--duration) motion-safe:toggles-dev--delay-[calc(var(--toggles-spin--duration)*0.15)] motion-safe:dark:toggles-dev--delay-0 dark:toggles-dev--rotate-45 dark:toggles-dev--scale-0" />
        <path d="m20.3 3.7-2.5 2.5" fill="none" stroke-width="2" stroke-linejoin="round" stroke-miterlimit="0" paint-order="stroke markers fill" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-spin--duration) motion-safe:toggles-dev--delay-[calc(var(--toggles-spin--duration)*0.15)] motion-safe:dark:toggles-dev--delay-0 dark:toggles-dev--rotate-45 dark:toggles-dev--scale-0" />
        <path d="M22.6 12h-2.4" fill="none" stroke-width="2" stroke-linejoin="round" stroke-miterlimit="0" paint-order="stroke markers fill" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-spin--duration) motion-safe:toggles-dev--delay-[calc(var(--toggles-spin--duration)*0.15)] motion-safe:dark:toggles-dev--delay-0 dark:toggles-dev--rotate-45 dark:toggles-dev--scale-0" />
        <path d="M12 22.6v-2.4" fill="none" stroke-width="2" stroke-linejoin="round" stroke-miterlimit="0" paint-order="stroke markers fill" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-spin--duration) motion-safe:toggles-dev--delay-[calc(var(--toggles-spin--duration)*0.15)] motion-safe:dark:toggles-dev--delay-0 dark:toggles-dev--rotate-45 dark:toggles-dev--scale-0" />
        <path d="M1.4 12h2.4" fill="none" stroke-width="2" stroke-linejoin="round" stroke-miterlimit="0" paint-order="stroke markers fill" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-spin--duration) motion-safe:toggles-dev--delay-[calc(var(--toggles-spin--duration)*0.15)] motion-safe:dark:toggles-dev--delay-0 dark:toggles-dev--rotate-45 dark:toggles-dev--scale-0" />
        <path d="m20.3 20.3-2.5-2.5" fill="none" stroke-width="2" stroke-linejoin="round" stroke-miterlimit="0" paint-order="stroke markers fill" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-spin--duration) motion-safe:toggles-dev--delay-[calc(var(--toggles-spin--duration)*0.15)] motion-safe:dark:toggles-dev--delay-0 dark:toggles-dev--rotate-45 dark:toggles-dev--scale-0" />
        <path d="m3.7 20.3 2.5-2.5" fill="none" stroke-width="2" stroke-linejoin="round" stroke-miterlimit="0" paint-order="stroke markers fill" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-spin--duration) motion-safe:toggles-dev--delay-[calc(var(--toggles-spin--duration)*0.15)] motion-safe:dark:toggles-dev--delay-0 dark:toggles-dev--rotate-45 dark:toggles-dev--scale-0" />
        <path d="m3.7 3.7 2.5 2.5" fill="none" stroke-width="2" stroke-linejoin="round" stroke-miterlimit="0" paint-order="stroke markers fill" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-spin--duration) motion-safe:toggles-dev--delay-[calc(var(--toggles-spin--duration)*0.15)] motion-safe:dark:toggles-dev--delay-0 dark:toggles-dev--rotate-45 dark:toggles-dev--scale-0" />
      </g>
    </svg>
</button>
```

### React / Next.js
```tsx
import "themetoggle-components/shared/base.css";
import { useState } from "react";

export function SpinToggle() {
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
<svg width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true" style="--toggles-spin--duration: 400ms">
      <defs>
        <clipPath id="toggles.dev-spin-main-0">
          <path d="M0 0h25a1 1 0 0010 10v14H0Z" class="motion-safe:toggles-dev--transition-[d,translate] motion-safe:toggles-dev--duration-(--toggles-spin--duration) motion-safe:dark:toggles-dev--delay-[calc(var(--toggles-spin--duration)*0.15)] dark:toggles-dev--[d:path('M0_2h13a1_1_0_0010_10v14H0Z')] dark:not-supports-[d:path('M0_0')]:toggles-dev---translate-x-3.25 dark:not-supports-[d:path('M0_0')]:toggles-dev--translate-y-0.5" />
        </clipPath>
      </defs>
      <g stroke="currentColor" stroke-linecap="round">
        <circle cx="12" cy="12" r="5" fill="currentColor" clip-path="url(#toggles.dev-spin-main-0)" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-spin--duration) dark:toggles-dev--scale-170" />
        <path d="M12 1.4v2.4" fill="none" stroke-width="2" stroke-linejoin="round" stroke-miterlimit="0" paint-order="stroke markers fill" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-spin--duration) motion-safe:toggles-dev--delay-[calc(var(--toggles-spin--duration)*0.15)] motion-safe:dark:toggles-dev--delay-0 dark:toggles-dev--rotate-45 dark:toggles-dev--scale-0" />
        <path d="m20.3 3.7-2.5 2.5" fill="none" stroke-width="2" stroke-linejoin="round" stroke-miterlimit="0" paint-order="stroke markers fill" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-spin--duration) motion-safe:toggles-dev--delay-[calc(var(--toggles-spin--duration)*0.15)] motion-safe:dark:toggles-dev--delay-0 dark:toggles-dev--rotate-45 dark:toggles-dev--scale-0" />
        <path d="M22.6 12h-2.4" fill="none" stroke-width="2" stroke-linejoin="round" stroke-miterlimit="0" paint-order="stroke markers fill" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-spin--duration) motion-safe:toggles-dev--delay-[calc(var(--toggles-spin--duration)*0.15)] motion-safe:dark:toggles-dev--delay-0 dark:toggles-dev--rotate-45 dark:toggles-dev--scale-0" />
        <path d="M12 22.6v-2.4" fill="none" stroke-width="2" stroke-linejoin="round" stroke-miterlimit="0" paint-order="stroke markers fill" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-spin--duration) motion-safe:toggles-dev--delay-[calc(var(--toggles-spin--duration)*0.15)] motion-safe:dark:toggles-dev--delay-0 dark:toggles-dev--rotate-45 dark:toggles-dev--scale-0" />
        <path d="M1.4 12h2.4" fill="none" stroke-width="2" stroke-linejoin="round" stroke-miterlimit="0" paint-order="stroke markers fill" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-spin--duration) motion-safe:toggles-dev--delay-[calc(var(--toggles-spin--duration)*0.15)] motion-safe:dark:toggles-dev--delay-0 dark:toggles-dev--rotate-45 dark:toggles-dev--scale-0" />
        <path d="m20.3 20.3-2.5-2.5" fill="none" stroke-width="2" stroke-linejoin="round" stroke-miterlimit="0" paint-order="stroke markers fill" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-spin--duration) motion-safe:toggles-dev--delay-[calc(var(--toggles-spin--duration)*0.15)] motion-safe:dark:toggles-dev--delay-0 dark:toggles-dev--rotate-45 dark:toggles-dev--scale-0" />
        <path d="m3.7 20.3 2.5-2.5" fill="none" stroke-width="2" stroke-linejoin="round" stroke-miterlimit="0" paint-order="stroke markers fill" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-spin--duration) motion-safe:toggles-dev--delay-[calc(var(--toggles-spin--duration)*0.15)] motion-safe:dark:toggles-dev--delay-0 dark:toggles-dev--rotate-45 dark:toggles-dev--scale-0" />
        <path d="m3.7 3.7 2.5 2.5" fill="none" stroke-width="2" stroke-linejoin="round" stroke-miterlimit="0" paint-order="stroke markers fill" class="toggles-dev--origin-center motion-safe:toggles-dev--transition-transform motion-safe:toggles-dev--duration-(--toggles-spin--duration) motion-safe:toggles-dev--delay-[calc(var(--toggles-spin--duration)*0.15)] motion-safe:dark:toggles-dev--delay-0 dark:toggles-dev--rotate-45 dark:toggles-dev--scale-0" />
      </g>
    </svg>
    </button>
  );
}
```
