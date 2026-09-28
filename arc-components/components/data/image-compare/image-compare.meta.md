# Image compare

**Category**: data  
**Source**: Docs and live preview: https://uiarc.dev/components/image-compare  
**Component ID**: `image-compare`  
**File**: `image-compare.snippet.tsx`  

## Technical Overview
Drag a divider across two images to see what changed.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Imagecompare } from './image-compare.snippet';

export function Demo() {
  return <Imagecompare />;
}
```
