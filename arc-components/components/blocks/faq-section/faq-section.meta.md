# FAQ section

**Category**: blocks  
**Source**: Use this as a starting point and replace the sample data with your own.  
**Component ID**: `faq-section`  
**File**: `faq-section.snippet.tsx`  

## Technical Overview
FAQs as an accordion, a topic rail, or a searchable list that highlights matches.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { FAQsection } from './faq-section.snippet';

export function Demo() {
  return <FAQsection />;
}
```
