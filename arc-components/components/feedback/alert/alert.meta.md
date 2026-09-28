# Alert

**Category**: feedback  
**Source**: Docs and live preview: https://uiarc.dev/components/alert  
**Component ID**: `alert`  
**File**: `alert.snippet.tsx`  

## Technical Overview
A persistent message that helps people recover or continue.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Alert } from './alert.snippet';

export function Demo() {
  return <Alert />;
}
```
