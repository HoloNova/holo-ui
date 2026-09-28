"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { Transition } from "motion/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { createContext, useCallback, useContext, useLayoutEffect, useRef, useState } from "react";

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
const ARC_DIALOG_STYLES = `.arc-dialog-overlay { position: fixed; inset: 0; z-index: 50; background: oklch(10% 0 0 / .46); backdrop-filter: blur(7px); }
/* Centered with auto margins (like a native modal dialog) so transform stays free for the entrance spring. */
.arc-dialog-content { position: fixed; z-index: 51; inset: 0; width: min(calc(100vw - var(--space-8)), 440px); height: fit-content; max-height: calc(100vh - var(--space-8)); margin: auto; overflow: auto; border: 1px solid var(--border); border-radius: var(--radius-surface); background: var(--surface-raised); color: var(--foreground); box-shadow: var(--shadow-floating); }
/* Motion animates both layers. Keyframes only run when DialogContent sits under a bare Radix root. */
.arc-dialog-keyframes.overlay[data-state="open"] { animation: overlay-in var(--duration-standard) var(--ease-enter) both; }
.arc-dialog-keyframes.overlay[data-state="closed"] { animation: overlay-out var(--duration-fast) var(--ease-standard) both; }
.arc-dialog-keyframes.content[data-state="open"] { animation: content-fade-in var(--duration-fast) var(--ease-enter) both, content-rise-in var(--duration-spring) var(--ease-spring) both; }
.arc-dialog-keyframes.content[data-state="closed"] { animation: content-out 150ms var(--ease-standard) both; }
.arc-dialog-content:focus { outline: none; }
/* While the layers leave, clicks pass through, so the trigger can reopen the dialog mid-exit. Radix sets pointer-events inline on the overlay. */
.arc-dialog-overlay[data-state="closed"], .arc-dialog-content[data-state="closed"] { pointer-events: none !important; }
.arc-dialog-header { display: flex; justify-content: space-between; align-items: flex-start; gap: var(--space-5); padding: var(--space-6); border-bottom: 1px solid var(--border); }
.arc-dialog-title { margin: 0; font-family: var(--font-body); font-size: var(--text-lg); font-weight: 500; letter-spacing: var(--tracking-body); line-height: var(--leading-body); }
.arc-dialog-description { margin: var(--space-2) 0 0; color: var(--text-secondary); font-size: var(--text-sm); line-height: var(--leading-body); }
.arc-dialog-title, .arc-dialog-description { position: relative; }
.arc-dialog-swap { display: block; }
/* A compact icon button: quick press, spring release. */
.arc-dialog-close { flex: 0 0 auto; display: grid; place-items: center; width: var(--space-8); height: var(--space-8); border: 1px solid var(--border); border-radius: var(--radius-control); background: color-mix(in oklch, var(--surface-muted) 50%, transparent); color: var(--text-secondary); cursor: pointer; transition: background-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard), transform var(--duration-spring) var(--ease-spring); }
@media (hover: hover) and (pointer: fine) { .arc-dialog-close:hover { background: var(--surface-muted); color: var(--foreground); } }
.arc-dialog-close:active { transform: scale(.96); transition: background-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard), transform 100ms var(--ease-standard); }
.arc-dialog-close:focus-visible { outline: 3px solid var(--focus-ring); outline-offset: 3px; }
.arc-dialog-body { padding: var(--space-6); font-size: var(--text-sm); line-height: var(--leading-body); }
@keyframes overlay-in { from { opacity: 0; } }
@keyframes overlay-out { to { opacity: 0; } }
@keyframes content-fade-in { from { opacity: 0; } }
@keyframes content-rise-in { from { transform: translateY(8px) scale(.96); } }
@keyframes content-out { to { opacity: 0; transform: translateY(4px) scale(.98); } }
@keyframes content-fade-out { to { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .arc-dialog-keyframes.overlay[data-state="open"], .arc-dialog-keyframes.content[data-state="open"] { animation: overlay-in var(--duration-instant) linear both; }
  .arc-dialog-keyframes.overlay[data-state="closed"] { animation: overlay-out 100ms linear both; }
  .arc-dialog-keyframes.content[data-state="closed"] { animation: content-fade-out 100ms linear both; }
  .arc-dialog-close, .arc-dialog-close:active { transition: none; }
  .arc-dialog-close:active { transform: none; }
}
`;

