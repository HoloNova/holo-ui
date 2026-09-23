# Perspective Flip Deck

**Category**: cards  
**Source**: https://rewampui.com  
**Component ID**: `perspective-flip-deck`  
**File**: `perspective-flip-deck.snippet.jsx`  

## Technical Overview
Create a 3D Perspective Card Deck with Peeling Flip Transitions in React:
- Visual Identity: Wide dark obsidian cards fanned along a 3D perspective plane. Front card flips open to the right in 3D around a vertical hinge as subsequent cards smoothly shift forward with spring physics.
- Tech Stack: React, Framer Motion, Tailwind CSS, Lucide Icons.
- Dependencies: npm install framer-motion lucide-react clsx tailwind-merge

## Dependencies
- `shared/tokens.css` — Rewamp Lilac and Neutral design tokens
- `shared/base.css` — Spring transitions, motion keyframes, and utilities
- `framer-motion`

## Usage
```jsx
import PerspectiveFlipDeck from './perspective-flip-deck.snippet.jsx';

export default function Example() {
  return (
    <PerspectiveFlipDeck />
  );
}
```
