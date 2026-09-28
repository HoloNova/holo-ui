# Hover card

**Category**: disclosure  
**Source**: Docs and live preview: https://uiarc.dev/components/hover-card  
**Component ID**: `hover-card`  
**File**: `hover-card.snippet.tsx`  

## Technical Overview
Preview a person or link on hover or focus without leaving the page.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Hovercard } from './hover-card.snippet';

export function Demo() {
  return <Hovercard />;
}
```
