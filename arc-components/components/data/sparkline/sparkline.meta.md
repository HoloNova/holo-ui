# Sparkline

**Category**: data  
**Source**: Docs and live preview: https://uiarc.dev/components/sparkline  
**Component ID**: `sparkline`  
**File**: `sparkline.snippet.tsx`  

## Technical Overview
Show a compact trend beside a value.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Sparkline } from './sparkline.snippet';

export function Demo() {
  return <Sparkline />;
}
```
