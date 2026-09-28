# Sortable data table

**Category**: data  
**Source**: Docs and live preview: https://uiarc.dev/components/sortable-data-table  
**Component ID**: `sortable-data-table`  
**File**: `sortable-data-table.snippet.tsx`  

## Technical Overview
Compare structured records with sortable columns.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Sortabledatatable } from './sortable-data-table.snippet';

export function Demo() {
  return <Sortabledatatable />;
}
```
