# Beautiful UI Components — AI Agent Guide

> **Source**: https://www.beautifului.dev/  
> **Last synced**: 2026-09-21  
> **Tech stack**: Tailwind CSS v4.3.3 + Pure HTML (no JS framework required)  
> **Font stack**: Inter (sans-serif) + JetBrains Mono (monospace)

> [!CAUTION]
> **🤖 Agent Context Guard: DO NOT READ `index.html`!**  
> `index.html` is an 800-line human visual preview file (32KB). Reading it will waste 8,000+ context tokens.  
> To integrate a component, **read ONLY its specific `*.snippet.html` file** and `shared/base.css`.

---

## 🤖 How to Use This Library (Agent Workflow)

### Step 1: Find a component path
Check the table below or query `catalog.json` by tag:
```
catalog.json → components[].tags  (e.g., "loading", "chat", "approval")
```

### Step 2: Get the code (Read ONLY this file)
Read the single targeted `.snippet.html` file (typically 1~3KB):
```
components/<category>/<component-id>.snippet.html
```

### Step 3: Read the docs
Read the `.meta.md` file for usage notes, customization tips, and dependencies:
```
components/<category>/<component-id>.meta.md
```

### Step 4: Preview (optional)
Open `.demo.html` in a browser to see the component live (includes theme switcher):
```
components/<category>/<component-id>.demo.html
```

---

## 📁 Directory Structure

```
beautifului-components/
├── COMPONENTS_GUIDE.md          ← YOU ARE HERE (Agent entry point)
├── catalog.json                 ← Machine-readable component index
├── index.html                   ← Human-facing visual browser
│
├── shared/
│   ├── base.css                 ← ALL design tokens + animations (required)
│   └── tailwind-info.md         ← Tailwind CDN setup instructions
│
└── components/
    ├── ai-states/               ← AI-specific state components
    │   ├── loading-state.*
    │   ├── thinking-state.*
    │   └── streaming-text.*
    │
    ├── interaction/             ← User interaction components
    │   ├── approval-card.*
    │   ├── tool-chips.*
    │   └── selection-actions.*
    │
    ├── task-management/         ← Task & workflow components
    │   └── task-rows.*
    │
    ├── input/                   ← Input & prompt components
    │   ├── chat-composer.*
    │   ├── prompt-bar.*
    │   └── search.*
    │
    ├── cards/                   ← Card & information display
    │   ├── recommendation-card.*
    │   ├── context-cards.*
    │   ├── insight-cards.*
    │   └── fine-tune-card.*
    │
    ├── data/                    ← Data display components
    │   ├── diff-table.*
    │   ├── records-table.*
    │   └── filter-table.*
    │
    ├── navigation/              ← Navigation components
    │   └── sidebar-nav.*
    │
    ├── visualization/           ← Visual/diagram components
    │   └── flowchart.*
    │
    ├── code/                    ← Code display
    │   └── code-block.*
    │
    └── layout/                  ← Full-page layouts
        └── agent-screen.*
```

Each component has **3 files**:
| File | Purpose | Who uses it |
|------|---------|-------------|
| `*.snippet.html` | Clean HTML code only | **AI Agents** copying code |
| `*.meta.md` | Usage docs, customization, deps | **AI Agents** understanding context |
| `*.demo.html` | Full preview page (opens in browser) | **Humans** visual preview |

---

## 🎨 Design System

### Required Setup
Include these in every page that uses a Beautiful UI component:

```html
<!-- 1. Tailwind CSS v4 (via CDN) -->
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>

<!-- 2. Beautiful UI base styles (design tokens + animations) -->
<link rel="stylesheet" href="/path/to/shared/base.css">

<!-- OR inline the base.css contents in a <style> tag -->
```

### CSS Variable Quick Reference
```css
/* Background layers (light → dark) */
--page      /* outermost page bg */
--canvas    /* main content area bg */
--surface   /* card/panel bg (white in light) */
--inset     /* recessed/inset bg */
--field     /* input field bg */
--hover     /* hover state bg */
--hover-2   /* stronger hover bg */

/* Text */
--ink       /* primary text */
--ink-2     /* secondary text */
--ink-3     /* tertiary/muted text */

/* Borders */
--line        /* default border */
--line-strong /* stronger border */

/* Accent (blue) */
--accent      /* primary accent */
--accent-ink  /* darker accent for text */
--accent-tint /* light accent background */

/* Status */
--green / --green-tint
--orange / --orange-tint
--red / --red-tint

/* Shadows */
--shadow-hairline  /* 1px border-like shadow */
--shadow-btn       /* button shadow */
--shadow-card      /* card shadow */
--shadow-raised    /* elevated element shadow */
--shadow-overlay   /* modal/overlay shadow */
```

### Dark Mode
Add class `dark` to `<html>` or any container element:
```html
<html class="dark"> ... </html>
<!-- OR -->
<div class="dark"> ... </div>
```

