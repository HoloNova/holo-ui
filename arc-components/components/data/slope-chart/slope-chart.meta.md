# Slope chart

**Category**: data  
**Source**: Docs and live preview: https://uiarc.dev/components/slope-chart  
**Component ID**: `slope-chart`  
**File**: `slope-chart.snippet.tsx`  

## Technical Overview
Before and after on two axes: lines draw in, rank moves sit beside each value, and switching datasets slides every line to its new slope.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Slopechart } from './slope-chart.snippet';

export function Demo() {
  return <Slopechart />;
}
```
