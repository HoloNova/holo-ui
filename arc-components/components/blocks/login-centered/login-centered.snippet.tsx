"use client";

import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionStyle, type Transition, type Variants } from "motion/react";
import { Check, FingerprintPattern, Mail } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type FormEvent, type PointerEvent } from "react";

// ── Motion Tokens Presets ──
export const motionTokens = {
  duration: { instant: 0.12, fast: 0.16, exit: 0.18, standard: 0.24, considered: 0.48 },
  ease: {
    enter: [0.16, 1, 0.3, 1],
    exit: [0.7, 0, 0.84, 0],
    standard: [0.22, 1, 0.36, 1],
    inOut: [0.65, 0, 0.35, 1],
  },
  spring: {
    responsive: { type: "spring", stiffness: 520, damping: 38 },
    gentle: { type: "spring", stiffness: 340, damping: 34 },
    snappy: { type: "spring", visualDuration: 0.26, bounce: 0.12 },
    smooth: { type: "spring", visualDuration: 0.4, bounce: 0 },
    morph: { type: "spring", visualDuration: 0.42, bounce: 0.16 },
  },
  stagger: { char: 0.016, word: 0.04, line: 0.08, item: 0.035 },
  blur: { subtle: 2, soft: 4, text: 8 },
} as const;

