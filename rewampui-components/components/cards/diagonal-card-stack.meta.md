# Diagonal Card Stack

**Category**: cards  
**Source**: https://rewampui.com  
**Component ID**: `diagonal-card-stack`  
**File**: `diagonal-card-stack.snippet.jsx`  

## Technical Overview
Create a Continuous Diagonal Card Stream & Stacked Deck component in React:
- Visual Identity: Deep obsidian matte rounded cards arranged in a cascading diagonal staircase gliding in an infinite seamless marquee.
- Mechanics: Pointer dragging along the diagonal axis, pause-on-hover, and a smooth spring-physics collapse into a 3D isometric stacked card deck in the center.
- Tech Stack: React, Framer Motion, Tailwind CSS, Lucide Icons.
- Dependencies: npm install framer-motion lucide-react clsx tailwind-merge

## Dependencies
- `shared/tokens.css` — Rewamp Lilac and Neutral design tokens
- `shared/base.css` — Spring transitions, motion keyframes, and utilities
- `framer-motion`

## Usage
```jsx
import DiagonalCardStack from './diagonal-card-stack.snippet.jsx';

export default function Example() {
  return (
    <DiagonalCardStack />
  );
}
```
