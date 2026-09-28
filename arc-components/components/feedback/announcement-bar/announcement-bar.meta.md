# Announcement bar

**Category**: feedback  
**Source**: Docs and live preview: https://uiarc.dev/components/announcement-bar  
**Component ID**: `announcement-bar`  
**File**: `announcement-bar.snippet.tsx`  

## Technical Overview
A top banner that rotates messages, counts down, and collapses smoothly when dismissed.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Announcementbar } from './announcement-bar.snippet';

export function Demo() {
  return <Announcementbar />;
}
```
