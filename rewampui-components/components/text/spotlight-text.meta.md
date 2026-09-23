# Spotlight Text

**Category**: text  
**Source**: https://rewampui.com  
**Component ID**: `spotlight-text`  
**File**: `spotlight-text.snippet.jsx`  

## Technical Overview
Create an interactive Spotlight Text Reveal component in React:
- Visual Identity: Pitch-black container where text is initially concealed.
- Mask Interaction: Cursor acts as a saturated gradient spotlight, revealing the high-contrast typography underneath using CSS mask-image and Framer Motion spring coordinates.
- Tech Stack: React, Framer Motion, Tailwind CSS, Lucide Icons.
- Dependencies: npm install framer-motion lucide-react clsx tailwind-merge

## Dependencies
- `shared/tokens.css` — Rewamp Lilac and Neutral design tokens
- `shared/base.css` — Spring transitions, motion keyframes, and utilities
- `framer-motion`

## Usage
```jsx
import SpotlightText from './spotlight-text.snippet.jsx';

export default function Example() {
  return (
    <SpotlightText />
  );
}
```
