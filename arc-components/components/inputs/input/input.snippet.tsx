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
const ARC_INPUT_STYLES = `/* No row gap: grid tracks clamp a negative margin at zero, so a closed message row would still pay the gap. Each row carries its own space instead. */
.arc-input-field { display: grid; min-width: 0; }
.arc-input-label { margin-bottom: var(--space-2); color: var(--foreground); font-size: var(--text-sm); font-weight: 500; line-height: var(--leading-body); }
/* The focus ring contracts onto the border while it fades in; the field itself never changes size. */
.arc-input-input { width: 100%; min-height: var(--control-height-md); padding: 0 var(--space-3); border: 1px solid var(--border-strong); border-radius: var(--radius-control); background: var(--surface); color: var(--foreground); font: inherit; font-size: var(--text-sm); line-height: var(--leading-body); letter-spacing: var(--tracking-body); outline: none; box-shadow: 0 0 0 6px transparent; transition: border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-standard) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard); }
.arc-input-input::placeholder { color: var(--text-muted); }
@media (hover: hover) and (pointer: fine) { .arc-input-input:hover:not(:disabled, [aria-invalid="true"]) { border-color: var(--foreground); } }
.arc-input-input:focus-visible { border-color: var(--foreground); box-shadow: 0 0 0 3px var(--focus-ring); outline: 2px solid transparent; outline-offset: 2px; }
.arc-input-input[aria-invalid="true"] { border-color: var(--danger); }
.arc-input-input[aria-invalid="true"]:focus-visible { box-shadow: 0 0 0 3px color-mix(in oklch, var(--danger) 24%, transparent); }
.arc-input-input:disabled { cursor: not-allowed; opacity: .5; background: var(--surface-muted); }
/* The row's space is padding inside the clipped slot, so the height animates from a true zero. */
.arc-input-messageSlot { display: block; overflow: hidden; }
.arc-input-description, .arc-input-error { display: block; padding-top: var(--space-2); font-size: var(--text-xs); line-height: var(--leading-body); }
.arc-input-description { color: var(--text-muted); } .arc-input-error { color: var(--danger); }
/* Words are measured against this box when they pop out to leave, so it must be the positioned parent. */
.arc-input-words { position: relative; display: block; }
.arc-input-word { display: inline-block; white-space: pre; }
/* One column per character of a count. Tabular digits keep columns equal, so only a gained or lost digit changes the width. */
.arc-input-column { position: relative; display: inline-flex; justify-content: center; font-variant-numeric: tabular-nums; }
.arc-input-column > span { display: inline-block; }
.arc-input-srOnly { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
@media (prefers-reduced-motion: reduce) { .arc-input-input { transition-duration: .01ms; } }
`;

const styles: Record<string, string> = new Proxy({
  "column": "arc-input-column",
  "description": "arc-input-description",
  "error": "arc-input-error",
  "field": "arc-input-field",
  "input": "arc-input-input",
  "label": "arc-input-label",
  "messageSlot": "arc-input-messageSlot",
  "srOnly": "arc-input-srOnly",
  "word": "arc-input-word",
  "words": "arc-input-words"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-input-${prop}`,
});



export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  error?: string;
}

/* Digits roll up when a number grows and down when it shrinks; `custom` hands the latest direction to digits already leaving. */
const digit = {
  enter: (direction: number) => ({ opacity: 0, y: `${direction * 0.6}em`, filter: `blur(${motionTokens.blur.subtle}px)` }),
  center: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: (direction: number) => ({ opacity: 0, y: `${direction * -0.6}em`, filter: `blur(${motionTokens.blur.subtle}px)` }),
};
const isNumber = (word: string) => /^\d[\d.,/:]*%?$/.test(word);

/** A count in the copy, such as "12 characters", rolls only the digits that changed; a gained or lost digit opens or closes its width. */
function RollingNumber({ word }: { word: string }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState({ word, direction: 1 });
  if (shown.word !== word) setShown({ word, direction: parseFloat(word.replace(/,/g, "")) < parseFloat(shown.word.replace(/,/g, "")) ? -1 : 1 });
  const characters = word.split("");
  const transition = reduced ? { duration: 0 } : { y: motionTokens.spring.snappy, width: motionTokens.spring.morph, opacity: { duration: motionTokens.duration.fast }, filter: { duration: motionTokens.duration.fast } };
  return <AnimatePresence initial={false}>{characters.map((character, index) => <motion.span key={characters.length - index} className={styles.column} initial={{ width: 0, opacity: 0 }} animate={{ width: "auto", opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={transition}>
    <AnimatePresence initial={false} mode="popLayout" custom={shown.direction}><motion.span key={character} custom={shown.direction} variants={digit} initial="enter" animate="center" exit="exit" transition={transition}>{character}</motion.span></AnimatePresence>
  </motion.span>)}</AnimatePresence>;
}

/** Changed words rise in and unblur while unchanged words hold still, and numbers roll. Assistive tech reads the plain copy. */
function MotionText({ text }: { text: string }) {
  const reduced = useReducedMotion();
  const words = text.split(" ");
  return <><span className={styles.srOnly}>{text}</span><span className={styles.words} aria-hidden="true"><AnimatePresence initial={false} mode="popLayout">{words.map((word, index) => <motion.span key={`${index}:${isNumber(word) ? "#" : word}`} className={styles.word}
    initial={reduced ? { opacity: 0 } : { opacity: 0, y: "0.35em", filter: `blur(${motionTokens.blur.soft}px)` }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: "-0.35em", filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: .14, ease: [...motionTokens.ease.standard] } }}
    transition={reduced ? { duration: motionTokens.duration.instant } : { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }}>{isNumber(word) ? <RollingNumber word={word} /> : word}{index < words.length - 1 ? " " : null}</motion.span>)}</AnimatePresence></span></>;
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
  // Reduced motion mounts the row at full height: a zero-duration open would still paint one collapsed frame. The presence starts
  // with initial={false}, so rows present at hydration render the same on server and client either way.
  return <motion.span className={styles.messageSlot} initial={reduced ? false : { height: 0, opacity: 0 }} animate={{ height, opacity: 1 }} exit={{ height: 0, opacity: 0, transition: reduced ? { duration: 0 } : { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.instant } } }} transition={reduced ? { duration: 0 } : { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast } }}>
    <motion.span ref={copyRef} id={id} className={className} role={alert ? "alert" : undefined} initial={reduced ? false : { y: "0.35em", filter: `blur(${motionTokens.blur.soft}px)` }} animate={{ y: 0, filter: "blur(0px)" }} transition={{ duration: reduced ? 0 : motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }}><MotionText text={text} /></motion.span>
  </motion.span>;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, description, error, id, className, ...props }, ref,
) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const hintId = description ? `${controlId}-description` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [props["aria-describedby"], hintId, errorId].filter(Boolean).join(" ") || undefined;
  return <div className={styles.field}>
    <label className={styles.label} htmlFor={controlId}>{label}</label>
    <input {...props} id={controlId} ref={ref} className={[styles.input, className].filter(Boolean).join(" ")} aria-invalid={error ? true : props["aria-invalid"]} aria-describedby={describedBy}/>
    <FieldMessage id={hintId} text={description} className={styles.description} />
    <FieldMessage id={errorId} text={error} className={styles.error} alert />
  </div>;
});

Input.displayName = "Input";