// ── Scoped CSS & Styles Proxy ──
const ARC_LOGIN_CENTERED_STYLES = `/* The screen fills its container like a viewport. Bars share one height, so the stage center and the ring center stay the same point. */
.arc-login-centered-screen { --bar: 64px; container: login-centered / inline-size; position: relative; isolation: isolate; display: grid; grid-template-rows: var(--bar) minmax(0, 1fr) var(--bar); width: 100%; min-width: 0; min-height: 640px; justify-self: stretch; align-self: stretch; overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius-panel); background: var(--background); color: var(--foreground); font-family: var(--font-body); letter-spacing: var(--tracking-body); }
.arc-login-centered-fullScreen { min-height: 100dvh; border: 0; border-radius: 0; }

/* Quiet line backdrop. The mask only fades the outer rings into the canvas; nothing here is filled. */
.arc-login-centered-backdrop { position: absolute; inset: 0; z-index: -1; pointer-events: none; -webkit-mask-image: radial-gradient(ellipse 72% 78% at 50% 50%, #000 38%, transparent 100%); mask-image: radial-gradient(ellipse 72% 78% at 50% 50%, #000 38%, transparent 100%); }
.arc-login-centered-lines { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.arc-login-centered-ring, .arc-login-centered-axis { fill: none; stroke: var(--border-subtle); stroke-width: 1; }
.arc-login-centered-ring { transform: translate(calc(var(--dx, 0px) * var(--k, 1)), calc(var(--dy, 0px) * var(--k, 1))); }
.arc-login-centered-ringMajor { stroke: var(--border); }
.arc-login-centered-axis { transform: translate(var(--dx, 0px), var(--dy, 0px)); }

.arc-login-centered-bar, .arc-login-centered-foot { display: flex; min-width: 0; align-items: center; justify-content: space-between; gap: var(--space-4); padding: 0 var(--space-6); }
.arc-login-centered-mark { display: inline-flex; align-items: center; gap: var(--space-2); font-size: var(--text-base); font-weight: 500; line-height: 1; }
.arc-login-centered-switch { display: inline-flex; min-width: 0; align-items: center; gap: var(--space-1); margin: 0; color: var(--text-secondary); font-size: var(--text-sm); line-height: var(--leading-body); white-space: nowrap; }
.arc-login-centered-switchPrompt { position: relative; display: inline-flex; justify-content: flex-end; }
.arc-login-centered-switchPrompt > span, .arc-login-centered-switchButton > span { display: inline-block; }
.arc-login-centered-switchButton { position: relative; display: inline-flex; min-height: var(--control-height-sm); align-items: center; border: 0; border-radius: var(--radius-pill); padding: 0 var(--space-3); background: none; color: var(--foreground); font: inherit; font-weight: 500; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: background-color var(--duration-fast) var(--ease-standard); }
.arc-login-centered-switchButton:active { background: var(--surface-muted); }

.arc-login-centered-stage { display: grid; min-width: 0; place-items: center; padding: var(--space-6) var(--space-4); }
.arc-login-centered-card { width: min(100%, 420px); min-width: 0; overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius-surface); background: var(--surface); box-shadow: var(--shadow-resting); }
/* Clips the leaving step while the height glides; steps carry their own padding. */
.arc-login-centered-viewport { overflow: hidden; }
.arc-login-centered-track { position: relative; }
.arc-login-centered-step { display: grid; min-width: 0; padding: var(--space-8); }

.arc-login-centered-heading { display: grid; gap: var(--space-2); margin-bottom: var(--space-6); }
.arc-login-centered-heading h2 { margin: 0; font-family: var(--font-display); font-size: var(--text-3xl); font-weight: 400; letter-spacing: var(--tracking-display); line-height: var(--leading-display); text-wrap: balance; }
.arc-login-centered-heading p { margin: 0; color: var(--text-secondary); font-size: var(--text-sm); line-height: var(--leading-body); text-wrap: pretty; }
.arc-login-centered-address { color: var(--foreground); overflow-wrap: anywhere; }

.arc-login-centered-actions, .arc-login-centered-form { display: grid; gap: var(--space-3); }
.arc-login-centered-form { gap: var(--space-4); }
.arc-login-centered-wide { width: 100%; }
/* Rings leave the fingerprint while the device is asked. They sit in the label, so they take the button's text color. */
.arc-login-centered-pulse { position: relative; display: inline-grid; place-items: center; }
.arc-login-centered-pulseRing { position: absolute; inset: -2px; border: 1.5px solid currentColor; border-radius: var(--radius-pill); pointer-events: none; }

.arc-login-centered-divider { display: flex; align-items: center; gap: var(--space-3); margin: var(--space-5) 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1; }
.arc-login-centered-divider::before, .arc-login-centered-divider::after { flex: 1; height: 1px; background: var(--border); content: ""; }
.arc-login-centered-sso { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-2); }
.arc-login-centered-sso .arc-login-centered-ssoButton { min-width: 0; padding-inline: var(--space-2); }

.arc-login-centered-textButton { position: relative; display: inline-flex; min-height: var(--control-height-sm); align-items: center; justify-self: center; gap: var(--space-2); margin: var(--space-4) 0 calc(var(--space-2) * -1); border: 0; border-radius: var(--radius-pill); padding: 0 var(--space-3); background: none; color: var(--text-secondary); font: inherit; font-size: var(--text-sm); font-weight: 500; line-height: var(--leading-body); cursor: pointer; -webkit-tap-highlight-color: transparent; transition: color var(--duration-fast) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard); }
.arc-login-centered-textButton:active:not([aria-disabled="true"]) { color: var(--foreground); background: var(--surface-muted); }
.arc-login-centered-textButton[aria-disabled="true"] { color: var(--text-muted); font-weight: 400; cursor: default; }
.arc-login-centered-inlineButton { border: 0; border-radius: 4px; padding: 0; background: none; color: var(--foreground); font: inherit; font-weight: 500; text-decoration: underline; text-decoration-color: var(--border-strong); text-underline-offset: 3px; cursor: pointer; transition: text-decoration-color var(--duration-fast) var(--ease-standard); }
.arc-login-centered-resendLabel { display: inline-flex; align-items: baseline; gap: .3em; white-space: nowrap; }
.arc-login-centered-time { display: inline-flex; font-variant-numeric: tabular-nums; }
.arc-login-centered-timeColumn { position: relative; display: inline-flex; justify-content: center; }
.arc-login-centered-timeColumn > span { display: inline-block; }

.arc-login-centered-success { display: block; width: 48px; height: 48px; margin-bottom: var(--space-6); overflow: visible; color: var(--success); }
.arc-login-centered-details { display: grid; margin: calc(var(--space-2) * -1) 0 var(--space-6); border-top: 1px solid var(--border); padding: 0; }
.arc-login-centered-details div { display: flex; justify-content: space-between; gap: var(--space-4); border-bottom: 1px solid var(--border); padding: var(--space-3) 0; font-size: var(--text-sm); line-height: var(--leading-body); }
.arc-login-centered-details dt { color: var(--text-secondary); }
.arc-login-centered-details dd { margin: 0; text-align: right; }

.arc-login-centered-foot { color: var(--text-muted); font-size: var(--text-xs); line-height: var(--leading-body); }
.arc-login-centered-status { position: relative; display: block; min-width: 0; flex: 1; }
.arc-login-centered-status > span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.arc-login-centered-legal { display: flex; flex: none; gap: var(--space-1); }
.arc-login-centered-legal a { display: inline-flex; min-height: 32px; align-items: center; border-radius: var(--radius-pill); padding: 0 var(--space-2); color: var(--text-secondary); text-decoration: none; transition: color var(--duration-fast) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard); }
.arc-login-centered-legal a:active { color: var(--foreground); }
.arc-login-centered-srOnly { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

@media (hover: hover) and (pointer: fine) {
  .arc-login-centered-switchButton:hover { background: var(--surface-muted); }
  .arc-login-centered-textButton:not([aria-disabled="true"]):hover { color: var(--foreground); background: var(--surface-muted); }
  .arc-login-centered-inlineButton:hover { text-decoration-color: currentColor; }
  .arc-login-centered-legal a:hover { color: var(--foreground); background: var(--surface-muted); }
}

@container login-centered (max-width: 520px) {
  .arc-login-centered-bar, .arc-login-centered-foot { padding-inline: var(--space-4); }
  .arc-login-centered-stage { padding: var(--space-4); }
  .arc-login-centered-card { border-radius: var(--radius-panel); }
  .arc-login-centered-step { padding: var(--space-6); }
}
@container login-centered (max-width: 400px) {
  .arc-login-centered-stage { padding-inline: var(--space-3); }
  .arc-login-centered-step { padding-inline: var(--space-5); }
  .arc-login-centered-heading h2 { font-size: var(--text-2xl); }
  .arc-login-centered-sso .arc-login-centered-ssoButton { gap: 6px; padding-inline: var(--space-1); font-size: var(--text-xs); }
  .arc-login-centered-switchButton { padding-inline: var(--space-2); }
}
@media (prefers-reduced-motion: reduce) {
  .arc-login-centered-switchButton, .arc-login-centered-textButton, .arc-login-centered-inlineButton, .arc-login-centered-legal a { transition: none; }
  .arc-login-centered-ring, .arc-login-centered-axis { transform: none; }
}
/* The product mark takes the accent: the one spot of color before a person signs in. */
.arc-login-centered-mark svg { color: var(--accent); }
`;

