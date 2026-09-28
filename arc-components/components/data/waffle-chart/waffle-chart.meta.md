# Waffle chart

**Category**: data  
**Source**: Docs and live preview: https://uiarc.dev/components/waffle-chart  
**Component ID**: `waffle-chart`  
**File**: `waffle-chart.snippet.tsx`  

## Technical Overview
A ten by ten unit chart where every cell is one percent, and cells fly to their new group when the data changes.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Wafflechart } from './waffle-chart.snippet';

export function Demo() {
  return <Wafflechart />;
}
```
