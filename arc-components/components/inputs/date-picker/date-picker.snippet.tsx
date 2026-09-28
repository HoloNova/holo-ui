"use client";

import type { ButtonHTMLAttributes, FocusEvent, KeyboardEvent } from "react";
import type { Variants } from "motion/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CalendarDays, ChevronDown } from "lucide-react";
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
const ARC_DATE_PICKER_STYLES = `.arc-date-picker-field { display: grid; gap: 7px; min-width: 0; }
.arc-date-picker-label { color: var(--foreground); font-size: var(--text-sm); font-weight: 500; line-height: var(--leading-body); }
.arc-date-picker-anchor { position: relative; min-width: 0; }
/* The trigger anchors the calendar, so press feedback stays in color; it never scales. */
.arc-date-picker-trigger { position: relative; display: flex; width: 100%; min-height: var(--control-height-md); align-items: center; gap: 9px; border: 1px solid var(--border); border-radius: var(--radius-control); padding: 0 12px; background: var(--surface); color: var(--foreground); font: inherit; font-size: var(--text-sm); text-align: left; cursor: pointer; transition: border-color var(--duration-fast) var(--ease-standard), background var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard); }
@media (hover: hover) and (pointer: fine) { .arc-date-picker-trigger:hover:not(:disabled) { border-color: var(--border-strong); background: var(--surface-muted); } }
.arc-date-picker-trigger:active:not(:disabled), .arc-date-picker-trigger[aria-expanded="true"] { border-color: var(--border-strong); background: var(--surface-muted); }
.arc-date-picker-trigger:disabled { cursor: not-allowed; opacity: .5; }
.arc-date-picker-trigger > svg:first-child { flex: 0 0 auto; color: var(--text-muted); }
/* Old and new values cross in place; each part of a date is its own box so a wider day or month moves the rest along on a spring. */
.arc-date-picker-valueText { position: relative; display: flex; flex: 1; min-width: 0; }
.arc-date-picker-value, .arc-date-picker-part { position: relative; display: inline-flex; white-space: pre; }
.arc-date-picker-value { font-variant-numeric: tabular-nums; }
.arc-date-picker-partValue { display: inline-block; white-space: pre; }
.arc-date-picker-placeholder { min-width: 0; overflow: hidden; color: var(--text-muted); text-overflow: ellipsis; white-space: nowrap; }
.arc-date-picker-srOnly { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
.arc-date-picker-chevron { flex: 0 0 auto; color: var(--text-muted); transition: transform var(--duration-spring) var(--ease-spring); }
.arc-date-picker-trigger[aria-expanded="true"] .arc-date-picker-chevron { transform: rotate(180deg); }
/* Grows out of the trigger's calendar icon and returns there on close. */
.arc-date-picker-popover { position: absolute; z-index: 20; top: calc(100% + 8px); left: 0; width: min(320px, calc(100vw - 32px)); overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius-panel); padding: 16px; background: var(--surface-raised); box-shadow: var(--shadow-floating); transform-origin: 22px -8px; will-change: transform, opacity; }
/* On phone widths the calendar matches the field instead of running past the screen edge. */
@media (max-width: 360px) { .arc-date-picker-popover { right: 0; width: auto; } }
.arc-date-picker-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 14px; border-top: 1px solid var(--border-subtle); padding-top: 11px; color: var(--text-muted); font-size: var(--text-xs); }
/* Old and new status lines share one cell, pinned to the trailing edge so a shorter line never shifts. */
.arc-date-picker-status { display: grid; min-width: 0; justify-items: end; }
.arc-date-picker-status > span { grid-area: 1 / 1; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.arc-date-picker-footer button { border: 0; border-radius: 18px; padding: 4px 8px; background: transparent; color: var(--text-secondary); font: inherit; cursor: pointer; transition: background-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard), transform var(--duration-spring) var(--ease-spring); }
@media (hover: hover) and (pointer: fine) { .arc-date-picker-footer button:hover:not(:disabled) { background: var(--surface-muted); color: var(--foreground); } }
.arc-date-picker-footer button:active:not(:disabled) { transform: scale(.97); transition-duration: var(--duration-fast), var(--duration-fast), 100ms; transition-timing-function: var(--ease-standard); }
.arc-date-picker-footer button:disabled { cursor: not-allowed; opacity: .4; }
.arc-date-picker-description { color: var(--text-muted); font-size: var(--text-xs); line-height: var(--leading-body); transition: opacity var(--duration-fast) var(--ease-standard); }
/* The open calendar covers the hint; fading it keeps its first letters from peeking past the popover's rounded corner. */
.arc-date-picker-anchor:has(.arc-date-picker-popover) + .arc-date-picker-description { opacity: 0; }
@media (prefers-reduced-motion: reduce) { .arc-date-picker-trigger, .arc-date-picker-chevron, .arc-date-picker-footer button, .arc-date-picker-description { transition: none; } .arc-date-picker-footer button:active:not(:disabled) { transform: none; } }
`;

