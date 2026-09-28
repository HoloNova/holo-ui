# Slider

**Category**: inputs  
**Source**: Docs and live preview: https://uiarc.dev/components/slider  
**Component ID**: `slider`  
**File**: `slider.snippet.tsx`  

## Technical Overview
Pick a value or a range on a track that follows your finger.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Slider } from './slider.snippet';

export function Demo() {
  return <Slider />;
}
```
