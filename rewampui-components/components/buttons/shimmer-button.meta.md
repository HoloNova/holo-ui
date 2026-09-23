# Shimmer Button

**Category**: buttons  
**Source**: https://rewampui.com  
**Component ID**: `shimmer-button`  
**File**: `shimmer-button.snippet.jsx`  

## Technical Overview
Create a Minimalist Shimmer Light Streak Button component in React:
- Visual Identity: Clean white pill with delicate slate border and dark charcoal typography.
- Light Streak Animation: A narrow soft specular light streak periodically sweeps diagonally across the surface at a 45° angle, accelerating smoothly on click with 1-2px hover lift.
- Tech Stack: React, Framer Motion, Tailwind CSS, Lucide Icons.
- Dependencies: npm install framer-motion lucide-react clsx tailwind-merge

## Dependencies
- `shared/tokens.css` — Rewamp Lilac and Neutral design tokens
- `shared/base.css` — Spring transitions, motion keyframes, and utilities
- `framer-motion`

## Usage
```jsx
import ShimmerButton from './shimmer-button.snippet.jsx';

export default function Example() {
  return (
    <ShimmerButton />
  );
}
```
