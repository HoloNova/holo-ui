# Page header

**Category**: blocks  
**Source**: Use this at the top of a project, repository, or record page. Connect breadcrumbs to your router, tab counts and status to your data, and Follow, Share update, New issue, and Archive to your API; every action in the preview is simulated.  
**Component ID**: `page-header`  
**File**: `page-header.snippet.tsx`  

## Technical Overview
A project page header that folds into a compact bar as you scroll, with tabs whose counts roll.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Pageheader } from './page-header.snippet';

export function Demo() {
  return <Pageheader />;
}
```
