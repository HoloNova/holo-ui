"use client";

import type { KeyboardEvent, PointerEvent } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

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
const ARC_EMPTY_STATES_STYLES = `.arc-empty-states-root { container-type: inline-size; width: 100%; color: var(--foreground); font-family: var(--font-body); letter-spacing: var(--tracking-body); }

.arc-empty-states-card { display: flex; flex-direction: column; align-items: center; gap: clamp(20px, 4cqi, 32px); padding: clamp(16px, 5cqi, 48px) clamp(16px, 4cqi, 40px); border: 1px solid var(--border); border-radius: 20px; background: var(--surface); }

/* Tabs: equal columns while there is room, never narrower than a label. The highlight glides under the labels. */
.arc-empty-states-tabs { isolation: isolate; display: grid; grid-template-columns: repeat(4, minmax(max-content, 1fr)); gap: 2px; width: min(100%, 460px); overflow-x: auto; padding: 3px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface-muted); scrollbar-width: none; }
.arc-empty-states-tabs::-webkit-scrollbar { display: none; }
.arc-empty-states-tab { position: relative; min-height: 30px; padding: 0 clamp(8px, 2.6cqi, 14px); border: 0; border-radius: 9px; background: transparent; color: var(--text-muted); font: inherit; font-size: 13px; font-weight: 500; white-space: nowrap; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: color var(--duration-fast) var(--ease-standard); }
.arc-empty-states-tab[aria-selected="true"] { color: var(--foreground); }
@media (hover: hover) and (pointer: fine) { .arc-empty-states-tab:hover { color: var(--foreground); } }
.arc-empty-states-highlight { position: absolute; inset: 0; z-index: -1; border: 1px solid var(--border); border-radius: inherit; background: var(--surface); box-shadow: var(--shadow-resting); }
.arc-empty-states-tabLabel { position: relative; }
@container (max-width: 380px) { .arc-empty-states-tab { padding: 0 6px; font-size: 12px; } }

.arc-empty-states-panel { display: flex; flex-direction: column; align-items: center; gap: var(--space-5); width: 100%; max-width: 480px; }

/* The drawing keeps one aspect ratio, so switching scenes never changes the layout. */
.arc-empty-states-stage { width: min(100%, 360px); aspect-ratio: 320 / 216; }
.arc-empty-states-art { display: block; width: 100%; height: 100%; overflow: visible; }

/* Strokes stay 1.5px on screen at any size. Colors come from tones and cross over on CSS transitions while the geometry springs. */
.arc-empty-states-shape { vector-effect: non-scaling-stroke; fill: none; stroke: none; stroke-width: 1.5px; stroke-linecap: round; stroke-linejoin: round; transition: fill var(--duration-considered) var(--ease-standard), stroke var(--duration-considered) var(--ease-standard); }
.arc-empty-states-shape[data-tone="outline"] { fill: var(--surface); stroke: var(--foreground); }
.arc-empty-states-shape[data-tone="tuck"] { fill: var(--surface); stroke: var(--border-strong); }
.arc-empty-states-shape[data-tone="slot"] { fill: var(--surface); stroke: var(--border-strong); }
.arc-empty-states-shape[data-tone="query"] { fill: var(--text-muted); stroke: transparent; }
.arc-empty-states-shape[data-tone="bar"] { fill: var(--border-strong); stroke: transparent; }
.arc-empty-states-shape[data-tone="back"] { fill: var(--surface); stroke: var(--text-muted); }
.arc-empty-states-shape[data-tone="shade"] { fill: var(--surface-muted); stroke: var(--foreground); }
.arc-empty-states-shape[data-tone="dot"] { fill: var(--foreground); stroke: transparent; }
.arc-empty-states-shape[data-tone="ink"] { fill: var(--surface); stroke: var(--foreground); }
.arc-empty-states-shape[data-tone="muted"] { fill: var(--surface); stroke: var(--text-muted); }
.arc-empty-states-shape[data-tone="subtle"] { fill: var(--surface); stroke: var(--border-strong); }
.arc-empty-states-shape[data-tone="accent"] { fill: var(--surface); stroke: var(--foreground); }
.arc-empty-states-shape[data-tone="success"] { fill: var(--surface); stroke: var(--success); }
.arc-empty-states-shape[data-tone="warning"] { fill: var(--surface); stroke: var(--warning); }
.arc-empty-states-shape:is([data-kind="stroke"], [data-kind="mark"])[data-tone] { fill: none; }

/* Copy */
.arc-empty-states-copy { display: flex; flex-direction: column; align-items: center; gap: var(--space-4); width: 100%; text-align: center; }
.arc-empty-states-copyFrame { width: 100%; }
.arc-empty-states-copyInner { display: grid; gap: 6px; padding-inline: var(--space-2); }
.arc-empty-states-title { position: relative; margin: 0; font-size: var(--text-lg); font-weight: 500; line-height: 1.3; letter-spacing: -.02em; text-wrap: balance; }
@container (min-width: 560px) { .arc-empty-states-title { font-size: var(--text-xl); } }
.arc-empty-states-line { position: relative; max-width: 40ch; margin: 0 auto; color: var(--text-secondary); font-size: var(--text-sm); line-height: 1.5; text-wrap: pretty; }
.arc-empty-states-swap { display: block; }

.arc-empty-states-srOnly { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

@media (prefers-reduced-motion: reduce) {
  .arc-empty-states-shape, .arc-empty-states-tab { transition: none; }
}
`;

