# Contact section

**Category**: blocks  
**Source**: Use this as a starting point and replace the sample data with your own.  
**Component ID**: `contact-section`  
**File**: `contact-section.snippet.tsx`  

## Technical Overview
A validated contact form that morphs into a confirmation, support channels, and office cards with local times.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Contactsection } from './contact-section.snippet';

export function Demo() {
  return <Contactsection />;
}
```
