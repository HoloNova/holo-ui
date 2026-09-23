# Fluid Morph Orb

**Category**: ai-ui  
**Source**: https://rewampui.com  
**Component ID**: `fluid-morph-orb`  
**File**: `fluid-morph-orb.snippet.tsx`  

## Technical Overview
Create a 3D Fluid Morph Orb AI Thinking Capsule in React:
- Visual Identity: Floating dark matte pill capsule (bg-[#1E1E23], border border-white/12, shadow-2xl).
- Left: Real-time 3D fluid morphing mesh orb displaced with harmonic 3D noise shaders.
- Right: Smooth cycling reasoning status text with blur-fade transitions: "pondering..." -> "manifesting vibes..." -> "brewing thoughts..." -> "hold up a sec..." -> "crafting magic..." -> "all set for you".
- Tech Stack: React, Three.js (WebGL), GLSL Shaders, Framer Motion, Tailwind CSS, Lucide Icons.
- Dependencies: npm install three framer-motion lucide-react clsx tailwind-merge

## Dependencies
- `shared/tokens.css` — Rewamp Lilac and Neutral design tokens
- `shared/base.css` — Spring transitions, motion keyframes, and utilities
- `three`

## Usage
```jsx
import FluidMorphOrb from './fluid-morph-orb.snippet.tsx';

export default function Example() {
  return (
    <FluidMorphOrb />
  );
}
```
