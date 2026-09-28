# Sign up form

**Category**: blocks  
**Source**: Use this as the client side of an account flow. Supply an onSubmit handler that creates the account and handles server errors.  
**Component ID**: `signup-form`  
**File**: `signup-form.snippet.tsx`  

## Technical Overview
An account creation flow with field validation, password strength, and a clear completion state.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Signupform } from './signup-form.snippet';

export function Demo() {
  return <Signupform />;
}
```
