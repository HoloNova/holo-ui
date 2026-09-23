# Gloss Button

**Category**: buttons  
**Source**: https://rewampui.com  
**Component ID**: `gloss-button`  
**File**: `gloss-button.snippet.jsx`  

## Technical Overview
Create an ultra-glossy Marbled Oil-Slick Pill Button component in React:
- Visual Identity: Rounded-full pill CTA with a living, iridescent marbled oil-slick surface (swirling blush rose, lavender, and champagne gold hues) that slowly undulates in an infinite loop.
- Optical Sheen: Fixed glossy top highlight arc (white 40% opacity gradient) simulating curved glass reflection with deep drop shadow beneath.
- Hover & Press Feedback: On hover, button lifts 2px with intensified specular sheen; on click, springs inward with a soft ripple pulse.
- Tech Stack: React, Framer Motion, Tailwind CSS, Lucide Icons.
- Dependencies: npm install framer-motion lucide-react clsx tailwind-merge

## Dependencies
- `shared/tokens.css` — Rewamp Lilac and Neutral design tokens
- `shared/base.css` — Spring transitions, motion keyframes, and utilities
- `framer-motion`

## Usage
```jsx
import GlossButton from './gloss-button.snippet.jsx';

export default function Example() {
  return (
    <GlossButton />
  );
}
```
