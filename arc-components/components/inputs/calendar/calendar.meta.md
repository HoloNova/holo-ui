# Calendar

**Category**: inputs  
**Source**: Docs and live preview: https://uiarc.dev/components/calendar  
**Component ID**: `calendar`  
**File**: `calendar.snippet.tsx`  

## Technical Overview
Browse dates in a clear, compact month view.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Calendar } from './calendar.snippet';

export function Demo() {
  return <Calendar />;
}
```
