# Ridgeline

**Category**: data  
**Source**: Docs and live preview: https://uiarc.dev/components/ridgeline  
**Component ID**: `ridgeline`  
**File**: `ridgeline.snippet.tsx`  

## Technical Overview
Overlapping distributions, one ridge per group: hover to lift a ridge and read its quartiles, switch datasets and every curve morphs.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Ridgeline } from './ridgeline.snippet';

export function Demo() {
  return <Ridgeline />;
}
```
