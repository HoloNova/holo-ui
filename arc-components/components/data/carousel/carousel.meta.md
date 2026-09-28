# Carousel

**Category**: data  
**Source**: Docs and live preview: https://uiarc.dev/components/carousel  
**Component ID**: `carousel`  
**File**: `carousel.snippet.tsx`  

## Technical Overview
Browse a row of slides by dragging, flicking, or arrowing through them.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Carousel } from './carousel.snippet';

export function Demo() {
  return <Carousel />;
}
```
