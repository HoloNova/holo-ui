# Split button

**Category**: actions  
**Source**: Docs and live preview: https://uiarc.dev/components/split-button  
**Component ID**: `split-button`  
**File**: `split-button.snippet.tsx`  

## Technical Overview
A primary action with a menu of nearby alternatives.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Splitbutton } from './split-button.snippet';

export function Demo() {
  return <Splitbutton />;
}
```