const styles: Record<string, string> = new Proxy({
  "actions": "arc-login-centered-actions",
  "address": "arc-login-centered-address",
  "axis": "arc-login-centered-axis",
  "backdrop": "arc-login-centered-backdrop",
  "bar": "arc-login-centered-bar",
  "card": "arc-login-centered-card",
  "details": "arc-login-centered-details",
  "divider": "arc-login-centered-divider",
  "foot": "arc-login-centered-foot",
  "form": "arc-login-centered-form",
  "fullScreen": "arc-login-centered-fullScreen",
  "heading": "arc-login-centered-heading",
  "inlineButton": "arc-login-centered-inlineButton",
  "legal": "arc-login-centered-legal",
  "lines": "arc-login-centered-lines",
  "mark": "arc-login-centered-mark",
  "pulse": "arc-login-centered-pulse",
  "pulseRing": "arc-login-centered-pulseRing",
  "resendLabel": "arc-login-centered-resendLabel",
  "ring": "arc-login-centered-ring",
  "ringMajor": "arc-login-centered-ringMajor",
  "screen": "arc-login-centered-screen",
  "srOnly": "arc-login-centered-srOnly",
  "sso": "arc-login-centered-sso",
  "ssoButton": "arc-login-centered-ssoButton",
  "stage": "arc-login-centered-stage",
  "status": "arc-login-centered-status",
  "step": "arc-login-centered-step",
  "success": "arc-login-centered-success",
  "switch": "arc-login-centered-switch",
  "switchButton": "arc-login-centered-switchButton",
  "switchPrompt": "arc-login-centered-switchPrompt",
  "textButton": "arc-login-centered-textButton",
  "time": "arc-login-centered-time",
  "timeColumn": "arc-login-centered-timeColumn",
  "track": "arc-login-centered-track",
  "viewport": "arc-login-centered-viewport",
  "wide": "arc-login-centered-wide"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-login-centered-${prop}`,
});


// ── Inlined Subcomponent Helpers for Standalone Execution ──
export const Button = forwardRef<HTMLButtonElement, any>(function Button({ className = "", children, ...props }, ref) {
  return <button ref={ref} className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity ${className}`} {...props}>{children}</button>;
});

export function Avatar({ src, alt = "", name = "", className = "" }: any) {
  return <span className={`relative inline-flex items-center justify-center overflow-hidden rounded-full bg-[var(--surface-muted)] text-[var(--foreground)] font-medium text-xs w-8 h-8 ${className}`}>{src ? <img src={src} alt={alt} className="w-full h-full object-cover" /> : (name ? name[0] : "")}</span>;
}

export function AvatarGroup({ children, className = "" }: any) {
  return <div className={`flex items-center -space-x-2 ${className}`}>{children}</div>;
}

export const Input = forwardRef<HTMLInputElement, any>(function Input({ className = "", ...props }, ref) {
  return <input ref={ref} className={`w-full px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] outline-none focus:border-[var(--accent)] ${className}`} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, any>(function Textarea({ className = "", ...props }, ref) {
  return <textarea ref={ref} className={`w-full px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] outline-none focus:border-[var(--accent)] ${className}`} {...props} />;
});

export const PasswordField = forwardRef<HTMLInputElement, any>(function PasswordField({ className = "", ...props }, ref) {
  return <input ref={ref} type="password" className={`w-full px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] outline-none focus:border-[var(--accent)] ${className}`} {...props} />;
});

export const SearchField = forwardRef<HTMLInputElement, any>(function SearchField({ className = "", ...props }, ref) {
  return <input ref={ref} type="search" placeholder="Search..." className={`w-full px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] outline-none focus:border-[var(--accent)] ${className}`} {...props} />;
});

export function OtpInput({ length = 6, value = "", onChange, className = "" }: any) {
  return <div className={`flex gap-2 ${className}`}>{[...Array(length)].map((_, i) => <input key={i} maxLength={1} value={value[i] || ""} className="w-10 h-12 text-center text-lg font-semibold rounded-xl border border-[var(--border)] bg-[var(--surface)]" readOnly />)}</div>;
}

export function Badge({ children, className = "" }: any) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--surface-muted)] text-[var(--text-secondary)] ${className}`}>{children}</span>;
}

export function Progress({ value = 0, className = "" }: any) {
  return <div className={`w-full h-2 rounded-full bg-[var(--surface-muted)] overflow-hidden ${className}`}><div className="h-full bg-[var(--foreground)] transition-all duration-300" style={{ width: `${value}%` }} /></div>;
}

export function Switch({ checked, onCheckedChange, className = "", ...props }: any) {
  return <button type="button" role="switch" aria-checked={checked} onClick={() => onCheckedChange?.(!checked)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${checked ? 'bg-[var(--control-on)]' : 'bg-[var(--control-track)]'} ${className}`} {...props}><span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transform transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} /></button>;
}

