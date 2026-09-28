# Password field

**Category**: inputs  
**Source**: Docs and live preview: https://uiarc.dev/components/password-field  
**Component ID**: `password-field`  
**File**: `password-field.snippet.tsx`  

## Technical Overview
Capture sensitive text with a visible reveal control.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Passwordfield } from './password-field.snippet';

export function Demo() {
  return <Passwordfield />;
}
```
