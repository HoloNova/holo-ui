"use client";

import type { InputHTMLAttributes } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { forwardRef, useEffect, useId, useRef, useState } from "react";

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
const ARC_PASSWORD_FIELD_STYLES = `/* No row gap: grid tracks clamp a negative margin at zero, so a closed message row would still pay the gap. Each row carries its own space instead. */
.arc-password-field-field { display: grid; min-width: 0; }
.arc-password-field-field label { margin-bottom: var(--space-2); font-size: var(--text-sm); font-weight: 500; }
/* The focus ring contracts onto the border while it fades in; the shell never changes size. */
.arc-password-field-shell { display: flex; min-height: var(--control-height-md); align-items: center; border: 1px solid var(--border-strong); border-radius: var(--radius-control); padding: 0 var(--space-2) 0 var(--space-3); background: var(--surface); box-shadow: 0 0 0 6px transparent; transition: border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-standard) var(--ease-standard); }
@media (hover: hover) and (pointer: fine) { .arc-password-field-shell:hover:not(:focus-within) { border-color: var(--foreground); } }
.arc-password-field-shell:focus-within { border-color: var(--foreground); box-shadow: 0 0 0 3px var(--focus-ring); outline: 2px solid transparent; outline-offset: 2px; }
.arc-password-field-shell:has(.arc-password-field-input[aria-invalid="true"]) { border-color: var(--danger); }
.arc-password-field-shell:has(.arc-password-field-input[aria-invalid="true"]):focus-within { box-shadow: 0 0 0 3px color-mix(in oklch, var(--danger) 24%, transparent); }
.arc-password-field-input { width: 100%; min-width: 0; border: 0; background: transparent; color: var(--foreground); font: inherit; font-size: var(--text-sm); line-height: var(--leading-body); outline: 0; }
.arc-password-field-input:focus-visible { outline: 0; }
.arc-password-field-input::placeholder { color: var(--text-muted); }
/* Switching between dots and characters resolves in place instead of snapping. Swapping the keyframe name restarts it. */
.arc-password-field-input[data-reveal="shown"] { animation: resolve-shown var(--duration-standard) var(--ease-enter); }
.arc-password-field-input[data-reveal="hidden"] { animation: resolve-hidden var(--duration-standard) var(--ease-enter); }
@keyframes resolve-shown { from { opacity: .35; filter: blur(2px); } }
@keyframes resolve-hidden { from { opacity: .35; filter: blur(2px); } }
.arc-password-field-shell button { display: grid; width: 30px; height: 30px; flex: 0 0 auto; place-items: center; border: 0; border-radius: var(--radius-control); background: transparent; color: var(--text-muted); transition: background-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard), transform var(--duration-spring) var(--ease-spring); }
@media (hover: hover) and (pointer: fine) { .arc-password-field-shell button:hover { background: var(--surface-muted); color: var(--foreground); } }
.arc-password-field-shell button:active { transform: scale(.96); transition: background-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard), transform 100ms var(--ease-standard); }
.arc-password-field-shell button[aria-pressed="true"] { color: var(--foreground); }
.arc-password-field-shell button:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
/* The row's space is padding inside the clipped slot, so the height animates from a true zero. */
.arc-password-field-messageSlot { display: block; overflow: hidden; }
.arc-password-field-hint { display: block; padding-top: var(--space-2); color: var(--text-muted); font-size: var(--text-xs); line-height: var(--leading-body); }
/* Words are measured against this box when they pop out to leave, so it must be the positioned parent. */
.arc-password-field-words { position: relative; display: block; }
.arc-password-field-word { display: inline-block; white-space: pre; }
.arc-password-field-srOnly { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
@media (prefers-reduced-motion: reduce) { .arc-password-field-shell, .arc-password-field-shell button { transition: none; } .arc-password-field-shell button:active { transform: none; } .arc-password-field-input[data-reveal] { animation: none; } }
`;

