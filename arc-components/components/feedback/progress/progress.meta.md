# Progress

**Category**: feedback  
**Source**: Docs and live preview: https://uiarc.dev/components/progress  
**Component ID**: `progress`  
**File**: `progress.snippet.tsx`  

## Technical Overview
Show how much of a known task is complete.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Progress } from './progress.snippet';

export function Demo() {
  return <Progress />;
}
```
