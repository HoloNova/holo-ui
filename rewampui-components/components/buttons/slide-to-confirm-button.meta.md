# Slide To Confirm Button

**Category**: buttons  
**Source**: https://rewampui.com  
**Component ID**: `slide-to-confirm-button`  
**File**: `slide-to-confirm-button.snippet.jsx`  

## Technical Overview
Create an animated Slide to Confirm Order Button component in React:
- Visual Identity: Deep navy/charcoal rounded pill track reading "Complete Order".
- Interactive Sequence: On click, label fades out; a tan package icon appears on the left; a white cargo-trailer truck slides from left to right across the track leaving a dashed road line trail and headlight beams; track settles and label crossfades to "Order Placed" with an animated green check.
- Tech Stack: React, Framer Motion, Tailwind CSS, Lucide Icons.
- Dependencies: npm install framer-motion lucide-react clsx tailwind-merge

## Dependencies
- `shared/tokens.css` — Rewamp Lilac and Neutral design tokens
- `shared/base.css` — Spring transitions, motion keyframes, and utilities
- `framer-motion`
- `lucide-react`

## Usage
```jsx
import SlideToConfirmButton from './slide-to-confirm-button.snippet.jsx';

export default function Example() {
  return (
    <SlideToConfirmButton />
  );
}
```
