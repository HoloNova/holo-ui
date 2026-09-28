"use client";

import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import type { MotionValue } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { animate, LayoutGroup, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from "motion/react";
import { useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

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
const ARC_CALENDAR_STYLES = `.arc-calendar-calendar { width: min(100%, 328px); min-width: 0; color: var(--foreground); }
/* The header is its own size container: below 260px the title takes a full row and the controls sit under it, decided by width alone so a long month name never reflows it. */
.arc-calendar-header { container-type: inline-size; display: grid; min-height: 34px; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 4px 12px; margin-bottom: 14px; }
@container (max-width: 259px) { .arc-calendar-heading, .arc-calendar-navigation { grid-column: 1 / -1; } .arc-calendar-navigation { justify-self: end; } }
.arc-calendar-heading { min-width: 0; margin: 0; font-family: var(--font-body); font-size: var(--text-base); font-weight: 500; line-height: var(--leading-body); letter-spacing: var(--tracking-body); }
/* The global heading rule forces a tight line-height on h2, so the title row sets its own to center with the controls. */
.arc-calendar-title { display: flex; line-height: var(--leading-body); }
.arc-calendar-titleRow { display: inline-block; white-space: nowrap; font-variant-numeric: tabular-nums; }
.arc-calendar-srOnly { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
.arc-calendar-navigation { display: inline-flex; flex: 0 0 auto; align-items: center; gap: 2px; margin-right: -6px; }
/* Quiet header controls: a fill on hover, a short press, and a spring release. */
.arc-calendar-navButton, .arc-calendar-todayButton { display: grid; height: 32px; place-items: center; border: 0; border-radius: var(--radius-pill); background: transparent; color: var(--text-secondary); font: inherit; cursor: pointer; transition: background-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard), opacity var(--duration-fast) var(--ease-standard), scale var(--duration-spring) var(--ease-spring); }
.arc-calendar-navButton { width: 32px; }
.arc-calendar-todayButton { padding: 0 11px; font-size: var(--text-sm); font-weight: 500; line-height: 1; }
@media (hover: hover) and (pointer: fine) { .arc-calendar-navButton:hover:not([aria-disabled]), .arc-calendar-todayButton:hover:not([aria-disabled]) { background: var(--surface-muted); color: var(--foreground); } }
.arc-calendar-navButton:active:not([aria-disabled]), .arc-calendar-todayButton:active:not([aria-disabled]) { scale: .96; transition-duration: var(--duration-fast), var(--duration-fast), var(--duration-fast), 100ms; transition-timing-function: var(--ease-standard); }
.arc-calendar-navButton[aria-disabled], .arc-calendar-todayButton[aria-disabled] { cursor: default; opacity: .36; }
.arc-calendar-weekdays, .arc-calendar-week { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); column-gap: 4px; }
.arc-calendar-weekdays { margin-bottom: 6px; color: var(--text-muted); font-size: var(--text-xs); font-weight: 500; line-height: 24px; text-align: center; }
.arc-calendar-weekdays span { min-width: 0; overflow: hidden; }
/* Months sit on one strip inside a clipped window. Every pane shares one grid cell and has six weeks, so the height never changes. */
.arc-calendar-monthViewport { position: relative; display: grid; overflow: hidden; contain: paint; }
.arc-calendar-monthBody { grid-area: 1 / 1; min-width: 0; will-change: transform; }
.arc-calendar-monthBody[inert] { pointer-events: none; }
.arc-calendar-grid { display: grid; row-gap: 4px; }
.arc-calendar-placeholderDay { aspect-ratio: 1; }
.arc-calendar-day { position: relative; display: grid; width: 100%; aspect-ratio: 1; min-width: 0; place-items: center; border: 0; border-radius: 50%; padding: 0; background: transparent; color: var(--foreground); font: inherit; font-size: var(--text-sm); font-weight: 400; line-height: 1; font-variant-numeric: tabular-nums; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: color var(--duration-fast) var(--ease-standard) var(--number-delay, 0ms); }
/* The inner circle carries hover and press; the grid cell itself never moves, so the hit area stays put. */
.arc-calendar-day::before { content: ""; position: absolute; inset: 0; border-radius: inherit; background: transparent; transition: background-color var(--duration-fast) var(--ease-standard), scale var(--duration-spring) var(--ease-spring); }
.arc-calendar-dayNumber { position: relative; transition: opacity var(--duration-fast) var(--ease-standard) var(--number-delay, 0ms), scale var(--duration-spring) var(--ease-spring); }
/* The selected disc is one shared element that glides to the new day. Press uses the separate scale property so it never fights the glide. */
.arc-calendar-highlight { position: absolute; inset: 0; border-radius: 50%; background: var(--accent); transition: background-color var(--duration-fast) var(--ease-standard), scale var(--duration-spring) var(--ease-spring); }
@media (hover: hover) and (pointer: fine) { .arc-calendar-day:hover:not(:disabled):not(.arc-calendar-selected)::before { background: var(--surface-muted); } .arc-calendar-day.selected:hover .arc-calendar-highlight { background: var(--accent-strong); } }
.arc-calendar-day:active:not(:disabled)::before, .arc-calendar-day:active:not(:disabled) .arc-calendar-highlight, .arc-calendar-day:active:not(:disabled) .arc-calendar-dayNumber { scale: .94; transition-duration: var(--duration-fast), 100ms; transition-timing-function: var(--ease-standard); }
/* Outside days dim their number, not the button, so a disc gliding onto one keeps its full strength. */
.arc-calendar-day.outside { color: var(--text-muted); }
.arc-calendar-day.outside:not(.arc-calendar-selected) .arc-calendar-dayNumber { opacity: .8; }
/* Today is a small dot under the number. It takes the number's color, so it flips with it when the disc arrives. */
.arc-calendar-day.today .arc-calendar-dayNumber::after { content: ""; position: absolute; top: calc(100% + 4px); left: 50%; width: 4px; height: 4px; margin-left: -2px; border-radius: 50%; background: currentColor; }
.arc-calendar-day.selected, .arc-calendar-day.today { font-weight: 500; }
.arc-calendar-day.selected { color: var(--accent-foreground); }
.arc-calendar-day:disabled { cursor: default; color: var(--text-muted); }
.arc-calendar-day:disabled .arc-calendar-dayNumber { opacity: .42; }
.arc-calendar-day.outside:disabled .arc-calendar-dayNumber { opacity: .3; }
@media (prefers-reduced-motion: reduce) {
  .arc-calendar-navButton, .arc-calendar-todayButton, .arc-calendar-day, .arc-calendar-day::before, .arc-calendar-dayNumber, .arc-calendar-highlight { transition: none; }
  .arc-calendar-navButton:active, .arc-calendar-todayButton:active, .arc-calendar-day:active::before, .arc-calendar-day:active .arc-calendar-highlight, .arc-calendar-day:active .arc-calendar-dayNumber { scale: none; }
}
`;

const styles: Record<string, string> = new Proxy({
  "calendar": "arc-calendar-calendar",
  "day": "arc-calendar-day",
  "dayNumber": "arc-calendar-dayNumber",
  "grid": "arc-calendar-grid",
  "header": "arc-calendar-header",
  "heading": "arc-calendar-heading",
  "highlight": "arc-calendar-highlight",
  "monthBody": "arc-calendar-monthBody",
  "monthViewport": "arc-calendar-monthViewport",
  "navButton": "arc-calendar-navButton",
  "navigation": "arc-calendar-navigation",
  "outside": "arc-calendar-outside",
  "placeholderDay": "arc-calendar-placeholderDay",
  "selected": "arc-calendar-selected",
  "srOnly": "arc-calendar-srOnly",
  "title": "arc-calendar-title",
  "titleRow": "arc-calendar-titleRow",
  "today": "arc-calendar-today",
  "todayButton": "arc-calendar-todayButton",
  "week": "arc-calendar-week",
  "weekdays": "arc-calendar-weekdays"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-calendar-${prop}`,
});



export type CalendarDateMatcher = (date: Date) => boolean;

export interface CalendarProps {
  value?: Date;
  onChange?: (date: Date) => void;
  month?: Date;
  onMonthChange?: (month: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: CalendarDateMatcher;
  locale?: string;
  className?: string;
  /** Adds a Today button that slides back to the current month and selects today when it is available. */
  showToday?: boolean;
}

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const monthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const sameDay = (a?: Date, b?: Date) => Boolean(a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate());
const sameMonth = (a?: Date, b?: Date) => Boolean(a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth());
const addDays = (date: Date, amount: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
const addMonths = (date: Date, amount: number) => new Date(date.getFullYear(), date.getMonth() + amount, 1);
/** Moves by whole months and keeps the day, clamped to the shorter month: January 31 plus one month is February 28. */
const shiftMonths = (date: Date, amount: number) => new Date(date.getFullYear(), date.getMonth() + amount, Math.min(date.getDate(), new Date(date.getFullYear(), date.getMonth() + amount + 1, 0).getDate()));
const isBefore = (a: Date, b?: Date) => Boolean(b && startOfDay(a).getTime() < startOfDay(b).getTime());
const isAfter = (a: Date, b?: Date) => Boolean(b && startOfDay(a).getTime() > startOfDay(b).getTime());
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const fromKey = (key: string) => { const [year, month, day] = key.split("-").map(Number); return new Date(year, month - 1, day); };
/** Every month shows six weeks, so the grid keeps one height and never jumps while months change. */
const makeWeeks = (month: Date) => {
  const start = addDays(month, -month.getDay());
  return Array.from({ length: 6 }, (_, week) => Array.from({ length: 7 }, (_, day) => addDays(start, week * 7 + day)));
};

/** Today turns over at local midnight; returning to the tab or waking the device reads it again. */
const subscribeToday = (notify: () => void) => {
  let timer = 0;
  const schedule = () => { const now = new Date(); timer = window.setTimeout(() => { notify(); schedule(); }, addDays(now, 1).getTime() - now.getTime() + 1000); };
  const onVisible = () => { if (document.visibilityState === "visible") notify(); };
  schedule();
  document.addEventListener("visibilitychange", onVisible);
  window.addEventListener("focus", notify);
  return () => { window.clearTimeout(timer); document.removeEventListener("visibilitychange", onVisible); window.removeEventListener("focus", notify); };
};
const readToday = () => dateKey(new Date());
const serverToday = () => "";
const subscribeNothing = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
/** The viewer's local date. Undefined on the server and during hydration, so markup never depends on the server clock or time zone; afterwards it follows the real date across midnight. */
export function useToday() {
  const key = useSyncExternalStore(subscribeToday, readToday, serverToday);
  return useMemo(() => (key ? fromKey(key) : undefined), [key]);
}

const { spring, duration, ease } = motionTokens;
/** Months sit side by side on one strip. Rapid clicks retarget the same spring, so the strip never queues or stacks panes. */
const stripSpring = { type: "spring", visualDuration: 0.36, bounce: 0, restDelta: 0.002 } as const;
const monthIndex = (date: Date) => date.getFullYear() * 12 + date.getMonth();
const fromIndex = (index: number) => new Date(Math.floor(index / 12), ((index % 12) + 12) % 12, 1);

/** One month on the strip. Only the month being navigated to is focusable and exposed; the one sliding past is inert. */
function MonthPane({ index, position, present, children }: { index: number; position: MotionValue<number>; present: boolean; children: ReactNode }) {
  const x = useTransform(position, (value) => `calc(${(index - value) * 100}% + ${(index - value) * 16}px)`);
  const opacity = useTransform(position, (value) => 1 - Math.min(1, Math.abs(index - value)) * 0.6);
  return <motion.div className={styles.monthBody} style={{ x, opacity }} data-present={present || undefined} aria-hidden={present ? undefined : true} inert={!present}>{children}</motion.div>;
}

export function Calendar({
  value,
  onChange,
  month: controlledMonth,
  onMonthChange,
  minDate,
  maxDate,
  disabledDates,
  locale = "en-US",
  className,
  showToday = false,
}: CalendarProps) {
  const titleId = useId();
  const groupId = useId();
  const today = useToday();
  // Motion preference only counts after hydration, so server and client markup agree.
  const hydrated = useSyncExternalStore(subscribeNothing, clientSnapshot, serverSnapshot);
  const reducedMotion = (useReducedMotion() ?? false) && hydrated;
  const [internalMonth, setInternalMonth] = useState(() => (value ? monthStart(value) : undefined));
  const [focusedDate, setFocusedDate] = useState(value);
  const viewportRef = useRef<HTMLDivElement>(null);
  const focusRequest = useRef<string | null>(null);
  // Without a value or month the calendar waits for the client's today, then settles on that month once.
  const fallback = value ?? today;
  const month = controlledMonth ? monthStart(controlledMonth) : internalMonth ?? (fallback && monthStart(fallback));
  if (!controlledMonth && !internalMonth && month) setInternalMonth(month);
  const monthTime = month?.getTime();
  const monthKey = month ? dateKey(month) : "pending";
  // Direction is read from the month itself, so arrows, keys, Today, and a controlled month all travel the same way.
  const [shownMonth, setShownMonth] = useState(monthTime);
  const [direction, setDirection] = useState(0);
  if (shownMonth !== monthTime) {
    setShownMonth(monthTime);
    setDirection(shownMonth === undefined || monthTime === undefined ? 0 : monthTime > shownMonth ? 1 : -1);
  }
  const weeks = useMemo(() => (monthTime === undefined ? [] : makeWeeks(new Date(monthTime))), [monthTime]);
  // The strip position is measured in months. The panes on either side of it render, plus the month being navigated to.
  const target = month ? monthIndex(month) : 0;
  const position = useMotionValue(target);
  const [span, setSpan] = useState<[number, number]>([target, target]);
  useMotionValueEvent(position, "change", (value) => {
    const next: [number, number] = [Math.floor(value + 1e-3), Math.ceil(value - 1e-3)];
    setSpan((current) => (current[0] === next[0] && current[1] === next[1] ? current : next));
  });
  const ready = month !== undefined;
  const placed = useRef(ready);
  useLayoutEffect(() => {
    if (!ready) return;
    const from = position.get();
    if (from === target) return;
    // The first month and reduced motion land in place; everything else slides on the strip.
    if (!placed.current || reducedMotion) { placed.current = true; position.jump(target); return; }
    // Long jumps (Today, a year with Shift) start one month away, so the strip never scrolls through the months between.
    if (Math.abs(target - from) > 2) position.jump(target - Math.sign(target - from));
    const controls = animate(position, target, stripSpring);
    return () => controls.stop();
  }, [ready, target, reducedMotion, position]);
  const paneIndexes = Array.from(new Set([span[0], span[1], target])).sort((a, b) => a - b);
  const formatter = useMemo(() => new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }), [locale]);
  const weekdayFormatter = useMemo(() => new Intl.DateTimeFormat(locale, { weekday: "short" }), [locale]);
  const weekdays = useMemo(() => Array.from({ length: 7 }, (_, index) => weekdayFormatter.format(new Date(2024, 0, 7 + index))), [weekdayFormatter]);
  const monthLabel = month ? formatter.format(month) : "";
  // The selected disc glides between days, so each number flips color as the disc actually passes it:
  // the day it leaves waits longer on short hops, the day it lands on waits longer on long ones.
  const valueKey = value ? dateKey(value) : "";
  const [last, setLast] = useState({ key: valueKey, date: value });
  const [handoff, setHandoff] = useState({ from: "", to: "", distance: 0 });
  if (last.key !== valueKey) {
    const days = last.date && value ? Math.round((startOfDay(value).getTime() - startOfDay(last.date).getTime()) / 864e5) : 0;
    const columns = last.date && value ? value.getDay() - last.date.getDay() : 0;
    setLast({ key: valueKey, date: value });
    setHandoff({ from: last.key, to: valueKey, distance: Math.hypot(columns, (days - columns) / 7) });
  }
  const numberDelay = (key: string): CSSProperties | undefined => {
    if (!handoff.distance || reducedMotion || (key !== handoff.to && key !== handoff.from)) return undefined;
    const delay = key === handoff.to ? Math.min(260, 95 + 85 * Math.log(handoff.distance)) : Math.max(20, 130 / handoff.distance);
    return { "--number-delay": `${Math.round(delay)}ms` } as CSSProperties;
  };

  const isDisabled = (date: Date) => isBefore(date, minDate) || isAfter(date, maxDate) || Boolean(disabledDates?.(date));
  const previousMonth = month && addMonths(month, -1);
  const nextMonth = month && addMonths(month, 1);
  // While the month is still unknown the controls keep their resting look, so hydration does not flash them dim.
  const previousDisabled = Boolean(previousMonth && minDate && previousMonth.getTime() < monthStart(minDate).getTime());
  const nextDisabled = Boolean(nextMonth && maxDate && nextMonth.getTime() > monthStart(maxDate).getTime());
  const todaySelectable = Boolean(today && !isDisabled(today) && onChange);
  const todayIdle = Boolean(today && sameMonth(month, today) && (!todaySelectable || sameDay(value, today)));
  // Roving tab stop: the day last focused, else the selection, else today, else the first open day of the month.
  const tabbableKey = (() => {
    const open = (date?: Date) => (date && sameMonth(date, month) && !isDisabled(date) ? dateKey(date) : "");
    return open(focusedDate) || open(value) || open(today) || dateKey(weeks.flat().find((date) => sameMonth(date, month) && !isDisabled(date)) ?? new Date(0));
  })();

  const changeMonth = (target: Date) => {
    const normalized = monthStart(target);
    if (!controlledMonth) setInternalMonth(normalized);
    onMonthChange?.(normalized);
  };

  /** Keyboard focus lands on the new day in the same frame the month starts to slide. */
  useLayoutEffect(() => {
    const key = focusRequest.current;
    if (!key) return;
    const button = viewportRef.current?.querySelector<HTMLButtonElement>(`[data-present] [data-date="${key}"]`);
    if (button) { focusRequest.current = null; button.focus({ preventScroll: true }); }
  });

  /** Clamps a keyboard move to the allowed range and steps past blocked days in the direction of travel. */
  const moveFocus = (from: Date, target: Date, step: number) => {
    let next = isBefore(target, minDate) && minDate ? startOfDay(minDate) : isAfter(target, maxDate) && maxDate ? startOfDay(maxDate) : target;
    for (let tries = 0; tries < 42 && isDisabled(next); tries += 1) next = addDays(next, step);
    if (isDisabled(next) || sameDay(next, from)) return;
    setFocusedDate(next);
    focusRequest.current = dateKey(next);
    if (!sameMonth(next, month)) changeMonth(next);
  };

  const onDayKeyDown = (event: KeyboardEvent<HTMLButtonElement>, date: Date) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!isDisabled(date)) onChange?.(date);
      return;
    }
    const moves: Record<string, [Date, number]> = {
      ArrowLeft: [addDays(date, -1), -1],
      ArrowRight: [addDays(date, 1), 1],
      ArrowUp: [addDays(date, -7), -1],
      ArrowDown: [addDays(date, 7), 1],
      Home: [addDays(date, -date.getDay()), 1],
      End: [addDays(date, 6 - date.getDay()), -1],
      PageUp: [shiftMonths(date, event.shiftKey ? -12 : -1), -1],
      PageDown: [shiftMonths(date, event.shiftKey ? 12 : 1), 1],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    moveFocus(date, move[0], move[1]);
  };

  const goToToday = () => {
    if (!today || !month || todayIdle) return;
    setFocusedDate(today);
    if (!sameMonth(today, month)) changeMonth(today);
    if (todaySelectable && !sameDay(value, today)) onChange?.(today);
  };

  const cx = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(" ");
  const layoutMotion = reducedMotion ? { duration: 0 } : spring.morph;
  // The title swaps at once and eases in from the side the strip travels from; a new click restarts it, so titles never pile up.
  const titleEnter = reducedMotion || !direction ? { opacity: 1, x: 0 } : { opacity: 0, x: direction * 10 };

  const renderMonth = (paneMonth: Date, present: boolean) => <div className={styles.grid} role="grid" aria-label={formatter.format(paneMonth)}>
    {makeWeeks(paneMonth).map((week) => <div key={dateKey(week[0])} className={styles.week} role="row">
      {week.map((date) => {
        const key = dateKey(date);
        const selected = sameDay(date, value);
        const isToday = sameDay(date, today);
        return <button
          key={key}
          type="button"
          role="gridcell"
          data-date={key}
          aria-label={date.toLocaleDateString(locale, { dateStyle: "full" })}
          aria-selected={selected}
          aria-current={isToday ? "date" : undefined}
          tabIndex={present && key === tabbableKey ? 0 : -1}
          disabled={isDisabled(date)}
          style={present ? numberDelay(key) : undefined}
          className={cx(styles.day, !sameMonth(date, paneMonth) && styles.outside, selected && styles.selected, isToday && styles.today)}
          onFocus={() => setFocusedDate(date)}
          onKeyDown={(event) => onDayKeyDown(event, date)}
          onClick={() => onChange?.(date)}
        >{selected && <motion.span className={styles.highlight} layoutId={`selected-${dateKey(paneMonth)}`} layoutDependency={valueKey} transition={layoutMotion} aria-hidden="true" />}<span className={styles.dayNumber}>{date.getDate()}</span></button>;
      })}
    </div>)}
  </div>;

  return <LayoutGroup id={groupId}>
    <section className={cx(styles.calendar, className)} aria-labelledby={titleId}>
      <div className={styles.header}>
        <h2 id={titleId} className={styles.heading}>
          <span className={styles.srOnly}>{monthLabel}</span>
          <span className={styles.title} aria-hidden="true">
            {month && <motion.span key={monthKey} className={styles.titleRow} initial={titleEnter} animate={{ opacity: 1, x: 0 }} transition={{ duration: duration.standard, ease: ease.enter }}>{monthLabel}</motion.span>}
          </span>
        </h2>
        <span className={styles.srOnly} aria-live="polite">{direction ? monthLabel : ""}</span>
        <div className={styles.navigation}>
          {showToday && <button type="button" className={styles.todayButton} aria-disabled={todayIdle || undefined} aria-label={today ? `Today, ${today.toLocaleDateString(locale, { dateStyle: "full" })}` : "Today"} onClick={goToToday}>Today</button>}
          <button type="button" className={styles.navButton} aria-label="Previous month" aria-disabled={previousDisabled || undefined} onClick={() => { if (!previousDisabled && previousMonth) changeMonth(previousMonth); }}><ChevronLeft size={16} strokeWidth={1.75} aria-hidden="true" /></button>
          <button type="button" className={styles.navButton} aria-label="Next month" aria-disabled={nextDisabled || undefined} onClick={() => { if (!nextDisabled && nextMonth) changeMonth(nextMonth); }}><ChevronRight size={16} strokeWidth={1.75} aria-hidden="true" /></button>
        </div>
      </div>
      <div className={styles.weekdays} aria-hidden="true">{weekdays.map((day, index) => <span key={`${day}-${index}`}>{day.slice(0, 2)}</span>)}</div>
      <div className={styles.monthViewport} ref={viewportRef}>
        {month ? paneIndexes.map((index) => <MonthPane key={index} index={index} position={position} present={index === target}>{renderMonth(fromIndex(index), index === target)}</MonthPane>)
          : <div className={styles.monthBody} aria-hidden="true"><div className={styles.grid}>{Array.from({ length: 6 }, (_, week) => <div key={week} className={styles.week}>{Array.from({ length: 7 }, (_, day) => <span key={day} className={styles.placeholderDay} />)}</div>)}</div></div>}
      </div>
    </section>
  </LayoutGroup>;
}

export { addDays, addMonths, sameDay, startOfDay };
