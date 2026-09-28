# Radio group

**Category**: inputs  
**Source**: Docs and live preview: https://uiarc.dev/components/radio-group  
**Component ID**: `radio-group`  
**File**: `radio-group.snippet.tsx`  

## Technical Overview
Choose one option from a visible set.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Radiogroup } from './radio-group.snippet';

export function Demo() {
  return <Radiogroup />;
}
```
