"use client";

import type { CSSProperties } from "react";
import { animate, useInView } from "motion/react";
import { forwardRef, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

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
const ARC_STATS_BAND_STYLES = `.arc-stats-band-band { container: stats / inline-size; background: var(--background); color: var(--foreground); font-family: var(--font-body); letter-spacing: var(--tracking-body); }
.arc-stats-band-band *, .arc-stats-band-band *::before, .arc-stats-band-band *::after { box-sizing: border-box; }
.arc-stats-band-srOnly { position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.arc-stats-band-inner { max-width: 1120px; margin: 0 auto; padding: var(--space-24) var(--space-8); }

/* Header: the title on the left, the note on the right, sharing a last baseline. */
.arc-stats-band-header { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); align-items: last baseline; gap: var(--space-4) var(--space-12); margin-bottom: var(--space-16); }
.arc-stats-band-title { max-width: 16ch; margin: 0; font-family: var(--font-display); font-size: clamp(1.875rem, 1rem + 2.6cqi, var(--text-4xl)); font-weight: 500; letter-spacing: var(--tracking-display); line-height: var(--leading-display); text-wrap: balance; }
.arc-stats-band-description { max-width: 34ch; margin: 0; justify-self: end; color: var(--text-secondary); font-size: var(--text-base); line-height: 1.5; text-wrap: pretty; }
.arc-stats-band-header:not(:has(.arc-stats-band-title)) { grid-template-columns: minmax(0, 1fr); }
.arc-stats-band-header:not(:has(.arc-stats-band-title)) .arc-stats-band-description { justify-self: start; }

/* The grid. Every stat has the same rows, so numbers, labels, and visuals line up across the band. */
.arc-stats-band-stats { position: relative; display: grid; grid-template-columns: repeat(var(--count), minmax(0, 1fr)); column-gap: var(--space-10); row-gap: var(--space-16); margin: 0; }
.arc-stats-band-stat {
  --start: calc(var(--i) * 90ms + var(--draw));
  --ink: var(--text-secondary);
  --soft: var(--border-strong);
  position: relative; display: flex; min-width: 0; flex-direction: column; cursor: default; -webkit-tap-highlight-color: transparent;
}
.arc-stats-band-stat:focus { outline: none; }
.arc-stats-band-figure { order: -1; margin: 0 0 var(--space-5); }
.arc-stats-band-label { color: var(--foreground); font-size: var(--text-sm); font-weight: 500; line-height: var(--leading-body); text-wrap: pretty; }
.arc-stats-band-caption { display: grid; margin: 2px 0 0; color: var(--text-muted); font-size: var(--text-sm); line-height: var(--leading-body); }
.arc-stats-band-detail, .arc-stats-band-context { grid-area: 1 / 1; min-width: 0; text-wrap: pretty; transition: opacity var(--duration-standard) var(--ease-standard), transform var(--duration-standard) var(--ease-standard); }
.arc-stats-band-stat[data-context] .arc-stats-band-context { opacity: 0; transform: translateY(4px); }
.arc-stats-band-context { color: var(--text-secondary); }

/* The number: display type, tabular digits, the unit smaller and quieter on the same baseline. */
.arc-stats-band-number { display: inline-flex; align-items: baseline; font-family: var(--font-display); font-size: clamp(2.5rem, 1.4rem + 3cqi, var(--text-4xl)); font-weight: 500; letter-spacing: var(--tracking-display); line-height: 1; font-variant-numeric: tabular-nums; white-space: nowrap; }
.arc-stats-band-prefix, .arc-stats-band-suffix { color: var(--text-muted); font-size: .5em; letter-spacing: -.01em; }
.arc-stats-band-prefix { margin-right: .08em; }
.arc-stats-band-suffix { margin-left: .1em; }
.arc-stats-band-digits { display: inline-grid; justify-items: start; }
.arc-stats-band-sizer, .arc-stats-band-live { grid-area: 1 / 1; }
.arc-stats-band-sizer { visibility: hidden; }

/* Visuals sit on the bottom row, all the same height, so they line up whatever the copy above them does. */
.arc-stats-band-visual { position: relative; display: flex; flex: none; flex-direction: column; justify-content: flex-end; height: calc(56px + var(--space-8)); margin: auto 0 0; padding-top: var(--space-8); }
.arc-stats-band-visual > * { position: relative; height: 100%; }
.arc-stats-band-visual > .arc-stats-band-bars[data-dense] { height: 56%; }
.arc-stats-band-draw { display: block; width: 100%; height: 100%; overflow: visible; }

.arc-stats-band-trend { margin-right: 3px; }
.arc-stats-band-area { fill: var(--soft); opacity: .22; transition: fill var(--duration-standard) var(--ease-standard); }
.arc-stats-band-line { fill: none; stroke: var(--ink); stroke-width: 1.5; stroke-linejoin: round; stroke-linecap: round; transition: stroke var(--duration-standard) var(--ease-standard); }
.arc-stats-band-endDot { position: absolute; width: 7px; height: 7px; margin: -3.5px 0 0 -3.5px; border-radius: 50%; background: var(--ink); box-shadow: 0 0 0 2px var(--background); transition: background-color var(--duration-standard) var(--ease-standard), opacity 320ms var(--ease-standard), transform var(--duration-spring) var(--ease-spring); }

.arc-stats-band-bars { display: flex; align-items: flex-end; gap: 3px; }
/* 90 days never fit 90 fixed gaps in a narrow column, so dense bars carve their gap out of their own slot. */
.arc-stats-band-bars[data-dense] { gap: 0; }
.arc-stats-band-bars[data-dense] .arc-stats-band-bar { border-radius: 0; clip-path: inset(0 22% 0 22%); }
.arc-stats-band-bar { flex: 1 1 0; height: 100%; border-radius: 1px; background: var(--soft); transform: scaleY(var(--h)); transform-origin: bottom; transition: background-color var(--duration-standard) var(--ease-standard), transform 560ms var(--ease-enter); }
.arc-stats-band-bar[data-ink] { background: var(--ink); }

.arc-stats-band-map { display: flex; }
.arc-stats-band-map .arc-stats-band-draw { width: auto; aspect-ratio: 80 / 30; }
.arc-stats-band-land { fill: var(--soft); transition: fill var(--duration-standard) var(--ease-standard); }
.arc-stats-band-lit { fill: var(--ink); transition: fill var(--duration-standard) var(--ease-standard); }

/* Hover or focus: the context line fades in and the visual takes the accent. The other stats stay neutral. */
.arc-stats-band-stat:focus-visible { --ink: var(--accent); --soft: color-mix(in oklch, var(--accent) 42%, var(--background)); }
.arc-stats-band-stat[data-context]:focus-visible .arc-stats-band-detail { opacity: 0; transform: translateY(-4px); }
.arc-stats-band-stat[data-context]:focus-visible .arc-stats-band-context { opacity: 1; transform: none; }
@media (hover: none) {
  .arc-stats-band-stat:focus { --ink: var(--accent); --soft: color-mix(in oklch, var(--accent) 42%, var(--background)); }
  .arc-stats-band-stat[data-context]:focus .arc-stats-band-detail { opacity: 0; transform: translateY(-4px); }
  .arc-stats-band-stat[data-context]:focus .arc-stats-band-context { opacity: 1; transform: none; }
}
@media (hover: hover) {
  .arc-stats-band-stat:hover { --ink: var(--accent); --soft: color-mix(in oklch, var(--accent) 42%, var(--background)); }
  .arc-stats-band-stat[data-context]:hover .arc-stats-band-detail { opacity: 0; transform: translateY(-4px); }
  .arc-stats-band-stat[data-context]:hover .arc-stats-band-context { opacity: 1; transform: none; }
}

/* Entry: stats rise in sequence while the numbers count, then each visual draws in once its number has landed. */
.arc-stats-band-stat { opacity: 0; transform: translateY(8px); transition: opacity 480ms var(--ease-enter), transform 640ms var(--ease-enter); transition-delay: calc(var(--i) * 90ms); }
.arc-stats-band-band[data-in-view] .arc-stats-band-stat { opacity: 1; transform: none; }
.arc-stats-band-band:not([data-in-view]) .arc-stats-band-draw { clip-path: inset(0 100% 0 0); }
.arc-stats-band-band:not([data-in-view]) .arc-stats-band-bar { transform: scaleY(0); }
.arc-stats-band-band:not([data-in-view]) :is(.arc-stats-band-endDot) { opacity: 0; }
.arc-stats-band-band:not([data-in-view]) .arc-stats-band-endDot { transform: scale(.3); }
.arc-stats-band-draw { clip-path: inset(0 -4px 0 0); transition: clip-path 1100ms var(--ease-in-out) var(--start); }
.arc-stats-band-band[data-in-view] .arc-stats-band-bar { transition-delay: 0ms, calc(var(--start) + var(--j) * 420ms); }
.arc-stats-band-band[data-in-view] .arc-stats-band-endDot { transition-delay: 0ms, calc(var(--start) + 1000ms), calc(var(--start) + 1000ms); }

/* Divided: a hairline grid. Rules draw across the band, then hairlines grow between stats. */
.arc-stats-band-band[data-layout="divided"] .arc-stats-band-stats { column-gap: 0; row-gap: 0; }
.arc-stats-band-band[data-layout="divided"] .arc-stats-band-stats::before,
.arc-stats-band-band[data-layout="divided"] .arc-stats-band-stats::after { content: ""; position: absolute; right: 0; left: 0; height: 1px; background: var(--border); transform: scaleX(0); transform-origin: left; transition: transform 900ms var(--ease-in-out); }
.arc-stats-band-band[data-layout="divided"] .arc-stats-band-stats::before { top: 0; }
.arc-stats-band-band[data-layout="divided"] .arc-stats-band-stats::after { bottom: 0; transition-delay: 120ms; }
.arc-stats-band-band[data-layout="divided"][data-in-view] .arc-stats-band-stats::before,
.arc-stats-band-band[data-layout="divided"][data-in-view] .arc-stats-band-stats::after { transform: scaleX(1); }
.arc-stats-band-band[data-layout="divided"] .arc-stats-band-stat { padding: var(--space-10) var(--space-8) var(--space-8); }
.arc-stats-band-band[data-layout="divided"] .arc-stats-band-stat:first-child { padding-left: 0; }
.arc-stats-band-band[data-layout="divided"] .arc-stats-band-stat:last-child { padding-right: 0; }
.arc-stats-band-band[data-layout="divided"] .arc-stats-band-stat:not(:first-child)::before { content: ""; position: absolute; top: 0; bottom: 0; left: 0; width: 1px; background: var(--border); transform: scaleY(0); transform-origin: top; transition: transform 700ms var(--ease-enter); transition-delay: calc(var(--i) * 90ms + 240ms); }
.arc-stats-band-band[data-layout="divided"][data-in-view] .arc-stats-band-stat::before { transform: scaleY(1); }

/* Tablet: two by two. A band of three stacks instead of leaving an orphan. */
@container stats (max-width: 800px) {
  .arc-stats-band-inner { padding: var(--space-20) var(--space-8); }
  .arc-stats-band-header { grid-template-columns: minmax(0, 1fr); margin-bottom: var(--space-12); }
  .arc-stats-band-description { justify-self: start; }
  .arc-stats-band-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: var(--space-8); row-gap: var(--space-12); }
  .arc-stats-band-band[data-layout="divided"] .arc-stats-band-stat { padding: var(--space-8) var(--space-8) var(--space-8); }
  .arc-stats-band-band[data-layout="divided"] .arc-stats-band-stat:nth-child(2n + 1) { padding-left: 0; }
  .arc-stats-band-band[data-layout="divided"] .arc-stats-band-stat:nth-child(2n) { padding-right: 0; }
  .arc-stats-band-band[data-layout="divided"] .arc-stats-band-stat:nth-child(2n + 1)::before { display: none; }
  .arc-stats-band-band[data-layout="divided"] .arc-stats-band-stat:nth-child(n + 3)::after { content: ""; position: absolute; top: 0; right: 0; left: 0; height: 1px; background: var(--border); }
}

/* Phone: one stat per row, the visual beside the number so nothing is cramped. */
@container stats (max-width: 520px) {
  .arc-stats-band-inner { padding: var(--space-16) var(--space-4); }
  .arc-stats-band-header { margin-bottom: var(--space-10); }
  .arc-stats-band-stats { grid-template-columns: minmax(0, 1fr); row-gap: var(--space-10); }
  .arc-stats-band-stat { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 40%); grid-template-areas: "figure visual" "label label" "caption caption"; column-gap: var(--space-6); }
  .arc-stats-band-figure { grid-area: figure; align-self: end; margin-bottom: var(--space-3); }
  .arc-stats-band-label { grid-area: label; }
  .arc-stats-band-caption { grid-area: caption; }
  .arc-stats-band-visual { grid-area: visual; align-self: end; height: 40px; margin: 0 0 var(--space-3); padding: 0; }
  .arc-stats-band-map { justify-content: flex-end; }
  .arc-stats-band-band[data-layout="divided"] .arc-stats-band-stat,
  .arc-stats-band-band[data-layout="divided"] .arc-stats-band-stat:nth-child(n) { padding: var(--space-8) 0; }
  .arc-stats-band-band[data-layout="divided"] .arc-stats-band-stat::before { display: none; }
  .arc-stats-band-band[data-layout="divided"] .arc-stats-band-stat:nth-child(n + 2)::after { content: ""; position: absolute; top: 0; right: 0; left: 0; height: 1px; background: var(--border); }
}
@container stats (max-width: 800px) {
  .arc-stats-band-stats[data-count="3"] { grid-template-columns: minmax(0, 1fr); }
}

.arc-stats-band-preview { display: grid; width: 100%; justify-items: center; gap: var(--space-4); }
.arc-stats-band-frame { width: 100%; overflow: hidden; border: 1px solid var(--border); border-radius: 20px; background: var(--background); }

@media (prefers-reduced-motion: reduce) {
  .arc-stats-band-band .arc-stats-band-stat, .arc-stats-band-band .arc-stats-band-draw, .arc-stats-band-band .arc-stats-band-bar, .arc-stats-band-band .arc-stats-band-endDot,
  .arc-stats-band-band[data-layout="divided"] .arc-stats-band-stats::before, .arc-stats-band-band[data-layout="divided"] .arc-stats-band-stats::after, .arc-stats-band-band[data-layout="divided"] .arc-stats-band-stat::before { transition-duration: 0ms; transition-delay: 0ms; }
  .arc-stats-band-band .arc-stats-band-stat { opacity: 1; transform: none; }
  .arc-stats-band-band:not([data-in-view]) .arc-stats-band-draw { clip-path: inset(0 -4px 0 0); }
  .arc-stats-band-band:not([data-in-view]) .arc-stats-band-bar { transform: scaleY(var(--h)); }
  .arc-stats-band-band:not([data-in-view]) :is(.arc-stats-band-endDot) { opacity: 1; transform: none; }
  .arc-stats-band-detail, .arc-stats-band-context { transition-duration: 0ms; }
}
`;

const styles: Record<string, string> = new Proxy({
  "area": "arc-stats-band-area",
  "band": "arc-stats-band-band",
  "bar": "arc-stats-band-bar",
  "bars": "arc-stats-band-bars",
  "caption": "arc-stats-band-caption",
  "context": "arc-stats-band-context",
  "description": "arc-stats-band-description",
  "detail": "arc-stats-band-detail",
  "digits": "arc-stats-band-digits",
  "draw": "arc-stats-band-draw",
  "endDot": "arc-stats-band-endDot",
  "figure": "arc-stats-band-figure",
  "frame": "arc-stats-band-frame",
  "header": "arc-stats-band-header",
  "inner": "arc-stats-band-inner",
  "label": "arc-stats-band-label",
  "land": "arc-stats-band-land",
  "line": "arc-stats-band-line",
  "lit": "arc-stats-band-lit",
  "live": "arc-stats-band-live",
  "map": "arc-stats-band-map",
  "number": "arc-stats-band-number",
  "prefix": "arc-stats-band-prefix",
  "preview": "arc-stats-band-preview",
  "sizer": "arc-stats-band-sizer",
  "srOnly": "arc-stats-band-srOnly",
  "stat": "arc-stats-band-stat",
  "stats": "arc-stats-band-stats",
  "suffix": "arc-stats-band-suffix",
  "title": "arc-stats-band-title",
  "trend": "arc-stats-band-trend",
  "visual": "arc-stats-band-visual"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-stats-band-${prop}`,
});


// ── Inlined Subcomponent Helpers for Standalone Execution ──
export const Button = forwardRef<HTMLButtonElement, any>(function Button({ className = "", children, ...props }, ref) {
  return <button ref={ref} className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity ${className}`} {...props}>{children}</button>;
});

