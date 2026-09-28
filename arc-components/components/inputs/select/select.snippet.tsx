"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import type { ComponentPropsWithoutRef } from "react";
import type { Variants } from "motion/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { forwardRef, useId, useState } from "react";

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
const ARC_SELECT_STYLES = `.arc-select-field { display: grid; gap: var(--space-2); min-width: 0; }
.arc-select-field label { font-size: var(--text-sm); font-weight: 500; }
/* The trigger anchors the floating menu. Radix opens on pointerdown and measures this box, so it never scales: press feedback is color only. */
.arc-select-trigger { position: relative; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); width: 100%; min-height: var(--control-height-md); border: 1px solid var(--border); border-radius: var(--radius-control); padding: 0 var(--space-3); background: var(--surface); color: var(--foreground); font: inherit; font-size: var(--text-sm); text-align: left; cursor: pointer; transition: border-color var(--duration-fast) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard); }
@media (hover: hover) and (pointer: fine) { .arc-select-trigger:hover:not([data-disabled]) { border-color: var(--border-strong); background: var(--surface-muted); } }
.arc-select-trigger:active:not([data-disabled]), .arc-select-trigger[data-state="open"] { border-color: var(--border-strong); background: var(--surface-muted); }
.arc-select-trigger:focus-visible { border-color: var(--accent); outline: 3px solid var(--accent-subtle); outline-offset: 0; }
.arc-select-trigger[data-disabled] { opacity: .5; cursor: not-allowed; }
.arc-select-valueText { display: grid; flex: 1; min-width: 0; grid-template-columns: minmax(0, 1fr); }
.arc-select-valueText > span { grid-area: 1 / 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.arc-select-valueText > [data-placeholder] { color: var(--text-muted); }
.arc-select-srOnly { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
.arc-select-chevron { display: inline-flex; flex: 0 0 auto; color: var(--text-muted); transition: transform var(--duration-spring) var(--ease-spring), color var(--duration-fast) var(--ease-standard); }
.arc-select-trigger[data-state="open"] .arc-select-chevron { transform: rotate(180deg); }
.arc-select-hint { color: var(--text-muted); font-size: var(--text-xs); }
/* Radix holds the animation until the menu is positioned, so it always grows from the trigger edge. */
.arc-select-content { --menu-x: 0px; --menu-y: -6px; box-sizing: border-box; z-index: 1000; width: var(--radix-select-trigger-width); min-width: var(--radix-select-trigger-width); max-width: min(24rem, calc(100vw - 20px)); max-height: min(320px, var(--radix-select-content-available-height)); overflow: hidden; border: 1px solid var(--border); border-radius: calc(var(--radius-control) + 2px); padding: 6px; background: var(--surface-raised); color: var(--foreground); box-shadow: var(--shadow-floating); transform-origin: var(--radix-select-content-transform-origin); animation: select-in 220ms var(--ease-enter) both; }
.arc-select-content[data-side="top"] { --menu-y: 6px; }
.arc-select-content[data-side="left"] { --menu-x: 6px; --menu-y: 0px; }
.arc-select-content[data-side="right"] { --menu-x: -6px; --menu-y: 0px; }
.arc-select-content[data-state="closed"] { animation: select-out 130ms var(--ease-standard) both; }
.arc-select-viewport { padding: 2px 0; }
.arc-select-item { position: relative; display: flex; align-items: center; min-height: 36px; border-radius: calc(var(--radius-control) - 8px); padding: 0 34px 0 11px; color: var(--foreground); font-size: var(--text-sm); cursor: default; outline: none; user-select: none; transition: background-color 80ms var(--ease-standard), color 80ms var(--ease-standard); }
.arc-select-item[data-highlighted] { background: var(--surface-muted); }
.arc-select-item[data-disabled] { opacity: .45; }
.arc-select-indicator { position: absolute; right: 10px; display: inline-flex; align-items: center; color: var(--foreground); animation: indicator-in var(--duration-standard) var(--ease-enter) 40ms both; }
.arc-select-scrollButton { display: grid; height: 28px; place-items: center; color: var(--text-muted); }
@keyframes select-in { from { opacity: 0; transform: translate(var(--menu-x), var(--menu-y)) scale(.97); } }
@keyframes select-out { to { opacity: 0; transform: translate(calc(var(--menu-x) / 2), calc(var(--menu-y) / 2)) scale(.98); } }
@keyframes indicator-in { from { opacity: 0; transform: scale(.6); filter: blur(2px); } }
@media (prefers-reduced-transparency: reduce) { .arc-select-content { background: var(--surface-raised); backdrop-filter: none; -webkit-backdrop-filter: none; } }
@media (prefers-reduced-motion: reduce) { .arc-select-trigger, .arc-select-chevron, .arc-select-item { transition: none; } .arc-select-content { animation: select-fade var(--duration-instant) linear both; } .arc-select-content[data-state="closed"] { animation: select-fade-out var(--duration-instant) linear both; } .arc-select-indicator { animation: none; } }
@keyframes select-fade { from { opacity: 0; } }
@keyframes select-fade-out { to { opacity: 0; } }
`;

