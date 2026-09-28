# Chip group

**Category**: inputs  
**Source**: Docs and live preview: https://uiarc.dev/components/chip-group  
**Component ID**: `chip-group`  
**File**: `chip-group.snippet.tsx`  

## Technical Overview
Filter by a few facets with chips that morph as you pick them.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Chipgroup } from './chip-group.snippet';

export function Demo() {
  return <Chipgroup />;
}
```