export function Avatar({ src, alt = "", name = "", className = "" }: any) {
  return <span className={`relative inline-flex items-center justify-center overflow-hidden rounded-full bg-[var(--surface-muted)] text-[var(--foreground)] font-medium text-xs w-8 h-8 ${className}`}>{src ? <img src={src} alt={alt} className="w-full h-full object-cover" /> : (name ? name[0] : "")}</span>;
}

export function AvatarGroup({ children, className = "" }: any) {
  return <div className={`flex items-center -space-x-2 ${className}`}>{children}</div>;
}

export const Input = forwardRef<HTMLInputElement, any>(function Input({ className = "", ...props }, ref) {
  return <input ref={ref} className={`w-full px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] outline-none focus:border-[var(--accent)] ${className}`} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, any>(function Textarea({ className = "", ...props }, ref) {
  return <textarea ref={ref} className={`w-full px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] outline-none focus:border-[var(--accent)] ${className}`} {...props} />;
});

export const PasswordField = forwardRef<HTMLInputElement, any>(function PasswordField({ className = "", ...props }, ref) {
  return <input ref={ref} type="password" className={`w-full px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] outline-none focus:border-[var(--accent)] ${className}`} {...props} />;
});

export const SearchField = forwardRef<HTMLInputElement, any>(function SearchField({ className = "", ...props }, ref) {
  return <input ref={ref} type="search" placeholder="Search..." className={`w-full px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] outline-none focus:border-[var(--accent)] ${className}`} {...props} />;
});

export function OtpInput({ length = 6, value = "", onChange, className = "" }: any) {
  return <div className={`flex gap-2 ${className}`}>{[...Array(length)].map((_, i) => <input key={i} maxLength={1} value={value[i] || ""} className="w-10 h-12 text-center text-lg font-semibold rounded-xl border border-[var(--border)] bg-[var(--surface)]" readOnly />)}</div>;
}

export function Badge({ children, className = "" }: any) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--surface-muted)] text-[var(--text-secondary)] ${className}`}>{children}</span>;
}

export function Progress({ value = 0, className = "" }: any) {
  return <div className={`w-full h-2 rounded-full bg-[var(--surface-muted)] overflow-hidden ${className}`}><div className="h-full bg-[var(--foreground)] transition-all duration-300" style={{ width: `${value}%` }} /></div>;
}

export function Switch({ checked, onCheckedChange, className = "", ...props }: any) {
  return <button type="button" role="switch" aria-checked={checked} onClick={() => onCheckedChange?.(!checked)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${checked ? 'bg-[var(--control-on)]' : 'bg-[var(--control-track)]'} ${className}`} {...props}><span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transform transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} /></button>;
}

