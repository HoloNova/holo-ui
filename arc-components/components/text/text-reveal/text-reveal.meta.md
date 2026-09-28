# Text reveal

**Category**: text  
**Source**: Docs and live preview: https://uiarc.dev/components/text-reveal  
**Component ID**: `text-reveal`  
**File**: `text-reveal.snippet.tsx`  

## Technical Overview
Reveal a short piece of content with restrained motion.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Textreveal } from './text-reveal.snippet';

export function Demo() {
  return <Textreveal />;
}
```
