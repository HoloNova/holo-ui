"use client";

import { KeyRound, Loader2, ShieldAlert } from "lucide-react";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useState, type ReactNode } from "react";

// --- Inlined cn utility ---

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


// --- Inlined sibling: @/components/password-strength-bar ---


/**
 * Semantic strength color token. Maps to a meaning, not a raw color, so the
 * component can theme each state with shadcn/ui CSS variables and your
 * password-policy thresholds decide which token applies.
 */
export type StrengthColor = 'error' | 'warning' | 'success';

/** Props for {@link PasswordStrengthBar}. */
export interface PasswordStrengthBarProps {
  /**
   * Strength score, `0`–`100`. **The caller computes this** (length / entropy /
   * a zxcvbn-style estimator) — the bar only renders it. Values outside the
   * range are clamped. Pairs with `@localmode/core` `deriveKey`/crypto in the
   * consuming key-derivation flow.
   */
  value: number;
  /**
   * Human-readable strength label shown beside the bar (e.g. `"Weak"`,
   * `"Good"`, `"Strong"`). The caller decides the wording; the component does
   * not derive it from `value`.
   */
  label?: string;
  /**
   * Semantic color token for the fill and label. `error` (red) for weak,
   * `warning` (amber) for medium, `success` (green) for strong. The caller
   * picks the token from its own thresholds.
   * @default "warning"
   */
  color?: StrengthColor;
  /**
   * When true, hide the textual label and render the bar only.
   * @default false
   */
  hideLabel?: boolean;
  /** Additional class names merged onto the root element. */
  className?: string;
}

/** Fill + text classes per semantic color token. */
const COLOR_CLASSES: Record<StrengthColor, { fill: string; text: string }> = {
  error: { fill: 'bg-red-500', text: 'text-red-600 dark:text-red-400' },
  warning: { fill: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
  success: {
    fill: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
};

/**
 * A presentational password/passphrase strength meter: a themed horizontal bar
 * whose fill and color reflect a **caller-computed** strength score, plus an
 * optional label.
 *
 * This primitive does **no** strength estimation. The app computes the `0`–`100`
 * `value`, the `label` string, and the semantic `color` token (typically from
 * length/entropy or a zxcvbn-style estimator) and passes them in — pairing with
 * `@localmode/core` `deriveKey`/crypto in the surrounding key-derivation flow.
 * There is no turnkey hook; it only renders the state you supply.
 *
 * Styled with shadcn/ui CSS variables so it inherits the consumer's theme.
 *
 * @example
 * ```tsx
 * // app computes strength, e.g. via a zxcvbn-style estimator
 * const { score } = estimate(password); // 0..4
 * <PasswordStrengthBar
 *   value={(score / 4) * 100}
 *   label={['Very weak', 'Weak', 'Fair', 'Good', 'Strong'][score]}
 *   color={score < 2 ? 'error' : score < 3 ? 'warning' : 'success'}
 * />
 * ```
 */
export function PasswordStrengthBar({
  value,
  label,
  color = 'warning',
  hideLabel = false,
  className,
}: PasswordStrengthBarProps) {
  const clamped = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  const colors = COLOR_CLASSES[color];

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div
        role="progressbar"
        aria-label="Password strength"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamped)}
        aria-valuetext={label}
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn('h-full rounded-full transition-all', colors.fill)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {!hideLabel && label && (
        <span className={cn('text-xs font-medium', colors.text)}>{label}</span>
      )}
    </div>
  );
}

export default PasswordStrengthBar;




/**
 * Caller-computed passphrase strength, forwarded to the composed
 * {@link PasswordStrengthBar}. The gate never estimates strength itself — the
 * app computes it from the value emitted via `onPassphraseChange`.
 */
export interface PassphraseStrength {
  /** Strength score, 0–100. */
  value: number;
  /** Human-readable label (e.g. "Weak", "Good", "Strong"). */
  label?: string;
  /** Semantic color token. */
  color?: StrengthColor;
}

