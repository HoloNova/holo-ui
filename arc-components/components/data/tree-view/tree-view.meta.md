# Tree view

**Category**: data  
**Source**: Docs and live preview: https://uiarc.dev/components/tree-view  
**Component ID**: `tree-view`  
**File**: `tree-view.snippet.tsx`  

## Technical Overview
Navigate nested folders and structured content.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Treeview } from './tree-view.snippet';

export function Demo() {
  return <Treeview />;
}
```
