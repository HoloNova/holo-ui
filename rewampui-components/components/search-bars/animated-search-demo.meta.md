# Animated Search Demo

**Category**: search-bars  
**Source**: https://rewampui.com  
**Component ID**: `animated-search-demo`  
**File**: `animated-search-demo.snippet.jsx`  

## Technical Overview
Create an Expandable Search Capsule in React:
- Mechanics: Idle circular capsule (64px) with centered search icon; hovering smoothly expands via spring physics into a 420px wide search bar with placeholder and "⌘K" keyboard shortcut badge.
- Tech Stack: React, Framer Motion, Tailwind CSS, Lucide Icons.
- Dependencies: npm install framer-motion lucide-react clsx tailwind-merge

## Dependencies
- `shared/tokens.css` — Rewamp Lilac and Neutral design tokens
- `shared/base.css` — Spring transitions, motion keyframes, and utilities
- `framer-motion`
- `lucide-react`

## Usage
```jsx
import AnimatedSearchDemo from './animated-search-demo.snippet.jsx';

export default function Example() {
  return (
    <AnimatedSearchDemo />
  );
}
```
