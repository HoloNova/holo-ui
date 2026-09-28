"use client";

import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useImperativeHandle, useLayoutEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent, type Ref } from "react";

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
const ARC_SLOPE_CHART_STYLES = `.arc-slope-chart-figure { position: relative; display: grid; min-width: 0; margin: 0; color: var(--foreground); font-family: var(--font-body); letter-spacing: var(--tracking-body); }

/* Series colors (--series-1 to --series-4) come from registry/foundation.css. */

.arc-slope-chart-stage { position: relative; min-width: 0; outline: none; touch-action: pan-y; user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; }
.arc-slope-chart-columns { position: relative; height: 28px; }
.arc-slope-chart-column { position: absolute; top: 0; color: var(--text-muted); font-size: var(--text-sm); line-height: 20px; white-space: nowrap; }

.arc-slope-chart-plot { position: relative; }
.arc-slope-chart-svg { display: block; overflow: visible; }
.arc-slope-chart-axis { stroke: var(--border); stroke-width: 1; shape-rendering: crispEdges; }

/* Every line is one neutral ink; the story item takes the first series (derived from the accent) and the item in focus comes forward. */
.arc-slope-chart-item { --ink: color-mix(in oklch, var(--foreground) 36%, var(--surface)); transition: opacity var(--duration-standard) var(--ease-standard); }
.arc-slope-chart-item[data-accent] { --ink: var(--series-1); }
.arc-slope-chart-item[data-on]:not([data-accent]) { --ink: var(--foreground); }
.arc-slope-chart-item[data-dim] { opacity: .14; }
.arc-slope-chart-line { stroke: var(--ink); stroke-width: 2; stroke-linecap: round; fill: none; transition: stroke var(--duration-fast) var(--ease-standard); }
.arc-slope-chart-dot { fill: var(--ink); stroke: var(--surface); stroke-width: 2; transform-box: fill-box; transform-origin: center; transition: fill var(--duration-fast) var(--ease-standard); }
.arc-slope-chart-leader { fill: none; stroke: var(--border-strong); stroke-width: 1; }

.arc-slope-chart-labels { transition: opacity var(--duration-standard) var(--ease-standard); }
.arc-slope-chart-labels[data-dim] { opacity: .3; }
.arc-slope-chart-start, .arc-slope-chart-end { position: absolute; top: 0; display: flex; height: 20px; align-items: center; gap: 8px; margin-top: -10px; font-size: var(--text-sm); line-height: 20px; white-space: nowrap; pointer-events: none; }
.arc-slope-chart-start { justify-content: flex-end; max-width: 100%; }
/* On a phone the labels step down a size so the longest names fit beside the first column instead of running off the edge. */
.arc-slope-chart-stage[data-narrow] .arc-slope-chart-start, .arc-slope-chart-stage[data-narrow] .arc-slope-chart-end { gap: 6px; font-size: var(--text-xs); }
.arc-slope-chart-name { min-width: 0; overflow: hidden; color: var(--text-secondary); text-overflow: ellipsis; }
.arc-slope-chart-value { color: var(--foreground); font-variant-numeric: tabular-nums; }
.arc-slope-chart-labels[data-on] .arc-slope-chart-name, .arc-slope-chart-labels[data-accent] .arc-slope-chart-name { color: var(--foreground); }
.arc-slope-chart-labels[data-on] .arc-slope-chart-value, .arc-slope-chart-labels[data-accent] .arc-slope-chart-value { font-weight: 500; }

.arc-slope-chart-rank { display: inline-flex; min-width: 30px; align-items: center; gap: 2px; color: var(--text-muted); font-size: var(--text-xs); font-variant-numeric: tabular-nums; }
.arc-slope-chart-rank[data-move="up"] { color: var(--text-secondary); }
.arc-slope-chart-rankSwap { position: relative; display: inline-flex; overflow: hidden; }

.arc-slope-chart-tooltip { position: absolute; top: 0; left: 0; z-index: 2; display: grid; min-width: 168px; max-width: min(240px, 100%); gap: 3px; padding: 10px 12px; border: 1px solid var(--border); border-radius: 14px; background: var(--surface-raised); box-shadow: var(--shadow-floating); opacity: 0; pointer-events: none; scale: .96; transition: opacity var(--duration-fast) var(--ease-standard), scale var(--duration-fast) var(--ease-standard); }
.arc-slope-chart-stage[data-active] .arc-slope-chart-tooltip { opacity: 1; scale: 1; }
.arc-slope-chart-tipTitle { margin: 0 0 2px; color: var(--foreground); font-size: var(--text-sm); font-weight: 500; line-height: var(--leading-body); white-space: nowrap; }
.arc-slope-chart-tipRow { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 0; font-size: var(--text-sm); line-height: 1.3; }
.arc-slope-chart-tipName { color: var(--text-secondary); }
.arc-slope-chart-tipValue { color: var(--foreground); font-weight: 500; font-variant-numeric: tabular-nums; }
.arc-slope-chart-tipMeta { margin: 2px 0 0; color: var(--text-muted); font-size: var(--text-xs); line-height: var(--leading-body); font-variant-numeric: tabular-nums; }

.arc-slope-chart-message { display: grid; min-height: 160px; place-items: center; margin: 0; color: var(--text-muted); font-size: var(--text-sm); }
.arc-slope-chart-srOnly { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

@media (prefers-reduced-motion: reduce) {
  .arc-slope-chart-item, .arc-slope-chart-line, .arc-slope-chart-dot, .arc-slope-chart-labels, .arc-slope-chart-tooltip { transition: none; }
}
`;

