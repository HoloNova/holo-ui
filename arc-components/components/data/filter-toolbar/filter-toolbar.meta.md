# Filter toolbar

**Category**: data  
**Source**: Docs and live preview: https://uiarc.dev/components/filter-toolbar  
**Component ID**: `filter-toolbar`  
**File**: `filter-toolbar.snippet.tsx`  

## Technical Overview
Keep collection filters close and easy to reset.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Filtertoolbar } from './filter-toolbar.snippet';

export function Demo() {
  return <Filtertoolbar />;
}
```
