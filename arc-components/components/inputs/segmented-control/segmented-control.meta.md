# Segmented control

**Category**: inputs  
**Source**: Docs and live preview: https://uiarc.dev/components/segmented-control  
**Component ID**: `segmented-control`  
**File**: `segmented-control.snippet.tsx`  

## Technical Overview
Switch between a small set of related views.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Segmentedcontrol } from './segmented-control.snippet';

export function Demo() {
  return <Segmentedcontrol />;
}
```
