# Perspective Flip Deck

**Category**: cards  
**Source**: https://rewampui.com  
**Component ID**: `perspective-flip-deck`  
**File**: `perspective-flip-deck.snippet.jsx`  

## Technical Overview
Create a 3D Perspective Card Deck with Peeling Flip Transitions in React:
- Visual Identity: Wide dark obsidian cards fanned along a 3D perspective plane. Front card flips open to the right in 3D around a vertical hinge as subsequent cards smoothly shift forward with spring physics.
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
import { PerspectiveFlipDeck } from './perspective-flip-deck.snippet.jsx';

export default function Example() {
  // Optional: pass custom cards with images or rely on neutral CSS placeholders
  const customCards = [
    { id: '1', title: 'Deck 01', image: '/cards/deck-1.webp' },
    { id: '2', title: 'Deck 02', image: '/cards/deck-2.webp' },
  ];

  return (
    <PerspectiveFlipDeck items={customCards} />
  );
}
```
