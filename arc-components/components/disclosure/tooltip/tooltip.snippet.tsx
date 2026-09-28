"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ReactElement, ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";

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
const ARC_TOOLTIP_STYLES = `.arc-tooltip-tooltip { --tooltip-y: 3px; z-index: 50; max-width: 15rem; padding: var(--space-3) var(--space-4); border: 1px solid color-mix(in oklch, var(--background) 14%, var(--foreground)); border-radius: var(--radius-control); background: var(--foreground); color: var(--background); box-shadow: var(--shadow-raised); font-size: var(--text-sm); font-weight: 400; line-height: var(--leading-body); transform-origin: var(--radix-tooltip-content-transform-origin); transition: opacity var(--duration-fast) var(--ease-enter), transform var(--duration-fast) var(--ease-enter); }
.arc-tooltip-tooltip[data-side="bottom"] { --tooltip-y: -3px; }
/* The first tooltip waits, then rises a few pixels from its trigger. Within the skip window the next one only fades.
   Transitions instead of keyframes, so returning to the trigger while it fades out reverses the fade instead of restarting it. */
@starting-style {
  .arc-tooltip-tooltip[data-state$="-open"] { opacity: 0; transform: translateY(var(--tooltip-y)) scale(.97); }
  .arc-tooltip-tooltip[data-instant][data-state$="-open"] { transform: none; }
}
.arc-tooltip-tooltip[data-instant][data-state$="-open"] { transition: opacity 90ms var(--ease-standard), transform 90ms var(--ease-standard); }
/* Radix unmounts when the exit animation ends, so a no-op keyframe times the exit while the transition does the visual work. */
.arc-tooltip-tooltip[data-state="closed"] { opacity: 0; transform: scale(.98); transition: opacity 110ms var(--ease-standard), transform 110ms var(--ease-standard); animation: tooltip-exit 110ms linear both; }
.arc-tooltip-text { position: relative; display: block; overflow: clip; overflow-clip-margin: var(--space-2); }
.arc-tooltip-measure { position: absolute; top: 0; left: 0; width: max-content; max-width: calc(15rem - 2 * var(--space-4) - 2px); visibility: hidden; pointer-events: none; }
.arc-tooltip-line { display: block; width: max-content; max-width: calc(15rem - 2 * var(--space-4) - 2px); }
@keyframes tooltip-exit { to { --tooltip-exit: 1; } }
@media (prefers-reduced-motion: reduce) {
  .arc-tooltip-tooltip, .arc-tooltip-tooltip[data-state="closed"], .arc-tooltip-tooltip[data-instant][data-state$="-open"] { transform: none; transition: opacity 90ms linear; }
}
`;

const styles: Record<string, string> = new Proxy({
  "line": "arc-tooltip-line",
  "measure": "arc-tooltip-measure",
  "text": "arc-tooltip-text",
  "tooltip": "arc-tooltip-tooltip"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-tooltip-${prop}`,
});



export interface TooltipProps {
  content: ReactNode;
  children: ReactElement;
  side?: "top" | "bottom";
}

const DELAY = 250;
const SKIP_WINDOW = 300;

/* Every Tooltip brings its own provider, so the skip window is shared here: while any tooltip is open, and briefly after the last one closes, the next opens without delay or travel. */
let warm = false;
let openCount = 0;
let coolTimer = 0;
const listeners = new Set<() => void>();
const warmth = {
  subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
  get: () => warm,
  set(next: boolean) { if (warm === next) return; warm = next; listeners.forEach(listener => listener()); },
  opened() { openCount += 1; window.clearTimeout(coolTimer); warmth.set(true); },
  closed() { openCount = Math.max(0, openCount - 1); if (openCount) return; window.clearTimeout(coolTimer); coolTimer = window.setTimeout(() => warmth.set(false), SKIP_WINDOW); },
};

/** String content crossfades when it changes while open, and the bubble springs to the new text size. */
function TooltipText({ text }: { text: string }) {
  const reduced = useReducedMotion();
  const measure = useRef<HTMLSpanElement>(null);
  const measured = useRef<string | null>(null);
  const [size, setSize] = useState<{ width: number; height: number; animate: boolean } | null>(null);
  useLayoutEffect(() => {
    const node = measure.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      const box = entry.borderBoxSize?.[0];
      const current = node.textContent;
      const animate = measured.current !== null && measured.current !== current;
      measured.current = current;
      setSize({ width: Math.ceil(box?.inlineSize ?? node.offsetWidth), height: Math.ceil(box?.blockSize ?? node.offsetHeight), animate });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <motion.span className={styles.text} initial={false} animate={size ? { width: size.width, height: size.height } : undefined} transition={size?.animate && !reduced ? motionTokens.spring.morph : { duration: 0 }}>
    <span ref={measure} className={styles.measure} aria-hidden="true">{text}</span>
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span key={text} className={styles.line} initial={reduced ? false : { opacity: 0, y: "0.3em", filter: `blur(${motionTokens.blur.soft}px)` }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: "-0.3em", filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: .14, ease: [...motionTokens.ease.standard] } }} transition={{ duration: .22, ease: [...motionTokens.ease.enter] }}>{text}</motion.span>
    </AnimatePresence>
  </motion.span>;
}

export function Tooltip({ content, children, side = "top" }: TooltipProps) {
  const isWarm = useSyncExternalStore(warmth.subscribe, warmth.get, () => false);
  // Controlled so the instant flag lands in the same render that mounts the content (Radix reports uncontrolled changes a frame late).
  const [open, setOpen] = useState(false);
  const [instant, setInstant] = useState(false);
  useEffect(() => {
    if (!open) return;
    warmth.opened();
    return warmth.closed;
  }, [open]);
  return <TooltipPrimitive.Provider delayDuration={DELAY} skipDelayDuration={0}>
    <TooltipPrimitive.Root open={open} delayDuration={isWarm ? 0 : DELAY} onOpenChange={next => { if (next) setInstant(warmth.get()); setOpen(next); }}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content className={styles.tooltip} data-instant={instant || undefined} side={side} sideOffset={8} collisionPadding={12}>
          {typeof content === "string" || typeof content === "number" ? <TooltipText text={String(content)}/> : content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  </TooltipPrimitive.Provider>;
}

export default Tooltip;
