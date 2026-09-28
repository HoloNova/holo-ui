"use client";

import { Fragment, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useInView, useReducedMotion, type Transition } from "motion/react";

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
const ARC_IN_VIEW_TITLE_STYLES = `.arc-in-view-title-wrap { min-width: 0; color: var(--foreground); }
/* Clips hide the rise; padding with matching negative margins leaves room for descenders and blur without changing layout. */
.arc-in-view-title-clip { display: inline-block; overflow: hidden; vertical-align: top; padding: .08em .14em .2em; margin: -.08em -.14em -.2em; }
.arc-in-view-title-lineClip { display: block; overflow: hidden; padding: .06em .12em .18em; margin: -.06em -.12em -.18em; }
.arc-in-view-title-clip > span, .arc-in-view-title-lineClip > span, .arc-in-view-title-blurWord, .arc-in-view-title-trackWord, .arc-in-view-title-trackWord > span { display: inline-block; }
.arc-in-view-title-trackWord { white-space: nowrap; }
/* The wipe mask is 2.3 times the title's width with a feathered middle, so the soft edge sits fully outside the title at both ends of the sweep.
   Padding with matching negative margins keeps descenders and overhangs inside the masked box without changing layout. */
.arc-in-view-title-wipe { padding: .1em .12em .22em; margin: -.1em -.12em -.22em; mask-image: linear-gradient(90deg, #000 44%, transparent 56%); mask-size: 230% 100%; mask-repeat: no-repeat; mask-position: var(--wipe, 0%) 0; }
/* Server rendered titles start hidden. If scripts have not taken over after 2.4s, show them anyway; the class is removed on hydration. */
.arc-in-view-title-pending .arc-in-view-title-part { animation: settle .4s var(--ease-enter) 2.4s forwards; }
@keyframes settle { to { opacity: 1; transform: none; filter: none; --wipe: 0%; mask-image: none; } }
@media (prefers-reduced-motion: reduce) { .arc-in-view-title-part { opacity: 1 !important; transform: none !important; filter: none !important; mask-image: none !important; } .arc-in-view-title-pending .arc-in-view-title-part { animation: none; } }
`;

