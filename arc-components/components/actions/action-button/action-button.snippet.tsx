"use client";

import type { ButtonHTMLAttributes, RefObject } from "react";
import type { TargetAndTransition, Variants } from "motion/react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

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
const ARC_ACTION_BUTTON_STYLES = `/* The button hugs its label: text morphs in place and the width follows on a spring, so no state ever snaps the layout. */
.arc-action-button-button { position: relative; display: inline-flex; min-height: var(--control-height-md); align-items: center; justify-content: center; overflow: hidden; padding: 0 var(--space-5); border: 1px solid var(--foreground); border-radius: var(--radius-control); background: var(--foreground); color: var(--background); font: inherit; font-size: var(--text-sm); font-weight: 500; line-height: var(--leading-body); cursor: pointer; -webkit-tap-highlight-color: transparent; transition: background var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard), opacity var(--duration-fast) var(--ease-standard); }
@media (hover: hover) and (pointer: fine) { .arc-action-button-button:hover:not(:disabled) { box-shadow: var(--shadow-resting); } }
.arc-action-button-button:focus-visible { outline: 3px solid var(--focus-ring); outline-offset: 3px; }
.arc-action-button-button:disabled { cursor: not-allowed; }
.arc-action-button-button:disabled:not([data-state="pending"]) { opacity: .7; }
.arc-action-button-button[data-state="pending"] { cursor: progress; }
.arc-action-button-content { display: inline-flex; min-height: 1.25rem; align-items: center; justify-content: center; gap: var(--space-2); white-space: nowrap; }
.arc-action-button-morph { display: inline-flex; min-width: 0; }
.arc-action-button-morph[data-morphing] { clip-path: inset(-.6em 0 -.6em -.3em); }
.arc-action-button-glyphs { position: relative; display: inline-flex; flex: none; white-space: pre; }
.arc-action-button-glyph { display: inline-block; }
.arc-action-button-iconSlot { display: grid; width: 17px; height: 17px; flex: 0 0 17px; place-items: center; }
.arc-action-button-phase { grid-area: 1 / 1; display: grid; width: 17px; height: 17px; place-items: center; }
.arc-action-button-arrow { flex: none; }
.arc-action-button-statusIcon { color: currentColor; }
.arc-action-button-spinner { display: inline-block; width: var(--space-4); height: var(--space-4); border: 1.5px solid currentColor; border-right-color: transparent; border-radius: var(--radius-pill); animation: spin .7s linear infinite; }
.arc-action-button-visuallyHidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .arc-action-button-button { transition: none; } .arc-action-button-spinner { animation: none; } }
`;

