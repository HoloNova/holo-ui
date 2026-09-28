# Billing toggle

**Category**: inputs  
**Source**: Docs and live preview: https://uiarc.dev/components/billing-toggle  
**Component ID**: `billing-toggle`  
**File**: `billing-toggle.snippet.tsx`  

## Technical Overview
A monthly and yearly switch with a savings badge and prices that roll to the new amount.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Billingtoggle } from './billing-toggle.snippet';

export function Demo() {
  return <Billingtoggle />;
}
```
