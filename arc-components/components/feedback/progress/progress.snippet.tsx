"use client";

import { AnimatePresence, animate, motion, useIsPresent, useMotionValue, useReducedMotion, useTransform, type HTMLMotionProps, type TargetAndTransition, type Transition } from "motion/react";
import { Check } from "lucide-react";
import { useEffect } from "react";

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
const ARC_PROGRESS_STYLES = `.arc-progress-progress { width: 100%; color: var(--text-secondary); font-size: var(--text-sm); } .arc-progress-meta { display: flex; justify-content: space-between; gap: 14px; margin-bottom: 8px; line-height: var(--leading-body); } .arc-progress-label { position: relative; min-width: 0; } .arc-progress-line { display: block; } .arc-progress-value { display: inline-flex; flex: none; align-items: center; gap: 4px; color: var(--text-muted); font-variant-numeric: tabular-nums; } .arc-progress-count { display: inline-grid; justify-items: end; } /* A hidden "100%" row reserves the widest count, so the check never shifts as the number gains a digit. */ .arc-progress-count::before { content: "100%"; height: 0; overflow: hidden; visibility: hidden; } .arc-progress-done { display: grid; place-items: center; color: var(--success); } .arc-progress-track { height: 7px; overflow: hidden; border: 1px solid var(--border); border-radius: 99px; background: var(--surface-muted); } .arc-progress-fill { display: block; width: 100%; height: 100%; border-radius: inherit; background: var(--accent); transition: background-color var(--duration-standard) var(--ease-standard); } .arc-progress-progress[data-complete] .arc-progress-fill { background: var(--success); transition-delay: 200ms; } @media (prefers-reduced-motion: reduce) { .arc-progress-fill, .arc-progress-progress[data-complete] .arc-progress-fill { transition: none; } }
`;

const styles: Record<string, string> = new Proxy({
  "count": "arc-progress-count",
  "done": "arc-progress-done",
  "fill": "arc-progress-fill",
  "label": "arc-progress-label",
  "line": "arc-progress-line",
  "meta": "arc-progress-meta",
  "progress": "arc-progress-progress",
  "track": "arc-progress-track",
  "value": "arc-progress-value"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-progress-${prop}`,
});



export interface ProgressProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  value?: number;
  max?: number;
  label?: string;
  showValue?: boolean;
}

const exitFast: Transition = { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] };
const textIn: TargetAndTransition = { opacity: 0, y: "0.3em", filter: `blur(${motionTokens.blur.soft}px)` };
const textOut: TargetAndTransition = { opacity: 0, y: "-0.3em", filter: `blur(${motionTokens.blur.subtle}px)`, transition: exitFast };
const iconIn: TargetAndTransition = { opacity: 0, scale: .6, filter: `blur(${motionTokens.blur.subtle}px)` };
const shown: TargetAndTransition = { opacity: 1, y: "0em", scale: 1, filter: "blur(0px)" };
const fadeOut: TargetAndTransition = { opacity: 0, transition: { duration: motionTokens.duration.instant } };

/** Outgoing copies are hidden from assistive tech while they fade. */
function Swap(props: HTMLMotionProps<"span">) {
  const present = useIsPresent();
  return <motion.span {...props} aria-hidden={present ? props["aria-hidden"] : true} />;
}

export function Progress({ value = 0, max = 100, label, showValue = false, className, ...props }: ProgressProps) {
  const reduce = useReducedMotion();
  const safeMax = max > 0 ? max : 100;
  const safeValue = Math.min(Math.max(value, 0), safeMax);
  const percentage = Math.round((safeValue / safeMax) * 100);
  const complete = percentage >= 100;
  // One spring drives both the fill and the counted label, so the number always matches the bar.
  const progress = useMotionValue(percentage);
  // The fill slides in from the left instead of scaling, so its rounded end keeps its shape at every value.
  const x = useTransform(progress, latest => `${Math.min(Math.max(latest, 0), 100) - 100}%`);
  const counted = useTransform(progress, latest => `${Math.round(Math.min(Math.max(latest, 0), 100))}%`);
  useEffect(() => {
    if (reduce) { progress.jump(percentage); return; }
    const controls = animate(progress, percentage, motionTokens.spring.smooth);
    return () => controls.stop();
  }, [percentage, progress, reduce]);
  const enter: Transition = reduce ? { duration: motionTokens.duration.instant } : { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] };
  const classes = [styles.progress, className].filter(Boolean).join(" ");
  return <div {...props} className={classes} data-complete={complete ? "" : undefined} role="progressbar" aria-label={label ?? "Progress"} aria-valuemin={0} aria-valuemax={safeMax} aria-valuenow={safeValue} aria-valuetext={`${percentage}%`}>
    {(label || showValue) ? <div className={styles.meta}>
      {label ? <span className={styles.label}><AnimatePresence mode="popLayout" initial={false}><Swap key={label} className={styles.line} initial={reduce ? { opacity: 0 } : textIn} animate={shown} exit={reduce ? fadeOut : textOut} transition={enter}>{label}</Swap></AnimatePresence></span> : <span />}
      {showValue ? <span className={styles.value}>
        {/* Completion lands as the fill arrives: a check settles in beside the final count. */}
        <AnimatePresence initial={false}>{complete && <motion.span key="done" className={styles.done} initial={reduce ? { opacity: 0 } : iconIn} animate={shown} exit={reduce ? fadeOut : { ...iconIn, transition: exitFast }} transition={reduce ? enter : { ...motionTokens.spring.snappy, delay: .24 }}><Check size={14} strokeWidth={2} aria-hidden="true" /></motion.span>}</AnimatePresence>
        <motion.span className={styles.count}>{counted}</motion.span>
      </span> : null}
    </div> : null}
    <div className={styles.track}><motion.span className={styles.fill} style={{ x }} /></div>
  </div>;
}

export default Progress;
