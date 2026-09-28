# Input

**Category**: inputs  
**Source**: Docs and live preview: https://uiarc.dev/components/input  
**Component ID**: `input`  
**File**: `input.snippet.tsx`  

## Technical Overview
A single line field with clear labels and useful states.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Input } from './input.snippet';

export function Demo() {
  return <Input />;
}
```
