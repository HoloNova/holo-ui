# Stepper

**Category**: feedback  
**Source**: Docs and live preview: https://uiarc.dev/components/stepper  
**Component ID**: `stepper`  
**File**: `stepper.snippet.tsx`  

## Technical Overview
Show where a person is in a multi-step flow and what is done.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Stepper } from './stepper.snippet';

export function Demo() {
  return <Stepper />;
}
```
