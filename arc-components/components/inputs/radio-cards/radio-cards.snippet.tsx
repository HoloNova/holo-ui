"use client";

import type { CSSProperties, HTMLAttributes, KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import type { Transition } from "motion/react";
import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { forwardRef, useCallback, useId, useImperativeHandle, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";

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
const ARC_RADIO_CARDS_STYLES = `.arc-radio-cards-root {
  position: relative;
  display: grid;
  gap: 10px;
  color: var(--foreground);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  letter-spacing: var(--tracking-body);
  line-height: var(--leading-body);
}
.arc-radio-cards-root *, .arc-radio-cards-root *::before, .arc-radio-cards-root *::after { box-sizing: border-box; }
.arc-radio-cards-root[data-layout="grid"] { grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--min-column, 180px)), 1fr)); }
.arc-radio-cards-root[data-layout="list"] { grid-template-columns: minmax(0, 1fr); gap: 8px; }

/* The one moving part: a ring that springs from card to card. It sits over the card border so the card itself never changes size. */
.arc-radio-cards-ring {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  border: 1.5px solid var(--control-on);
  border-radius: 20px;
  pointer-events: none;
}

.arc-radio-cards-card {
  position: relative;
  display: grid;
  min-width: 0;
  align-items: start;
  gap: 4px 12px;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: 20px;
  background: var(--surface);
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: background-color var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard);
}
.arc-radio-cards-root[data-layout="grid"] .arc-radio-cards-card { grid-template-areas: "body indicator" "meta meta"; grid-template-columns: minmax(0, 1fr) auto; align-content: start; }
.arc-radio-cards-root[data-layout="list"] .arc-radio-cards-card { grid-template-areas: "indicator body meta"; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; padding: 13px 16px 13px 14px; }
.arc-radio-cards-card[data-checked] { background: color-mix(in oklch, var(--control-on) 4%, var(--surface)); }
.arc-radio-cards-card[aria-disabled="true"] { background: var(--surface-muted); cursor: not-allowed; }
.arc-radio-cards-card[aria-disabled="true"] :is(.arc-radio-cards-label, .arc-radio-cards-meta) { color: var(--text-muted); }

.arc-radio-cards-indicator {
  display: grid;
  width: 18px;
  height: 18px;
  flex: none;
  place-items: center;
  grid-area: indicator;
  border: 1.5px solid var(--border-strong);
  border-radius: 50%;
  transition: border-color var(--duration-fast) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard);
}
.arc-radio-cards-root[data-layout="grid"] .arc-radio-cards-indicator { margin-top: 1px; }
.arc-radio-cards-card[data-checked] .arc-radio-cards-indicator { border-color: var(--control-on); background: var(--control-on); }
.arc-radio-cards-indicatorDot { width: 6px; height: 6px; border-radius: 50%; background: var(--control-glyph); }
.arc-radio-cards-card[aria-disabled="true"] .arc-radio-cards-indicator { border-color: var(--border); }

.arc-radio-cards-body { display: grid; min-width: 0; gap: 2px; grid-area: body; }
.arc-radio-cards-label { display: flex; min-width: 0; align-items: center; gap: 8px; font-weight: 500; }
.arc-radio-cards-labelText { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.arc-radio-cards-icon { display: grid; width: 18px; height: 18px; flex: none; place-items: center; color: var(--text-secondary); }
.arc-radio-cards-icon > svg { width: 18px; height: 18px; }
.arc-radio-cards-card[data-checked] .arc-radio-cards-icon { color: var(--foreground); }
.arc-radio-cards-description { color: var(--text-secondary); font-size: var(--text-xs); line-height: 1.45; text-wrap: pretty; }

.arc-radio-cards-meta { grid-area: meta; color: var(--foreground); font-variant-numeric: tabular-nums; white-space: nowrap; }
.arc-radio-cards-root[data-layout="grid"] .arc-radio-cards-meta { margin-top: 10px; font-size: var(--text-lg); }
.arc-radio-cards-root[data-layout="list"] .arc-radio-cards-meta { font-weight: 500; }

@media (hover: hover) and (pointer: fine) {
  .arc-radio-cards-card:not([data-checked]):not([aria-disabled="true"]):hover { border-color: var(--border-strong); }
}
.arc-radio-cards-card:not([data-checked]):not([aria-disabled="true"]):active { background: var(--surface-muted); }
.arc-radio-cards-card:focus-visible:not([data-checked]) { border-color: var(--border-strong); background: var(--surface-muted); }

@media (prefers-reduced-motion: reduce) {
  .arc-radio-cards-card, .arc-radio-cards-indicator { transition: none; }
}
`;

const styles: Record<string, string> = new Proxy({
  "body": "arc-radio-cards-body",
  "card": "arc-radio-cards-card",
  "description": "arc-radio-cards-description",
  "icon": "arc-radio-cards-icon",
  "indicator": "arc-radio-cards-indicator",
  "indicatorDot": "arc-radio-cards-indicatorDot",
  "label": "arc-radio-cards-label",
  "labelText": "arc-radio-cards-labelText",
  "meta": "arc-radio-cards-meta",
  "ring": "arc-radio-cards-ring",
  "root": "arc-radio-cards-root"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-radio-cards-${prop}`,
});



export interface RadioCardOption {
  value: string;
  label: ReactNode;
  /** One or two short lines under the label. */
  description?: ReactNode;
  /** A price, estimate, or other value. Sits at the end of a list row, or under the text in a grid card. */
  meta?: ReactNode;
  /** Plain decorative icon beside the label. */
  icon?: ReactNode;
  disabled?: boolean;
  /** Short reason shown in place of the description when the option is disabled. */
  disabledReason?: ReactNode;
}

/**
 * Selectable option cards for choices that need more than a label: plans, shipping speeds, regions. One selection ring
 * glides from card to card on a spring, so the eye follows the change. Behaves as a native radio group: one tab stop,
 * arrow keys move and select, and a hidden input carries the value in forms.
 */
export interface RadioCardsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  options: RadioCardOption[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  /** "grid" places cards in responsive columns; "list" stacks full width rows. */
  layout?: "grid" | "list";
  /** Narrowest a grid column may get before the grid drops a column, in px. */
  minColumnWidth?: number;
  /** Form field name. Renders a hidden input with the selected value. */
  name?: string;
  required?: boolean;
  disabled?: boolean;
}

type Bezier = [number, number, number, number];
const standard = [...motionTokens.ease.standard] as Bezier;
const physical = (visualDuration: number, bounce: number): Transition => {
  const root = 2 * Math.PI / (visualDuration * 1.2);
  return { type: "spring", stiffness: root * root, damping: 2 * (1 - bounce) * root, mass: 1 };
};
const GLIDE = physical(.42, .14);

const subscribe = () => () => {};
function useReducedFlag() {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  return !!useReducedMotion() && hydrated;
}

export const RadioCards = forwardRef<HTMLDivElement, RadioCardsProps>(function RadioCards({
  options, value, defaultValue = null, onValueChange, layout = "grid", minColumnWidth = 180, name, required, disabled = false, className, style, ...rest
}, forwardedRef) {
  const reduced = useReducedFlag();
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(forwardedRef, () => rootRef.current as HTMLDivElement);
  const [internal, setInternal] = useState<string | null>(defaultValue);
  const selected = value !== undefined ? value : internal;
  const selectedIndex = options.findIndex(option => option.value === selected);
  const usable = (option: RadioCardOption) => !disabled && !option.disabled;
  const tabStop = selectedIndex >= 0 && usable(options[selectedIndex]) ? selectedIndex : options.findIndex(usable);

  const select = (next: string) => {
    if (next === selected) return;
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };

  /* The ring: one element that springs to the selected card's box. At rest it follows layout changes exactly. */
  const x = useMotionValue(0), y = useMotionValue(0), w = useMotionValue(0), h = useMotionValue(0), o = useMotionValue(0);
  const placed = useRef(false);
  const place = useCallback((spring: boolean) => {
    const node = selectedIndex < 0 ? null : rootRef.current?.querySelector<HTMLElement>(`[data-card="${selectedIndex}"]`);
    if (!node) { o.set(0); placed.current = false; return; }
    const box = [node.offsetLeft, node.offsetTop, node.offsetWidth, node.offsetHeight];
    if (!spring || !placed.current || reduced) {
      x.jump(box[0]); y.jump(box[1]); w.jump(box[2]); h.jump(box[3]);
      if (!placed.current && !reduced && spring) { o.jump(0); animate(o, 1, { duration: .18, ease: standard }); } else o.jump(1);
      placed.current = true;
      return;
    }
    animate(x, box[0], GLIDE); animate(y, box[1], GLIDE); animate(w, box[2], GLIDE); animate(h, box[3], GLIDE);
    o.set(1);
  }, [h, o, reduced, selectedIndex, w, x, y]);

  const placeRef = useRef(place);
  useLayoutEffect(() => { placeRef.current = place; place(true); }, [place]);
  // A resize only snaps the ring to the new layout; it never replays the glide.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => placeRef.current(false));
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const cards = () => Array.from(rootRef.current?.querySelectorAll<HTMLElement>("[data-card]") ?? []);
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>, index: number) => {
    const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      if (usable(options[index])) select(options[index].value);
      return;
    }
    if (!step && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const count = options.length;
    const rtl = step && (event.key === "ArrowLeft" || event.key === "ArrowRight") && getComputedStyle(event.currentTarget).direction === "rtl" ? -1 : 1;
    let at = event.key === "Home" ? -1 : event.key === "End" ? count : index;
    const dir = event.key === "Home" ? 1 : event.key === "End" ? -1 : step * rtl;
    for (let tries = 0; tries < count; tries++) {
      at = (at + dir + count) % count;
      if (usable(options[at])) { cards()[at]?.focus(); select(options[at].value); return; }
    }
  };

  return <div ref={rootRef} role="radiogroup" aria-disabled={disabled || undefined} aria-required={required || undefined}
    className={[styles.root, className].filter(Boolean).join(" ")} data-layout={layout}
    style={{ "--min-column": `${minColumnWidth}px`, ...style } as CSSProperties} {...rest}>
    <motion.span className={styles.ring} style={{ x, y, width: w, height: h, opacity: o }} aria-hidden="true" />
    {options.map((option, index) => {
      const checked = index === selectedIndex, off = !usable(option);
      const labelId = `${uid}-${index}-label`, descriptionId = `${uid}-${index}-description`;
      const description = off && option.disabledReason ? option.disabledReason : option.description;
      return <div key={option.value} role="radio" data-card={index} className={styles.card} aria-checked={checked} aria-disabled={off || undefined}
        aria-labelledby={labelId} aria-describedby={description ? descriptionId : undefined} tabIndex={index === tabStop ? 0 : -1}
        data-checked={checked || undefined} onClick={() => { if (!off) select(option.value); }} onKeyDown={event => onKeyDown(event, index)}>
        <span className={styles.indicator} aria-hidden="true">
          <motion.span className={styles.indicatorDot} initial={false} animate={{ scale: checked ? 1 : 0 }} transition={reduced ? { duration: 0 } : motionTokens.spring.snappy} />
        </span>
        <span className={styles.body}>
          <span id={labelId} className={styles.label}>
            {option.icon && <span className={styles.icon}>{option.icon}</span>}
            <span className={styles.labelText}>{option.label}</span>
          </span>
          {description && <span id={descriptionId} className={styles.description}>{description}</span>}
        </span>
        {option.meta && <span className={styles.meta}>{option.meta}</span>}
      </div>;
    })}
    {name && <input type="hidden" name={name} value={selected ?? ""} required={required} />}
  </div>;
});

export default RadioCards;
