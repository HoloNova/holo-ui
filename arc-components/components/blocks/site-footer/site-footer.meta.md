# Site footer

**Category**: blocks  
**Source**: Use this as a starting point and replace the sample data with your own.  
**Component ID**: `site-footer`  
**File**: `site-footer.snippet.tsx`  

## Technical Overview
A website footer with link columns and newsletter, a minimal layout, and a large fading Arc mark.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Sitefooter } from './site-footer.snippet';

export function Demo() {
  return <Sitefooter />;
}
```
