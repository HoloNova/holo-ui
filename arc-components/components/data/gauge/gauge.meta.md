# Gauge

**Category**: data  
**Source**: Docs and live preview: https://uiarc.dev/components/gauge  
**Component ID**: `gauge`  
**File**: `gauge.snippet.tsx`  

## Technical Overview
Show a value against a known range.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Gauge } from './gauge.snippet';

export function Demo() {
  return <Gauge />;
}
```
