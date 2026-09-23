# Pill Expand Navbar

**Category**: navbars  
**Source**: https://rewampui.com  
**Component ID**: `pill-expand-navbar`  
**File**: `pill-expand-navbar.snippet.jsx`  

## Technical Overview
Create a Compact Expanding Icon Pill Navbar in React:
- Layout: Rounded-full dark container packed with 5 icon-only tabs (Home, Category, Cart, Save, Profile).
- Expand Interaction: Hovering or selecting any tab smoothly expands its width via spring physics to reveal the text label beside the icon while non-hovered tabs stay collapsed.
- Tech Stack: React, Framer Motion, Tailwind CSS, Lucide Icons.
- Dependencies: npm install framer-motion lucide-react clsx tailwind-merge

## Dependencies
- `shared/tokens.css` — Rewamp Lilac and Neutral design tokens
- `shared/base.css` — Spring transitions, motion keyframes, and utilities
- `framer-motion`
- `lucide-react`

## Usage
```jsx
import PillExpandNavbar from './pill-expand-navbar.snippet.jsx';

export default function Example() {
  return (
    <PillExpandNavbar />
  );
}
```
