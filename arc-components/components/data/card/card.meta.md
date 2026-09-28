# Card

**Category**: data  
**Source**: Docs and live preview: https://uiarc.dev/components/card  
**Component ID**: `card`  
**File**: `card.snippet.tsx`  

## Technical Overview
A contained group of related content and actions.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Card } from './card.snippet';

export function Demo() {
  return <Card />;
}
```
