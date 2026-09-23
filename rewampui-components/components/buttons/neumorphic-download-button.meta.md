# Neumorphic Download Button

**Category**: buttons  
**Source**: https://rewampui.com  
**Component ID**: `neumorphic-download-button`  
**File**: `neumorphic-download-button.snippet.jsx`  

## Technical Overview
Create a 3-State Neumorphic Download Button component in React:
- Visual Identity: Soft raised light-gray tactile surface (#E5E7EB) with dual extruded neumorphic drop shadows.
- 3 Interactive States:
  1. Idle State: Circular disc with cloud-download icon on the left, reading "Download".
  2. Downloading State (on click): Amber progress ring sweeps clockwise around the disc over ~2s while the icon shifts to amber and label reads "Downloading...".
  3. Downloaded State (completion): Progress ring completes, disc displays a bright emerald checkmark, and label crossfades to "Downloaded". Resets after 2s.
- Tech Stack: React, Framer Motion, Tailwind CSS, Lucide Icons.
- Dependencies: npm install framer-motion lucide-react clsx tailwind-merge

## Dependencies
- `shared/tokens.css` — Rewamp Lilac and Neutral design tokens
- `shared/base.css` — Spring transitions, motion keyframes, and utilities
- `framer-motion`
- `lucide-react`

## Usage
```jsx
import NeumorphicDownloadButton from './neumorphic-download-button.snippet.jsx';

export default function Example() {
  return (
    <NeumorphicDownloadButton />
  );
}
```
