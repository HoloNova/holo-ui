# Drawer

**Category**: disclosure  
**Source**: Docs and live preview: https://uiarc.dev/components/drawer  
**Component ID**: `drawer`  
**File**: `drawer.snippet.tsx`  

## Technical Overview
A temporary side surface for focused work.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Drawer } from './drawer.snippet';

export function Demo() {
  return <Drawer />;
}
```