const styles: Record<string, string> = new Proxy({
  "anchor": "arc-date-picker-anchor",
  "chevron": "arc-date-picker-chevron",
  "description": "arc-date-picker-description",
  "field": "arc-date-picker-field",
  "footer": "arc-date-picker-footer",
  "label": "arc-date-picker-label",
  "part": "arc-date-picker-part",
  "partValue": "arc-date-picker-partValue",
  "placeholder": "arc-date-picker-placeholder",
  "popover": "arc-date-picker-popover",
  "srOnly": "arc-date-picker-srOnly",
  "status": "arc-date-picker-status",
  "trigger": "arc-date-picker-trigger",
  "value": "arc-date-picker-value",
  "valueText": "arc-date-picker-valueText"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-date-picker-${prop}`,
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



export interface DatePickerProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value" | "onChange"> {
  label: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  description?: string;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: CalendarDateMatcher;
  locale?: string;
  format?: Intl.DateTimeFormatOptions;
  /** Adds a Today button to the calendar header. */
  showToday?: boolean;
}

const monthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const { spring, duration, ease, blur } = motionTokens;
const instant = { duration: duration.instant };
/** Each part of the date rolls with time: a later date rises from below, an earlier one drops from above. Parts that did not change stay still. */
const valueRoll: Variants = {
  enter: (direction: number) => ({ opacity: 0, y: `${direction * 0.35}em`, filter: `blur(${blur.soft}px)` }),
  center: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: duration.standard, ease: ease.enter } },
  exit: (direction: number) => ({ opacity: 0, y: `${direction * -0.3}em`, filter: `blur(${blur.subtle}px)`, transition: { duration: 0.14, ease: ease.standard } }),
};
/** Reduced motion keeps a short crossfade; resting values match the roll so server and client markup agree. */
const valueFade: Variants = { enter: { opacity: 0 }, center: { opacity: 1, y: 0, filter: "blur(0px)", transition: instant }, exit: { opacity: 0, transition: instant } };
/** The footer confirms the pick: new copy rises in with a soft blur while the old line lifts away. */
const statusRise: Variants = {
  enter: { opacity: 0, y: "0.3em", filter: `blur(${blur.soft}px)` },
  center: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: duration.standard, ease: ease.enter } },
  exit: { opacity: 0, y: "-0.3em", filter: `blur(${blur.subtle}px)`, transition: { duration: 0.14, ease: ease.standard } },
};

export function DatePicker({ label, value, onChange, description, placeholder = "Select a date", minDate, maxDate, disabledDates, locale = "en-US", format = { month: "short", day: "numeric", year: "numeric" }, showToday, id, className, disabled, ...buttonProps }: DatePickerProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const hintId = description ? `${controlId}-description` : undefined;
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(monthStart(value ?? new Date()));
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const formatter = new Intl.DateTimeFormat(locale, format);
  const reduce = useReducedMotion() ?? false;
  const time = value?.getTime() ?? null;
  const [previousTime, setPreviousTime] = useState(time);
  const [direction, setDirection] = useState(1);
  if (previousTime !== time) { setPreviousTime(time); setDirection(time === null || previousTime === null || time >= previousTime ? 1 : -1); }
  const shown = value ? formatter.format(value) : placeholder;
  const parts = value ? formatter.formatToParts(value) : [];
  // Parts after a wider or narrower segment move on the same curve the new text arrives on, so they never overlap it.
  const partMotion = reduce ? { duration: 0 } : { duration: duration.standard, ease: ease.enter };

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) { window.clearTimeout(closeTimer.current); setOpen(false); } };
    document.addEventListener("pointerdown", onPointerDown);
    return () => { document.removeEventListener("pointerdown", onPointerDown); window.clearTimeout(closeTimer.current); };
  }, []);

  /** Opening moves focus to the day that owns the tab stop, so arrows work at once; a pointer open shows no ring. */
  useEffect(() => {
    if (open) popoverRef.current?.querySelector<HTMLButtonElement>("[data-present] [data-date][tabindex=\"0\"]")?.focus({ preventScroll: true });
  }, [open]);

  /** Closing hands focus back to the trigger when it was inside the calendar, so keyboard users never land on the page body. */
  const close = () => {
    window.clearTimeout(closeTimer.current);
    if (popoverRef.current?.contains(document.activeElement)) triggerRef.current?.focus();
    setOpen(false);
  };
  /** The calendar always opens on the month of the current value, or today's month. */
  const show = () => { window.clearTimeout(closeTimer.current); setMonth(monthStart(value ?? new Date())); setOpen(true); };
  /** A picked day lets the highlight glide onto it and the footer confirm it, then the calendar returns to the field. */
  const selectDate = (date: Date | undefined) => {
    onChange?.(date);
    window.clearTimeout(closeTimer.current);
    if (reduce || !date) close();
    else closeTimer.current = window.setTimeout(close, 240);
  };
  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if ((event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") && !open) { event.preventDefault(); show(); }
    if (event.key === "Escape") close();
  };
  /** Tabbing past the popover closes it; focus moving within the field keeps it open. */
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (open && next && !rootRef.current?.contains(next)) { window.clearTimeout(closeTimer.current); setOpen(false); }
  };

  return <div className={[styles.field, className].filter(Boolean).join(" ")} ref={rootRef} onBlur={onBlur}>
    <label className={styles.label} htmlFor={controlId}>{label}</label>
    <div className={styles.anchor}>
      <button {...buttonProps} ref={triggerRef} id={controlId} type="button" disabled={disabled} aria-haspopup="dialog" aria-expanded={open} aria-describedby={hintId} className={styles.trigger} onClick={() => (open ? close() : show())} onKeyDown={onTriggerKeyDown}>
        <CalendarDays size={16} strokeWidth={1.75} aria-hidden="true" />
        <span className={styles.srOnly}>{shown}</span>
        <span className={styles.valueText} aria-hidden="true">
          <AnimatePresence mode="popLayout" initial={false} custom={1}>
            {value ? <motion.span key="value" className={styles.value} custom={1} variants={reduce ? valueFade : valueRoll} initial="enter" animate="center" exit="exit">
              {parts.map((part, index) => <motion.span key={`${index}-${part.type}`} className={styles.part} layout="position" layoutDependency={time} transition={partMotion}>
                {part.type === "literal" ? <span className={styles.partValue}>{part.value}</span> : <AnimatePresence mode="popLayout" initial={false} custom={direction}><motion.span key={part.value} className={styles.partValue} custom={direction} variants={reduce ? valueFade : valueRoll} initial="enter" animate="center" exit="exit">{part.value}</motion.span></AnimatePresence>}
              </motion.span>)}
            </motion.span> : <motion.span key="placeholder" className={styles.placeholder} custom={-1} variants={reduce ? valueFade : valueRoll} initial="enter" animate="center" exit="exit">{placeholder}</motion.span>}
          </AnimatePresence>
        </span>
        <ChevronDown className={styles.chevron} size={16} strokeWidth={1.75} aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open && <motion.div ref={popoverRef} className={styles.popover} role="dialog" aria-label={`${label} calendar`} onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); close(); } }}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: .95 }}
          animate={{ opacity: 1, y: 0, scale: 1, transition: reduce ? instant : { ...spring.snappy, opacity: { duration: duration.fast, ease: ease.enter } } }}
          exit={{ opacity: 0, ...(reduce ? {} : { y: -6, scale: .97 }), transition: { duration: 0.14, ease: ease.standard } }}>
          <Calendar value={value} onChange={selectDate} month={month} onMonthChange={setMonth} minDate={minDate} maxDate={maxDate} disabledDates={disabledDates} locale={locale} showToday={showToday} />
          <div className={styles.footer}><button type="button" onClick={() => selectDate(undefined)} disabled={!value}>Clear</button><span className={styles.status}><AnimatePresence initial={false}><motion.span key={time ?? "none"} variants={reduce ? valueFade : statusRise} initial="enter" animate="center" exit="exit">{value ? `Selected ${formatter.format(value)}` : "Choose a day"}</motion.span></AnimatePresence></span></div>
        </motion.div>}
      </AnimatePresence>
    </div>
    {description && <span id={hintId} className={styles.description}>{description}</span>}
  </div>;
}
