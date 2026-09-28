# CTA section

**Category**: blocks  
**Source**: Use this to ask for a trial, demo or signup. Pass href or onClick to each action; edit sample copy in cta-section-data.ts. Buttons in the preview confirm in place.  
**Component ID**: `cta-section`  
**File**: `cta-section.snippet.tsx`  

## Technical Overview
A call to action as a centered closing section, a split beside a setup card that completes itself, or a dismissible banner.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { CTAsection } from './cta-section.snippet';

export function Demo() {
  return <CTAsection />;
}
```
