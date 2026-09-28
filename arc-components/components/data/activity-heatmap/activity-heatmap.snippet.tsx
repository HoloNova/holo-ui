"use client";

import type { CSSProperties, FocusEvent, KeyboardEvent, PointerEvent, ReactNode } from "react";
import type { Variants } from "motion/react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion } from "motion/react";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

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
const ARC_ACTIVITY_HEATMAP_STYLES = `/* Levels are tints of the accent over a neutral empty square, so the grid follows the selected accent and both themes. */
.arc-activity-heatmap-root { --level-0: color-mix(in oklch, var(--foreground) 6.5%, var(--surface)); --level-1: color-mix(in oklch, var(--accent) 26%, var(--level-0)); --level-2: color-mix(in oklch, var(--accent) 50%, var(--level-0)); --level-3: color-mix(in oklch, var(--accent) 76%, var(--level-0)); --level-4: var(--accent); container-type: inline-size; position: relative; display: grid; min-width: 0; gap: var(--space-4); color: var(--foreground); }
.arc-activity-heatmap-header { display: flex; min-width: 0; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-3) var(--space-4); }
.arc-activity-heatmap-summary { display: flex; min-width: 0; flex-wrap: wrap; align-items: baseline; column-gap: .3em; margin: 0; color: var(--text-secondary); font-size: var(--text-sm); line-height: var(--leading-body); font-variant-numeric: tabular-nums; }
.arc-activity-heatmap-total { color: var(--foreground); font-weight: 500; white-space: nowrap; }
.arc-activity-heatmap-period { white-space: nowrap; }
.arc-activity-heatmap-actions { display: flex; flex: none; align-items: center; }
.arc-activity-heatmap-rollingFrame { display: inline-flex; justify-content: flex-end; overflow: clip; overflow-clip-margin: .2em; }
.arc-activity-heatmap-rolling { display: inline-flex; flex: none; }
/* Each place is its own window, so a turning digit clips at the line instead of brushing the next line of text. */
.arc-activity-heatmap-place { position: relative; display: inline-flex; overflow: clip; overflow-clip-margin: .15em; }
.arc-activity-heatmap-placeChar, .arc-activity-heatmap-riseLine { display: inline-block; }
.arc-activity-heatmap-rise { position: relative; display: inline-flex; }

/* The scroller starts at its right edge on narrow screens (the most recent weeks) without script, through its writing direction. */
.arc-activity-heatmap-scroller { direction: rtl; overflow-x: auto; overflow-y: hidden; margin: -6px; padding: 6px; overscroll-behavior-x: contain; scrollbar-color: var(--border-strong) transparent; scrollbar-width: thin; }
.arc-activity-heatmap-canvas { --gap: 3px; --label: 30px; --cell: clamp(9px, calc((100cqi - var(--label) - var(--gap) * 53) / 53), 15px); --step: calc(var(--cell) + var(--gap)); direction: ltr; display: grid; width: max-content; grid-template-columns: var(--label) auto; grid-template-rows: auto auto; column-gap: var(--gap); row-gap: var(--space-2); }
.arc-activity-heatmap-months { position: relative; grid-row: 1; grid-column: 2; height: 1rem; color: var(--text-muted); font-size: var(--text-xs); line-height: 1rem; }
/* Month labels glide to their new week when a range starts on a different weekday. */
.arc-activity-heatmap-month { position: absolute; top: 0; left: 0; white-space: nowrap; transform: translateX(calc(var(--col) * var(--step))); transition: transform var(--duration-spring) var(--ease-spring); }
/* Weekday labels stay pinned while a narrow grid scrolls under them. Set --heatmap-surface when the heatmap sits on another surface. */
.arc-activity-heatmap-weekdays { position: sticky; z-index: 1; left: -6px; display: grid; grid-row: 1 / 3; grid-column: 1; grid-template-rows: repeat(7, var(--cell)); align-content: end; row-gap: var(--gap); margin: 0 calc(var(--gap) * -1) 0 -6px; padding: 0 var(--gap) 0 6px; background: var(--heatmap-surface, var(--surface)); color: var(--text-muted); font-size: var(--text-xs); }
.arc-activity-heatmap-weekday { display: flex; height: var(--cell); align-items: center; white-space: nowrap; line-height: 1; }
.arc-activity-heatmap-plot { position: relative; grid-row: 2; grid-column: 2; }
.arc-activity-heatmap-grid { display: grid; gap: var(--gap); outline: none; }
.arc-activity-heatmap-row { display: flex; gap: var(--gap); }

/* One square per day. The wave delay rides a custom property so a reveal and a recolor sweep the same diagonal. */
.arc-activity-heatmap-cell { --delay: var(--wave); display: block; width: var(--cell); height: var(--cell); flex: none; border-radius: calc(var(--cell) * .28); background: var(--level-0); outline: 1.5px solid transparent; outline-offset: 1px; cursor: default; -webkit-tap-highlight-color: transparent; transition: background-color 320ms var(--ease-standard) var(--delay), transform var(--duration-spring) var(--ease-spring) var(--delay), opacity var(--duration-fast) var(--ease-standard); }
.arc-activity-heatmap-grid[data-direction="back"] .arc-activity-heatmap-cell { --delay: var(--wave-back); }
.arc-activity-heatmap-cell[data-level="1"] { background: var(--level-1); }
.arc-activity-heatmap-cell[data-level="2"] { background: var(--level-2); }
.arc-activity-heatmap-cell[data-level="3"] { background: var(--level-3); }
.arc-activity-heatmap-cell[data-level="4"] { background: var(--level-4); }
/* Days outside the range shrink away in the sweep and grow back when a range needs them. */
.arc-activity-heatmap-cell[data-empty] { transform: scale(0); background: var(--level-0); }
.arc-activity-heatmap-grid[data-reveal="hidden"] .arc-activity-heatmap-cell { opacity: 0; transform: scale(.5); transition: none; }
.arc-activity-heatmap-grid[data-reveal="hidden"] .arc-activity-heatmap-cell[data-empty] { transform: scale(0); }
.arc-activity-heatmap-grid[data-reveal="revealing"] .arc-activity-heatmap-cell { transition: background-color 320ms var(--ease-standard) var(--delay), transform var(--duration-spring) var(--ease-spring) var(--delay), opacity 360ms var(--ease-enter) var(--delay); }
.arc-activity-heatmap-grid[data-highlight] .arc-activity-heatmap-cell:not([data-empty]) { opacity: .2; }
.arc-activity-heatmap-grid[data-highlight="0"] .arc-activity-heatmap-cell[data-level="0"], .arc-activity-heatmap-grid[data-highlight="1"] .arc-activity-heatmap-cell[data-level="1"], .arc-activity-heatmap-grid[data-highlight="2"] .arc-activity-heatmap-cell[data-level="2"], .arc-activity-heatmap-grid[data-highlight="3"] .arc-activity-heatmap-cell[data-level="3"], .arc-activity-heatmap-grid[data-highlight="4"] .arc-activity-heatmap-cell[data-level="4"] { opacity: 1; }
@media (hover: hover) and (pointer: fine) { .arc-activity-heatmap-cell:not([data-empty]):hover { outline-color: color-mix(in oklch, var(--foreground) 45%, transparent); } }
.arc-activity-heatmap-cell:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.arc-activity-heatmap-cell[aria-selected="true"]:focus-visible { outline-color: transparent; }

/* The selection ring glides between days, and follows its day when the range changes. */
.arc-activity-heatmap-ring { position: absolute; top: -3px; left: -3px; width: calc(var(--cell) + 6px); height: calc(var(--cell) + 6px); border: 1.5px solid var(--foreground); border-radius: calc(var(--cell) * .28 + 3px); opacity: 0; pointer-events: none; transform: translate(calc(var(--col) * var(--step)), calc(var(--row) * var(--step))); transition: transform var(--duration-spring) var(--ease-spring), opacity var(--duration-fast) var(--ease-standard); }
.arc-activity-heatmap-ring[data-shown] { opacity: 1; }

.arc-activity-heatmap-legend { display: flex; min-width: 0; align-items: center; justify-content: space-between; gap: var(--space-3); color: var(--text-muted); font-size: var(--text-xs); }
/* The caption names the previewed level; it sits apart from the scale so its changing width never nudges the swatches. */
.arc-activity-heatmap-caption { position: relative; min-width: 0; overflow: hidden; color: var(--text-secondary); font-variant-numeric: tabular-nums; white-space: nowrap; text-overflow: ellipsis; }
.arc-activity-heatmap-scale { display: flex; flex: none; align-items: center; gap: var(--space-2); }
.arc-activity-heatmap-captionShort { display: none; }
/* Narrow cards keep the day count and let the highlighted squares say which level it is. */
@container (max-width: 440px) { .arc-activity-heatmap-captionLong { display: none; } .arc-activity-heatmap-captionShort { display: inline; } }
.arc-activity-heatmap-legendText { line-height: 1; }
.arc-activity-heatmap-swatches { display: flex; }
/* The visible square stays the size of a day while the button keeps a comfortable target around it. */
.arc-activity-heatmap-swatch { position: relative; display: grid; width: 15px; height: 20px; place-items: center; padding: 0; border: 0; border-radius: 4px; background: transparent; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.arc-activity-heatmap-swatch::before { content: ""; width: 11px; height: 11px; border-radius: 3px; background: var(--level-0); }
.arc-activity-heatmap-swatch[data-level="1"]::before { background: var(--level-1); }
.arc-activity-heatmap-swatch[data-level="2"]::before { background: var(--level-2); }
.arc-activity-heatmap-swatch[data-level="3"]::before { background: var(--level-3); }
.arc-activity-heatmap-swatch[data-level="4"]::before { background: var(--level-4); }
.arc-activity-heatmap-swatch[aria-pressed="true"] { box-shadow: inset 0 0 0 1.5px var(--foreground); }
.arc-activity-heatmap-swatch:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 1px; }

/* One bubble for the whole grid. The outer layer glides between cells; the bubble fades and scales from its tail. */
.arc-activity-heatmap-tip { position: absolute; z-index: 5; top: 0; left: 0; width: 0; height: 0; pointer-events: none; }
.arc-activity-heatmap-bubble { position: absolute; bottom: 8px; left: 0; display: block; padding: 7px 12px 8px; border: 1px solid color-mix(in oklch, var(--background) 14%, var(--foreground)); border-radius: var(--radius-control); background: var(--foreground); color: var(--background); box-shadow: var(--shadow-raised); transform-origin: 50% 100%; will-change: transform, opacity; }
.arc-activity-heatmap-tipBody { position: relative; display: block; overflow: clip; overflow-clip-margin: 8px; }
.arc-activity-heatmap-tipMeasure { position: absolute; top: 0; left: 0; display: grid; width: max-content; visibility: hidden; }
.arc-activity-heatmap-tipLines { display: grid; width: max-content; }
.arc-activity-heatmap-tipMeasure > span, .arc-activity-heatmap-tipLines > span { white-space: nowrap; }
.arc-activity-heatmap-tipPrimary { font-size: var(--text-sm); font-weight: 500; line-height: 1.3; font-variant-numeric: tabular-nums; }
.arc-activity-heatmap-tipSecondary { color: color-mix(in oklch, var(--background) 68%, var(--foreground)); font-size: var(--text-xs); line-height: 1.35; }

.arc-activity-heatmap-srOnly { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

@media (prefers-reduced-motion: reduce) {
  .arc-activity-heatmap-cell, .arc-activity-heatmap-grid[data-reveal="revealing"] .arc-activity-heatmap-cell { transition: background-color 150ms linear, opacity 150ms linear; }
  .arc-activity-heatmap-grid[data-reveal="hidden"] .arc-activity-heatmap-cell { transform: none; }
  .arc-activity-heatmap-cell[data-empty], .arc-activity-heatmap-grid[data-reveal="hidden"] .arc-activity-heatmap-cell[data-empty] { opacity: 0; transform: none; }
  .arc-activity-heatmap-month, .arc-activity-heatmap-ring { transition: opacity 150ms linear; }
}
`;

