# Empty state

**Category**: data  
**Source**: Docs and live preview: https://uiarc.dev/components/empty-state  
**Component ID**: `empty-state`  
**File**: `empty-state.snippet.tsx`  

## Technical Overview
A useful next step when there is nothing to show yet.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Emptystate } from './empty-state.snippet';

export function Demo() {
  return <Emptystate />;
}
```
