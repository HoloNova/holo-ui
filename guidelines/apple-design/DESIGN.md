---
style_id: "apple-hig"
version: "1.0.0"
token_source: "./tokens/tokens.css"
target_runtime: "agent-first"
authoritative_spec: "Apple Human Interface Guidelines (HIG)"
---

# Apple HIG Design Specification

> **AI Agent Context Guard**: High-density engineering contract. Zero conversational filler. Adhere strictly to the machine-checkable constraints below when generating DOM and CSS.

---

### 1. Hard Constraints (RFC 2119)

- **MUST** enforce minimum touch/click hit target of 44x44px (`min-height: 44px; min-width: 44px;`) on all primary interactive controls.
- **MUST** use `-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", sans-serif` for sans-serif typography.
- **MUST** use continuous squircle corner radii: `12px` (inputs/buttons), `16px` (cards/insets), `22px-28px` (sheets/dialogs), `9999px` (pills/tags).
- **MUST** render hairline dividers as `0.5px solid` using semantic separator color.
- **MUST** use Apple spring physics for all dynamic transitions: `cubic-bezier(0.25, 1, 0.5, 1)`.
- **MUST NOT** use generic linear transitions or abrupt step animations.
- **MUST NOT** use pitch-black opaque drop shadows in light mode; use layered ambient blur with opacity `<= 0.12`.
- **NEVER** use 90-degree sharp corners or harsh 2px/4px border radii.
- **NEVER** use generic solid black or 1px thick solid gray borders.

---

### 2. Token Registry & Variable Matrix

#### 2.1 Typography Scale (San Francisco Standard)

| Scale Step | Weight | Font Size | Line Height | Letter Spacing | CSS Variable |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Large Title` | 700 (Bold) | 34px | 41px | +0.37px | `var(--apple-text-large-title)` |
| `Title 1` | 700 (Bold) | 28px | 34px | +0.36px | `var(--apple-text-title-1)` |
| `Title 2` | 700 (Bold) | 22px | 28px | +0.35px | `var(--apple-text-title-2)` |
| `Title 3` | 600 (Semibold) | 20px | 25px | +0.38px | `var(--apple-text-title-3)` |
| `Headline` | 600 (Semibold) | 17px | 22px | -0.41px | `var(--apple-text-headline)` |
| `Body` | 400 (Regular) | 17px | 22px | -0.41px | `var(--apple-text-body)` |
| `Callout` | 400 (Regular) | 16px | 21px | -0.32px | `var(--apple-text-callout)` |
| `Subheadline` | 400 (Regular) | 15px | 20px | -0.24px | `var(--apple-text-subheadline)` |
| `Footnote` | 400 (Regular) | 13px | 18px | -0.08px | `var(--apple-text-footnote)` |
| `Caption 1` | 400 (Regular) | 12px | 16px | 0.00px | `var(--apple-text-caption-1)` |
| `Caption 2` | 400 (Regular) | 11px | 13px | +0.07px | `var(--apple-text-caption-2)` |

#### 2.2 Semantic Colors (Light / Dark Adaptive)

| Semantic Role | Light Value | Dark Value | CSS Custom Property |
| :--- | :--- | :--- | :--- |
| `canvas-primary` | `#FFFFFF` | `#000000` | `var(--apple-bg-primary)` |
| `canvas-secondary` | `#F2F2F7` | `#1C1C1E` | `var(--apple-bg-secondary)` |
| `canvas-tertiary` | `#FFFFFF` | `#2C2C2E` | `var(--apple-bg-tertiary)` |
| `label-primary` | `#000000` | `#FFFFFF` | `var(--apple-label-primary)` |
| `label-secondary` | `rgba(60, 60, 67, 0.60)` | `rgba(235, 235, 245, 0.60)` | `var(--apple-label-secondary)` |
| `label-tertiary` | `rgba(60, 60, 67, 0.30)` | `rgba(235, 235, 245, 0.30)` | `var(--apple-label-tertiary)` |
| `separator-hairline` | `rgba(60, 60, 67, 0.29)` | `rgba(84, 84, 88, 0.65)` | `var(--apple-separator)` |
| `accent-primary` | `#007AFF` | `#0A84FF` | `var(--apple-accent)` |
| `accent-tint` | `rgba(0, 122, 255, 0.12)` | `rgba(10, 132, 255, 0.18)` | `var(--apple-accent-tint)` |
| `system-red` | `#FF3B30` | `#FF453A` | `var(--apple-red)` |
| `system-green` | `#34C759` | `#30D158` | `var(--apple-green)` |

#### 2.3 Curvature, Spacing & Elevation

| Property | Value | CSS Token |
| :--- | :--- | :--- |
| `Radius: micro` | `6px` | `var(--apple-radius-xs)` |
| `Radius: control` | `12px` | `var(--apple-radius-md)` |
| `Radius: card` | `16px` | `var(--apple-radius-lg)` |
| `Radius: sheet/modal` | `22px / 28px` | `var(--apple-radius-xl)` / `var(--apple-radius-2xl)` |
| `Radius: capsule` | `9999px` | `var(--apple-radius-pill)` |
| `Grid step` | `8px base (4/8/12/16/20/24px)` | `var(--apple-spacing-unit)` |
| `Elevation: soft card`| `0 2px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)` | `var(--apple-shadow-card)` |
| `Elevation: floating` | `0 4px 16px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.12)` | `var(--apple-shadow-floating)` |

---

### 3. Motion & Physics Specs

| Motion Type | Duration | Timing Function | Key CSS Property |
| :--- | :--- | :--- | :--- |
| `Spring: Standard` | `320ms` | `cubic-bezier(0.25, 1, 0.5, 1)` | `transition: transform var(--apple-duration-normal) var(--apple-ease-spring)` |
| `Spring: Snappy` | `180ms` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | `transition: transform var(--apple-duration-fast) var(--apple-ease-snappy)` |
| `Touch Down Feedback`| `120ms` | `ease` | `:active { transform: scale(0.96); opacity: 0.85; }` |
| `Safe Area Clearance`| `34px bottom` | static spacer | `padding-bottom: env(safe-area-inset-bottom, 34px);` |

---

### 4. Component Assembly Recipes

#### 4.1 Liquid Glass Panel (Material Surface)
```css
.apple-glass-card {
  background: var(--apple-material-regular, rgba(255, 255, 255, 0.75));
  backdrop-filter: blur(25px) saturate(190%);
  -webkit-backdrop-filter: blur(25px) saturate(190%);
  border-radius: var(--apple-radius-lg, 16px);
  border: 0.5px solid var(--apple-separator, rgba(60, 60, 67, 0.29));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85), var(--apple-shadow-card);
  padding: 16px 20px;
}
```

#### 4.2 Hairline Divider
```css
.apple-hairline {
  border: none;
  height: 0.5px;
  background-color: var(--apple-separator, rgba(60, 60, 67, 0.29));
  margin: 0;
}
```

#### 4.3 Standard Action Pill / Button
```css
.apple-button-pill {
  min-height: var(--apple-min-touch-target, 44px);
  padding: 0 20px;
  border-radius: var(--apple-radius-pill, 9999px);
  background-color: var(--apple-accent, #007AFF);
  color: #FFFFFF;
  font: var(--apple-text-headline, 600 17px/22px);
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--apple-duration-fast, 180ms) var(--apple-ease-snappy);
}
.apple-button-pill:active {
  transform: scale(0.96);
  opacity: 0.88;
}
```
