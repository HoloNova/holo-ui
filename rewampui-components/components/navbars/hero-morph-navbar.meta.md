# Hero Morph Navbar

**Category**: navbars  
**Source**: https://rewampui.com  
**Component ID**: `hero-morph-navbar`  
**File**: `hero-morph-navbar.snippet.jsx`  

## Technical Overview
Create a Dual-State Morphing Hero Navbar component in React:
- Layout & Dynamics: Dual-state adaptive navbar that morphs between a full-bleed luxury hero header (unscrolled) and a compact floating frosted-glass capsule pill (scrolled).
- Mechanics: Framer Motion spring physics with layout animations. Features brand mark + wordmark, interactive navigation tabs with sliding active pill indicator (layoutId), search shortcut trigger, theme switch toggle, mobile responsive sheet menu with animated hamburger icon, and primary CTA button.
- Tech Stack: React, Framer Motion, Tailwind CSS, Lucide Icons.
- Dependencies: npm install framer-motion lucide-react clsx tailwind-merge

## Dependencies
- `shared/tokens.css` — Rewamp Lilac and Neutral design tokens
- `shared/base.css` — Spring transitions, motion keyframes, and utilities
- `framer-motion`
- `lucide-react`

## Usage
```jsx
import HeroMorphNavbar from './hero-morph-navbar.snippet.jsx';

export default function Example() {
  return (
    <HeroMorphNavbar />
  );
}
```
