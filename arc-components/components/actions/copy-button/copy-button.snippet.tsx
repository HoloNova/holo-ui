"use client";

import { AnimatePresence, motion, useReducedMotion, type TargetAndTransition, type Transition } from "motion/react";
import { CircleAlert, Copy } from "lucide-react";
import { useState } from "react";

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
const ARC_COPY_BUTTON_STYLES = `/* Width never changes: the label cell reserves its widest state while icon and letters crossfade inside it. Press releases on the spring curve. */
.arc-copy-button-button { display: inline-flex; width: max-content; max-width: 100%; min-height: var(--control-height-sm); align-items: center; justify-content: center; gap: var(--space-2); border: 1px solid var(--border); border-radius: var(--radius-control); padding: 0 var(--space-3); background: var(--surface); color: var(--foreground); font: inherit; font-size: var(--text-sm); font-weight: 500; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: background-color var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard), transform var(--duration-spring) var(--ease-spring); }
.arc-copy-button-button:active:not(:disabled) { transform: scale(.97); transition-duration: var(--duration-fast), var(--duration-fast), var(--duration-fast), var(--duration-instant); transition-timing-function: var(--ease-standard); }
.arc-copy-button-iconOnly:active:not(:disabled) { transform: scale(.96); }
@media (hover: hover) and (pointer: fine) { .arc-copy-button-button:hover:not(:disabled) { background: var(--surface-muted); border-color: var(--border-strong); } .arc-copy-button-plain:hover:not(:disabled) { border-color: transparent; background: var(--surface-muted); color: var(--foreground); } }
.arc-copy-button-button:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.arc-copy-button-button:disabled { cursor: not-allowed; opacity: .5; }
/* Each icon carries its own color, so the outgoing glyph never tints on its way out. */
.arc-copy-button-icon { position: relative; display: grid; width: 16px; height: 16px; flex: none; }
.arc-copy-button-iconInner { position: absolute; inset: 0; display: grid; place-items: center; }
.arc-copy-button-iconInner[data-state="copied"] { color: var(--success); }
.arc-copy-button-iconInner[data-state="error"] { color: var(--danger); }
/* The inline padding gives blurred edge letters room before the horizontal clip; the negative margin keeps the box the same size. */
.arc-copy-button-label { display: grid; min-width: 0; margin-inline: calc(var(--space-1) * -1); padding-inline: var(--space-1); overflow-x: clip; text-align: left; white-space: nowrap; }
.arc-copy-button-measure, .arc-copy-button-glyphs { grid-area: 1 / 1; }
.arc-copy-button-measure { visibility: hidden; }
.arc-copy-button-glyphs { position: relative; display: inline-flex; justify-self: start; white-space: pre; }
.arc-copy-button-glyph { display: inline-block; }
.arc-copy-button-iconOnly { width: var(--control-height-sm); padding: 0; }
.arc-copy-button-plain { border-color: transparent; background: transparent; color: var(--text-secondary); }
.arc-copy-button-srOnly { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; }
@media (prefers-reduced-motion: reduce) { .arc-copy-button-button { transition: none; } .arc-copy-button-button:active:not(:disabled) { transform: none; } }
`;

