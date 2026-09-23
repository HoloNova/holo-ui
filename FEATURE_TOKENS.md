# Holo UI Vault — Component Feature Token Specification

> **Version**: 1.0.0  
> **Status**: Adopted  
> **Scope**: Defines a structured, multi-dimensional classification system for all UI components in Holo UI Vault. Designed for AI Agent retrieval, component disambiguation, and extensible taxonomy governance.

---

## 1. Design Philosophy

### 1.1 Core Principles

| Principle | Rule |
|:---|:---|
| **Semantic Isolation** | Every dimension measures exactly ONE aspect of a component. No two dimensions overlap in what they classify. |
| **Mutual Exclusivity** | Each component receives exactly ONE value per dimension. If a component spans multiple values, assign the PRIMARY value only. |
| **Zero Naming Collision** | No value string appears in more than one dimension. This eliminates ambiguity when tokens are read without dimension prefixes. |
| **Extensibility** | New values can be appended to any dimension, and new dimensions can be added, without invalidating existing classifications. |
| **Agent-Native** | Token values are terse, lowercase, kebab-case identifiers optimized for LLM pattern matching and JSON serialization. |

### 1.2 What Feature Tokens Are NOT

- **Not tags.** Tags are unstructured, duplicable, and unbounded. Feature tokens are a controlled vocabulary with strict cardinality (one value per dimension).
- **Not descriptions.** Descriptions are free-text prose. Feature tokens are machine-comparable enumerated values.
- **Not a replacement for `by_style` or `by_function`.** Feature tokens are an orthogonal classification layer that augments existing indices.

---

## 2. Dimension Catalog

The system consists of **7 core dimensions**. Every component MUST have a value for each.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Component Feature Token Space                    │
│                                                                     │
│  ┌─── Physical ───┐  ┌── Behavioral ──┐  ┌── Semantic ──┐  ┌ Tech ┐│
│  │  1. scale       │  │ 3. interaction │  │ 6. category  │  │7. rt ││
│  │  2. placement   │  │ 4. lifecycle   │  │              │  │      ││
│  │                 │  │ 5. motion      │  │              │  │      ││
│  └─────────────────┘  └────────────────┘  └──────────────┘  └──────┘│
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Dimension Definitions

### 3.1 `scale` — Physical Footprint

> Measures the component's visual bounding-box size relative to the viewport.

| Value | Definition | Size Hint | Boundary Rule |
|:---|:---|:---|:---|
| `micro` | Fits inside another element as a child. Removing it does not break the parent's layout or function. | 14–32px | If the component is designed to be a child of another component's DOM tree, it is `micro`. |
| `compact` | Small standalone widget. Occupies a defined space but has no internal sub-layout (no header/body/footer structure). | 32–64px | If the component is a single interactive unit (one button, one toggle, one badge), it is `compact`. |
| `standard` | Card, panel, or section with internal structure (header, body, actions, or multiple sub-elements). | Variable, typically 200px+ | If the component has distinguishable internal zones, it is `standard`. |
| `region` | Occupies a major viewport zone (sidebar column, main content area, bottom panel). | Large fraction of viewport | If the component defines a persistent spatial zone that other components live inside, it is `region`. |
| `viewport` | Full viewport application scaffold. IS the page itself. | 100vw / 100vh | Only one `viewport` component exists per page. |

**Anti-ambiguity**: `compact` vs `standard` — does it have internal structural layout (header + body + footer, or multiple distinct sub-components)? If yes → `standard`. If it's a single widget → `compact`.

---

### 3.2 `placement` — Embedding Position

> Describes where the component sits in the page's visual hierarchy and CSS positioning model.

| Value | Definition | Boundary Rule |
|:---|:---|:---|
| `embedded` | Designed as a child element within another component's DOM. Does not make sense in isolation. | The component's documentation or snippet assumes a parent container (e.g., spinner inside a button). |
| `flow` | Participates in normal document flow as an independent block-level element. | Default CSS `position: static` or `relative`. The component is self-contained. |
| `overlay` | Floats above the normal content layer. | Uses `position: absolute/fixed`, `popover`, `dialog`, or equivalent overlay mechanism. |
| `dock` | Anchored to a viewport or container edge. Persists across scroll. | Uses `position: sticky/fixed` and is attached to top, bottom, left, or right edge. |
| `shell` | Provides the root page-level application frame that other components nest within. | Only components that define the outermost page grid qualify. |

