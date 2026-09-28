# Breadcrumb

**Category**: disclosure  
**Source**: Docs and live preview: https://uiarc.dev/components/breadcrumb  
**Component ID**: `breadcrumb`  
**File**: `breadcrumb.snippet.tsx`  

## Technical Overview
Show where a page sits in a hierarchy.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Breadcrumb } from './breadcrumb.snippet';

export function Demo() {
  return <Breadcrumb />;
}
```