const styles: Record<string, string> = new Proxy({
  "button": "arc-copy-button-button",
  "glyph": "arc-copy-button-glyph",
  "glyphs": "arc-copy-button-glyphs",
  "icon": "arc-copy-button-icon",
  "iconInner": "arc-copy-button-iconInner",
  "iconOnly": "arc-copy-button-iconOnly",
  "label": "arc-copy-button-label",
  "measure": "arc-copy-button-measure",
  "plain": "arc-copy-button-plain",
  "srOnly": "arc-copy-button-srOnly"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-copy-button-${prop}`,
});


// ── Helper: use-copy-feedback.ts ──


export type CopyFeedbackState = "idle" | "copied" | "error";

/** Shared clipboard state for actions that render their own button or menu. */
export function useCopyFeedback(duration = 1900) {
  const [state, setState] = useState<CopyFeedbackState>("idle");
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = null;
    setState("idle");
    setActiveKey(null);
  }, []);

  useEffect(() => () => {
    if (timeout.current) clearTimeout(timeout.current);
  }, []);

  const copy = useCallback(async (value: string, key = "default") => {
    if (timeout.current) clearTimeout(timeout.current);
    setActiveKey(key);
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
      timeout.current = setTimeout(reset, duration);
      return true;
    } catch {
      setState("error");
      timeout.current = setTimeout(reset, duration);
      return false;
    }
  }, [duration, reset]);

  return { state, activeKey, copy, reset };
}



export interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
  iconOnly?: boolean;
  variant?: "outline" | "plain";
  disabled?: boolean;
  onCopied?: () => void;
}

/** Copy feedback is deliberately unhurried: a slow, almost critically damped spring and long, soft crossfades read as calm, never busy.
 *  The same motion plays in reverse when the confirmation hands back to idle, so nothing ever snaps. */
const settle = { type: "spring", visualDuration: .5, bounce: .06 } as const;
const enter = { duration: .36, ease: [...motionTokens.ease.enter] } as const;
const leave = { duration: .2, ease: [...motionTokens.ease.standard] } as const;
const instant = { duration: motionTokens.duration.instant } as const;
const soft = `blur(${motionTokens.blur.soft}px)`;
const rest: TargetAndTransition = { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" };
const fadeIn: TargetAndTransition = { ...rest, opacity: 0 };
const fadeOut: TargetAndTransition = { opacity: 0, transition: instant };
/** Icons trade places in one soft breath: the old glyph shrinks into a blur while the new one grows out of it on the slow spring. */
const iconIn: TargetAndTransition = { opacity: 0, scale: .6, filter: soft };
const iconOut: TargetAndTransition = { opacity: 0, scale: .6, filter: soft, transition: { duration: .24, ease: [...motionTokens.ease.standard] } };
const iconEnter: Transition = { scale: settle, opacity: { ...enter, delay: .03 }, filter: { ...enter, delay: .03 } };
/** Letters rise about .3em out of a soft blur; the outgoing ones lift away a little faster. */
const glyphIn: TargetAndTransition = { opacity: 0, y: 4, filter: soft };
const glyphOut: TargetAndTransition = { opacity: 0, y: -3, filter: soft, transition: leave };

/** The success tick draws itself from its short stroke, the way a hand would write it: quick to start, then easing into place while the icon settles. */
function DrawnCheck({ reduced }: { reduced: boolean }) {
  return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <motion.path d="M4 12l5 5L20 6" initial={reduced ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ pathLength: { duration: .5, ease: [...motionTokens.ease.standard], delay: .05 }, opacity: { duration: .01, delay: .05 } }} />
  </svg>;
}

type Glyph = { id: string; char: string; order: number };
const toGlyphs = (chars: string[], seq: number): Glyph[] => chars.map((char, order) => ({ id: `${seq}:${order}`, char, order }));

/** Shared leading and trailing characters keep their identity, so "Copy" to "Copied" only replaces the changed letters. */
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

/** The label cell already reserves its widest state, so the row stays put and only the letters move. */
function MorphText({ text, reduced }: { text: string; reduced: boolean }) {
  const glyphs = useGlyphs(text);
  return <span className={styles.glyphs}>
    <AnimatePresence mode="popLayout" initial={false}>
      {glyphs.map(glyph => <motion.span key={glyph.id} className={styles.glyph} layout={reduced ? false : "position"} layoutDependency={text} initial={reduced ? fadeIn : glyphIn} animate={rest} exit={reduced ? fadeOut : glyphOut} transition={reduced ? instant : { ...enter, delay: Math.min(glyph.order * .02, .12), layout: settle }}>{glyph.char}</motion.span>)}
    </AnimatePresence>
  </span>;
}

export function CopyButton({ value, label = "Copy", className, iconOnly = false, variant = "outline", disabled, onCopied }: CopyButtonProps) {
  const { state, copy } = useCopyFeedback();
  const reduced = useReducedMotion() ?? false;
  const text = state === "copied" ? "Copied" : state === "error" ? "Failed" : label;

  async function handleCopy() {
    if (await copy(value)) onCopied?.();
  }

  return <><button
    type="button"
    className={[styles.button, iconOnly && styles.iconOnly, variant === "plain" && styles.plain, className].filter(Boolean).join(" ")}
    onClick={() => void handleCopy()}
    aria-label={label}
    data-copy-state={state}
    disabled={disabled}
  >
    <span className={styles.icon} aria-hidden="true">
      <AnimatePresence initial={false}>
        <motion.span key={state} className={styles.iconInner} data-state={state} initial={reduced ? fadeIn : iconIn} animate={rest} exit={reduced ? fadeOut : iconOut} transition={reduced ? instant : iconEnter}>
          {state === "copied" ? <DrawnCheck reduced={reduced} /> : state === "error" ? <CircleAlert size={16} strokeWidth={1.8} /> : <Copy size={16} strokeWidth={1.8} />}
        </motion.span>
      </AnimatePresence>
    </span>
    {!iconOnly && <span className={styles.label} aria-hidden="true">
      <span className={styles.measure}>{label}</span><span className={styles.measure}>Copied</span><span className={styles.measure}>Failed</span>
      <MorphText text={text} reduced={reduced} />
    </span>}
  </button><span className={styles.srOnly} role="status" aria-live="polite">{state === "idle" ? "" : state === "error" ? `${label}: Could not copy` : `${label}: Copied`}</span></>;
}