export function Checkbox({ checked, onCheckedChange, className = "", ...props }: any) {
  return <input type="checkbox" checked={checked} onChange={e => onCheckedChange?.(e.target.checked)} className={`rounded border-[var(--border)] text-[var(--accent)] ${className}`} {...props} />;
}

export function SegmentedControl({ value, onChange, options = [], className = "" }: any) {
  return (
    <div className={`inline-flex p-1 rounded-xl bg-[var(--surface-muted)] text-sm ${className}`}>
      {options.map((opt: any) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const active = val === value;
        return (
          <button key={val} type="button" onClick={() => onChange?.(val)} className={`px-3 py-1 rounded-lg font-medium transition-all ${active ? 'bg-[var(--surface)] shadow-sm text-[var(--foreground)]' : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'}`}>{label}</button>
        );
      })}
    </div>
  );
}

export function CopyButton({ text, className = "" }: any) {
  return <button type="button" onClick={() => navigator.clipboard?.writeText(text || "")} className={`px-2.5 py-1 text-xs rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] ${className}`}>Copy</button>;
}

export function AnimatedCounter({ value, className = "" }: any) {
  return <span className={className}>{value}</span>;
}

export function TextMorph({ children, className = "" }: any) {
  return <span className={className}>{children}</span>;
}

export function Sparkline({ data = [], className = "" }: any) {
  return <svg className={`w-24 h-8 ${className}`}><path d="M0 16 L20 10 L40 18 L60 8 L80 12 L100 4" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>;
}

export function LineChart({ data = [], className = "" }: any) {
  return <svg className={`w-full h-32 ${className}`}><path d="M0 64 L50 40 L100 70 L150 30 L200 45 L250 15" fill="none" stroke="currentColor" strokeWidth="2" /></svg>;
}

export function Calendar(props: any) {
  return <div className="p-3 border border-[var(--border)] rounded-2xl bg-[var(--surface)]">Calendar</div>;
}



type Step = "passkey" | "email" | "code" | "done";
type Mode = "sign-in" | "sign-up";
type Provider = "Google" | "Apple" | "GitHub";
type PasskeyPhase = "idle" | "waiting" | "verified";
export type LoginMethod = "Passkey" | "Email code" | Provider;
export interface LoginCenteredProps {
  /** The code the simulated email contains. */
  demoCode?: string;
  /** Fill the viewport (100dvh, no frame) when the block is the whole page. */
  fullScreen?: boolean;
  /** The account a simulated passkey or single sign-on resolves to. */
  demoEmail?: string;
  termsHref?: string;
  privacyHref?: string;
  /** Called once the simulated sign in or sign up succeeds. */
  onSignIn?: (email: string, method: LoginMethod, mode: Mode) => void;
  className?: string;
}
type StepCustom = { direction: number; reduce: boolean };

const RESEND_SECONDS = 30;
/** The official four-colour Google "G"; Apple and GitHub ship monochrome marks, drawn in currentColor. */
function GoogleLogo({ className }: { className?: string }) {
  return <svg className={className} width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>;
}

const providers: Provider[] = ["Google", "Apple", "GitHub"];
/** Monochrome provider marks in currentColor, so they stay neutral in both themes. */
const providerMarks: Record<Provider, string> = {
  Google: "M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z",
  Apple: "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701",
  GitHub: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
};
/** Concentric rings behind the card. Outer rings drift further, so the set reads as depth rather than a flat pattern. */
const rings = Array.from({ length: 14 }, (_, index) => ({ r: 224 + index * 60, k: 1 + index * .34, major: index % 3 === 2 }));
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

