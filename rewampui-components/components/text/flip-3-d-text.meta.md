# Flip 3D Text

**Category**: text  
**Source**: https://rewampui.com  
**Component ID**: `flip-3-d-text`  
**File**: `flip-3-d-text.snippet.jsx`  

## Technical Overview
Create a 3D Mechanical Flip Clock / Ticker Text animation in React:
- Visual Identity: Mechanical airport ticker board aesthetic.
- 3D Flip Physics: Text phrases split into character tiles; on transition, top and bottom tile halves rotate 180° along the horizontal X-axis (rotateX) with realistic bevel shadows and spring landing overshoot.
- Tech Stack: React, Framer Motion, Tailwind CSS, Lucide Icons.
- Dependencies: npm install framer-motion lucide-react clsx tailwind-merge

## Dependencies
- `shared/tokens.css` — Rewamp Lilac and Neutral design tokens
- `shared/base.css` — Spring transitions, motion keyframes, and utilities
- `framer-motion`

## Usage
```jsx
import Flip3DText from './flip-3-d-text.snippet.jsx';

export default function Example() {
  return (
    <Flip3DText />
  );
}
```
