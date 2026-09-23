# Split Text Reveal

**Category**: text  
**Source**: https://rewampui.com  
**Component ID**: `split-text-reveal`  
**File**: `split-text-reveal.snippet.jsx`  

## Technical Overview
Create an editorial Split Text Character Reveal animation in React:
- Visual Identity: Dark container with large bold heading typography.
- Motion Mechanics: Text splits into individual character spans; on trigger/mount, characters fly in from randomized vertical offsets (-60px to +60px) with staggered spring timing (0.03s delay per char), blur-to-focus transitions (blur(8px) -> blur(0px)), and opacity fade.
- Tech Stack: React, Framer Motion, Tailwind CSS, Lucide Icons.
- Dependencies: npm install framer-motion lucide-react clsx tailwind-merge

## Dependencies
- `shared/tokens.css` — Rewamp Lilac and Neutral design tokens
- `shared/base.css` — Spring transitions, motion keyframes, and utilities
- `framer-motion`

## Usage
```jsx
import SplitTextReveal from './split-text-reveal.snippet.jsx';

export default function Example() {
  return (
    <SplitTextReveal />
  );
}
```
