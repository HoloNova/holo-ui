# Rich text editor

**Category**: inputs  
**Source**: Docs and live preview: https://uiarc.dev/components/rich-text-editor  
**Component ID**: `rich-text-editor`  
**File**: `rich-text-editor.snippet.tsx`  

## Technical Overview
A lightweight editor with markdown shortcuts, a floating toolbar, a slash menu, and HTML and markdown output.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Richtexteditor } from './rich-text-editor.snippet';

export function Demo() {
  return <Richtexteditor />;
}
```
