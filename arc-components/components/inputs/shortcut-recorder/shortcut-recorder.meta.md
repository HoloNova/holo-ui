# Shortcut recorder

**Category**: inputs  
**Source**: Docs and live preview: https://uiarc.dev/components/shortcut-recorder  
**Component ID**: `shortcut-recorder`  
**File**: `shortcut-recorder.snippet.tsx`  

## Technical Overview
Record key combinations into key caps, with conflict warnings, Kbd, and a searchable cheatsheet.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Shortcutrecorder } from './shortcut-recorder.snippet';

export function Demo() {
  return <Shortcutrecorder />;
}
```
