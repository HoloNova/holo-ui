# Date range picker

**Category**: inputs  
**Source**: Docs and live preview: https://uiarc.dev/components/date-range-picker  
**Component ID**: `date-range-picker`  
**File**: `date-range-picker.snippet.tsx`  

## Technical Overview
A range picker that grows from its trigger into two months with presets and a stretching range highlight.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Daterangepicker } from './date-range-picker.snippet';

export function Demo() {
  return <Daterangepicker />;
}
```
