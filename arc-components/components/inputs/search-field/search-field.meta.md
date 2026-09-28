# Search field

**Category**: inputs  
**Source**: Docs and live preview: https://uiarc.dev/components/search-field  
**Component ID**: `search-field`  
**File**: `search-field.snippet.tsx`  

## Technical Overview
A recognizable search entry point with clear affordances.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Searchfield } from './search-field.snippet';

export function Demo() {
  return <Searchfield />;
}
```