/** Props for {@link PassphraseGate}. */
export interface PassphraseGateProps {
  /**
   * `'create'` renders passphrase + confirmation fields with a strength meter;
   * `'unlock'` renders a single passphrase field with an error surface.
   */
  mode: 'create' | 'unlock';
  /**
   * Fired with the entered passphrase when the (validated) form is submitted.
   * The gate performs no crypto and retains no passphrase beyond its controlled
   * field state.
   */
  onSubmit: (passphrase: string) => void;
  /**
   * Fired on every keystroke in the primary passphrase field, so the app can
   * compute and feed back `strength` (create mode) without the gate estimating
   * anything.
   */
  onPassphraseChange?: (value: string) => void;
  /**
   * Caller-computed strength for the composed strength bar (create mode only).
   * Omit to hide the bar.
   */
  strength?: PassphraseStrength;
  /**
   * Minimum passphrase length enforced in create mode (with mismatch/too-short
   * feedback). @default 8
   */
  minLength?: number;
  /**
   * A caller-provided error to surface (e.g. "Incorrect passphrase" after a
   * failed unlock). Re-enables input.
   */
  error?: string;
  /** When true, disables inputs and shows a busy spinner on submit. */
  isBusy?: boolean;
  /** Title slot (heading above the fields). */
  title?: ReactNode;
  /** Description slot (sub-text under the title). */
  description?: ReactNode;
  /** Submit-button label override. Defaults per mode. */
  submitLabel?: string;
  /** Additional class names merged onto the root element. */
  className?: string;
}

/**
 * A controlled, presentational passphrase screen with two modes. Create mode
 * renders passphrase + confirmation fields, enforces a minimum length (default
 * 8) with mismatch feedback, and shows strength by composing the
 * {@link PasswordStrengthBar} primitive from caller-provided `strength` props.
 * Unlock mode renders a single field with a caller-provided `error` surface.
 * Submission emits the passphrase via `onSubmit`.
 *
 * The component performs no crypto, no storage access, and holds no passphrase
 * beyond its controlled field state — the app derives the key and drives the
 * vault. Works with any backend; recommended hook: `useEncryptedVault` from
 * `@localmode/react` (`unlock(passphrase)`, `status`, `error`).
 *
 * Styled with shadcn/ui CSS variables so it inherits the consumer's theme.
 *
 * @example
 * ```tsx
 * const { status, error, unlock } = useEncryptedVault({ name: 'notes' });
 * <PassphraseGate
 *   mode={status === 'uninitialized' ? 'create' : 'unlock'}
 *   onSubmit={unlock}
 *   onPassphraseChange={(v) => setStrength(estimate(v))}
 *   strength={strength}
 *   error={error?.name === 'VaultPassphraseError' ? 'Incorrect passphrase' : undefined}
 * />
 * ```
 */
export function PassphraseGate({
  mode,
  onSubmit,
  onPassphraseChange,
  strength,
  minLength = 8,
  error,
  isBusy = false,
  title,
  description,
  submitLabel,
  className,
}: PassphraseGateProps) {
  const [passphrase, setPassphrase] = useState('');
  const [confirm, setConfirm] = useState('');
  const [touched, setTouched] = useState(false);

  const isCreate = mode === 'create';
  const tooShort = passphrase.length > 0 && passphrase.length < minLength;
  const mismatch = isCreate && confirm.length > 0 && confirm !== passphrase;
  const canSubmit =
    passphrase.length >= minLength && (!isCreate || confirm === passphrase) && !isBusy;

  const handlePassphrase = (value: string) => {
    setPassphrase(value);
    onPassphraseChange?.(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;
    onSubmit(passphrase);
  };

  const defaultLabel = isCreate ? 'Create vault' : 'Unlock';

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex w-full max-w-sm flex-col gap-4 rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <KeyRound className="size-4 text-muted-foreground" aria-hidden="true" />
        <h2 className="text-sm font-semibold">{title ?? defaultLabel}</h2>
      </div>
      {description && <p className="-mt-2 text-xs text-muted-foreground">{description}</p>}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="passphrase-gate-field" className="text-xs font-medium">
          Passphrase
        </label>
        <input
          id="passphrase-gate-field"
          type="password"
          autoComplete={isCreate ? 'new-password' : 'current-password'}
          value={passphrase}
          disabled={isBusy}
          onChange={(e) => handlePassphrase(e.target.value)}
          placeholder="Enter your passphrase…"
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
        />
        {isCreate && strength && (passphrase.length > 0 || strength.value > 0) && (
          <PasswordStrengthBar
            value={strength.value}
            label={strength.label}
            color={strength.color}
          />
        )}
        {tooShort && (
          <p className="text-xs text-destructive">
            Use at least {minLength} characters.
          </p>
        )}
      </div>

      {isCreate && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="passphrase-gate-confirm" className="text-xs font-medium">
            Confirm passphrase
          </label>
          <input
            id="passphrase-gate-confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            disabled={isBusy}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter your passphrase…"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
          />
          {mismatch && (
            <p className="text-xs text-destructive">
              Passphrases don’t match.
            </p>
          )}
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive"
        >
          <ShieldAlert className="size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={touched ? !canSubmit : isBusy}
        aria-busy={isBusy}
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
      >
        {isBusy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {submitLabel ?? defaultLabel}
      </button>
    </form>
  );
}

export default PassphraseGate;
