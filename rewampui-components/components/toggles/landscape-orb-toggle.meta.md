# Landscape Orb Toggle

**Category**: toggles  
**Source**: https://rewampui.com  
**Component ID**: `landscape-orb-toggle`  
**File**: `landscape-orb-toggle.snippet.jsx`  

## Technical Overview
Create a Circular Landscape Orb Theme Toggle in React:
- Visual Identity: 90px circular orb with a white ring border. Upper 60% shows flat sky fill, lower 40% shows two-layer wavy dune silhouette.
- Transitions: Dark mode shows indigo sky with crescent moon; light mode shows warm gold sky with glowing sun. Clicking smoothly cross-fades sky and dune colors over 400ms with scale-fade icon swap.
- Tech Stack: React, Framer Motion, Tailwind CSS, Lucide Icons.
- Dependencies: npm install framer-motion lucide-react clsx tailwind-merge

## Dependencies
- `shared/tokens.css` — Rewamp Lilac and Neutral design tokens
- `shared/base.css` — Spring transitions, motion keyframes, and utilities
- `framer-motion`

## Usage
```jsx
import LandscapeOrbToggle from './landscape-orb-toggle.snippet.jsx';

export default function Example() {
  return (
    <LandscapeOrbToggle />
  );
}
```
