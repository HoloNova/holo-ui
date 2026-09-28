# Newsletter signup

**Category**: blocks  
**Source**: Use this to collect newsletter or waitlist emails. Pass onSubscribe to call your email provider and throw on failure; subscribing in the preview is simulated.  
**Component ID**: `newsletter-signup`  
**File**: `newsletter-signup.snippet.tsx`  

## Technical Overview
An email signup framed by a stack of past issues; subscribing drops the next issue, addressed to you, onto the front.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Newslettersignup } from './newsletter-signup.snippet';

export function Demo() {
  return <Newslettersignup />;
}
```
