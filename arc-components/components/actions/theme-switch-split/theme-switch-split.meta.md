# Split

**Category**: actions  
**Source**: Docs and live preview: https://uiarc.dev/components/theme-switch-split  
**Component ID**: `theme-switch-split`  
**File**: `theme-switch-split.snippet.tsx`  

## Technical Overview
The next appearance opens from a slim center seam.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Split } from './theme-switch-split.snippet';

export function Demo() {
  return <Split />;
}
```
