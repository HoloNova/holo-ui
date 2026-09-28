# Tag input

**Category**: inputs  
**Source**: Docs and live preview: https://uiarc.dev/components/tag-input  
**Component ID**: `tag-input`  
**File**: `tag-input.snippet.tsx`  

## Technical Overview
Turn short text values into removable tags.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Taginput } from './tag-input.snippet';

export function Demo() {
  return <Taginput />;
}
```
