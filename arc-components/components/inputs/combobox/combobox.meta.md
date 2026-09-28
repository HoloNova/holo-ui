# Combobox

**Category**: inputs  
**Source**: Docs and live preview: https://uiarc.dev/components/combobox  
**Component ID**: `combobox`  
**File**: `combobox.snippet.tsx`  

## Technical Overview
Search and select from a list without leaving the field.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Combobox } from './combobox.snippet';

export function Demo() {
  return <Combobox />;
}
```
