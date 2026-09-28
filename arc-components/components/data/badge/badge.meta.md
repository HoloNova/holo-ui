# Badge

**Category**: data  
**Source**: Docs and live preview: https://uiarc.dev/components/badge  
**Component ID**: `badge`  
**File**: `badge.snippet.tsx`  

## Technical Overview
A small label for status, category, or metadata.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Badge } from './badge.snippet';

export function Demo() {
  return <Badge />;
}
```
