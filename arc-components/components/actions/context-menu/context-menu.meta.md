# Context menu

**Category**: actions  
**Source**: Docs and live preview: https://uiarc.dev/components/context-menu  
**Component ID**: `context-menu`  
**File**: `context-menu.snippet.tsx`  

## Technical Overview
Secondary actions kept close to the selected object.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Contextmenu } from './context-menu.snippet';

export function Demo() {
  return <Contextmenu />;
}
```
