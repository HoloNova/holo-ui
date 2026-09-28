# Accordion

**Category**: disclosure  
**Source**: Docs and live preview: https://uiarc.dev/components/accordion  
**Component ID**: `accordion`  
**File**: `accordion.snippet.tsx`  

## Technical Overview
Progressively reveal supporting information in place.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Accordion } from './accordion.snippet';

export function Demo() {
  return <Accordion />;
}
```
