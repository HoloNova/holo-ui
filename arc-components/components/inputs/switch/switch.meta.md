# Switch

**Category**: inputs  
**Source**: Docs and live preview: https://uiarc.dev/components/switch  
**Component ID**: `switch`  
**File**: `switch.snippet.tsx`  

## Technical Overview
A tactile toggle for settings that take effect immediately.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Switch } from './switch.snippet';

export function Demo() {
  return <Switch />;
}
```