export function Checkbox({ checked, onCheckedChange, className = "", ...props }: any) {
  return <input type="checkbox" checked={checked} onChange={e => onCheckedChange?.(e.target.checked)} className={`rounded border-[var(--border)] text-[var(--accent)] ${className}`} {...props} />;
}

export function SegmentedControl({ value, onChange, options = [], className = "" }: any) {
  return (
    <div className={`inline-flex p-1 rounded-xl bg-[var(--surface-muted)] text-sm ${className}`}>
      {options.map((opt: any) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const active = val === value;
        return (
          <button key={val} type="button" onClick={() => onChange?.(val)} className={`px-3 py-1 rounded-lg font-medium transition-all ${active ? 'bg-[var(--surface)] shadow-sm text-[var(--foreground)]' : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'}`}>{label}</button>
        );
      })}
    </div>
  );
}

export function CopyButton({ text, className = "" }: any) {
  return <button type="button" onClick={() => navigator.clipboard?.writeText(text || "")} className={`px-2.5 py-1 text-xs rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] ${className}`}>Copy</button>;
}

export function AnimatedCounter({ value, className = "" }: any) {
  return <span className={className}>{value}</span>;
}

export function TextMorph({ children, className = "" }: any) {
  return <span className={className}>{children}</span>;
}

