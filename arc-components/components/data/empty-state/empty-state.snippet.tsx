"use client";

import { AnimatePresence, animate, motion, useIsPresent, useMotionValue, useReducedMotion, type AnimationPlaybackControls, type HTMLMotionProps, type MotionProps, type TargetAndTransition, type Transition } from "motion/react";
import { Folder } from "lucide-react";
import { isValidElement, useEffect, useLayoutEffect, useRef, type ReactNode } from "react";

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
const ARC_EMPTY_STATE_STYLES = `.arc-empty-state-root { display: flex; width: 100%; flex-direction: column; align-items: center; padding: clamp(var(--space-8), 8vw, var(--space-12)) var(--space-5); text-align: center; }
.arc-empty-state-icon { position: relative; display: grid; width: var(--space-12); height: var(--space-12); place-items: center; border: 1px solid var(--border); border-radius: var(--radius-panel); background: var(--surface-muted); color: var(--text-secondary); animation: empty-state-icon var(--duration-considered) var(--ease-enter) both; }
.arc-empty-state-glyph { display: grid; place-items: center; }
.arc-empty-state-frame { width: 100%; max-width: 100%; }
.arc-empty-state-copy { display: flow-root; }
.arc-empty-state-root h3 { position: relative; margin: var(--space-5) 0 0; color: var(--foreground); font-size: var(--text-base); font-weight: 500; line-height: var(--leading-body); }
.arc-empty-state-root p { position: relative; max-width: 18rem; margin: var(--space-2) auto 0; color: var(--text-secondary); font-size: var(--text-sm); line-height: var(--leading-body); }
/* Centered copy wraps into even lines, so a new description never leaves a single word hanging. */
.arc-empty-state-line { display: block; text-wrap: balance; }
.arc-empty-state-action { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--space-3); margin-top: var(--space-5); }
/* The icon settles in once when the state first appears; later changes crossfade in place. */
@keyframes empty-state-icon { from { opacity: 0; transform: scale(.92); } to { opacity: 1; transform: scale(1); } }
@media (prefers-reduced-motion: reduce) { .arc-empty-state-icon { animation: none; } }
`;

const styles: Record<string, string> = new Proxy({
  "action": "arc-empty-state-action",
  "copy": "arc-empty-state-copy",
  "frame": "arc-empty-state-frame",
  "glyph": "arc-empty-state-glyph",
  "icon": "arc-empty-state-icon",
  "line": "arc-empty-state-line",
  "root": "arc-empty-state-root"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-empty-state-${prop}`,
});



export interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
  /** Optional accessible label for the state region. */
  label?: string;
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

/** A new icon component crossfades in; re-rendering the same icon stays still. */
function iconKey(icon: ReactNode) {
  if (!isValidElement(icon)) return "icon";
  const type = icon.type as string | { displayName?: string; name?: string };
  return typeof type === "string" ? type : type.displayName ?? type.name ?? "icon";
}

/** Follows its content height. After `morphKey` changes, the height springs from the old size to the new one and then returns to auto, so passive reflows (a resize, a font swap) follow instantly. It clips only while moving, so focus rings stay visible at rest. */
function HeightFrame({ reduce, morphKey, children }: { reduce: boolean | null; morphKey: string; children: ReactNode }) {
  const frame = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const height = useMotionValue<number | "auto">("auto");
  const changedAt = useRef(0);
  useLayoutEffect(() => { changedAt.current = performance.now(); }, [morphKey]);
  useEffect(() => {
    const node = content.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    let last: number | undefined;
    let controls: AnimationPlaybackControls | undefined;
    const settle = () => { height.jump("auto"); if (frame.current) Object.assign(frame.current.style, { overflow: "", height: "auto" }); };
    const observer = new ResizeObserver(([entry]) => {
      const next = entry.borderBoxSize?.[0]?.blockSize ?? node.offsetHeight;
      const current = height.get();
      const from = typeof current === "number" ? current : last;
      last = next;
      controls?.stop();
      if (reduce || from === undefined || from === next || performance.now() - changedAt.current > 120) return settle();
      // Pin the old height before this frame paints, then spring to the new one.
      if (frame.current) Object.assign(frame.current.style, { overflow: "hidden", height: `${from}px` });
      controls = animate(height, [from, next], { ...motionTokens.spring.smooth, onComplete: settle });
    });
    observer.observe(node);
    return () => { observer.disconnect(); controls?.stop(); };
  }, [height, reduce]);
  return <motion.div ref={frame} className={styles.frame} style={{ height }}>
    <div ref={content} className={styles.copy}>{children}</div>
  </motion.div>;
}

export function EmptyState({ title, description, action, icon, className, label }: EmptyStateProps) {
  const reduce = useReducedMotion();
  const glyph = icon ?? <Folder width={24} height={24} strokeWidth={1.5} />;
  const enter: Transition = reduce ? { duration: motionTokens.duration.instant } : { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] };
  const swap: MotionProps = { initial: reduce ? { opacity: 0 } : textIn, animate: shown, exit: reduce ? fadeOut : textOut, transition: enter };
  // The result of an action morphs in place: the icon crossfades and the copy rises in while the old copy leaves.
  return <section className={[styles.root, className].filter(Boolean).join(" ")} aria-label={label}>
    <div className={styles.icon} aria-hidden="true"><AnimatePresence mode="popLayout" initial={false}><Swap key={iconKey(glyph)} className={styles.glyph} initial={reduce ? { opacity: 0 } : iconIn} animate={shown} exit={reduce ? fadeOut : { ...iconIn, transition: exitFast }} transition={reduce ? enter : motionTokens.spring.snappy}>{glyph}</Swap></AnimatePresence></div>
    <HeightFrame reduce={reduce} morphKey={`${title}\n${description}`}>
      <h3><AnimatePresence mode="popLayout" initial={false}><Swap key={title} className={styles.line} {...swap}>{title}</Swap></AnimatePresence></h3>
      <p><AnimatePresence mode="popLayout" initial={false}><Swap key={description} className={styles.line} {...swap}>{description}</Swap></AnimatePresence></p>
    </HeightFrame>
    {action && <div className={styles.action}>{action}</div>}
  </section>;
}

export default EmptyState;
