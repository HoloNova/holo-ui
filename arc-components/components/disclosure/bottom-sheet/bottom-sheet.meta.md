# Bottom sheet

**Category**: disclosure  
**Source**: Docs and live preview: https://uiarc.dev/components/bottom-sheet  
**Component ID**: `bottom-sheet`  
**File**: `bottom-sheet.snippet.tsx`  

## Technical Overview
A sheet that rests at a peek or full height and follows your finger.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Bottomsheet } from './bottom-sheet.snippet';

export function Demo() {
  return <Bottomsheet />;
}
```
