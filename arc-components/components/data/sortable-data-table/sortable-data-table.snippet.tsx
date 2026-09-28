"use client";

import type { KeyboardEvent, MouseEvent as ReactMouseEvent, ReactNode, RefObject } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, type Transition, type Variants } from "motion/react";
import { ArrowUp } from "lucide-react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

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
const ARC_SORTABLE_DATA_TABLE_STYLES = `/* Cells are opaque so rows passing each other during a sort cover one another cleanly instead of blending text. */
.arc-sortable-data-table-wrapper { --column-tint: var(--surface-muted); position: relative; width: 100%; min-width: 0; max-width: 100%; overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius-control); background: var(--surface); color: var(--foreground); font-family: var(--font-body); }
.arc-sortable-data-table-scroller { position: relative; overflow-x: auto; overscroll-behavior-x: contain; }
.arc-sortable-data-table-band { position: absolute; top: 0; bottom: 0; background: var(--column-tint); pointer-events: none; }
.arc-sortable-data-table-table { position: relative; z-index: 1; width: 100%; min-width: 560px; border-collapse: separate; border-spacing: 0; font-size: var(--text-sm); line-height: var(--leading-body); letter-spacing: var(--tracking-body); text-align: left; }
.arc-sortable-data-table-table[data-fixed] { table-layout: fixed; }
.arc-sortable-data-table-table caption, .arc-sortable-data-table-srOnly { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
.arc-sortable-data-table-selectCol { width: 44px; }

.arc-sortable-data-table-table th, .arc-sortable-data-table-table td { --cell-base: var(--surface); --cell-fill: var(--cell-base); background-color: var(--cell-fill); transition: background-color var(--duration-standard) var(--ease-standard), color var(--duration-standard) var(--ease-standard); }
.arc-sortable-data-table-table th[data-sorted], .arc-sortable-data-table-table td[data-sorted] { --cell-base: var(--column-tint); }
.arc-sortable-data-table-table th { height: 44px; padding: 0 var(--space-4); border-bottom: 1px solid var(--border); color: var(--text-muted); font-size: var(--text-sm); font-weight: 500; text-align: left; white-space: nowrap; }
.arc-sortable-data-table-table th[data-sortable] { padding: 0; }
.arc-sortable-data-table-table th[data-sorted] { color: var(--foreground); }
.arc-sortable-data-table-table td { height: 52px; padding: 0 var(--space-4); border-bottom: 1px solid var(--border-subtle); color: var(--foreground); font-weight: 400; vertical-align: middle; overflow-wrap: anywhere; }
.arc-sortable-data-table-table tbody tr:last-child td { border-bottom: 0; }
.arc-sortable-data-table-table [data-numeric] { text-align: right; font-variant-numeric: tabular-nums; }
.arc-sortable-data-table-table[data-selectable] tbody tr { cursor: pointer; -webkit-tap-highlight-color: transparent; }
.arc-sortable-data-table-table[data-selectable] tbody tr[data-selected] td { --cell-fill: color-mix(in oklch, var(--accent) 8%, var(--cell-base)); }
.arc-sortable-data-table-table[data-selectable] [data-primary]:not([data-sortable]), .arc-sortable-data-table-table[data-selectable] th[data-primary] .arc-sortable-data-table-sortButton { padding-left: var(--space-2); }

.arc-sortable-data-table-sortButton { display: flex; width: 100%; height: 44px; align-items: center; justify-content: flex-start; border: 0; padding: 0 var(--space-4); background: transparent; color: inherit; font: inherit; letter-spacing: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.arc-sortable-data-table-table th[data-numeric] .arc-sortable-data-table-sortButton { justify-content: flex-end; }
.arc-sortable-data-table-sortInner { display: inline-flex; align-items: center; gap: 6px; border-radius: var(--radius-control); transition: color var(--duration-fast) var(--ease-standard); }
/* Right-aligned columns lead with the arrow so the label lines up with the digits below it. */
.arc-sortable-data-table-table th[data-numeric] .arc-sortable-data-table-sortInner { flex-direction: row-reverse; }
.arc-sortable-data-table-sortIcon { position: relative; display: grid; width: 16px; height: 16px; flex: none; place-items: center; }
.arc-sortable-data-table-sortHint, .arc-sortable-data-table-sortArrow { position: absolute; inset: 0; display: grid; place-items: center; }
.arc-sortable-data-table-sortHint { color: var(--text-muted); opacity: 0; transition: opacity var(--duration-fast) var(--ease-standard); }
.arc-sortable-data-table-sortArrow { color: var(--foreground); }
.arc-sortable-data-table-sortButton:focus-visible { outline: none; }
.arc-sortable-data-table-sortButton:focus-visible .arc-sortable-data-table-sortInner { outline: 2px solid var(--focus-ring); outline-offset: 4px; }
.arc-sortable-data-table-sortButton:focus-visible .arc-sortable-data-table-sortHint { opacity: .6; }
.arc-sortable-data-table-table th[data-sorted] .arc-sortable-data-table-sortHint { opacity: 0; }

.arc-sortable-data-table-selectCell { width: 44px; }
.arc-sortable-data-table-table .arc-sortable-data-table-selectCell { padding: 0 0 0 var(--space-4); }
.arc-sortable-data-table-selectHit { position: relative; display: flex; width: 100%; height: 44px; align-items: center; cursor: pointer; }
.arc-sortable-data-table-selectInput { position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; opacity: 0; cursor: pointer; }
.arc-sortable-data-table-selectBox { position: relative; display: block; width: 18px; height: 18px; flex: none; border: 1px solid var(--border-strong); border-radius: 5px; background: var(--surface); color: var(--accent-foreground); pointer-events: none; transition: border-color var(--duration-fast) var(--ease-standard), transform var(--duration-spring) var(--ease-spring); }
.arc-sortable-data-table-selectBox[data-on] { border-color: var(--accent); }
.arc-sortable-data-table-selectFill { position: absolute; inset: -1px; border-radius: inherit; background: var(--accent); }
.arc-sortable-data-table-selectMark { position: absolute; inset: -1px; width: 18px; height: 18px; overflow: visible; }
.arc-sortable-data-table-selectInput:focus-visible + .arc-sortable-data-table-selectBox { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.arc-sortable-data-table-selectInput:active + .arc-sortable-data-table-selectBox { transform: scale(.95); transition: border-color var(--duration-fast) var(--ease-standard), transform 110ms var(--ease-standard); }

.arc-sortable-data-table-footer { display: flex; height: 44px; align-items: center; justify-content: space-between; gap: var(--space-3); padding: 0 var(--space-2) 0 var(--space-4); border-top: 1px solid var(--border); color: var(--text-muted); font-size: var(--text-sm); line-height: var(--leading-body); letter-spacing: var(--tracking-body); }
.arc-sortable-data-table-count { display: inline-flex; min-width: 0; align-items: baseline; gap: .28em; white-space: nowrap; transition: color var(--duration-standard) var(--ease-standard); }
.arc-sortable-data-table-count[data-active] { color: var(--foreground); }
.arc-sortable-data-table-swap { display: inline-block; }
.arc-sortable-data-table-swapInner { position: relative; display: inline-flex; width: max-content; }
.arc-sortable-data-table-swapText { display: inline-block; white-space: nowrap; }
.arc-sortable-data-table-number { font-variant-numeric: tabular-nums; }
.arc-sortable-data-table-clear { height: 30px; flex: none; border: 0; border-radius: var(--radius-control); padding: 0 var(--space-3); background: transparent; color: var(--foreground); font: inherit; font-weight: 500; letter-spacing: inherit; cursor: pointer; transition: background-color var(--duration-fast) var(--ease-standard); -webkit-tap-highlight-color: transparent; }
.arc-sortable-data-table-clear:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }

.arc-sortable-data-table-empty { height: 120px !important; color: var(--text-muted) !important; text-align: center !important; }

@media (hover: hover) and (pointer: fine) {
  .arc-sortable-data-table-table tbody tr:hover td { --cell-fill: color-mix(in oklch, var(--foreground) 3%, var(--cell-base)); }
  .arc-sortable-data-table-table[data-selectable] tbody tr[data-selected]:hover td { --cell-fill: color-mix(in oklch, var(--accent) 11%, var(--cell-base)); }
  .arc-sortable-data-table-table tbody tr:has(.arc-sortable-data-table-empty):hover td { --cell-fill: var(--cell-base); }
  .arc-sortable-data-table-sortButton:hover .arc-sortable-data-table-sortInner { color: var(--foreground); }
  .arc-sortable-data-table-sortButton:hover .arc-sortable-data-table-sortHint { opacity: .6; }
  .arc-sortable-data-table-table th[data-sorted] .arc-sortable-data-table-sortButton:hover .arc-sortable-data-table-sortHint { opacity: 0; }
  .arc-sortable-data-table-selectHit:hover .arc-sortable-data-table-selectBox:not([data-on]) { border-color: var(--text-muted); }
  .arc-sortable-data-table-clear:hover { background: var(--surface-muted); }
}

@media (max-width: 620px) {
  .arc-sortable-data-table-scroller { overflow: visible; }
  .arc-sortable-data-table-band { display: none; }
  .arc-sortable-data-table-table { display: block; width: 100%; min-width: 0; max-width: 100%; }
  .arc-sortable-data-table-table thead { display: block; }
  /* The header becomes a strip of sort controls, so sorting stays one tap away on a phone. */
  .arc-sortable-data-table-table thead tr { display: flex; align-items: center; gap: var(--space-1); padding: var(--space-1) var(--space-2); overflow-x: auto; border-bottom: 1px solid var(--border); scrollbar-width: none; }
  .arc-sortable-data-table-table thead tr::-webkit-scrollbar { display: none; }
  .arc-sortable-data-table-table th { display: block; flex: none; height: auto; border: 0; padding: 0; background: transparent; }
  /* Select all stays pinned while the sort controls scroll beneath it. */
  .arc-sortable-data-table-table th.selectCell { position: sticky; left: calc(-1 * var(--space-2)); z-index: 1; width: 40px; margin-left: calc(-1 * var(--space-2)); padding: 0 0 0 var(--space-3); background: var(--surface); }
  .arc-sortable-data-table-table th.selectCell .arc-sortable-data-table-selectHit { height: 32px; }
  /* Once the strip scrolls, a fade off the pinned cell hides the word sliding under it. */
  .arc-sortable-data-table-table th.selectCell::after { position: absolute; top: 0; bottom: 0; left: 100%; width: 36px; background: linear-gradient(to right, var(--surface) 45%, transparent); content: ""; opacity: 0; pointer-events: none; animation: stripFade linear both; animation-timeline: scroll(nearest inline); animation-range: 0 24px; }
  .arc-sortable-data-table-table th .arc-sortable-data-table-sortButton, .arc-sortable-data-table-table[data-selectable] th[data-primary] .arc-sortable-data-table-sortButton { width: auto; height: 32px; border-radius: var(--radius-control); padding: 0 10px; transition: background-color var(--duration-standard) var(--ease-standard), color var(--duration-standard) var(--ease-standard); }
  .arc-sortable-data-table-table th[data-sorted] .arc-sortable-data-table-sortButton { background: var(--surface-muted); }
  .arc-sortable-data-table-table th[data-numeric] .arc-sortable-data-table-sortInner { flex-direction: row; }
  .arc-sortable-data-table-sortButton:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 1px; }
  .arc-sortable-data-table-sortButton:focus-visible .arc-sortable-data-table-sortInner { outline: none; }
  .arc-sortable-data-table-table tbody { display: block; width: 100%; }
  /* Rows fold into two lines: the first column with its number, then the remaining details. */
  .arc-sortable-data-table-table tbody tr { --row-fill: var(--surface); position: relative; display: flex; width: 100%; min-height: 64px; box-sizing: border-box; flex-wrap: wrap; align-items: baseline; align-content: center; gap: 2px var(--space-2); padding: 10px var(--space-4); border-bottom: 1px solid var(--border-subtle); background-color: var(--row-fill); transition: background-color var(--duration-standard) var(--ease-standard); }
  .arc-sortable-data-table-table tbody tr::after { order: 1; flex-basis: 100%; content: ""; }
  .arc-sortable-data-table-table[data-selectable] tbody tr { padding-left: 44px; }
  .arc-sortable-data-table-table[data-selectable] tbody tr[data-selected] { --row-fill: color-mix(in oklch, var(--accent) 8%, var(--surface)); }
  .arc-sortable-data-table-table tbody tr:last-child { border-bottom: 0; }
  .arc-sortable-data-table-table td { order: 2; display: block; min-width: 0; height: auto; border: 0; padding: 0; background: transparent; color: var(--text-secondary); font-size: var(--text-xs); text-align: left; }
  .arc-sortable-data-table-table[data-selectable] td[data-primary]:not([data-sortable]) { padding-left: 0; }
  .arc-sortable-data-table-table td[data-primary] { order: 0; flex: 1 1 0; color: var(--foreground); font-size: var(--text-sm); font-weight: 500; }
  .arc-sortable-data-table-table td[data-numeric]:not([data-primary]) { order: 0; flex: none; margin-left: auto; padding-left: var(--space-2); color: var(--foreground); font-size: var(--text-sm); }
  .arc-sortable-data-table-table td[data-numeric] ~ td[data-numeric] { order: 2; margin-left: 0; padding-left: 0; color: var(--text-secondary); font-size: var(--text-xs); }
  /* The sorted value lifts to full contrast, echoing the tinted column on wider screens. */
  .arc-sortable-data-table-table td[data-sorted]:not([data-primary]) { color: var(--foreground); }
  .arc-sortable-data-table-table td.selectCell { position: absolute; top: 0; bottom: 0; left: var(--space-1); display: flex; width: 36px; align-items: center; padding: 0; }
  .arc-sortable-data-table-table td.selectCell .arc-sortable-data-table-selectHit { justify-content: center; }
  .arc-sortable-data-table-table .arc-sortable-data-table-empty { flex: 1 0 100%; height: auto !important; padding: var(--space-6) 0; }
  .arc-sortable-data-table-table[data-selectable] tbody tr:has(.arc-sortable-data-table-empty) { padding-left: var(--space-4); }
}
@media (max-width: 620px) and (hover: hover) and (pointer: fine) {
  .arc-sortable-data-table-table tbody tr:hover { --row-fill: color-mix(in oklch, var(--foreground) 3%, var(--surface)); }
  .arc-sortable-data-table-table[data-selectable] tbody tr[data-selected]:hover { --row-fill: color-mix(in oklch, var(--accent) 11%, var(--surface)); }
  .arc-sortable-data-table-table tbody tr:hover td { background: transparent; }
}

@media (prefers-reduced-motion: reduce) {
  .arc-sortable-data-table-table th, .arc-sortable-data-table-table td, .arc-sortable-data-table-table tbody tr, .arc-sortable-data-table-sortInner, .arc-sortable-data-table-sortHint, .arc-sortable-data-table-selectBox, .arc-sortable-data-table-count, .arc-sortable-data-table-clear, .arc-sortable-data-table-table th .arc-sortable-data-table-sortButton { transition: none !important; }
  .arc-sortable-data-table-selectInput:active + .arc-sortable-data-table-selectBox { transform: none; }
}

@keyframes stripFade { to { opacity: 1; } }
`;

