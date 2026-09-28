# Avatar

**Category**: data  
**Source**: Docs and live preview: https://uiarc.dev/components/avatar  
**Component ID**: `avatar`  
**File**: `avatar.snippet.tsx`  

## Technical Overview
A compact identity marker for people and accounts.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Avatar } from './avatar.snippet';

export function Demo() {
  return <Avatar />;
}
```
