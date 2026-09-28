"use client";

import { AnimatePresence, motion, useReducedMotion, type Transition, type Variants } from "motion/react";
import { useCallback, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";

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
const ARC_BILLING_TOGGLE_STYLES = `/* Override --billing-accent on any ancestor to recolor the savings note. */
.arc-billing-toggle-root {
  --_accent: var(--billing-accent, var(--success));
  --_h: 34px;
  --_pad: 3px;
  position: relative;
  isolation: isolate;
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  padding: var(--_pad);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-pill);
  background: var(--surface-muted);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  letter-spacing: var(--tracking-body);
  line-height: 1;
}
.arc-billing-toggle-root[data-size="lg"] { --_h: 42px; --_pad: 4px; font-size: var(--text-base); }

/* One thumb for the whole track. Its position and width are measured from the selected option. */
.arc-billing-toggle-thumb,
.arc-billing-toggle-thumbStatic {
  position: absolute;
  z-index: -1;
  border-radius: var(--radius-pill);
  background: var(--surface-raised);
  box-shadow: 0 0 0 1px var(--border-subtle), 0 1px 2px oklch(0% 0 0 / .06), 0 2px 6px oklch(0% 0 0 / .04);
  pointer-events: none;
}
.arc-billing-toggle-thumb { top: var(--_pad); bottom: var(--_pad); left: 0; will-change: transform, width; }
.arc-billing-toggle-thumbStatic { inset: 0; }
:global(:root[data-theme="dark"]) .arc-billing-toggle-thumb,
:global(:root[data-theme="dark"]) .arc-billing-toggle-thumbStatic {
  box-shadow: 0 0 0 1px var(--border), inset 0 1px 0 oklch(100% 0 0 / .05), 0 1px 2px oklch(0% 0 0 / .3);
}

.arc-billing-toggle-option {
  position: relative;
  display: inline-flex;
  min-width: 0;
  height: var(--_h);
  align-items: center;
  padding: 0 14px;
  border: 0;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--text-muted);
  font: inherit;
  letter-spacing: inherit;
  white-space: nowrap;
  cursor: pointer;
  transition: color var(--duration-fast) ease;
  -webkit-tap-highlight-color: transparent;
}
.arc-billing-toggle-option[data-selected] { color: var(--foreground); cursor: default; }
.arc-billing-toggle-option:has(.arc-billing-toggle-badge) { padding-right: 5px; }
.arc-billing-toggle-root[data-size="lg"] .arc-billing-toggle-option { padding-inline: 18px; }
.arc-billing-toggle-root[data-size="lg"] .arc-billing-toggle-option:has(.arc-billing-toggle-badge) { padding-right: 6px; }

@media (hover: hover) and (pointer: fine) {
  .arc-billing-toggle-option:not([data-selected]):hover { color: var(--text-secondary); }
}

.arc-billing-toggle-content {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: transform var(--duration-fast) cubic-bezier(.23, 1, .32, 1);
}
.arc-billing-toggle-option:not([data-selected]):active .arc-billing-toggle-content { transform: scale(.97); }

.arc-billing-toggle-label { font-weight: 500; }

/* The savings note: quiet until its option is chosen, then it takes the accent tint. */
.arc-billing-toggle-badge {
  display: inline-flex;
  height: calc(var(--_h) - 10px);
  align-items: center;
  padding: 0 8px;
  border-radius: var(--radius-pill);
  background: color-mix(in oklch, var(--foreground) 6%, transparent);
  color: var(--text-secondary);
  font-size: var(--text-xs);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  transition: background-color var(--duration-standard) ease, color var(--duration-standard) ease;
}
.arc-billing-toggle-badge[data-active] {
  background: color-mix(in oklch, var(--_accent) 13%, transparent);
  color: color-mix(in oklch, var(--_accent) 88%, var(--foreground));
}
:global(:root[data-theme="dark"]) .arc-billing-toggle-badge[data-active] {
  background: color-mix(in oklch, var(--_accent) 18%, transparent);
  color: var(--_accent);
}

/* Stacked swap: every candidate reserves the cell, the visible one crossfades on top. */
.arc-billing-toggle-swap { position: relative; display: inline-grid; justify-items: center; overflow-y: clip; overflow-clip-margin: 2px; }
.arc-billing-toggle-swapSizer { grid-area: 1 / 1; visibility: hidden; }
.arc-billing-toggle-swapText { grid-area: 1 / 1; display: inline-block; }

@media (prefers-reduced-motion: reduce) {
  .arc-billing-toggle-content, .arc-billing-toggle-badge { transition: none; }
}

/* ------------------------------------------------------------------------ Price */

.arc-billing-toggle-price { display: inline-flex; min-width: 0; flex-wrap: wrap; align-items: flex-end; gap: 4px 10px; }
.arc-billing-toggle-amount {
  display: inline-flex;
  align-items: flex-start;
  color: var(--foreground);
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 400;
  letter-spacing: var(--tracking-display);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.arc-billing-toggle-currency { margin-top: .12em; margin-right: .04em; color: var(--text-secondary); font-size: .55em; }
.arc-billing-toggle-counter { display: inline-flex; }
.arc-billing-toggle-counter > span { font: inherit !important; letter-spacing: inherit !important; }
.arc-billing-toggle-aside {
  display: inline-flex;
  align-items: baseline;
  padding-bottom: .3em;
  color: var(--text-muted);
  font-size: var(--text-sm);
  line-height: var(--leading-body);
  white-space: nowrap;
}
.arc-billing-toggle-wasSlot { display: inline-block; overflow-x: clip; }
.arc-billing-toggle-was { display: inline-block; padding-right: 6px; color: var(--text-muted); font-variant-numeric: tabular-nums; text-decoration-thickness: 1px; }
.arc-billing-toggle-period { position: relative; display: inline-block; overflow-x: clip; overflow-clip-margin: 2px; }
.arc-billing-toggle-periodSizer { display: inline-block; visibility: hidden; }
.arc-billing-toggle-periodText { position: absolute; top: 0; left: 0; display: inline-block; }
`;

const styles: Record<string, string> = new Proxy({
  "amount": "arc-billing-toggle-amount",
  "aside": "arc-billing-toggle-aside",
  "badge": "arc-billing-toggle-badge",
  "content": "arc-billing-toggle-content",
  "counter": "arc-billing-toggle-counter",
  "currency": "arc-billing-toggle-currency",
  "label": "arc-billing-toggle-label",
  "option": "arc-billing-toggle-option",
  "period": "arc-billing-toggle-period",
  "periodSizer": "arc-billing-toggle-periodSizer",
  "periodText": "arc-billing-toggle-periodText",
  "price": "arc-billing-toggle-price",
  "root": "arc-billing-toggle-root",
  "swap": "arc-billing-toggle-swap",
  "swapSizer": "arc-billing-toggle-swapSizer",
  "swapText": "arc-billing-toggle-swapText",
  "thumb": "arc-billing-toggle-thumb",
  "thumbStatic": "arc-billing-toggle-thumbStatic",
  "was": "arc-billing-toggle-was",
  "wasSlot": "arc-billing-toggle-wasSlot"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-billing-toggle-${prop}`,
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



export interface BillingToggleOption {
  value: string;
  label: string;
  /** Short savings note, e.g. "Save 20%". */
  badge?: string;
  /** Badge text once this option is selected, e.g. "You save $48". Defaults to `badge`. */
  activeBadge?: string;
}

export interface BillingToggleProps {
  value: string;
  onValueChange: (value: string) => void;
  options?: BillingToggleOption[];
  /** Accessible name of the group. */
  label?: string;
  size?: "md" | "lg";
  className?: string;
}

const { duration, ease, blur } = motionTokens;

/** Critically damped: the thumb glides and lands without overshoot. */
const glide: Transition = { type: "spring", visualDuration: 0.34, bounce: 0 };

const DEFAULT_OPTIONS: BillingToggleOption[] = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly", badge: "Save 20%" },
];

const swap: Variants = {
  hidden: { opacity: 0, y: "0.45em", filter: `blur(${blur.subtle}px)` },
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: duration.standard, ease: [...ease.enter] } },
  gone: { opacity: 0, y: "-0.45em", filter: `blur(${blur.subtle}px)`, transition: { duration: duration.fast, ease: [...ease.standard] } },
};
const still: Variants = { hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: duration.fast } }, gone: { opacity: 0, transition: { duration: 0 } } };

/**
 * Text that swaps in place. Every candidate sits in the same grid cell, so the box always has the
 * width of the longest one and nothing around it moves when the text changes.
 */
function StableSwap({ text, candidates, reduced, className }: { text: string; candidates: string[]; reduced: boolean; className?: string }) {
  return (
    <span className={[styles.swap, className].filter(Boolean).join(" ")}>
      {[...new Set(candidates)].map(candidate => <span key={candidate} className={styles.swapSizer} aria-hidden="true">{candidate}</span>)}
      <AnimatePresence initial={false}>
        <motion.span key={text} className={styles.swapText} variants={reduced ? still : swap} initial="hidden" animate="shown" exit="gone">{text}</motion.span>
      </AnimatePresence>
    </span>
  );
}

type Thumb = { x: number; width: number };

/**
 * A billing period switch. One thumb glides between the options on a critically damped spring, and
 * the savings note on the cheaper period tints and rewrites itself in place once it is chosen.
 */
export function BillingToggle({ value, onValueChange, options = DEFAULT_OPTIONS, label = "Billing period", size = "md", className }: BillingToggleProps) {
  const reduced = !!useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const [thumb, setThumb] = useState<Thumb | null>(null);
  const selectedIndex = Math.max(0, options.findIndex(option => option.value === value));

  const measure = useCallback(() => {
    const node = refs.current[selectedIndex];
    if (!node) return;
    setThumb(current => current && current.x === node.offsetLeft && current.width === node.offsetWidth ? current : { x: node.offsetLeft, width: node.offsetWidth });
  }, [selectedIndex]);

  useLayoutEffect(() => {
    measure();
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [measure]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    const target = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : step ? (index + step + options.length) % options.length : -1;
    if (target < 0) return;
    event.preventDefault();
    onValueChange(options[target].value);
    refs.current[target]?.focus();
  };

  return (
    <div ref={rootRef} role="radiogroup" aria-label={label} className={[styles.root, className].filter(Boolean).join(" ")} data-size={size}>
      {thumb ? (
        <motion.span
          className={styles.thumb}
          aria-hidden="true"
          initial={false}
          animate={{ x: thumb.x, width: thumb.width }}
          transition={reduced ? { duration: 0 } : glide}
        />
      ) : null}
      {options.map((option, index) => {
        const selected = index === selectedIndex;
        const badgeText = selected ? option.activeBadge ?? option.badge : option.badge;
        const candidates = [option.badge, option.activeBadge].filter((text): text is string => !!text);
        return (
          <button
            key={option.value}
            ref={node => { refs.current[index] = node; }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            className={styles.option}
            data-selected={selected || undefined}
            onClick={() => onValueChange(option.value)}
            onKeyDown={event => onKeyDown(event, index)}
          >
            {selected && !thumb ? <span className={styles.thumbStatic} aria-hidden="true" /> : null}
            <span className={styles.content}>
              <span className={styles.label}>{option.label}</span>
              {badgeText ? (
                <span className={styles.badge} data-active={selected || undefined}>
                  <StableSwap text={badgeText} candidates={candidates} reduced={reduced} />
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export interface BillingPriceProps {
  amount: number;
  currency?: string;
  /** Period after the price, e.g. "per month". Swaps in place when it changes. */
  period?: string;
  /** Previous price, shown struck through when it is higher than `amount`. */
  was?: number;
  decimals?: number;
  className?: string;
}

const clip: Transition = { type: "spring", visualDuration: 0.36, bounce: 0 };

/** A price that rolls to its new amount. The old price and the period ease their width, so nothing beside them jumps. */
export function BillingPrice({ amount, currency = "$", period, was, decimals = 0, className }: BillingPriceProps) {
  const reduced = !!useReducedMotion();
  const showWas = was !== undefined && was > amount;
  const periodRef = useRef<HTMLSpanElement>(null);
  const [periodWidth, setPeriodWidth] = useState<number | null>(null);

  useLayoutEffect(() => {
    const sizer = periodRef.current;
    if (sizer) setPeriodWidth(sizer.offsetWidth);
  }, [period]);

  return (
    <span className={[styles.price, className].filter(Boolean).join(" ")}>
      <span className={styles.amount}>
        <span className={styles.currency}>{currency}</span>
        <span className={styles.counter}><AnimatedCounter value={amount} decimals={decimals} /></span>
      </span>
      <span className={styles.aside}>
        <AnimatePresence initial={false}>
          {showWas ? (
            <motion.span
              key="was"
              className={styles.wasSlot}
              initial={reduced ? { opacity: 0 } : { opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, width: 0, transition: { ...clip, opacity: { duration: duration.fast } } }}
              transition={reduced ? { duration: duration.fast } : { ...clip, opacity: { duration: duration.standard, ease: [...ease.enter] } }}
            >
              <del className={styles.was}>{currency}{was.toFixed(decimals)}</del>
            </motion.span>
          ) : null}
        </AnimatePresence>
        {period ? (
          <motion.span
            className={styles.period}
            initial={false}
            animate={periodWidth === null ? undefined : { width: periodWidth }}
            transition={reduced ? { duration: 0 } : clip}
          >
            <span ref={periodRef} className={styles.periodSizer} aria-hidden="true">{period}</span>
            <AnimatePresence initial={false}>
              <motion.span key={period} className={styles.periodText} variants={reduced ? still : swap} initial="hidden" animate="shown" exit="gone">{period}</motion.span>
            </AnimatePresence>
          </motion.span>
        ) : null}
      </span>
    </span>
  );
}

export default BillingToggle;
