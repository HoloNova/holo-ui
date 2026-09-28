# In-view title

**Category**: text  
**Source**: Docs and live preview: https://uiarc.dev/components/in-view-title  
**Component ID**: `in-view-title`  
**File**: `in-view-title.snippet.tsx`  

## Technical Overview
Bring a section title in as it scrolls into view.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { In-viewtitle } from './in-view-title.snippet';

export function Demo() {
  return <In-viewtitle />;
}
```
