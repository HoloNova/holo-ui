"use client";

import type { AnimationPlaybackControls, Transition, Variants } from "motion/react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode, Ref } from "react";
import { AnimatePresence, animate, motion, useIsPresent, useMotionValue, useReducedMotion } from "motion/react";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useId, useImperativeHandle, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";

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
const ARC_CONFIRM_MORPH_STYLES = `/* The root holds the control in the flow of the page; the surface inside it springs between faces. */
.arc-confirm-morph-root {
  position: relative;
  display: inline-flex;
  min-width: 0;
  max-width: 100%;
  vertical-align: middle;
  color: var(--foreground);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  letter-spacing: -0.005em;
  line-height: 1;
  -webkit-tap-highlight-color: transparent;
}

/* One pill for every state. The current face sits in the flow and centres itself; the border is an overlay so it never changes a measurement. */
.arc-confirm-morph-surface {
  position: relative;
  display: flex;
  height: var(--control-height-sm);
  max-width: 100%;
  justify-content: center;
  overflow: clip;
  border-radius: var(--radius-pill);
  background: var(--surface-raised);
  box-shadow: var(--shadow-resting);
  /* Release springs back; the press itself is quick (below). */
  transition: background-color var(--duration-standard) var(--ease-standard), box-shadow var(--duration-standard) var(--ease-standard), transform var(--duration-spring) var(--ease-spring);
}
.arc-confirm-morph-surface::after { content: ""; position: absolute; inset: 0; border: 1px solid var(--border); border-radius: inherit; pointer-events: none; transition: border-color var(--duration-standard) var(--ease-standard); }
/* Danger: a quiet red tint at rest that deepens while asking. */
.arc-confirm-morph-root[data-tone="danger"] .arc-confirm-morph-surface { background: color-mix(in oklch, var(--danger) 5%, var(--surface-raised)); box-shadow: none; }
.arc-confirm-morph-root[data-tone="danger"] .arc-confirm-morph-surface::after { border-color: color-mix(in oklch, var(--danger) 18%, var(--border)); }
.arc-confirm-morph-root[data-tone="danger"][data-state="confirming"] .arc-confirm-morph-surface { background: color-mix(in oklch, var(--danger) 10%, var(--surface-raised)); box-shadow: 0 4px 14px color-mix(in oklch, var(--danger) 12%, transparent); }
.arc-confirm-morph-root[data-tone="danger"][data-state="confirming"] .arc-confirm-morph-surface::after { border-color: color-mix(in oklch, var(--danger) 34%, var(--border)); }
.arc-confirm-morph-root[data-tone="danger"]:is([data-state="pending"], [data-state="done"]) .arc-confirm-morph-surface { background: var(--surface-raised); box-shadow: var(--shadow-resting); }
.arc-confirm-morph-root[data-tone="danger"]:is([data-state="pending"], [data-state="done"]) .arc-confirm-morph-surface::after { border-color: var(--border); }
.arc-confirm-morph-root[data-disabled][data-state="idle"] .arc-confirm-morph-surface { background: var(--surface-raised); box-shadow: none; }
.arc-confirm-morph-root[data-disabled][data-state="idle"] .arc-confirm-morph-surface::after { border-color: var(--border-subtle); }
.arc-confirm-morph-root:has(.arc-confirm-morph-trigger:active:not(:disabled)) .arc-confirm-morph-surface { transform: scale(.96); transition-duration: var(--duration-standard), var(--duration-standard), 90ms; transition-timing-function: var(--ease-standard), var(--ease-standard), ease-out; }

.arc-confirm-morph-face { display: flex; min-width: 0; height: 100%; flex: 0 1 auto; align-items: center; gap: 2px; padding: 0 4px; white-space: nowrap; will-change: transform, filter; }
.arc-confirm-morph-face[data-face="idle"] { padding: 0; }
/* A leaving face steps out of the flow and stays centred while the surface springs to the next one. */
.arc-confirm-morph-face[inert] { position: absolute; top: 0; left: 50%; translate: -50% 0; pointer-events: none; }

.arc-confirm-morph-trigger {
  display: inline-flex;
  height: 100%;
  align-items: center;
  gap: 8px;
  padding: 0 15px 0 13px;
  border: 0;
  border-radius: inherit;
  background: transparent;
  color: var(--foreground);
  cursor: pointer;
  font: inherit;
  font-weight: 500;
  transition: background-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard);
}
.arc-confirm-morph-face[data-face="idle"] { border-radius: var(--radius-pill); }
.arc-confirm-morph-root[data-tone="danger"] .arc-confirm-morph-trigger { color: var(--danger); }
.arc-confirm-morph-trigger:disabled { color: var(--text-muted) !important; cursor: not-allowed; }
.arc-confirm-morph-trigger:disabled .arc-confirm-morph-icon { opacity: .7; }
.arc-confirm-morph-icon { display: grid; width: 16px; height: 16px; place-items: center; }
.arc-confirm-morph-icon > svg { width: 16px; height: 16px; }

.arc-confirm-morph-prompt { min-width: 3ch; flex: 0 1 auto; max-width: 16rem; overflow: hidden; padding: 0 6px 0 11px; color: var(--foreground); font-weight: 500; font-variant-numeric: tabular-nums; line-height: 1.3; text-overflow: ellipsis; }

.arc-confirm-morph-secondary,
.arc-confirm-morph-primary {
  display: inline-flex;
  flex: none;
  height: calc(var(--control-height-sm) - 8px);
  align-items: center;
  padding: 0 11px;
  border: 0;
  border-radius: var(--radius-pill);
  cursor: pointer;
  font: inherit;
  font-weight: 500;
  transition: background-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard), transform var(--duration-spring) var(--ease-spring);
}
.arc-confirm-morph-secondary { background: transparent; color: var(--text-secondary); }
.arc-confirm-morph-root[data-tone="danger"][data-state="confirming"] .arc-confirm-morph-secondary { color: color-mix(in oklch, var(--danger) 30%, var(--text-secondary)); }
.arc-confirm-morph-face:is([data-face="done"], [data-face="error"]) .arc-confirm-morph-secondary { color: var(--foreground); }
.arc-confirm-morph-primary { background: var(--foreground); color: var(--background); }
.arc-confirm-morph-root[data-tone="danger"] .arc-confirm-morph-primary { background: var(--danger); box-shadow: inset 0 1px 0 color-mix(in oklch, white 18%, transparent), 0 1px 2px color-mix(in oklch, var(--danger) 30%, transparent); }
.arc-confirm-morph-secondary:active,
.arc-confirm-morph-primary:active { transform: scale(.95); transition-duration: var(--duration-fast), var(--duration-fast), 90ms; }

.arc-confirm-morph-status { display: inline-flex; align-items: center; gap: 7px; padding: 0 8px 0 10px; color: var(--foreground); font-weight: 500; font-variant-numeric: tabular-nums; }
.arc-confirm-morph-status > svg { flex: none; }
.arc-confirm-morph-status[data-tone="success"] > svg { color: var(--success); }
.arc-confirm-morph-face[data-face="done"]:not(:has(.arc-confirm-morph-secondary)) .arc-confirm-morph-status { padding-right: 12px; }
.arc-confirm-morph-status[data-tone="danger"] > svg { color: var(--danger); }
.arc-confirm-morph-statusText { line-height: 1.3; }
.arc-confirm-morph-face[data-face="pending"] .arc-confirm-morph-status { padding-inline: 14px 16px; color: var(--text-secondary); }
.arc-confirm-morph-check { width: 18px; height: 18px; }
.arc-confirm-morph-checkDisc { fill: var(--success); }
.arc-confirm-morph-checkTick { stroke: var(--background); }
.arc-confirm-morph-spinner { animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* The timeout: a hairline tucked inside the bottom curve that drains toward the start. It fades in so it never flashes. */

.arc-confirm-morph-srOnly { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }

@media (hover: hover) and (pointer: fine) {
  .arc-confirm-morph-trigger:hover:not(:disabled) { background: color-mix(in oklch, var(--foreground) 5%, transparent); }
  .arc-confirm-morph-root[data-tone="danger"] .arc-confirm-morph-trigger:hover:not(:disabled) { background: color-mix(in oklch, var(--danger) 8%, transparent); }
  .arc-confirm-morph-secondary:hover { background: color-mix(in oklch, var(--foreground) 7%, transparent); color: var(--foreground); }
  .arc-confirm-morph-primary:hover { background: color-mix(in oklch, var(--foreground) 86%, var(--background)); }
  .arc-confirm-morph-root[data-tone="danger"] .arc-confirm-morph-primary:hover { background: color-mix(in oklch, var(--danger) 88%, var(--foreground)); }
}
/* Keyboard focus reads through fill, never a ring. */
.arc-confirm-morph-trigger:focus-visible { background: color-mix(in oklch, var(--foreground) 6%, transparent); }
.arc-confirm-morph-root[data-tone="danger"] .arc-confirm-morph-trigger:focus-visible { background: color-mix(in oklch, var(--danger) 9%, transparent); }
.arc-confirm-morph-secondary:focus-visible { background: color-mix(in oklch, var(--foreground) 8%, transparent); color: var(--foreground); }
.arc-confirm-morph-primary:focus-visible { background: color-mix(in oklch, var(--foreground) 86%, var(--background)); }
.arc-confirm-morph-root[data-tone="danger"] .arc-confirm-morph-primary:focus-visible { background: color-mix(in oklch, var(--danger) 86%, var(--foreground)); }

@media (prefers-reduced-motion: reduce) {
  .arc-confirm-morph-surface, .arc-confirm-morph-trigger, .arc-confirm-morph-secondary, .arc-confirm-morph-primary { transition-duration: 0ms; }
  .arc-confirm-morph-root:has(.arc-confirm-morph-trigger:active) .arc-confirm-morph-surface { transform: none; }
  .arc-confirm-morph-spinner { animation-duration: 1.6s; }
  .arc-confirm-morph-root:has(.arc-confirm-morph-trigger:active) .arc-confirm-morph-surface, .arc-confirm-morph-secondary:active, .arc-confirm-morph-primary:active { transform: none; }
}

@media (prefers-contrast: more) {
  .arc-confirm-morph-surface::after { border-color: var(--border-strong); }
}
`;

