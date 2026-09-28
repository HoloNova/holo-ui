# Chat thread

**Category**: data  
**Source**: Docs and live preview: https://uiarc.dev/components/chat-thread  
**Component ID**: `chat-thread`  
**File**: `chat-thread.snippet.tsx`  

## Technical Overview
A chat thread with grouped messages, reactions, read receipts, typing, and a composer with attachments.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Chatthread } from './chat-thread.snippet';

export function Demo() {
  return <Chatthread />;
}
```
