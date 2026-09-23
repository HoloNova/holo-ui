# Contributing to Holo UI Vault

Thank you for contributing to Holo UI Vault. This repository is an Agent-First, curated code vault providing production-ready UI primitives, design tokens, and interaction patterns designed specifically for AI Agents and developers to retrieve and assemble with minimal token overhead and zero code hallucinations.

---

## 1. Core Principles

Holo UI Vault differs fundamentally from general UI libraries and prompt collections:

1. **Code-Biased, Not Abstract**: Prompt guidelines and Skills that merely tell an Agent to "make it look modern" fail because the Agent must hallucinate complex CSS from scratch. We provide verified, copy-pasteable HTML/CSS code snippets and authoritative design tokens.
2. **Agent-First Retrieval**: Every component and guideline must be indexed in `INDEX.json`. An AI Agent should be able to query `INDEX.json` and read only the exact snippet or token file required, without scanning directories or consuming unnecessary context tokens.
3. **Curated & Harmonized**: We accept distinct design styles (e.g., AI-Native Productivity, Apple Human Interface, Linear Dark, Brutalist), provided they include clear rules on *when to use*, *when not to use*, and *how to harmonize* with other systems.
4. **Clean Engineering Typography**: Strictly no emojis. Documentation must use clean markdown, structured tables, ASCII trees, and GitHub alert blocks.

---

## 2. What You Can Contribute

We welcome two primary types of contributions:

### Type A: Concrete Component Libraries
Full, self-contained UI primitives (similar to `beautifului-components/`):
- Semantic HTML markup (`.snippet.html`).
- CSS variables and utility classes (Tailwind CSS compatible or pure CSS tokens).
- Component metadata (`.meta.md`) describing states, animations, variants, and event hooks.

### Type B: Authoritative Design System Specifications
Official design language tokens and foundations (similar to `guidelines/apple-design/`):
- Standalone CSS token files (`tokens.css`) specifying colors, elevation, materials, blur filters, radii, and spring physics.
- Structured foundation guides covering typography scales, touch targets, and layout grids.
- Anti-hallucination prompt presets for Agent generation.
- Note: Do not submit synthetic, fabricated code snippets for official design systems. Retain only verified tokens, specifications, and reference patterns.

---

## 3. Directory Structure Standards

When onboarding a new UI style or library, organize files within a dedicated top-level directory or under `guidelines/`:

```
holo-ui/
|-- INDEX.json                       # Central dual-dimension index (Style + Function)
|-- ROUTER.json                      # Legacy routing compatibility layer
|-- STYLE_AND_SELECTION_GUIDE.md     # Engineering decision guide & harmonization matrix
|-- CONTRIBUTING.md                  # This contributor SOP
|
|-- <library-name>-components/       # Concrete component library (Type A)
|   |-- components/
|   |   |-- <category>/
|   |   |   |-- <component-id>.snippet.html
|   |   |   `-- <component-id>.meta.md
|   |-- shared/
|   |   `-- base.css                 # Shared variables, animations, reset
|   `-- catalog.json                 # Category manifest
|
`-- guidelines/<design-system>/      # Authoritative design specifications (Type B)
    |-- tokens/
    |   `-- tokens.css               # Exported CSS custom properties
    |-- foundations/                 # Typography, materials, layout, motion
    |-- patterns/                    # Verified interaction patterns
    `-- PROMPT_PRESET.md             # Precise agent generation preset
```

---

## 4. Submission Checklist

Before submitting a Pull Request, verify every item:

### 1. File Verification
- [ ] Snippet files (`.snippet.html`) are functional standalone or rely strictly on the library's `shared/base.css`.
- [ ] No external runtime dependencies that require bundlers (no React JSX/TypeScript build-step requirements inside `.snippet.html` — plain HTML with CSS variables and optional vanilla JS hooks).
- [ ] Touch targets adhere to minimum accessibility standards (minimum 44x44px for touch interfaces).

### 2. Index Registration
- [ ] Registered in `INDEX.json` under `by_style`:
  - Defined `name`, `aesthetic`, `when_to_use`, and `when_not_to_use`.
  - Listed all component paths or guideline paths.
- [ ] Registered in `INDEX.json` under `by_function`:
  - Added components to the relevant functional category (`ai_reasoning_and_states`, `inputs_and_prompts`, `human_in_the_loop_and_tools`, `data_and_diff`, `cards_and_knowledge`, `navigation_and_presentation`, or a justified new functional category).
  - Specified `recommended_when` for each item.

### 3. Context Guard Compliance
- [ ] Visual preview galleries (like `index.html`) must include a header comment warning AI Agents not to read the file during single-task retrieval.
- [ ] Metadata files (`.meta.md`) must be concise (under 100 lines) and focus on technical implementation details.

### 4. Style & Copy Guidelines
- [ ] **No Emojis**: Do not use emojis anywhere in code, file names, markdown, commit messages, or JSON fields.
- [ ] **No Author/Tooling Noise**: Do not include author biographies, social links, or marketing text. Focus solely on style properties, file locations, usage scenarios, and token definitions.
- [ ] **Harmonization Section**: Provide rules for how your submitted style interacts with other established styles in `STYLE_AND_SELECTION_GUIDE.md`.

---

## 5. How to Add a Component to INDEX.json

Here is an example entry when registering a new component in `INDEX.json`:

```json
{
  "id": "metric-badge",
  "style": "ai_native_productivity",
  "file": "beautifului-components/components/cards/metric-badge.snippet.html",
  "recommended_when": "Displaying real-time latency, token usage, or model performance counters."
}
```

---

## 6. Pull Request Workflow

1. Fork the repository and create a feature branch:
   ```bash
   git checkout -b feature/add-linear-dark-components
   ```
2. Add your component snippets, tokens, and metadata.
3. Update `INDEX.json` and `STYLE_AND_SELECTION_GUIDE.md`.
4. Run a sanity check to verify relative paths:
   ```bash
   # Ensure all referenced files exist
   python -c "import json, os; r = json.load(open('ROUTER.json', encoding='utf-8')); [print('Missing:', f) for k, f in r['components'].items() if not os.path.exists(f)]"
   ```
5. Commit with a clean conventional commit message:
   ```bash
   git commit -m "feat(linear-dark): introduce 6 command menu and shortcut primitives"
   ```
6. Open a Pull Request on GitHub against `main`.
