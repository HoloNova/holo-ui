"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import type { Transition } from "motion/react";
import { forwardRef, useId, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

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
const ARC_CHECKBOX_STYLES = `.arc-checkbox-field { display: inline-flex; align-items: flex-start; gap: 0; min-width: 0; }
.arc-checkbox-box { position: relative; flex: 0 0 auto; display: grid; place-items: center; width: var(--control-height-md); height: var(--control-height-md); border: 0; border-radius: var(--radius-control); padding: 0; background: transparent; color: var(--control-glyph); cursor: pointer; -webkit-tap-highlight-color: transparent; }
/* The square is the only part that reacts to a press, so the hit area and label never move. */
.arc-checkbox-visual { position: relative; display: block; width: 18px; height: 18px; border: 1px solid var(--border-strong); border-radius: 5px; background: var(--surface); transition: border-color var(--duration-fast) var(--ease-standard), transform var(--duration-spring) var(--ease-spring); }
.arc-checkbox-fill { position: absolute; inset: -1px; border-radius: inherit; background: var(--control-on); }
.arc-checkbox-mark { position: absolute; inset: -1px; width: 18px; height: 18px; overflow: visible; }
.arc-checkbox-box[data-state="checked"] .arc-checkbox-visual, .arc-checkbox-box[data-state="indeterminate"] .arc-checkbox-visual { border-color: var(--control-on); }
@media (hover: hover) and (pointer: fine) { .arc-checkbox-box[data-state="unchecked"]:hover:not(:disabled) .arc-checkbox-visual { border-color: var(--text-muted); } }
.arc-checkbox-box:active:not(:disabled) .arc-checkbox-visual { transform: scale(.95); transition: border-color var(--duration-fast) var(--ease-standard), transform 110ms var(--ease-standard); }
/* The ring hugs the square, not the 44px hit area, so it never runs into the label beside it. */
.arc-checkbox-box:focus-visible { outline: none; }
.arc-checkbox-box:focus-visible .arc-checkbox-visual { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.arc-checkbox-box:disabled { opacity: .5; cursor: not-allowed; }
/* The label's first line centers on the square: (44px box - 19.6px line) / 2. */
.arc-checkbox-copy { display: grid; gap: 2px; min-width: 0; margin-left: 1px; padding-top: calc((var(--control-height-md) - var(--text-sm) * 1.4) / 2); }
.arc-checkbox-copy label { color: var(--foreground); font-size: var(--text-sm); font-weight: 500; line-height: var(--leading-body); cursor: pointer; }
.arc-checkbox-copy span { color: var(--text-muted); font-size: var(--text-xs); line-height: var(--leading-body); }
@media (prefers-reduced-motion: reduce) { .arc-checkbox-visual, .arc-checkbox-box:active:not(:disabled) .arc-checkbox-visual { transition: none; transform: none; } }
`;

const styles: Record<string, string> = new Proxy({
  "box": "arc-checkbox-box",
  "copy": "arc-checkbox-copy",
  "field": "arc-checkbox-field",
  "fill": "arc-checkbox-fill",
  "mark": "arc-checkbox-mark",
  "visual": "arc-checkbox-visual"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-checkbox-${prop}`,
});



export interface CheckboxProps extends ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: string;
  description?: string;
}

/** Both marks share three points, so the check morphs into the dash and back instead of swapping. */
const checkPath = "M4.25 9.25 L7.25 12.25 L13.75 5.75";
const dashPath = "M4.75 9 L9 9 L13.25 9";

export const Checkbox = forwardRef<ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(function Checkbox(
  { label, description, id, className, checked, defaultChecked, onCheckedChange, ...props }, ref,
) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const reduced = useReducedMotion();
  const [internal, setInternal] = useState<CheckboxPrimitive.CheckedState>(defaultChecked ?? false);
  const state = checked ?? internal;
  const on = state !== false;
  const change = (next: CheckboxPrimitive.CheckedState) => { if (checked === undefined) setInternal(next); onCheckedChange?.(next); };
  const fade: Transition = { duration: on ? motionTokens.duration.instant : motionTokens.duration.fast, ease: [...motionTokens.ease.standard] };
  return <div className={styles.field}>
    <CheckboxPrimitive.Root {...props} id={controlId} ref={ref} checked={state} onCheckedChange={change} className={[styles.box, className].filter(Boolean).join(" ")} aria-describedby={description ? `${controlId}-description` : undefined} aria-label={props["aria-label"] ?? (label ? undefined : "Checkbox")}>
      <span className={styles.visual} aria-hidden="true">
        <motion.span className={styles.fill} initial={false} animate={{ opacity: on ? 1 : 0, scale: on ? 1 : .6 }} transition={reduced ? { duration: 0 } : { scale: motionTokens.spring.snappy, opacity: fade }} />
        <svg className={styles.mark} viewBox="0 0 18 18" fill="none" focusable="false">
          <motion.path initial={false} animate={{ d: state === "indeterminate" ? dashPath : checkPath, pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }} transition={reduced ? { duration: 0 } : { d: motionTokens.spring.morph, pathLength: motionTokens.spring.snappy, opacity: fade }} stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </CheckboxPrimitive.Root>
    {label || description ? <div className={styles.copy}>{label ? <label htmlFor={controlId}>{label}</label> : null}{description ? <span id={`${controlId}-description`}>{description}</span> : null}</div> : null}
  </div>;
});

Checkbox.displayName = "Checkbox";
