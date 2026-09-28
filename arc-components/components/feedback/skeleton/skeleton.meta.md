# Skeleton

**Category**: feedback  
**Source**: Docs and live preview: https://uiarc.dev/components/skeleton  
**Component ID**: `skeleton`  
**File**: `skeleton.snippet.tsx`  

## Technical Overview
Reserve space while content is still loading.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Skeleton } from './skeleton.snippet';

export function Demo() {
  return <Skeleton />;
}
```
