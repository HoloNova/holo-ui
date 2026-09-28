# File dropzone

**Category**: inputs  
**Source**: Docs and live preview: https://uiarc.dev/components/file-dropzone  
**Component ID**: `file-dropzone`  
**File**: `file-dropzone.snippet.tsx`  

## Technical Overview
A generous target for dropping one or more files.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Filedropzone } from './file-dropzone.snippet';

export function Demo() {
  return <Filedropzone />;
}
```
