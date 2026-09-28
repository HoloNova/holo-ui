# Plan comparison

**Category**: blocks  
**Source**: Use this when people need to weigh plans side by side. Replace the sample features and prices with your current offering.  
**Component ID**: `plan-comparison`  
**File**: `plan-comparison.snippet.tsx`  

## Technical Overview
Compare meaningful differences between plans and billing periods.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Plancomparison } from './plan-comparison.snippet';

export function Demo() {
  return <Plancomparison />;
}
```
