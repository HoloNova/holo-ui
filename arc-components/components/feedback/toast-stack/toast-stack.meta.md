# Toast stack

**Category**: feedback  
**Source**: Docs and live preview: https://uiarc.dev/components/toast-stack  
**Component ID**: `toast-stack`  
**File**: `toast-stack.snippet.tsx`  

## Technical Overview
Stack short results at the edge until you reach for them.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Toaststack } from './toast-stack.snippet';

export function Demo() {
  return <Toaststack />;
}
```
