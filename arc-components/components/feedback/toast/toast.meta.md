# Toast

**Category**: feedback  
**Source**: Docs and live preview: https://uiarc.dev/components/toast  
**Component ID**: `toast`  
**File**: `toast.snippet.tsx`  

## Technical Overview
Brief confirmation for a completed background action.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Toast } from './toast.snippet';

export function Demo() {
  return <Toast />;
}
```