const styles: Record<string, string> = new Proxy({
  "body": "arc-dialog-body",
  "close": "arc-dialog-close",
  "content": "arc-dialog-content",
  "description": "arc-dialog-description",
  "header": "arc-dialog-header",
  "keyframes": "arc-dialog-keyframes",
  "overlay": "arc-dialog-overlay",
  "swap": "arc-dialog-swap",
  "title": "arc-dialog-title"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-dialog-${prop}`,
});



/** Mirrors the open state so the content can stay mounted while it animates out, and retarget mid-flight if it is reopened or closed early. */
const OpenContext = createContext<boolean | null>(null);

export function Dialog({ open: openProp, defaultOpen = false, onOpenChange, ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Root>) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const open = openProp ?? uncontrolled;
  const setOpen = useCallback((next: boolean) => { if (openProp === undefined) setUncontrolled(next); onOpenChange?.(next); }, [openProp, onOpenChange]);
  return <OpenContext.Provider value={open}><DialogPrimitive.Root {...props} open={open} onOpenChange={setOpen}/></OpenContext.Provider>;
}

export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export interface DialogContentProps extends ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  title: string;
  description?: string;
  children: ReactNode;
}

const fade: Transition = { duration: motionTokens.duration.instant };
const leave: Transition = { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] };

/** When the title or description changes while open, the new copy rises in and the old copy leaves upward. */
function SwapText({ text }: { text: string }) {
  const reduced = useReducedMotion();
  return <AnimatePresence mode="popLayout" initial={false}>
    <motion.span key={text} className={styles.swap} initial={reduced ? false : { opacity: 0, y: "0.3em", filter: `blur(${motionTokens.blur.soft}px)` }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: "-0.3em", filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: .15, ease: [...motionTokens.ease.standard] } }} transition={{ duration: .24, ease: [...motionTokens.ease.enter] }}>{text}</motion.span>
  </AnimatePresence>;
}

export function DialogContent({ title, description, children, className, onPointerDownOutside, ...props }: DialogContentProps) {
  const open = useContext(OpenContext);
  const reduced = useReducedMotion();
  // When the open state last changed. Radix waits for the click before treating a press as outside, and a press on the trigger
  // while the dialog leaves reopens it first, so that press must not close it again.
  const change = useRef({ open, at: 0 });
  useLayoutEffect(() => { change.current = { open, at: performance.now() }; }, [open]);
  const pressOutside: DialogContentProps["onPointerDownOutside"] = event => {
    onPointerDownOutside?.(event);
    if (open !== null && (!change.current.open || event.detail.originalEvent.timeStamp < change.current.at)) event.preventDefault();
  };
  const classes = [styles.content, className].filter(Boolean).join(" ");
  const inner = <>
    <div className={styles.header}><div><DialogPrimitive.Title className={styles.title}><SwapText text={title}/></DialogPrimitive.Title>{description ? <DialogPrimitive.Description className={styles.description}><SwapText text={description}/></DialogPrimitive.Description> : null}</div><DialogPrimitive.Close className={styles.close} aria-label="Close dialog"><X width={18} height={18} aria-hidden="true"/></DialogPrimitive.Close></div>
    <div className={styles.body}>{children}</div>
  </>;
  // Under a bare Radix root the open state is unknown here, so CSS keyframes keyed off data-state animate the layers instead.
  if (open === null) return <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className={`${styles.overlay} ${styles.keyframes}`}/>
    <DialogPrimitive.Content {...props} onPointerDownOutside={pressOutside} className={`${classes} ${styles.keyframes}`}>{inner}</DialogPrimitive.Content>
  </DialogPrimitive.Portal>;
  // The overlay fades while the dialog rises 8px and scales up on a spring. Closing is shorter and quieter, and starts from wherever the entrance is.
  return <AnimatePresence>
    {open && <DialogPrimitive.Portal key="dialog" forceMount>
      <DialogPrimitive.Overlay asChild forceMount><motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: reduced ? fade : leave }} transition={reduced ? fade : { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }}/></DialogPrimitive.Overlay>
      <DialogPrimitive.Content {...props} onPointerDownOutside={pressOutside} asChild forceMount>
        <motion.div className={classes} initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduced ? { opacity: 0, transition: fade } : { opacity: 0, y: 4, scale: .98, transition: leave }} transition={reduced ? fade : { default: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] } }}>{inner}</motion.div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>}
  </AnimatePresence>;
}
