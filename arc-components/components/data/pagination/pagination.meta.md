# Pagination

**Category**: data  
**Source**: Docs and live preview: https://uiarc.dev/components/pagination  
**Component ID**: `pagination`  
**File**: `pagination.snippet.tsx`  

## Technical Overview
Move through a long collection with clear bounds.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Pagination } from './pagination.snippet';

export function Demo() {
  return <Pagination />;
}
```