export function Sparkline({ data = [], className = "" }: any) {
  return <svg className={`w-24 h-8 ${className}`}><path d="M0 16 L20 10 L40 18 L60 8 L80 12 L100 4" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>;
}

export function LineChart({ data = [], className = "" }: any) {
  return <svg className={`w-full h-32 ${className}`}><path d="M0 64 L50 40 L100 70 L150 30 L200 45 L250 15" fill="none" stroke="currentColor" strokeWidth="2" /></svg>;
}

export function Calendar(props: any) {
  return <div className="p-3 border border-[var(--border)] rounded-2xl bg-[var(--surface)]">Calendar</div>;
}


// ── Helper: stats-band-data.ts ──
/**
 * A small visual that proves the number beside it. Every kind is optional; a stat without one is just the number.
 * - `trend`: a sparkline of a series, oldest first, such as twelve monthly totals.
 * - `uptime`: one bar per day as a percentage. Full days are full height; a day with downtime is visibly shorter.
 * - `distribution`: a histogram of equal width bins across `0..max`, with the bars below `marker` (the median) inked.
 * - `map`: a dotted world with a dot lit for each [longitude, latitude] point.
 */
export type StatVisual =
  | { kind: "trend"; values: number[] }
  | { kind: "uptime"; days: number[] }
  | { kind: "distribution"; bins: number[]; max: number; marker: number }
  | { kind: "map"; points: [number, number][] };

