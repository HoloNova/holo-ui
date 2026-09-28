"use client";

import { AnimatePresence, animate, motion, useIsPresent, useMotionValue, useReducedMotion, type AnimationPlaybackControls, type HTMLMotionProps, type MotionProps, type PanInfo, type TargetAndTransition, type Transition, type Variants } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

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
const ARC_TOAST_STYLES = `.arc-toast-toast {
  display: flex;
  width: min(100%, 26rem);
  min-width: 0;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem 0.875rem 0.875rem 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-panel);
  background: color-mix(in oklch, var(--surface) 94%, var(--background));
  color: var(--foreground);
  box-shadow: var(--shadow-floating);
}

.arc-toast-icon {
  display: grid;
  width: 1.875rem;
  height: 1.875rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid color-mix(in oklch, var(--success) 24%, var(--border));
  border-radius: var(--radius-pill);
  background: color-mix(in oklch, var(--success) 10%, var(--surface));
  color: var(--success);
}

.arc-toast-frame {
  display: block;
  min-width: 0;
  flex: 1;
}

.arc-toast-copy {
  position: relative;
  display: grid;
  min-width: 0;
  gap: 0.25rem;
  padding-top: 0.125rem;
}

.arc-toast-title {
  position: relative;
  display: block;
  min-width: 0;
  font-size: var(--text-sm);
  font-weight: 500;
  line-height: 1.35;
}

.arc-toast-line {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.arc-toast-description {
  display: block;
  color: var(--text-secondary);
  font-size: var(--text-sm);
  line-height: var(--leading-body);
}

.arc-toast-close {
  display: grid;
  width: 2rem;
  height: 2rem;
  flex: 0 0 auto;
  place-items: center;
  margin: -0.125rem -0.125rem 0 0;
  border: 0;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: transform var(--duration-spring) var(--ease-spring),
    background-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard);
}

@media (hover: hover) and (pointer: fine) {
  .arc-toast-close:hover {
    background: var(--surface-muted);
    color: var(--foreground);
  }
}

/* Quick press, spring release. */
.arc-toast-close:active {
  transform: scale(0.96);
  transition-duration: var(--duration-instant);
  transition-timing-function: var(--ease-standard);
}

.arc-toast-close:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .arc-toast-close { transition: none; }
  .arc-toast-close:active { transform: none; }
}
`;

