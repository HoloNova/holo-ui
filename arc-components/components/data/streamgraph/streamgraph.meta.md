# Streamgraph

**Category**: data  
**Source**: Docs and live preview: https://uiarc.dev/components/streamgraph  
**Component ID**: `streamgraph`  
**File**: `streamgraph.snippet.tsx`  

## Technical Overview
Layered streams on a wiggle baseline that morph between ranges, with a layer you can isolate and read week by week.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Streamgraph } from './streamgraph.snippet';

export function Demo() {
  return <Streamgraph />;
}
```
