# Date picker

**Category**: inputs  
**Source**: Docs and live preview: https://uiarc.dev/components/date-picker  
**Component ID**: `date-picker`  
**File**: `date-picker.snippet.tsx`  

## Technical Overview
Choose a date without losing context.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Datepicker } from './date-picker.snippet';

export function Demo() {
  return <Datepicker />;
}
```
