# Centered login

**Category**: blocks  
**Source**: Use this as a full screen sign in page (pass fullScreen). Connect the passkey button to WebAuthn, the email step to your magic code sender, the code step to verification, and the SSO buttons to your OAuth routes; onSignIn receives the email, method and mode.  
**Component ID**: `login-centered`  
**File**: `login-centered.snippet.tsx`  

## Technical Overview
A passkey-first login card on a quiet ring backdrop that morphs through email and code.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Centeredlogin } from './login-centered.snippet';

export function Demo() {
  return <Centeredlogin />;
}
```
