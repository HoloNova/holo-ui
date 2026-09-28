"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ComponentPropsWithoutRef, ReactNode, RefObject } from "react";
import type { PanInfo, Transition } from "motion/react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

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
const ARC_DRAWER_STYLES = `.arc-drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: oklch(10% 0 0 / .38);
  backdrop-filter: blur(4px);
}

.arc-drawer-content {
  --drawer-size: min(30rem, calc(100vw - var(--space-4)));
  /* Critically damped, like a sheet spring: it never overshoots past the edge it is anchored to. */
  --ease-drawer: cubic-bezier(.32,.72,0,1);
  --drawer-from: translateX(100%);
  position: fixed;
  z-index: 51;
  display: flex;
  flex-direction: column;
  width: var(--drawer-size);
  max-width: 100vw;
  max-height: 100dvh;
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--surface-raised);
  color: var(--foreground);
  box-shadow: var(--shadow-floating);
}
/* While a layer leaves it lets clicks through, so pressing the trigger again during the close reopens the drawer from wherever it is. */
/* Radix writes pointer-events inline on the overlay, so the closing state has to win over it. */
.arc-drawer-overlay[data-state="closed"], .arc-drawer-content[data-state="closed"] { pointer-events: none !important; }

.arc-drawer-content[data-side="right"] { inset: 0 0 0 auto; border-width: 1px 0 1px 1px; border-radius: 22px 0 0 22px; }
.arc-drawer-content[data-side="left"] { inset: 0 auto 0 0; border-width: 1px 1px 1px 0; border-radius: 0 22px 22px 0; }
.arc-drawer-content[data-side="top"] { inset: 0 0 auto; width: 100%; max-width: none; max-height: min(32rem, 100dvh); border-width: 0 0 1px; border-radius: 0 0 22px 22px; }
.arc-drawer-content[data-side="bottom"] { inset: auto 0 0; width: 100%; max-width: none; max-height: min(32rem, 100dvh); border-width: 1px 0 0; border-radius: 22px 22px 0 0; }
.arc-drawer-content[data-side="bottom"]::before { position: absolute; top: 9px; left: 50%; width: 2.25rem; height: 4px; border-radius: var(--radius-pill); background: var(--border-strong); content: ""; opacity: .75; transform: translateX(-50%); }

/* Motion springs the panel from its edge. Keyframes only run when DrawerContent sits under a bare Radix root. */
.arc-drawer-content[data-side="left"] { --drawer-from: translateX(-100%); }
.arc-drawer-content[data-side="top"] { --drawer-from: translateY(-100%); }
.arc-drawer-content[data-side="bottom"] { --drawer-from: translateY(100%); }
.arc-drawer-keyframes.overlay[data-state="open"] { animation: overlay-in var(--duration-standard) var(--ease-enter) both; }
.arc-drawer-keyframes.overlay[data-state="closed"] { animation: overlay-out var(--duration-fast) var(--ease-standard) both; }
.arc-drawer-keyframes.content[data-state="open"] { animation: drawer-in var(--duration-considered) var(--ease-drawer) both; }
.arc-drawer-keyframes.content[data-state="closed"] { animation: drawer-out var(--duration-standard) var(--ease-standard) both; }
.arc-drawer-content:focus { outline: none; }
/* Inside a container the layers anchor to that element instead of the viewport. */
.arc-drawer-overlay[data-contained], .arc-drawer-content[data-contained] { position: absolute; }
.arc-drawer-overlay[data-contained] { z-index: 1; background: oklch(10% 0 0 / .16); backdrop-filter: none; }
.arc-drawer-content[data-contained] { --drawer-size: min(22rem, calc(100% - var(--space-8))); z-index: 2; max-height: 100%; box-shadow: none; }
.arc-drawer-content[data-contained][data-side="top"], .arc-drawer-content[data-contained][data-side="bottom"] { max-height: min(32rem, calc(100% - var(--space-8))); }
/* The container already draws the outer edges, so only the inner edge keeps a border. */
.arc-drawer-content[data-contained][data-side] { border-width: 0; }
.arc-drawer-content[data-contained][data-side="right"] { border-left-width: 1px; }
.arc-drawer-content[data-contained][data-side="left"] { border-right-width: 1px; }
.arc-drawer-content[data-contained][data-side="top"] { border-bottom-width: 1px; }
.arc-drawer-content[data-contained][data-side="bottom"] { border-top-width: 1px; }

.arc-drawer-header { display: flex; flex: 0 0 auto; align-items: flex-start; justify-content: space-between; gap: var(--space-5); padding: var(--space-6); border-bottom: 1px solid var(--border); }
/* The header doubles as the drag handle, so touch drags move the panel instead of the page. */
.arc-drawer-handle { touch-action: none; user-select: none; }
.arc-drawer-content[data-side="bottom"] .arc-drawer-handle, .arc-drawer-content[data-side="top"] .arc-drawer-handle { cursor: grab; }
.arc-drawer-title, .arc-drawer-description { position: relative; }
.arc-drawer-swap { display: block; }
.arc-drawer-title { margin: 0; font-family: var(--font-body); font-size: var(--text-lg); font-weight: 500; letter-spacing: var(--tracking-body); line-height: var(--leading-body); }
.arc-drawer-description { max-width: 32rem; margin: var(--space-2) 0 0; color: var(--text-secondary); font-size: var(--text-sm); line-height: var(--leading-body); }
.arc-drawer-close { display: grid; flex: 0 0 auto; width: var(--space-8); height: var(--space-8); place-items: center; border: 1px solid var(--border); border-radius: var(--radius-control); background: color-mix(in oklch, var(--surface-muted) 65%, transparent); color: var(--text-secondary); cursor: pointer; transition: background-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard), transform var(--duration-spring) var(--ease-spring); }
@media (hover: hover) and (pointer: fine) { .arc-drawer-close:hover { background: var(--surface-muted); color: var(--foreground); } }
.arc-drawer-close:active { transform: scale(.96); transition: background-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard), transform 100ms var(--ease-standard); }
.arc-drawer-body { min-height: 0; overflow: auto; padding: var(--space-6); font-size: var(--text-sm); line-height: var(--leading-body); overscroll-behavior: contain; scrollbar-width: thin; }

@media (max-width: 40rem) {
  .arc-drawer-content { --drawer-size: calc(100vw - var(--space-3)); }
  .arc-drawer-content[data-side="right"] { border-radius: 18px 0 0 18px; }
  .arc-drawer-content[data-side="left"] { border-radius: 0 18px 18px 0; }
  .arc-drawer-content[data-side="top"] { border-radius: 0 0 18px 18px; }
  .arc-drawer-content[data-side="bottom"] { border-radius: 18px 18px 0 0; }
  .arc-drawer-header, .arc-drawer-body { padding: var(--space-5); }
}

@keyframes overlay-in { from { opacity: 0; } }
@keyframes overlay-out { to { opacity: 0; } }
@keyframes drawer-in { from { transform: var(--drawer-from); } }
/* The late fade lets the floating shadow leave with the panel instead of popping away at unmount. */
@keyframes drawer-out { 65% { opacity: 1; } to { opacity: 0; transform: var(--drawer-from); } }
@keyframes drawer-fade-in { from { opacity: 0; } }
@keyframes drawer-fade-out { to { opacity: 0; } }

@media (prefers-reduced-motion: reduce) {
  .arc-drawer-keyframes.overlay[data-state="open"] { animation: overlay-in var(--duration-instant) linear both; }
  .arc-drawer-keyframes.overlay[data-state="closed"] { animation: overlay-out 100ms linear both; }
  .arc-drawer-keyframes.content[data-state="open"] { animation: drawer-fade-in var(--duration-instant) linear both; }
  .arc-drawer-keyframes.content[data-state="closed"] { animation: drawer-fade-out 100ms linear both; }
  .arc-drawer-close, .arc-drawer-close:active { transition: none; }
  .arc-drawer-close:active { transform: none; }
}
`;

