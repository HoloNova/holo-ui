# Arch Card Carousel

**Category**: cards  
**Source**: https://rewampui.com  
**Component ID**: `arch-card-carousel`  
**File**: `arch-card-carousel.snippet.tsx`  

## Technical Overview
Create an animated Curved Arch Card Carousel with Pendulum Gliding in React:
- Visual Identity: Borderless rounded portrait cards riding along a circular convex wheel trajectory with continuous harmonic pendulum oscillation and inertia scrubbing.
- Tech Stack: React, TypeScript, Framer Motion, Tailwind CSS, Lucide Icons.
- Dependencies: npm install framer-motion lucide-react clsx tailwind-merge

## Dependencies
- `shared/tokens.css` — Rewamp Lilac and Neutral design tokens
- `shared/base.css` — Spring transitions, motion keyframes, and utilities


## Usage
```jsx
import ArchCardCarousel from './arch-card-carousel.snippet.tsx';

export default function Example() {
  return (
    <ArchCardCarousel />
  );
}
```
