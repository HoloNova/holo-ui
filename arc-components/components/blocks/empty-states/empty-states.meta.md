# Empty states

**Category**: blocks  
**Source**: Use this for no results, offline, inbox zero and missing page moments. Wire each action to your real filter reset, retry, refresh or search; the preview simulates them locally.  
**Component ID**: `empty-states`  
**File**: `empty-states.snippet.tsx`  

## Technical Overview
Four empty states in one illustration whose shapes morph between scenes as you switch tabs.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Emptystates } from './empty-states.snippet';

export function Demo() {
  return <Emptystates />;
}
```
