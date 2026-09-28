# Line chart

**Category**: data  
**Source**: Docs and live preview: https://uiarc.dev/components/line-chart  
**Component ID**: `line-chart`  
**File**: `line-chart.snippet.tsx`  

## Technical Overview
A multi-series line chart with a gliding crosshair, legend toggles, and paths that morph between ranges.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Linechart } from './line-chart.snippet';

export function Demo() {
  return <Linechart />;
}
```
