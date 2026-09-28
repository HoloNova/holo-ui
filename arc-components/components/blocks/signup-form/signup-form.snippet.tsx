"use client";

import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, type Transition, type Variants } from "motion/react";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type FormEvent } from "react";

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
const ARC_SIGNUP_FORM_STYLES = `/* Same card, spacing, and control heights as the sign in variants, so the family reads as one flow. */
.arc-signup-form-block { container: signup / inline-size; width: min(100%, 432px); min-width: 0; overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius-surface); background: var(--surface); color: var(--foreground); font-family: var(--font-body); letter-spacing: var(--tracking-body); }
.arc-signup-form-viewport { overflow: hidden; }
.arc-signup-form-track { position: relative; }
.arc-signup-form-step { display: grid; min-width: 0; padding: var(--space-8); }

.arc-signup-form-heading { display: grid; gap: var(--space-2); margin-bottom: var(--space-6); }
.arc-signup-form-heading h2 { margin: 0; font-family: var(--font-display); font-size: var(--text-3xl); font-weight: 400; letter-spacing: var(--tracking-display); line-height: var(--leading-display); text-wrap: balance; outline: none; }
.arc-signup-form-heading p { margin: 0; color: var(--text-secondary); font-size: var(--text-sm); line-height: var(--leading-body); text-wrap: pretty; }
.arc-signup-form-address { color: var(--foreground); overflow-wrap: anywhere; }

.arc-signup-form-sso { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-2); }
.arc-signup-form-sso .arc-signup-form-ssoButton { min-width: 0; padding-inline: var(--space-2); }
.arc-signup-form-providerMark { flex: none; }
.arc-signup-form-divider { display: flex; align-items: center; gap: var(--space-3); margin: var(--space-5) 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1; }
.arc-signup-form-divider::before, .arc-signup-form-divider::after { flex: 1; height: 1px; background: var(--border); content: ""; }

.arc-signup-form-form { display: grid; gap: var(--space-4); }
.arc-signup-form-wide { width: 100%; }
.arc-signup-form-passwordGroup { display: grid; min-width: 0; }
/* One stable row under the password: the words change in place and the meter fills beside them. */
.arc-signup-form-feedback { display: flex; min-height: 18px; align-items: center; justify-content: space-between; gap: var(--space-3); margin-top: var(--space-2); font-size: var(--text-xs); line-height: var(--leading-body); }
.arc-signup-form-feedbackText { position: relative; min-width: 0; flex: 1; color: var(--text-muted); }
.arc-signup-form-feedbackText > span { display: block; }
.arc-signup-form-feedbackText[data-error] { color: var(--danger); }
.arc-signup-form-meter { display: flex; flex: none; gap: 3px; }
.arc-signup-form-meter span { width: 20px; height: 3px; border-radius: var(--radius-pill); background: var(--border); transition: background-color var(--duration-fast) var(--ease-standard); }
.arc-signup-form-meter span[data-on] { background: var(--accent); }
.arc-signup-form-meter[data-level="1"] span[data-on] { background: var(--danger); }
.arc-signup-form-meter[data-level="2"] span[data-on] { background: var(--warning); }
.arc-signup-form-meter[data-level="4"] span[data-on] { background: var(--success); }

/* The checkbox keeps a full size hit area; pull it out so the square lines up with the fields. */
.arc-signup-form-updates { margin: calc(var(--space-2) * -1) 0 calc(var(--space-2) * -1) calc((var(--control-height-md) - 18px) / -2); }
.arc-signup-form-row { overflow: hidden; }
.arc-signup-form-submitError { margin: 0; color: var(--danger); font-size: var(--text-xs); line-height: var(--leading-body); }
.arc-signup-form-legal { margin: var(--space-4) 0 0; color: var(--text-muted); font-size: var(--text-xs); line-height: var(--leading-body); text-wrap: pretty; }
.arc-signup-form-textButton { border: 0; padding: 0; background: none; color: var(--text-secondary); font: inherit; text-decoration: underline; text-decoration-color: var(--border-strong); text-underline-offset: 3px; cursor: pointer; transition: color var(--duration-fast) var(--ease-standard), text-decoration-color var(--duration-fast) var(--ease-standard); }

.arc-signup-form-success { display: block; width: 48px; height: 48px; margin-bottom: var(--space-6); overflow: visible; color: var(--success); }
.arc-signup-form-details { display: grid; margin: 0 0 var(--space-6); border-top: 1px solid var(--border); padding: 0; }
.arc-signup-form-details div { display: flex; justify-content: space-between; gap: var(--space-4); border-bottom: 1px solid var(--border); padding: var(--space-3) 0; font-size: var(--text-sm); line-height: var(--leading-body); }
.arc-signup-form-details dt { color: var(--text-secondary); }
.arc-signup-form-details dd { margin: 0; text-align: right; }

.arc-signup-form-footer { display: flex; min-height: 48px; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-1) var(--space-4); border-top: 1px solid var(--border); padding: var(--space-3) var(--space-8); color: var(--text-muted); font-size: var(--text-xs); line-height: var(--leading-body); }
.arc-signup-form-status { position: relative; display: block; min-width: 0; flex: 1 1 12rem; }
.arc-signup-form-status > span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.arc-signup-form-switch { color: var(--text-secondary); white-space: nowrap; }
.arc-signup-form-switch .arc-signup-form-textButton { color: var(--foreground); font-weight: 500; text-decoration-color: transparent; }
.arc-signup-form-srOnly { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

@media (hover: hover) and (pointer: fine) {
  .arc-signup-form-textButton:hover { color: var(--foreground); text-decoration-color: currentColor; }
}
@container signup (max-width: 380px) {
  .arc-signup-form-step { padding: var(--space-6) var(--space-5); }
  .arc-signup-form-heading h2 { font-size: var(--text-2xl); }
  .arc-signup-form-sso .arc-signup-form-ssoButton { gap: 6px; font-size: var(--text-xs); }
  .arc-signup-form-footer { padding-inline: var(--space-5); }
  .arc-signup-form-meter span { width: 14px; }
}
@media (max-width: 480px) { .arc-signup-form-block { border-radius: var(--radius-panel); } }
@media (prefers-reduced-motion: reduce) { .arc-signup-form-meter span, .arc-signup-form-textButton { transition: none; } }
`;

