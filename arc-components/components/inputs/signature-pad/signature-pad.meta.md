# Signature pad

**Category**: inputs  
**Source**: Docs and live preview: https://uiarc.dev/components/signature-pad  
**Component ID**: `signature-pad`  
**File**: `signature-pad.snippet.tsx`  

## Technical Overview
Smooth ink that thins with speed, with undo, replay, and PNG or SVG export.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Signaturepad } from './signature-pad.snippet';

export function Demo() {
  return <Signaturepad />;
}
```