const styles: Record<string, string> = new Proxy({
  "chevron": "arc-select-chevron",
  "content": "arc-select-content",
  "field": "arc-select-field",
  "hint": "arc-select-hint",
  "indicator": "arc-select-indicator",
  "item": "arc-select-item",
  "scrollButton": "arc-select-scrollButton",
  "srOnly": "arc-select-srOnly",
  "trigger": "arc-select-trigger",
  "valueText": "arc-select-valueText",
  "viewport": "arc-select-viewport"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-select-${prop}`,
});



export interface SelectProps extends Omit<ComponentPropsWithoutRef<typeof SelectPrimitive.Root>, "children"> {
  label: string;
  description?: string;
  placeholder?: string;
  id?: string;
  className?: string;
  options: { value: string; label: string; disabled?: boolean }[];
}

/** The shown value rolls in the direction of the list: a later option rises from below, an earlier one drops from above. */
const valueRoll: Variants = {
  enter: (direction: number) => ({ opacity: 0, y: `${direction * 0.35}em`, filter: `blur(${motionTokens.blur.soft}px)` }),
  center: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] } },
  exit: (direction: number) => ({ opacity: 0, y: `${direction * -0.3}em`, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } }),
};
/** Reduced motion keeps a short crossfade; the resting state matches valueRoll so server and client markup agree. */
const valueFade: Variants = { enter: { opacity: 0 }, center: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.instant } }, exit: { opacity: 0, transition: { duration: motionTokens.duration.instant } } };

export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
  { label, description, placeholder = "Select an option", options, id, className, disabled, onValueChange, ...rootProps },
  ref,
) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const hintId = description ? `${controlId}-description` : undefined;
  const reduceMotion = useReducedMotion();
  const [uncontrolledValue, setUncontrolledValue] = useState(rootProps.defaultValue ?? "");
  const currentValue = rootProps.value ?? uncontrolledValue;
  const index = options.findIndex((option) => option.value === currentValue);
  const shown = currentValue ? options[index]?.label ?? "" : placeholder;
  const [previousIndex, setPreviousIndex] = useState(index);
  const [direction, setDirection] = useState(1);
  if (previousIndex !== index) { setPreviousIndex(index); setDirection(index > previousIndex ? 1 : -1); }

  return (
    <div className={styles.field}>
      <label htmlFor={controlId}>{label}</label>
      <SelectPrimitive.Root {...rootProps} disabled={disabled} onValueChange={(next) => { setUncontrolledValue(next); onValueChange?.(next); }}>
        <SelectPrimitive.Trigger
          ref={ref}
          id={controlId}
          aria-describedby={hintId}
          className={[styles.trigger, className].filter(Boolean).join(" ")}
        >
          {/* Radix keeps the real value for assistive tech; the visible copy below animates between values. */}
          <span className={styles.srOnly}><SelectPrimitive.Value placeholder={placeholder} /></span>
          <span className={styles.valueText} aria-hidden="true">
            <AnimatePresence initial={false} custom={direction}>
              <motion.span key={currentValue ? `value-${currentValue}` : "placeholder"} data-placeholder={currentValue ? undefined : ""} custom={direction} variants={reduceMotion ? valueFade : valueRoll} initial="enter" animate="center" exit="exit">{shown}</motion.span>
            </AnimatePresence>
          </span>
          <SelectPrimitive.Icon className={styles.chevron}>
            <ChevronDown size={16} strokeWidth={1.8} aria-hidden="true" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content className={styles.content} position="popper" sideOffset={4} collisionPadding={12}>
            <SelectPrimitive.ScrollUpButton className={styles.scrollButton}>
              <ChevronUp size={15} strokeWidth={1.8} aria-hidden="true" />
            </SelectPrimitive.ScrollUpButton>
            <SelectPrimitive.Viewport className={styles.viewport}>
              {options.map((option) => (
                <SelectPrimitive.Item key={option.value} value={option.value} disabled={option.disabled} className={styles.item}>
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator className={styles.indicator}>
                    <Check size={16} strokeWidth={2} aria-hidden="true" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
            <SelectPrimitive.ScrollDownButton className={styles.scrollButton}>
              <ChevronDown size={15} strokeWidth={1.8} aria-hidden="true" />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {description && <span id={hintId} className={styles.hint}>{description}</span>}
    </div>
  );
});
