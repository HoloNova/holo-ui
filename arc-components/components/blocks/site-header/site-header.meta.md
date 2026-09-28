# Site header

**Category**: blocks  
**Source**: Use this as a starting point and replace the sample data with your own.  
**Component ID**: `site-header`  
**File**: `site-header.snippet.tsx`  

## Technical Overview
A sticky website header that turns solid on scroll, with a gliding active link, mega menu panels, and a mobile sheet.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Siteheader } from './site-header.snippet';

export function Demo() {
  return <Siteheader />;
}
```
