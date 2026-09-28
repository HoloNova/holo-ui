# Text shimmer

**Category**: text  
**Source**: Docs and live preview: https://uiarc.dev/components/text-shimmer  
**Component ID**: `text-shimmer`  
**File**: `text-shimmer.snippet.tsx`  

## Technical Overview
Show ongoing work with a calm light across the words.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Textshimmer } from './text-shimmer.snippet';

export function Demo() {
  return <Textshimmer />;
}
```
