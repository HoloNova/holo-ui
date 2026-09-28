# Slot text

**Category**: special  
**Source**: Docs and live preview: https://uiarc.dev/components/slot-text  
**Component ID**: `slot-text`  
**File**: `slot-text.snippet.tsx`  

## Technical Overview
Text and numbers that spin into their new value on staggered slot machine reels.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Slottext } from './slot-text.snippet';

export function Demo() {
  return <Slottext />;
}
```
