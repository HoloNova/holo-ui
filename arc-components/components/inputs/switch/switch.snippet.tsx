"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import type { Transition } from "motion/react";
import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { forwardRef, useEffect, useRef, useState } from "react";

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
const ARC_SWITCH_STYLES = `.arc-switch-switch { display: inline-flex; min-height: var(--control-height-md); align-items: center; gap: var(--space-3); padding: 0; border: 0; color: var(--foreground); background: transparent; font: inherit; font-size: var(--text-sm); cursor: pointer; -webkit-tap-highlight-color: transparent; }
.arc-switch-switch:disabled { cursor: not-allowed; opacity: .5; }
/* Fixed box: the thumb moves inside it with transforms, so nothing around the switch shifts. The track crossfades between the two fills. */
.arc-switch-track { position: relative; box-sizing: border-box; display: flex; flex: 0 0 auto; width: 42px; height: 24px; align-items: center; padding: 3px; border-radius: var(--radius-pill); background: var(--control-track); isolation: isolate; transition: background-color var(--duration-fast) var(--ease-standard); }
.arc-switch-track::before { content: ""; position: absolute; inset: 0; z-index: -1; border-radius: inherit; background: var(--control-on); opacity: 0; transition: opacity var(--duration-standard) var(--ease-standard); }
.arc-switch-switch[data-state="checked"] .arc-switch-track::before { opacity: 1; }
.arc-switch-thumb { flex: 0 0 auto; width: 18px; height: 18px; border-radius: var(--radius-pill); background: var(--control-thumb); box-shadow: var(--control-thumb-shadow); will-change: transform; transition: background-color var(--duration-standard) var(--ease-standard); }
.arc-switch-switch[data-state="checked"] .arc-switch-thumb { background: var(--control-thumb-on); }
@media (hover: hover) and (pointer: fine) { .arc-switch-switch[data-state="unchecked"]:hover:not(:disabled) .arc-switch-track { background: var(--control-track-hover); } }
.arc-switch-label { line-height: var(--leading-body); }
@media (prefers-reduced-motion: reduce) { .arc-switch-track, .arc-switch-track::before, .arc-switch-thumb { transition: none; } }
`;

const styles: Record<string, string> = new Proxy({
  "label": "arc-switch-label",
  "switch": "arc-switch-switch",
  "thumb": "arc-switch-thumb",
  "track": "arc-switch-track"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-switch-${prop}`,
});



export interface SwitchProps extends ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  label?: string;
}

/** Track inner width (42 - 6 padding) minus the 18px thumb; keep in sync with switch.module.css. */
const size = 18;
const travel = 18;
/** How far the thumb widens toward the other side while pressed. */
const stretch = 5;
/** Critically damped: the thumb lands on its end without overshooting the state it reports. */
const glide: Transition = { type: "spring", visualDuration: 0.3, bounce: 0 };

export const Switch = forwardRef<ElementRef<typeof SwitchPrimitive.Root>, SwitchProps>(function Switch(
  { label, className, checked, defaultChecked, onCheckedChange, onPointerDown, onPointerUp, onPointerLeave, onPointerCancel, onKeyDown, onKeyUp, onBlur, ...props },
  ref,
) {
  const reduceMotion = useReducedMotion();
  const [internal, setInternal] = useState(defaultChecked ?? false);
  const [pressed, setPressed] = useState(false);
  const on = checked ?? internal;
  // A brief stretch along the travel, so the thumb reads as moving mass rather than a sliding dot.
  const scaleX = useMotionValue(1);
  const shown = useRef(on);
  useEffect(() => {
    if (shown.current === on) return;
    shown.current = on;
    if (reduceMotion) return;
    const controls = animate(scaleX, [1, 1.16, 1], { duration: 0.34, times: [0, 0.4, 1], ease: ["easeOut", "easeInOut"] });
    return () => controls.stop();
  }, [on, reduceMotion, scaleX]);
  const extra = pressed && !reduceMotion && !props.disabled ? stretch : 0;
  const classes = [styles.switch, className].filter(Boolean).join(" ");

  return (
    <SwitchPrimitive.Root
      {...props}
      ref={ref}
      checked={on}
      onCheckedChange={next => { if (checked === undefined) setInternal(next); onCheckedChange?.(next); }}
      onPointerDown={event => { onPointerDown?.(event); if (event.button === 0) setPressed(true); }}
      onPointerUp={event => { onPointerUp?.(event); setPressed(false); }}
      onPointerLeave={event => { onPointerLeave?.(event); setPressed(false); }}
      onPointerCancel={event => { onPointerCancel?.(event); setPressed(false); }}
      onKeyDown={event => { onKeyDown?.(event); if (event.key === " ") setPressed(true); }}
      onKeyUp={event => { onKeyUp?.(event); setPressed(false); }}
      onBlur={event => { onBlur?.(event); setPressed(false); }}
      className={classes}
      aria-label={props["aria-label"] ?? label}
    >
      <span className={styles.track}>
        {/* The thumb stretches like a held finger and keeps its far edge anchored, then travels on a spring. */}
        <motion.span className={styles.thumb} style={{ scaleX }} initial={false} animate={{ x: on ? travel - extra : 0, width: size + extra }} transition={reduceMotion ? { duration: 0 } : { x: glide, width: motionTokens.spring.snappy }} />
      </span>
      {label ? <span className={styles.label}>{label}</span> : null}
    </SwitchPrimitive.Root>
  );
});

Switch.displayName = "Switch";

export default Switch;
