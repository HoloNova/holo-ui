# Inline edit

**Category**: inputs  
**Source**: Docs and live preview: https://uiarc.dev/components/inline-edit  
**Component ID**: `inline-edit`  
**File**: `inline-edit.snippet.tsx`  

## Technical Overview
Rename in place: the text becomes a field without moving.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Inlineedit } from './inline-edit.snippet';

export function Demo() {
  return <Inlineedit />;
}
```
