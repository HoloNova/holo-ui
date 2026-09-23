# Style Taxonomy and Anti-Over-Assembly Guide

> [!IMPORTANT]
> **Core Objective**: Prevent AI agents from assembling incompatible design languages, hallucinating unsupported styles, or over-engineering simple user requests into cluttered, unusable interfaces. Both developers and autonomous coding agents MUST review this guide prior to selecting components.

---

## 1. Style Taxonomy & Design Quadrants

Different design languages originate from distinct engineering and cultural contexts. Blindly mixing their visual tokens produces incoherent, broken user experiences.

```
+---------------------------------------------------------------------------------+
|                              Style Positioning Map                              |
|                                                                                 |
|                        Tactile Depth / Materials / Spatial                      |
|                                      |                                          |
|                                      |   Apple Human Interface (HIG)            |
|                                      |   Humanist / Spatial / Liquid Glass      |
|                                      |                                          |
|                                      |   Kinetic Motion & Tactile (Rewamp UI)   |
|                                      |   Physics Springs / 3D Orbits / Lilac    |
|   Consumer / Lifestyle ──────────────┼────────────── Geek / High-Density SaaS   |
|                                      |                                          |
|                                      |   AI-Native Productivity (Beautiful UI)  |
|                                      |   Linear Dark / Monochromatic / Crisp    |
|                                      |                                          |
|                        Flat Minimal / Tabular / Monochromatic                   |
+---------------------------------------------------------------------------------+
```

### Style A: AI-Native Productivity (`beautifului-components`)
- **Visual DNA**: Linear aesthetic, Raycast precision, cold neutral tones, OKLCH palette, dark-first default.
- **Key Signatures**:
  - 0.5px hairline dividers, dashed micro-borders (`border-dashed`).
  - High information density, monospace / tabular numbers (`tabular-nums`).
  - Shimmer text transitions (`shimmer-text`), discreet caret blinking, micro-action bars.
- **Applicable Scenarios**:
  - LLM coding assistant workspaces and thinking traces.
  - Multi-step agent execution monitors and tool call inspectors.
  - AI prompt bars, model parameter tuning, token usage metrics.
  - Developer dashboards, CLI companion web interfaces, markdown code diff viewers.
- **Incompatible Scenarios**:
  - Generic e-commerce storefronts, children education portals, casual gaming, warm lifestyle apps.

### Style B: Apple Human Interface (`guidelines/apple-design`)
- **Visual DNA**: Humanist elegance, liquid glass materials, squircle curvature, ambient lighting adaptation.
- **Key Signatures**:
  - Continuous curve squircles (`border-radius: 16px ~ 28px`).
  - Specular edge highlights and multi-layer backdrop blur (`backdrop-filter: blur(20px)`).
  - Physics-based spring curves (`cubic-bezier(0.25, 1, 0.5, 1)`), 44pt accessible touch targets.
- **Applicable Scenarios**:
  - Consumer mobile web apps and Progressive Web Apps (PWAs).
  - Grouped setting lists, account profile sheets, interactive bottom sheets.
  - Media playback controls, personal journaling, task checklists.
- **Incompatible Scenarios**:
  - Ultra-dense financial trading terminals, raw hacker CLI logs (excessive padding and rounded corners reduce line efficiency).

### Style C: Kinetic Motion & Tactile Physics (`rewampui-components`)
- **Visual DNA**: Physical spring dynamics, continuous fluid morphing, 3D orbits, kinetic typography, Lilac & Orange palette.
- **Key Signatures**:
  - Framer Motion spring physics with mass, stiffness, and damping.
  - Apple SF Pro typographic hierarchy (SF Pro Semibold + SF Pro Regular).
  - Tactile micro-interactions: slide-to-confirm, googly-eyes tracking, shimmer streaks, rainbow gradient borders.
  - 3D WebGL / Three.js assistant companions (fluid morph orbs, marbled fluid orbs).
- **Applicable Scenarios**:
  - High-converting product landing pages, hero showcases, and marketing touchpoints.
  - Irreversible critical action gates (e.g. order confirmation with `slide-to-confirm-button`).
  - Interactive AI companions and animated avatar states.
  - High-impact kinetic hero typography and rotating slot-machine headlines.
- **Incompatible Scenarios**:
  - Data-dense financial spreadsheets or static admin backends where constant motion introduces distraction.
  - Strict zero-JavaScript low-bandwidth environments.

---

## 2. Anti-Over-Assembly Rules

A common failure mode of AI coding agents is **gratuitous feature stacking**: when asked for a simple chat input, the agent adds an expandable thinking panel, multi-step approval modal, context cards, and a CRM table all on one screen.

Agents must enforce the following four engineering constraints:

### Rule 1: Occam's UI Razor
> **Entities must not be multiplied beyond necessity.**

- If the user asks for **"a quick prompt or search input"**:
  - Use: `beautifului-components/components/input/prompt-bar.snippet.html`
  - Never assemble: `chat-composer.snippet.html` (heavy compound workspace with tabs and thread panels).
- If the user asks for **"a loading indicator"**:
  - Use: `beautifului-components/components/ai-states/loading-state.snippet.html`
  - Never assemble: `thinking-state.snippet.html` (multi-step accordion) unless step-by-step reasoning logs are explicitly streamed.

### Rule 2: Single Design Hierarchy
> **Never construct a "Frankenstein" interface by mixing conflicting tokens.**

