# Micro-Motion Loaders & Spinners — AI Agent Guide

> **Source**: https://loading.dev/ (by Jakub Krehel & Paul Faivret)  
> **License**: MIT  
> **Tech Stack**: Pure HTML/SVG + CSS Custom Properties (Zero-Runtime, 0kb JS)  
> **Asset Count**: 29 Micro-Motion Indicators

> [!CAUTION]
> **Agent Context Guard: DO NOT READ `index.html`!**  
> `index.html` is an offline visual gallery for human developers.  
> To integrate a loader into your UI, **read ONLY the specific target `*.snippet.html` file** and ensure `shared/base.css` is linked.

---

## 1. Agent Fast-Path Workflow

1. Query `INDEX.json` or this guide's table by semantic need (button spinner, typing bubble, radar scan, neural thinking).
2. Fetch the target snippet: `loadingdev-components/components/<group>/<id>.snippet.html`.
3. In your document `<head>` or layout, ensure `loadingdev-components/shared/base.css` is imported.
4. Scale via inline style `style="--ld-size: 16px;"` or override speed via `--ld-duration: 600ms;`.

---

## 2. Quick Lookup & Decision Matrix

| ID | Name | Category | Metaphor | Recommended Size | Best Fit |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ld-arc` | Arc | `radial` | Minimal open circular stroke sweeping 360 degrees. | `14px - 28px` | Compact button submitting, inline text status, search input trailing icon |
| `ld-ring` | Ring | `radial` | Luminous halo orbiting a dim concentric ring. | `16px - 32px` | Pull-to-refresh headers, modal dialog content loading, form submission |
| `ld-comet` | Comet | `radial` | Comet head with radiant fading conic-gradient streak. | `20px - 40px` | AI prompt generation buffer, token streaming warmup, high-tech crypto verification |
| `ld-dual` | Dual | `radial` | Planetary counter-rotating gears in mechanical equilibrium. | `20px - 36px` | Two-way data sync (cloud <-> local), bidirectional handshakes, compilation processes |
| `ld-trace` | Trace | `radial` | Laser beam inspecting the perimeter of a squircle card. | `24px - 48px` | Card container loading, skeleton avatar placeholders, bounding box scanning |
| `ld-snake` | Snake | `radial` | Fluid chord dynamically extending and snapping back along a circle. | `18px - 32px` | Network bandwidth buffering, video/audio segment preloading, elastic wait times |
| `ld-radar` | Radar | `radial` | Active sonar/radar sweep scanning for targets in 360 degrees. | `24px - 48px` | Device/bluetooth discovery, agent web exploration tool, security auditing |
| `ld-clock` | Clock | `radial` | Precision chronograph sweeping time. | `18px - 32px` | Scheduled cron jobs, backup progress, SLA countdowns, time-series aggregation |
| `ld-compass` | Compass | `radial` | Magnetic needle calibrating and locking onto headings. | `18px - 32px` | Map orientation alignment, sensor calibration, directional positioning |
| `ld-bouncing-dots` | Bouncing dots | `dots` | Conversational typing bubble activity. | `16px - 28px` | Chat bubble typing indicator ('Agent is typing...'), comment drafting, live messaging |
| `ld-circular-dots` | Circular dots | `dots` | Rotary LED dial with sequential illumination. | `20px - 36px` | Application initialization, dashboard widget initial load, firmware flashing |
| `ld-linear-dots` | Linear dots | `dots` | Gentle pulsating ellipsis (...) in place. | `14px - 20px` | Inline button text suffix (e.g., 'Saving...'), table cell updates, status bar footers |
| `ld-eclipse` | Eclipse | `dots` | Binary star system passing in front and behind each other. | `20px - 32px` | Model comparison (A/B testing), token/asset balance transfers, dual-agent collaboration |
| `ld-leap` | Leap | `dots` | Leapfrog progression through a stage pipeline. | `18px - 28px` | Job queue advancement, ingestion pipeline step transitions, background task workers |
| `ld-slide` | Slide | `dots` | 15-puzzle sliding tiles rotating around a perimeter. | `18px - 28px` | Layout rearrangement, card sorting/re-indexing, database partition re-balancing |
| `ld-classic` | Classic | `classic` | Apple iOS/macOS UIActivityIndicatorView radial wheel. | `20px - 36px` | Standard system-level waiting state, iOS hybrid mobile web views, modal confirmation |
| `ld-classic-v2` | Classic v2 | `classic` | Modernized high-contrast radial tick indicator. | `16px - 28px` | Modern desktop web apps, top header navigation bars, developer dashboard status |
| `ld-loading` | Loading | `classic` | Chunky 8-bit digital pixel wheel. | `20px - 36px` | Tech devtools, retro cyber interfaces, platform brand loading mark |
| `ld-blocks` | Blocks | `geometric` | Cellular automaton or matrix spreadsheet calculation wave. | `20px - 36px` | Spreadsheet math calculation, batch image processing, matrix data transformation |
| `ld-gather` | Gather | `geometric` | Mechanical docking, packaging, and module assembly. | `20px - 36px` | Module bundling (Webpack/Vite), package resolution, dependency build stage |
| `ld-swirl` | Swirl | `geometric` | Circuit loop cycling around a static central node. | `20px - 36px` | Data ETL pipelines, cache preheating, cyclic checksum validation |
| `ld-morph` | Morph | `geometric` | Topological 2D shape interpolation. | `18px - 32px` | File format conversion, view mode toggle (grid to list), vectorization rendering |
| `ld-flip` | Flip | `geometric` | 3D tumbling cube face with perspective. | `18px - 32px` | 3D model loading, flashcard generation, shader compilation |
| `ld-pulse` | Pulse | `wave-pulse` | Radio beacon ping or heartbeat expanding outward. | `16px - 32px` | Live server status, WebSocket connection heartbeat, ambient sensor ping |
| `ld-ripple` | Ripple | `wave-pulse` | Water droplet ripples or sound wave acoustic propagation. | `24px - 48px` | Voice assistant listening state ('Listening...'), audio recording, broadcast signal sending |
| `ld-cascade` | Cascade | `wave-pulse` | Multi-tiered centrifugal governor snapping back into alignment. | `20px - 36px` | High-throughput asynchronous job orchestration, fan-out query execution |
| `ld-wave` | Wave | `wave-pulse` | Graphic equalizer or sound VU meter. | `16px - 32px` | Voice speech synthesis (TTS) playback, audio stream buffering, music playback activity |
| `ld-atom` | Atom | `orbital` | Rutherford atom model with quantum orbital rings in 3D perspective. | `24px - 48px` | Deep neural reasoning, scientific simulations, complex quantum/AI computation |
| `ld-orbit` | Orbit | `orbital` | Satellite orbiting a planet along an elliptical gravitational track. | `20px - 36px` | Distributed server cluster synchronization, multi-region database replication |

---

## 3. CSS Variable System

All loaders are controlled via 4 standardized CSS custom properties:

```css
:root {
  --ld-size: 20px;            /* Control diameter or bounding dimension */
  --ld-duration: initial;     /* Cycle duration (e.g., 800ms) */
  --ld-play-state: running;   /* running | paused */
  --ld-step: 0;               /* Step delay multiplier for staggered children */
}
```

### Inherited Color
Every loader uses `currentColor` for strokes, fills, and masks. Simply change the CSS `color` property on the loader or its parent to tint it.

### Accessibility (a11y)
All 29 loaders come with built-in `@media (prefers-reduced-motion: reduce)` guards that automatically disable spinning/vibration and fallback to static balanced states when users enable reduced motion.
