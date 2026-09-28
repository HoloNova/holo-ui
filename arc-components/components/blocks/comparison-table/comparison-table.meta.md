# Comparison table

**Category**: blocks  
**Source**: Use this on a pricing or alternatives page. Describe your columns and feature rows in comparison-table-data.ts, mark your product with highlight, and point the cta at signup; stickyTop offsets the header under a fixed site header.  
**Component ID**: `comparison-table`  
**File**: `comparison-table.snippet.tsx`  

## Technical Overview
An us versus them table with a sticky header, a highlighted column, and a stacked phone view.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Comparisontable } from './comparison-table.snippet';

export function Demo() {
  return <Comparisontable />;
}
```
