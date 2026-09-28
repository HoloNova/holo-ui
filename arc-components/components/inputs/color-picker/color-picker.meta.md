# Color picker

**Category**: inputs  
**Source**: Docs and live preview: https://uiarc.dev/components/color-picker  
**Component ID**: `color-picker`  
**File**: `color-picker.snippet.tsx`  

## Technical Overview
A swatch that grows into a picker with format morphing, eyedropper, saved swatches, and contrast readout.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Colorpicker } from './color-picker.snippet';

export function Demo() {
  return <Colorpicker />;
}
```
