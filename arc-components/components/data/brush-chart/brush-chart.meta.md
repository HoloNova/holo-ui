# Brush chart

**Category**: data  
**Source**: Docs and live preview: https://uiarc.dev/components/brush-chart  
**Component ID**: `brush-chart`  
**File**: `brush-chart.snippet.tsx`  

## Technical Overview
A dense time series with an overview strip: drag a window to zoom, resize it by its handles, and read events in place.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Brushchart } from './brush-chart.snippet';

export function Demo() {
  return <Brushchart />;
}
```
