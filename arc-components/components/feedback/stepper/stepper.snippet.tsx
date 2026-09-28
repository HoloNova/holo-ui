"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
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
const ARC_STEPPER_STYLES = `.arc-stepper-root { --marker: 1.75rem; --halo: 4px; min-width: 0; color: var(--foreground); font-family: var(--font-body); letter-spacing: var(--tracking-body); }
/* A horizontal stepper spans its container, so it can safely measure itself and fold into markers when space runs out. */
.arc-stepper-horizontal { width: 100%; container: stepper / inline-size; }
.arc-stepper-list { display: grid; margin: 0; padding: 0; list-style: none; }
.arc-stepper-item { position: relative; min-width: 0; }
.arc-stepper-horizontal .arc-stepper-item:not(:last-child) { padding-inline-end: var(--space-4); }
.arc-stepper-vertical .arc-stepper-item:not(:last-child) { padding-bottom: var(--space-5); }
.arc-stepper-compact.vertical .arc-stepper-item:not(:last-child) { padding-bottom: var(--space-6); }

/* Buttons and spans share one head, so a chosen step keeps focus as it becomes the current one. */
.arc-stepper-head { display: grid; margin: 0; padding: 0; border: 0; border-radius: var(--space-2); background: none; color: inherit; font: inherit; letter-spacing: inherit; text-align: start; cursor: default; -webkit-tap-highlight-color: transparent; }
.arc-stepper-head[data-clickable] { cursor: pointer; }
.arc-stepper-horizontal .arc-stepper-head { width: fit-content; max-width: 100%; justify-items: start; row-gap: var(--space-3); }
.arc-stepper-vertical .arc-stepper-head { width: 100%; grid-template-columns: var(--marker) minmax(0, 1fr); column-gap: var(--space-3); align-items: start; }
.arc-stepper-compact.vertical .arc-stepper-head { grid-template-columns: var(--marker); column-gap: 0; }
.arc-stepper-head:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 4px; }
.arc-stepper-head:focus:not(:focus-visible) { outline: none; }

/* The ring sits behind the disc and grows out of it; the disc carries the state color and the glyph. */
.arc-stepper-marker { position: relative; display: grid; width: var(--marker); height: var(--marker); flex: none; place-items: center; }
.arc-stepper-ring { position: absolute; inset: calc(var(--halo) * -1); border-radius: var(--radius-pill); background: var(--accent-subtle); transition: background-color var(--duration-standard) var(--ease-standard); }
.arc-stepper-disc { position: relative; display: grid; width: 100%; height: 100%; place-items: center; border-radius: var(--radius-pill); background: var(--surface); box-shadow: inset 0 0 0 1px var(--border-strong); color: var(--text-muted); font-size: var(--text-xs); font-weight: 500; font-variant-numeric: tabular-nums; line-height: 1; transition: background-color var(--duration-standard) var(--ease-standard), box-shadow var(--duration-standard) var(--ease-standard), color var(--duration-standard) var(--ease-standard), transform var(--duration-spring) var(--ease-spring); }
.arc-stepper-glyph { display: grid; grid-area: 1 / 1; place-items: center; }
.arc-stepper-icon { width: .875rem; height: .875rem; }
.arc-stepper-item[data-status="current"] .arc-stepper-disc { box-shadow: inset 0 0 0 1.5px var(--accent); color: var(--foreground); }
.arc-stepper-item[data-status="complete"] .arc-stepper-disc { background: var(--accent); box-shadow: inset 0 0 0 1px var(--accent); color: var(--accent-foreground); }
.arc-stepper-item[data-status="error"] .arc-stepper-disc { background: color-mix(in oklch, var(--danger) 10%, var(--surface)); box-shadow: inset 0 0 0 1.5px var(--danger); color: var(--danger); }
.arc-stepper-item[data-status="error"] .arc-stepper-ring { background: color-mix(in oklch, var(--danger) 16%, transparent); }

/* The track stays put; only the fill scales along it on a spring, from the step that was just finished. */
.arc-stepper-connector { position: absolute; overflow: hidden; border-radius: var(--radius-pill); background: var(--border); pointer-events: none; }
.arc-stepper-horizontal .arc-stepper-connector { top: calc(var(--marker) / 2 - 1px); inset-inline: calc(var(--marker) + var(--halo) + var(--space-1)) calc(var(--halo) + var(--space-1)); height: 2px; }
/* Both ends keep a clear gap from the markers, and from the current step's ring. */
.arc-stepper-vertical .arc-stepper-connector { top: calc(var(--marker) + var(--halo) + 2px); bottom: calc(var(--halo) + 2px); inset-inline-start: calc(var(--marker) / 2 - 1px); width: 2px; }
.arc-stepper-fill { position: absolute; inset: 0; border-radius: inherit; background: var(--accent); }
.arc-stepper-horizontal .arc-stepper-fill { transform-origin: left center; }
.arc-stepper-horizontal .arc-stepper-fill:dir(rtl) { transform-origin: right center; }
.arc-stepper-vertical .arc-stepper-fill { transform-origin: center top; }

.arc-stepper-text { display: grid; min-width: 0; }
/* Centers the first line of the label on the marker. */
.arc-stepper-vertical .arc-stepper-text { padding-top: .25rem; }
.arc-stepper-label { display: block; color: var(--text-muted); font-size: var(--text-sm); font-weight: 500; line-height: 1.25rem; overflow-wrap: break-word; transition: color var(--duration-standard) var(--ease-standard); }
.arc-stepper-item[data-status="complete"] .arc-stepper-label { color: var(--text-secondary); }
.arc-stepper-item[data-status="current"] .arc-stepper-label, .arc-stepper-item[data-status="error"] .arc-stepper-label { color: var(--foreground); }
/* Changing text pops out of flow against this box while it leaves, so it must be the positioned parent. */
.arc-stepper-slot { display: block; }
.arc-stepper-slotInner { position: relative; display: block; }
.arc-stepper-description, .arc-stepper-error { display: block; padding-top: 2px; font-size: var(--text-xs); font-weight: 400; line-height: var(--leading-body); overflow-wrap: break-word; }
.arc-stepper-description { color: var(--text-muted); }
.arc-stepper-error { color: var(--danger); }

.arc-stepper-caption { display: none; margin-top: var(--space-3); }
.arc-stepper-captionLabel { display: block; color: var(--foreground); font-size: var(--text-sm); font-weight: 500; line-height: 1.25rem; }

@media (hover: hover) and (pointer: fine) {
  .arc-stepper-head[data-clickable]:hover .arc-stepper-label { color: var(--foreground); }
  .arc-stepper-item[data-status="complete"] .arc-stepper-head[data-clickable]:hover .arc-stepper-disc { background: var(--accent-strong); box-shadow: inset 0 0 0 1px var(--accent-strong); }
  .arc-stepper-item[data-status="error"] .arc-stepper-head[data-clickable]:hover .arc-stepper-disc { background: color-mix(in oklch, var(--danger) 18%, var(--surface)); }
}
.arc-stepper-head[data-clickable]:active .arc-stepper-disc { transform: scale(.92); }

.arc-stepper-srOnly, .arc-stepper-compact .arc-stepper-text { position: absolute; width: 1px; height: 1px; margin: 0; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.arc-stepper-compact.horizontal .arc-stepper-caption { display: grid; }
/* Four labels no longer fit side by side: keep the markers and name the current step underneath. */
@container stepper (max-width: 30rem) {
  .arc-stepper-horizontal .arc-stepper-text { position: absolute; width: 1px; height: 1px; margin: 0; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  .arc-stepper-horizontal .arc-stepper-caption { display: grid; }
}

@media (prefers-reduced-motion: reduce) {
  .arc-stepper-disc, .arc-stepper-ring, .arc-stepper-label { transition: none; }
  .arc-stepper-head[data-clickable]:active .arc-stepper-disc { transform: none; }
}
`;

