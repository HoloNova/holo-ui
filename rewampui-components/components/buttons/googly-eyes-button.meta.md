# Googly Eyes Button

**Category**: buttons  
**Source**: https://rewampui.com  
**Component ID**: `googly-eyes-button`  
**File**: `googly-eyes-button.snippet.jsx`  

## Technical Overview
Create an interactive Googly Eyes Button component in React:
- Visual Identity: Dark charcoal rounded-full pill button (bg-[#1E1C24], border border-white/10, shadow-xl) reading "Look Around".
- Googly Eyes Mechanics:
  - Contains two white circular eyeball discs (22px diameter) with dark iris pupils (8px diameter).
  - Pupils track the real-time global cursor position using trigonometric angle calculation: theta = atan2(mouseY - eyeCenterY, mouseX - eyeCenterX).
  - Pupil distance clamped inside the eyeball socket with elastic spring physics (stiffness: 300, damping: 20).
  - On button hover: Eyeballs widen and pupils bounce playfully with micro-vibrations.
  - On button press: Eyes squish vertically (scaleY: 0.7, scaleX: 1.15) with tactile click audio/visual confirmation.
- Tech Stack: React, Framer Motion, Tailwind CSS, Lucide Icons.
- Dependencies: npm install framer-motion lucide-react clsx tailwind-merge

## Dependencies
- `shared/tokens.css` — Rewamp Lilac and Neutral design tokens
- `shared/base.css` — Spring transitions, motion keyframes, and utilities
- `framer-motion`

## Usage
```jsx
import GooglyEyesButton from './googly-eyes-button.snippet.jsx';

export default function Example() {
  return (
    <GooglyEyesButton />
  );
}
```
