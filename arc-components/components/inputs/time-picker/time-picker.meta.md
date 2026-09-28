# Time picker

**Category**: inputs  
**Source**: Docs and live preview: https://uiarc.dev/components/time-picker  
**Component ID**: `time-picker`  
**File**: `time-picker.snippet.tsx`  

## Technical Overview
Choose a time with sensible keyboard behavior.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Timepicker } from './time-picker.snippet';

export function Demo() {
  return <Timepicker />;
}
```
