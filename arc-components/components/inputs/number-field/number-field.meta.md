# Number field

**Category**: inputs  
**Source**: Docs and live preview: https://uiarc.dev/components/number-field  
**Component ID**: `number-field`  
**File**: `number-field.snippet.tsx`  

## Technical Overview
Enter a bounded number with clear increment controls.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Numberfield } from './number-field.snippet';

export function Demo() {
  return <Numberfield />;
}
```
