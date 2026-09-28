# Resizable panels

**Category**: disclosure  
**Source**: Docs and live preview: https://uiarc.dev/components/resizable-panels  
**Component ID**: `resizable-panels`  
**File**: `resizable-panels.snippet.tsx`  

## Technical Overview
Trade space between panes by dragging the divider between them.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Resizablepanels } from './resizable-panels.snippet';

export function Demo() {
  return <Resizablepanels />;
}
```
