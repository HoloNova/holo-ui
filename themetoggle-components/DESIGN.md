---
style_id: "minimal-theme-toggles"
style_aliases: ["theme-toggle-switches", "sun-moon-switches", "pure-css-toggles"]
version: "1.0.0"
token_source: "./shared/base.css"
target_runtime: "agent-first"
primary_stack: "Pure HTML/SVG + CSS Custom Properties"
---

# Minimalist Theme Toggles Design Specification

> **AI Agent Context Guard**: High-density engineering contract. Zero conversational filler. Adhere strictly to the machine-checkable constraints below when generating DOM and CSS.

---

### 1. Hard Constraints (RFC 2119)

- **MUST** be zero-runtime; never require JavaScript for rendering or vector transitions (pure CSS/SVG vector path morphing).
- **MUST** scale via relative font units (`1em` or `1.5rem`) using `color: currentColor`.
- **MUST** include accessible ARIA attributes (`aria-label="Toggle theme"`, `title="Toggle theme"`).
- **MUST** include `:focus-visible { outline: 2px solid currentColor; outline-offset: 4px; }`.
- **MUST NOT** exceed 44px hit bounds when docked in top navigation bars.
- **NEVER** use raster PNG/JPEG assets for sun/moon icons; only inline SVG paths with clip-path or stroke-dashoffset transitions.

---

### 2. Token Registry & Variable Matrix

#### 2.1 CSS Custom Properties & Sizing Scale

| Property / Selector | Value | Semantic Role |
| :--- | :--- | :--- |
| `font-size` | `1.5rem` (default) / `1em` (inline) | Controls entire SVG vector dimensions |
| `color` | `currentColor` | Inherits foreground text color automatically |
| `.theme-toggle:hover` | `opacity: 0.85;` | Subtle interaction indicator |
| `.theme-toggle:active` | `transform: scale(0.92);` | Tactile tap/click compression |
| `transition` | `150ms ease` | Smooth scale and opacity feedback |

---

### 3. Component Assembly Recipe

#### 3.1 Accessible Topbar Theme Switch
```html
<button class="theme-toggle" type="button" aria-label="Toggle theme" title="Toggle theme" style="font-size: 1.5rem; color: currentColor;">
  <!-- Classic / Eclipse SVG Morph Snippet -->
  <svg class="theme-toggle__classic" aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
  </svg>
</button>
```
