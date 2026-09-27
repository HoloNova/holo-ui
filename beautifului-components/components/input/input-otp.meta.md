# Input OTP

**Category**: Input  
**Source**: https://input-otp.rodz.dev/  
**Tags**: otp, input, verification-code, auth, 2fa, passcode, sms-code  

## Description
Input OTP is an accessible, unstyled-ready one-time passcode component designed for authentication forms. Unlike flawed implementations that wire multiple separate inputs together with fragile keydown handlers, this component renders a single real HTML input, renders it invisible, and mirrors its state to customizable visual slot elements on top.

## Dependencies
- `shared/base.css` — for OKLCH tokens, hairline borders, and `caret-blink` keyframes
- Tailwind CSS v4

## Key Features
- **One real input under the hood**: All native browser capabilities work out of the box, including SMS autofill (`autocomplete="one-time-code"`), native copy/paste, screen reader announcements, and form submission semantics.
- **Password-manager badge evasion**: Combines `width: calc(100% + 40px)` with `clip-path: inset(0 40px 0 0)` to push injected extension badges (1Password, Bitwarden, LastPass) outside the visible slots without causing layout shifts.
- **Synthetic fake caret**: Smoothly blinks inside the active slot and stays synchronized with input focus and text length.
- **Grouped slot layout**: Standard 3+3 digit arrangement with a monospace separator dot (`·`).
- **Zero-JS graceful degradation**: Includes a `<noscript>` stylesheet that immediately falls back to a clean, centered traditional input when JavaScript is unavailable.

## Customization

### Event Listening
Listen for the `otp-complete` CustomEvent on the root container:
```js
document.querySelector('[data-input-otp-root]').addEventListener('otp-complete', (e) => {
  console.log('Verified passcode:', e.detail.value);
});
```

### Masked Password Mode
To mask characters for high-security PIN entry, update the slot rendering:
```js
valEl.textContent = char ? '•' : '';
```

### React Implementation Pattern
When integrating with React and `input-otp` npm package:
```tsx
import { OTPInput } from 'input-otp';

export function VerificationInput() {
  return (
    <OTPInput
      maxLength={6}
      containerClassName="group flex items-center gap-2"
      render={({ slots }) => (
        <>
          <div className="flex gap-1.5">
            {slots.slice(0, 3).map((slot, idx) => (
              <Slot key={idx} {...slot} />
            ))}
          </div>
          <div className="text-ink-3 font-mono">·</div>
          <div className="flex gap-1.5">
            {slots.slice(3).map((slot, idx) => (
              <Slot key={idx + 3} {...slot} />
            ))}
          </div>
        </>
      )}
    />
  );
}
```

## Use Cases
- Two-factor authentication (2FA) verification prompts
- Passwordless phone number and SMS login confirmation
- Sensitive action authorization and PIN confirmation
