# Avatar group

**Category**: data  
**Source**: Docs and live preview: https://uiarc.dev/components/avatar-group  
**Component ID**: `avatar-group`  
**File**: `avatar-group.snippet.tsx`  

## Technical Overview
Show a team or set of contributors in a small space.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Avatargroup } from './avatar-group.snippet';

export function Demo() {
  return <Avatargroup />;
}
```
