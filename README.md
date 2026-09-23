[English](README.md) | [简体中文](README_zh.md)

# Holo UI Vault

> An Agent-First, curated code repository providing production-ready UI primitives, design tokens, and interaction patterns. Built to empower autonomous coding agents and developers to retrieve, compose, and assemble user interfaces with zero code hallucinations and minimal token overhead.

> [!IMPORTANT]
> **Agent Retrieval Protocol & Context Guards**
> - **Dual-Dimension Master Index**: Direct queries to [`INDEX.json`](./INDEX.json). Retrieve items indexed by design style (`by_style`) or component function (`by_function`).
> - **Zero Directory Scanning**: Do not recursively search or read directory trees. Retrieve only the target `*.snippet.html` and the required `shared/base.css` or `tokens.css`.
> - **Context Guard**: Never load `beautifului-components/index.html` (32KB human visual gallery; consuming it in automated tasks will exhaust context tokens).
> - **Anti-Over-Assembly**: Review [`STYLE_AND_SELECTION_GUIDE.md`](./STYLE_AND_SELECTION_GUIDE.md) to prevent over-assembling compound components for simple user prompts.

---

## 1. Problem & Core Identity

Traditional AI "Skills" and prompt collections provide only abstract textual guidelines (e.g., "use 44pt touch targets", "add subtle shadows"). Consequently, LLMs must hallucinate complete CSS and HTML structures from memory, producing broken layouts, incorrect corner radii, and inconsistent component states.

Holo UI Vault solves this problem by functioning as a **code-biased repository**:
- **Verified Code Primitives**: Ready-to-use `.snippet.html` markup backed by standalone CSS tokens and keyframes.
- **Authoritative Design Guidelines**: Exact CSS variables, spring physics, and foundation tokens for official design languages (such as Apple Human Interface Guidelines).
- **Dual-Dimension Architecture**: Agents can look up components either from a style perspective (e.g., AI-Native Productivity) or a functional perspective (e.g., prompt inputs, reasoning chains, approval cards).
- **Zero Framework Lock-in**: Semantic HTML markup styled with CSS custom properties and utility classes. Easily portable into React, Vue, Svelte, or plain HTML.

---

## 2. Master Navigation & Index

The repository provides structured indices tailored for machine lookup and developer reference:

| File | Type | Purpose |
|:---|:---|:---|
| [`INDEX.json`](./INDEX.json) | Machine Index | Master dual-dimension index (`by_style`, `by_function`, and `style_harmonization`). |
| [`ROUTER.json`](./ROUTER.json) | Fast Router | High-speed dispatch map mapping user intents and component IDs to file paths. |
| [`STYLE_AND_SELECTION_GUIDE.md`](./STYLE_AND_SELECTION_GUIDE.md) | Technical Guide | Style quadrant analysis, anti-over-assembly rules, and token harmonization patterns. |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Standard SOP | Contribution criteria for submitting new component libraries and design tokens. |

---

## 3. Curated Vault Index

### A. Concrete Component Libraries

