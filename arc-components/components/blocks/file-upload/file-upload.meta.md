# File upload

**Category**: blocks  
**Source**: Use it for documents or media when people need to see upload progress and recover from invalid files.  
**Component ID**: `file-upload`  
**File**: `file-upload.snippet.tsx`  

## Technical Overview
A complete file selection flow with constraints, progress, and error feedback.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Fileupload } from './file-upload.snippet';

export function Demo() {
  return <Fileupload />;
}
```
