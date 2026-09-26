# Editorial 3D Orbit Carousel

**Category**: cards  
**Source**: https://rewampui.com  
**Component ID**: `editorial-3-d-orbit-carousel`  
**File**: `editorial-3-d-orbit-carousel.snippet.jsx`  

## Technical Overview
Create a 3D Tilted Elliptical Carousel of Editorial Poster Cards in React:
- Visual Identity: Distinct artistic poster cards revolving smoothly in a 3D orbit with depth scaling, bank angles, draggable rotation, and click-to-center spring physics.
- Images & Content: Card images are provided by the caller via the `items` prop (`Array<{ id: string, image?: string, title?: string, alt?: string }>`). By default, local neutral CSS placeholders are displayed to preserve dimensions, layouts, and animations without requiring external image assets or causing broken image requests.
- Styling & Tailwind Requirement: Neutral placeholder cards utilize Tailwind CSS utility classes (dark subtle gradients, typography, borders). The host application must have Tailwind CSS configured and active; placeholders cannot render as intended without host Tailwind CSS styling.
- Tech Stack: React, Framer Motion, Tailwind CSS.
- Dependencies: npm install framer-motion

## Dependencies
- `shared/tokens.css` — Rewamp Lilac and Neutral design tokens
- `shared/base.css` — Spring transitions, motion keyframes, and utilities
- `framer-motion`

## Usage
```jsx
import { Editorial3DOrbitCarousel } from './editorial-3-d-orbit-carousel.snippet.jsx';

export default function Example() {
  // Optional: pass custom cards with images or rely on neutral CSS placeholders
  const customItems = [
    { id: '1', title: 'Exhibit 01', image: '/cards/poster-1.webp' },
    { id: '2', title: 'Exhibit 02', image: '/cards/poster-2.webp' },
  ];

  return (
    <Editorial3DOrbitCarousel items={customItems} />
  );
}
```