- Incompatible: Nesting a sharp 0.5px dashed border inside an Apple 28px liquid-glass squircle container with Material Design floating action buttons.
- Standard Approach:
  - If building an **AI-Native Workspace**: Keep 6px ~ 10px corner radii, dark surface tokens, and hairline borders uniform throughout.
  - If building an **Apple HIG Experience**: Rely on `guidelines/apple-design/tokens/tokens.css` for typography, spring timing, and backdrop materials across all elements.

### Rule 3: Motion Restraint
> **Never exceed one continuous loop animation per viewport.**

- Having multiple simultaneous shimmers, spinning arcs, and pulsing beacons causes visual fatigue and degrades perceived product quality.
- Animations must be transient: play shimmer effects only during active LLM inference, then transition immediately to static states once generation completes.

### Rule 4: Specialized Primitives are Not Default Layouts
> **Complex components must be reserved strictly for their designated domain.**

| Specialized Component | Single Permitted Scenario | Prohibited Usage |
|:---|:---|:---|
| `components/layout/agent-screen.snippet.html` | Autonomous browser / computer-use simulation | Standard dashboard layout, image preview |
| `components/interaction/approval-card.snippet.html` | Critical irreversible actions requiring human confirmation | Standard form submit, basic alert message |
| `components/data/records-table.snippet.html` | Complex CRM / database tables with math and filtering | Simple 3-row static list |
| `components/visualization/flowchart.snippet.html` | Complex multi-branch logic and state machines | Linear 3-step text tutorials |

---

## 3. Style Harmonization Pattern

When you need the **interaction logic of Beautiful UI** inside an **Apple-themed application**, harmonize the tokens rather than mixing styles abruptly.

```
+------------------------------------+
|  Beautiful UI                      |
|  (Interactive Skeleton)            |
|  - Collapsible panels              |
|  - Expandable thinking rows        |
|  - Tool call chips                 |
+-----------------+------------------+
                  |
                  v [Apply Apple Design Tokens]
+------------------------------------+
|  Apple HIG Visual Layer            |
|  - var(--apple-radius-lg)          |
|  - var(--apple-material-regular)   |
|  - var(--apple-blur-regular)       |
|  - var(--apple-ease-spring)        |
+------------------------------------+
```

### Harmonization Code Example

```css
/* Import Apple Design Tokens */
@import "guidelines/apple-design/tokens/tokens.css";

/* Harmonize Beautiful UI component container to Apple Material */
.beautifului-container {
  /* Replace sharp dark background with Apple frosted material */
  background: var(--apple-material-regular) !important;
  backdrop-filter: var(--apple-blur-regular) !important;
  -webkit-backdrop-filter: var(--apple-blur-regular) !important;

  /* Replace 8px hairline border with Apple squircle radius and subtle specular border */
  border-radius: var(--apple-radius-xl) !important;
  border: 1px solid var(--apple-separator) !important;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08) !important;

  /* Replace linear ease with Apple spring physics */
  transition-timing-function: var(--apple-ease-spring) !important;
}
```

---

## 4. Intent-to-Component Decision Matrix

Refer to this matrix to select the leanest viable component for any given user prompt:

| User Intent | Minimal Recommended File | Prohibited Over-Assembly |
|:---|:---|:---|
| "Single-line AI prompt or quick search" | `beautifului-components/components/input/prompt-bar.snippet.html` | `input/chat-composer.snippet.html` |
| "Full conversational chat window" | `beautifului-components/components/input/chat-composer.snippet.html` | `interaction/approval-card.snippet.html` |
| "Display AI reasoning chain" | `beautifului-components/components/ai-states/thinking-state.snippet.html` | `data/records-table.snippet.html` |
| "Human confirmation before risky tool execution" | `beautifului-components/components/interaction/approval-card.snippet.html` | `visualization/flowchart.snippet.html` |
| "Compact display of executed tools / file edits" | `beautifului-components/components/interaction/tool-chips.snippet.html` | `layout/agent-screen.snippet.html` |
| "Display multi-step asynchronous task statuses" | `beautifului-components/components/task-management/task-rows.snippet.html` | `data/diff-table.snippet.html` |
| "Before/after code or text comparison" | `beautifului-components/components/data/diff-table.snippet.html` | `data/records-table.snippet.html` |
| "Multi-column data record view with filters" | `beautifului-components/components/data/records-table.snippet.html` | `cards/context-cards.snippet.html` |
| "iOS-style tactile settings or action sheet" | `guidelines/apple-design/tokens/tokens.css` + `patterns/` | `beautifului-components/` (raw) |
| "High-friction order/action slide confirmation" | `rewampui-components/components/buttons/slide-to-confirm-button.snippet.jsx` | `cards/arch-card-carousel.snippet.tsx` |
| "High-converting hero CTA with shimmer streak" | `rewampui-components/components/buttons/shimmer-button.snippet.jsx` | Heavy 3D backgrounds |
| "Search button that fluidly expands into input" | `rewampui-components/components/search-bars/morph-search-capsule.snippet.jsx` | `input/chat-composer.snippet.html` |
| "Rotating headline terms / kinetic typography" | `rewampui-components/components/text/kinetic-reel-text.snippet.jsx` | Complex video embed |
| "3D arched image/case study carousel" | `rewampui-components/components/cards/arch-card-carousel.snippet.tsx` | Static grid gallery |
| "Interactive 3D fluid AI companion avatar" | `rewampui-components/components/ai-ui/fluid-morph-orb.snippet.tsx` | Heavy multi-panel workspace |
| "Day/night atmospheric theme toggle" | `rewampui-components/components/toggles/day-night-sky-toggle.snippet.jsx` | Full page reload / complex modal |

