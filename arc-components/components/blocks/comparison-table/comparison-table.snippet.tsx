"use client";

import type { CSSProperties } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { Check, Minus } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

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
const ARC_COMPARISON_TABLE_STYLES = `.arc-comparison-table-root { width: 100%; min-width: 0; container: compare / inline-size; background: var(--background); color: var(--foreground); font-family: var(--font-body); letter-spacing: var(--tracking-body); }
.arc-comparison-table-inner { display: grid; gap: var(--space-8); max-width: 1080px; margin: 0 auto; padding: var(--space-16) var(--space-6); }
.arc-comparison-table-srOnly { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

.arc-comparison-table-header { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: var(--space-6); }
.arc-comparison-table-intro { display: grid; gap: var(--space-3); max-width: 560px; }
.arc-comparison-table-title { margin: 0; font-family: var(--font-display); font-size: clamp(1.75rem, 1rem + 3cqi, var(--text-4xl)); font-weight: 500; letter-spacing: var(--tracking-display); line-height: var(--leading-display); text-wrap: balance; }
.arc-comparison-table-description { margin: 0; color: var(--text-secondary); font-size: var(--text-base); line-height: var(--leading-body); text-wrap: pretty; }

.arc-comparison-table-toggle { position: relative; display: inline-flex; align-items: center; gap: var(--space-3); color: var(--text-secondary); font-size: var(--text-sm); font-weight: 500; cursor: pointer; user-select: none; -webkit-tap-highlight-color: transparent; }
.arc-comparison-table-toggle input { position: absolute; inset: 0; margin: 0; opacity: 0; cursor: pointer; }
.arc-comparison-table-switch { position: relative; width: 38px; height: 22px; flex: none; border-radius: var(--radius-pill); background: var(--control-track); transition: background-color var(--duration-fast) var(--ease-standard); }
.arc-comparison-table-thumb { position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 50%; background: var(--control-thumb); box-shadow: var(--control-thumb-shadow); transition: transform var(--duration-spring) var(--ease-spring), background-color var(--duration-fast) var(--ease-standard); }
.arc-comparison-table-toggle input:checked + .arc-comparison-table-switch { background: var(--control-on); }
.arc-comparison-table-toggle input:checked + .arc-comparison-table-switch .arc-comparison-table-thumb { background: var(--control-thumb-on); transform: translateX(16px); }
.arc-comparison-table-toggle:has(input:checked) { color: var(--foreground); }
@media (hover: hover) and (pointer: fine) { .arc-comparison-table-toggle:hover input:not(:checked) + .arc-comparison-table-switch { background: var(--control-track-hover); } }

.arc-comparison-table-picker { display: flex; gap: 2px; margin: 0 calc(var(--space-4) * -1); overflow-x: auto; padding: 0 var(--space-4); scrollbar-width: none; }
.arc-comparison-table-picker::-webkit-scrollbar { display: none; }
.arc-comparison-table-pick { position: relative; isolation: isolate; flex: none; height: 36px; border: 0; border-radius: var(--radius-pill); padding: 0 var(--space-4); background: none; color: var(--text-secondary); font: inherit; font-size: var(--text-sm); font-weight: 500; white-space: nowrap; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: color var(--duration-fast) var(--ease-standard); }
.arc-comparison-table-pick[aria-pressed="true"] { color: var(--foreground); }
.arc-comparison-table-pickHighlight { position: absolute; z-index: -1; inset: 0; border-radius: inherit; background: var(--surface-muted); }

.arc-comparison-table-scroller { position: relative; overscroll-behavior: contain; scrollbar-width: thin; }
.arc-comparison-table-table { --band: color-mix(in oklch, var(--accent) 6%, var(--surface)); --grid: minmax(0, 1.7fr) repeat(var(--columns), minmax(0, 1fr)); display: grid; }
.arc-comparison-table-head { position: sticky; z-index: 3; top: var(--sticky-top, 0); background: color-mix(in oklch, var(--background) 94%, transparent); backdrop-filter: blur(14px) saturate(1.4); -webkit-backdrop-filter: blur(14px) saturate(1.4); }
.arc-comparison-table-headRow, .arc-comparison-table-row, .arc-comparison-table-sectionRow, .arc-comparison-table-footRow { display: grid; grid-template-columns: var(--grid); }
.arc-comparison-table-headRow { border-bottom: 1px solid var(--border); }
.arc-comparison-table-headFeature { min-height: 84px; }
.arc-comparison-table-headCell { position: relative; display: grid; min-height: 84px; align-items: end; justify-items: center; overflow: hidden; padding: var(--space-4) var(--space-2) var(--space-4); text-align: center; }
.arc-comparison-table-headCell[data-own] { border-radius: 20px 20px 0 0; background: var(--band); }
.arc-comparison-table-headText { display: grid; gap: 2px; }
.arc-comparison-table-headName { font-size: var(--text-base); font-weight: 500; line-height: 1.3; }
.arc-comparison-table-headCell[data-own] .arc-comparison-table-headName { color: var(--accent-strong); }
:global([data-theme="dark"]) .arc-comparison-table-headCell[data-own] .arc-comparison-table-headName { color: var(--foreground); }
.arc-comparison-table-headCaption { color: var(--text-muted); font-size: var(--text-xs); font-variant-numeric: tabular-nums; }

.arc-comparison-table-section { display: contents; }
.arc-comparison-table-sectionRow { overflow: hidden; }
.arc-comparison-table-sectionTitle { padding: var(--space-8) var(--space-2) var(--space-2) 0; color: var(--text-muted); font-size: var(--text-xs); font-weight: 500; }
.arc-comparison-table-band[data-own] { background: var(--band); }
.arc-comparison-table-row { overflow: hidden; }
.arc-comparison-table-row > * { border-bottom: 1px solid var(--border-subtle); transition: background-color var(--duration-fast) var(--ease-standard); }
.arc-comparison-table-feature { display: grid; align-content: center; gap: 2px; min-height: 56px; padding: var(--space-3) var(--space-4) var(--space-3) 0; font-size: var(--text-sm); font-weight: 500; line-height: 1.35; }
.arc-comparison-table-hint { color: var(--text-muted); font-size: var(--text-xs); font-weight: 400; }
.arc-comparison-table-cell { display: grid; place-items: center; padding: var(--space-2); text-align: center; }
.arc-comparison-table-cell[data-own] { background: var(--band); }
.arc-comparison-table-cellInner { display: grid; place-items: center; }
@media (hover: hover) and (pointer: fine) {
  .arc-comparison-table-row:hover > * { background: color-mix(in oklch, var(--foreground) 2.5%, transparent); }
  .arc-comparison-table-row:hover > .arc-comparison-table-cell[data-own] { background: color-mix(in oklch, var(--accent) 9%, var(--surface)); }
}

.arc-comparison-table-markWrap { display: inline-grid; justify-items: center; gap: 2px; }
.arc-comparison-table-check circle { fill: color-mix(in oklch, var(--foreground) 8%, transparent); }
.arc-comparison-table-check path { fill: none; stroke: var(--foreground); stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }
.arc-comparison-table-check[data-own] circle { fill: var(--control-on); }
.arc-comparison-table-check[data-own] path { stroke: var(--control-glyph); }
.arc-comparison-table-partial circle { fill: none; stroke: var(--text-muted); stroke-width: 1.5; }
.arc-comparison-table-partial path { fill: var(--text-muted); }
.arc-comparison-table-cross { color: var(--text-muted); opacity: .7; }
.arc-comparison-table-note { max-width: 12ch; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.25; }
.arc-comparison-table-text { font-size: var(--text-sm); font-weight: 500; font-variant-numeric: tabular-nums; }
.arc-comparison-table-cell:not([data-own]) .arc-comparison-table-text { color: var(--text-secondary); font-weight: 400; }

.arc-comparison-table-footRow > * { padding-top: var(--space-5); }
.arc-comparison-table-footCell { display: grid; place-items: center; padding-bottom: var(--space-5); }
.arc-comparison-table-footCell[data-own] { border-radius: 0 0 20px 20px; background: var(--band); }
.arc-comparison-table-legend { display: flex; flex-wrap: wrap; align-content: start; gap: var(--space-2) var(--space-4); padding-right: var(--space-4); color: var(--text-muted); font-size: var(--text-xs); }
.arc-comparison-table-legend span { display: inline-flex; align-items: center; gap: 6px; }
.arc-comparison-table-legend .arc-comparison-table-check path { stroke-width: 2.2; }
.arc-comparison-table-cta { display: inline-flex; height: var(--control-height-sm); max-width: calc(100% - var(--space-2)); align-items: center; justify-content: center; overflow: hidden; border: 0; border-radius: var(--radius-pill); padding: 0 var(--space-4); background: var(--foreground); color: var(--background); font: inherit; font-size: var(--text-sm); font-weight: 500; text-decoration: none; white-space: nowrap; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: transform var(--duration-instant) var(--ease-standard), background-color var(--duration-standard) var(--ease-standard), color var(--duration-standard) var(--ease-standard); }
.arc-comparison-table-cta:active { transform: scale(.97); }
.arc-comparison-table-cta[data-done] { background: color-mix(in oklch, var(--success) 14%, transparent); color: var(--success); }
.arc-comparison-table-ctaLabel { display: inline-flex; align-items: center; gap: 6px; }

@container compare (max-width: 820px) {
  .arc-comparison-table-table { --grid: minmax(0, 1.4fr) repeat(var(--columns), minmax(0, 1fr)); }
}
@container compare (max-width: 640px) {
  .arc-comparison-table-inner { gap: var(--space-6); padding: var(--space-12) var(--space-4); }
  .arc-comparison-table-table { --grid: minmax(0, 1.3fr) repeat(var(--columns), minmax(0, .9fr)); }
  .arc-comparison-table-headFeature, .arc-comparison-table-headCell { min-height: 72px; }
  .arc-comparison-table-legend { flex-direction: column; }
  .arc-comparison-table-feature { padding-right: var(--space-3); }
}

@media (prefers-reduced-motion: reduce) {
  .arc-comparison-table-thumb { transition: none; }
}
`;

