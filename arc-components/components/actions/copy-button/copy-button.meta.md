# Copy button

**Category**: actions  
**Source**: Docs and live preview: https://uiarc.dev/components/copy-button  
**Component ID**: `copy-button`  
**File**: `copy-button.snippet.tsx`  

## Technical Overview
Copy a value with immediate confirmation.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Copybutton } from './copy-button.snippet';

export function Demo() {
  return <Copybutton />;
}
```
