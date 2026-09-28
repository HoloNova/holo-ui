# Usage meter

**Category**: feedback  
**Source**: Docs and live preview: https://uiarc.dev/components/usage-meter  
**Component ID**: `usage-meter`  
**File**: `usage-meter.snippet.tsx`  

## Technical Overview
Show what fills an allowance and how close it is to the limit.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Usagemeter } from './usage-meter.snippet';

export function Demo() {
  return <Usagemeter />;
}
```
