# Select

**Category**: inputs  
**Source**: Docs and live preview: https://uiarc.dev/components/select  
**Component ID**: `select`  
**File**: `select.snippet.tsx`  

## Technical Overview
A compact choice field with a keyboard friendly menu.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Select } from './select.snippet';

export function Demo() {
  return <Select />;
}
```
