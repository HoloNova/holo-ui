# Text morph

**Category**: text  
**Source**: Docs and live preview: https://uiarc.dev/components/text-morph  
**Component ID**: `text-morph`  
**File**: `text-morph.snippet.tsx`  

## Technical Overview
Morph a label into its next state, letter by letter.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Textmorph } from './text-morph.snippet';

export function Demo() {
  return <Textmorph />;
}
```
