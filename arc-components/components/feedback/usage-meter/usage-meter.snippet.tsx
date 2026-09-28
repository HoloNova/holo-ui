"use client";

import { AnimatePresence, animate, cancelFrame, frame, motion, motionValue, useInView, useMotionValue, useReducedMotion, useTransform, type AnimationPlaybackControls, type MotionValue, type Variants } from "motion/react";
import { CircleAlert, TriangleAlert } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from "react";

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
const ARC_USAGE_METER_STYLES = `/* Categories are steps of the accent, strongest first, so the meter reads as one allowance rather than a rainbow. Free space is the track itself. */
.arc-usage-meter-meter { --segment-0: var(--accent); --segment-1: color-mix(in oklch, var(--accent) 62%, var(--surface)); --segment-2: color-mix(in oklch, var(--accent) 36%, var(--surface)); --segment-3: color-mix(in oklch, var(--accent) 22%, var(--surface)); display: grid; min-width: 0; gap: var(--space-4); color: var(--foreground); }
.arc-usage-meter-top { display: flex; min-width: 0; min-height: 28px; align-items: center; justify-content: space-between; gap: var(--space-3); }
/* A long label wraps beside the status mark instead of hiding its end. */
.arc-usage-meter-title { min-width: 0; color: var(--foreground); font-size: var(--text-base); font-weight: 500; letter-spacing: var(--tracking-body); line-height: var(--leading-body); text-wrap: balance; }

/* The status mark hugs its words: its width springs to each message and grows from the right edge, so the text never slides. */
.arc-usage-meter-badge { display: inline-flex; flex: none; height: 28px; justify-content: flex-end; overflow: hidden; border-radius: var(--radius-pill); background: var(--surface-muted); color: var(--text-secondary); font-size: var(--text-xs); font-weight: 500; line-height: 1; transition: background-color var(--duration-standard) var(--ease-standard), color var(--duration-standard) var(--ease-standard); }
.arc-usage-meter-badgeInner { display: inline-flex; flex: none; align-items: center; gap: 5px; padding: 0 10px; white-space: nowrap; }
.arc-usage-meter-badgeIcon { display: grid; place-items: center; }
.arc-usage-meter-badge[data-status="near"] { background: color-mix(in oklch, var(--warning) 14%, var(--surface)); color: var(--foreground); }
.arc-usage-meter-badge[data-status="near"] .arc-usage-meter-badgeIcon { color: var(--warning); }
.arc-usage-meter-badge[data-status="over"] { background: color-mix(in oklch, var(--danger) 12%, var(--surface)); color: var(--foreground); }
.arc-usage-meter-badge[data-status="over"] .arc-usage-meter-badgeIcon { color: var(--danger); }

.arc-usage-meter-total { display: flex; min-width: 0; align-items: baseline; gap: var(--space-2); margin: 0; }
.arc-usage-meter-amount { flex: none; font-family: var(--font-display); font-size: var(--text-3xl); font-weight: 500; letter-spacing: var(--tracking-display); line-height: var(--leading-display); }
.arc-usage-meter-caption { min-width: 0; flex: 1; color: var(--text-secondary); font-size: var(--text-sm); }
.arc-usage-meter-swap { position: relative; display: block; min-width: 0; }
.arc-usage-meter-swapText { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* The bar leaves room above and below the track for the limit marker. */
.arc-usage-meter-bar { position: relative; padding-block: 5px; }
.arc-usage-meter-track { position: relative; height: 14px; overflow: hidden; border-radius: var(--radius-pill); background: color-mix(in oklch, var(--foreground) 7%, var(--surface)); isolation: isolate; -webkit-tap-highlight-color: transparent; }
.arc-usage-meter-segment { position: absolute; inset: 0; transition: opacity var(--duration-fast) var(--ease-standard); }
.arc-usage-meter-segment[data-index="0"], .arc-usage-meter-swatch[data-index="0"] { background: var(--segment-0); }
.arc-usage-meter-segment[data-index="1"], .arc-usage-meter-swatch[data-index="1"] { background: var(--segment-1); }
.arc-usage-meter-segment[data-index="2"], .arc-usage-meter-swatch[data-index="2"] { background: var(--segment-2); }
.arc-usage-meter-segment[data-index="3"], .arc-usage-meter-swatch[data-index="3"] { background: var(--segment-3); }
.arc-usage-meter-segment[data-highlight="off"] { opacity: .28; }
/* Past the limit the used colours stay, struck through by a hatch; highlighting the overage floods it with the danger colour. */
.arc-usage-meter-overflow { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.arc-usage-meter-hatch { fill: var(--surface); }
.arc-usage-meter-overTint { fill: var(--danger); opacity: 0; transition: opacity var(--duration-fast) var(--ease-standard); }
.arc-usage-meter-overflow[data-highlight="on"] .arc-usage-meter-overTint { opacity: 1; }
.arc-usage-meter-limit { position: absolute; top: 0; bottom: 0; left: -1px; width: 2px; border-radius: 1px; background: var(--foreground); pointer-events: none; }

/* The legend doubles as the keyboard path: arrow keys move between categories, focus previews one, a press pins it. */
.arc-usage-meter-legend { display: grid; grid-template-columns: repeat(auto-fit, minmax(108px, 1fr)); gap: 2px; margin: 0 calc(var(--space-2) * -1); }
.arc-usage-meter-item { display: grid; min-width: 0; justify-items: start; gap: 2px; padding: var(--space-2); border: 0; border-radius: calc(var(--radius-control) - 6px); background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: background-color var(--duration-fast) var(--ease-standard), opacity var(--duration-fast) var(--ease-standard); }
@media (hover: hover) and (pointer: fine) { .arc-usage-meter-item:hover { background: var(--surface-muted); } }
.arc-usage-meter-item[aria-pressed="true"] { background: var(--surface-muted); }
.arc-usage-meter-item[data-highlight="off"] { opacity: .45; }
.arc-usage-meter-item:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 0; }
.arc-usage-meter-itemHead { display: flex; min-width: 0; max-width: 100%; align-items: center; gap: var(--space-2); color: var(--text-secondary); font-size: var(--text-sm); line-height: var(--leading-body); }
.arc-usage-meter-itemLabel { min-width: 0; flex: 1; }
.arc-usage-meter-key { display: grid; width: 12px; height: 12px; flex: none; place-items: center; }
.arc-usage-meter-swatch { grid-area: 1 / 1; width: 10px; height: 10px; border-radius: 3px; }
.arc-usage-meter-swatch[data-index="free"] { background: color-mix(in oklch, var(--foreground) 7%, var(--surface)); box-shadow: inset 0 0 0 1px var(--border-strong); }
.arc-usage-meter-keyIcon { grid-area: 1 / 1; display: grid; place-items: center; color: var(--danger); }
.arc-usage-meter-itemValue { display: flex; align-items: baseline; gap: 4px; padding-left: 20px; color: var(--foreground); font-size: var(--text-base); font-weight: 500; line-height: var(--leading-body); }
.arc-usage-meter-itemUnit { color: var(--text-secondary); font-size: var(--text-sm); font-weight: 400; }

/* A rolling number: each digit is a clipped wheel that feathers at its edges, and new columns open from zero width. */
.arc-usage-meter-ticker { position: relative; display: inline-flex; align-items: flex-start; white-space: nowrap; font-variant-numeric: tabular-nums; user-select: none; }
.arc-usage-meter-column { --feather: .16em; position: relative; display: inline-block; overflow: hidden; margin-block: calc(var(--feather) * -1); padding-block: var(--feather); mask-image: linear-gradient(to bottom, transparent, #000 calc(var(--feather) * 1.5), #000 calc(100% - var(--feather) * 1.5), transparent); }
.arc-usage-meter-sizer { visibility: hidden; }
.arc-usage-meter-glyph { position: absolute; inset: var(--feather) 0; text-align: center; }
.arc-usage-meter-symbol { display: inline-block; overflow-x: clip; }

.arc-usage-meter-srOnly { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
@media (prefers-reduced-motion: reduce) { .arc-usage-meter-badge, .arc-usage-meter-segment, .arc-usage-meter-item, .arc-usage-meter-overTint { transition: none; } }
`;

