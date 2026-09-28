# Action button

**Category**: actions  
**Source**: Docs and live preview: https://uiarc.dev/components/action-button  
**Component ID**: `action-button`  
**File**: `action-button.snippet.tsx`  

## Technical Overview
A compact button for frequent toolbar actions.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Actionbutton } from './action-button.snippet';

export function Demo() {
  return <Actionbutton />;
}
```