const styles: Record<string, string> = new Proxy({
  "address": "arc-signup-form-address",
  "block": "arc-signup-form-block",
  "details": "arc-signup-form-details",
  "divider": "arc-signup-form-divider",
  "feedback": "arc-signup-form-feedback",
  "feedbackText": "arc-signup-form-feedbackText",
  "footer": "arc-signup-form-footer",
  "form": "arc-signup-form-form",
  "heading": "arc-signup-form-heading",
  "legal": "arc-signup-form-legal",
  "meter": "arc-signup-form-meter",
  "passwordGroup": "arc-signup-form-passwordGroup",
  "providerMark": "arc-signup-form-providerMark",
  "row": "arc-signup-form-row",
  "srOnly": "arc-signup-form-srOnly",
  "sso": "arc-signup-form-sso",
  "ssoButton": "arc-signup-form-ssoButton",
  "status": "arc-signup-form-status",
  "step": "arc-signup-form-step",
  "submitError": "arc-signup-form-submitError",
  "success": "arc-signup-form-success",
  "switch": "arc-signup-form-switch",
  "textButton": "arc-signup-form-textButton",
  "track": "arc-signup-form-track",
  "updates": "arc-signup-form-updates",
  "viewport": "arc-signup-form-viewport",
  "wide": "arc-signup-form-wide"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-signup-form-${prop}`,
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



export interface SignupDetails {
  name: string;
  email: string;
  password: string;
  productUpdates: boolean;
}

type Provider = "Google" | "Apple" | "GitHub";

export interface SignupFormProps {
  /** Receives the details once every field is valid. Throw to show a submit error. */
  onSubmit?: (details: SignupDetails) => void | Promise<void>;
  /** An error from your API, shown above the submit button. */
  serverError?: string | null;
  /** Called when someone picks a single sign-on provider. The preview simulates the redirect. */
  onProvider?: (provider: Provider) => void;
}

type Field = "name" | "email" | "password";
type Step = "form" | "done";
type StepCustom = { direction: number; reduce: boolean };

const providers: Provider[] = ["Google", "Apple", "GitHub"];
/** The official four-colour Google "G"; Apple and GitHub ship monochrome marks, drawn in currentColor. */
function GoogleLogo() {
  return <svg className={styles.providerMark} width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>;
}
const monoMarks: Record<Exclude<Provider, "Google">, string> = {
  Apple: "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701",
  GitHub: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
};

function getErrors(name: string, email: string, password: string) {
  return {
    name: name.trim().length < 2 ? "Enter your full name." : "",
    email: !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) ? "Enter a full address, like name@example.com." : "",
    password: password.length < 8 ? "Use at least 8 characters." : "",
  };
}

function passwordScore(password: string) {
  if (!password) return 0;
  return [password.length >= 8, password.length >= 12, /[a-z]/.test(password) && /[A-Z]/.test(password), /\d|[^\w\s]/.test(password)].filter(Boolean).length;
}
const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];

/** Steps cross over sideways out of a small blur; going back, they return from the other side. */
const stepMotion: Variants = {
  enter: ({ direction, reduce }: StepCustom) => reduce ? { opacity: 0 } : { opacity: 0, x: direction * 24, filter: `blur(${motionTokens.blur.soft}px)` },
  center: ({ reduce }: StepCustom) => ({ opacity: 1, x: 0, filter: "blur(0px)", transition: reduce ? { duration: motionTokens.duration.instant } : { x: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease: motionTokens.ease.enter, delay: .05 }, filter: { duration: motionTokens.duration.standard, ease: motionTokens.ease.enter } } }),
  exit: ({ direction, reduce }: StepCustom) => reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, x: direction * -16, filter: `blur(${motionTokens.blur.soft}px)`, transition: { x: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.exit, ease: motionTokens.ease.standard }, filter: { duration: motionTokens.duration.exit } } },
};
const swap = (reduce: boolean) => ({
  initial: reduce ? { opacity: 0 } : { opacity: 0, y: 6, filter: `blur(${motionTokens.blur.soft}px)` },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -4, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast } },
  transition: (reduce ? { duration: motionTokens.duration.instant } : { duration: motionTokens.duration.standard, ease: motionTokens.ease.enter }) as Transition,
});

/** The card follows its content on a spring only while the step changes; otherwise it stays auto, so field messages open without lag. */
function useStepHeight(step: Step, reduce: boolean) {
  const track = useRef<HTMLDivElement>(null);
  const height = useMotionValue<number | "auto">("auto");
  const measured = useRef(0);
  const gliding = useRef(false);
  const lastStep = useRef(step);
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
    if (lastStep.current === step) return;
    lastStep.current = step;
    const current = height.get();
    const from = typeof current === "number" ? current : measured.current;
    const to = track.current?.offsetHeight ?? 0;
    if (reduce || !from || !to) { gliding.current = false; height.jump("auto"); return; }
    if (current === "auto") height.jump(from);
    glide(to);
  }, [step, reduce, height, glide]);
  return { track, height };
}

export function SignupForm({ onSubmit, serverError, onProvider }: SignupFormProps) {
  const reduce = !!useReducedMotion();
  const feedbackId = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);
  const timers = useRef<number[]>([]);
  const [step, setStep] = useState<Step>("form");
  const [direction, setDirection] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [productUpdates, setProductUpdates] = useState(false);
  const [touched, setTouched] = useState<Record<Field, boolean>>({ name: false, email: false, password: false });
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState<null | "form" | Provider>(null);
  const [method, setMethod] = useState<"Email" | Provider>("Email");
  const [submitError, setSubmitError] = useState("");
  const [status, setStatus] = useState("");
  const { track, height } = useStepHeight(step, reduce);
  const errors = getErrors(name, email, password);
  const score = passwordScore(password);
  const visibleError = (field: Field) => (touched[field] || submitted ? errors[field] : "");
  const passwordError = visibleError("password");
  const custom: StepCustom = { direction, reduce };
  const shownError = submitError || serverError || "";
  const feedback = passwordError ? { key: "error", text: passwordError } : password ? { key: `s${score}`, text: `${strengthLabel[Math.max(score, 1)]} password` } : { key: "hint", text: "Use 8 or more characters." };

  useEffect(() => { const pending = timers.current; return () => pending.forEach(window.clearTimeout); }, []);
  useEffect(() => { if (step === "done") doneRef.current?.focus(); }, [step]);

  function markTouched(field: Field) {
    setTouched(current => ({ ...current, [field]: true }));
  }

  function finish(how: "Email" | Provider) {
    setBusy(null);
    setMethod(how);
    setDirection(1);
    setStep("done");
    setStatus(`Account created with ${how === "Email" ? "your email" : how}`);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setSubmitted(true);
    setSubmitError("");
    const nextErrors = getErrors(name, email, password);
    const firstInvalid = (Object.keys(nextErrors) as Field[]).find(field => nextErrors[field]);
    if (firstInvalid) {
      ({ name: nameRef, email: emailRef, password: passwordRef })[firstInvalid].current?.focus();
      return;
    }
    setBusy("form");
    setStatus("Creating your account");
    try {
      await Promise.all([onSubmit?.({ name: name.trim(), email: email.trim(), password, productUpdates }), new Promise(resolve => window.setTimeout(resolve, 700))]);
      finish("Email");
    } catch (error) {
      setBusy(null);
      setSubmitError(error instanceof Error && error.message ? error.message : "We couldn't create your account. Try again.");
      setStatus("Account not created");
    }
  }

  function continueWith(provider: Provider) {
    if (busy) return;
    setBusy(provider);
    setStatus(`Opening ${provider}`);
    onProvider?.(provider);
    timers.current.push(window.setTimeout(() => {
      if (!name.trim()) setName("Jasmine Brooks");
      if (!email.trim()) setEmail("jasmine@northwind.studio");
      finish(provider);
    }, 900));
  }

  function reset() {
    setName("");
    setEmail("");
    setPassword("");
    setProductUpdates(false);
    setTouched({ name: false, email: false, password: false });
    setSubmitted(false);
    setSubmitError("");
    setDirection(-1);
    setStep("form");
    setStatus("Start again with new details");
    timers.current.push(window.setTimeout(() => nameRef.current?.focus(), 60));
  }

  const firstName = name.trim().split(/\s+/)[0] || "there";

  return (
    <section className={styles.block} aria-label="Create an Arc account">
      <motion.div className={styles.viewport} style={{ height }}>
        <div ref={track} className={styles.track}>
          <AnimatePresence mode="popLayout" initial={false} custom={custom}>
            {step === "form" ? (
              <motion.div key="form" className={styles.step} custom={custom} variants={stepMotion} initial="enter" animate="center" exit="exit">
                <div className={styles.heading}><h2>Create your account</h2><p>Start with your work email. You can invite your team after.</p></div>
                <div className={styles.sso} role="group" aria-label="Sign up with">
                  {providers.map(provider => <Button key={provider} type="button" variant="secondary" className={styles.ssoButton} aria-label={`Sign up with ${provider}`} loading={busy === provider} aria-disabled={(!!busy && busy !== provider) || undefined} onClick={() => continueWith(provider)}>
                    {provider === "Google" ? <GoogleLogo /> : <svg className={styles.providerMark} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={monoMarks[provider]} /></svg>}{provider}
                  </Button>)}
                </div>
                <div className={styles.divider}>or</div>
                <form onSubmit={event => void submit(event)} noValidate className={styles.form}>
                  <Input ref={nameRef} label="Full name" name="name" autoComplete="name" placeholder="Jasmine Brooks" value={name} onChange={event => setName(event.target.value)} onBlur={() => { if (name) markTouched("name"); }} error={visibleError("name")} readOnly={!!busy} />
                  <Input ref={emailRef} label="Work email" name="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="name@example.com" value={email} onChange={event => setEmail(event.target.value)} onBlur={() => { if (email) markTouched("email"); }} error={visibleError("email")} readOnly={!!busy} />
                  <div className={styles.passwordGroup}>
                    <PasswordField ref={passwordRef} label="Password" name="password" autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} onBlur={() => { if (password) markTouched("password"); }} aria-invalid={passwordError ? true : undefined} aria-describedby={feedbackId} readOnly={!!busy} />
                    <div className={styles.feedback}>
                      <span id={feedbackId} className={styles.feedbackText} data-error={passwordError ? true : undefined} role={passwordError ? "alert" : undefined}>
                        <AnimatePresence mode="popLayout" initial={false}><motion.span key={feedback.key} {...swap(reduce)}>{feedback.text}</motion.span></AnimatePresence>
                      </span>
                      <span className={styles.meter} data-level={score} aria-hidden="true">{[1, 2, 3, 4].map(bar => <span key={bar} data-on={bar <= score || undefined} />)}</span>
                    </div>
                  </div>
                  <div className={styles.updates}><Checkbox label="Email me product updates" checked={productUpdates} onCheckedChange={checked => setProductUpdates(checked === true)} disabled={!!busy} /></div>
                  <AnimatePresence initial={false}>
                    {shownError && <motion.div key="error" className={styles.row} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={reduce ? { duration: 0 } : { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast } }}>
                      <p className={styles.submitError} role="alert">{shownError}</p>
                    </motion.div>}
                  </AnimatePresence>
                  <Button className={styles.wide} type="submit" loading={busy === "form"}>Create account</Button>
                </form>
                <p className={styles.legal}>By creating an account you agree to the <button type="button" className={styles.textButton} onClick={() => setStatus("Terms open in your app")}>Terms</button> and <button type="button" className={styles.textButton} onClick={() => setStatus("Privacy policy opens in your app")}>Privacy policy</button>.</p>
              </motion.div>
            ) : (
              <motion.div key="done" className={styles.step} custom={custom} variants={stepMotion} initial="enter" animate="center" exit="exit">
                <svg className={styles.success} viewBox="0 0 48 48" aria-hidden="true">
                  <g transform="rotate(-90 24 24)"><motion.circle cx="24" cy="24" r="22.25" fill="none" stroke="currentColor" strokeWidth="1.5" initial={reduce ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ pathLength: { duration: motionTokens.duration.considered, ease: motionTokens.ease.inOut, delay: .16 }, opacity: { duration: motionTokens.duration.instant, delay: .16 } }} /></g>
                  <motion.path d="M15.5 24.5l5.5 5.5 11.5-12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" initial={reduce ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ pathLength: { duration: motionTokens.duration.standard + .08, ease: motionTokens.ease.enter, delay: .5 }, opacity: { duration: motionTokens.duration.instant, delay: .5 } }} />
                </svg>
                <div className={styles.heading}><h2 ref={doneRef} tabIndex={-1}>Welcome, {firstName}</h2><p>Your account is ready. We sent a confirmation to <span className={styles.address}>{email.trim()}</span>.</p></div>
                <dl className={styles.details}>
                  <div><dt>Signed up with</dt><dd>{method}</dd></div>
                  <div><dt>Product updates</dt><dd>{productUpdates ? "On" : "Off"}</dd></div>
                </dl>
                <Button type="button" variant="secondary" className={styles.wide} onClick={reset}>Start over</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <footer className={styles.footer}>
        <p className={styles.srOnly} role="status" aria-live="polite">{status}</p>
        <span className={styles.status} aria-hidden="true"><AnimatePresence mode="popLayout" initial={false}><motion.span key={status} {...swap(reduce)}>{status}</motion.span></AnimatePresence></span>
        <span className={styles.switch}>Have an account? <button type="button" className={styles.textButton} onClick={() => setStatus("Sign in opens in your app")}>Sign in</button></span>
      </footer>
    </section>
  );
}

export default SignupForm;
