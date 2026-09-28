"use client";

import type { TextareaHTMLAttributes } from "react";
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
const ARC_TEXTAREA_STYLES = `/* No row gap: grid tracks clamp a negative margin at zero, so a closed message row would still pay the gap. Each row carries its own space instead. */
.arc-textarea-field { display: grid; min-width: 0; }
.arc-textarea-field label { margin-bottom: var(--space-2); font-size: var(--text-sm); font-weight: 500; }
/* Same focus language as Input: the ring contracts onto the border while it fades in, and the box never changes size. */
.arc-textarea-control { width: 100%; min-height: 110px; resize: vertical; border: 1px solid var(--border-strong); border-radius: var(--radius-control); padding: var(--space-3); background: var(--surface); color: var(--foreground); font: inherit; font-size: var(--text-sm); line-height: var(--leading-body); outline: none; box-shadow: 0 0 0 6px transparent; transition: border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-standard) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard); }
.arc-textarea-control::placeholder { color: var(--text-muted); }
@media (hover: hover) and (pointer: fine) { .arc-textarea-control:hover:not(:disabled, [aria-invalid="true"]) { border-color: var(--foreground); } }
.arc-textarea-control:focus-visible { border-color: var(--foreground); box-shadow: 0 0 0 3px var(--focus-ring); outline: 2px solid transparent; outline-offset: 2px; }
.arc-textarea-control[aria-invalid="true"] { border-color: var(--danger); }
.arc-textarea-control[aria-invalid="true"]:focus-visible { box-shadow: 0 0 0 3px color-mix(in oklch, var(--danger) 24%, transparent); }
.arc-textarea-control:disabled { background: var(--surface-muted); opacity: .6; }
/* The row's space is padding inside the clipped slot, so the height animates from a true zero. */
.arc-textarea-messageSlot { display: block; overflow: hidden; }
.arc-textarea-hint, .arc-textarea-error { display: block; padding-top: var(--space-2); font-size: var(--text-xs); line-height: var(--leading-body); }
.arc-textarea-hint { color: var(--text-muted); } .arc-textarea-error { color: var(--danger); }
/* Words are measured against this box when they pop out to leave, so it must be the positioned parent. */
.arc-textarea-words { position: relative; display: block; }
.arc-textarea-word { display: inline-block; white-space: pre; }
/* One column per character of a count. Tabular digits keep columns equal, so only a gained or lost digit changes the width. */
.arc-textarea-column { position: relative; display: inline-flex; justify-content: center; font-variant-numeric: tabular-nums; }
.arc-textarea-column > span { display: inline-block; }
.arc-textarea-srOnly { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
@media (prefers-reduced-motion: reduce) { .arc-textarea-control { transition: none; } }
`;

const styles: Record<string, string> = new Proxy({
  "column": "arc-textarea-column",
  "control": "arc-textarea-control",
  "error": "arc-textarea-error",
  "field": "arc-textarea-field",
  "hint": "arc-textarea-hint",
  "messageSlot": "arc-textarea-messageSlot",
  "srOnly": "arc-textarea-srOnly",
  "word": "arc-textarea-word",
  "words": "arc-textarea-words"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-textarea-${prop}`,
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> { label: string; description?: string; error?: string }
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
  return <motion.span className={styles.messageSlot} initial={{ height: 0, opacity: 0 }} animate={{ height, opacity: 1 }} exit={{ height: 0, opacity: 0, transition: reduced ? { duration: 0 } : { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.instant } } }} transition={reduced ? { duration: 0 } : { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast } }}>
    <motion.span ref={copyRef} id={id} className={className} role={alert ? "alert" : undefined} initial={reduced ? false : { y: "0.35em", filter: `blur(${motionTokens.blur.soft}px)` }} animate={{ y: 0, filter: "blur(0px)" }} transition={{ duration: reduced ? 0 : motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }}><MotionText text={text} /></motion.span>
  </motion.span>;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ label, description, error, id, className, ...props }, ref) {
  const generatedId = useId(); const controlId = id ?? generatedId;
  const hintId = description ? `${controlId}-description` : undefined; const errorId = error ? `${controlId}-error` : undefined;
  return <div className={styles.field}><label htmlFor={controlId}>{label}</label><textarea {...props} id={controlId} ref={ref} className={[styles.control, className].filter(Boolean).join(" ")} aria-invalid={error ? true : props["aria-invalid"]} aria-describedby={[props["aria-describedby"], hintId, errorId].filter(Boolean).join(" ") || undefined}/><FieldMessage id={hintId} text={description} className={styles.hint} /><FieldMessage id={errorId} text={error} className={styles.error} alert /></div>;
});