const styles: Record<string, string> = new Proxy({
  "band": "arc-sortable-data-table-band",
  "clear": "arc-sortable-data-table-clear",
  "count": "arc-sortable-data-table-count",
  "empty": "arc-sortable-data-table-empty",
  "footer": "arc-sortable-data-table-footer",
  "number": "arc-sortable-data-table-number",
  "scroller": "arc-sortable-data-table-scroller",
  "selectBox": "arc-sortable-data-table-selectBox",
  "selectCell": "arc-sortable-data-table-selectCell",
  "selectCol": "arc-sortable-data-table-selectCol",
  "selectFill": "arc-sortable-data-table-selectFill",
  "selectHit": "arc-sortable-data-table-selectHit",
  "selectInput": "arc-sortable-data-table-selectInput",
  "selectMark": "arc-sortable-data-table-selectMark",
  "sortArrow": "arc-sortable-data-table-sortArrow",
  "sortButton": "arc-sortable-data-table-sortButton",
  "sortHint": "arc-sortable-data-table-sortHint",
  "sortIcon": "arc-sortable-data-table-sortIcon",
  "sortInner": "arc-sortable-data-table-sortInner",
  "srOnly": "arc-sortable-data-table-srOnly",
  "swap": "arc-sortable-data-table-swap",
  "swapInner": "arc-sortable-data-table-swapInner",
  "swapText": "arc-sortable-data-table-swapText",
  "table": "arc-sortable-data-table-table",
  "wrapper": "arc-sortable-data-table-wrapper"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-sortable-data-table-${prop}`,
});



export type SortDirection = "asc" | "desc";
export type SortState = { key: string; direction: SortDirection };

export type DataColumn<T> = {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => ReactNode;
  /** Right-aligns the column with tabular numerals. Detected when every value is a number. */
  numeric?: boolean;
  /** Fixed width such as 120 or "20%". Other columns are measured once and held, so sorting never reflows them. */
  width?: number | string;
};

export type SortableDataTableProps<T extends Record<string, unknown>> = {
  rows: T[];
  columns: DataColumn<T>[];
  rowKey: keyof T | ((row: T) => string);
  caption?: string;
  emptyMessage?: string;
  /** Sort applied on the first render. */
  defaultSort?: SortState;
  onSortChange?: (sort: SortState) => void;
  /** Adds a checkbox column, row click selection, and a count line with a clear action. */
  selectable?: boolean;
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  /** Noun for the count line, as in "6 projects". */
  itemName?: { one: string; other: string };
};

const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });
const isEmpty = (value: unknown) => value == null || value === "";
const comparable = (value: unknown) => value instanceof Date ? value.getTime() : value;
const blur = (px: number) => `blur(${px}px)`;
const enter: Transition = { duration: .22, ease: [...motionTokens.ease.enter] };
const leave: Transition = { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] };
const instant: Transition = { duration: motionTokens.duration.instant };
/** Changing text rises in from the side it is moving toward and lifts away on the other. */
const rise: Variants = {
  enter: (direction: number) => ({ opacity: 0, y: `${.3 * direction}em`, filter: blur(motionTokens.blur.soft) }),
  shown: { opacity: 1, y: "0em", filter: blur(0), transition: enter },
  gone: (direction: number) => ({ opacity: 0, y: `${-.3 * direction}em`, filter: blur(motionTokens.blur.subtle), transition: leave }),
};
/** Reduced motion keeps the same properties as rise (no travel, no blur) so the server and a reduced-motion client render identical styles. */
const fade: Variants = { enter: { opacity: 0, y: "0em", filter: blur(0) }, shown: { opacity: 1, y: "0em", filter: blur(0), transition: instant }, gone: { opacity: 0, y: "0em", filter: blur(0), transition: instant } };
/** Check and dash share three points, so the header box morphs between all and some. */
const checkPath = "M4.25 9.25 L7.25 12.25 L13.75 5.75";
const dashPath = "M4.75 9 L9 9 L13.25 9";

/** Text that changes in place. The slot eases to the new width, so the words beside it never jump. */
function Swap({ value, direction, reduced, className }: { value: string; direction: number; reduced: boolean; className?: string }) {
  const inner = useRef<HTMLSpanElement>(null);
  const width = useMotionValue<number | string>("auto");
  useLayoutEffect(() => {
    const node = inner.current;
    if (!node) return;
    let settled = false;
    const measure = () => {
      const next = node.getBoundingClientRect().width;
      if (settled && !reduced) animate(width, next, motionTokens.spring.morph); else width.jump(next);
      settled = true;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced, width]);
  return <motion.span className={[styles.swap, className].filter(Boolean).join(" ")} style={{ width }}>
    <span ref={inner} className={styles.swapInner}>
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <motion.span key={value} className={styles.swapText} custom={direction} variants={reduced ? fade : rise} initial="enter" animate="shown" exit="gone">{value}</motion.span>
      </AnimatePresence>
    </span>
  </motion.span>;
}

/** The arrow fades in where a column becomes sorted and flips on a spring when the direction changes. */
function SortGlyph({ active, descending, reduced }: { active: boolean; descending: boolean; reduced: boolean }) {
  const rotate = useMotionValue(descending ? 180 : 0);
  const seen = useRef({ active, hiddenAt: -Infinity });
  useLayoutEffect(() => {
    const state = seen.current;
    if (active) {
      // Turn only while the arrow is visible; a freshly shown arrow starts pointing the right way.
      const visible = state.active || performance.now() - state.hiddenAt < 160;
      if (visible && !reduced) animate(rotate, descending ? 180 : 0, motionTokens.spring.snappy);
      else rotate.jump(descending ? 180 : 0);
    } else if (state.active) state.hiddenAt = performance.now();
    state.active = active;
  }, [active, descending, reduced, rotate]);
  const transition: Transition = reduced ? instant : active ? { opacity: enter, filter: enter, scale: motionTokens.spring.snappy } : { duration: motionTokens.duration.instant, ease: [...motionTokens.ease.standard] };
  return <span className={styles.sortIcon} aria-hidden="true">
    <ArrowUp className={styles.sortHint} size={16} strokeWidth={1.75} />
    <motion.span className={styles.sortArrow} style={{ rotate }} initial={false} animate={active ? { opacity: 1, scale: 1, filter: blur(0) } : { opacity: 0, scale: .6, filter: blur(motionTokens.blur.subtle) }} transition={transition}><ArrowUp size={16} strokeWidth={1.75} /></motion.span>
  </span>;
}

function SelectBox({ checked, mixed = false, label, nav, reduced, onToggle, inputRef }: { checked: boolean; mixed?: boolean; label: string; nav: "head" | "row"; reduced: boolean; onToggle: (extend: boolean) => void; inputRef?: RefObject<HTMLInputElement | null> }) {
  const local = useRef<HTMLInputElement>(null);
  const ref = inputRef ?? local;
  const on = checked || mixed;
  useLayoutEffect(() => { if (ref.current) ref.current.indeterminate = mixed; }, [mixed, ref]);
  const opacity: Transition = { duration: on ? motionTokens.duration.instant : motionTokens.duration.fast, ease: [...motionTokens.ease.standard] };
  return <label className={styles.selectHit}>
    <input ref={ref} type="checkbox" className={styles.selectInput} checked={checked} aria-label={label} data-nav={nav} onChange={event => onToggle((event.nativeEvent as MouseEvent).shiftKey === true)} />
    <span className={styles.selectBox} data-on={on || undefined} aria-hidden="true">
      <motion.span className={styles.selectFill} initial={false} animate={{ opacity: on ? 1 : 0, scale: on ? 1 : .6 }} transition={reduced ? { duration: 0 } : { scale: motionTokens.spring.snappy, opacity }} />
      <svg className={styles.selectMark} viewBox="0 0 18 18" fill="none" focusable="false">
        <motion.path initial={false} animate={{ d: mixed ? dashPath : checkPath, pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }} transition={reduced ? { duration: 0 } : { d: motionTokens.spring.morph, pathLength: motionTokens.spring.snappy, opacity }} stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  </label>;
}

export function SortableDataTable<T extends Record<string, unknown>>({ rows, columns, rowKey, caption = "Data table", emptyMessage = "No rows to show", defaultSort, onSortChange, selectable = false, selectedKeys, defaultSelectedKeys, onSelectionChange, itemName = { one: "row", other: "rows" } }: SortableDataTableProps<T>) {
  const reduced = useReducedMotion() ?? false;
  const tableRef = useRef<HTMLTableElement>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const anchor = useRef<string | null>(null);
  const [sort, setSort] = useState<SortState | null>(defaultSort ?? null);
  const [announcement, setAnnouncement] = useState("");
  const [internalSelection, setInternalSelection] = useState<string[]>(defaultSelectedKeys ?? []);
  const selection = useMemo(() => new Set(selectedKeys ?? internalSelection), [internalSelection, selectedKeys]);

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    return rows.map((row, index) => ({ row, index })).sort((a, b) => {
      const left = comparable(a.row[sort.key]);
      const right = comparable(b.row[sort.key]);
      // Empty values stay at the bottom in both directions.
      if (isEmpty(left) || isEmpty(right)) return isEmpty(left) === isEmpty(right) ? a.index - b.index : isEmpty(left) ? 1 : -1;
      const result = typeof left === "number" && typeof right === "number" ? left - right : collator.compare(String(left), String(right));
      return (sort.direction === "asc" ? result : -result) || a.index - b.index;
    }).map(entry => entry.row);
  }, [rows, sort]);

  const numeric = useMemo(() => new Set(columns.filter(column => column.numeric ?? (rows.some(row => typeof row[column.key] === "number") && rows.every(row => typeof row[column.key] === "number" || isEmpty(row[column.key])))).map(column => column.key)), [columns, rows]);
  const getRowKey = (row: T) => String(typeof rowKey === "function" ? rowKey(row) : row[rowKey]);
  const keys = sortedRows.map(getRowKey);
  const order = keys.join("\u0000");
  const selectedCount = keys.filter(key => selection.has(key)).length;
  const allSelected = keys.length > 0 && selectedCount === keys.length;

  // Measure the natural column widths once, then hold them with a fixed layout so nothing reflows while rows move.
  const signature = [selectable ? "select" : "", ...columns.map(column => column.key)].join("\u0000");
  const [locked, setLocked] = useState<{ signature: string; widths: Record<string, number> } | null>(null);
  const widths = locked?.signature === signature ? locked.widths : null;
  useLayoutEffect(() => {
    const table = tableRef.current;
    if (!table || widths) return;
    const measure = () => {
      const total = table.getBoundingClientRect().width;
      if (!total || getComputedStyle(table).display !== "table") return false;
      const next: Record<string, number> = {};
      table.querySelectorAll<HTMLElement>("thead th[data-key]").forEach(cell => { next[cell.dataset.key ?? ""] = cell.getBoundingClientRect().width / total * 100; });
      setLocked({ signature, widths: next });
      return true;
    };
    if (measure()) return;
    const observer = new ResizeObserver(() => { if (measure()) observer.disconnect(); });
    observer.observe(table);
    return () => observer.disconnect();
  }, [signature, widths]);

  // A still tint under the sorted column fills the gaps that open while rows pass each other.
  const [band, setBand] = useState<{ left: number; width: number } | null>(null);
  const seenSort = useRef(false);
  useLayoutEffect(() => {
    const table = tableRef.current;
    const key = sort?.key;
    const update = () => {
      const cell = key ? table?.querySelector<HTMLElement>(`thead th[data-key="${CSS.escape(key)}"]`) : null;
      setBand(current => !cell ? null : current?.left === cell.offsetLeft && current.width === cell.offsetWidth ? current : { left: cell.offsetLeft, width: cell.offsetWidth });
    };
    update();
    if (!table || !key) return;
    // On a phone the header is a scrolling strip of sort controls; keep the active one in view.
    const cell = table.querySelector<HTMLElement>(`thead th[data-key="${CSS.escape(key)}"]`);
    const strip = cell?.parentElement;
    if (cell && strip && strip.scrollWidth > strip.clientWidth && getComputedStyle(table).display !== "table") {
      const bounds = strip.getBoundingClientRect(), target = cell.getBoundingClientRect(), inset = 8;
      const start = Math.max(bounds.left, strip.querySelector("th:not([data-key])")?.getBoundingClientRect().right ?? bounds.left) + inset;
      const shift = target.right > bounds.right - inset ? target.right - bounds.right + inset : target.left < start ? target.left - start : 0;
      if (shift) strip.scrollTo({ left: strip.scrollLeft + shift, behavior: reduced || !seenSort.current ? "auto" : "smooth" });
    }
    seenSort.current = true;
    const observer = new ResizeObserver(update);
    observer.observe(table);
    return () => observer.disconnect();
  }, [reduced, sort?.key, widths]);

  const shownCount = selectedCount || keys.length;
  const noun = selectedCount ? "selected" : keys.length === 1 ? itemName.one : itemName.other;
  const [lastCount, setLastCount] = useState(shownCount);
  const [countDirection, setCountDirection] = useState(1);
  if (shownCount !== lastCount) { setLastCount(shownCount); setCountDirection(shownCount > lastCount ? 1 : -1); }

  function sortBy(column: DataColumn<T>) {
    const next: SortState = { key: column.key, direction: sort?.key === column.key && sort.direction === "asc" ? "desc" : "asc" };
    setSort(next);
    onSortChange?.(next);
    setAnnouncement(`Sorted by ${column.label}, ${next.direction === "asc" ? "ascending" : "descending"}`);
  }

  function commit(next: Set<string>) {
    const list = keys.filter(key => next.has(key));
    if (selectedKeys === undefined) setInternalSelection(list);
    onSelectionChange?.(list);
    setAnnouncement(list.length ? `${list.length} of ${keys.length} selected` : "Selection cleared");
  }

  function toggleRow(key: string, extend: boolean) {
    const next = new Set(selection);
    const checked = !selection.has(key);
    const from = extend && anchor.current ? keys.indexOf(anchor.current) : -1;
    const to = keys.indexOf(key);
    (from < 0 ? [key] : keys.slice(Math.min(from, to), Math.max(from, to) + 1)).forEach(item => checked ? next.add(item) : next.delete(item));
    anchor.current = key;
    commit(next);
  }

  function clearSelection() {
    commit(new Set());
    selectAllRef.current?.focus();
  }

  function onRowClick(event: ReactMouseEvent<HTMLTableRowElement>, key: string) {
    if (!selectable || (event.target as HTMLElement).closest("a, button, input, label, select, textarea, [role='button'], [contenteditable='true']") || window.getSelection()?.toString()) return;
    toggleRow(key, event.shiftKey);
    // Keep the keyboard path where the pointer left off, so arrows continue from this row.
    event.currentTarget.querySelector<HTMLInputElement>("input[type='checkbox']")?.focus({ preventScroll: true });
  }

  /** Arrows walk the header controls and the row checkboxes; Escape clears the selection. */
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (event.key === "Escape" && selectedCount) {
      event.preventDefault();
      event.stopPropagation();
      if (target.dataset.clear !== undefined) clearSelection(); else commit(new Set());
      return;
    }
    const nav = target.dataset.nav;
    if (!nav) return;
    const list = (name: string) => [...event.currentTarget.querySelectorAll<HTMLElement>(`[data-nav="${name}"]`)];
    const items = list(nav);
    const index = items.indexOf(target);
    const steps: Record<string, [HTMLElement[], number]> = nav === "head"
      ? { ArrowRight: [items, index + 1], ArrowLeft: [items, index - 1], Home: [items, 0], End: [items, items.length - 1], ...(target === selectAllRef.current ? { ArrowDown: [list("row"), 0] } : {}) }
      : { ArrowDown: [items, index + 1], ArrowUp: index === 0 && selectAllRef.current ? [[selectAllRef.current], 0] : [items, index - 1], Home: [items, 0], End: [items, items.length - 1] };
    const step = steps[event.key];
    const next = step?.[0][step[1]];
    if (!next) return;
    event.preventDefault();
    next.focus();
  }

  return <div className={styles.wrapper} onKeyDown={onKeyDown}>
    <div className={styles.scroller}>
      {band ? <span className={styles.band} style={{ left: band.left, width: band.width }} aria-hidden="true" /> : null}
      <table ref={tableRef} role="table" className={styles.table} data-fixed={widths ? "" : undefined} data-selectable={selectable || undefined}>
        <caption>{caption}</caption>
        <colgroup>
          {selectable ? <col className={styles.selectCol} /> : null}
          {columns.map((column, index) => <col key={column.key} style={{ width: column.width !== undefined ? (typeof column.width === "number" ? `${column.width}px` : column.width) : widths && index > 0 ? `${widths[column.key]}%` : undefined }} />)}
        </colgroup>
        <thead role="rowgroup"><tr role="row">
          {selectable ? <th scope="col" role="columnheader" className={styles.selectCell}><SelectBox inputRef={selectAllRef} checked={allSelected} mixed={selectedCount > 0 && !allSelected} label="Select all rows" nav="head" reduced={reduced} onToggle={() => commit(allSelected ? new Set() : new Set(keys))} /></th> : null}
          {columns.map((column, index) => {
            const active = sort?.key === column.key;
            const sortable = column.sortable !== false;
            return <th key={column.key} scope="col" role="columnheader" data-key={column.key} data-primary={index === 0 || undefined} data-sorted={active || undefined} data-numeric={numeric.has(column.key) || undefined} data-sortable={sortable || undefined} aria-sort={!sortable ? undefined : active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}>
              {sortable ? <button className={styles.sortButton} type="button" data-nav="head" onClick={() => sortBy(column)} aria-label={`Sort by ${column.label}${active ? `, currently ${sort.direction === "asc" ? "ascending" : "descending"}` : ""}`}>
                <span className={styles.sortInner}><span>{column.label}</span><SortGlyph active={active} descending={active && sort.direction === "desc"} reduced={reduced} /></span>
              </button> : column.label}
            </th>;
          })}
        </tr></thead>
        <tbody role="rowgroup">{sortedRows.length ? sortedRows.map((row, index) => {
          const key = keys[index];
          const selected = selectable && selection.has(key);
          return <motion.tr key={key} role="row" layout={reduced ? false : "position"} layoutDependency={order} transition={motionTokens.spring.smooth} data-selected={selected || undefined} onClick={event => onRowClick(event, key)} onMouseDown={event => { if (selectable && event.shiftKey) event.preventDefault(); }}>
            {selectable ? <td role="cell" className={styles.selectCell}><SelectBox checked={selected} label={`Select ${String(row[columns[0]?.key] ?? key)}`} nav="row" reduced={reduced} onToggle={extend => toggleRow(key, extend)} /></td> : null}
            {columns.map((column, columnIndex) => <td key={column.key} role="cell" data-label={column.label} data-primary={columnIndex === 0 || undefined} data-sorted={sort?.key === column.key || undefined} data-numeric={numeric.has(column.key) || undefined}>{column.render ? column.render(row[column.key], row) : String(row[column.key] ?? "–")}</td>)}
          </motion.tr>;
        }) : <tr role="row"><td role="cell" className={styles.empty} colSpan={columns.length + (selectable ? 1 : 0)}>{emptyMessage}</td></tr>}</tbody>
      </table>
    </div>
    {selectable ? <div className={styles.footer}>
      <span className={styles.srOnly}>{shownCount} {noun}</span>
      <span className={styles.count} data-active={selectedCount > 0 || undefined} aria-hidden="true">
        <Swap className={styles.number} value={String(shownCount)} direction={countDirection} reduced={reduced} />
        <Swap value={noun} direction={selectedCount ? 1 : -1} reduced={reduced} />
      </span>
      <AnimatePresence initial={false}>{selectedCount ? <motion.button key="clear" type="button" className={styles.clear} data-clear="" onClick={clearSelection} initial={reduced ? { opacity: 0 } : { opacity: 0, scale: .96, filter: blur(motionTokens.blur.soft) }} animate={{ opacity: 1, scale: 1, filter: blur(0) }} exit={reduced ? { opacity: 0, transition: instant } : { opacity: 0, scale: .98, filter: blur(motionTokens.blur.subtle), transition: leave }} transition={reduced ? instant : enter} whileTap={reduced ? undefined : { scale: .97, transition: { duration: motionTokens.duration.instant } }}>Clear selection</motion.button> : null}</AnimatePresence>
    </div> : null}
    <p className={styles.srOnly} role="status">{announcement}</p>
  </div>;
}

export default SortableDataTable;
