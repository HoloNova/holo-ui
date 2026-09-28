# Swipe actions

**Category**: actions  
**Source**: Docs and live preview: https://uiarc.dev/components/swipe-actions  
**Component ID**: `swipe-actions`  
**File**: `swipe-actions.snippet.tsx`  

## Technical Overview
Reveal row actions with a swipe, or from the same actions in a menu.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Swipeactions } from './swipe-actions.snippet';

export function Demo() {
  return <Swipeactions />;
}
```
