# Textarea

**Category**: inputs  
**Source**: Docs and live preview: https://uiarc.dev/components/textarea  
**Component ID**: `textarea`  
**File**: `textarea.snippet.tsx`  

## Technical Overview
A multiline field for notes, descriptions, and longer text.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Textarea } from './textarea.snippet';

export function Demo() {
  return <Textarea />;
}
```