**Anti-ambiguity**: `flow` vs `dock` — classify by the component's DESIGNED positioning as implemented in its snippet code. If the snippet contains sticky/fixed positioning, it is `dock`. If a developer COULD dock it but the snippet doesn't, classify as `flow`.

---

### 3.3 `interaction` — User Interaction Model

> Describes the PRIMARY mode of user engagement with the component.

| Value | Definition | Boundary Rule |
|:---|:---|:---|
| `output` | Read-only visual display. No user input of any kind. | The user CANNOT modify, click, type, or interact. Information flows one way: component → user. |
| `input` | Accepts user free-text, search queries, or file uploads. | The component contains an editable `<input>`, `<textarea>`, or contenteditable region. |
| `control` | User triggers discrete actions via click, tap, toggle, or slide. | No free-text entry. The user selects from predefined states or triggers a one-shot action. |
| `navigation` | User follows links or routes to other views/sections. | The component's primary purpose is spatial movement within the application. |
| `confirmation` | Requires explicit approve/deny decision that blocks a workflow. | The component gates a process. Until the user responds, the downstream action cannot proceed. |

**Anti-ambiguity**: `control` vs `confirmation` — a toggle switch changes a SETTING (non-blocking, reversible) → `control`. An approval card blocks a WORKFLOW (the agent cannot proceed without user consent) → `confirmation`. The key differentiator is whether the interaction **gates a pending action**.

**Anti-ambiguity**: `input` vs `control` — does the component accept FREE TEXT? If yes → `input`. If the user only clicks/toggles/slides between pre-defined options → `control`.

---

### 3.4 `lifecycle` — Temporal Behavior

> Describes when the component appears and how long it remains visible.

| Value | Definition | Boundary Rule |
|:---|:---|:---|
| `persistent` | Always visible as part of the stable UI. Does not appear/disappear based on events. | The component is part of the page's resting state. Removing it leaves a permanent gap. |
| `state-driven` | Appears, changes, or disappears in response to application/system state (not direct user action). | Controlled by external state: AI processing status, network activity, data loading. |
| `on-demand` | Appears when explicitly triggered by a user action (click, keyboard shortcut, hover). | The user consciously invokes the component. |
| `transient` | Appears briefly and auto-dismisses without user intervention. | Has a built-in timeout or animation that ends in removal. |

**Anti-ambiguity**: `state-driven` vs `on-demand` — WHO initiates the appearance? If the SYSTEM decides (loading started, AI began thinking) → `state-driven`. If the USER decides (clicked a button, pressed Cmd+K) → `on-demand`.

---

### 3.5 `motion` — Animation Profile

> Classifies the component's PRIMARY animation technology, not incidental hover effects.

| Value | Definition | Boundary Rule |
|:---|:---|:---|
| `none` | No animation. Static rendering only. | The component has zero `@keyframes`, `transition`, or JS-driven motion. |
| `transition` | CSS transitions only. State-change animations (hover, focus, active) but no continuous loops. | Uses `transition` property. No `animation` or `@keyframes` in idle state. |
| `css-loop` | Continuous CSS keyframe animation loop. Plays indefinitely while the component is visible. | Uses `animation` with `infinite` iteration count or equivalent continuous loop. |
| `spring` | Physics-based spring/damping motion. Requires a JS animation runtime. | Uses Framer Motion `spring`, GSAP, or equivalent physics engine. |
| `webgl` | 3D WebGL rendering via Three.js, R3F, or equivalent. | Requires a `<canvas>` with WebGL context. |

**Anti-ambiguity**: A component with BOTH a CSS hover transition AND a continuous CSS loop animation → classify by the PRIMARY (most prominent) motion: `css-loop`. A component with spring animations that ALSO has a WebGL orb → `webgl` (highest complexity wins).

**Escalation Rule**: When a component uses multiple motion techniques, assign the value with the **highest runtime complexity**: `none` < `transition` < `css-loop` < `spring` < `webgl`.

---

### 3.6 `category` — Semantic Function

> Classifies the component's PRIMARY functional purpose — what it IS, not how the user interacts with it.

