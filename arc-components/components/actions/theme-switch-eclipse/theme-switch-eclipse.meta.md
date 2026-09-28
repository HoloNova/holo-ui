# Eclipse

**Category**: actions  
**Source**: Docs and live preview: https://uiarc.dev/components/theme-switch-eclipse  
**Component ID**: `theme-switch-eclipse`  
**File**: `theme-switch-eclipse.snippet.tsx`  

## Technical Overview
The next appearance crosses the page like an eclipse.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Eclipse } from './theme-switch-eclipse.snippet';

export function Demo() {
  return <Eclipse />;
}
```