### Border Radius Tokens
```css
--radius-chip:    6px   /* small chips/badges */
--radius-control: 8px   /* buttons, inputs */
--radius-card:    10px  /* cards */
--radius-window:  14px  /* demo surfaces/windows */
```

### Key Animations (defined in base.css)
| Animation | Usage |
|-----------|-------|
| `shimmer-text` | Loading shimmer on text |
| `fade-up` | Entrance animation (elements appearing) |
| `pop-in` | Menu/dropdown appearance |
| `spin` | Spinner rotation |
| `pixel-on` | Pixel grid loader |
| `caret-blink` | Text cursor blink |
| `fade-in` | Opacity fade in |

---

## 📋 Component Quick Reference

| # | ID | Name | Direct Snippet File Path | Key Tags |
|---|----|----|--------------------------|---------|
| 01 | `loading-state` | Loading State | `components/ai-states/loading-state.snippet.html` | loading, shimmer, animation |
| 02 | `thinking-state` | Thinking | `components/ai-states/thinking-state.snippet.html` | thinking, expandable, traces |
| 03 | `streaming-text` | Streaming Text | `components/ai-states/streaming-text.snippet.html` | streaming, sources, follow-ups |
| 04 | `approval-card` | Approval Card | `components/interaction/approval-card.snippet.html` | human-in-the-loop, form, hitl |
| 05 | `tool-chips` | Tool Chips | `components/interaction/tool-chips.snippet.html` | chips, tool-calls, agent |
| 06 | `task-rows` | Task Rows | `components/task-management/task-rows.snippet.html` | tasks, status, running |
| 07 | `chat-composer` | Chat | `components/input/chat-composer.snippet.html` | chat, message, composer |
| 08 | `prompt-bar` | Prompt Bar | `components/input/prompt-bar.snippet.html` | prompt, ai-input |
| 09 | `recommendation-card` | Recommendation Card | `components/cards/recommendation-card.snippet.html` | suggestion, next-action |
| 10 | `context-cards` | Context Cards | `components/cards/context-cards.snippet.html` | context, preview |
| 11 | `diff-table` | Diff Table | `components/data/diff-table.snippet.html` | diff, comparison, code |
| 12 | `records-table` | Records Table | `components/data/records-table.snippet.html` | table, data, records |
| 13 | `filter-table` | Filter Table | `components/data/filter-table.snippet.html` | table, filter, search |
| 14 | `sidebar-nav` | Sidebar Nav | `components/navigation/sidebar-nav.snippet.html` | sidebar, navigation, menu |
| 15 | `search` | Search | `components/input/search.snippet.html` | search, dropdown, results |
| 16 | `flowchart` | Flowchart | `components/visualization/flowchart.snippet.html` | diagram, graph, nodes |
| 17 | `insight-cards` | Insight Cards | `components/cards/insight-cards.snippet.html` | metric, dashboard, chart |
| 18 | `code-block` | Code Block | `components/code/code-block.snippet.html` | syntax, highlight, display |
| 19 | `fine-tune-card` | Fine-tune Card | `components/cards/fine-tune-card.snippet.html` | model, configuration, ai |
| 20 | `selection-actions` | Selection Actions | `components/interaction/selection-actions.snippet.html` | bulk, contextual, toolbar |
| 21 | `agent-screen` | Agent Screen | `components/layout/agent-screen.snippet.html` | full-page, desktop, agent |

---

## ⚡ Common Patterns

### Shimmer Loading Text
```html
<span class="shimmer-text">Loading...</span>
```
*(`.shimmer-text` is defined in `shared/base.css`)*

### Streaming Cursor
```html
<span class="stream-caret is-streaming"></span>
```

### Theme Toggle (JavaScript)
```javascript
// Toggle dark mode
document.documentElement.classList.toggle('dark');
// Persist
localStorage.setItem('bui-theme', isDark ? 'dark' : 'light');
```

### Card Shell Pattern
```html
<div class="rounded-card bg-surface shadow-card p-3">
  <!-- content -->
</div>
```
*(requires Tailwind CSS + base.css)*

---

## 🔄 Source Site Update Detection

A built-in detection script monitors [beautifului.dev](https://www.beautifului.dev/) for changes, new components, or CSS updates:

```
beautifului-components/
└── updater/
    ├── check_updates.py     ← Python detector script
    ├── last_snapshot.json   ← Site fingerprint baseline
    ├── update_log.json      ← Status log (Agent readable)
    └── README.md            ← Updater documentation
```

### Agent Check Protocol

Before integrating components into a project, an Agent can verify local library freshness:

1. **Check status**:
   ```bash
   python updater/check_updates.py --json
   ```
2. **Read `updater/update_log.json`**:
   - `use_local == true` / `status == "up-to-date"`: The local library is up-to-date (cached if within 4 days, or verified live). Proceed with local code.
   - `status == "update-available"`: The source site has shipped new components or style updates. The `changes` array lists exact additions/modifications.
   - `status == "error"`: Network unreachable; fall back to local components safely.

3. **Force manual check**:
   ```bash
   python updater/check_updates.py --force
   ```

