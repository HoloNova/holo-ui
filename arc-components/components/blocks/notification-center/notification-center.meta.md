# Notification center

**Category**: blocks  
**Source**: Use it when updates need a persistent home instead of a brief toast. Connect read state to your data store.  
**Component ID**: `notification-center`  
**File**: `notification-center.snippet.tsx`  

## Technical Overview
A home for updates with read state, grouped information, and animated disclosure.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Notificationcenter } from './notification-center.snippet';

export function Demo() {
  return <Notificationcenter />;
}
```