/** Steps rise into place out of a small blur; going back, they settle down from above. */
const stepMotion: Variants = {
  enter: ({ direction, reduce }: StepCustom) => reduce ? { opacity: 0 } : { opacity: 0, y: direction * 12, filter: `blur(${motionTokens.blur.soft}px)` },
  center: ({ reduce }: StepCustom) => ({ opacity: 1, y: 0, filter: "blur(0px)", transition: reduce ? { duration: motionTokens.duration.instant } : { y: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease: motionTokens.ease.enter, delay: .06 }, filter: { duration: motionTokens.duration.standard, ease: motionTokens.ease.enter, delay: .04 } } }),
  exit: ({ direction, reduce }: StepCustom) => reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: direction * -8, filter: `blur(${motionTokens.blur.soft}px)`, transition: { duration: motionTokens.duration.exit, ease: motionTokens.ease.standard } },
};
const swap = (reduce: boolean) => ({
  initial: reduce ? { opacity: 0 } : { opacity: 0, y: 6, filter: `blur(${motionTokens.blur.soft}px)` },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -4, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast } },
  transition: (reduce ? { duration: motionTokens.duration.instant } : { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }) as Transition,
});
/** Seconds roll down while the timer runs and back up when a new code restarts it. */
const roll: Variants = {
  enter: (direction: number) => ({ opacity: 0, y: `${-0.7 * direction}em`, filter: `blur(${motionTokens.blur.subtle}px)` }),
  center: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: (direction: number) => ({ opacity: 0, y: `${0.7 * direction}em`, filter: `blur(${motionTokens.blur.subtle}px)` }),
};

function RollingTime({ seconds, reduce }: { seconds: number; reduce: boolean }) {
  const [shown, setShown] = useState({ seconds, direction: 1 });
  if (shown.seconds !== seconds) setShown({ seconds, direction: seconds < shown.seconds ? 1 : -1 });
  const text = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  const transition: Transition = reduce ? { duration: 0 } : { y: motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast }, filter: { duration: motionTokens.duration.fast } };
  return <span className={styles.time}>{text.split("").map((character, index) => <span key={index} className={styles.timeColumn}>
    <AnimatePresence initial={false} mode="popLayout" custom={shown.direction}><motion.span key={character} custom={shown.direction} variants={roll} initial="enter" animate="center" exit="exit" transition={transition}>{character}</motion.span></AnimatePresence>
  </span>)}</span>;
}

/** Two rings leave the fingerprint while the device is asked, then stop on their own. */
function PasskeyPulse({ reduce }: { reduce: boolean }) {
  return <span className={styles.pulse}>
    {!reduce && [0, 1].map(index => <motion.span key={index} className={styles.pulseRing} initial={{ scale: .7, opacity: 0 }} animate={{ scale: [.7, 2.1], opacity: [.6, 0] }} transition={{ duration: 1.2, ease: [...motionTokens.ease.standard], delay: index * .6 }} />)}
    <FingerprintPattern size={16} strokeWidth={1.75} aria-hidden="true" />
  </span>;
}

/** The card follows its content on a spring only while the view changes; otherwise it stays auto, so field messages open without lag. */
function useViewHeight(view: string, reduce: boolean) {
  const track = useRef<HTMLDivElement>(null);
  const height = useMotionValue<number | "auto">("auto");
  const measured = useRef(0);
  const gliding = useRef(false);
  const lastView = useRef(view);
  const glide = useCallback((to: number) => {
    gliding.current = true;
    animate(height, to, { ...motionTokens.spring.smooth, onComplete: () => { gliding.current = false; height.jump("auto"); } });
  }, [height]);
  useEffect(() => {
    const node = track.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      measured.current = entry.borderBoxSize?.[0]?.blockSize ?? node.offsetHeight;
      if (gliding.current) glide(measured.current);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [glide]);
  useLayoutEffect(() => {
    if (lastView.current === view) return;
    lastView.current = view;
    const current = height.get();
    const from = typeof current === "number" ? current : measured.current;
    const to = track.current?.offsetHeight ?? 0;
    if (reduce || !from || !to) { gliding.current = false; height.jump("auto"); return; }
    if (current === "auto") height.jump(from);
    glide(to);
  }, [view, reduce, height, glide]);
  return { track, height };
}

/** Pointer drift for the line backdrop: fine pointers with hover only, never under reduced motion. */
function useDrift(reduce: boolean) {
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { visualDuration: .9, bounce: 0 });
  const y = useSpring(pointerY, { visualDuration: .9, bounce: 0 });
  const dx = useTransform(x, value => `${value.toFixed(2)}px`);
  const dy = useTransform(y, value => `${value.toFixed(2)}px`);
  const canHover = useRef(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => { canHover.current = query.matches; };
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reduce || !canHover.current || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - box.left) / box.width - .5) * -2);
    pointerY.set(((event.clientY - box.top) / box.height - .5) * -2);
  };
  const onPointerLeave = () => { pointerX.set(0); pointerY.set(0); };
  return { style: { "--dx": dx, "--dy": dy } as MotionStyle, onPointerMove, onPointerLeave };
}

