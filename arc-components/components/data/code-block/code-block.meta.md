# Code block

**Category**: data  
**Source**: Docs and live preview: https://uiarc.dev/components/code-block  
**Component ID**: `code-block`  
**File**: `code-block.snippet.tsx`  

## Technical Overview
Present code with legible hierarchy and copy access.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Codeblock } from './code-block.snippet';

export function Demo() {
  return <Codeblock />;
}
```