export interface Stat {
  /** The final number. The band counts up to it. */
  value: number;
  /** Text before the number, such as "$". */
  prefix?: string;
  /** Text after the number, such as "%", "ms", or "+". */
  suffix?: string;
  /** Digits after the decimal point. Defaults to 0. */
  decimals?: number;
  /** `compact` shortens large numbers to 2.3M or 12K. The unit renders like a suffix. Defaults to `standard`. */
  notation?: "standard" | "compact";
  label: string;
  /** One short supporting line under the number. */
  detail?: string;
  /** One line of context that replaces the detail while the stat is hovered or focused, such as "Up from 41% last year". */
  context?: string;
  /** A tiny chart that draws in after the number lands. */
  visual?: StatVisual;
}

/** 90 days of uptime, oldest first: two short incidents, 11 minutes on day 52 and 1 minute on day 24. */
const uptimeDays = Array.from({ length: 90 }, (_, day) => day === 51 ? 99.24 : day === 23 ? 99.93 : 100);

/** 35 edge regions as [longitude, latitude]. */
const regions: [number, number][] = [
  [-122.4, 37.8], [-118.2, 34], [-96.8, 32.8], [-87.6, 41.9], [-77.5, 39], [-74, 40.7], [-79.4, 43.7], [-99.1, 19.4],
  [-74.1, 4.7], [-77, -12], [-46.6, -23.5], [-70.7, -33.4], [-58.4, -34.6],
  [-0.1, 51.5], [-6.3, 53.3], [2.35, 48.9], [4.9, 52.4], [8.7, 50.1], [18, 59.3], [-3.7, 40.4], [9.2, 45.5], [21, 52.2],
  [3.4, 6.5], [28, -26.2], [36.8, -1.3], [55.3, 25.3], [34.8, 32.1],
  [72.9, 19.1], [103.8, 1.35], [114.2, 22.3], [139.7, 35.7], [127, 37.6], [106.8, -6.2], [151.2, -33.9], [174.8, -36.8],
];

