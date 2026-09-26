---
style_id: "ai-native-productivity"
style_aliases: ["linear-dark", "openai-productivity", "dark-hairline"]
version: "1.0.0"
token_source: "./shared/base.css"
target_runtime: "agent-first"
primary_stack: "Tailwind CSS v4 + Pure HTML + OKLCH"
---

# AI-Native Productivity Design Specification

> **AI Agent Context Guard**: High-density engineering contract. Zero conversational filler. Adhere strictly to the machine-checkable constraints below when generating DOM and CSS.

---

### 1. Hard Constraints (RFC 2119)

- **MUST** default to Dark Mode (`.dark` or `data-theme="dark"`).
- **MUST** use OKLCH color spaces for perceptual lightness consistency across dynamic themes.
- **MUST** enforce hairline borders via `box-shadow: 0 0 0 1px var(--line);` or `border: 1px solid var(--line);`. Never use solid 2px borders.
- **MUST** use `Inter` for interface prose and `JetBrains Mono` for code blocks, token counters, and prompt inputs.
- **MUST** constrain border radii: `6px` (chips/badges), `8px` (inputs/buttons), `10px` (cards/panels), `14px` (windows/dialogs).
- **MUST NOT** use saturated pure hues for background cards; all surfaces are strictly neutral low-chroma OKLCH values (`chroma <= 0.006`).
- **MUST NOT** use floating modal dialogs for transient AI states; thinking processes MUST be expandable inline accordions.
- **NEVER** use thick solid drop shadows. All shadows must combine 1px hairline perimeter with ambient multi-stop blur.

---

### 2. Token Registry & Variable Matrix

#### 2.1 Color Tokens (OKLCH Dark-First Scale)

| Semantic Role | Dark Mode OKLCH Value | Light Mode OKLCH Value | CSS Variable |
| :--- | :--- | :--- | :--- |
| `page-bg` | `oklch(20.9% .004 264.477)` | `oklch(98.5% .001 286.376)` | `var(--page)` |
| `canvas-bg` | `oklch(23.1% .004 264.487)` | `oklch(96.1% .002 247.84)` | `var(--canvas)` |
| `surface-card` | `oklch(26% .006 271.191)` | `oklch(100% 0 0)` | `var(--surface)` |
| `inset-bg` | `oklch(24.3% .004 264.492)` | `oklch(97.9% .002 247.839)` | `var(--inset)` |
| `field-input` | `oklch(29.3% .006 271.223)` | `oklch(96.1% .001 286.375)` | `var(--field)` |
| `text-primary` | `oklch(96.4% .002 247.839)` | `oklch(24.7% .006 258.361)` | `var(--ink)` |
| `text-secondary` | `oklch(73.1% .008 260.731)` | `oklch(50.6% .01 264.477)` | `var(--ink-2)` |
| `text-muted` | `oklch(54.1% .01 264.484)` | `oklch(69.5% .009 264.505)` | `var(--ink-3)` |
| `border-hairline` | `oklch(30.8% .006 258.354)` | `oklch(94.6% .003 264.542)` | `var(--line)` |
| `border-strong` | `oklch(35.6% .007 264.474)` | `oklch(91.2% .005 258.326)` | `var(--line-strong)` |
| `accent-blue` | `oklch(68% .173 253.301)` | `oklch(62.6% .205 254.947)` | `var(--accent)` |
| `accent-tint` | `oklch(68% .173 253.301 / .16)` | `oklch(96% .019 252.878)` | `var(--accent-tint)` |

#### 2.2 Radii, Elevation & Hairline Presets

| Property | Value | CSS Token |
| :--- | :--- | :--- |
| `Radius: chip` | `6px` | `var(--radius-chip)` |
| `Radius: control` | `8px` | `var(--radius-control)` |
| `Radius: card` | `10px` | `var(--radius-card)` |
| `Radius: window` | `14px` | `var(--radius-window)` |
| `Hairline Perimeter` | `0 0 0 1px var(--line)` | `var(--shadow-hairline)` |
| `Elevation: Card` | `0 0 0 1px var(--line), var(--shadow-sm)` | `var(--shadow-card)` |
| `Elevation: Raised` | `0 0 0 1px var(--line), var(--shadow-md)` | `var(--shadow-raised)` |
| `Elevation: Overlay` | `0 0 0 1px var(--line), var(--shadow-lg)` | `var(--shadow-overlay)` |

---

### 3. Motion & AI Interaction Specs

| Mechanism | Parameters | Implementation / Easing |
| :--- | :--- | :--- |
| `Strong Deceleration` | `cubic-bezier(.23, 1, .32, 1)` | `var(--ease-out-strong)` |
| `Symmetric Link Snap` | `cubic-bezier(.16, 1, .3, 1)` | `var(--ease-link)` |
| `Streaming Text Cursor`| `pulse-glow 1s infinite alternate` | `box-shadow: 0 0 8px var(--accent);` |
| `Thinking Pulse Dot` | `scale(0.8) to scale(1.1), 1.2s ease-in-out` | `animation: thinking-pulse 1.2s infinite` |

---

### 4. Component Assembly Recipes

#### 4.1 AI Prompt Bar / Composer Card
```html
<div style="background: var(--surface); box-shadow: var(--shadow-card); border-radius: var(--radius-window); padding: 12px 16px; display: flex; flex-direction: column; gap: 8px;">
  <textarea style="background: var(--field); border: 1px solid var(--line); border-radius: var(--radius-control); color: var(--ink); font-family: var(--font-mono); font-size: 13px; line-height: 1.5; padding: 10px 12px; resize: none; outline: none;"></textarea>
  <div style="display: flex; justify-content: space-between; align-items: center;">
    <div style="display: flex; gap: 6px;">
      <span style="font-size: 11px; font-family: var(--font-mono); color: var(--ink-3); padding: 2px 6px; background: var(--inset); border-radius: var(--radius-chip);">tokens: 42</span>
    </div>
    <button style="background: var(--accent); color: white; border: none; border-radius: var(--radius-control); font-size: 12px; font-weight: 500; padding: 6px 14px; cursor: pointer;">Run</button>
  </div>
</div>
```

#### 4.2 Thinking Process Accordion (Collapsible Stream)
```html
<details style="background: var(--inset); border: 1px solid var(--line); border-radius: var(--radius-card); padding: 8px 12px; font-family: var(--font-sans);">
  <summary style="cursor: pointer; font-size: 12px; font-weight: 500; color: var(--ink-2); display: flex; align-items: center; gap: 8px; user-select: none;">
    <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--accent);"></span>
    Thinking Process (2 steps)
  </summary>
  <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--line-soft); font-size: 12px; color: var(--ink-3); line-height: 1.6; font-family: var(--font-mono);">
    Analyzing token constraints and matching component primitives...
  </div>
</details>
```
