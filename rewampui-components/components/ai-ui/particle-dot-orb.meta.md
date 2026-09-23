# Particle Dot Orb

**Category**: ai-ui  
**Source**: https://rewampui.com  
**Component ID**: `particle-dot-orb`  
**File**: `particle-dot-orb.snippet.tsx`  

## Technical Overview
Create a 3D Fibonacci Particle Dot Orb AI Thinking Capsule in React:
- Visual Identity: Pure white floating pill capsule (bg-white, border border-black/10, soft shadow).
- Left: 3D rotating Fibonacci particle sphere rendered with Three.js (crisp charcoal dots with depth scaling).
- Right: Shimmery text with animated light sweep cycling: "thinking..." -> "connecting dots..." -> "cooking up ideas..." -> "hold tight..." -> "let me cook..." -> "done bestie".
- Tech Stack: React, Three.js (WebGL), Framer Motion, Tailwind CSS, Lucide Icons.
- Dependencies: npm install three framer-motion lucide-react clsx tailwind-merge

## Dependencies
- `shared/tokens.css` — Rewamp Lilac and Neutral design tokens
- `shared/base.css` — Spring transitions, motion keyframes, and utilities
- `three`

## Usage
```jsx
import ParticleDotOrb from './particle-dot-orb.snippet.tsx';

export default function Example() {
  return (
    <ParticleDotOrb />
  );
}
```
