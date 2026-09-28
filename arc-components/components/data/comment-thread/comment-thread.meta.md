# Comment thread

**Category**: data  
**Source**: Docs and live preview: https://uiarc.dev/components/comment-thread  
**Component ID**: `comment-thread`  
**File**: `comment-thread.snippet.tsx`  

## Technical Overview
Threaded comments with replies, reactions, mentions, inline edit, and resolve.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Commentthread } from './comment-thread.snippet';

export function Demo() {
  return <Commentthread />;
}
```