const styles: Record<string, string> = new Proxy({
  "art": "arc-empty-states-art",
  "card": "arc-empty-states-card",
  "copy": "arc-empty-states-copy",
  "copyFrame": "arc-empty-states-copyFrame",
  "copyInner": "arc-empty-states-copyInner",
  "highlight": "arc-empty-states-highlight",
  "line": "arc-empty-states-line",
  "panel": "arc-empty-states-panel",
  "root": "arc-empty-states-root",
  "shape": "arc-empty-states-shape",
  "srOnly": "arc-empty-states-srOnly",
  "stage": "arc-empty-states-stage",
  "swap": "arc-empty-states-swap",
  "tab": "arc-empty-states-tab",
  "tabLabel": "arc-empty-states-tabLabel",
  "tabs": "arc-empty-states-tabs",
  "title": "arc-empty-states-title"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-empty-states-${prop}`,
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


// ── Helper: empty-states-art.ts ──
/**
 * Geometry for the empty states illustration. Every scene is drawn from the same ten primitives, in the same paint order:
 * two back tiles, one morphing body, four front tiles, two line accents and one two-stroke mark. A scene only moves them.
 * Tiles are rounded rectangles described by center, size, radius, rotation and skew, so a circle can become a panel.
 * The body, lines and mark are equal-count point lists, sampled clockwise from the top left, so any outline can become any other.
 */

export type SceneId = "search" | "offline" | "inbox" | "map";
export type Phase = "idle" | "loading" | "done";
export type Kind = "tile" | "body" | "stroke" | "mark";
/** `geo` springs as one vector; `fx` holds opacity and how much of a stroke is drawn. */
export type Prim = { kind: Kind; geo: number[]; fx: [number, number]; tone: string; redraw: boolean };
export type Frame = { prims: Prim[]; label: string };

export const KINDS: Kind[] = ["tile", "tile", "body", "tile", "tile", "tile", "tile", "stroke", "stroke", "mark"];

type Pt = readonly [number, number];
type Seg = { len: number; at: (t: number) => Pt };

const N = 176, K = 40, M = 12;
const TAU = Math.PI * 2, RAD = Math.PI / 180;

const seg = (a: Pt, b: Pt): Seg => {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  return { len: Math.hypot(dx, dy), at: t => [a[0] + dx * t, a[1] + dy * t] };
};

/** Arcs always run clockwise on screen, from `from` to `to` in radians. */
function arc(c: Pt, r: number, from: number, to: number): Seg {
  let end = to;
  while (end < from - 1e-9) end += TAU;
  const span = end - from;
  return { len: span * r, at: t => [c[0] + r * Math.cos(from + span * t), c[1] + r * Math.sin(from + span * t)] };
}
const arcDeg = (c: Pt, r: number, from: number, to: number) => arc(c, r, from * RAD, to * RAD);
const polar = (c: Pt, r: number, deg: number): Pt => [c[0] + r * Math.cos(deg * RAD), c[1] + r * Math.sin(deg * RAD)];

const chain = (points: Pt[], closed = false) => {
  const segs: Seg[] = [];
  for (let i = 0; i < (closed ? points.length : points.length - 1); i++) segs.push(seg(points[i], points[(i + 1) % points.length]));
  return segs;
};

/** A Catmull-Rom curve through the points, walked by arc length. */
function curve(points: Pt[]): Seg {
  const dense: Pt[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)], p1 = points[i], p2 = points[i + 1], p3 = points[Math.min(points.length - 1, i + 2)];
    for (let s = 0; s < 16; s++) {
      const t = s / 16, t2 = t * t, t3 = t2 * t;
      const axis = (k: 0 | 1) => .5 * (2 * p1[k] + (p2[k] - p0[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (3 * p1[k] - p0[k] - 3 * p2[k] + p3[k]) * t3);
      dense.push([axis(0), axis(1)]);
    }
  }
  dense.push(points[points.length - 1]);
  const cum = [0];
  for (let i = 1; i < dense.length; i++) cum.push(cum[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
  const len = cum[cum.length - 1];
  return {
    len,
    at: t => {
      const goal = t * len;
      let i = 1;
      while (i < cum.length - 1 && cum[i] < goal) i++;
      const u = (goal - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
      return [dense[i - 1][0] + (dense[i][0] - dense[i - 1][0]) * u, dense[i - 1][1] + (dense[i][1] - dense[i - 1][1]) * u];
    },
  };
}

/** Shares `n` points between segments by length. Every segment starts on a point, so sharp corners survive the resample. */
function allot(lens: number[], n: number) {
  const total = lens.reduce((sum, len) => sum + len, 0);
  if (total < 1e-6) return lens.map((_, i) => (i === 0 ? n : 0));
  const exact = lens.map(len => (len / total) * n);
  const counts = exact.map((value, i) => (lens[i] > 1e-6 ? Math.max(1, Math.floor(value)) : 0));
  let sum = counts.reduce((a, b) => a + b, 0);
  while (sum < n) {
    let best = -1;
    for (let i = 0; i < counts.length; i++) if (lens[i] > 1e-6 && (best < 0 || exact[i] - counts[i] > exact[best] - counts[best])) best = i;
    counts[best]++; sum++;
  }
  while (sum > n) {
    let best = -1;
    for (let i = 0; i < counts.length; i++) if (counts[i] > 1 && (best < 0 || counts[i] - exact[i] > counts[best] - exact[best])) best = i;
    counts[best]--; sum--;
  }
  return counts;
}

function sample(segs: Seg[], n: number, open: boolean) {
  const counts = allot(segs.map(s => s.len), open ? n - 1 : n);
  const out: number[] = [];
  segs.forEach((s, i) => { for (let j = 0; j < counts[i]; j++) { const [x, y] = s.at(j / counts[i]); out.push(x, y); } });
  if (open) { const [x, y] = segs[segs.length - 1].at(1); out.push(x, y); }
  return out;
}

function rrect(x: number, y: number, w: number, h: number, radius: number | number[]): Seg[] {
  const [tl, tr, br, bl] = typeof radius === "number" ? [radius, radius, radius, radius] : radius;
  return [
    seg([x + tl, y], [x + w - tr, y]), arcDeg([x + w - tr, y + tr], tr, -90, 0),
    seg([x + w, y + tr], [x + w, y + h - br]), arcDeg([x + w - br, y + h - br], br, 0, 90),
    seg([x + w - br, y + h], [x + bl, y + h]), arcDeg([x + bl, y + h - bl], bl, 90, 180),
    seg([x, y + h - bl], [x, y + tl]), arcDeg([x + tl, y + tl], tl, 180, 270),
  ];
}

/** A cloud is a row of overlapping circles sitting on a flat base; the outline walks each circle's exposed top between neighbours. */
function cloud(lobes: { c: Pt; r: number }[], base: number): Seg[] {
  const meet = (a: { c: Pt; r: number }, b: { c: Pt; r: number }): Pt => {
    const dx = b.c[0] - a.c[0], dy = b.c[1] - a.c[1], d = Math.hypot(dx, dy);
    const along = (a.r * a.r - b.r * b.r + d * d) / (2 * d), h = Math.sqrt(Math.max(0, a.r * a.r - along * along));
    const mx = a.c[0] + (along * dx) / d, my = a.c[1] + (along * dy) / d;
    const p: Pt = [mx + (h * dy) / d, my - (h * dx) / d], q: Pt = [mx - (h * dy) / d, my + (h * dx) / d];
    return p[1] < q[1] ? p : q;
  };
  const angle = (c: Pt, p: Pt) => Math.atan2(p[1] - c[1], p[0] - c[0]);
  const joins = lobes.slice(1).map((lobe, i) => meet(lobes[i], lobe));
  const first = lobes[0], last = lobes[lobes.length - 1];
  const segs = [arc(first.c, first.r, -Math.PI / 2, angle(first.c, joins[0]))];
  for (let i = 1; i < lobes.length - 1; i++) segs.push(arc(lobes[i].c, lobes[i].r, angle(lobes[i].c, joins[i - 1]), angle(lobes[i].c, joins[i])));
  segs.push(arc(last.c, last.r, angle(last.c, joins[joins.length - 1]), Math.PI / 2));
  segs.push(seg([last.c[0], base], [first.c[0], base]));
  segs.push(arc(first.c, first.r, Math.PI / 2, Math.PI * 1.5));
  return segs;
}

type TileOptions = { rot?: number; skew?: number; z?: number; o?: number };
const tile = (cx: number, cy: number, w: number, h: number, r: number, tone: string, { rot = 0, skew = 0, z = 1, o = 1 }: TileOptions = {}): Prim =>
  ({ kind: "tile", geo: [cx, cy, w, h, r, rot, skew, z], fx: [o, 1], tone, redraw: false });
const box = (x: number, y: number, w: number, h: number, r: number, tone: string, options?: TileOptions) => tile(x + w / 2, y + h / 2, w, h, r, tone, options);
const disc = (c: Pt, r: number, tone: string, options?: TileOptions) => tile(c[0], c[1], r * 2, r * 2, r, tone, options);
/** Shapes a scene does not need shrink into a point inside something that stays, and fade on the way. */
const park = (c: Pt, z: number) => tile(c[0], c[1], 4, 4, 2, "tuck", { z, o: 0 });
const body = (segs: Seg[], z: number): Prim => ({ kind: "body", geo: [...sample(segs, N, false), z], fx: [1, 1], tone: "outline", redraw: false });

type StrokeOptions = { dash?: number; z?: number; z1?: number; o?: number; draw?: number; redraw?: boolean };
const line = (segs: Seg[], tone: string, { dash = 0, z = 1, z1 = z, o = 1, draw = 1, redraw = false }: StrokeOptions = {}): Prim =>
  ({ kind: "stroke", geo: [...sample(segs, K, true), dash, z, z1], fx: [o, draw], tone, redraw });
const rest = (p: Pt, z: number) => line([seg(p, p)], "ink", { z, o: 0, draw: 0 });
const mark = ([a, b]: [Seg[], Seg[]], tone: string, { z = 1, o = 1, draw = 1, redraw = true }: StrokeOptions = {}): Prim =>
  ({ kind: "mark", geo: [...sample(a, M, true), ...sample(b, M, true), 0, z, z], fx: [o, draw], tone, redraw });

const check = (c: Pt, s: number): [Seg[], Seg[]] => {
  const a: Pt = [c[0] - .42 * s, c[1] + .02 * s], b: Pt = [c[0] - .12 * s, c[1] + .32 * s], e: Pt = [c[0] + .44 * s, c[1] - .3 * s];
  return [[seg(a, b)], [seg(b, e)]];
};
const cross = (c: Pt, h: number): [Seg[], Seg[]] => [[seg([c[0] - h, c[1] - h], [c[0] + h, c[1] + h])], [seg([c[0] + h, c[1] - h], [c[0] - h, c[1] + h])]];
const slashes = (c: Pt): [Seg[], Seg[]] => [[seg([c[0] - 10, c[1] + 5], [c[0] - 2, c[1] - 5])], [seg([c[0] + 2, c[1] + 5], [c[0] + 10, c[1] - 5])]];
const glare = (c: Pt, r: number): [Seg[], Seg[]] => [[arcDeg(c, r, 196, 236)], [arcDeg(c, r, 248, 256)]];

function search(phase: Phase): Frame {
  const card = body(rrect(58, 36, 172, 132, 18), .6);
  const tucked = [tile(144, 102, 96, 58, 14, "tuck", { z: .3 }), tile(144, 102, 120, 76, 16, "tuck", { z: .3 })];
  if (phase !== "done") {
    const lens: Pt = [196, 118];
    return {
      label: "A magnifying glass over three empty result rows",
      prims: [
        ...tucked, card,
        box(78, 64, 132, 20, 8, "slot", { z: .6 }), box(78, 92, 132, 20, 8, "slot", { z: .6 }), box(78, 120, 132, 20, 8, "slot", { z: .6 }),
        disc(lens, 30, "outline", { z: 1.6 }),
        line([seg(polar(lens, 30, 45), [244, 166])], "ink", { z: 1.6 }),
        rest([244, 166], 1.6),
        mark(glare(lens, 20), "muted", { z: 1.6 }),
      ],
    };
  }
  // Filters cleared: the magnifier docks into the header beside the query and the rows fill in as results.
  const lens: Pt = [204, 61];
  return {
    label: "A results list with a search field and two results",
    prims: [
      ...tucked, card,
      box(78, 56, 64, 10, 5, "query", { z: .6 }), box(78, 100, 128, 10, 5, "bar", { z: .6 }), box(78, 124, 96, 10, 5, "bar", { z: .6 }),
      disc(lens, 9, "outline", { z: 1 }),
      line([seg(polar(lens, 9, 45), polar(lens, 17, 45))], "ink", { z: 1 }),
      line([seg([58, 84], [230, 84])], "subtle", { z: .6 }),
      mark(glare(lens, 5), "muted", { z: 1, o: 0, draw: 0 }),
    ],
  };
}

function offline(phase: Phase): Frame {
  const hub: Pt = [160, 92];
  const [top, bottom] = phase === "done" ? [146, 146] : phase === "loading" ? [141, 151] : [134, 158];
  const wire = phase === "loading" ? "accent" : "ink";
  return {
    label: phase === "done" ? "A cloud joined to a device by an unbroken line, with a check on the device" : phase === "loading" ? "The broken line reaching back toward the cloud" : "A cloud joined to a device by a broken line",
    prims: [
      tile(160, 92, 80, 30, 15, "tuck", { z: .3 }), tile(160, 92, 104, 36, 18, "tuck", { z: .3 }),
      body(cloud([{ c: [100, 96], r: 22 }, { c: [140, 72], r: 34 }, { c: [188, 76], r: 28 }, { c: [220, 98], r: 20 }], 118), 1.3),
      park(hub, 1.3), park(hub, 1.3), park(hub, 1.3),
      box(134, 168, 52, 34, 9, phase === "done" ? "success" : phase === "loading" ? "accent" : "outline", { z: .7 }),
      line([seg([160, 118], [160, top])], wire, { z: 1.3, z1: 1 }),
      line([seg([160, bottom], [160, 168])], wire, { z: 1, z1: .7 }),
      phase === "done" ? mark(check([160, 185], 18), "success", { z: .7 }) : mark(slashes([160, 146]), "warning", { z: 1, draw: phase === "loading" ? 0 : 1 }),
    ],
  };
}

function inbox(phase: Phase): Frame {
  const lift = phase === "loading" ? 1 : 0;
  const badge: Pt = [226, 84], slot: Pt = [160, 140];
  return {
    label: phase === "loading" ? "A stacked inbox while new mail is checked" : "A stacked inbox with a check mark",
    prims: [
      box(112, 72 - 8 * lift, 96, 40, 12, "back", { z: .25 }), box(100, 88 - 4 * lift, 120, 40, 12, "back", { z: .45 }),
      body(rrect(88, 104, 144, 72, [8, 8, 16, 16]), .7),
      park(slot, .7), park(slot, .7), park(slot, .7),
      disc(badge, 17, phase === "loading" ? "muted" : "success", { z: 1.5 }),
      line(chain([[88, 126], [124, 126], [133, 140], [187, 140], [196, 126], [232, 126]]), "ink", { z: .7 }),
      rest(slot, .7),
      mark(check(badge, 16), "success", { z: 1.5, draw: phase === "loading" ? 0 : 1 }),
    ],
  };
}

function map(phase: Phase): Frame {
  const start: Pt = [90, 142], pin: Pt = [206, 110], found = phase === "done";
  const route = found
    ? curve([start, [114, 152], [140, 140], [160, 122], [182, 128], polar(pin, 10, 135)])
    : curve([start, [108, 124], [132, 130], [152, 108], [178, 100], [200, 84]]);
  return {
    label: found ? "A folded map with a dashed route that ends at a checked destination" : phase === "loading" ? "A folded map while the route is searched again" : "A folded map with a dashed route that ends in an x",
    prims: [
      tile(151, 107, 90, 56, 12, "tuck", { z: .3 }), tile(151, 107, 110, 70, 14, "tuck", { z: .3 }),
      body(chain([[70, 62], [124, 48], [178, 62], [232, 48], [232, 152], [178, 166], [124, 152], [70, 166]], true), .8),
      park(start, .8),
      tile(151, 107, 54, 104, 0, "shade", { skew: Math.atan2(14, 54) / RAD, z: .8 }),
      found ? disc(pin, 10, "success", { z: .8 }) : park(start, .8),
      disc(start, 4, "dot", { z: .8 }),
      line([route], "accent", { dash: 5, z: .8, draw: phase === "loading" ? 0 : 1, redraw: true }),
      rest(start, .8),
      found ? mark(check(pin, 10), "success", { z: .8 }) : mark(cross([208, 76], 5), "ink", { z: .8, draw: phase === "loading" ? 0 : 1 }),
    ],
  };
}

/** Moves every point of a frame; used to center each scene in the view box. */
function move(frame: Frame, dx: number, dy: number): Frame {
  return {
    ...frame,
    prims: frame.prims.map(p => {
      const geo = [...p.geo];
      if (p.kind === "tile") { geo[0] += dx; geo[1] += dy; }
      else for (let i = 0; i < geo.length - (p.kind === "body" ? 1 : 3); i += 2) { geo[i] += dx; geo[i + 1] += dy; }
      return { ...p, geo };
    }),
  };
}

function center(frame: Frame) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const add = (x: number, y: number) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); };
  for (const p of frame.prims) {
    if (p.fx[0] < .01) continue;
    if (p.kind === "tile") { add(p.geo[0] - p.geo[2] / 2, p.geo[1] - p.geo[3] / 2); add(p.geo[0] + p.geo[2] / 2, p.geo[1] + p.geo[3] / 2); continue; }
    if (p.kind !== "body" && p.fx[1] < .01) continue;
    for (let i = 0; i < p.geo.length - (p.kind === "body" ? 1 : 3); i += 2) add(p.geo[i], p.geo[i + 1]);
  }
  return [VIEW.width / 2 - (x0 + x1) / 2, VIEW.height / 2 - (y0 + y1) / 2] as const;
}

export const VIEW = { width: 320, height: 216 };

const builders: Record<SceneId, (phase: Phase) => Frame> = { search, offline, inbox, map };
const phases: Phase[] = ["idle", "loading", "done"];

/** Every frame is computed once at load, so the server and the first client render draw the same thing. */
export const FRAMES = Object.fromEntries((Object.keys(builders) as SceneId[]).map(id => {
  const [dx, dy] = center(builders[id]("idle"));
  return [id, Object.fromEntries(phases.map(phase => [phase, move(builders[id](phase), dx, dy)]))];
})) as Record<SceneId, Record<Phase, Frame>>;

const fmt = (v: number) => String(Math.round(v * 100) / 100);

function tilePath(g: ArrayLike<number>, ox: number, oy: number) {
  const w = Math.max(0, g[2]), h = Math.max(0, g[3]);
  if (w < .05 || h < .05) return "";
  const r = Math.min(Math.max(0, g[4]), w / 2, h / 2), tan = Math.tan(g[6] * RAD), cos = Math.cos(g[5] * RAD), sin = Math.sin(g[5] * RAD);
  const px = g[0] + ox * g[7], py = g[1] + oy * g[7], hw = w / 2, hh = h / 2;
  const corners: [number, number, number][] = [[hw - r, -hh + r, -90], [hw - r, hh - r, 0], [-hw + r, hh - r, 90], [-hw + r, -hh + r, 180]];
  let d = "";
  for (const [cx, cy, start] of corners) {
    for (let s = 0; s <= 6; s++) {
      const a = (start + s * 15) * RAD, x = cx + r * Math.cos(a), y = cy + r * Math.sin(a) + (cx + r * Math.cos(a)) * tan;
      d += `${d ? "L" : "M"}${fmt(x * cos - y * sin + px)} ${fmt(x * sin + y * cos + py)}`;
    }
  }
  return `${d}Z`;
}

function span(g: ArrayLike<number>, from: number, count: number) {
  let len = 0;
  for (let i = from + 1; i < from + count; i++) len += Math.hypot(g[2 * i] - g[2 * i - 2], g[2 * i + 1] - g[2 * i - 1]);
  return len;
}

/** Draws the first `budget` units of a polyline. Each point drifts by its own depth, so a line can stretch between two layers. */
function trace(g: ArrayLike<number>, from: number, count: number, budget: number, ox: number, oy: number, z0: number, z1: number, total: number) {
  if (budget <= .05) return "";
  const at = (i: number) => {
    const z = z0 + (z1 - z0) * (total > 1 ? (from + i) / (total - 1) : 0);
    return [g[2 * (from + i)] + ox * z, g[2 * (from + i) + 1] + oy * z];
  };
  let [px, py] = at(0), left = budget, d = `M${fmt(px)} ${fmt(py)}`;
  for (let i = 1; i < count; i++) {
    const [x, y] = at(i), len = Math.hypot(x - px, y - py);
    if (len >= left) { const u = len ? left / len : 0; return `${d}L${fmt(px + (x - px) * u)} ${fmt(py + (y - py) * u)}`; }
    left -= len; d += `L${fmt(x)} ${fmt(y)}`; px = x; py = y;
  }
  return d;
}

/** Turns a primitive's current vector into path data, plus a dash pattern for strokes. */
export function shapePath(kind: Kind, g: ArrayLike<number>, drawn: number, ox: number, oy: number): { d: string; dash: string } {
  if (kind === "tile") return { d: tilePath(g, ox, oy), dash: "none" };
  if (kind === "body") {
    const z = g[2 * N], dx = ox * z, dy = oy * z;
    let d = "";
    for (let i = 0; i < N; i++) d += `${i ? "L" : "M"}${fmt(g[2 * i] + dx)} ${fmt(g[2 * i + 1] + dy)}`;
    return { d: `${d}Z`, dash: "none" };
  }
  const draw = Math.min(1, Math.max(0, drawn)), count = (g.length - 3) / 2, gap = g[g.length - 3], z0 = g[g.length - 2], z1 = g[g.length - 1];
  const dash = gap > .2 ? `3 ${fmt(gap)}` : "none";
  if (kind === "stroke") return { d: trace(g, 0, count, draw * span(g, 0, count), ox, oy, z0, z1, count), dash };
  const first = span(g, 0, M), budget = draw * (first + span(g, M, M));
  return { d: trace(g, 0, M, Math.min(budget, first), ox, oy, z0, z1, 1) + trace(g, M, M, budget - first, ox, oy, z0, z1, 1), dash };
}



/**
 * One product illustration for four empty states. The tabs pick a state; every shape in the drawing travels to its new
 * position, size, radius, rotation and color on a spring, outlines morph point by point, and line accents draw in a beat later.
 * Each primary action does something local and visible: filters clear into results, a retry reconnects after a short wait,
 * a mail check redraws the check, and a lost page is found in the archive. Nothing here talks to a server.
 */

type View = { scene: SceneId; phase: Phase; from: Phase };
type Copy = { title: string; line: string; action: string };

const SCENES: { id: SceneId; tab: string }[] = [
  { id: "search", tab: "No results" },
  { id: "offline", tab: "Offline" },
  { id: "inbox", tab: "Caught up" },
  { id: "map", tab: "Not found" },
];

const COPY: Record<SceneId, { idle: Copy; done: Copy; loading: string; wait: number }> = {
  search: {
    idle: { title: "No results for “Q3 roadmap”", line: "Two filters are on: owner is Emma Collins and status is archived.", action: "Clear filters" },
    done: { title: "12 results for “Q3 roadmap”", line: "Filters cleared. Showing matches from every owner and status.", action: "Restore filters" },
    loading: "", wait: 0,
  },
  offline: {
    idle: { title: "You are offline", line: "Edits are saved on this device and sync when the connection returns.", action: "Try again" },
    done: { title: "Back online", line: "Three edits synced to the Northwind workspace just now.", action: "Go offline" },
    loading: "Reaching sync.northwind.example…", wait: 1400,
  },
  inbox: {
    idle: { title: "All caught up", line: "You have read every message in Inbox. New mail lands here first.", action: "Check for mail" },
    done: { title: "Still all caught up", line: "Checked just now. Nothing new since 8:30 this morning.", action: "Check again" },
    loading: "Checking for new mail…", wait: 1100,
  },
  map: {
    idle: { title: "Page not found", line: "The link to /projects/atlas-2023 is broken, or the page has moved.", action: "Find the page" },
    done: { title: "Found it in Archive", line: "Atlas 2023 roadmap moved to /archive/atlas-2023 in March.", action: "Show broken link" },
    loading: "Searching the workspace for Atlas…", wait: 1200,
  },
};

/** Shapes lead, details trail: back tiles, body, front tiles, then lines and the mark. Totals stay under 0.4s. */
const DELAY = [.05, .03, 0, .04, .07, .1, .06, .09, .11, .14];
const NUDGE = [.03, .015, 0, .02, .035, .05, .02, .04, .05, .07];
const DRIFT = 2.5;

const first = FRAMES.search.idle;
const INITIAL = first.prims.map((p, i) => ({ ...shapePath(KINDS[i], p.geo, p.fx[1], 0, 0), o: String(p.fx[0]) }));

const enter = [...motionTokens.ease.enter] as [number, number, number, number];
const standard = [...motionTokens.ease.standard] as [number, number, number, number];

/** Motion's visualDuration and bounce, turned into stiffness and damping for the vector springs below. */
function springOf({ visualDuration, bounce }: { visualDuration: number; bounce: number }) {
  const root = (2 * Math.PI) / (visualDuration * 1.2);
  return { k: root * root, c: 2 * Math.min(1, Math.max(.05, 1 - bounce)) * root };
}
const MORPH = springOf(motionTokens.spring.morph), SMOOTH = springOf(motionTokens.spring.smooth), SWAY = { k: 90, c: 19 };

type Channel = { pos: Float64Array; vel: Float64Array; target: Float64Array; queue: { at: number; values: number[] }[]; k: number; c: number; still: boolean };
const channel = (values: number[], spring: { k: number; c: number }): Channel =>
  ({ pos: Float64Array.from(values), vel: new Float64Array(values.length), target: Float64Array.from(values), queue: [], ...spring, still: true });

/** Integrates one spring vector. A new target keeps the current velocity, so shapes retarget mid-flight without a hitch. */
function advance(ch: Channel, now: number, dt: number) {
  while (ch.queue.length && ch.queue[0].at <= now) {
    const next = ch.queue.shift();
    if (next) { ch.target.set(next.values); ch.still = false; }
  }
  if (!ch.still) {
    const steps = Math.max(1, Math.ceil(dt * 240)), h = dt / steps, { pos, vel, target, k, c } = ch;
    for (let s = 0; s < steps; s++) for (let i = 0; i < pos.length; i++) { vel[i] += (-k * (pos[i] - target[i]) - c * vel[i]) * h; pos[i] += vel[i] * h; }
    let settled = true;
    for (let i = 0; i < pos.length; i++) if (Math.abs(pos[i] - target[i]) > .004 || Math.abs(vel[i]) > .02) { settled = false; break; }
    if (settled) { pos.set(target); vel.fill(0); ch.still = true; }
  }
  return !ch.still || ch.queue.length > 0;
}

type Nodes = { paths: SVGPathElement[]; ghosts: SVGPathElement[]; main: SVGGElement; ghost: SVGGElement };

/** One animation frame loop drives every shape through refs. It sleeps once everything has settled. */
function createEngine(nodes: Nodes, start: Frame) {
  const geo = start.prims.map(p => channel(p.geo, MORPH));
  const fx = start.prims.map(p => channel(p.fx, SMOOTH));
  const sway = channel([0, 0], SWAY);
  const written = INITIAL.map(item => ({ d: item.d, o: item.o, dash: item.dash }));
  let frame = start, raf = 0, last = 0, parallax = false;

  const paint = () => {
    const ox = sway.pos[0] * DRIFT, oy = sway.pos[1] * DRIFT;
    nodes.paths.forEach((node, i) => {
      const { d, dash } = shapePath(KINDS[i], geo[i].pos, fx[i].pos[1], ox, oy);
      const o = String(Math.round(Math.min(1, Math.max(0, fx[i].pos[0])) * 1000) / 1000);
      if (d !== written[i].d) { node.setAttribute("d", d); written[i].d = d; }
      if (o !== written[i].o) { node.setAttribute("opacity", o); written[i].o = o; }
      if (dash !== written[i].dash) { node.setAttribute("stroke-dasharray", dash); written[i].dash = dash; }
    });
  };
  const tick = (time: number) => {
    raf = 0;
    const now = time / 1000, dt = last ? Math.min(.034, Math.max(0, now - last)) : 1 / 60;
    last = now;
    let busy = advance(sway, now, dt);
    for (let i = 0; i < geo.length; i++) busy = advance(geo[i], now, dt) || busy;
    for (let i = 0; i < fx.length; i++) busy = advance(fx[i], now, dt) || busy;
    paint();
    if (busy) raf = requestAnimationFrame(tick); else last = 0;
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };

  const pointer = (x: number, y: number) => {
    sway.queue = [];
    sway.target.set(parallax ? [x, y] : [0, 0]);
    sway.still = false;
    kick();
  };

  return {
    pointer,
    go(next: Frame, sceneChanged: boolean, reduced: boolean) {
      if (reduced) {
        // Crossfade without travel: freeze the old drawing in a ghost layer, snap to the new one, and fade between them.
        nodes.paths.forEach((node, i) => {
          const ghost = nodes.ghosts[i];
          ghost.setAttribute("d", node.getAttribute("d") ?? "");
          ghost.setAttribute("opacity", node.getAttribute("opacity") ?? "1");
          ghost.setAttribute("stroke-dasharray", node.getAttribute("stroke-dasharray") ?? "none");
          ghost.dataset.tone = frame.prims[i].tone;
        });
        next.prims.forEach((p, i) => {
          for (const [ch, values] of [[geo[i], p.geo], [fx[i], p.fx]] as const) { ch.queue = []; ch.target.set(values); ch.pos.set(values); ch.vel.fill(0); ch.still = true; }
        });
        frame = next;
        paint();
        animate(nodes.ghost, { opacity: [1, 0] }, { duration: motionTokens.duration.standard, ease: standard });
        animate(nodes.main, { opacity: [0, 1] }, { duration: motionTokens.duration.standard, ease: standard });
        return;
      }
      const now = performance.now() / 1000, delays = sceneChanged ? DELAY : NUDGE;
      next.prims.forEach((p, i) => {
        geo[i].queue = [{ at: now + delays[i], values: p.geo }];
        if (sceneChanged && p.redraw) fx[i].queue = [{ at: now, values: [p.fx[0], 0] }, { at: now + delays[i] + .18, values: p.fx }];
        else fx[i].queue = [{ at: now + delays[i] + (p.fx[1] > fx[i].target[1] + .01 ? .12 : 0), values: p.fx }];
      });
      frame = next;
      kick();
    },
    setParallax(on: boolean) { parallax = on; if (!on) pointer(0, 0); },
    destroy() { if (raf) cancelAnimationFrame(raf); raf = 0; },
  };
}

export function EmptyStates() {
  const uid = useId();
  const reduced = useReducedMotion() ?? false;
  const [view, setView] = useState<View>({ scene: "search", phase: "idle", from: "idle" });
  const [announcement, setAnnouncement] = useState("");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const ghosts = useRef<(SVGPathElement | null)[]>([]);
  const mainLayer = useRef<SVGGElement>(null);
  const ghostLayer = useRef<SVGGElement>(null);
  const engine = useRef<ReturnType<typeof createEngine> | null>(null);
  const shown = useRef({ scene: view.scene, phase: view.phase });
  const pending = useRef({ timer: 0 });
  const copyInner = useRef<HTMLDivElement>(null);
  const copyHeight = useMotionValue<number | "auto">("auto");
  const armedUntil = useRef(0);

  const frame = FRAMES[view.scene][view.phase];
  const text = COPY[view.scene];
  const copy: Copy = view.phase === "loading" ? { ...text[view.from === "done" ? "done" : "idle"], line: text.loading } : text[view.phase === "done" ? "done" : "idle"];
  const copyKey = `${copy.title}|${copy.line}`;

  useEffect(() => {
    const main = mainLayer.current, ghost = ghostLayer.current;
    const nodes = paths.current.filter(Boolean) as SVGPathElement[], ghostNodes = ghosts.current.filter(Boolean) as SVGPathElement[];
    if (!main || !ghost || nodes.length !== KINDS.length || ghostNodes.length !== KINDS.length) return;
    const instance = createEngine({ paths: nodes, ghosts: ghostNodes, main, ghost }, first);
    engine.current = instance;
    const bag = pending.current;
    return () => { instance.destroy(); engine.current = null; window.clearTimeout(bag.timer); };
  }, []);

  useEffect(() => {
    const fine = typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    engine.current?.setParallax(fine && !reduced);
  }, [reduced]);

  useEffect(() => {
    const prev = shown.current;
    if (prev.scene === view.scene && prev.phase === view.phase) return;
    shown.current = { scene: view.scene, phase: view.phase };
    engine.current?.go(FRAMES[view.scene][view.phase], prev.scene !== view.scene, reduced);
  }, [view.scene, view.phase, reduced]);

  // The copy block springs to the height of the incoming text, so the action never jumps.
  useLayoutEffect(() => { armedUntil.current = performance.now() + 700; }, [copyKey]);
  useEffect(() => {
    const node = copyInner.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    let measured = false;
    const observer = new ResizeObserver(([entry]) => {
      const next = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
      if (!measured || reduced || performance.now() > armedUntil.current) { measured = true; copyHeight.jump(next); return; }
      animate(copyHeight, next, motionTokens.spring.smooth);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced, copyHeight]);

  function choose(scene: SceneId) {
    if (scene === view.scene) return;
    window.clearTimeout(pending.current.timer);
    setView({ scene, phase: "idle", from: "idle" });
    setAnnouncement("");
  }

  function act() {
    const { scene, phase } = view;
    if (phase === "loading") return;
    const entry = COPY[scene];
    if (scene === "search" || (phase === "done" && scene !== "inbox")) {
      const next: Phase = phase === "idle" ? "done" : "idle";
      setView({ scene, phase: next, from: phase });
      setAnnouncement(`${entry[next === "done" ? "done" : "idle"].title}. ${entry[next === "done" ? "done" : "idle"].line}`);
      return;
    }
    setView({ scene, phase: "loading", from: phase });
    setAnnouncement(entry.loading);
    window.clearTimeout(pending.current.timer);
    pending.current.timer = window.setTimeout(() => {
      setView(current => (current.scene === scene && current.phase === "loading" ? { scene, phase: "done", from: "loading" } : current));
      setAnnouncement(`${entry.done.title}. ${entry.done.line}`);
    }, entry.wait);
  }

  function onTabKey(event: KeyboardEvent<HTMLDivElement>) {
    const index = SCENES.findIndex(item => item.id === view.scene);
    const next = event.key === "ArrowRight" ? (index + 1) % SCENES.length : event.key === "ArrowLeft" ? (index + SCENES.length - 1) % SCENES.length : event.key === "Home" ? 0 : event.key === "End" ? SCENES.length - 1 : -1;
    if (next < 0) return;
    event.preventDefault();
    choose(SCENES[next].id);
    tabs.current[next]?.focus();
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    engine.current?.pointer(((event.clientX - rect.left) / rect.width - .5) * 2, ((event.clientY - rect.top) / rect.height - .5) * 2);
  }

  const rise = reduced
    ? { initial: { opacity: 0 }, exit: { opacity: 0, transition: { duration: motionTokens.duration.exit } } }
    : { initial: { opacity: 0, y: 8, filter: `blur(${motionTokens.blur.soft}px)` }, exit: { opacity: 0, y: -6, filter: `blur(${motionTokens.blur.soft}px)`, transition: { duration: motionTokens.duration.exit, ease: standard } } };
  const shownText = { opacity: 1, y: 0, filter: "blur(0px)" };
  const textIn = (delay: number) => ({ duration: reduced ? motionTokens.duration.standard : motionTokens.duration.considered, ease: enter, delay: reduced ? 0 : delay });

  return (
    <section className={styles.root} aria-label="Empty states">
      <div className={styles.card}>
        <div className={styles.tabs} role="tablist" aria-label="Empty state" onKeyDown={onTabKey}>
          {SCENES.map((item, index) => {
            const selected = item.id === view.scene;
            return (
              <button key={item.id} ref={node => { tabs.current[index] = node; }} id={`${uid}-tab-${item.id}`} type="button" role="tab" aria-selected={selected} aria-controls={`${uid}-panel`} tabIndex={selected ? 0 : -1} className={styles.tab} onClick={() => choose(item.id)}>
                {selected ? <motion.span layoutId={`${uid}-highlight`} className={styles.highlight} transition={reduced ? { duration: 0 } : motionTokens.spring.morph} /> : null}
                <span className={styles.tabLabel}>{item.tab}</span>
              </button>
            );
          })}
        </div>

        <div className={styles.panel} role="tabpanel" id={`${uid}-panel`} aria-labelledby={`${uid}-tab-${view.scene}`}>
          <div className={styles.stage} onPointerMove={onPointerMove} onPointerLeave={() => engine.current?.pointer(0, 0)}>
            <svg className={styles.art} viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} role="img" aria-label={frame.label}>
              <g ref={ghostLayer} opacity={0} aria-hidden="true">
                {KINDS.map((kind, i) => <path key={i} ref={node => { ghosts.current[i] = node; }} className={styles.shape} data-kind={kind} d="" />)}
              </g>
              <g ref={mainLayer}>
                {INITIAL.map((item, i) => (
                  <path key={i} ref={node => { paths.current[i] = node; }} className={styles.shape} data-kind={KINDS[i]} data-tone={frame.prims[i].tone} d={item.d} opacity={item.o} strokeDasharray={item.dash} style={{ transitionDelay: `${DELAY[i]}s` }} />
                ))}
              </g>
            </svg>
          </div>

          <div className={styles.copy}>
            <motion.div className={styles.copyFrame} style={{ height: copyHeight }}>
              <div ref={copyInner} className={styles.copyInner}>
                <h2 className={styles.title}>
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span key={copy.title} className={styles.swap} initial={rise.initial} animate={shownText} exit={rise.exit} transition={textIn(.06)}>{copy.title}</motion.span>
                  </AnimatePresence>
                </h2>
                <p className={styles.line}>
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span key={copy.line} className={styles.swap} initial={rise.initial} animate={shownText} exit={rise.exit} transition={textIn(.06 + motionTokens.stagger.word)}>{copy.line}</motion.span>
                  </AnimatePresence>
                </p>
              </div>
            </motion.div>
            <Button size="sm" onClick={act} loading={view.phase === "loading"}>{copy.action}</Button>
          </div>
          <p className={styles.srOnly} aria-live="polite">{announcement}</p>
        </div>
      </div>
    </section>
  );
}

export default EmptyStates;
