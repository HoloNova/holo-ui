# Command palette

**Category**: blocks  
**Source**: Use it for product wide actions and navigation. Provide meaningful groups, icons, keyboard shortcuts, and handlers.  
**Component ID**: `command-palette`  
**File**: `command-palette.snippet.tsx`  

## Technical Overview
A complete keyboard driven action surface with search, grouped results, and shortcuts.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Commandpalette } from './command-palette.snippet';

export function Demo() {
  return <Commandpalette />;
}
```
