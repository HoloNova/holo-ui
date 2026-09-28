# Phone input

**Category**: inputs  
**Source**: Docs and live preview: https://uiarc.dev/components/phone-input  
**Component ID**: `phone-input`  
**File**: `phone-input.snippet.tsx`  

## Technical Overview
A phone field with a country picker, formatting as you type, and E.164 output.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Phoneinput } from './phone-input.snippet';

export function Demo() {
  return <Phoneinput />;
}
```