export const stats: Stat[] = [
  {
    value: 2_334_000, notation: "compact", decimals: 1, label: "Deploys in the last 12 months",
    detail: "Across 12,400 teams", context: "Up from 1.4M the year before",
    visual: { kind: "trend", values: [141, 148, 139, 162, 171, 184, 196, 203, 221, 238, 257, 274] },
  },
  {
    value: 99.99, decimals: 2, suffix: "%", label: "API uptime over 90 days",
    detail: "Measured every 30 seconds", context: "12 minutes down, 11 of them on July 14",
    visual: { kind: "uptime", days: uptimeDays },
  },
  {
    value: 38, suffix: "ms", label: "Median response time",
    detail: "At the edge, worldwide", context: "p95 is 96 ms, down from 141 ms",
    visual: { kind: "distribution", bins: [2, 8, 18, 26, 15, 10, 7, 5, 3, 2, 1.5, 1, .8, .7, .5, .3], max: 160, marker: 38 },
  },
  {
    value: 35, label: "Edge regions on six continents",
    detail: "Most people are under 20 ms away", context: "Eight added this year, including Lagos",
    visual: { kind: "map", points: regions },
  },
];

// ── Helper: stats-band-world.ts ──
/**
 * A coarse dotted world for the map visual: 80 columns by 30 rows, from 168° W to 192° E and 76° N to 56° S
 * (Antarctica left out). Each row is hex, four columns per digit, most significant bit first.
 */
const ROWS = [
  "001f007f800020fc0000", "7fc0cc7f00781ffffff8", "7ffffe38c0dffffffff8", "7fff0e1003bfffffff60", "40ffcf0009bffffff0c0",
  "007fff801ffffffff880", "003fff0007fffffff000", "003ffc001c737fffec00", "003ff800181f7fff4800", "001ff0000f07ffff3000",
  "000f80001fff7fff0000", "000f00003ffb9fff0000", "000340003fffc7b80000", "0001c0003ffd82380000", "000020003ffe021c0000",
  "00001f001fff00100000", "00000fc001ff00010000", "00000fe001fe00028000", "00001ff800fc00080c00", "00000ff800fc00000200",
  "000007f800fc00003000", "000003f800fd0000fc00", "000003f000790001fe00", "000007e000780001fe00", "000007c000700001de00",
  "00000780000000000e00", "00000600000000000008", "00000600000000000020", "00000400000000000000", "00000400000000000000",
];

export const WORLD = { columns: 80, rows: 30, west: -168, east: 192, north: 76, south: -56 } as const;

/** Land cells as a flat row-major array of booleans. */
export const worldLand: boolean[] = ROWS.flatMap(row => [...row].flatMap(digit => {
  const bits = parseInt(digit, 16);
  return [8, 4, 2, 1].map(bit => (bits & bit) !== 0);
}));



// inlined:  Stat, StatVisual 
export type StatsBandLayout = "plain" | "divided";

export interface StatsBandProps {
  /** Three or four stats read best. */
  stats?: Stat[];
  /** `plain` lets the stats float on whitespace; `divided` sets them in a hairline grid ruled above and below. */
  layout?: StatsBandLayout;
  title?: string;
  description?: string;
  /** Seconds each number takes to count up. Defaults to 1.6. */
  duration?: number;
  /** Number formatting locale. Fixed by default so server and client agree. */
  locale?: string;
  className?: string;
}

type Bezier = [number, number, number, number];
const enter = [...motionTokens.ease.enter] as Bezier;
const STAGGER = .09;

const REDUCE = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (onChange: () => void) => {
  const query = window.matchMedia(REDUCE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
/** Reduced motion, read after hydration so the server and first client render agree. CSS covers the first paint. */
function useReducedMotionSafe() {
  return useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCE).matches, () => false);
}

/**
 * Formats a stat's number, split from its compact unit so the unit can sit beside the digits like a suffix. A compact
 * stat counts inside its final unit (0.0M to 2.3M) instead of jumping from K to M halfway through.
 */
