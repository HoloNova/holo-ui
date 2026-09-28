# Mention input

**Category**: inputs  
**Source**: Docs and live preview: https://uiarc.dev/components/mention-input  
**Component ID**: `mention-input`  
**File**: `mention-input.snippet.tsx`  

## Technical Overview
A textarea with @people and #channel mentions that act as single tokens, with suggestions at the caret.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Mentioninput } from './mention-input.snippet';

export function Demo() {
  return <Mentioninput />;
}
```