const styles: Record<string, string> = new Proxy({
  "field": "arc-password-field-field",
  "hint": "arc-password-field-hint",
  "input": "arc-password-field-input",
  "messageSlot": "arc-password-field-messageSlot",
  "shell": "arc-password-field-shell",
  "srOnly": "arc-password-field-srOnly",
  "word": "arc-password-field-word",
  "words": "arc-password-field-words"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-password-field-${prop}`,
});

export interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> { label: string; description?: string }
/** One eye that a slash draws across, cutting the outline beneath it, instead of swapping two icons. */
function EyeMorph({ slashed }: { slashed: boolean }) {
  const reduced = useReducedMotion(); const maskId = `eye-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const slash = { pathLength: slashed ? 1 : 0, opacity: slashed ? 1 : 0 };
  const transition = reduced ? { duration: 0 } : { pathLength: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.standard] }, opacity: { duration: motionTokens.duration.instant } };
  return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24"><rect width="24" height="24" fill="white" stroke="none" /><motion.path d="M2 2l20 20" stroke="black" strokeWidth={5} initial={false} animate={slash} transition={transition} /></mask>
    <g mask={`url(#${maskId})`}><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></g>
    <motion.path d="M2 2l20 20" initial={false} animate={slash} transition={transition} />
  </svg>;
}
/** Changed words rise in and unblur while unchanged words hold still. Assistive tech reads the plain copy. */
function MotionText({ text }: { text: string }) {
  const reduced = useReducedMotion();
  const words = text.split(" ");
  return <><span className={styles.srOnly}>{text}</span><span className={styles.words} aria-hidden="true"><AnimatePresence initial={false} mode="popLayout">{words.map((word, index) => <motion.span key={`${index}:${word}`} className={styles.word}
    initial={reduced ? { opacity: 0 } : { opacity: 0, y: "0.35em", filter: `blur(${motionTokens.blur.soft}px)` }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: "-0.35em", filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: .14, ease: [...motionTokens.ease.standard] } }}
    transition={reduced ? { duration: motionTokens.duration.instant } : { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }}>{index < words.length - 1 ? `${word} ` : word}</motion.span>)}</AnimatePresence></span></>;
}

/** Helper and error copy: the row opens its height on a spring, then the words settle in. */
function FieldMessage({ id, text, className, alert }: { id?: string; text?: string; className: string; alert?: boolean }) {
  return <AnimatePresence initial={false}>{text ? <MessageRow key="message" id={id} text={text} className={className} alert={alert} /> : null}</AnimatePresence>;
}

/** The row tracks the measured copy, so a longer message that wraps opens its next line instead of snapping. */
function MessageRow({ id, text, className, alert }: { id?: string; text: string; className: string; alert?: boolean }) {
  const reduced = useReducedMotion();
  const copyRef = useRef<HTMLSpanElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");
  useEffect(() => {
    const node = copyRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => setHeight(entry.borderBoxSize?.[0]?.blockSize ?? node.offsetHeight));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <motion.span className={styles.messageSlot} initial={{ height: 0, opacity: 0 }} animate={{ height, opacity: 1 }} exit={{ height: 0, opacity: 0, transition: reduced ? { duration: 0 } : { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.instant } } }} transition={reduced ? { duration: 0 } : { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast } }}>
    <motion.span ref={copyRef} id={id} className={className} role={alert ? "alert" : undefined} initial={reduced ? false : { y: "0.35em", filter: `blur(${motionTokens.blur.soft}px)` }} animate={{ y: 0, filter: "blur(0px)" }} transition={{ duration: reduced ? 0 : motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }}><MotionText text={text} /></motion.span>
  </motion.span>;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(function PasswordField({ label, description, id, className, ...props }, ref) {
  const generated = useId(); const controlId = id ?? generated; const [visible, setVisible] = useState(false); const [toggled, setToggled] = useState(false);
  const hintId = description ? `${controlId}-description` : undefined;
  // data-reveal only appears after the first toggle, so the value resolves on each change but never on mount.
  return <div className={styles.field}><label htmlFor={controlId}>{label}</label><div className={styles.shell}><input {...props} ref={ref} id={controlId} type={visible ? "text" : "password"} data-reveal={toggled ? (visible ? "shown" : "hidden") : undefined} aria-describedby={[props["aria-describedby"], hintId].filter(Boolean).join(" ") || undefined} className={[styles.input, className].filter(Boolean).join(" ")} /><button type="button" onClick={() => { setVisible(current => !current); setToggled(true); }} aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible}><EyeMorph slashed={visible} /></button></div><FieldMessage id={hintId} text={description} className={styles.hint} /></div>;
});