const styles: Record<string, string> = new Proxy({
  "band": "arc-comparison-table-band",
  "cell": "arc-comparison-table-cell",
  "cellInner": "arc-comparison-table-cellInner",
  "check": "arc-comparison-table-check",
  "cross": "arc-comparison-table-cross",
  "cta": "arc-comparison-table-cta",
  "ctaLabel": "arc-comparison-table-ctaLabel",
  "description": "arc-comparison-table-description",
  "feature": "arc-comparison-table-feature",
  "footCell": "arc-comparison-table-footCell",
  "footRow": "arc-comparison-table-footRow",
  "head": "arc-comparison-table-head",
  "headCaption": "arc-comparison-table-headCaption",
  "headCell": "arc-comparison-table-headCell",
  "headFeature": "arc-comparison-table-headFeature",
  "headName": "arc-comparison-table-headName",
  "headRow": "arc-comparison-table-headRow",
  "headText": "arc-comparison-table-headText",
  "header": "arc-comparison-table-header",
  "hint": "arc-comparison-table-hint",
  "inner": "arc-comparison-table-inner",
  "intro": "arc-comparison-table-intro",
  "legend": "arc-comparison-table-legend",
  "markWrap": "arc-comparison-table-markWrap",
  "note": "arc-comparison-table-note",
  "partial": "arc-comparison-table-partial",
  "pick": "arc-comparison-table-pick",
  "pickHighlight": "arc-comparison-table-pickHighlight",
  "picker": "arc-comparison-table-picker",
  "root": "arc-comparison-table-root",
  "row": "arc-comparison-table-row",
  "scroller": "arc-comparison-table-scroller",
  "section": "arc-comparison-table-section",
  "sectionRow": "arc-comparison-table-sectionRow",
  "sectionTitle": "arc-comparison-table-sectionTitle",
  "srOnly": "arc-comparison-table-srOnly",
  "switch": "arc-comparison-table-switch",
  "table": "arc-comparison-table-table",
  "text": "arc-comparison-table-text",
  "thumb": "arc-comparison-table-thumb",
  "title": "arc-comparison-table-title",
  "toggle": "arc-comparison-table-toggle"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-comparison-table-${prop}`,
});


// ── Helper: comparison-table-data.ts ──
/** Sample comparison for the comparison table. Competitor names are generic categories, not real products. */

/** true is included, false is not, "partial" is limited, and a string prints as text (a limit, a price). */
export type ComparisonValue = boolean | "partial" | string | { value: boolean | "partial" | string; note?: string };

export type ComparisonColumn = {
  id: string;
  name: string;
  /** A short line under the name, such as a price. */
  caption?: string;
  /** Your product. It gets the tinted band and stays visible on phones. */
  highlight?: boolean;
};

export type ComparisonRow = {
  id: string;
  feature: string;
  /** Secondary text under the feature name. */
  hint?: string;
  values: Record<string, ComparisonValue>;
};

export type ComparisonSection = { id: string; title: string; rows: ComparisonRow[] };

export const comparisonColumns: ComparisonColumn[] = [
  { id: "relay", name: "Relay", caption: "$10 per seat", highlight: true },
  { id: "suite", name: "Legacy suite", caption: "$24 per seat" },
  { id: "sheets", name: "Spreadsheets", caption: "Free" },
  { id: "point", name: "Point tools", caption: "$16 per seat" },
];

export const comparisonSections: ComparisonSection[] = [
  {
    id: "planning", title: "Planning", rows: [
      { id: "projects", feature: "Projects", values: { relay: "Unlimited", suite: "Up to 50", sheets: "Unlimited", point: "Up to 10" } },
      { id: "roadmaps", feature: "Timelines and roadmaps", values: { relay: true, suite: true, sheets: false, point: { value: "partial", note: "Timeline only" } } },
      { id: "dependencies", feature: "Dependencies", hint: "Blocked work moves when its blocker does", values: { relay: true, suite: true, sheets: false, point: false } },
      { id: "templates", feature: "Templates", values: { relay: true, suite: true, sheets: { value: "partial", note: "Manual copies" }, point: true } },
    ],
  },
  {
    id: "collaboration", title: "Collaboration", rows: [
      { id: "realtime", feature: "Real time editing", values: { relay: true, suite: false, sheets: true, point: true } },
      { id: "guests", feature: "Free guest access", values: { relay: true, suite: false, sheets: true, point: { value: "partial", note: "Five guests" } } },
      { id: "comments", feature: "Comments and mentions", values: { relay: true, suite: true, sheets: true, point: true } },
      { id: "offline", feature: "Offline mode", hint: "Edits sync when you reconnect", values: { relay: true, suite: false, sheets: { value: "partial", note: "Desktop app only" }, point: false } },
    ],
  },
  {
    id: "automation", title: "Automation", rows: [
      { id: "rules", feature: "Rules and triggers", values: { relay: true, suite: true, sheets: false, point: { value: "partial", note: "Paid add on" } } },
      { id: "ai", feature: "AI summaries", values: { relay: true, suite: false, sheets: false, point: false } },
      { id: "api", feature: "Public API", values: { relay: true, suite: true, sheets: true, point: true } },
    ],
  },
  {
    id: "security", title: "Security", rows: [
      { id: "sso", feature: "SAML single sign on", values: { relay: true, suite: true, sheets: { value: "partial", note: "Enterprise plan" }, point: false } },
      { id: "audit", feature: "Audit log", values: { relay: true, suite: true, sheets: false, point: false } },
      { id: "residency", feature: "EU data residency", values: { relay: true, suite: { value: "partial", note: "Enterprise plan" }, sheets: true, point: false } },
    ],
  },
];



// inlined:  ComparisonColumn, ComparisonRow, ComparisonSection, ComparisonValue 

export interface ComparisonTableProps {
  title?: string;
  description?: string;
  columns?: ComparisonColumn[];
  sections?: ComparisonSection[];
  /** Hide rows where every visible column has the same value (controlled). */
  differencesOnly?: boolean;
  defaultDifferencesOnly?: boolean;
  onDifferencesOnlyChange?: (value: boolean) => void;
  /** Competitor shown beside yours in the stacked phone layout (controlled). */
  compareWith?: string;
  onCompareWithChange?: (id: string) => void;
  /** Call to action in your column. */
  cta?: { label: string; href?: string; onClick?: () => void; doneLabel?: string };
  /** Offset for the sticky header, such as the height of a fixed site header. Defaults to 0. */
  stickyTop?: number;
  /** Caps the table height and scrolls it inside the block, with the header sticking to its top. */
  maxHeight?: number | string;
  /** Width below which the table stacks into a two column comparison. Defaults to 640. */
  stackBelow?: number;
  className?: string;
}

const snappy = motionTokens.spring.snappy;
const smooth = motionTokens.spring.smooth;
const morph = motionTokens.spring.morph;

function useControllable<T>(value: T | undefined, initial: T, onChange?: (next: T) => void) {
  const [inner, setInner] = useState(initial);
  const current = value !== undefined ? value : inner;
  const set = (next: T) => { if (value === undefined) setInner(next); onChange?.(next); };
  return [current, set] as const;
}

function normalize(value: ComparisonValue | undefined) {
  if (value === undefined) return { value: false as const, note: undefined };
  if (typeof value === "object") return value;
  return { value, note: undefined };
}
const keyOf = (value: ComparisonValue | undefined) => { const item = normalize(value); return `${item.value}`; };

function Mark({ value, own, index, reduced }: { value: ComparisonValue | undefined; own: boolean; index: number; reduced: boolean }) {
  const { value: v, note } = normalize(value);
  if (typeof v === "string" && v !== "partial") return <span className={styles.text}>{v}</span>;
  if (v === true) return <span className={styles.markWrap}>
    <svg className={styles.check} data-own={own || undefined} width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      <circle cx="11" cy="11" r="10" />
      <motion.path d="M6.6 11.3l3 3 5.9-6.4" initial={reduced ? false : { pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true, amount: 1 }} transition={{ duration: .32, ease: [...motionTokens.ease.enter], delay: own ? .06 + Math.min(index, 12) * .035 : 0 }} />
    </svg>
    <span className={styles.srOnly}>Included</span>
  </span>;
  if (v === "partial") return <span className={styles.markWrap}>
    <svg className={styles.partial} width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><circle cx="11" cy="11" r="9.25" /><path d="M11 1.75a9.25 9.25 0 0 1 0 18.5z" /></svg>
    <span className={styles.srOnly}>Partial</span>
    {note && <span className={styles.note}>{note}</span>}
  </span>;
  return <span className={styles.markWrap}><Minus className={styles.cross} size={18} strokeWidth={1.75} aria-hidden="true" /><span className={styles.srOnly}>Not included</span></span>;
}

export function ComparisonTable({
  title = "How Relay compares",
  description = "Everything a growing team needs, without the enterprise price or the spreadsheet sprawl.",
  columns = comparisonColumns,
  sections = comparisonSections,
  differencesOnly: differencesProp,
  defaultDifferencesOnly = false,
  onDifferencesOnlyChange,
  compareWith: compareProp,
  onCompareWithChange,
  cta,
  stickyTop = 0,
  maxHeight,
  stackBelow = 640,
  className,
}: ComparisonTableProps) {
  const reduced = Boolean(useReducedMotion());
  const uid = useId();
  const rootRef = useRef<HTMLElement>(null);
  const [narrow, setNarrow] = useState(false);
  const [differencesOnly, setDifferencesOnly] = useControllable(differencesProp, defaultDifferencesOnly, onDifferencesOnlyChange);
  const own = columns.find(column => column.highlight) ?? columns[0];
  const others = columns.filter(column => column !== own);
  const [compareWith, setCompareWith] = useControllable(compareProp, others[0]?.id ?? own.id, onCompareWithChange);
  const [ctaDone, setCtaDone] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setNarrow(entry.contentRect.width < stackBelow));
    observer.observe(node);
    return () => observer.disconnect();
  }, [stackBelow]);

  const visible = narrow ? columns.filter(column => column === own || column.id === compareWith) : columns;
  const differs = (values: Record<string, ComparisonValue>) => new Set(visible.map(column => keyOf(values[column.id]))).size > 1;
  const gridStyle = { "--columns": visible.length, "--sticky-top": `${stickyTop}px` } as CSSProperties;
  let rowIndex = 0;

  const header = <div role="row" className={styles.headRow}>
    <div role="columnheader" className={styles.headFeature}><span className={styles.srOnly}>Feature</span></div>
    {visible.map(column => <div key={column === own ? "own" : narrow ? "other" : column.id} role="columnheader" className={styles.headCell} data-own={column === own || undefined}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={column.id} className={styles.headText} initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }} transition={smooth}>
          <span className={styles.headName}>{column.name}</span>
          {column.caption && <span className={styles.headCaption}>{column.caption}</span>}
        </motion.span>
      </AnimatePresence>
    </div>)}
  </div>;

  return <section ref={rootRef} className={[styles.root, className].filter(Boolean).join(" ")} aria-labelledby={`${uid}-title`} data-narrow={narrow || undefined}>
    <div className={styles.inner}>
      <header className={styles.header}>
        <div className={styles.intro}>
          <h2 id={`${uid}-title`} className={styles.title}>{title}</h2>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        <label className={styles.toggle}>
          <span>Only differences</span>
          <input type="checkbox" role="switch" checked={differencesOnly} onChange={event => setDifferencesOnly(event.target.checked)} />
          <span className={styles.switch} aria-hidden="true"><span className={styles.thumb} /></span>
        </label>
      </header>

      {narrow && others.length > 1 && <div className={styles.picker} role="group" aria-label={`Compare ${own.name} with`}>
        <LayoutGroup id={`${uid}-picker`}>
          {others.map(column => <button key={column.id} type="button" className={styles.pick} aria-pressed={column.id === compareWith} onClick={() => setCompareWith(column.id)}>
            {column.id === compareWith && <motion.span layoutId="pick" className={styles.pickHighlight} transition={reduced ? { duration: 0 } : morph} />}
            <span>{column.name}</span>
          </button>)}
        </LayoutGroup>
      </div>}

      <div className={styles.scroller} style={maxHeight !== undefined ? { maxHeight, overflowY: "auto" } : undefined} tabIndex={maxHeight !== undefined ? 0 : undefined} aria-label={maxHeight !== undefined ? title : undefined} role={maxHeight !== undefined ? "region" : undefined}>
        <div role="table" aria-labelledby={`${uid}-title`} className={styles.table} style={gridStyle}>
          <div role="rowgroup" className={styles.head}>{header}</div>
          {sections.map(section => {
            const rows = differencesOnly ? section.rows.filter(row => differs(row.values)) : section.rows;
            return <div role="rowgroup" key={section.id} className={styles.section}>
              <AnimatePresence initial={false}>
                {rows.length > 0 && <motion.div key="title" role="row" className={styles.sectionRow} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={reduced ? { duration: 0 } : smooth}>
                  <div role="rowheader" className={styles.sectionTitle}>{section.title}</div>
                  {visible.map(column => <div key={column.id} role="cell" className={styles.band} data-own={column === own || undefined} />)}
                </motion.div>}
                {rows.map(row => {
                  const index = rowIndex++;
                  return <motion.div key={row.id} role="row" className={styles.row} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={reduced ? { duration: 0 } : smooth}>
                    <div role="rowheader" className={styles.feature}>
                      <span>{row.feature}</span>
                      {row.hint && <span className={styles.hint}>{row.hint}</span>}
                    </div>
                    {visible.map(column => <div key={column === own ? "own" : narrow ? "other" : column.id} role="cell" className={styles.cell} data-own={column === own || undefined}>
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span key={`${column.id}`} className={styles.cellInner} initial={reduced ? { opacity: 0 } : { opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} exit={reduced ? { opacity: 0 } : { opacity: 0, scale: .8 }} transition={snappy}>
                          <Mark value={row.values[column.id]} own={column === own} index={index} reduced={reduced} />
                        </motion.span>
                      </AnimatePresence>
                    </div>)}
                  </motion.div>;
                })}
              </AnimatePresence>
            </div>;
          })}
          <div role="rowgroup">
            <div role="row" className={styles.footRow}>
              <div role="cell" className={styles.legend}>
                <span><svg className={styles.check} width="16" height="16" viewBox="0 0 22 22" aria-hidden="true"><circle cx="11" cy="11" r="10" /><path d="M6.6 11.3l3 3 5.9-6.4" /></svg>Included</span>
                <span><svg className={styles.partial} width="16" height="16" viewBox="0 0 22 22" aria-hidden="true"><circle cx="11" cy="11" r="9.25" /><path d="M11 1.75a9.25 9.25 0 0 1 0 18.5z" /></svg>Partial</span>
                <span><Minus className={styles.cross} size={14} aria-hidden="true" />Not included</span>
              </div>
              {visible.map(column => <div key={column.id} role="cell" className={styles.footCell} data-own={column === own || undefined}>
                {column === own && cta && (cta.href && !cta.onClick
                  ? <a className={styles.cta} href={cta.href}>{cta.label}</a>
                  : <button type="button" className={styles.cta} data-done={ctaDone || undefined} onClick={() => { cta.onClick?.(); if (cta.doneLabel) setCtaDone(true); }}>
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span key={ctaDone ? "done" : "idle"} className={styles.ctaLabel} initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8, filter: "blur(2px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, filter: "blur(2px)" }} transition={{ duration: motionTokens.duration.standard, ease: [...motionTokens.ease.standard] }}>
                        {ctaDone ? <><Check size={14} strokeWidth={2.25} aria-hidden="true" />{cta.doneLabel}</> : cta.label}
                      </motion.span>
                    </AnimatePresence>
                  </button>)}
              </div>)}
            </div>
          </div>
        </div>
      </div>
      <p className={styles.srOnly} aria-live="polite">{differencesOnly ? "Showing only rows that differ" : "Showing all rows"}</p>
    </div>
  </section>;
}

/** Preview: the comparison inside a capped height so the sticky header shows. */
export function ComparisonTableBlock() {
  return <ComparisonTable maxHeight="min(760px, 82vh)" cta={{ label: "Start free trial", doneLabel: "Trial started" }} />;
}

export default ComparisonTableBlock;
