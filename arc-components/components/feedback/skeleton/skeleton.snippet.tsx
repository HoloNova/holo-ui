"use client";

import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, type AnimationPlaybackControls } from "motion/react";
import { useEffect, useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";

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
const ARC_SKELETON_STYLES = `.arc-skeleton-root { display: flex; width: 100%; min-width: 0; align-items: flex-start; gap: var(--space-4); }
/* A calm, finite pulse: each block dims a beat after the one above it, then rests after about 20 seconds. */
.arc-skeleton-avatar, .arc-skeleton-line { display: block; flex: 0 0 auto; border-radius: var(--radius-control); background: color-mix(in oklch, var(--border-strong) 38%, var(--surface)); animation: skeleton-pulse 1.8s var(--ease-in-out) calc(var(--index, 0) * 90ms) 11 both; }
.arc-skeleton-avatar { width: var(--control-height-md); height: var(--control-height-md); border-radius: var(--radius-pill); }
.arc-skeleton-lines { display: grid; flex: 1; gap: var(--space-3); padding-top: var(--space-1); }
.arc-skeleton-line { width: 100%; height: var(--space-3); }
.arc-skeleton-line:first-child { width: 48%; height: var(--space-4); }
.arc-skeleton-line:last-child { width: 72%; }
.arc-skeleton-frame { position: relative; display: flow-root; }
@keyframes skeleton-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .52; } }
@media (prefers-reduced-motion: reduce) { .arc-skeleton-avatar, .arc-skeleton-line { animation: none; } }
`;

const styles: Record<string, string> = new Proxy({
  "avatar": "arc-skeleton-avatar",
  "frame": "arc-skeleton-frame",
  "line": "arc-skeleton-line",
  "lines": "arc-skeleton-lines",
  "root": "arc-skeleton-root"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-skeleton-${prop}`,
});



export interface SkeletonProps {
  label?: string;
  lines?: number;
  avatar?: boolean;
  className?: string;
  /** Content to reveal once loading finishes. With children, the placeholder crossfades into them. */
  children?: ReactNode;
  /** Keeps the placeholder visible while true. Only used together with children. */
  loading?: boolean;
}

/** Follows its content height. After `morphKey` changes, the height springs from the old size to the new one and then returns to auto, so passive reflows (a resize, a font swap) follow instantly. It clips only while moving, so focus rings stay visible at rest. */
function HeightFrame({ className, busy, reduce, children }: { className?: string; busy: boolean; reduce: boolean | null; children: ReactNode }) {
  const frame = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const height = useMotionValue<number | "auto">("auto");
  const changedAt = useRef(0);
  useLayoutEffect(() => { changedAt.current = performance.now(); }, [busy]);
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
  return <motion.div ref={frame} className={className} aria-busy={busy} style={{ height }}>
    <div ref={content} className={styles.frame}>{children}</div>
  </motion.div>;
}

export function Skeleton({ label = "Loading content", lines = 3, avatar = false, className, children, loading = true }: SkeletonProps) {
  const reduce = useReducedMotion();
  const count = Math.min(Math.max(Math.floor(lines), 1), 6);
  // Each block pulses a beat after the one above it, so the wait reads as one calm wave.
  const placeholder = (extra?: string) => <div className={[styles.root, extra].filter(Boolean).join(" ")} role="status" aria-label={label} aria-busy="true">
    {avatar && <span className={styles.avatar} aria-hidden="true" />}
    <span className={styles.lines} aria-hidden="true">{Array.from({ length: count }, (_, index) => <span className={styles.line} style={{ "--index": index + (avatar ? 1 : 0) } as CSSProperties} key={index} />)}</span>
  </div>;
  if (children === undefined) return placeholder(className);
  return <HeightFrame className={className} busy={loading} reduce={reduce}>
    <AnimatePresence mode="popLayout" initial={false}>
      {loading
        ? <motion.div key="placeholder" exit={{ opacity: 0, transition: { duration: reduce ? motionTokens.duration.instant : motionTokens.duration.fast } }}>{placeholder()}</motion.div>
        : <motion.div key="content" initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? motionTokens.duration.instant : motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }}>{children}</motion.div>}
    </AnimatePresence>
  </HeightFrame>;
}

export default Skeleton;
