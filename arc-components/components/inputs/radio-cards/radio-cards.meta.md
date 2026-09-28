# Radio cards

**Category**: inputs  
**Source**: Docs and live preview: https://uiarc.dev/components/radio-cards  
**Component ID**: `radio-cards`  
**File**: `radio-cards.snippet.tsx`  

## Technical Overview
Selectable option cards with a sliding selection ring, price and description slots, and radio keyboard behavior.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Radiocards } from './radio-cards.snippet';

export function Demo() {
  return <Radiocards />;
}
```
