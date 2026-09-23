# Morph Search Capsule

**Category**: search-bars  
**Source**: https://rewampui.com  
**Component ID**: `morph-search-capsule`  
**File**: `morph-search-capsule.snippet.jsx`  

## Technical Overview
Create an interactive Morphing Icon Search Capsule in React:
- Mechanics: Rounded pill search bar where clicking triggers an SVG icon morph: the magnifying glass ring scales down and its handle rotates and straightens into a vertical blinking text cursor line '|'. Text input auto-focuses for immediate typing.
- Tech Stack: React, Framer Motion, Tailwind CSS, Lucide Icons.
- Dependencies: npm install framer-motion lucide-react clsx tailwind-merge

## Dependencies
- `shared/tokens.css` — Rewamp Lilac and Neutral design tokens
- `shared/base.css` — Spring transitions, motion keyframes, and utilities
- `framer-motion`

## Usage
```jsx
import MorphSearchCapsule from './morph-search-capsule.snippet.jsx';

export default function Example() {
  return (
    <MorphSearchCapsule />
  );
}
```
