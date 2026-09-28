# Theme switcher

**Category**: actions  
**Source**: Docs and live preview: https://uiarc.dev/components/theme-switch  
**Component ID**: `theme-switch`  
**File**: `theme-switch.snippet.tsx`  

## Technical Overview
Four smooth ways to move between light and dark appearance.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Themeswitcher } from './theme-switch.snippet';

export function Demo() {
  return <Themeswitcher />;
}
```