const styles: Record<string, string> = new Proxy({
  "body": "arc-drawer-body",
  "close": "arc-drawer-close",
  "content": "arc-drawer-content",
  "description": "arc-drawer-description",
  "handle": "arc-drawer-handle",
  "header": "arc-drawer-header",
  "keyframes": "arc-drawer-keyframes",
  "overlay": "arc-drawer-overlay",
  "swap": "arc-drawer-swap",
  "title": "arc-drawer-title"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-drawer-${prop}`,
});



/** Mirrors the open state so the panel can stay mounted while it slides out, retarget mid-flight, and close itself after a drag. */
const DrawerContext = createContext<{ open: boolean; flung: boolean; setOpen: (open: boolean) => void; fling: () => void; openedAt: RefObject<number> } | null>(null);

export function Drawer({ open: openProp, defaultOpen = false, onOpenChange, ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Root>) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  // A drag that dismisses the panel hands its velocity to the exit spring; every other close uses the shorter tween.
  const [flung, setFlung] = useState(false);
  // When the drawer last opened, so a click that reopens it mid-close is not also read as a click outside the leaving panel.
  const openedAt = useRef(0);
  const open = openProp ?? uncontrolled;
  const setOpen = useCallback((next: boolean) => {
    setFlung(false);
    if (next) openedAt.current = performance.now();
    if (openProp === undefined) setUncontrolled(next);
    onOpenChange?.(next);
  }, [openProp, onOpenChange]);
  const fling = useCallback(() => { setOpen(false); setFlung(true); }, [setOpen]);
  const value = useMemo(() => ({ open, flung, setOpen, fling, openedAt }), [open, flung, setOpen, fling]);
  return <DrawerContext.Provider value={value}><DialogPrimitive.Root {...props} open={open} onOpenChange={setOpen} /></DrawerContext.Provider>;
}

export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerClose = DialogPrimitive.Close;

export interface DrawerContentProps
  extends ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  title: string;
  description?: string;
  children: ReactNode;
  side?: "left" | "right" | "top" | "bottom";
  /** Renders the drawer inside this element instead of the page body, anchored to its edges. The element needs position: relative and overflow: hidden. */
  container?: HTMLElement | null;
}

const fade: Transition = { duration: motionTokens.duration.instant };
/* A click or Escape returns the panel quickly; a flick keeps its velocity in a spring of the same length. The shadow fades over the last stretch so it leaves with the panel instead of popping away at unmount. */
const shadowOut: Transition = { duration: motionTokens.duration.standard, times: [0, .65, 1], ease: "linear" };
const leave: Transition = { default: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.standard] }, opacity: shadowOut };
const flingOut: Transition = { default: { ...motionTokens.spring.smooth, visualDuration: motionTokens.duration.standard }, opacity: shadowOut };

/** When the title or description changes while open, the new copy rises in and the old copy leaves upward. */
function SwapText({ text }: { text: string }) {
  const reduced = useReducedMotion();
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={text}
        className={styles.swap}
        initial={reduced ? false : { opacity: 0, y: "0.3em", filter: `blur(${motionTokens.blur.soft}px)` }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: "-0.3em", filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: 0.15, ease: [...motionTokens.ease.standard] } }}
        transition={{ duration: 0.24, ease: [...motionTokens.ease.enter] }}
      >
        {text}
      </motion.span>
    </AnimatePresence>
  );
}

export function DrawerContent({
  title,
  description,
  children,
  side = "right",
  container,
  className,
  onInteractOutside,
  ...props
}: DrawerContentProps) {
  const drawer = useContext(DrawerContext);
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const offset = useMotionValue<number | string>(0);
  const pan = useRef<number | null>(null);
  const axis = side === "left" || side === "right" ? "x" : "y";
  const sign = side === "right" || side === "bottom" ? 1 : -1;
  const offscreen = { [axis]: `${sign * 100}%` };
  const classes = [styles.content, className].filter(Boolean).join(" ");
  const draggable = drawer !== null && !reduced;

  const panelSize = () => (axis === "x" ? panelRef.current?.offsetWidth : panelRef.current?.offsetHeight) ?? 480;

  // The header is the grab handle. It follows the pointer toward the edge and rubber-bands the other way.
  function panStart(event: PointerEvent) {
    const target = event.target instanceof Element ? event.target : null;
    if (!draggable || target?.closest("button, a, input, select, textarea, [role='button']")) return;
    // The entrance animates in percent of the panel, so a grab mid-flight converts it to pixels.
    const value = offset.get();
    pan.current = typeof value === "number" ? value : parseFloat(value) / 100 * panelSize();
    offset.stop();
  }
  function panMove(_: PointerEvent, info: PanInfo) {
    if (pan.current === null) return;
    const toward = (pan.current + info.offset[axis]) * sign;
    offset.set(sign * (toward >= 0 ? toward : -Math.sqrt(-toward)));
  }
  // Past a third of the panel, or on a quick flick toward the edge, the drawer closes and keeps its velocity; otherwise it springs back.
  function panEnd(_: PointerEvent, info: PanInfo) {
    if (pan.current === null) return;
    pan.current = null;
    const toward = Number(offset.get()) * sign;
    if (toward > panelSize() / 3 || (toward > 0 && info.velocity[axis] * sign > 500)) drawer?.fling();
    else animate(offset, 0, motionTokens.spring.snappy);
  }

  const inner = <>
    <motion.div className={[styles.header, draggable ? styles.handle : ""].filter(Boolean).join(" ")} onPanStart={panStart} onPan={panMove} onPanEnd={panEnd}>
      <div>
        <DialogPrimitive.Title className={styles.title}><SwapText text={title} /></DialogPrimitive.Title>
        {description ? (
          <DialogPrimitive.Description className={styles.description}>
            <SwapText text={description} />
          </DialogPrimitive.Description>
        ) : null}
      </div>
      <DialogPrimitive.Close className={styles.close} aria-label="Close drawer">
        <X size={18} strokeWidth={1.8} aria-hidden="true" />
      </DialogPrimitive.Close>
    </motion.div>
    <div className={styles.body}>{children}</div>
  </>;

  // Under a bare Radix root the open state is unknown here, so CSS keyframes keyed off data-state animate the layers instead.
  if (drawer === null) {
    return (
      <DialogPrimitive.Portal container={container}>
        <DialogPrimitive.Overlay className={`${styles.overlay} ${styles.keyframes}`} data-contained={container ? "" : undefined} />
        <DialogPrimitive.Content {...props} onInteractOutside={onInteractOutside} data-side={side} data-contained={container ? "" : undefined} className={`${classes} ${styles.keyframes}`}>{inner}</DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    );
  }

  // The panel springs fully opaque from its own edge and returns to it faster than it arrived, from wherever it is.
  return (
    <AnimatePresence custom={drawer.flung}>
      {drawer.open && (
        <DialogPrimitive.Portal key="drawer" forceMount container={container}>
          <DialogPrimitive.Overlay asChild forceMount>
            <motion.div
              className={styles.overlay}
              data-contained={container ? "" : undefined}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: reduced ? fade : { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } }}
              transition={reduced ? fade : { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }}
            />
          </DialogPrimitive.Overlay>
          <DialogPrimitive.Content
            {...props}
            asChild
            forceMount
            // Radix reads a click outside on click, so the press that reopens a closing drawer would dismiss it again.
            onInteractOutside={event => {
              onInteractOutside?.(event);
              if (event.detail.originalEvent.timeStamp < drawer.openedAt.current) event.preventDefault();
            }}
          >
            <motion.div
              ref={panelRef}
              className={classes}
              data-side={side}
              data-contained={container ? "" : undefined}
              style={{ [axis]: offset }}
              variants={{ exit: (flung: boolean) => reduced ? { opacity: 0, transition: fade } : { ...offscreen, opacity: [1, 1, 0], transition: flung ? flingOut : leave } }}
              initial={reduced ? { opacity: 0 } : { ...offscreen, opacity: 1 }}
              animate={reduced ? { opacity: 1 } : { [axis]: 0, opacity: 1 }}
              exit="exit"
              transition={reduced ? fade : motionTokens.spring.smooth}
            >
              {inner}
            </motion.div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

export default Drawer;
