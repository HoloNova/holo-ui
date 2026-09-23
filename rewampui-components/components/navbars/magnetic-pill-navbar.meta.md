# Magnetic Pill Navbar

**Category**: navbars  
**Source**: https://rewampui.com  
**Component ID**: `magnetic-pill-navbar`  
**File**: `magnetic-pill-navbar.snippet.jsx`  

## Technical Overview
Create a Magnetic Pill Navigation Bar in React:
- Mechanics: Floating glassmorphic navbar where hovering links smoothly slides a magnetic frosted pill indicator behind the active text using Framer Motion layoutId.
- Tech Stack: React, Framer Motion, Tailwind CSS, Lucide Icons.
- Dependencies: npm install framer-motion lucide-react clsx tailwind-merge

## Dependencies
- `shared/tokens.css` — Rewamp Lilac and Neutral design tokens
- `shared/base.css` — Spring transitions, motion keyframes, and utilities
- `framer-motion`

## Usage
```jsx
import MagneticPillNavbar from './magnetic-pill-navbar.snippet.jsx';

export default function Example() {
  return (
    <MagneticPillNavbar />
  );
}
```
