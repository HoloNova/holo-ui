# Rainbow Button

**Category**: buttons  
**Source**: https://rewampui.com  
**Component ID**: `rainbow-button`  
**File**: `rainbow-button.snippet.jsx`  

## Technical Overview
Create a clean minimalist Rainbow Border Button component in React:
- Visual Identity: Pristine near-white rounded-rectangle pill (bg-white/95 dark:bg-[#18181B]) wrapped in a static, delicate pastel iridescent rainbow border ring.
- Micro-Interactions: Subtle lift on hover (-1.5px) and spring compression on active press with crisp typography.
- Tech Stack: React, Framer Motion, Tailwind CSS, Lucide Icons.
- Dependencies: npm install framer-motion lucide-react clsx tailwind-merge

## Dependencies
- `shared/tokens.css` — Rewamp Lilac and Neutral design tokens
- `shared/base.css` — Spring transitions, motion keyframes, and utilities
- `framer-motion`

## Usage
```jsx
import RainbowButton from './rainbow-button.snippet.jsx';

export default function Example() {
  return (
    <RainbowButton />
  );
}
```