const styles: Record<string, string> = new Proxy({
  "amount": "arc-usage-meter-amount",
  "badge": "arc-usage-meter-badge",
  "badgeIcon": "arc-usage-meter-badgeIcon",
  "badgeInner": "arc-usage-meter-badgeInner",
  "bar": "arc-usage-meter-bar",
  "caption": "arc-usage-meter-caption",
  "column": "arc-usage-meter-column",
  "glyph": "arc-usage-meter-glyph",
  "hatch": "arc-usage-meter-hatch",
  "item": "arc-usage-meter-item",
  "itemHead": "arc-usage-meter-itemHead",
  "itemLabel": "arc-usage-meter-itemLabel",
  "itemUnit": "arc-usage-meter-itemUnit",
  "itemValue": "arc-usage-meter-itemValue",
  "key": "arc-usage-meter-key",
  "keyIcon": "arc-usage-meter-keyIcon",
  "legend": "arc-usage-meter-legend",
  "limit": "arc-usage-meter-limit",
  "meter": "arc-usage-meter-meter",
  "overTint": "arc-usage-meter-overTint",
  "overflow": "arc-usage-meter-overflow",
  "segment": "arc-usage-meter-segment",
  "sizer": "arc-usage-meter-sizer",
  "srOnly": "arc-usage-meter-srOnly",
  "swap": "arc-usage-meter-swap",
  "swapText": "arc-usage-meter-swapText",
  "swatch": "arc-usage-meter-swatch",
  "symbol": "arc-usage-meter-symbol",
  "ticker": "arc-usage-meter-ticker",
  "title": "arc-usage-meter-title",
  "top": "arc-usage-meter-top",
  "total": "arc-usage-meter-total",
  "track": "arc-usage-meter-track"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-usage-meter-${prop}`,
});



export interface UsageMeterSegment {
  /** Stable identity. Keep it the same while the value changes, so the segment re-flows instead of being replaced. */
  id: string;
  label: string;
  value: number;
}

/** Use a usage meter for a fixed allowance, such as storage or seats, when people need to see what takes the space and how close they are to the limit. */
export interface UsageMeterProps {
  /** What is measured, such as "Workspace storage". */
  label: string;
  /** Used amounts in display order. Up to four read clearly. */
  segments: UsageMeterSegment[];
  /** The plan limit, in the same unit as the segments. */
  limit: number;
  unit?: string;
  /** Digits after the decimal point. */
  decimals?: number;
  freeLabel?: string;
  overLabel?: string;
  /** Share of the limit at which the meter warns that it is almost full. */
  warnAt?: number;
}

const { spring, duration, ease, blur } = motionTokens;
/** Motion drops inherited velocity on time-defined springs, so values that retarget mid-flight run the same springs written as stiffness and damping. */
const physical = ({ visualDuration, bounce }: { visualDuration: number; bounce: number }, restDelta = .001) => { const root = (2 * Math.PI) / (visualDuration * 1.2); return { type: "spring" as const, stiffness: root * root, damping: 2 * (1 - bounce) * root, restDelta, restSpeed: restDelta * 2 }; };
const settle = physical(spring.smooth);
const reveal = physical({ visualDuration: duration.considered + .1, bounce: 0 });
const turn = physical(spring.smooth);
const fit = physical(spring.morph, .01);
/** A segment stops two pixels short of the next, so neighbours read apart without an outline. */
const GAP = 2;
const subscribeNothing = () => () => {};
/** Reduced motion is only known in the browser, so the first client render matches the server before it takes effect. */
function useReducedMotionSafe() {
  const hydrated = useSyncExternalStore(subscribeNothing, () => true, () => false);
  return { reduced: !!useReducedMotion() && hydrated, hydrated };
}
/** Starts animations on the next frame, so the render that caused them never swallows a spring's first frames. Returns a cleanup. */
function soon(start: () => { stop: () => void }) {
  let controls: { stop: () => void } | null = null;
  const run = () => { controls = start(); };
  frame.update(run);
  return () => { cancelFrame(run); controls?.stop(); };
}

/** Changed text rises from a soft blur and leaves a little faster than it arrives. Icons cross through a small scale instead. */
const rise: Variants = {
  hidden: (direction: number) => ({ opacity: 0, y: `${.3 * direction}em`, scale: 1, filter: `blur(${blur.soft}px)` }),
  shown: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: .22, ease: [...ease.enter] } },
  gone: (direction: number) => ({ opacity: 0, y: `${-.3 * direction}em`, scale: 1, filter: `blur(${blur.subtle}px)`, transition: { duration: .14, ease: [...ease.standard] } }),
};
const pop: Variants = {
  hidden: { opacity: 0, y: 0, scale: .6, filter: `blur(${blur.subtle + 1}px)` },
  shown: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { ...spring.snappy, opacity: { duration: duration.fast, ease: [...ease.enter] }, filter: { duration: duration.fast, ease: [...ease.enter] } } },
  gone: { opacity: 0, y: 0, scale: .6, filter: `blur(${blur.subtle + 1}px)`, transition: { duration: duration.instant, ease: [...ease.standard] } },
};
const fade: Variants = { hidden: { opacity: 0, y: 0, scale: 1, filter: "blur(0px)" }, shown: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: .15 } }, gone: { opacity: 0, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: .1 } } };

function Swap({ text, reduced, direction = 1 }: { text: string; reduced: boolean; direction?: number }) {
  return <span className={styles.swap}><AnimatePresence mode="popLayout" initial={false} custom={direction}>
    <motion.span key={text} className={styles.swapText} custom={direction} variants={reduced ? fade : rise} initial="hidden" animate="shown" exit="gone">{text}</motion.span>
  </AnimatePresence></span>;
}

type Part = { key: string; digit: number } | { key: string; text: string };
const formats = new Map<number, Intl.NumberFormat>();
/** Split a number into columns keyed by place value, so 9.8 → 10.4 keeps the ones column the ones column and a new tens column slides in. */
function partsFor(value: number, decimals: number): Part[] {
  let format = formats.get(decimals);
  if (!format) { format = new Intl.NumberFormat("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }); formats.set(decimals, format); }
  const parts = format.formatToParts(value);
  let place = parts.reduce((count, part) => count + (part.type === "integer" ? part.value.length : 0), 0), fraction = 0;
  return parts.flatMap((part, index): Part[] => {
    if (part.type === "integer") return [...part.value].map(char => ({ key: `i${--place}`, digit: Number(char) }));
    if (part.type === "fraction") return [...part.value].map(char => ({ key: `f${fraction++}`, digit: Number(char) }));
    return [{ key: part.type === "group" ? `g${place}` : part.type === "decimal" ? "d" : `${part.type}${index}`, text: part.value }];
  });
}
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/** One digit on a wheel; its distance from the wheel position sets where it sits and how clearly it shows. */
function Glyph({ position, digit }: { position: MotionValue<number>; digit: number }) {
  const offset = useTransform(position, current => ((((digit - current) % 10) + 15) % 10) - 5);
  const y = useTransform(offset, current => `${current}em`);
  const opacity = useTransform(offset, current => Math.max(0, 1 - Math.abs(current)));
  const filter = useTransform(offset, current => Math.abs(current) < .02 || Math.abs(current) >= 1 ? "none" : `blur(${(Math.abs(current) * blur.subtle).toFixed(2)}px)`);
  return <motion.span className={styles.glyph} style={{ y, opacity, filter }}>{digit}</motion.span>;
}

const column = { initial: { width: 0, opacity: 0 }, animate: { width: "auto", opacity: 1 }, exit: { width: 0, opacity: 0 } };

/** A digit wheel that always turns the way the whole number moved, wrapping 9 → 0 like an odometer. */
function Column({ digit, direction, reduced }: { digit: number; direction: number; reduced: boolean }) {
  const position = useMotionValue(digit);
  const wheel = useRef({ digit, target: digit });
  const running = useRef<(() => void) | null>(null);
  useEffect(() => () => running.current?.(), []);
  useEffect(() => {
    const state = wheel.current;
    if (state.digit === digit) return;
    state.target += direction < 0 ? -((state.digit - digit + 10) % 10) : (digit - state.digit + 10) % 10;
    state.digit = digit;
    running.current?.();
    if (reduced) { position.jump(state.target); running.current = null; return; }
    const target = state.target;
    running.current = soon(() => animate(position, target, turn));
  }, [digit, direction, position, reduced]);
  return <motion.span className={styles.column} {...column} transition={reduced ? { duration: 0 } : fit}>
    <span className={styles.sizer}>0</span>
    {DIGITS.map(item => <Glyph key={item} position={position} digit={item} />)}
  </motion.span>;
}

/** A number that rolls to each new value. It is decoration over text that screen readers get elsewhere. */
function Ticker({ value, decimals, reduced }: { value: number; decimals: number; reduced: boolean }) {
  const [trend, setTrend] = useState({ value, direction: 1 });
  if (trend.value !== value) setTrend({ value, direction: value > trend.value ? 1 : -1 });
  return <span className={styles.ticker} aria-hidden="true"><AnimatePresence initial={false}>
    {partsFor(value, decimals).map(part => "digit" in part
      ? <Column key={part.key} digit={part.digit} direction={trend.direction} reduced={reduced} />
      : <motion.span key={part.key} className={styles.symbol} {...column} transition={reduced ? { duration: 0 } : fit}>{part.text}</motion.span>)}
  </AnimatePresence></span>;
}

type Status = "ok" | "near" | "over";

/** The plan status as a compact mark. Its width springs to each new message and the warning icon grows in beside the words. */
function StatusBadge({ status, text, reduced }: { status: Status; text: string; reduced: boolean }) {
  const inner = useRef<HTMLSpanElement>(null);
  const width = useMotionValue<number | "auto">("auto");
  useLayoutEffect(() => {
    const node = inner.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    let measured = false;
    const observer = new ResizeObserver(() => {
      const next = node.offsetWidth;
      if (measured && !reduced) animate(width, next, fit);
      else width.jump(next);
      measured = next > 0;
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced, width]);
  const Icon = status === "over" ? TriangleAlert : CircleAlert;
  return <motion.span className={styles.badge} data-status={status} style={{ width }}>
    <span ref={inner} className={styles.badgeInner}>
      <AnimatePresence mode="popLayout" initial={false}>
        {status !== "ok" && <motion.span key={status} className={styles.badgeIcon} variants={reduced ? fade : pop} initial="hidden" animate="shown" exit="gone"><Icon size={14} strokeWidth={2} aria-hidden="true" /></motion.span>}
      </AnimatePresence>
      <Swap text={text} reduced={reduced} />
    </span>
  </motion.span>;
}

function Segment({ index, amounts, span, width, highlight }: { index: number; amounts: MotionValue<number>[]; span: MotionValue<number>; width: MotionValue<number>; highlight: "on" | "off" | undefined }) {
  // Each segment starts where the ones before it end, so growth in any of them pushes the rest along in the same frame.
  const x = useTransform(() => { let start = 0; for (let at = 0; at < index; at++) start += amounts[at].get(); return (start / span.get()) * width.get(); });
  const scaleX = useTransform(() => {
    const w = width.get();
    if (!w) return 0;
    const size = (amounts[index].get() / span.get()) * w, rest = w - x.get() - size;
    return Math.max(0, size - Math.min(GAP, size, Math.max(0, rest))) / w;
  });
  return <motion.span className={styles.segment} data-index={index} data-highlight={highlight} style={{ x, scaleX, originX: 0 }} />;
}

export function UsageMeter({ label, segments, limit, unit = "", decimals = 1, freeLabel = "Free", overLabel = "Over limit", warnAt = .9 }: UsageMeterProps) {
  const { reduced, hydrated } = useReducedMotionSafe();
  const root = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const inView = useInView(root, { once: true, amount: .4 });
  const titleId = useId();
  const hatchId = `hatch${titleId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const ready = hydrated && (inView || reduced);
  const round = (value: number) => Math.round(value * 10 ** decimals) / 10 ** decimals;
  const total = round(segments.reduce((sum, segment) => sum + segment.value, 0));
  const free = round(Math.max(0, limit - total)), over = round(Math.max(0, total - limit));
  const status: Status = total > limit ? "over" : total >= limit * warnAt ? "near" : "ok";
  const format = (value: number) => `${value.toFixed(decimals)}${unit ? ` ${unit}` : ""}`;
  const limitText = format(limit).replace(/\.0+(?= |$)/, "");

  // One motion value per segment id, kept across renders so a changed value springs from where it is.
  const [store] = useState(() => new Map<string, MotionValue<number>>());
  const amounts = segments.map(segment => { let value = store.get(segment.id); if (!value) { value = motionValue(0); store.set(segment.id, value); } return value; });
  const shownLimit = useMotionValue(limit);
  const width = useMotionValue(0);
  const used = useTransform(() => amounts.reduce((sum, amount) => sum + amount.get(), 0));
  // The bar spans the limit, or everything used once that is more; both follow their springs, so crossing the limit is continuous.
  const span = useTransform(() => Math.max(shownLimit.get(), used.get(), 1e-6));
  const limitX = useTransform(() => Math.round((shownLimit.get() / span.get()) * width.get()));
  // The limit marker and the hatch fade on their own short tween whenever usage crosses the limit, so a limit that jumps past usage never blinks them out in one frame.
  const markerOpacity = useMotionValue(0);
  useEffect(() => {
    let over = used.get() > shownLimit.get();
    markerOpacity.jump(over ? 1 : 0);
    let fading: AnimationPlaybackControls | undefined;
    const check = () => {
      const next = used.get() > shownLimit.get();
      if (next === over) return;
      over = next;
      fading?.stop();
      if (reduced) markerOpacity.jump(next ? 1 : 0);
      else fading = animate(markerOpacity, next ? 1 : 0, { duration: duration.fast, ease: [...ease.standard] });
    };
    const stops = [used.on("change", check), shownLimit.on("change", check)];
    return () => { stops.forEach(stop => stop()); fading?.stop(); };
  }, [markerOpacity, reduced, shownLimit, used]);
  const overClip = useTransform(() => `inset(0 0 0 ${limitX.get() + GAP}px)`);

  useLayoutEffect(() => {
    const node = trackRef.current;
    if (!node) return;
    width.set(node.clientWidth);
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => width.set(node.clientWidth));
    observer.observe(node);
    return () => observer.disconnect();
  }, [width]);

  // Segments grow into place once seen, left to right; later changes re-flow every segment on one spring each.
  const values = segments.map(segment => `${segment.id}:${segment.value}`).join("|");
  const revealed = useRef(false);
  useEffect(() => {
    if (!ready) return;
    const first = !revealed.current;
    revealed.current = true;
    const stops = segments.map((segment, index) => {
      const amount = store.get(segment.id);
      if (!amount || amount.get() === segment.value) return null;
      if (reduced) { amount.jump(segment.value); return null; }
      return soon(() => animate(amount, segment.value, first ? { ...reveal, delay: index * .07 } : settle));
    });
    return () => stops.forEach(stop => stop?.());
    // `values` carries every segment id and value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, ready, reduced, store]);
  useEffect(() => {
    if (shownLimit.get() === limit) return;
    if (reduced) { shownLimit.jump(limit); return; }
    return soon(() => animate(shownLimit, limit, settle));
  }, [limit, reduced, shownLimit]);

  // Hover previews a category, focus previews it too, and a press pins it until pressed again or Escape.
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [roving, setRoving] = useState(0);
  const items = [...segments.map(segment => ({ id: segment.id, label: segment.label, value: segment.value })), { id: "free", label: status === "over" ? overLabel : freeLabel, value: status === "over" ? over : free }];
  const active = hovered ?? focused ?? pinned;
  const activeItem = items.find(item => item.id === active) ?? null;
  const legend = useRef<HTMLDivElement>(null);

  const idAt = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect?.width) return null;
    const at = ((clientX - rect.left) / rect.width) * Math.max(limit, total);
    // Past the limit the hatch stands for the overage, so pointing there highlights it rather than the category beneath.
    if (at > limit) return "free";
    let end = 0;
    for (const segment of segments) { end += segment.value; if (at <= end) return segment.id; }
    return "free";
  };
  const onTrackMove = (event: PointerEvent<HTMLDivElement>) => { if (event.pointerType === "mouse") setHovered(idAt(event.clientX)); };
  const onTrackTap = (event: PointerEvent<HTMLDivElement>) => { if (event.pointerType !== "mouse") { const id = idAt(event.clientX); setPinned(current => current === id ? null : id); } };
  const onLegendKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") { if (pinned || focused) { event.preventDefault(); setPinned(null); } return; }
    const next = ({ ArrowRight: roving + 1, ArrowDown: roving + 1, ArrowLeft: roving - 1, ArrowUp: roving - 1, Home: 0, End: items.length - 1 } as Record<string, number>)[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const index = (next + items.length) % items.length;
    setRoving(index);
    legend.current?.querySelectorAll<HTMLButtonElement>("button")[index]?.focus();
  };

  const headline = ready ? (activeItem ? activeItem.value : total) : 0;
  const share = activeItem ? Math.round((activeItem.value / limit) * 100) : 0;
  const caption = !activeItem ? `${unit} of ${limitText} used` : activeItem.id === "free" ? `${unit} ${status === "over" ? "over the limit" : "free"}` : `${unit} in ${activeItem.label} · ${share}% of plan`;
  const badge = status === "over" ? `${format(over)} over` : status === "near" ? "Almost full" : `${format(free)} free`;
  const summary = `${label}: ${format(total)} of ${limitText} used. ${segments.map(segment => `${segment.label} ${format(segment.value)}`).join(", ")}. ${status === "over" ? `Over the limit by ${format(over)}.` : `${format(free)} free${status === "near" ? ", almost full" : ""}.`}`;
  // Status changes are announced, and so is a growing overage; routine changes inside a status stay quiet.
  const notice = status === "over" ? `over:${over}` : status;
  const [announced, setAnnounced] = useState({ notice, message: "" });
  if (announced.notice !== notice) setAnnounced({ notice, message: status === "over" ? `Over the plan limit by ${format(over)}.` : status === "near" ? `Almost full. ${format(free)} free.` : `Under the limit. ${format(free)} free.` });

  return <div ref={root} className={styles.meter} role="group" aria-labelledby={titleId} data-status={status}>
    <div className={styles.top}>
      <span id={titleId} className={styles.title}>{label}</span>
      <StatusBadge status={status} text={badge} reduced={reduced} />
    </div>
    <p className={styles.total}>
      <span className={styles.srOnly}>{format(total)} of {limitText} used</span>
      <span className={styles.amount} aria-hidden="true"><Ticker value={headline} decimals={decimals} reduced={reduced} /></span>
      <span className={styles.caption} aria-hidden="true"><Swap text={caption} reduced={reduced} /></span>
    </p>
    <div className={styles.bar}>
      <div ref={trackRef} className={styles.track} role="img" aria-label={summary} data-active={active ?? undefined} onPointerMove={onTrackMove} onPointerLeave={() => setHovered(null)} onPointerUp={onTrackTap}>
        {segments.map((segment, index) => <Segment key={segment.id} index={index} amounts={amounts} span={span} width={width} highlight={active ? active === segment.id ? "on" : "off" : undefined} />)}
        {/* Past the limit the bar is struck through: the overflow keeps its colours, hatched so it reads as over without colour. */}
        <motion.svg className={styles.overflow} data-highlight={active ? active === "free" ? "on" : "off" : undefined} style={{ clipPath: overClip, opacity: markerOpacity }} aria-hidden="true" focusable="false">
          <defs><pattern id={hatchId} width={6} height={6} patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width={2.5} height={6} className={styles.hatch} /></pattern></defs>
          <rect className={styles.overTint} width="100%" height="100%" />
          <rect width="100%" height="100%" fill={`url(#${hatchId})`} />
        </motion.svg>
      </div>
      <motion.span className={styles.limit} style={{ x: limitX, opacity: markerOpacity }} aria-hidden="true" />
    </div>
    <div ref={legend} className={styles.legend} role="group" aria-label={`${label} by category`} onKeyDown={onLegendKey}>
      {items.map((item, index) => {
        const warning = item.id === "free" && status === "over";
        return <button key={item.id} type="button" className={styles.item} data-highlight={active ? active === item.id ? "on" : "off" : undefined} aria-pressed={pinned === item.id} aria-label={`${item.label}, ${format(item.value)}`} tabIndex={index === roving ? 0 : -1}
          onClick={() => { setRoving(index); setPinned(current => current === item.id ? null : item.id); }}
          onFocus={() => { setRoving(index); setFocused(item.id); }} onBlur={() => setFocused(null)}
          onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(item.id); }} onPointerLeave={event => { if (event.pointerType === "mouse") setHovered(null); }}>
          <span className={styles.itemHead}>
            <span className={styles.key} aria-hidden="true"><AnimatePresence mode="popLayout" initial={false}>
              {warning
                ? <motion.span key="alert" className={styles.keyIcon} variants={reduced ? fade : pop} initial="hidden" animate="shown" exit="gone"><TriangleAlert size={12} strokeWidth={2} /></motion.span>
                : <motion.span key="swatch" className={styles.swatch} data-index={item.id === "free" ? "free" : index} variants={reduced ? fade : pop} initial="hidden" animate="shown" exit="gone" />}
            </AnimatePresence></span>
            <span className={styles.itemLabel}><Swap text={item.label} reduced={reduced} /></span>
          </span>
          <span className={styles.itemValue}><Ticker value={item.value} decimals={decimals} reduced={reduced} />{unit && <span className={styles.itemUnit}>{unit}</span>}</span>
        </button>;
      })}
    </div>
    <p className={styles.srOnly} aria-live="polite" aria-atomic="true">{announced.message}</p>
  </div>;
}

export default UsageMeter;
