# Dialog

**Category**: disclosure  
**Source**: Docs and live preview: https://uiarc.dev/components/dialog  
**Component ID**: `dialog`  
**File**: `dialog.snippet.tsx`  

## Technical Overview
A focused surface for decisions that need attention.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Dialog } from './dialog.snippet';

export function Demo() {
  return <Dialog />;
}
```
