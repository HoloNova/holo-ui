# Chrome Border Button

**Category**: buttons  
**Source**: https://rewampui.com  
**Component ID**: `chrome-border-button`  
**File**: `chrome-border-button.snippet.jsx`  

## Technical Overview
Create a Polished Chrome Border Pill Button component in React:
- Visual Identity: Crisp white rounded-full pill button wrapped in a rotating true-chrome metallic border ring (conic gradient in shades of silver, white, and obsidian).
- Metallic Text Sheen: Centered text rendered with a looping horizontal metallic gradient sweep simulating polished platinum reflection.
- Tech Stack: React, Framer Motion, Tailwind CSS, Lucide Icons.
- Dependencies: npm install framer-motion lucide-react clsx tailwind-merge

## Dependencies
- `shared/tokens.css` — Rewamp Lilac and Neutral design tokens
- `shared/base.css` — Spring transitions, motion keyframes, and utilities
- `framer-motion`

## Usage
```jsx
import ChromeBorderButton from './chrome-border-button.snippet.jsx';

export default function Example() {
  return (
    <ChromeBorderButton />
  );
}
```
