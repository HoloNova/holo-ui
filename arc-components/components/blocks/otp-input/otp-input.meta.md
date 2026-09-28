# OTP input

**Category**: blocks  
**Source**: Use it as part of verification after you have sent a code. Validate the code on your server.  
**Component ID**: `otp-input`  
**File**: `otp-input.snippet.tsx`  

## Technical Overview
A six digit verification flow with paste support and keyboard navigation.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { OTPinput } from './otp-input.snippet';

export function Demo() {
  return <OTPinput />;
}
```
