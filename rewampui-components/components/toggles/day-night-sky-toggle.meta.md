# Day Night Sky Toggle

**Category**: toggles  
**Source**: https://rewampui.com  
**Component ID**: `day-night-sky-toggle`  
**File**: `day-night-sky-toggle.snippet.jsx`  

## Technical Overview
Create an illustrated Day/Night Sky Capsule Toggle component in React:
- Visual Identity: Wide glass pill containing a miniature illustrated sky scene.
- Transitions:
  - Night State: Deep navy sky with twinkling starfield, crescent moon, drifting clouds, and glowing orb on the right.
  - Day State: Morphs seamlessly to sky blue, orb glides left, moon rotates into a sun, stars fade out as tiny flying birds fade in.
  - Continuous 900ms spring-eased transition with zero hard cuts.
- Tech Stack: React, Framer Motion, Tailwind CSS, Lucide Icons.
- Dependencies: npm install framer-motion lucide-react clsx tailwind-merge

## Dependencies
- `shared/tokens.css` — Rewamp Lilac and Neutral design tokens
- `shared/base.css` — Spring transitions, motion keyframes, and utilities
- `framer-motion`

## Usage
```jsx
import DayNightSkyToggle from './day-night-sky-toggle.snippet.jsx';

export default function Example() {
  return (
    <DayNightSkyToggle />
  );
}
```
