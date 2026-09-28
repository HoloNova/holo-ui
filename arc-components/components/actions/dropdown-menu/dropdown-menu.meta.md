# Dropdown menu

**Category**: actions  
**Source**: Docs and live preview: https://uiarc.dev/components/dropdown-menu  
**Component ID**: `dropdown-menu`  
**File**: `dropdown-menu.snippet.tsx`  

## Technical Overview
A focused list of actions anchored to a trigger.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Dropdownmenu } from './dropdown-menu.snippet';

export function Demo() {
  return <Dropdownmenu />;
}
```
