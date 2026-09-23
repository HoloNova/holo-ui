# Typewriter Text

**Category**: text  
**Source**: https://rewampui.com  
**Component ID**: `typewriter-text`  
**File**: `typewriter-text.snippet.jsx`  

## Technical Overview
Create a Typewriter Text component with an interactive blinking cursor in React:
- Visual Identity: Clean monospace typography on dark backdrop with warm white characters and an amber/cyan vertical blinking caret.
- Typing Logic: Types out phrases character-by-character with realistic randomized keystroke intervals (50ms-120ms), pauses at sentence completion, deletes with accelerated backspace, and cycles to next phrase.
- Tech Stack: React, Framer Motion, Tailwind CSS, Lucide Icons.
- Dependencies: npm install framer-motion lucide-react clsx tailwind-merge

## Dependencies
- `shared/tokens.css` — Rewamp Lilac and Neutral design tokens
- `shared/base.css` — Spring transitions, motion keyframes, and utilities
- `framer-motion`

## Usage
```jsx
import TypewriterText from './typewriter-text.snippet.jsx';

export default function Example() {
  return (
    <TypewriterText />
  );
}
```
