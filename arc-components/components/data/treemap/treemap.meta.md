# Treemap

**Category**: data  
**Source**: Docs and live preview: https://uiarc.dev/components/treemap  
**Component ID**: `treemap`  
**File**: `treemap.snippet.tsx`  

## Technical Overview
A squarified treemap: click to drill and the tiles grow to fill the view, with a breadcrumb back and metrics that morph every tile.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Treemap } from './treemap.snippet';

export function Demo() {
  return <Treemap />;
}
```
