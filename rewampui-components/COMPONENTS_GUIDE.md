# Rewamp UI Components — AI Agent & Developer Guide

> **Source**: https://rewampui.com/  
> **Repository**: https://github.com/palakonweb/Rewamp-UI  
> **Last synced**: 2026-09-23  
> **Tech stack**: React 19 + Framer Motion + Tailwind CSS v4 + Three.js  
> **Font stack**: SF Pro (headings/body) + Geist Mono / JetBrains Mono (monospace)  

> [!IMPORTANT]
> **Agent Context Guard & Single-Task Budget**
> - Do NOT recursively scan directories. Retrieve ONLY the exact `*.snippet.jsx` or `*.snippet.tsx` needed, along with `shared/tokens.css` and `shared/base.css`.
> - Check `catalog.json` or `INDEX.json` to look up paths before opening files.
> - Dependencies: Components depend on `framer-motion` for spring physics. Orbs in `ai-ui/` depend on `three`. Icons use `lucide-react`.

---

## 1. Design Language & Tokens

Rewamp UI embodies a **kinetic, physically-accurate, tactile motion design philosophy**:

### 1.1 Typography Rules
- **Primary Typeface**: **SF Pro** (`-apple-system, BlinkMacSystemFont, "SF Pro", "Segoe UI", Roboto, sans-serif`).
  - Headings, buttons, emphasized elements: **SF Pro Semibold** (`font-weight: 600`).
  - Body text, UI copy, and content: **SF Pro Regular** (`font-weight: 400`).
- **Code / Monospace**: **Geist Mono** / `JetBrains Mono`.

### 1.2 Color System
Defined in `shared/tokens.css`:
- **Lilac Accent Ramp**: `--rewamp-lilac-100` to `--rewamp-lilac-600` (core brand accent `#D4CBE5`).
- **Orange Energy Ramp**: `--rewamp-orange-100` to `--rewamp-orange-900` (core accent `#EC5E27`).
- **Neutral Surfaces**: High-contrast slate and noir (`--rewamp-neutral-50` to `--rewamp-neutral-900`).

### 1.3 Spring Physics
All motion interactions use physical spring damping rather than linear or generic cubic-bezier curves:
```javascript
// Framer Motion spring presets
const springStiff = { type: 'spring', stiffness: 300, damping: 20 };
const springGentle = { type: 'spring', stiffness: 180, damping: 24 };
const springBounce = { type: 'spring', stiffness: 260, damping: 14 };
```

---

## 2. Component Inventory

For the full component inventory with IDs, tags, and recommended use cases, see [`rewampui.manifest.json`](./rewampui.manifest.json).

To look up a component's snippet file path by ID, see [`ROUTER.json`](../ROUTER.json) at the root.

---

## 3. Style Harmonization Matrix

### With Apple Human Interface (`guidelines/apple-design`)
- Rewamp UI components natively align with Apple's typography (SF Pro) and squircle geometries.
- You can layer Apple Liquid Glass (`--apple-material-regular`, `--apple-blur-regular`) over Rewamp card decks (`editorial-3-d-orbit-carousel`, `arch-card-carousel`) to achieve VisionOS-like spatial depth.

### With AI-Native Productivity (`beautifului-components`)
- Combine Beautiful UI's dense data displays (`diff-table`, `records-table`, `thinking-state`) with Rewamp UI's tactile buttons (`slide-to-confirm-button`, `shimmer-button`) and 3D assistant orbs (`fluid-morph-orb`).
- The Lilac accent from Rewamp UI harmonizes naturally with the cold monochrome slate palette of Beautiful UI.