| Library | Source | Style DNA | Components | Tech Stack | Status |
|:---|:---|:---|:---:|:---|:---:|
| [`beautifului-components`](./beautifului-components/) | [beautifului.dev](https://www.beautifului.dev/) | AI-Native Productivity (Dark-first, 0.5px hairlines, thinking states, prompt bars) | 21 | Tailwind CSS v4 + OKLCH Tokens | Complete |
| [`rewampui-components`](./rewampui-components/) | [rewampui.com](https://rewampui.com/) | Kinetic Motion & Tactile Physics (Spring physics, 3D card orbits, fluid AI orbs, slide-to-confirm) | 30 | React 19 + Framer Motion + Three.js | Complete |
| [`loadingdev-components`](./loadingdev-components/) | [loading.dev](https://loading.dev/) | Micro-Motion Loaders & Spinners (Pure CSS/SVG, zero-runtime, a11y reduced-motion, radial, dots, radar) | 29 | Pure HTML/SVG + CSS Custom Properties | Complete |

### B. Authoritative Design Systems & Tokens

| Design System | Authority | Core Aesthetic | Assets | Status |
|:---|:---|:---|:---|:---:|
| [`guidelines/apple-design`](./guidelines/apple-design/) | [Apple HIG](https://developer.apple.com/design/) | Human Interface (Liquid Glass, squircles, spring physics, 44pt touch targets) | `tokens.css`, typography, materials, motion, pattern guides | Complete |

---

## 4. Repository Topology

The repository follows a strict modular topology:

```
holo-ui/
|-- INDEX.json                       # Central dual-dimension index
|-- ROUTER.json                      # Fast intent router
|-- STYLE_AND_SELECTION_GUIDE.md     # Style taxonomy and anti-over-assembly rules
|-- CONTRIBUTING.md                  # Contributor guidelines
|
|-- beautifului-components/          # Component library: AI-Native Productivity
|   |-- catalog.json                 # Machine manifest of components
|   |-- COMPONENTS_GUIDE.md          # Integration guide and CSS variables
|   |-- index.html                   # Offline preview gallery (Human developer use only)
|   |-- shared/
|   |   `-- base.css                 # OKLCH tokens, reset, animations
|   |-- updater/                     # Source tracking script (4-day cache policy)
|   `-- components/
|       |-- ai-states/               # loading-state, thinking-state, streaming-text
|       |-- cards/                   # recommendation-card, context-cards, insight-cards, fine-tune-card
|       |-- code/                    # code-block
|       |-- data/                    # diff-table, records-table, filter-table
|       |-- input/                   # prompt-bar, chat-composer, search
|       |-- interaction/             # approval-card, tool-chips, selection-actions
|       |-- layout/                  # agent-screen
|       |-- navigation/              # sidebar-nav
|       |-- task-management/         # task-rows
|       `-- visualization/           # flowchart
|
|-- rewampui-components/             # Component library: Kinetic Motion & Tactile Physics
|   |-- catalog.json                 # Machine manifest (30 curated motion primitives)
|   |-- COMPONENTS_GUIDE.md          # Integration guide, SF Pro rules, and spring params
|   |-- shared/
|   |   |-- tokens.css               # Lilac, Orange, and Neutral color tokens
|   |   |-- base.css                 # Base motion keyframes, blur filters, and reset
|   |   `-- siteTheme.js             # Theme synchronization and persistence helper
|   `-- components/
|       |-- buttons/                 # slide-to-confirm, shimmer, rainbow, gloss, etc.
|       |-- toggles/                 # day-night-sky, landscape-orb, glass-orb
|       |-- search-bars/             # morph-search-capsule, animated-search-demo
|       |-- text/                    # kinetic-reel, split-reveal, scramble, etc.
|       |-- cards/                   # arch-carousel, 3d-orbit, flip-deck, etc.
|       |-- navbars/                 # hero-morph, magnetic-pill, pill-expand
|       `-- ai-ui/                   # fluid-morph-orb, marbled-fluid, particle-dot
|
|-- loadingdev-components/           # Component library: Micro-Motion Loaders & Spinners
|   |-- catalog.json                 # Machine manifest of 29 indicators
|   |-- loadingdev.manifest.json     # Agent fast router manifest
|   |-- COMPONENTS_GUIDE.md          # Integration guide and CSS variables
|   |-- index.html                   # Offline preview gallery (Human developer use only)
|   |-- shared/
|   |   `-- base.css                 # 29 pure CSS @keyframes animations and variables
|   `-- components/
|       |-- radial/                  # ld-arc, ld-ring, ld-comet, ld-dual, ld-radar, etc.
|       |-- dots/                    # ld-bouncing-dots, ld-linear-dots, ld-eclipse, etc.
|       |-- classic/                 # ld-classic, ld-classic-v2, ld-loading
|       |-- geometric/               # ld-blocks, ld-gather, ld-swirl, ld-morph, etc.
|       |-- wave-pulse/              # ld-pulse, ld-ripple, ld-cascade, ld-wave
|       `-- orbital/                 # ld-atom, ld-orbit
|
`-- guidelines/apple-design/         # Design specification: Apple Human Interface
    |-- tokens/
    |   `-- tokens.css               # Apple liquid glass, squircles, and spring tokens
    |-- foundations/                 # Typography, materials, layout, motion
    |-- patterns/                    # Modal sheets, navigation hierarchies
    |-- resources/                   # Official HIG links and video references
    `-- PROMPT_PRESET.md             # Precise agent prompt preset
```

---

## 5. Agent Retrieval SOP

When an AI coding agent is tasked with building or enhancing a user interface, it must follow this execution flow:

```
                  [User UI Request]
                          |
                          v
         [Step 1: Read ROUTER.json (~1,100 tokens)]
         Map request to component ID or style.
         +-- Known component ID --> get snippet path --> Step 3
         +-- Known style/intent --> note manifest path --> Step 2
         +-- Ambiguous --> match keywords --> identify style --> Step 2
                          |
                          v
      [Step 2: Read relevant *.manifest.json (~625-875 tokens)]
      Select component ID by matching tags and "when" field.
      (Only load 1 manifest, never all 3)
                          |
                          v
        [Step 3: Retrieve Minimal Target Files]
        - Fetch single *.snippet.html/.jsx file.
        - Fetch shared/base.css or tokens.css.
        - DO NOT fetch index.html or scan directories.
                          |
                          v
               [Step 4: Integrate Code]
        Assemble HTML markup and CSS tokens into project.
        Optional: read *.meta.md for customization tips.
```

---

## 6. Style Harmonization

Holo UI Vault supports composing interaction structures from one library with the visual language of another. For example, Beautiful UI's interactive components (such as `thinking-state` or `approval-card`) can be harmonized with Apple Human Interface tokens:

```css
/* Harmonize Beautiful UI component container to Apple Material */
@import "guidelines/apple-design/tokens/tokens.css";

.beautifului-container {
  background: var(--apple-material-regular) !important;
  backdrop-filter: var(--apple-blur-regular) !important;
  -webkit-backdrop-filter: var(--apple-blur-regular) !important;
  border-radius: var(--apple-radius-xl) !important;
  border: 1px solid var(--apple-separator) !important;
  transition-timing-function: var(--apple-ease-spring) !important;
}
```

Detailed harmonization rules and anti-over-assembly principles are documented in [`STYLE_AND_SELECTION_GUIDE.md`](./STYLE_AND_SELECTION_GUIDE.md).

---

## 7. Open Source & Licensing

- **Component Libraries**: Component implementations in `beautifului-components/` are licensed under the [MIT License](https://www.beautifului.dev/license).
- **Design Guidelines & Specifications**: Curated design parameters and foundation summaries in `guidelines/apple-design/` are compiled for educational and reference purposes under Fair Use. Apple, iOS, macOS, visionOS, and SF Symbols are registered trademarks of Apple Inc.
- **Repository Architecture & Tools**: The repository structure, `INDEX.json`, `ROUTER.json`, and automation scripts are licensed under the MIT License.