const styles: Record<string, string> = new Proxy({
  "close": "arc-toast-close",
  "copy": "arc-toast-copy",
  "description": "arc-toast-description",
  "frame": "arc-toast-frame",
  "icon": "arc-toast-icon",
  "line": "arc-toast-line",
  "title": "arc-toast-title",
  "toast": "arc-toast-toast"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-toast-${prop}`,
});

export interface ToastProps { title: string; description?: string; open?: boolean; onOpenChange?: (open: boolean) => void; duration?: number; }

const subscribeHydration = () => () => {};
const exitFast: Transition = { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] };
const enter: Transition = { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] };
const textIn: TargetAndTransition = { opacity: 0, y: "0.3em", filter: `blur(${motionTokens.blur.soft}px)` };
const textOut: TargetAndTransition = { opacity: 0, y: "-0.3em", filter: `blur(${motionTokens.blur.subtle}px)`, transition: exitFast };
const textShown: TargetAndTransition = { opacity: 1, y: "0em", filter: "blur(0px)" };
const fadeOut: TargetAndTransition = { opacity: 0, transition: { duration: motionTokens.duration.instant } };
/** A swipe past this distance (px) or speed (px/s) dismisses the toast in the direction it was thrown. */
const swipe = { distance: 80, velocity: 480 };

/** Outgoing copies are hidden from assistive tech while they fade, so the live region reads only the current text. */
function Swap(props: HTMLMotionProps<"span">) {
  const present = useIsPresent();
  return <motion.span {...props} aria-hidden={present ? props["aria-hidden"] : true} />;
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

export default function Toast({ title, description, open = true, onOpenChange, duration = 4500 }: ToastProps) {
  const reduce = useReducedMotion();
  // Toasts that mount after hydration rise in from their edge; server-rendered ones start settled.
  const hydrated = useSyncExternalStore(subscribeHydration, () => true, () => false);
  const [enterOnMount] = useState(hydrated);
  const [dismissed, setDismissed] = useState(false);
  const [throwX, setThrowX] = useState(0);
  const [lastOpen, setLastOpen] = useState(open);
  if (open !== lastOpen) { setLastOpen(open); if (open) { setDismissed(false); setThrowX(0); } }
  const visible = open && !dismissed;
  const surface = useRef<HTMLDivElement>(null);
  // The drag offset is owned here, so a release hands its velocity straight to the spring home or to the throw.
  const x = useMotionValue(0);
  const releaseVelocity = useRef(0);

  /** Closing tells the parent at once, while the exit plays out here, so a new toast can be raised mid-exit and simply turns back. */
  function dismiss(to: number) {
    setThrowX(to);
    setDismissed(true);
    onOpenChange?.(false);
  }

  useEffect(() => {
    if (!visible || !onOpenChange || duration <= 0) return;
    const timer = window.setTimeout(() => { setThrowX(0); setDismissed(true); onOpenChange(false); }, duration);
    return () => window.clearTimeout(timer);
  }, [visible, onOpenChange, duration]);

  function handleDragEnd(_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    const direction = Math.sign(info.offset.x || info.velocity.x);
    // A short swipe springs back with its release velocity and a slight settle instead of drifting home.
    if (Math.abs(info.offset.x) < swipe.distance && Math.abs(info.velocity.x) < swipe.velocity) {
      animate(x, 0, { type: "spring", stiffness: 420, damping: 34, velocity: info.velocity.x });
      return;
    }
    releaseVelocity.current = info.velocity.x;
    dismiss(direction * ((surface.current?.offsetWidth ?? 320) + 48));
  }

  const variants: Variants = reduce ? {
    hidden: { opacity: 0 },
    shown: { opacity: 1, transition: { duration: motionTokens.duration.instant } },
    exit: fadeOut,
  } : {
    // x resets here because the drag value outlives a thrown toast; the next one must rise from the center.
    hidden: { opacity: 0, x: 0, y: 16, scale: .96 },
    // x returns to center too, in case the toast is raised again while a throw is still leaving.
    shown: { opacity: 1, x: 0, y: 0, scale: 1, transition: { ...motionTokens.spring.morph, opacity: enter } },
    // A thrown toast keeps its release velocity; a closed one sinks back toward the edge it came from.
    // The throw settles loosely: it is invisible once the fade ends, so no long unseen tail keeps it mounted.
    exit: (to: number) => to
      ? { x: to, opacity: 0, transition: { x: { type: "spring", visualDuration: .3, bounce: 0, velocity: releaseVelocity.current, restDelta: 2, restSpeed: 40 }, opacity: { duration: motionTokens.duration.exit } } }
      : { opacity: 0, y: 8, scale: .97, transition: { duration: motionTokens.duration.exit, ease: [...motionTokens.ease.standard] } },
  };
  const swap: MotionProps = { initial: reduce ? { opacity: 0 } : textIn, animate: textShown, exit: reduce ? fadeOut : textOut, transition: reduce ? { duration: motionTokens.duration.instant } : enter };

  return (
    <AnimatePresence initial={enterOnMount} custom={throwX}>
      {visible && <motion.div
        key="toast"
        ref={surface}
        className={styles.toast}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        custom={throwX}
        variants={variants}
        initial="hidden"
        animate="shown"
        exit="exit"
        style={{ x }}
        // Drag writes touch-action into the markup, so the reduced motion switch waits for hydration to keep server and client in step.
        drag={reduce && hydrated ? false : "x"}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
      >
        <span className={styles.icon} aria-hidden="true">
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round">
            <motion.path d="M4 12.5l5 5L20 6.5" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter], delay: .12 }} />
          </svg>
        </span>
        {/* The copy column follows its content height, so a longer message grows the toast instead of snapping it. */}
        <HeightFrame reduce={reduce} morphKey={`${title}\n${description ?? ""}`}>
          <strong className={styles.title}><AnimatePresence mode="popLayout" initial={false}><Swap key={title} className={styles.line} {...swap}>{title}</Swap></AnimatePresence></strong>
          <AnimatePresence mode="popLayout" initial={false}>{description ? <Swap key={description} className={styles.description} {...swap}>{description}</Swap> : null}</AnimatePresence>
        </HeightFrame>
        <button
          className={styles.close}
          type="button"
          aria-label="Dismiss notification"
          onClick={() => dismiss(0)}
        >
          <X width={16} height={16} strokeWidth={2} aria-hidden="true" />
        </button>
      </motion.div>}
    </AnimatePresence>
  );
}