function useFormat(stat: Stat, locale: string) {
  return useMemo(() => {
    const decimals = stat.decimals ?? 0;
    const digits = new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals, numberingSystem: "latn" });
    if (stat.notation !== "compact") return { unit: "", format: (value: number) => digits.format(value) };
    const size = Math.abs(stat.value);
    const scale = size >= 1e12 ? 1e12 : size >= 1e9 ? 1e9 : size >= 1e6 ? 1e6 : size >= 1e3 ? 1e3 : 1;
    const unit = scale === 1 ? "" : new Intl.NumberFormat(locale, { notation: "compact" }).formatToParts(scale).find(part => part.type === "compact")?.value ?? "";
    return { unit, format: (value: number) => digits.format(value / scale) };
  }, [stat.decimals, stat.notation, stat.value, locale]);
}

/**
 * One number that counts from zero to its value the first time the band is in view. The final value reserves the
 * width underneath, so the layout never moves while digits change. Screen readers only get the final value.
 */
function CountUp({ stat, run, delay, duration, reduced, locale }: { stat: Stat; run: boolean; delay: number; duration: number; reduced: boolean; locale: string }) {
  const live = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  const { unit, format } = useFormat(stat, locale);
  const final = format(stat.value);
  const suffix = `${unit}${stat.suffix ?? ""}`;

  useLayoutEffect(() => {
    if (reduced || done.current || !live.current) return;
    live.current.textContent = format(0);
  }, [format, reduced]);

  useEffect(() => {
    const node = live.current;
    if (!node) return;
    if (reduced) { node.textContent = final; done.current = true; return; }
    if (!run || done.current) return;
    const controls = animate(0, stat.value, {
      duration,
      delay,
      ease: enter,
      onUpdate: latest => { node.textContent = format(latest); },
      onComplete: () => { node.textContent = final; done.current = true; },
    });
    return () => controls.stop();
  }, [run, reduced, stat.value, delay, duration, format, final]);

  return <>
    <span className={styles.srOnly}>{stat.prefix}{final}{suffix}</span>
    <span className={styles.number} aria-hidden="true">
      {stat.prefix && <span className={styles.prefix}>{stat.prefix}</span>}
      <span className={styles.digits}>
        <span className={styles.sizer}>{final}</span>
        <span ref={live} className={styles.live}>{final}</span>
      </span>
      {suffix && <span className={styles.suffix}>{suffix}</span>}
    </span>
  </>;
}

/* Visuals. Each one is drawn at rest; CSS hides it until the band is in view, then draws it in. */

function Trend({ values }: { values: number[] }) {
  const min = Math.min(...values), max = Math.max(...values);
  const span = max - min || 1;
  const points = values.map((value, index) => [values.length > 1 ? index / (values.length - 1) * 100 : 100, 36 - (value - min) / span * 32] as const);
  const line = points.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
  const [endX, endY] = points[points.length - 1];
  return <div className={styles.trend}>
    <svg className={styles.draw} viewBox="0 0 100 40" preserveAspectRatio="none">
      <path className={styles.area} d={`${line} L100 40 L0 40 Z`} />
      <path className={styles.line} d={line} vectorEffect="non-scaling-stroke" />
    </svg>
    <span className={styles.endDot} style={{ left: `${endX}%`, top: `${endY / 40 * 100}%` }} />
  </div>;
}

function Uptime({ days }: { days: number[] }) {
  return <div className={styles.bars} data-dense="">
    {days.map((uptime, index) => <span key={index} className={styles.bar} data-ink={uptime < 100 ? "" : undefined}
      style={{ "--j": index / days.length, "--h": Math.min(1, Math.max(.3, 1 - (100 - uptime) * .7)) } as CSSProperties} />)}
  </div>;
}

function Distribution({ bins, max, marker }: { bins: number[]; max: number; marker: number }) {
  const peak = Math.max(...bins) || 1;
  const width = max / bins.length;
  return <div className={styles.bars}>
    {bins.map((count, index) => <span key={index} className={styles.bar} data-ink={index * width < marker ? "" : undefined}
      style={{ "--j": index / bins.length, "--h": Math.max(.04, count / peak) } as CSSProperties} />)}
  </div>;
}

const cellOf = (lon: number, lat: number) => {
  const x = Math.floor((((lon - WORLD.west) % 360 + 360) % 360) / (WORLD.east - WORLD.west) * WORLD.columns);
  const y = Math.floor((WORLD.north - lat) / (WORLD.north - WORLD.south) * WORLD.rows);
  return [Math.min(WORLD.columns - 1, Math.max(0, x)), Math.min(WORLD.rows - 1, Math.max(0, y))] as const;
};

/** Snaps a point to the nearest land dot, so a coastal city never lights a dot in the sea. */
function nearestLand(lon: number, lat: number) {
  const [x, y] = cellOf(lon, lat);
  let best = y * WORLD.columns + x, distance = Infinity;
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
    const cx = x + dx, cy = y + dy;
    if (cx < 0 || cy < 0 || cx >= WORLD.columns || cy >= WORLD.rows || !worldLand[cy * WORLD.columns + cx]) continue;
    const d = dx * dx + dy * dy;
    if (d < distance) { distance = d; best = cy * WORLD.columns + cx; }
  }
  return best;
}

