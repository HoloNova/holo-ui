# Book A Call Button

**Category**: buttons  
**Source**: https://rewampui.com  
**Component ID**: `book-a-call-button`  
**File**: `book-a-call-button.snippet.jsx`  

## Technical Overview
Create an agency-grade Book a Call interactive CTA button in React:
- Visual Identity: Frosted glass dark capsule with an embedded avatar stack on the left, glowing status pulse dot, and arrow action icon on the right.
- Motion: Hover expands avatar stack with spring physics, brightens ambient border glow, and translates arrow icon 4px diagonally.
- Tech Stack: React, Framer Motion, Tailwind CSS, Lucide Icons.
- Dependencies: npm install framer-motion lucide-react clsx tailwind-merge

## Dependencies
- `shared/tokens.css` — Rewamp Lilac and Neutral design tokens
- `shared/base.css` — Spring transitions, motion keyframes, and utilities
- `framer-motion`
- `lucide-react`

## Usage
```jsx
import BookACallButton from './book-a-call-button.snippet.jsx';

export default function Example() {
  return (
    <BookACallButton />
  );
}
```
