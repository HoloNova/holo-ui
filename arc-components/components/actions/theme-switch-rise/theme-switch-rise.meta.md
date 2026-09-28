# Rise

**Category**: actions  
**Source**: Docs and live preview: https://uiarc.dev/components/theme-switch-rise  
**Component ID**: `theme-switch-rise`  
**File**: `theme-switch-rise.snippet.tsx`  

## Technical Overview
The next appearance rises into place.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Rise } from './theme-switch-rise.snippet';

export function Demo() {
  return <Rise />;
}
```
