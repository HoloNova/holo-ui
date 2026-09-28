# Tabs

**Category**: disclosure  
**Source**: Docs and live preview: https://uiarc.dev/components/tabs  
**Component ID**: `tabs`  
**File**: `tabs.snippet.tsx`  

## Technical Overview
Switch between related content in the same context.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Tabs } from './tabs.snippet';

export function Demo() {
  return <Tabs />;
}
```
