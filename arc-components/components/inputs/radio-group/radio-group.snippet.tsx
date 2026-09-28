"use client";

import { animate, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useLayoutEffect, useRef } from "react";

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
const ARC_RADIO_GROUP_STYLES = `.arc-radio-group-group { display: grid; min-width: 0; margin: 0; border: 0; padding: 0; }
.arc-radio-group-group legend { margin-bottom: var(--space-2); padding: 0; font-size: var(--text-sm); font-weight: 500; }
/* One highlight travels between the rows: above their borders and fills, below their text, so it never crosses a label. */
.arc-radio-group-options { position: relative; display: grid; gap: var(--space-2); }
.arc-radio-group-highlight { position: absolute; top: 0; right: 0; left: 0; z-index: 1; box-sizing: border-box; border: 1px solid var(--control-on); border-radius: var(--radius-control); background: color-mix(in oklch, var(--control-on) 5%, transparent); opacity: 0; pointer-events: none; }
/* Rows answer a press with color only; the mark is what moves. */
/* The mark sits centered on the left edge of the row, whether or not the option has a description. */
.arc-radio-group-option { position: relative; display: flex; align-items: center; gap: var(--space-3); border: 1px solid var(--border); border-radius: var(--radius-control); padding: var(--space-3); cursor: pointer; -webkit-tap-highlight-color: transparent; transition: background-color var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard); }
@media (hover: hover) and (pointer: fine) { .arc-radio-group-option:hover { background: var(--surface-muted); } }
.arc-radio-group-option:active { background: var(--surface-muted); }
/* Until the highlight is placed (server paint or no script), the checked row carries the same look itself. */
.arc-radio-group-options:not([data-ready]) .arc-radio-group-option:has(input:checked) { border-color: var(--control-on); background: color-mix(in oklch, var(--control-on) 5%, transparent); }
/* Focus rides on the highlight when it marks the focused row, so the ring glides with arrow key choices. */
.arc-radio-group-option:has(input:focus-visible:not(:checked)), .arc-radio-group-options:not([data-ready]) .arc-radio-group-option:has(input:focus-visible) { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.arc-radio-group-options[data-ready]:has(input:checked:focus-visible) .arc-radio-group-highlight { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.arc-radio-group-option input { position: absolute; opacity: 0; }
/* Rows are not stacking contexts, so their mark and copy rise above the highlight while their border and fill stay below it. */
.arc-radio-group-option > span { position: relative; z-index: 2; }
.arc-radio-group-mark { display: grid; width: 17px; height: 17px; flex: 0 0 auto; place-items: center; border: 1px solid var(--border-strong); border-radius: 50%; transition: border-color var(--duration-fast) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard), transform var(--duration-spring) var(--ease-spring); }
.arc-radio-group-mark::after, .arc-radio-group-dot { grid-area: 1 / 1; width: 7px; height: 7px; border-radius: 50%; background: var(--foreground); }
.arc-radio-group-dot { width: 6px; height: 6px; }
/* A faint dot previews the choice while the pointer is down, then the real dot springs in on release. */
.arc-radio-group-mark::after { content: ""; opacity: 0; transition: opacity var(--duration-instant) var(--ease-standard); }
.arc-radio-group-option:active:not(:has(input:checked)) .arc-radio-group-mark::after { opacity: .22; }
/* The mark alone answers a press: a quick dip, then a spring back. */
.arc-radio-group-option:active .arc-radio-group-mark { transform: scale(.88); transition: border-color var(--duration-fast) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard), transform 100ms var(--ease-standard); }
.arc-radio-group-option:has(input:checked) .arc-radio-group-mark { border-color: var(--control-on); background: var(--control-on); }
.arc-radio-group-option:has(input:checked) .arc-radio-group-dot { background: var(--control-glyph); }
.arc-radio-group-option strong, .arc-radio-group-option small { display: block; }
.arc-radio-group-option strong { color: var(--text-secondary); font-size: var(--text-sm); font-weight: 500; transition: color var(--duration-standard) var(--ease-standard); }
.arc-radio-group-option:has(input:checked) strong { color: var(--foreground); }
.arc-radio-group-option small { margin-top: 2px; color: var(--text-muted); font-size: var(--text-xs); }
@media (prefers-reduced-motion: reduce) { .arc-radio-group-option, .arc-radio-group-mark, .arc-radio-group-mark::after, .arc-radio-group-option strong { transition: none; } .arc-radio-group-option:active .arc-radio-group-mark { transform: none; } }
`;

