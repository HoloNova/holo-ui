# Hold to confirm

**Category**: actions  
**Source**: Docs and live preview: https://uiarc.dev/components/hold-to-confirm  
**Component ID**: `hold-to-confirm`  
**File**: `hold-to-confirm.snippet.tsx`  

## Technical Overview
Confirm a destructive action by holding, not tapping.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Holdtoconfirm } from './hold-to-confirm.snippet';

export function Demo() {
  return <Holdtoconfirm />;
}
```