const styles: Record<string, string> = new Proxy({
  "check": "arc-confirm-morph-check",
  "checkDisc": "arc-confirm-morph-checkDisc",
  "checkTick": "arc-confirm-morph-checkTick",
  "face": "arc-confirm-morph-face",
  "icon": "arc-confirm-morph-icon",
  "primary": "arc-confirm-morph-primary",
  "prompt": "arc-confirm-morph-prompt",
  "root": "arc-confirm-morph-root",
  "secondary": "arc-confirm-morph-secondary",
  "spinner": "arc-confirm-morph-spinner",
  "srOnly": "arc-confirm-morph-srOnly",
  "status": "arc-confirm-morph-status",
  "statusText": "arc-confirm-morph-statusText",
  "surface": "arc-confirm-morph-surface",
  "trigger": "arc-confirm-morph-trigger"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-confirm-morph-${prop}`,
});



/** Where the control is in its life: resting, asking, working, finished, or failed. */
export type ConfirmMorphState = "idle" | "confirming" | "pending" | "done" | "error";

/**
 * A button for destructive or important actions that asks in place. Pressing it morphs the same surface into an inline
 * question with Cancel and Confirm, then into a spinner, then into a result with Undo. The width springs to each face, so
 * nothing around it jumps. Escape, an outside press, or the timeout all return it to rest.
 * Use it where a modal dialog would be heavy: deleting a selection, revoking access, discarding a draft.
 */
export interface ConfirmMorphProps {
  /** The resting label, such as "Delete". */
  label: ReactNode;
  /** A plain icon before the resting label. */
  icon?: ReactNode;
  /** The question shown while confirming, such as "Delete 3 files?". Defaults to the label with a question mark. */
  prompt?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Shown beside the spinner while `onConfirm` resolves. */
  pendingLabel?: string;
  doneLabel?: string;
  errorLabel?: string;
  retryLabel?: string;
  undoLabel?: string;
  /** Shown beside the spinner while `onUndo` resolves. */
  undoingLabel?: string;
  /** `danger` colours the resting label and the confirm button red. `neutral` uses the foreground for important, reversible actions. */
  tone?: "danger" | "neutral";
  /** Runs on confirm. Return a promise to show the pending face; a rejection shows the error face with Retry. */
  onConfirm?: () => void | Promise<unknown>;
  /** Offering it adds Undo to the result. Return a promise to show a pending face while it runs. */
  onUndo?: () => void | Promise<unknown>;
  onCancel?: () => void;
  /** Controlled state. Pair it with `onStateChange`. */
  state?: ConfirmMorphState;
  /** Starting state when uncontrolled. */
  defaultState?: ConfirmMorphState;
  onStateChange?: (state: ConfirmMorphState) => void;
  /** Milliseconds before an unanswered question returns to rest. Resting the pointer on the control pauses it. 0 turns it off. */
  confirmTimeout?: number;
  /** Milliseconds a result stays before returning to rest. Resting the pointer on the control pauses it. 0 turns it off. */
  resultTimeout?: number;
  /** A press outside the control cancels an open question. Defaults to true. */
  cancelOnOutsidePress?: boolean;
  disabled?: boolean;
  className?: string;
  /** Receives the root element, which also takes focus while the action is pending. */
  ref?: Ref<HTMLDivElement>;
}

const TRAVEL = 12;
const { blur } = motionTokens;
type Bezier = [number, number, number, number];
const enter = [...motionTokens.ease.enter] as Bezier;
const standard = [...motionTokens.ease.standard] as Bezier;
/** Duration springs restated as stiffness and damping so a retarget keeps the velocity already in flight. */
const physical = (visualDuration: number, bounce: number): Transition => {
  const root = 2 * Math.PI / (visualDuration * 1.2);
  return { type: "spring", stiffness: root * root, damping: 2 * (1 - bounce) * root, mass: 1 };
};
const GROW = physical(.44, .18), SHRINK = physical(.34, 0), SLIDE = physical(.36, .06);

const subscribe = () => () => {};
function useReducedFlag() {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  return !!useReducedMotion() && hydrated;
}

/** Forward steps arrive from the right, backward steps from the left; the old face leaves the other way, blurred, so the eye reads one morph. */
const faceVariants: Variants = {
  hidden: (direction: number) => ({ opacity: 0, x: direction * TRAVEL, filter: `blur(${blur.soft}px)` }),
  shown: { opacity: 1, x: 0, filter: "blur(0px)", transition: { x: SLIDE, opacity: { duration: .2, ease: enter, delay: .04 }, filter: { duration: .22, ease: enter, delay: .04 } } },
  gone: (direction: number) => ({ opacity: 0, x: direction * -TRAVEL * .6, filter: `blur(${blur.soft}px)`, transition: { x: SLIDE, opacity: { duration: .12, ease: standard }, filter: { duration: .12, ease: standard } } }),
};
const fadeVariants: Variants = { hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: .14 } }, gone: { opacity: 0, transition: { duration: .1 } } };

function Face({ id, direction, reduced, onSize, children, labelledBy }: { id: ConfirmMorphState; direction: number; reduced: boolean; onSize: (id: ConfirmMorphState, width: number) => void; children: ReactNode; labelledBy?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const present = useIsPresent();
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || !present) return;
    // Measure the natural width, not the width a tight container squeezes the face to, so squeezing never feeds back into the spring.
    const report = () => {
      const flex = node.style.flex;
      node.style.flex = "none";
      const width = node.offsetWidth;
      node.style.flex = flex;
      onSize(id, width);
    };
    report();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(report);
    observer.observe(node);
    return () => observer.disconnect();
  }, [id, onSize, present]);
  return <motion.div ref={ref} className={styles.face} data-face={id} custom={direction} role={labelledBy ? "group" : undefined} aria-labelledby={labelledBy}
    variants={reduced ? fadeVariants : faceVariants} initial="hidden" animate="shown" exit="gone" inert={!present || undefined}>{children}</motion.div>;
}

/** A success disc that pops in with a tick drawing across it, the moment the action lands. */
function Check({ reduced }: { reduced: boolean }) {
  return <svg className={styles.check} viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <motion.circle className={styles.checkDisc} cx="9" cy="9" r="8" style={{ transformOrigin: "9px 9px" }}
      initial={reduced ? false : { scale: .4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ scale: physical(.34, .3), opacity: { duration: .12 } }} />
    <motion.path className={styles.checkTick} d="M5.6 9.3 7.8 11.4 12.4 6.7" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
      initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .28, ease: enter, delay: .12 }} />
  </svg>;
}

export function ConfirmMorph({
  label, icon, prompt, confirmLabel = "Delete", cancelLabel = "Cancel", pendingLabel = "Deleting", doneLabel = "Deleted", errorLabel = "Couldn’t finish",
  retryLabel = "Retry", undoLabel = "Undo", undoingLabel = "Restoring", tone = "danger", onConfirm, onUndo, onCancel,
  state: stateProp, defaultState = "idle", onStateChange, confirmTimeout = 6000, resultTimeout = 5000, cancelOnOutsidePress = true, disabled = false, className, ref,
}: ConfirmMorphProps) {
  const reduced = useReducedFlag();
  const uid = useId();
  const promptId = `${uid}-prompt`;
  const rootRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => rootRef.current as HTMLDivElement, []);

  const [inner, setInner] = useState<ConfirmMorphState>(defaultState);
  const state = stateProp ?? inner;
  const [direction, setDirection] = useState(1);
  const [working, setWorking] = useState<"confirm" | "undo">("confirm");
  const [announcement, setAnnouncement] = useState("");

  const live = useRef({ state, onStateChange, controlled: stateProp !== undefined });
  useLayoutEffect(() => { live.current = { state, onStateChange, controlled: stateProp !== undefined }; });
  const pendingFocus = useRef(false);
  const run = useRef(0);

  const go = useCallback((next: ConfirmMorphState) => {
    const current = live.current.state;
    if (next === current) return;
    const root = rootRef.current;
    // Focus follows the control between faces, but only when it was already inside; a timeout never steals focus from elsewhere.
    pendingFocus.current = !!root && (root.contains(document.activeElement) || document.activeElement === document.body);
    // Every step moves forward except the return to rest, which comes back from the left.
    setDirection(next === "idle" ? -1 : 1);
    if (!live.current.controlled) setInner(next);
    live.current.state = next;
    live.current.onStateChange?.(next);
  }, []);

  const toIdle = useCallback(() => { run.current++; go("idle"); }, [go]);

  const perform = useCallback(async (kind: "confirm" | "undo") => {
    const handler = kind === "confirm" ? onConfirm : onUndo;
    const token = ++run.current;
    setWorking(kind);
    let result: void | Promise<unknown> | undefined;
    try { result = handler?.(); }
    catch { go("error"); setAnnouncement(errorLabel); return; }
    if (result && typeof (result as Promise<unknown>).then === "function") {
      go("pending");
      setAnnouncement(kind === "confirm" ? pendingLabel : undoingLabel);
      try { await result; }
      catch {
        if (token !== run.current) return;
        go("error");
        setAnnouncement(errorLabel);
        return;
      }
      if (token !== run.current) return;
    }
    if (kind === "undo") { go("idle"); setAnnouncement("Undone"); return; }
    go("done");
    setAnnouncement(onUndo ? `${doneLabel}. ${undoLabel} is available.` : doneLabel);
  }, [doneLabel, errorLabel, go, onConfirm, onUndo, pendingLabel, undoLabel, undoingLabel]);

  const cancel = useCallback(() => { onCancel?.(); toIdle(); setAnnouncement("Cancelled"); }, [onCancel, toIdle]);
  const expire = useRef(() => {});
  useLayoutEffect(() => { expire.current = () => { if (live.current.state === "confirming") cancel(); else toIdle(); }; });

  /* The shape: one surface whose width springs to whichever face is current. At rest it is auto, so it renders right before hydration. */
  const width = useMotionValue<number | "auto">("auto");
  const target = useRef(0);
  const flight = useRef(0);
  const onFaceSize = useCallback((id: ConfirmMorphState, w: number) => {
    if (id !== live.current.state || Math.abs(w - target.current) < .5) return;
    const from = target.current;
    target.current = w;
    if (!from || reduced) { width.jump("auto"); return; }
    if (width.get() === "auto") width.jump(from);
    const token = ++flight.current;
    animate(width, w, w > from ? GROW : SHRINK).then(() => { if (token === flight.current) width.jump("auto"); });
  }, [reduced, width]);

  /* The timeout runs as an invisible clock. A pointer resting on the control holds it, and so does a hidden tab. */
  const drain = useMotionValue(1);
  const clock = useRef<AnimationPlaybackControls | null>(null);
  const holds = useRef({ hover: false, hidden: false });
  const timeout = state === "confirming" ? confirmTimeout : state === "done" || state === "error" ? resultTimeout : 0;
  const sync = useCallback(() => {
    const control = clock.current;
    if (!control) return;
    const held = holds.current.hover || holds.current.hidden;
    if (held) control.pause(); else control.play();
  }, []);
  useEffect(() => {
    if (!timeout) return;
    drain.jump(1);
    const control = animate(drain, 0, { duration: timeout / 1000, ease: "linear" });
    clock.current = control;
    control.then(() => { if (clock.current === control) { clock.current = null; expire.current(); } });
    sync();
    return () => { if (clock.current === control) clock.current = null; control.stop(); };
  }, [drain, state, sync, timeout]);
  useEffect(() => {
    const onVisibility = () => { holds.current.hidden = document.hidden; sync(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [sync]);

  // An outside press answers the question with no.
  useEffect(() => {
    if (state !== "confirming" || !cancelOnOutsidePress) return;
    const down = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) cancel(); };
    document.addEventListener("pointerdown", down);
    return () => document.removeEventListener("pointerdown", down);
  }, [cancel, cancelOnOutsidePress, state]);

  // Focus lands on the safe choice: Cancel while asking, Undo or Retry on a result, the root while working, the trigger at rest.
  useLayoutEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    const root = rootRef.current;
    if (!root) return;
    const face = root.querySelector<HTMLElement>(`[data-face="${state}"]`);
    const autofocus = face?.querySelector<HTMLElement>("[data-autofocus]:not(:disabled)");
    (autofocus ?? root).focus({ preventScroll: true });
  }, [state]);

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape") return;
    if (state === "confirming") { event.preventDefault(); event.stopPropagation(); cancel(); }
    else if (state === "done" || state === "error") { event.preventDefault(); event.stopPropagation(); toIdle(); }
  };

  const shownPrompt = prompt ?? <>{label}?</>;
  const face = (() => {
    switch (state) {
      case "confirming": return <>
        <span id={promptId} className={styles.prompt}>{shownPrompt}</span>
        <button type="button" className={styles.secondary} data-autofocus onClick={cancel}>{cancelLabel}</button>
        <button type="button" className={styles.primary} onClick={() => void perform("confirm")}>{confirmLabel}</button>
      </>;
      case "pending": return <span className={styles.status}>
        <LoaderCircle className={styles.spinner} size={16} strokeWidth={1.75} aria-hidden="true" />
        <span>{working === "undo" ? undoingLabel : pendingLabel}</span>
      </span>;
      case "done": return <>
        <span className={styles.status} data-tone="success"><Check reduced={reduced} /><span className={styles.statusText}>{doneLabel}</span></span>
        {onUndo && <button type="button" className={styles.secondary} data-autofocus onClick={() => void perform("undo")}>{undoLabel}</button>}
      </>;
      case "error": return <>
        <span className={styles.status} data-tone="danger"><CircleAlert size={16} strokeWidth={1.75} aria-hidden="true" /><span className={styles.statusText}>{errorLabel}</span></span>
        <button type="button" className={styles.secondary} data-autofocus onClick={() => void perform(working)}>{retryLabel}</button>
      </>;
      default: return <button type="button" className={styles.trigger} data-autofocus disabled={disabled} onClick={() => { setAnnouncement(typeof shownPrompt === "string" ? shownPrompt : ""); go("confirming"); }}>
        {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
        <span>{label}</span>
      </button>;
    }
  })();

  return <div ref={rootRef} className={[styles.root, className].filter(Boolean).join(" ")} data-state={state} data-tone={tone} data-disabled={disabled || undefined}
    tabIndex={-1} onKeyDown={onKeyDown} aria-busy={state === "pending" || undefined}
    onPointerEnter={() => { holds.current.hover = true; sync(); }} onPointerLeave={() => { holds.current.hover = false; sync(); }}
    onPointerCancel={() => { holds.current.hover = false; sync(); }}>
    <motion.div className={styles.surface} style={{ width }}>
      <AnimatePresence initial={false} custom={direction}>
        <Face key={state} id={state} direction={direction} reduced={reduced} onSize={onFaceSize} labelledBy={state === "confirming" ? promptId : undefined}>{face}</Face>
      </AnimatePresence>
    </motion.div>
    <span className={styles.srOnly} role="status" aria-live="polite">{announcement}</span>
  </div>;
}

export default ConfirmMorph;
