# Diagonal Card Stack

**Category**: cards  
**Source**: https://rewampui.com  
**Component ID**: `diagonal-card-stack`  
**File**: `diagonal-card-stack.snippet.jsx`  

## Technical Overview
Create a Continuous Diagonal Card Stream & Stacked Deck component in React:
- Visual Identity: Deep obsidian matte rounded cards arranged in a cascading diagonal staircase gliding in an infinite seamless marquee.
- Images & Content: Card images are provided by the caller via the `cards` prop (`Array<{ id: string, image?: string, title?: string, brand?: string, alt?: string }>`). By default, local neutral CSS placeholders are displayed to preserve dimensions, layouts, and animations without requiring external image assets or causing broken image requests.
- Styling & Tailwind Requirement: Neutral placeholder cards utilize Tailwind CSS utility classes (dark subtle gradients, typography, borders). The host application must have Tailwind CSS configured and active; placeholders cannot render as intended without host Tailwind CSS styling.
- Mechanics: Pointer dragging along the diagonal axis, pause-on-hover, and a smooth spring-physics collapse into a 3D isometric stacked card deck in the center.
- Tech Stack: React, Framer Motion, Tailwind CSS.
- Dependencies: npm install framer-motion

## Dependencies
- `shared/tokens.css` — Rewamp Lilac and Neutral design tokens
- `shared/base.css` — Spring transitions, motion keyframes, and utilities
- `framer-motion`

## Usage
```jsx
import { DiagonalCardStack } from './diagonal-card-stack.snippet.jsx';

export default function Example() {
  // Optional: pass custom cards with images or rely on neutral CSS placeholders
  const customCards = [
    { id: '1', title: 'Stack 01', brand: 'rico.', image: '/cards/stack-1.webp' },
    { id: '2', title: 'Stack 02', brand: 'rico.', image: '/cards/stack-2.webp' },
  ];

  return (
    <DiagonalCardStack cards={customCards} />
  );
}
```