| Value | Definition | Boundary Rule |
|:---|:---|:---|
| `status` | Visualizes that a process is ongoing. Shows temporal state change (loading, syncing, scanning, thinking). | The component EXISTS because something is processing. When the process ends, the component transitions or disappears. |
| `ai-response` | Renders AI-generated content — streaming tokens, completed answers, or inline citations. | The content displayed is PRODUCED BY an AI model, not manually authored. |
| `composer` | Accepts user text, prompts, search queries, or message composition. | Contains an editable text entry region as its core element. |
| `gate` | Blocks a pending action until the user makes an explicit approval/denial decision. | Removing the component would leave an action in an unresolved pending state. |
| `data` | Displays structured records, tabular data, metrics, comparisons, or analytical charts. | Content is organized in rows/columns, key-value pairs, or quantitative visualizations. |
| `content` | Presents informational summaries, previews, recommendations, or knowledge cards. | Self-contained information unit. Not tabular and not AI-streamed. |
| `nav` | Provides structural navigation — menus, sidebars, navbars, breadcrumbs. | The component's elements are links/routes to other application views. |
| `action` | Triggers a user-initiated operation on click/tap. Standalone buttons and CTAs. | Single-interaction trigger element. No text entry, no state persistence. |
| `setting` | Controls application preferences, modes, or configuration parameters. (Toggles, config panels.) | Changes a SETTING that persists. Not a one-shot action (that's `action`). |
| `text-effect` | Decorative text animation, kinetic typography, or character reveal effects. | The TEXT ITSELF is the animated subject. The component's purpose IS the text animation. |
| `showcase` | Animated galleries, carousels, card decks, or spatial content arrangements. | MULTIPLE content items arranged in a spatial/sequential display. |
| `avatar` | Visual representation of an AI agent, assistant, or entity. | Represents a "being" or "identity", not a process or state. |
| `code` | Renders formatted source code with syntax awareness. | Content is explicitly programming source code, shell commands, or terminal output. |
| `workflow` | Tracks multi-step task progress, tool execution logs, or sequential operation status. | MULTIPLE sequential items, each with individual status (completed/running/failed). |
| `diagram` | Visualizes processes, decision flows, or relationship graphs with nodes and edges. | Has directional connections between discrete elements. |
| `scaffold` | Full-page layout shell or application frame that other components nest within. | Defines the outermost page grid (header + sidebar + main content zones). |

**Anti-ambiguity: `status` vs `ai-response`** — `status` shows that the AI IS PROCESSING (`loading-state`, `thinking-state`, all `ld-*` indicators). `ai-response` shows WHAT THE AI PRODUCED (`streaming-text` with the actual answer, citations, and follow-up suggestions).

**Anti-ambiguity: `gate` vs `action`** — An `action` triggers something (`shimmer-button` starts a process). A `gate` BLOCKS something (`approval-card` halts the agent until the user decides). `slide-to-confirm-button` is a `gate` because its purpose is to PREVENT accidental execution through friction.

**Anti-ambiguity: `content` vs `data`** — `data` is quantitative/tabular (tables, charts, diffs). `content` is qualitative/prose (recommendation cards, context previews, knowledge summaries). If it has rows and columns → `data`. If it's a card with title + description → `content`.

**Anti-ambiguity: `workflow` vs `status`** — `status` shows a SINGLE process state (one loading indicator). `workflow` shows MULTIPLE sequential steps (`task-rows` with tasks each having status). The differentiator is cardinality: singular → `status`, plural sequential → `workflow`.

---

### 3.7 `runtime` — Technology Requirement

> Declares the minimum technology stack required to render the component.

| Value | Definition | Boundary Rule |
|:---|:---|:---|
| `html-css` | Pure HTML + CSS. Zero JavaScript of any kind. | No `<script>` tags, no JS event handlers, no JS imports. |
| `vanilla-js` | HTML + CSS + vanilla JavaScript (no framework). | Uses `<script>` or inline JS, but no React/Vue/Angular. |
| `react` | Requires React (JSX/TSX components). | Exports a React component. Does NOT require Framer Motion or Three.js. |
| `react-motion` | Requires React + Framer Motion. | Imports from `framer-motion`. |
| `react-3d` | Requires React + Three.js or React Three Fiber. | Imports from `three` or `@react-three/fiber`. |

**Escalation Rule**: Assign the **highest dependency tier**: `html-css` < `vanilla-js` < `react` < `react-motion` < `react-3d`.

---

## 4. Cross-Dimension Naming Collision Matrix

All 47 values across 7 dimensions are verified to be globally unique:

```
scale:       micro | compact | standard | region | viewport          (5)
placement:   embedded | flow | overlay | dock | shell                (5)
interaction: output | input | control | navigation | confirmation    (5)
lifecycle:   persistent | state-driven | on-demand | transient       (4)
motion:      none | transition | css-loop | spring | webgl           (5)
category:    status | ai-response | composer | gate | data |         (16)
             content | nav | action | setting | text-effect |
             showcase | avatar | code | workflow | diagram | scaffold
runtime:     html-css | vanilla-js | react | react-motion | react-3d (5)
                                                           Total:    47
```

> **Verification**: No value string appears in more than one dimension. An Agent can identify any token value without knowing which dimension it belongs to.

---

## 5. JSON Schema

### 5.1 Token Object Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "scale":       { "enum": ["micro", "compact", "standard", "region", "viewport"] },
    "placement":   { "enum": ["embedded", "flow", "overlay", "dock", "shell"] },
    "interaction": { "enum": ["output", "input", "control", "navigation", "confirmation"] },
    "lifecycle":   { "enum": ["persistent", "state-driven", "on-demand", "transient"] },
    "motion":      { "enum": ["none", "transition", "css-loop", "spring", "webgl"] },
    "category":    { "enum": ["status", "ai-response", "composer", "gate", "data", "content", "nav", "action", "setting", "text-effect", "showcase", "avatar", "code", "workflow", "diagram", "scaffold"] },
    "runtime":     { "enum": ["html-css", "vanilla-js", "react", "react-motion", "react-3d"] }
  },
  "required": ["scale", "placement", "interaction", "lifecycle", "motion", "category", "runtime"],
  "additionalProperties": false
}
```

---

## 6. Combination Query Patterns

Feature tokens enable disambiguation through multi-dimensional filtering:

### 6.1 "I need a loading indicator for a button"
- `scale: micro` + `placement: embedded` + `category: status`
- **Result**: `ld-arc`, `ld-ring`, `ld-linear-dots` (excludes `loading-state`, which is `standard` + `flow`).

### 6.2 "Show AI thinking with step-by-step reasoning"
- `category: status` + `scale: standard` + `lifecycle: state-driven`
- **Result**: `thinking-state` (excludes `loading-state`, which lacks accordion reasoning traces).

### 6.3 "A search input that morphs from an icon"
- `category: composer` + `motion: spring`
- **Result**: `morph-search-capsule` (excludes `search`, which is `overlay` + `transition`).

### 6.4 "3D animated AI assistant avatar"
- `category: avatar` + `motion: webgl`
- **Result**: `fluid-morph-orb`, `marbled-fluid-orb`, `particle-dot-orb`.

---

## 7. Extension Protocol

### 7.1 Adding a New Value to an Existing Dimension
1. **Verify isolation**: Must not overlap semantically with existing values in the same dimension.
2. **Verify global uniqueness**: Must not exist in any other dimension.
3. **Verify necessity**: At least one component must require this new value.
4. **Update specification and schema**: Update `FEATURE_TOKENS.md` and the JSON Schema.

### 7.2 Adding a New Dimension
1. **Verify orthogonality**: Must measure an aspect not captured by any existing dimension combination.
2. **Minimum cardinality**: Must have at least 3 distinct values.
3. **Coverage**: Must be applicable to all components.

---

## 8. Anti-Patterns

| Anti-Pattern | Why It Fails | Correct Approach |
|:---|:---|:---|
| Assigning multiple values per dimension | Breaks mutual exclusivity; query results become ambiguous | Choose the PRIMARY value. Use `when`/`when_not` prose for nuance. |
| Creating a dimension with only 2 values | Collapses into a boolean flag, adding schema complexity for no retrieval benefit | Encode as a boolean field or tag instead. |
| Reusing a value name across dimensions | Agents reading a flat token list cannot disambiguate without knowing the dimension | Every value must be globally unique (see Section 4). |
| Classifying by intended usage rather than inherent capability | "This button COULD be used for confirmation" — but it's a button, not a gate | Classify by what the component IS and DOES, not by one hypothetical use case. |
| Granularity explosion in `category` | Adding a new category for every new component makes the system a 1:1 lookup table | A category should cover at least 2-3 components. |
