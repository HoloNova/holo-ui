---
style_id: "arc_motion_primitives"
style_aliases: ["arc-ui", "uiarc", "motion-primitives", "arc"]
version: "1.0.0"
token_source: "./shared/base.css"
target_runtime: "agent-first"
primary_stack: "React 19 + Motion (motion/react) + OKLCH Design Tokens"
---

# Arc Motion Primitives Design Specification

> **AI Agent Context Guard**: High-density engineering contract for Arc components. Adhere strictly to the machine-checkable constraints below when generating DOM, Motion configurations, and CSS.

---

### 1. Hard Constraints (RFC 2119)

- **MUST** use Framer Motion modern `motion/react` for all micro-interactions and transitions.
- **MUST** adopt tokenized spring curves from `motionTokens.spring` (`snappy`, `smooth`, `morph`) rather than arbitrary transition times.
- **MUST** honor `useReducedMotion()` from `motion/react` to collapse physics to instant state changes when requested by the OS.
- **MUST** anchor layers safely: buttons and interactive elements triggering popovers/dialogs (`aria-haspopup`, `data-state`, `role="combobox"`) MUST suppress whileTap scaling (`transform: none !important`) so floating layers do not measure scaled bounds.
- **MUST** use OKLCH color variables (`var(--foreground)`, `var(--background)`, `var(--surface)`, `var(--border)`, `var(--accent)`) defined in `shared/base.css`.
- **MUST** maintain accessible focus indicators via `:focus-visible` and maintain ARIA states (`aria-busy`, `aria-disabled`).

---

### 2. Motion Presets (`motionTokens`)

| Preset | Type / Parameter | Primary Use Case |
| :--- | :--- | :--- |
| `spring.snappy` | `{ visualDuration: 0.26, bounce: 0.12 }` | Presses, toggles, thumbs, and small indicators. Settles fast with life. |
| `spring.smooth` | `{ visualDuration: 0.4, bounce: 0 }` | Panels, drawers, height changes, layout shifts. Critically damped. |
| `spring.morph` | `{ visualDuration: 0.42, bounce: 0.16 }` | Shape morphs, width adjustments, dynamic label transitions. |
| `ease.enter` | `cubic-bezier(.16, 1, .3, 1)` | Incoming elements, modal entrances, toasts. |
| `ease.exit` | `cubic-bezier(.7, 0, .84, 0)` | Disappearing elements, dismissals. |
| `blur.soft` | `4px` | Text and icon crossfade elevation filter. |

---

### 3. Harmonic Theme & Color Palette

Arc uses an algorithmic OKLCH neutral ramp from `neutral-0` to `neutral-11` with 8 accent variations:
- Accents: `neutral`, `violet`, `blue`, `green`, `amber`, `orange`, `coral`, `rose`.
- Dark mode: activated via `data-theme="dark"` on the root `<html>` element.
- Accent selection: activated via `data-accent="{name}"` on the root `<html>` element.