const styles: Record<string, string> = new Proxy({
  "arrow": "arc-action-button-arrow",
  "button": "arc-action-button-button",
  "content": "arc-action-button-content",
  "glyph": "arc-action-button-glyph",
  "glyphs": "arc-action-button-glyphs",
  "iconSlot": "arc-action-button-iconSlot",
  "morph": "arc-action-button-morph",
  "phase": "arc-action-button-phase",
  "spinner": "arc-action-button-spinner",
  "statusIcon": "arc-action-button-statusIcon",
  "visuallyHidden": "arc-action-button-visuallyHidden"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-action-button-${prop}`,
});



export interface ActionButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "onDrag" | "onDragEnd" | "onDragStart" | "onAnimationStart"> {
  label: string;
  successLabel?: string;
  pendingLabel?: string;
  onAction: () => void | Promise<void>;
  resetAfterMs?: number;
  onActionError?: (error: unknown) => void;
}

const pressVariants: Variants = {
  pressed: (button: RefObject<HTMLButtonElement | null>) => ({ scale: (button.current?.offsetWidth ?? 0) > 220 ? .985 : .97, transition: { duration: motionTokens.duration.instant, ease: [...motionTokens.ease.standard] } }),
};
const rest: TargetAndTransition = { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" };
const glyphIn: TargetAndTransition = { opacity: 0, y: 5, filter: `blur(${motionTokens.blur.soft}px)` };
const glyphOut: TargetAndTransition = { opacity: 0, y: -4, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } };
const iconIn: TargetAndTransition = { opacity: 0, scale: .6, filter: `blur(${motionTokens.blur.subtle}px)` };
const iconOut: TargetAndTransition = { ...iconIn, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } };
/** The arrow leaves in the direction of the action and returns from behind once the button resets. */
const arrowIn: TargetAndTransition = { opacity: 0, x: -6, filter: `blur(${motionTokens.blur.subtle}px)` };
const arrowOut: TargetAndTransition = { opacity: 0, x: 8, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } };
const iconRest: TargetAndTransition = { ...rest, x: 0 };
const fadeIn: TargetAndTransition = { ...rest, opacity: 0 };
const fadeOut: TargetAndTransition = { opacity: 0, transition: { duration: motionTokens.duration.instant } };
/** Scale rides the spring; opacity and blur tween so blur never overshoots below zero. */
const iconEnter = { ...motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] }, filter: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] } } as const;

/** Springs the wrapper to the natural width of its content when the text changes, so new text never snaps the layout.
 *  Other resizes (a late web font, a parent reflow) jump straight to the new width, so nothing wobbles on first paint. */
function useMorphWidth(content: RefObject<HTMLElement | null>, key: string, reduced: boolean) {
  const width = useMotionValue<number | "auto">("auto");
  const lastKey = useRef(key), armedUntil = useRef(0);
  useLayoutEffect(() => {
    if (lastKey.current === key) return;
    lastKey.current = key;
    armedUntil.current = performance.now() + 700;
  }, [key]);
  useEffect(() => {
    const node = content.current, slot = node?.parentElement;
    if (!node || !slot || typeof ResizeObserver === "undefined") return;
    let measured = false;
    const observer = new ResizeObserver(([entry]) => {
      const next = entry.contentRect.width;
      if (!next || !measured || reduced || performance.now() > armedUntil.current) { measured = next > 0; width.jump(next || "auto"); delete slot.dataset.morphing; return; }
      slot.dataset.morphing = "";
      animate(width, next, { ...motionTokens.spring.morph, onComplete: () => { delete slot.dataset.morphing; } });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [content, reduced, width]);
  return width;
}

/** The success tick draws itself from its short stroke, the way a hand would write it. */
function DrawnCheck({ reduced }: { reduced: boolean }) {
  return <svg className={styles.statusIcon} width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <motion.path d="M4 12l5 5L20 6" initial={reduced ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ pathLength: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter], delay: .05 }, opacity: { duration: .05, delay: .05 } }} />
  </svg>;
}

type Glyph = { id: string; char: string; order: number };
const toGlyphs = (chars: string[], seq: number): Glyph[] => chars.map((char, order) => ({ id: `${seq}:${order}`, char, order }));

/** Shared leading and trailing characters keep their identity, so only the changed run of text is replaced. */
function useGlyphs(text: string) {
  const [state, setState] = useState(() => ({ text, seq: 0, glyphs: toGlyphs([...text], 0) }));
  if (state.text === text) return state.glyphs;
  const prev = [...state.text], next = [...text];
  let start = 0, end = 0;
  while (start < prev.length && start < next.length && prev[start] === next[start]) start++;
  while (end < prev.length - start && end < next.length - start && prev[prev.length - 1 - end] === next[next.length - 1 - end]) end++;
  if (start < 2) start = 0;
  if (end < 2) end = 0;
  const seq = state.seq + 1;
  const glyphs = [...state.glyphs.slice(0, start), ...toGlyphs(next.slice(start, next.length - end), seq), ...state.glyphs.slice(state.glyphs.length - end)];
  setState({ text, seq, glyphs });
  return glyphs;
}

/** Morphs one label into the next: kept letters glide into place, new ones rise in from a soft blur, and the width follows on a spring. */
function MorphText({ text, reduced }: { text: string; reduced: boolean }) {
  const glyphs = useGlyphs(text);
  const rowRef = useRef<HTMLSpanElement>(null);
  const width = useMorphWidth(rowRef, text, reduced);
  return <motion.span className={styles.morph} style={{ width }} aria-hidden="true">
    <span ref={rowRef} className={styles.glyphs}>
      <AnimatePresence mode="popLayout" initial={false}>
        {glyphs.map(glyph => <motion.span key={glyph.id} className={styles.glyph} layout={reduced ? false : "position"} layoutDependency={text} initial={reduced ? fadeIn : glyphIn} animate={rest} exit={reduced ? fadeOut : glyphOut} transition={reduced ? { duration: motionTokens.duration.instant } : { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter], delay: Math.min(glyph.order * motionTokens.stagger.char, .1), layout: motionTokens.spring.morph }}>{glyph.char}</motion.span>)}
      </AnimatePresence>
    </span>
  </motion.span>;
}

export function ActionButton({ label, successLabel = "Saved", pendingLabel = "Saving", onAction, resetAfterMs = 2400, onActionError, className, disabled, ...props }: ActionButtonProps) {
  const [state, setState] = useState<"idle" | "pending" | "success">("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const text = state === "pending" ? pendingLabel : state === "success" ? successLabel : label;

  useEffect(() => () => { if (resetTimer.current) clearTimeout(resetTimer.current); }, []);

  async function run() {
    if (state === "pending") return;
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setState("pending");
    try {
      await onAction();
      setState("success");
      if (resetAfterMs > 0) resetTimer.current = setTimeout(() => setState("idle"), resetAfterMs);
    } catch (error) {
      setState("idle");
      onActionError?.(error);
    }
  }

  const pending = state === "pending";
  const arrow = state === "idle";

  // Pending stays focusable (aria-disabled instead of disabled), so a keyboard user keeps focus through the whole save.
  return <motion.button {...props} ref={buttonRef} tabIndex={props.tabIndex ?? 0} type={props.type ?? "button"} className={[styles.button, className].filter(Boolean).join(" ")} disabled={disabled} aria-disabled={pending ? true : props["aria-disabled"]} aria-busy={pending} data-state={state} onClick={run} custom={buttonRef} variants={pressVariants} whileTap={reduceMotion || disabled || pending ? undefined : "pressed"} transition={motionTokens.spring.snappy}>
    <span className={styles.content} aria-hidden="true">
      <MorphText text={text} reduced={reduceMotion} />
      <span className={styles.iconSlot}><AnimatePresence initial={false}><motion.span key={state} className={styles.phase} initial={reduceMotion ? fadeIn : arrow ? arrowIn : iconIn} animate={iconRest} exit={reduceMotion ? fadeOut : arrow ? arrowOut : iconOut} transition={reduceMotion ? { duration: motionTokens.duration.instant } : iconEnter}>{pending ? <span className={styles.spinner} /> : state === "success" ? <DrawnCheck reduced={reduceMotion} /> : <ArrowRight className={styles.arrow} width={17} height={17} />}</motion.span></AnimatePresence></span>
    </span>
    <span className={styles.visuallyHidden}>{label}</span>
    <span className={styles.visuallyHidden} role="status">{state === "pending" ? pendingLabel : state === "success" ? successLabel : ""}</span>
  </motion.button>;
}

export default ActionButton;
