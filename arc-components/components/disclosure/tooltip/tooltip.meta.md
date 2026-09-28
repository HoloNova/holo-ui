# Tooltip

**Category**: disclosure  
**Source**: Docs and live preview: https://uiarc.dev/components/tooltip  
**Component ID**: `tooltip`  
**File**: `tooltip.snippet.tsx`  

## Technical Overview
Short supporting text for unfamiliar controls.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Tooltip } from './tooltip.snippet';

export function Demo() {
  return <Tooltip />;
}
```
