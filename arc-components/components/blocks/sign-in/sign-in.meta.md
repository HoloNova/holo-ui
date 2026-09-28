# Sign in

**Category**: blocks  
**Source**: Use this as the entry to your app. Send and check codes through your auth provider, connect the passkey button to WebAuthn and the single sign-on buttons to OAuth; everything in the preview is simulated.  
**Component ID**: `sign-in`  
**File**: `sign-in.snippet.tsx`  

## Technical Overview
A sign in card that morphs from email to a six digit code to your account.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Signin } from './sign-in.snippet';

export function Demo() {
  return <Signin />;
}
```
