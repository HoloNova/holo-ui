# Character Scramble Text

**Category**: text  
**Source**: https://rewampui.com  
**Component ID**: `character-scramble-text`  
**File**: `character-scramble-text.snippet.jsx`  

## Technical Overview
Create a Hacker Matrix Character Scramble Decode text animation in React:
- Visual Identity: Monospace dark terminal layout with mint-green / cyan accent highlights (#4ECCA3).
- Scramble Algorithm: Each character cycles rapidly through random ASCII symbols ("!@#$%^&*<>[]{}~") for a randomized duration before locking smoothly into the final target character from left to right.
- Tech Stack: React, Framer Motion, Tailwind CSS, Lucide Icons.
- Dependencies: npm install framer-motion lucide-react clsx tailwind-merge

## Dependencies
- `shared/tokens.css` — Rewamp Lilac and Neutral design tokens
- `shared/base.css` — Spring transitions, motion keyframes, and utilities
- `framer-motion`

## Usage
```jsx
import CharacterScrambleText from './character-scramble-text.snippet.jsx';

export default function Example() {
  return (
    <CharacterScrambleText />
  );
}
```
