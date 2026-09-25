---
style_id: "micro-motion-indicators"
style_aliases: ["loading-spinners", "pure-css-loaders", "zero-runtime-spinners"]
version: "1.0.0"
token_source: "./shared/base.css"
target_runtime: "agent-first"
primary_stack: "Pure HTML/SVG + CSS Custom Properties"
---

# Micro-Motion Indicators Design Specification

> **AI Agent Context Guard**: High-density engineering contract. Zero conversational filler. Adhere strictly to the machine-checkable constraints below when generating DOM and CSS.

---

### 1. Hard Constraints (RFC 2119)

- **MUST** be zero-runtime; never import JavaScript libraries for micro-spinners or status indicators.
- **MUST** inherit color from surrounding text via `currentColor` unless explicit semantic feedback (green/red) is required.
- **MUST** respect accessibility constraints via `@media (prefers-reduced-motion: reduce)` on all continuous loops.
- **MUST** control size strictly via `--ld-size` (default: `20px`; button-inline: `14px-16px`; full-page: `32px-48px`).
- **MUST NOT** exceed 48px bounding box; loaders larger than 48px are considered layout violations (use full skeleton screens instead).
- **NEVER** block user input across the whole viewport with an inline micro-spinner.

---

### 2. Token Registry & Variable Matrix

#### 2.1 CSS Custom Properties

| Variable | Default Value | Semantic Role | Override Example |
| :--- | :--- | :--- | :--- |
| `--ld-size` | `20px` | Outer bounding box width & height | `style="--ld-size: 16px;"` |
| `--ld-duration` | Component-specific (`800ms` ~ `1200ms`) | One complete animation cycle | `style="--ld-duration: 600ms;"` |
| `--ld-play-state` | `running` | Pause/Resume animation state | `style="--ld-play-state: paused;"` |
| `color` | `currentColor` | Visual fill and stroke hue | `class="text-blue-500"` or `color: #007AFF` |

#### 2.2 Sizing Scale

| Usage Scenario | Recommended `--ld-size` | Best Fitting Indicators |
| :--- | :--- | :--- |
| `Inline Button Suffix` | `14px - 16px` | `ld-arc`, `ld-linear-dots` |
| `Input Trailing Icon` | `16px - 18px` | `ld-ring`, `ld-classic-v2` |
| `Chat Typing Indicator` | `18px - 22px` | `ld-bouncing-dots`, `ld-wave` |
| `Widget Card Center` | `24px - 32px` | `ld-dual`, `ld-radar`, `ld-orbit` |
| `AI Inference Buffer` | `28px - 40px` | `ld-atom`, `ld-comet` |

---

### 3. Motion & Animation Specs

| Animation Mechanism | Timing Function | Keyframe | Typical Duration |
| :--- | :--- | :--- | :--- |
| `Continuous Rotation` | `linear` | `rotate(0deg) to rotate(360deg)` | `800ms` |
| `Harmonic Bounce` | `cubic-bezier(0.45, 0.05, 0.55, 0.95)` | `translateY(0) to translateY(-40%)` | `1000ms` |
| `Radar Sonar Ping` | `cubic-bezier(0.1, 0.9, 0.2, 1)` | `scale(0.8), opacity(1) to scale(2.2), opacity(0)` | `1400ms` |
| `Reduced Motion Fallback` | `none` | Static rendering at `opacity: 0.7` | `0s` |

---

### 4. Component Assembly Recipes

#### 4.1 Submitting Button with Inline Arc Spinner
```html
<button style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 40px; padding: 0 16px; border-radius: 8px; background: #007AFF; color: #FFFFFF; font-size: 14px; font-weight: 500; border: none; cursor: wait;">
  <!-- ld-arc snippet -->
  <svg class="ld-arc ld-arc-spin" viewBox="0 0 24 24" style="--ld-size: 16px; fill: none; stroke: currentColor; stroke-width: 2.5; stroke-linecap: round; stroke-dasharray: 40 60;">
    <circle cx="12" cy="12" r="9" />
  </svg>
  <span>Processing...</span>
</button>
```

#### 4.2 Conversational Typing Bubble
```html
<div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(0, 0, 0, 0.05); padding: 8px 14px; border-radius: 16px; color: #525252;">
  <span style="font-size: 13px; font-family: sans-serif;">Agent is typing</span>
  <!-- ld-bouncing-dots snippet -->
  <div class="ld-bouncing-dots" style="--ld-size: 18px; display: inline-flex; gap: 3px; align-items: center;">
    <span style="width: 4px; height: 4px; border-radius: 50%; background: currentColor;"></span>
    <span style="width: 4px; height: 4px; border-radius: 50%; background: currentColor;"></span>
    <span style="width: 4px; height: 4px; border-radius: 50%; background: currentColor;"></span>
  </div>
</div>
```
