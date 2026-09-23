# Kinetic Reel Text

**Category**: text  
**Source**: https://rewampui.com  
**Component ID**: `kinetic-reel-text`  
**File**: `kinetic-reel-text.snippet.jsx`  

## Technical Overview
Create an authentic Kinetic Rolling Slot Reel Text animation in React:
- Visual Identity: Pure pitch-black backdrop (#000000). Static bold lowercase prefix "we do" on the left with letter-spacing -0.03em.
- 3D Drum Reel Mechanics:
  - 3D cylindrical tumbling reel on the right cycling through services: "Websites", "Brand identity", "SEO optimization", "Digital marketing", "Lead generation", "Influencer marketing".
  - Center active item is full opacity pure white (#FFFFFF), aligned perfectly with prefix baseline.
  - Above/below items curve along the cylinder with 3D perspective tilt (rotateX: ±35deg) and opacity falloff (0.35).
  - Interactive mouse wheel scrubbing, touch/pointer drag, click-to-roll, and auto-tumble timer with spring physics.
- Tech Stack: React, Framer Motion, Tailwind CSS, Lucide Icons.
- Dependencies: npm install framer-motion lucide-react clsx tailwind-merge

## Dependencies
- `shared/tokens.css` — Rewamp Lilac and Neutral design tokens
- `shared/base.css` — Spring transitions, motion keyframes, and utilities
- `framer-motion`

## Usage
```jsx
import KineticReelText from './kinetic-reel-text.snippet.jsx';

export default function Example() {
  return (
    <KineticReelText />
  );
}
```