const styles: Record<string, string> = new Proxy({
  "dot": "arc-radio-group-dot",
  "group": "arc-radio-group-group",
  "highlight": "arc-radio-group-highlight",
  "mark": "arc-radio-group-mark",
  "option": "arc-radio-group-option",
  "options": "arc-radio-group-options"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-radio-group-${prop}`,
});

export interface RadioGroupProps { label: string; options: { value: string; label: string; description?: string }[]; value: string; onValueChange: (value: string) => void; name?: string }

/** Sizes the highlight to the chosen row. A new choice glides on the morph spring; the first paint and resizes place it at once. */
function place(highlight: HTMLElement | null, row: HTMLElement | null | undefined, at: { current: string }, glide: boolean) {
  const next = row ? `${row.offsetTop} ${row.offsetHeight}` : "";
  if (!highlight || next === at.current) return;
  const visible = at.current !== "";
  at.current = next;
  if (!row) { animate(highlight, { opacity: 0 }, { duration: 0 }); return; }
  const target = { y: row.offsetTop, height: row.offsetHeight, opacity: 1 };
  if (glide && visible) { animate(highlight, target, { ...motionTokens.spring.morph, opacity: { duration: 0 } }); return; }
  // Written to the element too, so the paint that drops the server fallback already shows the highlight in place.
  Object.assign(highlight.style, { transform: `translateY(${target.y}px)`, height: `${target.height}px`, opacity: "1" });
  animate(highlight, target, { duration: 0 });
}

/** One highlight travels to the chosen row while the new dot springs in and the old one shrinks away, so a change reads as a single physical move. Arrow keys take the same path. Rows and text never resize. */
export function RadioGroup({ label, options, value, onValueChange, name }: RadioGroupProps) {
  const id = useId();
  const reduced = useReducedMotion();
  const listRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLSpanElement>(null);
  const rows = useRef<(HTMLLabelElement | null)[]>([]);
  const shown = useRef<number | null>(null);
  const at = useRef("");
  const selected = options.findIndex(option => option.value === value);
  useLayoutEffect(() => {
    place(highlightRef.current, rows.current[selected], at, shown.current !== null && shown.current !== selected && !reduced);
    shown.current = selected;
    listRef.current?.setAttribute("data-ready", "");
  }, [selected, reduced]);
  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => place(highlightRef.current, rows.current[shown.current ?? -1], at, false));
    observer.observe(list); rows.current.forEach(row => row && observer.observe(row));
    return () => observer.disconnect();
  }, [options.length]);
  return <fieldset className={styles.group}><legend>{label}</legend><div ref={listRef} className={styles.options}>
    <span ref={highlightRef} className={styles.highlight} aria-hidden="true" />
    {options.map((option, index) => { const checked = value === option.value; return <label className={styles.option} key={option.value} ref={node => { rows.current[index] = node; }}>
      <input type="radio" name={name ?? id} value={option.value} checked={checked} onChange={() => onValueChange(option.value)}/>
      <span className={styles.mark} aria-hidden="true"><motion.span className={styles.dot} initial={false} animate={checked ? { scale: 1, opacity: 1 } : { scale: .4, opacity: 0 }} transition={reduced ? { duration: 0 } : { ...motionTokens.spring.snappy, opacity: { duration: checked ? motionTokens.duration.fast : motionTokens.duration.instant } }}/></span>
      <span><strong>{option.label}</strong>{option.description && <small>{option.description}</small>}</span>
    </label>; })}
  </div></fieldset>;
}
