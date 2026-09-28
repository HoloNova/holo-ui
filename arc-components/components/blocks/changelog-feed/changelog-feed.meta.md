# Changelog feed

**Category**: blocks  
**Source**: Use this for a product changelog page. Load entries from your release notes source and connect the subscribe control to your mailing list.  
**Component ID**: `changelog-feed`  
**File**: `changelog-feed.snippet.tsx`  

## Technical Overview
Release notes you can filter, open in place, and scroll through month by month.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Changelogfeed } from './changelog-feed.snippet';

export function Demo() {
  return <Changelogfeed />;
}
```