const styles: Record<string, string> = new Proxy({
  "caption": "arc-stepper-caption",
  "captionLabel": "arc-stepper-captionLabel",
  "compact": "arc-stepper-compact",
  "connector": "arc-stepper-connector",
  "description": "arc-stepper-description",
  "disc": "arc-stepper-disc",
  "error": "arc-stepper-error",
  "fill": "arc-stepper-fill",
  "glyph": "arc-stepper-glyph",
  "head": "arc-stepper-head",
  "horizontal": "arc-stepper-horizontal",
  "icon": "arc-stepper-icon",
  "item": "arc-stepper-item",
  "label": "arc-stepper-label",
  "list": "arc-stepper-list",
  "marker": "arc-stepper-marker",
  "ring": "arc-stepper-ring",
  "root": "arc-stepper-root",
  "slot": "arc-stepper-slot",
  "slotInner": "arc-stepper-slotInner",
  "srOnly": "arc-stepper-srOnly",
  "text": "arc-stepper-text",
  "vertical": "arc-stepper-vertical"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-stepper-${prop}`,
});



export type StepperOrientation = "horizontal" | "vertical";
export type StepperStatus = "complete" | "current" | "upcoming" | "error";

export interface StepperStep {
  /** Stable key, so each step keeps its own motion when the list changes. */
  id: string;
  label: string;
  /** A short hint under the label. */
  description?: string;
  /** Marks the step as failed: the marker morphs into an alert and this message replaces the description. */
  error?: string;
}

/**
 * A steps indicator for onboarding, checkout, and setup flows. Place it above (horizontal) or beside (vertical) the step
 * content and drive it with `current`; set `current` to `steps.length` once every step is done. Pass `onStepSelect` to let
 * people return to completed steps by click or keyboard. For a multi-step form that owns its own content, use MultiStepForm.
 */
export interface StepperProps {
  steps: StepperStep[];
  /** Index of the step in progress. `steps.length` marks the whole flow complete. */
  current: number;
  orientation?: StepperOrientation;
  /** Called with the index of a completed step when it is chosen. Without it the stepper is a read-only indicator. */
  onStepSelect?: (index: number) => void;
  /** `current` shows only the active step's description, for tight spaces. Errors always show. */
  details?: "all" | "current";
  /** Markers only; labels stay available to assistive tech. Horizontal steppers switch to this below 30rem on their own
   *  and show the current step's label underneath. */
  compact?: boolean;
  /** Accessible name for the stepper. */
  label?: string;
  /** Announced, and shown in the compact caption, once every step is complete. */
  completeLabel?: string;
  className?: string;
}

type GlyphKind = "number" | "check" | "error";

const blur = (radius: number) => `blur(${radius}px)`;
const still = { duration: 0 } as const;
const leave = { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } as const;
const settle = { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] } as const;
const textFrom = { opacity: 0, y: "0.3em", filter: blur(motionTokens.blur.soft) };
const textRest = { opacity: 1, y: 0, filter: blur(0) };
const textGone = { opacity: 0, y: "-0.3em", filter: blur(motionTokens.blur.subtle) };
const glyphFrom = { opacity: 0, scale: .5, filter: blur(motionTokens.blur.subtle) };
const glyphRest = { opacity: 1, scale: 1, filter: blur(0) };

/** Text that rises in with a small blur when it changes. Its slot springs to the new height, so a message that wraps
 *  eases the steps below it down instead of pushing them; unrelated resizes (fonts, container width) follow exactly. */
function SwapText({ text, className, reduced }: { text?: string; className: string; reduced: boolean }) {
  const inner = useRef<HTMLSpanElement>(null);
  const armedUntil = useRef(0);
  const height = useMotionValue<number | "auto">("auto");
  useLayoutEffect(() => { armedUntil.current = performance.now() + 700; }, [text]);
  useEffect(() => {
    const node = inner.current, slot = node?.parentElement;
    if (!node || !slot || typeof ResizeObserver === "undefined") return;
    let measured = false;
    const observer = new ResizeObserver(() => {
      const next = node.offsetHeight;
      if (!measured || reduced || performance.now() > armedUntil.current) { measured = true; height.jump(next); return; }
      animate(height, next, motionTokens.spring.smooth);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [height, reduced]);
  return <motion.span className={styles.slot} style={{ height }}>
    <span ref={inner} className={styles.slotInner}>
      <AnimatePresence mode="popLayout" initial={false}>
        {text ? <motion.span key={`${className}:${text}`} className={className} initial={textFrom} animate={textRest} exit={{ ...textGone, transition: reduced ? still : leave }} transition={reduced ? still : settle}>{text}</motion.span> : null}
      </AnimatePresence>
    </span>
  </motion.span>;
}

/** The number, check, and alert share one spot: the outgoing glyph shrinks away while the next one pops in and draws its stroke. */
function Glyph({ kind, number, delay, reduced }: { kind: GlyphKind; number: number; delay: number; reduced: boolean }) {
  const pop = reduced ? still : { scale: { ...motionTokens.spring.snappy, delay }, opacity: { duration: motionTokens.duration.fast, delay }, filter: { duration: motionTokens.duration.fast, delay } };
  const exit = { ...glyphFrom, transition: reduced ? still : leave };
  const draw = reduced ? still : { duration: .32, ease: motionTokens.ease.enter, delay: delay + .04 };
  if (kind === "number") return <motion.span className={styles.glyph} initial={glyphFrom} animate={glyphRest} exit={exit} transition={pop}>{number}</motion.span>;
  return <motion.svg className={`${styles.glyph} ${styles.icon}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" initial={glyphFrom} animate={glyphRest} exit={exit} transition={pop}>
    {kind === "check"
      ? <motion.path d="M5.5 12.5l4.25 4.25L18.5 8" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={draw} />
      : <>
        <motion.path d="M12 6.75v6.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={draw} />
        <motion.circle cx={12} cy={17.4} r={1.4} fill="currentColor" stroke="none" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={reduced ? still : { ...motionTokens.spring.snappy, delay: delay + .16 }} />
      </>}
  </motion.svg>;
}

/** The ring grows out from behind the disc once progress arrives, so the eye lands on the new step after the connector fills. */
function Marker({ number, kind, current, glyphDelay, ringDelay, reduced }: { number: number; kind: GlyphKind; current: boolean; glyphDelay: number; ringDelay: number; reduced: boolean }) {
  return <span className={styles.marker} aria-hidden="true">
    <AnimatePresence initial={false}>
      {current ? <motion.span key="ring" className={styles.ring} initial={{ opacity: 0, scale: .6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .6, transition: reduced ? still : leave }}
        transition={reduced ? still : { scale: { ...motionTokens.spring.snappy, delay: ringDelay }, opacity: { duration: motionTokens.duration.fast, delay: ringDelay } }} /> : null}
    </AnimatePresence>
    <span className={styles.disc}>
      <AnimatePresence initial={false}><Glyph key={kind} kind={kind} number={number} delay={glyphDelay} reduced={reduced} /></AnimatePresence>
    </span>
  </span>;
}

const statusText: Record<StepperStatus, string> = { complete: "Completed", current: "", upcoming: "Not started", error: "Error" };

export function Stepper({ steps, current, orientation = "horizontal", onStepSelect, details = "all", compact = false, label = "Progress", completeLabel = "All steps complete", className }: StepperProps) {
  const reduced = useReducedMotion() ?? false;
  const count = steps.length;
  const active = Math.min(Math.max(Math.round(current), 0), count);
  // Remember where progress came from, so a jump across several steps fills or drains its connectors one after another.
  const [travel, setTravel] = useState({ to: active, from: active });
  if (travel.to !== active) setTravel({ to: active, from: travel.to });
  const from = travel.from;
  const gap = motionTokens.stagger.line;
  const delayAt = (index: number) => {
    if (reduced) return 0;
    if (active > from) return index >= from && index < active ? (index - from) * gap : 0;
    return index >= active && index < from ? (from - 1 - index) * gap : 0;
  };
  const ringDelay = reduced ? 0 : Math.max(0, Math.abs(active - from) - 1) * gap + .12;
  const interactive = Boolean(onStepSelect);
  const vertical = orientation === "vertical";
  const done = active >= count;
  const now = done ? undefined : steps[active];

  /** Arrow keys move between the steps you can reach; Home and End jump to the first and the current one. */
  function onKeyDown(event: KeyboardEvent<HTMLOListElement>) {
    const rtl = !vertical && getComputedStyle(event.currentTarget).direction === "rtl";
    const back = ["ArrowUp", rtl ? "ArrowRight" : "ArrowLeft"], ahead = ["ArrowDown", rtl ? "ArrowLeft" : "ArrowRight"];
    if (![...back, ...ahead, "Home", "End"].includes(event.key)) return;
    const targets = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button[data-reachable]"));
    const at = targets.indexOf(event.target as HTMLButtonElement);
    if (at < 0) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? targets.length - 1 : back.includes(event.key) ? Math.max(0, at - 1) : Math.min(targets.length - 1, at + 1);
    targets[next]?.focus();
  }

  const Root = interactive ? "nav" : "div";
  const classes = [styles.root, vertical ? styles.vertical : styles.horizontal, compact ? styles.compact : "", className].filter(Boolean).join(" ");
  return <Root className={classes} aria-label={label} role={interactive ? undefined : "group"}>
    <ol className={styles.list} style={vertical ? undefined : { gridTemplateColumns: count > 1 ? `repeat(${count - 1}, minmax(0, 1fr)) auto` : "auto" }} onKeyDown={interactive ? onKeyDown : undefined}>
      {steps.map((step, index) => {
        const isCurrent = index === active;
        const status: StepperStatus = step.error ? "error" : index < active ? "complete" : isCurrent ? "current" : "upcoming";
        const clickable = interactive && index < active;
        const detail = step.error ?? (details === "all" || isCurrent ? step.description : undefined);
        const kind: GlyphKind = step.error ? "error" : index < active ? "check" : "number";
        const content: ReactNode = <>
          <Marker number={index + 1} kind={kind} current={isCurrent} glyphDelay={delayAt(index)} ringDelay={ringDelay} reduced={reduced} />
          <span className={styles.text}>
            <span className={styles.label}>{step.label}</span>
            {statusText[status] ? <span className={styles.srOnly}>, {statusText[status]}</span> : null}
            <SwapText text={detail} className={step.error ? styles.error : styles.description} reduced={reduced} />
          </span>
        </>;
        return <li key={step.id} className={styles.item} data-status={status}>
          {index < count - 1 ? <span className={styles.connector} aria-hidden="true">
            <motion.span key={orientation} className={styles.fill} initial={false} animate={vertical ? { scaleY: index < active ? 1 : 0 } : { scaleX: index < active ? 1 : 0 }} transition={reduced ? still : { ...motionTokens.spring.smooth, delay: delayAt(index) }} />
          </span> : null}
          {interactive
            ? <button type="button" className={styles.head} data-clickable={clickable || undefined} data-reachable={index <= active || undefined} aria-current={isCurrent ? "step" : undefined} aria-disabled={clickable ? undefined : true} tabIndex={clickable ? undefined : -1} onClick={clickable ? () => onStepSelect?.(index) : undefined}>{content}</button>
            : <span className={styles.head} aria-current={isCurrent ? "step" : undefined}>{content}</span>}
        </li>;
      })}
    </ol>
    {vertical ? null : <span className={styles.caption} aria-hidden="true">
      <SwapText text={now?.label ?? completeLabel} className={styles.captionLabel} reduced={reduced} />
      <SwapText text={now?.error ?? now?.description} className={now?.error ? styles.error : styles.description} reduced={reduced} />
    </span>}
    <span className={styles.srOnly} aria-live="polite">{now ? `Step ${active + 1} of ${count}: ${now.label}` : completeLabel}</span>
  </Root>;
}

export default Stepper;
