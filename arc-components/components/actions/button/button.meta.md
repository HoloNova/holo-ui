# Button

**Category**: actions  
**Source**: Docs and live preview: https://uiarc.dev/components/button  
**Component ID**: `button`  
**File**: `button.snippet.tsx`  

## Technical Overview
A clear, responsive action with quiet secondary states.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Button } from './button.snippet';

export function Demo() {
  return <Button />;
}
```
