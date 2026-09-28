# Stats band

**Category**: blocks  
**Source**: Use this under a hero or between sections to back a claim with numbers. Replace the sample stats in stats-band-data.ts.  
**Component ID**: `stats-band`  
**File**: `stats-band.snippet.tsx`  

## Technical Overview
Headline numbers that count up in view, each with a tiny visual that proves it and a context line on hover, plain or in a hairline grid.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Statsband } from './stats-band.snippet';

export function Demo() {
  return <Statsband />;
}
```