const styles: Record<string, string> = new Proxy({
  "blurWord": "arc-in-view-title-blurWord",
  "clip": "arc-in-view-title-clip",
  "lineClip": "arc-in-view-title-lineClip",
  "part": "arc-in-view-title-part",
  "pending": "arc-in-view-title-pending",
  "trackWord": "arc-in-view-title-trackWord",
  "wipe": "arc-in-view-title-wipe",
  "wrap": "arc-in-view-title-wrap"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-in-view-title-${prop}`,
});


export type InViewTitleVariant = "word" | "line" | "blur" | "tracking" | "wipe";
/**
 * A section title that reveals itself once it scrolls into view. `blur` sharpens word by word and suits most headings; `word` and `line` rise out of a clip for editorial pages;
 * `tracking` opens tight letter spacing; `wipe` uncovers the title from left to right through a soft edge. Pass `lines` to set the breaks for `line`, and `once={false}` to replay on every entry.
 * Titles that are already above the viewport show immediately, and server rendered titles appear on their own if scripts are slow.
 */
export interface InViewTitleProps { text: string; variant?: InViewTitleVariant; as?: "h1" | "h2" | "h3"; lines?: string[]; className?: string; id?: string; once?: boolean }
const subscribeHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
/** Matches the delay of the stylesheet fallback: when scripts arrive later than this, the fallback has already shown the title, so it stays put instead of animating again. */
const FALLBACK_MS = 2400;
const lateBoot = typeof window !== "undefined" && performance.now() > FALLBACK_MS;
const enter = [...motionTokens.ease.enter] as [number, number, number, number];
const standard = [...motionTokens.ease.standard] as [number, number, number, number];
/** Horizontal distance each letter travels per step from its word's center in the tracking variant. */
const TRACK_EM = .06;

/** Transform settles longest, blur clears sooner, and opacity leads, so text is readable before it has fully arrived. Hiding is a quick fade with no stagger. */
function reveal(instant: boolean, visible: boolean, delay: number, settle = .8): Transition {
  if (instant) return { duration: 0 };
  if (!visible) return { duration: motionTokens.duration.exit, ease: standard };
  const track = (duration: number, ease = enter) => ({ duration, delay, ease });
  return { y: track(settle), x: track(settle), "--wipe": track(settle, standard), filter: track(settle * .78), opacity: track(settle * .56, standard) };
}

export function InViewTitle({ text, variant = "blur", as = "h2", lines, className, id, once = true }: InViewTitleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, amount: .45 });
  const [passed, setPassed] = useState(false);
  useEffect(() => {
    if (inView || passed) return;
    const revealPassedTitle = () => {
      if (ref.current && ref.current.getBoundingClientRect().top < 0) setPassed(true);
    };
    revealPassedTitle();
    window.addEventListener("scroll", revealPassedTitle, { passive: true });
    return () => window.removeEventListener("scroll", revealPassedTitle);
  }, [inView, passed]);
  const prefersReduced = useReducedMotion();
  const hydrated = useSyncExternalStore(subscribeHydration, clientSnapshot, serverSnapshot);
  const [serverRendered] = useState(!hydrated);
  const reduced = hydrated && prefersReduced;
  const late = hydrated && serverRendered && lateBoot;
  const visible = reduced || late || inView || passed;
  const instant = Boolean(reduced || late);
  const Tag = as;
  const wrapperClass = [styles.wrap, hydrated ? "" : styles.pending, className].filter(Boolean).join(" ");
  const words = text.split(" ").filter(Boolean);
  const step = Math.min(motionTokens.stagger.word * 1.5, .4 / Math.max(words.length, 1));

  if (variant === "word") return <div ref={ref} className={wrapperClass}><Tag id={id} aria-label={text}>{words.map((word, index) => <Fragment key={`${word}-${index}`}><span className={styles.clip} aria-hidden="true"><motion.span className={styles.part} initial={false} animate={visible ? { y: "0em", opacity: 1 } : { y: "0.9em", opacity: 0 }} transition={reveal(instant, visible, index * step)}>{word}</motion.span></span>{index < words.length - 1 ? " " : null}</Fragment>)}</Tag></div>;
  if (variant === "line") {
    const titleLines = lines?.length ? lines : [text];
    return <div ref={ref} className={wrapperClass}><Tag id={id} aria-label={text}>{titleLines.map((line, index) => <span className={styles.lineClip} aria-hidden="true" key={`${line}-${index}`}><motion.span className={styles.part} initial={false} animate={visible ? { y: "0%", opacity: 1 } : { y: "112%", opacity: 0 }} transition={reveal(instant, visible, index * motionTokens.stagger.line, .86)}>{line}</motion.span></span>)}</Tag></div>;
  }
  if (variant === "blur") return <div ref={ref} className={wrapperClass}><Tag id={id} aria-label={text}>{words.map((word, index) => <Fragment key={`${word}-${index}`}><motion.span className={`${styles.blurWord} ${styles.part}`} aria-hidden="true" initial={false} animate={visible ? { opacity: 1, y: "0em", filter: "blur(0px)" } : { opacity: 0, y: "0.2em", filter: `blur(${motionTokens.blur.text}px)` }} transition={reveal(instant, visible, index * step)}>{word}</motion.span>{index < words.length - 1 ? " " : null}</Fragment>)}</Tag></div>;
  if (variant === "tracking") return <div ref={ref} className={wrapperClass}><Tag id={id} aria-label={text}>{words.map((word, index) => {
    const letters = Array.from(word);
    const center = (letters.length - 1) / 2;
    const delay = index * motionTokens.stagger.char * 2;
    return <Fragment key={`${word}-${index}`}><motion.span className={`${styles.trackWord} ${styles.part}`} aria-hidden="true" initial={false} animate={visible ? { opacity: 1, filter: "blur(0px)" } : { opacity: 0, filter: `blur(${motionTokens.blur.soft}px)` }} transition={reveal(instant, visible, delay, .9)}>{letters.map((letter, letterIndex) => <motion.span key={letterIndex} className={styles.part} initial={false} animate={{ x: visible ? "0em" : `${(center - letterIndex) * TRACK_EM}em` }} transition={reveal(instant, visible, delay, 1)}>{letter}</motion.span>)}</motion.span>{index < words.length - 1 ? " " : null}</Fragment>;
  })}</Tag></div>;
  // A soft edged mask sweeps across the title instead of a hard clip, so no letter is ever cut mid stroke.
  return <div ref={ref} className={wrapperClass}><motion.div className={`${styles.wipe} ${styles.part}`} initial={false} animate={visible ? { "--wipe": "0%", x: "0em" } : { "--wipe": "100%", x: "-0.12em" }} transition={reveal(instant, visible, 0, .9)}><Tag id={id}>{text}</Tag></motion.div></div>;
}

export default InViewTitle;
