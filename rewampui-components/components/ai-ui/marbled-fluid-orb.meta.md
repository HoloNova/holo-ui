# Marbled Fluid Orb

**Category**: ai-ui  
**Source**: https://rewampui.com  
**Component ID**: `marbled-fluid-orb`  
**File**: `marbled-fluid-orb.snippet.tsx`  

## Technical Overview
Create an Iridescent Marbled Fluid Silk Orb AI Thinking Indicator in React:
- Visual Identity: Clean white floating AI pill capsule (bg-white, border border-black/10, shadow-lg).
- Left: Interactive 3D WebGL sphere featuring a swirling iridescent silk fluid core (coral crimson #FF2E55, rose pink #FF7599, warm apricot #FFB38F, lilac violet #BD5CF0) with domain-warped 3D simplex noise and subsurface scattering.
- Right: Shimmery reasoning text cycling: "thinking..." -> "weaving thoughts..." -> "connecting sparks..." -> "almost there..." -> "crafting magic..." -> "all set for you".
- Tech Stack: React, Three.js (WebGL), GLSL Shaders, Framer Motion, Tailwind CSS, Lucide Icons.
- Dependencies: npm install three framer-motion lucide-react clsx tailwind-merge

## Dependencies
- `shared/tokens.css` — Rewamp Lilac and Neutral design tokens
- `shared/base.css` — Spring transitions, motion keyframes, and utilities
- `three`

## Usage
```jsx
import MarbledFluidOrb from './marbled-fluid-orb.snippet.tsx';

export default function Example() {
  return (
    <MarbledFluidOrb />
  );
}
```
