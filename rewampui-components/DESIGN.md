---
style_id: "kinetic-physics"
style_aliases: ["stripe-fluid", "framer-motion", "tactile-physics"]
version: "1.0.0"
token_source: "./shared/tokens.css"
target_runtime: "agent-first"
primary_stack: "React 19 + Framer Motion + Tailwind CSS v4 + Three.js"
---

# Kinetic Physics & Tactile Motion Design Specification

> **AI Agent Context Guard**: High-density engineering contract. Zero conversational filler. Adhere strictly to the machine-checkable constraints below when generating DOM and CSS.

---

### 1. Hard Constraints (RFC 2119)

- **MUST** use physics-based spring models for all interactive movement; linear or non-spring ease curves are strictly forbidden.
- **MUST** use SF Pro for UI copy and Geist Mono / JetBrains Mono for monospace tokens.
- **MUST** use the Lilac palette (`#C1B4D8` / `#D4CBE5`) for brand glows, ambient surfaces, and passive active states.
- **MUST** use the Orange energy ramp (`#EC5E27` / `#D2471A`) exclusively for primary CTA triggers, blocking confirmations, and destructive alerts.
- **MUST** enforce tactile feedback on all controls via `:active { transform: scale(0.97); }` or Framer Motion `whileTap={{ scale: 0.97 }}`.
- **MUST NOT** use static rigid cards for high-importance showcases; primary hero displays must support 3D tilt or orbital carousel rotation.
- **NEVER** use instantaneous state switches for approval or destructive actions; destructive or sensitive actions MUST use a swipe/slide threshold (`slide-to-confirm`).

---

### 2. Token Registry & Variable Matrix

#### 2.1 Brand & Energy Color Matrix

| Semantic Role | Hex Code | Applied Properties | CSS Token |
| :--- | :--- | :--- | :--- |
| `brand-lilac-strong` | `#C1B4D8` | Active border, hover glow | `var(--rewamp-lilac-600)` |
| `brand-lilac-core` | `#D4CBE5` | Brand icon, primary accent | `var(--rewamp-lilac-500)` |
| `brand-lilac-soft` | `#EEEAF7` | Ambient tint, card glow | `var(--rewamp-lilac-300)` |
| `energy-orange-core` | `#EC5E27` | High-priority CTA, confirm slider | `var(--rewamp-orange-600)` |
| `energy-orange-deep` | `#D2471A` | Button hover, active state | `var(--rewamp-orange-700)` |
| `neutral-noir-dark` | `#171717` | Dark mode surface background | `var(--rewamp-neutral-900)` |
| `neutral-charcoal` | `#262626` | Card background (dark mode) | `var(--rewamp-neutral-800)` |
| `neutral-surface-lt` | `#FAFAFA` | Elevated background (light) | `var(--rewamp-neutral-50)` |
| `border-subtle` | `#E5E5E5` | Default card perimeter | `var(--rewamp-neutral-200)` |

#### 2.2 Framer Motion Spring Presets

| Spring Preset | Stiffness | Damping | Mass | Primary Use Case |
| :--- | :--- | :--- | :--- | :--- |
| `springStiff` | `300` | `20` | `1.0` | Button pops, toggle snaps, pill jumps |
| `springGentle` | `180` | `24` | `1.0` | Modal entrance, card flip, sheet unfold |
| `springBounce` | `260` | `14` | `1.0` | Badge notifications, particle impacts, orb pulse |

---

### 3. Motion & Haptic Interaction Specs

| Interaction Model | Target Property | Spring / Curve Value |
| :--- | :--- | :--- |
| `Tactile Tap Scale` | `transform` | `whileTap={{ scale: 0.96 }}` |
| `Magnetic Pull` | `x, y` | Dampened offset `delta * 0.18` |
| `Shimmer Sweep` | `background-position` | `1500ms cubic-bezier(0.4, 0, 0.2, 1) infinite` |
| `Fluid Orb Morph` | WebGL Vertices | Simplex noise frequency `0.35`, amplitude `0.2` |

---

### 4. Component Assembly Recipes

#### 4.1 Slide-To-Confirm Button (Framer Motion Architecture)
```jsx
// Gated confirmation pattern (Zero accidental clicks)
import { motion, useMotionValue, useTransform } from 'framer-motion';

export function SlideToConfirm({ onConfirm }) {
  const x = useMotionValue(0);
  const background = useTransform(x, [0, 180], ["#D4CBE5", "#EC5E27"]);

  return (
    <div style={{ width: 240, height: 52, borderRadius: 26, background: '#F5F5F5', position: 'relative', overflow: 'hidden', padding: 4 }}>
      <motion.div style={{ position: 'absolute', inset: 0, background }} />
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 188 }}
        dragElastic={0.05}
        onDragEnd={(_, info) => { if (info.offset.x > 150) onConfirm(); }}
        style={{ x, width: 44, height: 44, borderRadius: 22, background: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', cursor: 'grab' }}
      />
    </div>
  );
}
```

#### 4.2 3D Orbit Deck Card (Spatial Geometry)
```html
<div style="perspective: 1000px;">
  <div style="background: var(--rewamp-surface, #FFFFFF); border: 1px solid var(--rewamp-lilac-500); border-radius: 18px; box-shadow: 0 12px 32px -4px rgba(212, 203, 229, 0.35); transform-style: preserve-3d; transition: transform 300ms cubic-bezier(0.2, 0.8, 0.2, 1); padding: 24px;">
    <h3 style="font-family: var(--font-rewamp-sans); font-size: 18px; font-weight: 600; color: var(--rewamp-neutral-900); margin: 0 0 8px 0;">Tactile Physics</h3>
    <p style="font-family: var(--font-rewamp-sans); font-size: 14px; color: var(--rewamp-neutral-700); line-height: 1.5; margin: 0;">Physical spring damping with 3D elevation.</p>
  </div>
</div>
```
