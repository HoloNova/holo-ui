# Expandable card

**Category**: disclosure  
**Source**: Docs and live preview: https://uiarc.dev/components/expandable-card  
**Component ID**: `expandable-card`  
**File**: `expandable-card.snippet.tsx`  

## Technical Overview
Give a dense card more room when requested.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Expandablecard } from './expandable-card.snippet';

export function Demo() {
  return <Expandablecard />;
}
```
