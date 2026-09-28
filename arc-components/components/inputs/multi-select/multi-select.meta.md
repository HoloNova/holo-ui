# Multi-select

**Category**: inputs  
**Source**: Docs and live preview: https://uiarc.dev/components/multi-select  
**Component ID**: `multi-select`  
**File**: `multi-select.snippet.tsx`  

## Technical Overview
Select several values while keeping the field readable.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Multi-select } from './multi-select.snippet';

export function Demo() {
  return <Multi-select />;
}
```