const styles: Record<string, string> = new Proxy({
  "actions": "arc-activity-heatmap-actions",
  "bubble": "arc-activity-heatmap-bubble",
  "canvas": "arc-activity-heatmap-canvas",
  "caption": "arc-activity-heatmap-caption",
  "captionLong": "arc-activity-heatmap-captionLong",
  "captionShort": "arc-activity-heatmap-captionShort",
  "cell": "arc-activity-heatmap-cell",
  "grid": "arc-activity-heatmap-grid",
  "header": "arc-activity-heatmap-header",
  "legend": "arc-activity-heatmap-legend",
  "legendText": "arc-activity-heatmap-legendText",
  "month": "arc-activity-heatmap-month",
  "months": "arc-activity-heatmap-months",
  "period": "arc-activity-heatmap-period",
  "place": "arc-activity-heatmap-place",
  "placeChar": "arc-activity-heatmap-placeChar",
  "plot": "arc-activity-heatmap-plot",
  "ring": "arc-activity-heatmap-ring",
  "rise": "arc-activity-heatmap-rise",
  "riseLine": "arc-activity-heatmap-riseLine",
  "rolling": "arc-activity-heatmap-rolling",
  "rollingFrame": "arc-activity-heatmap-rollingFrame",
  "root": "arc-activity-heatmap-root",
  "row": "arc-activity-heatmap-row",
  "scale": "arc-activity-heatmap-scale",
  "scroller": "arc-activity-heatmap-scroller",
  "srOnly": "arc-activity-heatmap-srOnly",
  "summary": "arc-activity-heatmap-summary",
  "swatch": "arc-activity-heatmap-swatch",
  "swatches": "arc-activity-heatmap-swatches",
  "tip": "arc-activity-heatmap-tip",
  "tipBody": "arc-activity-heatmap-tipBody",
  "tipLines": "arc-activity-heatmap-tipLines",
  "tipMeasure": "arc-activity-heatmap-tipMeasure",
  "tipPrimary": "arc-activity-heatmap-tipPrimary",
  "tipSecondary": "arc-activity-heatmap-tipSecondary",
  "total": "arc-activity-heatmap-total",
  "weekday": "arc-activity-heatmap-weekday",
  "weekdays": "arc-activity-heatmap-weekdays"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-activity-heatmap-${prop}`,
});



export interface ActivityDay {
  /** Calendar day as YYYY-MM-DD. */
  date: string;
  count: number;
}

/**
 * A contribution style calendar: one square per day, weeks as columns, with four accent tints for how busy a day was.
 * Use it when rhythm, streaks, and quiet weeks matter more than exact comparisons; use a bar chart when the exact
 * comparison is the point. Cells wave in once on view, a tooltip glides between cells on hover or keyboard focus, and a
 * new range recolors the grid in a sweep instead of redrawing it. Arrow keys move by day and week, Enter selects.
 */
export interface ActivityHeatmapProps {
  /** One entry per day, oldest first. Days missing inside the range count as zero. */
  days: ActivityDay[];
  /** Accessible name for the grid, such as "Contributions in 2025". */
  label: string;
  /** Finishes the summary line: "1,284 contributions in {period}". */
  period: string;
  /** Nouns for the count. */
  unit?: { one: string; other: string };
  /** Upper bounds for levels one to three; anything above the last is level four. Defaults to quarters of the busiest day. */
  thresholds?: [number, number, number];
  weekStartsOn?: 0 | 1;
  selectedDate?: string | null;
  onSelectDate?: (date: string) => void;
  /** Controls beside the summary, such as a range switch. */
  actions?: ReactNode;
  /** Formatting locale. Fixed by default so server and client render the same labels. */
  locale?: string;
  className?: string;
}

type Model = {
  start: number; length: number; lead: number; weeks: number; total: number;
  counts: number[]; levels: number[]; thresholds: [number, number, number];
  months: { month: number; col: number; label: string }[];
  /** How many days in the range sit at each level. */
  perLevel: number[];
};
type Tip = { key: string; primary: string; secondary: string; value: number; anchor: HTMLElement };
/** How the tooltip text changes: rolls up or down with the count, crossfades on a tie, or appears at once when the bubble opens. */
type Change = 1 | -1 | 0 | "instant";

const DAY = 86_400_000;
const LEVELS = [0, 1, 2, 3, 4] as const;
const enter = [...motionTokens.ease.enter] as [number, number, number, number];
const standard = [...motionTokens.ease.standard] as [number, number, number, number];
/** Total wave travel in ms, kept under the system's stagger budget however many weeks the range spans. */
const WAVE = 420;
const toUtc = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
const toIso = (time: number) => new Date(time).toISOString().slice(0, 10);

function buildModel(days: ActivityDay[], weekStartsOn: 0 | 1, thresholds: [number, number, number] | undefined, locale: string): Model {
  const dates = days.map(day => toUtc(day.date)).filter(Number.isFinite);
  const start = dates.length ? Math.min(...dates) : toUtc("2025-01-01");
  const length = dates.length ? Math.round((Math.max(...dates) - start) / DAY) + 1 : 0;
  const counts = new Array<number>(length).fill(0);
  days.forEach(day => { const index = Math.round((toUtc(day.date) - start) / DAY); if (index >= 0 && index < length) counts[index] += Math.max(0, day.count); });
  const max = counts.reduce((a, b) => Math.max(a, b), 0);
  const bounds = thresholds ?? [Math.max(1, Math.ceil(max * .25)), Math.max(2, Math.ceil(max * .5)), Math.max(3, Math.ceil(max * .75))] as [number, number, number];
  const levels = counts.map(count => count <= 0 ? 0 : count <= bounds[0] ? 1 : count <= bounds[1] ? 2 : count <= bounds[2] ? 3 : 4);
  const lead = (new Date(start).getUTCDay() - weekStartsOn + 7) % 7;
  const weeks = Math.ceil((lead + length) / 7);
  const monthName = new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" });
  const months: Model["months"] = [];
  for (let index = 0; index < length; index++) {
    const date = new Date(start + index * DAY);
    if (index === 0 || date.getUTCDate() === 1) months.push({ month: date.getUTCFullYear() * 12 + date.getUTCMonth(), col: Math.floor((lead + index) / 7), label: monthName.format(date) });
  }
  // A partial first month keeps its label only when there is room before the next one.
  if (months.length > 1 && months[1].col - months[0].col < 3) months.shift();
  const perLevel = [0, 0, 0, 0, 0];
  levels.forEach(level => perLevel[level]++);
  return { start, length, lead, weeks, total: counts.reduce((a, b) => a + b, 0), counts, levels, thresholds: bounds, months, perLevel };
}

const CONTRIBUTIONS = { one: "contribution", other: "contributions" };
const noun = (count: number, unit: { one: string; other: string }) => count === 1 ? unit.one : unit.other;
const noopSubscribe = () => () => {};
/** Reduced motion only after hydration, so the server and the first client render agree. */
function useReducedMotionSafe() {
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const reduced = useReducedMotion();
  return hydrated && !!reduced;
}

const tipText = (reduced: boolean): Variants => ({
  from: (change: Change) => change === "instant" ? { opacity: 1, y: "0em", filter: "blur(0px)" } : reduced ? { opacity: 0 } : { opacity: 0, y: `${.3 * (change || 1)}em`, filter: `blur(${change ? motionTokens.blur.soft : motionTokens.blur.subtle}px)` },
  to: { opacity: 1, y: "0em", filter: "blur(0px)" },
  gone: (change: Change) => change === "instant" || reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: `${-.3 * (change || 1)}em`, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: .12, ease: standard } },
});

/** A total that rolls digit by digit in the direction it moved. Places keep their identity, so only changed digits turn,
 *  and when the number gains or loses a digit the width follows on a spring instead of shifting the sentence in one frame. */
function RollingNumber({ value, locale, reduced }: { value: number; locale: string; reduced: boolean }) {
  const [state, setState] = useState({ value, direction: 1 });
  if (state.value !== value) setState({ value, direction: value > state.value ? 1 : -1 });
  const inner = useRef<HTMLSpanElement>(null);
  const width = useMotionValue<number | "auto">("auto");
  const armedUntil = useRef(0), lastValue = useRef(value);
  useLayoutEffect(() => {
    if (lastValue.current === value) return;
    lastValue.current = value;
    armedUntil.current = performance.now() + 600;
  }, [value]);
  useEffect(() => {
    const node = inner.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const next = node.getBoundingClientRect().width;
      if (reduced || width.get() === "auto" || performance.now() > armedUntil.current) width.jump(next);
      else animate(width, next, motionTokens.spring.morph);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced, width]);
  const chars = [...new Intl.NumberFormat(locale).format(value)];
  const variants: Variants = {
    from: (direction: number) => reduced ? { opacity: 0 } : { opacity: 0, y: `${.3 * direction}em`, filter: `blur(${motionTokens.blur.soft}px)` },
    to: { opacity: 1, y: "0em", filter: "blur(0px)" },
    gone: (direction: number) => reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: `${-.3 * direction}em`, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: .14, ease: standard } },
  };
  return <motion.span className={styles.rollingFrame} style={{ width }} aria-hidden="true"><span ref={inner} className={styles.rolling}>
    {chars.map((char, index) => {
      const place = chars.length - index;
      return <span key={place} className={styles.place}>
        <AnimatePresence mode="popLayout" initial={false} custom={state.direction}>
          <motion.span key={char} className={styles.placeChar} custom={state.direction} variants={variants} initial="from" animate="to" exit="gone"
            transition={reduced ? { duration: .15 } : { duration: .22, ease: enter, delay: Math.min(place * .018, .09) }}>{char}</motion.span>
        </AnimatePresence>
      </span>;
    })}
  </span></motion.span>;
}

/** A short word that changes rises in from a soft blur while the old one lifts away a little faster. */
function RiseText({ text, reduced, children }: { text: string; reduced: boolean; children?: ReactNode }) {
  return <span className={styles.rise} aria-hidden="true">
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span key={text} className={styles.riseLine} initial={reduced ? { opacity: 0 } : { opacity: 0, y: "0.3em", filter: `blur(${motionTokens.blur.soft}px)` }} animate={{ opacity: 1, y: "0em", filter: "blur(0px)" }}
        exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: "-0.3em", filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: .14, ease: standard } }}
        transition={{ duration: reduced ? .15 : .22, ease: enter }}>{children ?? text}</motion.span>
    </AnimatePresence>
  </span>;
}

export function ActivityHeatmap({ days, label, period, unit: unitProp = CONTRIBUTIONS, thresholds, weekStartsOn = 0, selectedDate = null, onSelectDate, actions, locale = "en-US", className }: ActivityHeatmapProps) {
  const reduced = useReducedMotionSafe();
  const id = useId();
  // Keyed by its words, so an inline unit object does not rebuild every cell on each render.
  const unit = useMemo(() => ({ one: unitProp.one, other: unitProp.other }), [unitProp.one, unitProp.other]);
  const rootRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(plotRef, { once: true, amount: .35 });

  const model = useMemo(() => buildModel(days, weekStartsOn, thresholds, locale), [days, weekStartsOn, thresholds, locale]);
  const formats = useMemo(() => ({
    long: new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }),
    short: new Intl.DateTimeFormat(locale, { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }),
    weekday: new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }),
    number: new Intl.NumberFormat(locale),
  }), [locale]);

  // A new range sweeps forward when it is later than the last one and back when it is earlier.
  const [range, setRange] = useState({ start: model.start, direction: 1 });
  if (range.start !== model.start) setRange({ start: model.start, direction: model.start > range.start ? 1 : -1 });

  const [reveal, setReveal] = useState<"hidden" | "revealing" | "done">("hidden");
  useEffect(() => {
    if (reveal !== "hidden" || !(inView || reduced)) return;
    const frame = requestAnimationFrame(() => setReveal(reduced ? "done" : "revealing"));
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced, reveal]);
  useEffect(() => {
    if (reveal !== "revealing") return;
    const timer = window.setTimeout(() => setReveal("done"), WAVE + 700);
    return () => window.clearTimeout(timer);
  }, [reveal]);

  const selectedIndex = selectedDate ? Math.round((toUtc(selectedDate) - model.start) / DAY) : -1;
  const hasSelection = selectedIndex >= 0 && selectedIndex < model.length;
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const tabIndexDay = focusIndex !== null && focusIndex < model.length ? focusIndex : hasSelection ? selectedIndex : model.length - 1;

  // Legend: hovering or focusing a level previews it on the grid, clicking pins it. The caption says how many days sit at that level.
  const [preview, setPreview] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const [legendFocus, setLegendFocus] = useState(0);
  const previewTimer = useRef(0);
  const highlight = preview ?? pinned;
  const previewLevel = (level: number | null) => { window.clearTimeout(previewTimer.current); if (level !== null) setPreview(level); else previewTimer.current = window.setTimeout(() => setPreview(null), 90); };
  useEffect(() => () => window.clearTimeout(previewTimer.current), []);

  // Tooltip: one bubble for the whole grid. It jumps into place when it opens and glides on a spring between cells after that.
  const [tip, setTip] = useState<Tip | null>(null);
  const [open, setOpen] = useState(false);
  const [change, setChange] = useState<Change>("instant");
  const openRef = useRef(false);
  const hideTimer = useRef(0);
  const tipX = useMotionValue(0), tipY = useMotionValue(0), tipWidth = useMotionValue<number | "auto">("auto");

  function contentFor(index: number, anchor: HTMLElement): Tip {
    const count = model.counts[index];
    const date = new Date(model.start + index * DAY);
    return { key: `day-${toIso(date.getTime())}`, primary: count ? `${formats.number.format(count)} ${noun(count, unit)}` : `No ${unit.other}`, secondary: formats.short.format(date), value: count, anchor };
  }
  const [a, b, c] = model.thresholds;
  const ranges = [`no ${unit.other}`, a === 1 ? `1 ${unit.one}` : `1 to ${a} ${unit.other}`, `${a + 1} to ${b} ${unit.other}`, `${b + 1} to ${c} ${unit.other}`, `${c + 1} or more ${unit.other}`];
  const shortRanges = [`no ${unit.other}`, a === 1 ? `1 ${unit.one}` : `1–${a} ${unit.other}`, `${a + 1}–${b} ${unit.other}`, `${b + 1}–${c} ${unit.other}`, `${c + 1}+ ${unit.other}`];
  const dayCount = highlight === null ? "" : `${formats.number.format(model.perLevel[highlight])} ${model.perLevel[highlight] === 1 ? "day" : "days"}`;
  const caption = highlight === null ? "" : `${dayCount} with ${shortRanges[highlight]}`;
  function show(next: Tip) {
    window.clearTimeout(hideTimer.current);
    setChange(tip && openRef.current ? Math.sign(next.value - tip.value) as Change : "instant");
    setTip(next);
    setOpen(true);
  }
  function hideSoon(delay = 110) {
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setOpen(false), delay);
  }
  useEffect(() => () => window.clearTimeout(hideTimer.current), []);

  useLayoutEffect(() => {
    const root = rootRef.current, measure = measureRef.current;
    if (!tip || !root || !measure) return;
    const place = (glide: boolean) => {
      const box = root.getBoundingClientRect(), cell = tip.anchor.getBoundingClientRect();
      const width = Math.ceil(measure.getBoundingClientRect().width);
      const half = width / 2 + 13;
      const x = Math.min(Math.max(cell.left - box.left + cell.width / 2, half + 2), box.width - half - 2);
      const y = cell.top - box.top;
      if (glide) {
        animate(tipX, x, motionTokens.spring.snappy);
        animate(tipY, y, motionTokens.spring.snappy);
        animate(tipWidth, width, motionTokens.spring.morph);
      } else { tipX.jump(x); tipY.jump(y); tipWidth.jump(width); }
    };
    place(open && openRef.current && !reduced);
    openRef.current = open;
    if (!open) return;
    // The grid scrolls sideways on narrow screens; the bubble stays pinned to its cell while it does.
    const scroller = scrollerRef.current;
    const follow = () => place(false);
    scroller?.addEventListener("scroll", follow, { passive: true });
    return () => scroller?.removeEventListener("scroll", follow);
  }, [tip, open, reduced, tipX, tipY, tipWidth]);

  const indexOf = (element: Element | null) => {
    const cell = element?.closest<HTMLElement>("[data-index]");
    return cell && gridRef.current?.contains(cell) ? { cell, index: Number(cell.dataset.index) } : null;
  };
  const focusDay = (index: number) => gridRef.current?.querySelector<HTMLElement>(`[data-index="${index}"]`)?.focus();

  function onGridPointerOver(event: PointerEvent<HTMLDivElement>) {
    const hit = indexOf(event.target as Element);
    if (hit) show(contentFor(hit.index, hit.cell));
  }
  function onGridPointerLeave(event: PointerEvent<HTMLDivElement>) {
    // A keyboard user keeps their bubble on the focused day. A tap focuses its day too, so the bubble stays until focus moves on;
    // where a tap does not focus, it lingers long enough to read.
    const focused = indexOf(document.activeElement);
    if (focused?.cell.matches(":focus-visible")) show(contentFor(focused.index, focused.cell));
    else hideSoon(event.pointerType === "touch" ? 2400 : 110);
  }
  function onGridFocus(event: FocusEvent<HTMLDivElement>) {
    const hit = indexOf(event.target);
    if (!hit) return;
    setFocusIndex(hit.index);
    show(contentFor(hit.index, hit.cell));
  }
  function onGridBlur(event: FocusEvent<HTMLDivElement>) {
    if (!gridRef.current?.contains(event.relatedTarget as Node | null)) hideSoon(0);
  }
  function onGridKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const hit = indexOf(event.target as Element);
    if (!hit) return;
    const moves: Record<string, number> = { ArrowUp: hit.index - 1, ArrowDown: hit.index + 1, ArrowLeft: hit.index - 7, ArrowRight: hit.index + 7, Home: 0, End: model.length - 1 };
    if (event.key in moves) {
      event.preventDefault();
      focusDay(Math.min(Math.max(moves[event.key], 0), model.length - 1));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelectDate?.(toIso(model.start + hit.index * DAY));
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
    }
  }

  function onLegendKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const moves: Record<string, number> = { ArrowLeft: legendFocus - 1, ArrowRight: legendFocus + 1, Home: 0, End: 4 };
    if (event.key === "Escape") { previewLevel(null); return; }
    if (!(event.key in moves)) return;
    event.preventDefault();
    const next = Math.min(Math.max(moves[event.key], 0), 4);
    rootRef.current?.querySelector<HTMLElement>(`[data-level-key="${next}"]`)?.focus();
  }

  // The selection ring glides between cells on CSS. When it first appears it should fade in where it lands, not fly in from its last spot.
  const ringShown = hasSelection && reveal !== "hidden";
  const ringWasShown = useRef(ringShown);
  useLayoutEffect(() => {
    const ring = ringRef.current;
    if (ring && ringShown && !ringWasShown.current) {
      ring.style.transitionProperty = "opacity";
      void ring.offsetWidth;
      ring.style.transitionProperty = "";
    }
    ringWasShown.current = ringShown;
  }, [ringShown]);

  const maxDiagonal = Math.max(1, model.weeks - 1 + 6);
  const step = Math.min(12, WAVE / maxDiagonal);
  const cells = useMemo(() => Array.from({ length: 7 }, (_, row) => <div key={row} role="row" className={styles.row}>
    {Array.from({ length: model.weeks }, (_, col) => {
      const index = col * 7 + row - model.lead;
      const inRange = index >= 0 && index < model.length;
      const wave = { "--wave": `${Math.round((col + row) * step)}ms`, "--wave-back": `${Math.round((maxDiagonal - col - row) * step)}ms` } as CSSProperties;
      if (!inRange) return <span key={col} className={styles.cell} data-empty="" style={wave} aria-hidden="true" />;
      const count = model.counts[index];
      const date = new Date(model.start + index * DAY);
      return <span key={col} role="gridcell" className={styles.cell} style={wave} data-index={index} data-level={model.levels[index]} tabIndex={index === tabIndexDay ? 0 : -1}
        aria-selected={onSelectDate ? index === selectedIndex : undefined} aria-label={`${count ? formats.number.format(count) : "No"} ${noun(count, unit)}, ${formats.long.format(date)}`}
        onClick={() => onSelectDate?.(toIso(date.getTime()))} />;
    })}
  </div>), [model, step, maxDiagonal, tabIndexDay, selectedIndex, formats, unit, onSelectDate]);

  const weekdayLabels = useMemo(() => Array.from({ length: 7 }, (_, row) => {
    const weekday = (row + weekStartsOn) % 7;
    // January 4, 1970 was a Sunday.
    return weekday % 2 === 1 ? formats.weekday.format(new Date((3 + weekday) * DAY)) : "";
  }), [formats, weekStartsOn]);

  const selectedCol = hasSelection ? Math.floor((selectedIndex + model.lead) / 7) : 0;
  const selectedRow = hasSelection ? (selectedIndex + model.lead) % 7 : 0;
  const summary = `${formats.number.format(model.total)} ${noun(model.total, unit)} in ${period}`;

  return <div ref={rootRef} className={[styles.root, className].filter(Boolean).join(" ")}>
    <div className={styles.header}>
      <p className={styles.summary}>
        <span className={styles.total}><RollingNumber value={model.total} locale={locale} reduced={reduced} /> {noun(model.total, unit)}</span>{" "}
        <span className={styles.period}>in <RiseText text={period} reduced={reduced} /></span>
        <span className={styles.srOnly} role="status">{summary}</span>
      </p>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>

    <div ref={scrollerRef} className={styles.scroller}>
      <div className={styles.canvas} style={{ "--weeks": model.weeks } as CSSProperties}>
        <div className={styles.months} aria-hidden="true">
          {model.months.map((month, order) => <span key={`${month.month % 12}-${model.months.findIndex(item => item.month % 12 === month.month % 12) === order ? 0 : 1}`} className={styles.month} style={{ "--col": month.col } as CSSProperties}>{month.label}</span>)}
        </div>
        <div className={styles.weekdays} aria-hidden="true">{weekdayLabels.map((text, row) => <span key={row} className={styles.weekday}>{text}</span>)}</div>
        <div ref={plotRef} className={styles.plot}>
          <div ref={gridRef} role="grid" aria-label={label} aria-readonly="true" aria-describedby={`${id}-legend`} className={styles.grid}
            data-reveal={reveal} data-direction={range.direction < 0 ? "back" : undefined} data-highlight={highlight ?? undefined}
            onPointerOver={onGridPointerOver} onPointerLeave={onGridPointerLeave} onFocus={onGridFocus} onBlur={onGridBlur} onKeyDown={onGridKeyDown}>
            {cells}
          </div>
          <span ref={ringRef} className={styles.ring} data-shown={ringShown || undefined} style={{ "--col": selectedCol, "--row": selectedRow } as CSSProperties} aria-hidden="true" />
        </div>
      </div>
    </div>

    <div className={styles.legend}>
      <span id={`${id}-legend`} className={styles.srOnly}>Darker squares mean more {unit.other}. Levels: {ranges.join(", ")}.</span>
      <span className={styles.caption} aria-live="polite">
        <RiseText text={caption} reduced={reduced}>{caption && <><span className={styles.captionLong}>{caption}</span><span className={styles.captionShort}>{dayCount}</span></>}</RiseText>
        <span className={styles.srOnly}>{caption}</span>
      </span>
      <span className={styles.scale}>
      <span className={styles.legendText} aria-hidden="true">Less</span>
      <div className={styles.swatches} role="group" aria-label="Highlight days by level" onKeyDown={onLegendKeyDown}>
        {LEVELS.map(level => <button key={level} type="button" className={styles.swatch} data-level-key={level} data-level={level} tabIndex={level === legendFocus ? 0 : -1}
          aria-pressed={pinned === level} aria-label={`Highlight days with ${ranges[level]}`}
          onClick={() => setPinned(current => current === level ? null : level)}
          onPointerEnter={() => previewLevel(level)} onPointerLeave={() => previewLevel(null)}
          onFocus={() => { setLegendFocus(level); previewLevel(level); }} onBlur={() => previewLevel(null)} />)}
      </div>
      <span className={styles.legendText} aria-hidden="true">More</span>
      </span>
    </div>

    <motion.div className={styles.tip} style={{ x: tipX, y: tipY }} aria-hidden="true">
      <motion.div className={styles.bubble} style={{ x: "-50%" }} initial={false} animate={open && tip ? { opacity: 1, scale: 1 } : { opacity: 0, scale: reduced ? 1 : .96 }}
        transition={reduced ? { duration: open ? .15 : .1 } : open ? { ...motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast, ease: enter } } : { duration: .12, ease: standard }}>
        <motion.span className={styles.tipBody} style={{ width: tipWidth }}>
          <span ref={measureRef} className={styles.tipMeasure}><span className={styles.tipPrimary}>{tip?.primary}</span><span className={styles.tipSecondary}>{tip?.secondary}</span></span>
          <AnimatePresence mode="popLayout" initial={false} custom={change}>
            {tip && <motion.span key={tip.key} className={styles.tipLines} custom={change} variants={tipText(reduced)} initial="from" animate="to" exit="gone" transition={{ duration: reduced ? .15 : .22, ease: enter }}>
              <span className={styles.tipPrimary}>{tip.primary}</span>
              <span className={styles.tipSecondary}>{tip.secondary}</span>
            </motion.span>}
          </AnimatePresence>
        </motion.span>
      </motion.div>
    </motion.div>
  </div>;
}

export default ActivityHeatmap;
