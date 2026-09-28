# User menu

**Category**: actions  
**Source**: Docs and live preview: https://uiarc.dev/components/user-menu  
**Component ID**: `user-menu`  
**File**: `user-menu.snippet.tsx`  

## Technical Overview
Your account, settings, theme, and sign out behind the avatar. Opens as a bottom sheet on phones.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Usermenu } from './user-menu.snippet';

export function Demo() {
  return <Usermenu />;
}
```
