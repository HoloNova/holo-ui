# Checkbox

**Category**: inputs  
**Source**: Docs and live preview: https://uiarc.dev/components/checkbox  
**Component ID**: `checkbox`  
**File**: `checkbox.snippet.tsx`  

## Technical Overview
A binary choice with a precise, legible state.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Checkbox } from './checkbox.snippet';

export function Demo() {
  return <Checkbox />;
}
```