const styles: Record<string, string> = new Proxy({
  "axis": "arc-slope-chart-axis",
  "column": "arc-slope-chart-column",
  "columns": "arc-slope-chart-columns",
  "css": "arc-slope-chart-css",
  "dot": "arc-slope-chart-dot",
  "end": "arc-slope-chart-end",
  "figure": "arc-slope-chart-figure",
  "item": "arc-slope-chart-item",
  "labels": "arc-slope-chart-labels",
  "leader": "arc-slope-chart-leader",
  "line": "arc-slope-chart-line",
  "message": "arc-slope-chart-message",
  "name": "arc-slope-chart-name",
  "plot": "arc-slope-chart-plot",
  "rank": "arc-slope-chart-rank",
  "rankSwap": "arc-slope-chart-rankSwap",
  "srOnly": "arc-slope-chart-srOnly",
  "stage": "arc-slope-chart-stage",
  "start": "arc-slope-chart-start",
  "svg": "arc-slope-chart-svg",
  "tipMeta": "arc-slope-chart-tipMeta",
  "tipName": "arc-slope-chart-tipName",
  "tipRow": "arc-slope-chart-tipRow",
  "tipTitle": "arc-slope-chart-tipTitle",
  "tipValue": "arc-slope-chart-tipValue",
  "tooltip": "arc-slope-chart-tooltip",
  "value": "arc-slope-chart-value"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-slope-chart-${prop}`,
});



export interface SlopeItem {
  /** Stable identity. An item keeps its line across datasets, so switching morphs it. */
  key: string;
  /** Name beside the start value, in the tooltip, and in the table. */
  label: string;
  /** Value in the first period. */
  start: number;
  /** Value in the second period. */
  end: number;
}

/** Use a slope chart to show how several items changed between exactly two moments, and how their order changed. */
export interface SlopeChartProps {
  data: SlopeItem[];
  /** What is measured, such as "Conversion rate by channel". Names the chart for assistive technology. */
  label: string;
  /** Heading of the first column, such as "Q1". */
  startLabel: string;
  /** Heading of the second column, such as "Q2". */
  endLabel: string;
  formatValue?: (value: number) => string;
  /** Formats the change in the tooltip. Defaults to the difference in formatValue's terms. */
  formatChange?: (change: number, item: SlopeItem) => string;
  /** Plot height in pixels. Defaults to 44 pixels per item. */
  height?: number;
  /** The item drawn in the accent, such as the one the story is about. */
  highlightKey?: string | null;
  /** Controlled item in focus. The others fade while one is in focus. */
  activeKey?: string | null;
  onActiveChange?: (key: string | null) => void;
  /** Rank movement beside each end value. */
  ranks?: boolean;
  emptyLabel?: string;
  ref?: Ref<HTMLElement>;
  className?: string;
}

type Row = { item: SlopeItem; y0: number; y1: number; l0: number; l1: number; rank0: number; rank1: number; order: number };

const { spring } = motionTokens;
const follow = { stiffness: 480, damping: 42, restDelta: .01 };
const LABEL_GAP = 20, PAD = 14, HEAD = 28;
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));
const grouped = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const subscribeNothing = () => () => {};
function useReducedMotionSafe() {
  const hydrated = useSyncExternalStore(subscribeNothing, () => true, () => false);
  return !!useReducedMotion() && hydrated;
}

/** Moves labels apart just enough to stop overlaps: touching labels form a group centred on where its members want to be. */
function spread(wanted: number[], gap: number, low: number, high: number): number[] {
  const order = wanted.map((y, index) => ({ y, index })).sort((a, b) => a.y - b.y);
  let groups = order.map(entry => ({ members: [entry], top: entry.y }));
  for (let changed = true; changed;) {
    changed = false;
    const next: typeof groups = [];
    for (const group of groups) {
      const prev = next[next.length - 1];
      if (prev && prev.top + prev.members.length * gap > group.top) {
        const members = [...prev.members, ...group.members];
        next[next.length - 1] = { members, top: members.reduce((sum, member, k) => sum + member.y - k * gap, 0) / members.length };
        changed = true;
      } else next.push(group);
    }
    groups = next.map(group => ({ ...group, top: clamp(group.top, low, Math.max(low, high - (group.members.length - 1) * gap)) }));
  }
  const out = new Array<number>(wanted.length);
  groups.forEach(group => group.members.forEach((member, k) => { out[member.index] = group.top + k * gap; }));
  return out;
}

/** Rank change arrow: up, down, or level. The number rolls in when it changes. */
function Rank({ move, reduced }: { move: number; reduced: boolean }) {
  const text = move === 0 ? "=" : `${Math.abs(move)}`;
  return <span className={styles.rank} data-move={move > 0 ? "up" : move < 0 ? "down" : "level"} aria-hidden="true">
    {move !== 0 && <svg width="8" height="8" viewBox="0 0 8 8"><path d={move > 0 ? "M4 7V1M1.5 3.5 4 1l2.5 2.5" : "M4 1v6M1.5 4.5 4 7l2.5-2.5"} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    <span className={styles.rankSwap}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={text} initial={reduced ? { opacity: 0 } : { opacity: 0, y: move >= 0 ? 6 : -6 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? { opacity: 0 } : { opacity: 0, y: move >= 0 ? -6 : 6 }} transition={reduced ? { duration: 0 } : spring.snappy}>{text}</motion.span>
      </AnimatePresence>
    </span>
  </span>;
}

export function SlopeChart({ data, label, startLabel, endLabel, formatValue, formatChange, height, highlightKey = null, activeKey, onActiveChange, ranks = true, emptyLabel = "No data", ref, className }: SlopeChartProps) {
  const reduced = useReducedMotionSafe();
  const figure = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const tip = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => figure.current as HTMLElement);
  const inView = useInView(figure, { once: true, amount: .3 });
  const empty = data.length === 0;
  const plotHeight = height ?? Math.max(200, data.length * 44);

  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const node = stage.current;
    if (!node) return;
    const read = () => setWidth(node.clientWidth);
    read();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(read);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const narrow = width < 440;
  const leftRoom = narrow ? (width < 300 ? 116 : 132) : 168, rightRoom = ranks ? (narrow ? 76 : 96) : (narrow ? 52 : 64);
  const x0 = leftRoom, x1 = Math.max(x0 + 40, width - rightRoom);

  // One shared value axis for both columns, padded so dots never touch the edges.
  const values = data.flatMap(item => [item.start, item.end]);
  let lo = Math.min(...values), hi = Math.max(...values);
  if (!Number.isFinite(lo)) { lo = 0; hi = 1; }
  if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
  const yOf = (value: number) => PAD + (1 - (value - lo) / (hi - lo)) * (plotHeight - PAD * 2);
  const rankOf = (field: "start" | "end") => { const sorted = [...data].sort((a, b) => b[field] - a[field]); return (item: SlopeItem) => sorted.indexOf(item) + 1; };
  const r0 = rankOf("start"), r1 = rankOf("end");
  const l0 = spread(data.map(item => yOf(item.start)), LABEL_GAP, 8, plotHeight - 8);
  const l1 = spread(data.map(item => yOf(item.end)), LABEL_GAP, 8, plotHeight - 8);
  const rows: Row[] = data.map((item, i) => ({ item, y0: yOf(item.start), y1: yOf(item.end), l0: l0[i], l1: l1[i], rank0: r0(item), rank1: r1(item), order: 0 }));
  const byEnd = [...rows].sort((a, b) => a.rank1 - b.rank1);
  byEnd.forEach((row, k) => { row.order = k; });

  const [ownActive, setOwnActive] = useState<string | null>(null);
  const wanted = activeKey !== undefined ? activeKey : ownActive;
  const active = wanted && data.some(item => item.key === wanted) ? wanted : null;
  const setActive = (key: string | null) => { if (activeKey === undefined) setOwnActive(key); if (key !== active) onActiveChange?.(key); };

  // The tooltip glides to the middle of the line in focus and stays inside the chart.
  const tipX = useMotionValue(0), tipY = useMotionValue(0);
  const tipSpringX = useSpring(tipX, follow), tipSpringY = useSpring(tipY, follow);
  const wasShown = useRef(false);
  const activeRow = rows.find(row => row.item.key === active) ?? null;
  useLayoutEffect(() => {
    const bubble = tip.current;
    if (!activeRow || !bubble || !width) { wasShown.current = false; return; }
    const tw = bubble.offsetWidth, th = bubble.offsetHeight;
    const mid = (activeRow.y0 + activeRow.y1) / 2, cx = (x0 + x1) / 2;
    const above = mid - th - 16 >= 0;
    const left = clamp(cx - tw / 2, 0, Math.max(0, width - tw));
    const top = clamp(HEAD + (above ? mid - th - 16 : mid + 16), 0, Math.max(0, plotHeight + HEAD - th));
    tipX.set(left); tipY.set(top);
    if (!wasShown.current || reduced) { tipSpringX.jump(left); tipSpringY.jump(top); }
    wasShown.current = true;
  });

  // The line nearest the pointer, measured at the pointer's position along the plot.
  const nearest = (clientX: number, clientY: number) => {
    const rect = stage.current?.getBoundingClientRect();
    if (!rect || empty) return null;
    const x = clamp(clientX - rect.left, x0, x1), y = clientY - rect.top - HEAD;
    const t = (x - x0) / Math.max(1, x1 - x0);
    let best: Row | null = null, distance = Infinity;
    for (const row of rows) {
      const inLine = Math.abs(row.y0 + (row.y1 - row.y0) * t - y);
      const onLabel = clientX - rect.left < x0 ? Math.abs(row.l0 - y) : clientX - rect.left > x1 ? Math.abs(row.l1 - y) : Infinity;
      const d = Math.min(inLine, onLabel);
      if (d < distance) { distance = d; best = row; }
    }
    return distance <= 22 ? best?.item.key ?? null : null;
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => { if (event.pointerType === "mouse" || event.buttons) setActive(nearest(event.clientX, event.clientY)); };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (empty) return;
    if (event.key === "Escape" && active) { event.preventDefault(); setActive(null); return; }
    const at = activeRow ? activeRow.order : -1;
    const moves: Record<string, number> = { ArrowDown: at + 1, ArrowRight: at + 1, ArrowUp: at < 0 ? 0 : at - 1, ArrowLeft: at < 0 ? 0 : at - 1, Home: 0, End: byEnd.length - 1 };
    if (!(event.key in moves)) return;
    event.preventDefault();
    setActive(byEnd[clamp(moves[event.key], 0, byEnd.length - 1)].item.key);
  };

  const format = (value: number) => formatValue ? formatValue(value) : grouped.format(value);
  const change = (item: SlopeItem) => formatChange ? formatChange(item.end - item.start, item) : `${item.end >= item.start ? "+" : "−"}${format(Math.abs(item.end - item.start))}`;
  const rankText = (row: Row) => row.rank0 === row.rank1 ? "same rank" : row.rank1 < row.rank0 ? `up ${row.rank0 - row.rank1} to rank ${row.rank1}` : `down ${row.rank1 - row.rank0} to rank ${row.rank1}`;
  const announce = activeRow ? `${activeRow.item.label}, ${startLabel} ${format(activeRow.item.start)}, ${endLabel} ${format(activeRow.item.end)}, ${change(activeRow.item)}, ${rankText(activeRow)}` : "";
  const summary = empty ? `${label}. ${emptyLabel}.` : `${label}, ${startLabel} to ${endLabel}. ${byEnd.map(row => `${row.item.label} ${format(row.item.start)} to ${format(row.item.end)}`).join(", ")}.`;
  const settle = reduced ? { duration: 0 } : spring.morph;
  const drawn = inView || reduced;

  return <figure ref={figure} className={[styles.figure, className].filter(Boolean).join(" ")} aria-label={label}>
    <div ref={stage} className={styles.stage} data-narrow={narrow || undefined} data-active={active ? true : undefined}
      role="group" tabIndex={empty ? -1 : 0} aria-roledescription="slope chart" aria-label={`${label}. Use up and down arrows to move between items in ${endLabel} order.`}
      onPointerMove={onPointerMove} onPointerDown={event => { if (event.pointerType !== "mouse") { event.currentTarget.setPointerCapture?.(event.pointerId); setActive(nearest(event.clientX, event.clientY)); } }}
      onPointerUp={event => { if (event.pointerType !== "mouse") setActive(null); }} onPointerCancel={() => setActive(null)} onPointerLeave={event => { if (event.pointerType === "mouse") setActive(null); }}
      onKeyDown={onKeyDown} onBlur={() => setActive(null)} onFocus={event => { if (event.currentTarget.matches(":focus-visible") && !empty && !active) setActive(byEnd[0].item.key); }}>
      {width > 0 && <>
        <div className={styles.columns} aria-hidden="true">
          <span className={styles.column} style={{ left: x0, translate: "-50% 0" }}>{startLabel}</span>
          <span className={styles.column} style={{ left: x1, translate: "-50% 0" }}>{endLabel}</span>
        </div>
        <div className={styles.plot} style={{ height: plotHeight }}>
          <svg className={styles.svg} width={width} height={plotHeight} aria-hidden="true" focusable="false">
            <line className={styles.axis} x1={x0} x2={x0} y1={0} y2={plotHeight} />
            <line className={styles.axis} x1={x1} x2={x1} y1={0} y2={plotHeight} />
            {rows.map((row, i) => {
              const key = row.item.key, on = active === key, accent = highlightKey === key;
              const delay = reduced ? 0 : i * .05;
              return <g key={key} className={styles.item} data-on={on || undefined} data-accent={accent || undefined} data-dim={(active !== null && !on) || undefined}>
                <motion.path className={styles.leader} initial={false} animate={{ d: `M${x0 - 6},${row.l0}L${x0 - 1},${row.y0}` }} transition={settle} />
                <motion.path className={styles.leader} initial={false} animate={{ d: `M${x1 + 6},${row.l1}L${x1 + 1},${row.y1}` }} transition={settle} />
                <motion.line className={styles.line} x1={x0} x2={x1} initial={reduced ? false : { y1: row.y0, y2: row.y1, pathLength: 0 }} animate={{ y1: row.y0, y2: row.y1, pathLength: drawn ? 1 : 0 }}
                  transition={{ y1: settle, y2: settle, pathLength: reduced ? { duration: 0 } : { duration: .7, ease: motionTokens.ease.inOut, delay: .1 + delay } }} />
                <motion.circle className={styles.dot} cx={x0} r={4} initial={reduced ? false : { cy: row.y0, scale: 0 }} animate={{ cy: row.y0, scale: drawn ? 1 : 0 }} transition={{ cy: settle, scale: reduced ? { duration: 0 } : { ...spring.snappy, delay } }} />
                <motion.circle className={styles.dot} cx={x1} r={4} initial={reduced ? false : { cy: row.y1, scale: 0 }} animate={{ cy: row.y1, scale: drawn ? 1 : 0 }} transition={{ cy: settle, scale: reduced ? { duration: 0 } : { ...spring.snappy, delay: .7 + delay } }} />
              </g>;
            })}
          </svg>
          {rows.map((row, i) => {
            const key = row.item.key, on = active === key, accent = highlightKey === key;
            const delay = reduced ? 0 : i * .05;
            return <div key={key} className={styles.labels} data-on={on || undefined} data-accent={accent || undefined} data-dim={(active !== null && !on) || undefined} aria-hidden="true">
              <motion.span className={styles.start} style={{ right: width - x0 + 10, maxWidth: x0 - 10 }} initial={reduced ? false : { y: row.l0, opacity: 0 }} animate={{ y: row.l0, opacity: drawn ? 1 : 0 }} transition={{ y: settle, opacity: { duration: .3, delay } }}>
                <span className={styles.name}>{row.item.label}</span>
                <span className={styles.value}>{format(row.item.start)}</span>
              </motion.span>
              <motion.span className={styles.end} style={{ left: x1 + 10 }} initial={reduced ? false : { y: row.l1, opacity: 0 }} animate={{ y: row.l1, opacity: drawn ? 1 : 0 }} transition={{ y: settle, opacity: { duration: .3, delay: .7 + delay } }}>
                <span className={styles.value}>{format(row.item.end)}</span>
                {ranks && <Rank move={row.rank0 - row.rank1} reduced={reduced} />}
              </motion.span>
            </div>;
          })}
        </div>
      </>}
      <motion.div ref={tip} className={styles.tooltip} style={{ x: reduced ? tipX : tipSpringX, y: reduced ? tipY : tipSpringY }} aria-hidden="true">
        <p className={styles.tipTitle}>{activeRow?.item.label ?? ""}</p>
        <p className={styles.tipRow}><span className={styles.tipName}>{startLabel}</span><span className={styles.tipValue}>{activeRow ? format(activeRow.item.start) : ""}</span></p>
        <p className={styles.tipRow}><span className={styles.tipName}>{endLabel}</span><span className={styles.tipValue}>{activeRow ? format(activeRow.item.end) : ""}</span></p>
        <p className={styles.tipMeta}>{activeRow ? `${change(activeRow.item)}, ${rankText(activeRow)}` : ""}</p>
      </motion.div>
      {empty && <p className={styles.message}>{emptyLabel}</p>}
    </div>
    <p className={styles.srOnly} aria-live="polite" aria-atomic="true">{announce}</p>
    <p className={styles.srOnly}>{summary}</p>
    {!empty && <div className={styles.srOnly}><table>
      <caption>{label}</caption>
      <thead><tr><th scope="col">Item</th><th scope="col">{startLabel}</th><th scope="col">{endLabel}</th><th scope="col">Change</th><th scope="col">Rank</th></tr></thead>
      <tbody>{byEnd.map(row => <tr key={row.item.key}><th scope="row">{row.item.label}</th><td>{format(row.item.start)}</td><td>{format(row.item.end)}</td><td>{change(row.item)}</td><td>{row.rank0} to {row.rank1}</td></tr>)}</tbody>
    </table></div>}
  </figure>;
}

export default SlopeChart;
