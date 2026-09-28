# Logo marquee

**Category**: blocks  
**Source**: Use this to show a collection of organizations or tools. Replace the sample marks with brands you have permission to represent.  
**Component ID**: `logo-marquee`  
**File**: `logo-marquee.snippet.tsx`  

## Technical Overview
A quiet, continuously moving row of brand marks with a pause control.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Logomarquee } from './logo-marquee.snippet';

export function Demo() {
  return <Logomarquee />;
}
```
