# Timeline

**Category**: data  
**Source**: Docs and live preview: https://uiarc.dev/components/timeline  
**Component ID**: `timeline`  
**File**: `timeline.snippet.tsx`  

## Technical Overview
Follow what happened, newest first, grouped by day.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Timeline } from './timeline.snippet';

export function Demo() {
  return <Timeline />;
}
```