export function LoginCentered({ demoCode = "482913", fullScreen = false, demoEmail = "maya@northwind.studio", termsHref = "#terms", privacyHref = "#privacy", onSignIn, className }: LoginCenteredProps) {
  const reduce = !!useReducedMotion();
  const [step, setStep] = useState<Step>("passkey");
  const [mode, setMode] = useState<Mode>("sign-in");
  const [direction, setDirection] = useState(1);
  const [passkey, setPasskey] = useState<PasskeyPhase>("idle");
  const [busy, setBusy] = useState<null | "email" | "code" | Provider>(null);
  const [verified, setVerified] = useState(false);
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const [account, setAccount] = useState(demoEmail);
  const [method, setMethod] = useState<LoginMethod>("Passkey");
  const [status, setStatus] = useState("");
  const passkeyRef = useRef<HTMLButtonElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);
  const focusNext = useRef<Step | null>(null);
  const timers = useRef<number[]>([]);
  const view = step === "email" ? `email-${mode}` : step;
  const { track, height } = useViewHeight(view, reduce);
  const drift = useDrift(reduce);

  const emailError = (touched || attempted) && !isEmail(email) ? (email.trim() ? "Enter a full address, like name@example.com." : "Enter your email address.") : "";
  const custom: StepCustom = { direction, reduce };
  const signingUp = mode === "sign-up";

  useEffect(() => { const pending = timers; return () => pending.current.forEach(window.clearTimeout); }, []);
  useEffect(() => {
    if (step !== "code" || resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn(seconds => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [step, resendIn]);
  useEffect(() => {
    const target = focusNext.current;
    focusNext.current = null;
    if (target === "passkey") passkeyRef.current?.focus();
    if (target === "email") emailRef.current?.focus();
    if (target === "done") doneRef.current?.focus();
  }, [view]);

  function later(run: () => void, ms: number) { timers.current.push(window.setTimeout(run, ms)); }
  /** Any new direction cancels whatever the previous one was still waiting on. */
  function settle() { timers.current.forEach(window.clearTimeout); timers.current = []; setBusy(null); setVerified(false); }
  function go(next: Step, towards: number, focus: Step | null = next === "code" ? null : next) {
    focusNext.current = focus;
    setDirection(towards);
    if (next === "passkey") setPasskey("idle");
    setStep(next);
  }
  const focusCode = () => codeRef.current?.querySelector("input")?.focus();

  function complete(address: string, how: LoginMethod) {
    settle();
    setAccount(address);
    setMethod(how);
    go("done", 1);
    setStatus(`${signingUp ? "Account created" : "Signed in"} with ${how === "Email code" ? "an email code" : how === "Passkey" ? "a passkey" : how}`);
    onSignIn?.(address, how, mode);
  }

  function startPasskey() {
    if (passkey !== "idle" || busy) return;
    setPasskey("waiting");
    setStatus("Waiting for your passkey");
    later(() => {
      setPasskey("verified");
      setStatus("Passkey verified");
      later(() => complete(demoEmail, "Passkey"), 640);
    }, 1700);
  }

  function cancelPasskey() {
    settle();
    setPasskey("idle");
    setStatus("Passkey request canceled");
    passkeyRef.current?.focus();
  }

  function switchToEmail() {
    if (passkey === "verified" || busy) return;
    settle();
    setPasskey("idle");
    setAttempted(false);
    go("email", 1);
    setStatus("We will email you a sign in code");
  }

  function signInWith(provider: Provider) {
    if (busy || passkey !== "idle") return;
    setBusy(provider);
    setStatus(`Opening ${provider}`);
    later(() => complete(demoEmail, provider), 900);
  }

  function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setAttempted(true);
    if (!isEmail(email)) { emailRef.current?.focus(); return; }
    setBusy("email");
    setStatus("Sending a code");
    later(() => {
      const address = email.trim().toLowerCase();
      setBusy(null);
      setAccount(address);
      setCode("");
      setCodeError("");
      setResendIn(RESEND_SECONDS);
      go("code", 1);
      setStatus(`Code sent to ${address}`);
    }, 800);
  }

  function verify(value: string) {
    if (busy || verified) return;
    if (value.length < 6) { setCodeError("Enter all 6 digits."); focusCode(); return; }
    setBusy("code");
    setStatus("Checking code");
    later(() => {
      setBusy(null);
      if (value !== demoCode) {
        setCode("");
        setCodeError("That code didn't match. Check the latest email and try again.");
        setStatus("Code didn't match");
        focusCode();
        return;
      }
      setVerified(true);
      setStatus("Code verified");
      later(() => complete(account, "Email code"), 600);
    }, 700);
  }

  function changeCode(value: string) {
    if (busy || verified) return;
    setCode(value);
    if (codeError && value) setCodeError("");
    if (value.length === 6) verify(value);
  }

  function resend() {
    if (busy || verified || resendIn > 0) return;
    setResendIn(RESEND_SECONDS);
    setCode("");
    setCodeError("");
    setStatus("New code sent");
    focusCode();
  }

  function changeEmail() {
    settle();
    setAttempted(false);
    go("email", -1);
    setStatus("Edit your email");
  }

  function switchToPasskey() {
    settle();
    setMode("sign-in");
    go("passkey", -1);
    setStatus("Sign in with your passkey");
  }

  function switchMode() {
    settle();
    setAttempted(false);
    setCode("");
    if (signingUp) { setMode("sign-in"); go("passkey", -1); setStatus("Sign in to your account"); return; }
    setMode("sign-up");
    go("email", 1);
    setStatus("Create an account with your email");
  }

  function signOut() {
    settle();
    setEmail("");
    setTouched(false);
    setAttempted(false);
    setCode("");
    setMode("sign-in");
    go("passkey", -1);
    setStatus("Signed out");
  }

  function openLegal(href: string, label: string) {
    return (event: { preventDefault: () => void }) => {
      if (!href.startsWith("#")) return;
      event.preventDefault();
      setStatus(`${label} opens here in your app (demo)`);
    };
  }

  const passkeyLabel = passkey === "waiting" ? <><PasskeyPulse reduce={reduce} />Waiting for your device</> : passkey === "verified" ? <><Check size={16} strokeWidth={2} aria-hidden="true" />Passkey verified</> : <><FingerprintPattern size={16} strokeWidth={1.75} aria-hidden="true" />Sign in with passkey</>;

  return (
    <section className={[styles.screen, fullScreen ? styles.fullScreen : "", className].filter(Boolean).join(" ")} aria-label={signingUp ? "Create an account" : "Sign in"} onPointerMove={drift.onPointerMove} onPointerLeave={drift.onPointerLeave}>
      <motion.div className={styles.backdrop} style={drift.style} aria-hidden="true">
        <svg className={styles.lines}>
          <svg x="50%" y="50%" overflow="visible">
            <line className={styles.axis} x1="-2400" x2="2400" y1="0" y2="0" />
            <line className={styles.axis} x1="0" x2="0" y1="-2400" y2="2400" />
            {rings.map(ring => <circle key={ring.r} className={ring.major ? `${styles.ring} ${styles.ringMajor}` : styles.ring} r={ring.r} cx="0" cy="0" style={{ "--k": ring.k } as CSSProperties} />)}
          </svg>
        </svg>
      </motion.div>

      <header className={styles.bar}>
        <span className={styles.mark}><svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 15a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="10" cy="15" r="1.75" fill="currentColor" /></svg>Arc</span>
        <p className={styles.switch}>
          <span className={styles.switchPrompt}><AnimatePresence mode="popLayout" initial={false}><motion.span key={mode} {...swap(reduce)}>{signingUp ? "Have an account?" : "No account?"}</motion.span></AnimatePresence></span>
          <button type="button" className={styles.switchButton} onClick={switchMode}><AnimatePresence mode="popLayout" initial={false}><motion.span key={mode} {...swap(reduce)}>{signingUp ? "Sign in" : "Sign up"}</motion.span></AnimatePresence></button>
        </p>
      </header>

      <div className={styles.stage}>
        <div className={styles.card}>
          <motion.div className={styles.viewport} style={{ height }}>
            <div ref={track} className={styles.track}>
              <AnimatePresence mode="popLayout" initial={false} custom={custom}>
                {step === "passkey" && <motion.div key="passkey" className={styles.step} custom={custom} variants={stepMotion} initial="enter" animate="center" exit="exit">
                  <div className={styles.heading}><h2>Sign in to Arc</h2><p>Use the passkey saved on this device. No password needed.</p></div>
                  <div className={styles.actions}>
                    <Button ref={passkeyRef} type="button" className={styles.wide} aria-busy={passkey === "waiting" || undefined} aria-disabled={passkey !== "idle" || !!busy || undefined} onClick={startPasskey}>{passkeyLabel}</Button>
                    <Button type="button" variant="secondary" className={styles.wide} aria-disabled={passkey === "verified" || !!busy || undefined} onClick={passkey === "waiting" ? cancelPasskey : switchToEmail}>{passkey === "waiting" ? "Cancel" : <><Mail size={16} strokeWidth={1.75} aria-hidden="true" />Use email instead</>}</Button>
                  </div>
                  <div className={styles.divider}>or</div>
                  <div className={styles.sso} role="group" aria-label="Single sign-on">
                    {providers.map(provider => <Button key={provider} type="button" variant="secondary" className={styles.ssoButton} aria-label={`Continue with ${provider}`} aria-disabled={passkey !== "idle" || (!!busy && busy !== provider) || undefined} loading={busy === provider} onClick={() => signInWith(provider)}>{provider === "Google" ? <GoogleLogo /> : <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={providerMarks[provider]} /></svg>}{provider}</Button>)}
                  </div>
                </motion.div>}

                {step === "email" && <motion.div key={`email-${mode}`} className={styles.step} custom={custom} variants={stepMotion} initial="enter" animate="center" exit="exit">
                  <div className={styles.heading}>{signingUp ? <><h2>Create your account</h2><p>Enter your work email. We will send a code to confirm it.</p></> : <><h2>Sign in with email</h2><p>We will send a 6 digit code to your inbox.</p></>}</div>
                  <form className={styles.form} onSubmit={submitEmail} noValidate>
                    <Input ref={emailRef} label={signingUp ? "Work email" : "Email"} type="email" name="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="name@example.com" value={email} readOnly={busy === "email"} error={emailError} onChange={event => setEmail(event.target.value)} onBlur={() => { if (email.trim()) setTouched(true); }} />
                    <Button type="submit" className={styles.wide} loading={busy === "email"}>{signingUp ? "Create account" : "Send code"}</Button>
                  </form>
                  {!signingUp && <button type="button" className={styles.textButton} onClick={switchToPasskey}><FingerprintPattern size={14} strokeWidth={1.75} aria-hidden="true" />Use a passkey instead</button>}
                </motion.div>}

                {step === "code" && <motion.div key="code" className={styles.step} custom={custom} variants={stepMotion} initial="enter" animate="center" exit="exit">
                  <div className={styles.heading}><h2>Check your email</h2><p>Enter the code sent to <span className={styles.address}>{account}</span>. <button type="button" className={styles.inlineButton} onClick={changeEmail}>Change</button></p></div>
                  <form className={styles.form} onSubmit={event => { event.preventDefault(); verify(code); }} noValidate>
                    <div ref={codeRef}><OtpInput label="Verification code" description={`Demo code: ${demoCode}`} value={code} onChange={changeCode} error={codeError} autoFocus /></div>
                    <Button type="submit" className={styles.wide} loading={busy === "code"} aria-disabled={verified || undefined}>{verified ? <><Check size={16} strokeWidth={2} aria-hidden="true" />Verified</> : signingUp ? "Verify and create account" : "Verify"}</Button>
                  </form>
                  <button type="button" className={styles.textButton} aria-disabled={resendIn > 0 || verified || undefined} aria-label={resendIn > 0 ? `Resend code, available in ${resendIn} seconds` : "Resend code"} onClick={resend}>
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span key={resendIn > 0 ? "wait" : "ready"} className={styles.resendLabel} {...swap(reduce)}>{resendIn > 0 ? <>Resend code in <RollingTime seconds={resendIn} reduce={reduce} /></> : "Resend code"}</motion.span>
                    </AnimatePresence>
                  </button>
                </motion.div>}

                {step === "done" && <motion.div key="done" className={styles.step} custom={custom} variants={stepMotion} initial="enter" animate="center" exit="exit">
                  <svg className={styles.success} viewBox="0 0 48 48" aria-hidden="true">
                    <g transform="rotate(-90 24 24)"><motion.circle cx="24" cy="24" r="22.25" fill="none" stroke="currentColor" strokeWidth="1.5" initial={reduce ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ pathLength: { duration: motionTokens.duration.considered, ease: [...motionTokens.ease.inOut], delay: .16 }, opacity: { duration: motionTokens.duration.instant, delay: .16 } }} /></g>
                    <motion.path d="M15.5 24.5l5.5 5.5 11.5-12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" initial={reduce ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ pathLength: { duration: motionTokens.duration.standard + .08, ease: [...motionTokens.ease.enter], delay: .52 }, opacity: { duration: motionTokens.duration.instant, delay: .52 } }} />
                  </svg>
                  <div className={styles.heading}><h2 ref={doneRef} tabIndex={-1}>{signingUp ? "Welcome to Arc" : "Welcome back"}</h2><p>{signingUp ? "Your account is ready. " : "You are signed in as "}<span className={styles.address}>{account}</span>{signingUp ? "" : "."}</p></div>
                  <dl className={styles.details}>
                    <div><dt>Method</dt><dd>{method}</dd></div>
                    <div><dt>This device</dt><dd>Remembered for 30 days</dd></div>
                  </dl>
                  <Button type="button" variant="secondary" className={styles.wide} onClick={signOut}>Sign out</Button>
                </motion.div>}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      <footer className={styles.foot}>
        <p className={styles.srOnly} role="status" aria-live="polite">{status}</p>
        <span className={styles.status} aria-hidden="true"><AnimatePresence mode="popLayout" initial={false}><motion.span key={status} {...swap(reduce)}>{status}</motion.span></AnimatePresence></span>
        <nav className={styles.legal} aria-label="Legal">
          <a href={termsHref} onClick={openLegal(termsHref, "Terms")}>Terms</a>
          <a href={privacyHref} onClick={openLegal(privacyHref, "Privacy policy")}>Privacy</a>
        </nav>
      </footer>
    </section>
  );
}

export default LoginCentered;