function WorldMap({ points }: { points: [number, number][] }) {
  const lit = useMemo(() => new Set(points.map(([lon, lat]) => nearestLand(lon, lat))), [points]);
  return <div className={styles.map}>
    <svg className={styles.draw} viewBox={`0 0 ${WORLD.columns} ${WORLD.rows}`}>
      {worldLand.map((land, index) => land && !lit.has(index) && <circle key={index} className={styles.land} cx={index % WORLD.columns + .5} cy={Math.floor(index / WORLD.columns) + .5} r={.3} />)}
      {[...lit].map(index => <circle key={index} className={styles.lit} cx={index % WORLD.columns + .5} cy={Math.floor(index / WORLD.columns) + .5} r={.5} />)}
    </svg>
  </div>;
}

function Visual({ visual }: { visual: StatVisual }) {
  switch (visual.kind) {
    case "trend": return <Trend values={visual.values} />;
    case "uptime": return <Uptime days={visual.days} />;
    case "distribution": return <Distribution bins={visual.bins} max={visual.max} marker={visual.marker} />;
    case "map": return <WorldMap points={visual.points} />;
  }
}

/**
 * A band of three or four headline numbers, each with an optional tiny visual that proves it: a trend, an uptime strip,
 * a latency histogram, or a dotted world. The numbers count up in a staggered sequence the first time the band is in
 * view, then the visuals draw in. Hovering or focusing a stat swaps its detail line for one line of context and gives
 * its visual the accent. Numbers use tabular figures and reserve their final width; screen readers get final values.
 */
export const StatsBand = forwardRef<HTMLElement, StatsBandProps>(function StatsBand({
  stats = exampleStats,
  layout = "plain",
  title,
  description,
  duration = 1.6,
  locale = "en-US",
  className,
}, ref) {
  const id = useId();
  const list = useRef<HTMLDListElement>(null);
  const inView = useInView(list, { once: true, amount: .4 });
  const reduced = useReducedMotionSafe();
  const withVisuals = stats.some(stat => stat.visual);
  return <section ref={ref} className={[styles.band, className].filter(Boolean).join(" ")} data-layout={layout} data-in-view={inView || reduced ? "" : undefined}
    aria-labelledby={title ? `${id}-title` : undefined} aria-label={title ? undefined : "Key numbers"}>
    <div className={styles.inner}>
      {(title || description) && <header className={styles.header}>
        {title && <h2 id={`${id}-title`} className={styles.title}>{title}</h2>}
        {description && <p className={styles.description}>{description}</p>}
      </header>}
      <dl ref={list} className={styles.stats} data-count={Math.min(stats.length, 4)} data-visuals={withVisuals ? "" : undefined}
        style={{ "--count": Math.min(stats.length, 4), "--draw": `${Math.round(duration * 420)}ms` } as CSSProperties}>
        {stats.map((stat, index) => <div key={`${stat.label}-${index}`} className={styles.stat} style={{ "--i": index } as CSSProperties}
          tabIndex={stat.context ? 0 : undefined} data-context={stat.context && stat.detail ? "" : undefined}>
          <dt className={styles.label}>{stat.label}</dt>
          <dd className={styles.figure}>
            <CountUp stat={stat} run={inView} delay={index * STAGGER} duration={duration} reduced={reduced} locale={locale} />
          </dd>
          {(stat.detail || stat.context) && <dd className={styles.caption}>
            {stat.detail && <span className={styles.detail}>{stat.detail}</span>}
            {stat.context && <span className={styles.context}>{stat.context}</span>}
          </dd>}
          {withVisuals && <dd className={styles.visual} aria-hidden="true">{stat.visual && <Visual visual={stat.visual} />}</dd>}
        </div>)}
      </dl>
    </div>
  </section>;
});

StatsBand.displayName = "StatsBand";

const layoutOptions = [{ value: "divided", label: "Divided" }, { value: "plain", label: "Plain" }];

/** Preview: the band in either layout. Switching layouts plays the sequence again. */
export function StatsBandBlock() {
  const [layout, setLayout] = useState<StatsBandLayout>("divided");
  return <div className={styles.preview}>
    <SegmentedControl label="Stats layout" options={layoutOptions} value={layout} onValueChange={next => setLayout(next as StatsBandLayout)} />
    <div className={styles.frame}>
      <StatsBand key={layout} layout={layout} title="Fast, steady, and close to everyone" description="Measured across every region from October 2025 to September 2026." />
    </div>
  </div>;
}

export default StatsBandBlock;
