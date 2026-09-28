# Confirm morph

**Category**: actions  
**Source**: Docs and live preview: https://uiarc.dev/components/confirm-morph  
**Component ID**: `confirm-morph`  
**File**: `confirm-morph.snippet.tsx`  

## Technical Overview
A destructive button that morphs into an inline confirmation, a spinner, and a result with undo.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Confirmmorph } from './confirm-morph.snippet';

export function Demo() {
  return <Confirmmorph />;
}
```
