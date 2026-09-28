# Bar chart

**Category**: data  
**Source**: Docs and live preview: https://uiarc.dev/components/bar-chart  
**Component ID**: `bar-chart`  
**File**: `bar-chart.snippet.tsx`  

## Technical Overview
Compare one measure across days and scrub any bar for its value.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Barchart } from './bar-chart.snippet';

export function Demo() {
  return <Barchart />;
}
```
