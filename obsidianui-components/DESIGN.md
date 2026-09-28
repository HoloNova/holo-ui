---
style_id: "obsidian-showcase"
style_aliases: ["obsidian-ui", "split-showcase", "partner-cards"]
version: "1.0.0"
token_source: "./shared/base.css"
target_runtime: "agent-first"
primary_stack: "React 19 + Motion + Tailwind CSS"
---

# ObsidianUI Design Specification

> **AI Agent Context Guard**: High-density engineering contract. Zero conversational filler. Adhere strictly to the machine-checkable constraints below when generating DOM and CSS.

---

### 1. Hard Constraints (RFC 2119)

- **MUST** use Apple-style spring physics for card translations (`stiffness: 350, damping: 24`).
- **MUST** support `useReducedMotion()` from `motion/react` to disable spatial translation when requested.
- **MUST** support responsive breakpoints: horizontal split on desktop (`sm:grid-cols-2`), vertical stack on mobile (`grid-cols-1`).
- **MUST** expand corner radii dynamically on hover/active states (`rounded-[32px]`).
- **MUST** include accessibility attributes (`aria-label`, keyboard focus via `onFocus`/`onBlur`, `focus-visible:outline-none`).

---

### 2. Spring Physics Presets

| Spring Preset | Stiffness | Damping | Shift | Primary Use Case |
| :--- | :--- | :--- | :--- | :--- |
| `cardOutwardShift` | `350` | `24` | `-12px / +12px` | Outward spring displacement on hover/focus |
