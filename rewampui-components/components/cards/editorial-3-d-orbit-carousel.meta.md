# Editorial 3D Orbit Carousel

**Category**: cards  
**Source**: https://rewampui.com  
**Component ID**: `editorial-3-d-orbit-carousel`  
**File**: `editorial-3-d-orbit-carousel.snippet.jsx`  

## Technical Overview
Create a 3D Tilted Elliptical Carousel of Editorial Poster Cards in React:
- Visual Identity: Six distinct artistic poster cards revolving smoothly in a 3D orbit with depth scaling, bank angles, draggable rotation, and click-to-center spring physics.
- Tech Stack: React, Framer Motion, Tailwind CSS, Lucide Icons.
- Dependencies: npm install framer-motion lucide-react clsx tailwind-merge

## Dependencies
- `shared/tokens.css` — Rewamp Lilac and Neutral design tokens
- `shared/base.css` — Spring transitions, motion keyframes, and utilities
- `framer-motion`
- `lucide-react`

## Usage
```jsx
import Editorial3DOrbitCarousel from './editorial-3-d-orbit-carousel.snippet.jsx';

export default function Example() {
  return (
    <Editorial3DOrbitCarousel />
  );
}
```
