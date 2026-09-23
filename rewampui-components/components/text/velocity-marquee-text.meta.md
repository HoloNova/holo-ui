# Velocity Marquee Text

**Category**: text  
**Source**: https://rewampui.com  
**Component ID**: `velocity-marquee-text`  
**File**: `velocity-marquee-text.snippet.jsx`  

## Technical Overview
Create an interactive Velocity Marquee Text component in React:
- Visual Identity: Large bold uppercase typography running continuously in an infinite horizontal track.
- Physics: Track scrolls at a baseline velocity (v = 2px/frame); user horizontal dragging or window scrolling increases velocity proportionally with momentum coasting and spring deceleration.
- Tech Stack: React, Framer Motion, Tailwind CSS, Lucide Icons.
- Dependencies: npm install framer-motion lucide-react clsx tailwind-merge

## Dependencies
- `shared/tokens.css` — Rewamp Lilac and Neutral design tokens
- `shared/base.css` — Spring transitions, motion keyframes, and utilities
- `framer-motion`

## Usage
```jsx
import VelocityMarqueeText from './velocity-marquee-text.snippet.jsx';

export default function Example() {
  return (
    <VelocityMarqueeText />
  );
}
```
