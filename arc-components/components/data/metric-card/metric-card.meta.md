# Metric card

**Category**: data  
**Source**: Docs and live preview: https://uiarc.dev/components/metric-card  
**Component ID**: `metric-card`  
**File**: `metric-card.snippet.tsx`  

## Technical Overview
A compact summary for a number that needs context.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Metriccard } from './metric-card.snippet';

export function Demo() {
  return <Metriccard />;
}
```
