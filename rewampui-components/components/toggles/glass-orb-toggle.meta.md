# Glass Orb Toggle

**Category**: toggles  
**Source**: https://rewampui.com  
**Component ID**: `glass-orb-toggle`  
**File**: `glass-orb-toggle.snippet.tsx`  

## Technical Overview
Create an interactive Dark/Light Mode Toggle with an oversized 3D Crystal Glass Sphere in React:
- Pill Track: Sleek rounded capsule (248px x 78px) with inset shadow and subtle rim border.
  - Dark Mode: Deep charcoal surface (#18181B) with visible "Light" label on the right.
  - Light Mode: Soft graphite surface (#56565E) with visible "Dark" label on the left.
- 3D Glass Orb Thumb:
  - Oversized crystal sphere (104px diameter) extending beyond track boundaries.
  - Realistic multi-layered glass shader highlights: top-left specular reflection arc, bottom-right subsurface caustic glow, and backdrop blur refracting track labels as it slides.
  - Inside the sphere: morphs between a glowing white crescent moon (dark mode) and a radiant sun with 8 rounded beams (light mode) with spring physics.
- Tech Stack: React, Framer Motion, Tailwind CSS, Lucide Icons.
- Dependencies: npm install framer-motion lucide-react clsx tailwind-merge

## Dependencies
- `shared/tokens.css` — Rewamp Lilac and Neutral design tokens
- `shared/base.css` — Spring transitions, motion keyframes, and utilities
- `framer-motion`

## Usage
```jsx
import GlassOrbToggle from './glass-orb-toggle.snippet.tsx';

export default function Example() {
  return (
    <GlassOrbToggle />
  );
}
```
