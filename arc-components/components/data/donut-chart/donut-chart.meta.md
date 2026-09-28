# Donut chart

**Category**: data  
**Source**: Docs and live preview: https://uiarc.dev/components/donut-chart  
**Component ID**: `donut-chart`  
**File**: `donut-chart.snippet.tsx`  

## Technical Overview
A donut whose arcs morph between datasets, with the active value rolling into the center.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Donutchart } from './donut-chart.snippet';

export function Demo() {
  return <Donutchart />;
}
```
