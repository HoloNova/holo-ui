# Animated counter

**Category**: data  
**Source**: Docs and live preview: https://uiarc.dev/components/animated-counter  
**Component ID**: `animated-counter`  
**File**: `animated-counter.snippet.tsx`  

## Technical Overview
Give changing totals a clear sense of movement.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Animatedcounter } from './animated-counter.snippet';

export function Demo() {
  return <Animatedcounter />;
}
```
