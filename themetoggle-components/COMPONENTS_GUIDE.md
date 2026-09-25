# Minimalist Theme Toggles Guide

> **Library**: `themetoggle-components`  
> **Source**: [toggles.dev](https://toggles.dev/) / [@theme-toggles](https://github.com/alfiejones/theme-toggles)  
> **License**: MIT License  
> **Total Components**: 14  
> **Classification**: `style: minimal_theme_toggles` | `category: setting` | `interaction: control` | `runtime: html-css`

---

## 1. Overview & Visual DNA

The `themetoggle-components` suite provides 14 drop-in, zero-runtime, animated theme toggles designed to scale effortlessly with typography (`1em x 1em`).

### Key Engineering Features:
- **Zero Framework Lock-in**: Standard semantic HTML `<button><svg>` with pure CSS transitions.
- **Color Decoupling**: Built entirely on `currentColor`, adapting automatically to parent font colors.
- **Reduced Motion Built-In**: All transitions are wrapped in `@media (prefers-reduced-motion: no-preference)` guards.
- **Bi-directional Dark Mode Matching**: Applies dark transitions when `.dark` is placed on the `<button>` directly, OR when placed on any parent ancestor (e.g. `<html class="dark">` or `<body class="dark">`).
- **Flexible Duration Custom Property**: Control animation duration per component or globally using `--toggles-dot-dev--duration` (or individual `--toggles-<slug>--duration`).

---

## 2. Directory Layout

```
themetoggle-components/
|-- catalog.json                  # Complete machine-readable catalog
|-- themetoggle.manifest.json     # Agent-first routing manifest
|-- COMPONENTS_GUIDE.md           # This integration and reference guide
|-- index.html                    # Human developer offline visual gallery
|-- shared/
|   `-- base.css                 # Unified stylesheet with all keyframes and .theme-toggle base utility
`-- components/
    |-- around/                   # around.snippet.html + around.meta.md
    |-- classic/                  # classic.snippet.html + classic.meta.md
    |-- dark-inner/
    |-- dark-side/
    |-- eclipse/
    |-- expand/
    |-- spin/
    |-- half-sun/
    |-- horizon/
    |-- inner-moon/
    |-- lightbulb/
    |-- light-switch/
    |-- simple/
    `-- within/
```

---

## 3. Style Harmonization

### Harmonizing with AI-Native Productivity (`beautifului-components`)
Place the toggle in the top navbar or prompt bar action cluster. Its `currentColor` automatically matches neutral dark-mode tones:

```html
<header class="flex items-center justify-between px-4 py-2 border-b border-neutral-800 bg-neutral-950 text-neutral-400">
  <span class="text-xs font-mono">WORKSPACE // MAIN</span>
  <div class="flex items-center gap-2">
    <!-- Embed classic theme toggle -->
    <button type="button" class="theme-toggle hover:text-neutral-100" onclick="document.documentElement.classList.toggle('dark')">
      <!-- Insert classic.snippet.html SVG -->
    </button>
  </div>
</header>
```

### Harmonizing with Apple Human Interface (`guidelines/apple-design`)
Place the toggle inside an Apple frosted liquid glass sheet with 44pt touch targets:

```html
<div style="background: var(--apple-material-regular); backdrop-filter: var(--apple-blur-regular); border-radius: var(--apple-radius-lg); padding: 8px 16px; display: inline-flex; align-items: center; min-height: 44px;">
  <button type="button" class="theme-toggle" style="color: var(--apple-text-primary);" onclick="document.documentElement.classList.toggle('dark')">
    <!-- Insert simple.snippet.html SVG -->
  </button>
</div>
```

---

## 4. Component Manifest Table

| Slug | Title | Chinese Title | Default Duration | Visual Metaphor |
| :--- | :--- | :--- | :---: | :--- |
| `classic` | Classic | 经典日夜切换 | 400ms | 8 radiant rays collapsing into a crescent moon |
| `around` | Around | 环绕日夜切换 | 500ms | 6 orbiting satellites fading sequentially around rotating core |
| `dark-inner` | Dark Inner | 内旋日夜切换 | 400ms | Center circle rotating inward with internal mask |
| `dark-side` | Dark Side | 侧旋日夜切换 | 400ms | Lateral displacement into night shadow |
| `eclipse` | Eclipse | 日蚀切换 | 500ms | Total lunar/solar shadow sweeping across disc |
| `expand` | Expand | 膨胀日夜切换 | 500ms | Radial expansion before contracting to crescent |
| `spin` | Spin | 旋转日夜切换 | 500ms | Rapid spinning rays collapsing into crescent moon |
| `half-sun` | Half Sun | 半日切换 | 500ms | 180-degree rotating dual-faced geometric coin |
| `horizon` | Horizon | 地平线日夜切换 | 400ms | Sun descending beneath horizontal dividing plane as moon ascends |
| `inner-moon` | Inner Moon | 内核月亮切换 | 500ms | Rotating inner core revealing crescent cutout |
| `lightbulb` | Lightbulb | 灯泡开关 | 500ms | Incandescent filament bulb glowing and dimming |
| `light-switch` | Light Switch | 墙壁开关 | 350ms | Physical wall rocker toggle switch clicking up and down |
| `simple` | Simple | 极简纯粹切换 | 500ms | Cleanest zero-fluff vector morphing sun to moon |
| `within` | Within | 内嵌日夜切换 | 500ms | Concentric circle morphing to lunar crater |
