"use client";

import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import type { Transition } from "motion/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";

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
const ARC_TIMELINE_STYLES = `/* Geometry: a 28px marker column, the line centred under it, and rows whose first text line centres on the marker. */
.arc-timeline-root { --marker: 28px; --marker-top: 8px; --line-gap: 4px; position: relative; display: grid; min-width: 0; color: var(--foreground); }
/* Inserting at the top pushes the rows down instead of the browser holding the scroll position still. */
.arc-timeline-scroller { min-width: 0; overflow-anchor: none; }
@property --timeline-feather { syntax: "<length>"; inherits: false; initial-value: 0px; }
.arc-timeline-scroller[data-scrolls] { max-height: var(--timeline-height); overflow-y: auto; overscroll-behavior: contain; scrollbar-color: var(--border-strong) transparent; scrollbar-width: thin; mask-image: linear-gradient(to bottom, #000 calc(100% - var(--timeline-feather)), transparent); transition: --timeline-feather var(--duration-standard) var(--ease-standard); }
/* While more updates wait below, the last visible row fades into the edge instead of being cut. */
.arc-timeline-scroller[data-more] { --timeline-feather: 36px; }
.arc-timeline-group { position: relative; }
.arc-timeline-group[data-entering] { overflow: clip; }
/* Day labels stay pinned while their updates scroll under them. Set --timeline-surface when the feed sits on another surface. */
.arc-timeline-day { position: sticky; z-index: 2; top: 0; display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-3); padding: var(--space-2) var(--space-3) var(--space-2) 0; background: var(--timeline-surface, var(--surface)); color: var(--foreground); font-size: var(--text-sm); font-weight: 500; line-height: var(--leading-body); }
.arc-timeline-count { color: var(--text-muted); font-size: var(--text-xs); font-weight: 400; font-variant-numeric: tabular-nums; }
.arc-timeline-rolling { display: inline-flex; }
.arc-timeline-place { position: relative; display: inline-flex; overflow: clip; overflow-clip-margin: .15em; }
.arc-timeline-rise { position: relative; display: inline-flex; }
.arc-timeline-riseLine { display: inline-block; white-space: nowrap; }
.arc-timeline-list { margin: 0 0 var(--space-3); padding: 0; list-style: none; }

.arc-timeline-item { position: relative; padding-left: calc(var(--marker) + var(--space-2)); }
.arc-timeline-item[data-entering] { overflow: clip; }
.arc-timeline-marker { position: absolute; z-index: 1; top: var(--marker-top); left: 0; display: grid; width: var(--marker); height: var(--marker); place-items: center; border-radius: var(--radius-pill); color: var(--text-secondary); }
.arc-timeline-marker img { display: block; width: 100%; height: 100%; border-radius: inherit; object-fit: cover; }
/* A person's portrait sits on a hairline ring; a system event is a quiet node with its icon. */
.arc-timeline-marker::after { content: ""; position: absolute; inset: 0; border: 1px solid color-mix(in oklch, var(--foreground) 10%, transparent); border-radius: inherit; pointer-events: none; }
.arc-timeline-marker[data-tone] { background: var(--surface); }
.arc-timeline-marker[data-tone="success"] { background: color-mix(in oklch, var(--success) 12%, var(--surface)); color: var(--success); }
.arc-timeline-marker[data-tone="danger"] { background: color-mix(in oklch, var(--danger) 12%, var(--surface)); color: var(--danger); }
.arc-timeline-marker svg { width: 14px; height: 14px; stroke-width: 2; }
/* The line runs from just under this marker to just above the next one and draws downward from its top. */
.arc-timeline-segment { position: absolute; top: calc(var(--marker-top) + var(--marker) + var(--line-gap)); bottom: calc(var(--line-gap) - var(--marker-top)); left: calc(var(--marker) / 2 - .5px); width: 1px; background: var(--border-strong); transform-origin: 50% 0; }

.arc-timeline-content { min-width: 0; }
.arc-timeline-trigger { display: grid; width: 100%; grid-template-columns: minmax(0, 1fr) auto; align-items: start; column-gap: var(--space-3); margin: 0; padding: 12px var(--space-3); border: 0; border-radius: var(--radius-control); background: transparent; color: inherit; font: inherit; text-align: left; -webkit-tap-highlight-color: transparent; transition: background-color var(--duration-fast) var(--ease-standard); }
button.trigger { grid-template-columns: minmax(0, 1fr) auto 16px; cursor: pointer; }
@media (hover: hover) and (pointer: fine) { button.trigger:hover { background: var(--surface-muted); } }
button.trigger:active { background: var(--surface-muted); }
button.trigger:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: -2px; }
.arc-timeline-text { display: grid; min-width: 0; gap: 2px; }
.arc-timeline-title { color: var(--text-secondary); font-size: var(--text-sm); line-height: 20px; }
.arc-timeline-actor { color: var(--foreground); font-weight: 500; }
.arc-timeline-meta { color: var(--text-muted); font-size: var(--text-xs); line-height: var(--leading-body); }
/* Times keep a steady column, so "9m" becoming "10m" never rewraps the title beside it. */
.arc-timeline-time { display: flex; min-width: 2.75rem; justify-content: flex-end; color: var(--text-muted); font-size: var(--text-xs); line-height: 20px; font-variant-numeric: tabular-nums; white-space: nowrap; }
.arc-timeline-chevron { display: grid; height: 20px; place-items: center; color: var(--text-muted); }
.arc-timeline-detail { overflow: clip; overflow-clip-margin: 4px; }
.arc-timeline-detailInner { padding: 0 var(--space-3) var(--space-4); color: var(--text-secondary); font-size: var(--text-sm); line-height: var(--leading-body); }

.arc-timeline-srOnly { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

@media (max-width: 420px) { .arc-timeline-trigger { column-gap: var(--space-2); padding-inline: var(--space-2); } .arc-timeline-detailInner { padding-inline: var(--space-2); } }
@media (prefers-reduced-motion: reduce) { .arc-timeline-trigger { transition: none; } .arc-timeline-scroller[data-scrolls] { transition: --timeline-feather 150ms linear; } }
`;

const styles: Record<string, string> = new Proxy({
  "actor": "arc-timeline-actor",
  "chevron": "arc-timeline-chevron",
  "content": "arc-timeline-content",
  "count": "arc-timeline-count",
  "day": "arc-timeline-day",
  "detail": "arc-timeline-detail",
  "detailInner": "arc-timeline-detailInner",
  "group": "arc-timeline-group",
  "item": "arc-timeline-item",
  "list": "arc-timeline-list",
  "marker": "arc-timeline-marker",
  "meta": "arc-timeline-meta",
  "place": "arc-timeline-place",
  "rise": "arc-timeline-rise",
  "riseLine": "arc-timeline-riseLine",
  "rolling": "arc-timeline-rolling",
  "root": "arc-timeline-root",
  "scroller": "arc-timeline-scroller",
  "segment": "arc-timeline-segment",
  "srOnly": "arc-timeline-srOnly",
  "text": "arc-timeline-text",
  "time": "arc-timeline-time",
  "title": "arc-timeline-title",
  "trigger": "arc-timeline-trigger"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-timeline-${prop}`,
});



export interface TimelineEvent {
  id: string;
  /** When it happened, as an ISO string or epoch milliseconds. */
  at: string | number;
  /** Who did it, shown first in the foreground color. */
  actor?: string;
  /** What happened, completing the actor: "merged Checkout redesign into main". */
  title: string;
  /** Short context under the title, such as a pull request or a build. */
  meta?: string;
  /** Revealed in place when the row is expanded. Rows without detail are not interactive. */
  detail?: ReactNode;
  /** Portrait for an event by a person. */
  avatar?: string;
  /** Icon for a system event, used when there is no avatar. */
  icon?: ReactNode;
  /** Status of a system event. Always say the outcome in the title too, so it never rests on color. */
  tone?: "neutral" | "success" | "danger";
}

/**
 * A vertical activity feed grouped by day, for project history, audit logs, and deploy streams. Use it when order and
 * recency matter; use a table when people need to sort or compare. Day labels stay pinned while their updates scroll,
 * the connecting line draws itself as rows come into view, rows expand in place, and new updates slide in at the top
 * while the rest glide down. Arrow keys move between rows, Enter or Space expands one.
 */
export interface TimelineProps {
  /** Updates in any order; the newest shows first. */
  events: TimelineEvent[];
  /** Reference time for relative labels and day groups, in epoch milliseconds. Pass a ticking clock to keep labels fresh. */
  now: number;
  /** Accessible name for the feed. */
  label: string;
  /** Time zone for day groups and clock times. Fixed by default so server and client agree. */
  timeZone?: string;
  locale?: string;
  /** Height of the scrolling area. Without it the feed grows with the page and reveals on page scroll. */
  maxHeight?: number | string;
  /** Scroll back to the top when a new update arrives while the feed is scrolled down. */
  scrollToNew?: boolean;
  defaultExpanded?: string[];
  /** Heading level for the day labels. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

type Row = TimelineEvent & { time: number; day: string };
type Group = { day: string; label: string; rows: Row[] };

const HOUR = 3_600_000;
const enter = [...motionTokens.ease.enter] as [number, number, number, number];
const standard = [...motionTokens.ease.standard] as [number, number, number, number];
/** Seconds between rows revealed together, so the line reads as drawing downward. */
const STEP = .09;
const noopSubscribe = () => () => {};

/** Reduced motion only after hydration, so the server and the first client render agree. */
function useReducedMotionSafe() {
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const reduced = useReducedMotion();
  return hydrated && !!reduced;
}

/** Rows reveal against the viewport, which already clips by the scroll area, so they wait until they are visible in both. */
type Clock = { schedule: () => number; reduced: boolean; fresh: Set<string> };
const RevealClock = createContext<Clock | null>(null);

/** Text that changes in place: the new value rises in from a soft blur while the old one lifts away a little faster. */
function RiseText({ text, reduced, direction = 1 }: { text: string; reduced: boolean; direction?: number }) {
  return <span className={styles.rise} aria-hidden="true">
    <AnimatePresence mode="popLayout" initial={false} custom={direction}>
      <motion.span key={text} className={styles.riseLine} custom={direction}
        variants={{
          from: (dir: number) => reduced ? { opacity: 0 } : { opacity: 0, y: `${.3 * dir}em`, filter: `blur(${motionTokens.blur.soft}px)` },
          to: { opacity: 1, y: "0em", filter: "blur(0px)" },
          gone: (dir: number) => reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: `${-.3 * dir}em`, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: .14, ease: standard } },
        }}
        initial="from" animate="to" exit="gone" transition={{ duration: reduced ? .15 : .22, ease: enter }}>{text}</motion.span>
    </AnimatePresence>
  </span>;
}

/** The day's update count rolls digit by digit in the direction it moved. */
function RollingCount({ value, reduced }: { value: number; reduced: boolean }) {
  const [state, setState] = useState({ value, direction: 1 });
  if (state.value !== value) setState({ value, direction: value > state.value ? 1 : -1 });
  const chars = [...String(value)];
  return <span className={styles.rolling} aria-hidden="true">
    {chars.map((char, index) => <span key={chars.length - index} className={styles.place}><RiseText text={char} reduced={reduced} direction={state.direction} /></span>)}
  </span>;
}

function dayKey(time: number, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(time));
  const get = (type: string) => parts.find(part => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function relative(time: number, now: number) {
  const minutes = Math.max(0, Math.floor((now - time) / 60_000));
  if (minutes < 1) return { short: "Now", long: "just now" };
  if (minutes < 60) return { short: `${minutes}m`, long: `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago` };
  const hours = Math.floor(minutes / 60);
  return { short: `${hours}h`, long: `${hours} ${hours === 1 ? "hour" : "hours"} ago` };
}

/** A day's section. A new day opens from nothing and pushes the older days down; it clips only while it grows. */
function DaySection({ id, fresh, reduced, children }: { id: string; fresh: boolean; reduced: boolean; children: ReactNode }) {
  const [entering, setEntering] = useState(fresh);
  return <motion.section className={styles.group} aria-labelledby={id} data-entering={entering || undefined}
    initial={fresh ? { height: 0, opacity: 0 } : false} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0, transition: { duration: reduced ? .1 : .2, ease: standard } }}
    transition={reduced ? { duration: .15 } : { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease: enter } }}
    onAnimationComplete={() => setEntering(false)}>
    {children}
  </motion.section>;
}

function TimelineRow({ row, last, expanded, onToggle, timeLabel, timeFull }: { row: Row; last: boolean; expanded: boolean; onToggle: () => void; timeLabel: string; timeFull: string }) {
  const clock = useContext(RevealClock)!;
  const { reduced } = clock;
  const detailId = useId();
  // The row reveals once, the first time it scrolls into view: its marker pops, then its line draws toward the next row.
  const [revealDelay, setRevealDelay] = useState<number | null>(null);
  const fresh = clock.fresh.has(row.id);
  const [entering, setEntering] = useState(fresh);
  const shown = revealDelay !== null;
  const delay = (revealDelay ?? 0) + (fresh ? .12 : 0);
  const pop: Transition = reduced ? { duration: 0, opacity: { duration: .15 } } : { ...motionTokens.spring.morph, visualDuration: .36, bounce: .32, delay, opacity: { duration: motionTokens.duration.fast, ease: enter, delay } };
  const draw: Transition = reduced ? { duration: 0 } : { ...motionTokens.spring.smooth, visualDuration: .34, delay: delay + .1 };
  const tone = row.avatar ? undefined : row.tone ?? "neutral";
  const Trigger = row.detail ? "button" : "div";

  return <motion.li className={styles.item} data-entering={entering || undefined}
    initial={fresh ? { height: 0 } : false} animate={{ height: "auto" }} exit={{ height: 0, opacity: 0, transition: reduced ? { duration: .1 } : { height: { ...motionTokens.spring.smooth, visualDuration: .3 }, opacity: { duration: .12 } } }}
    transition={reduced ? { duration: 0 } : motionTokens.spring.smooth} onAnimationComplete={() => setEntering(false)}
    onViewportEnter={() => setRevealDelay(current => current ?? clock.schedule())} viewport={{ once: true, amount: .2 }}>
    <motion.span className={styles.marker} data-tone={tone} aria-hidden="true" initial={{ scale: .4, opacity: 0 }} animate={shown ? { scale: 1, opacity: 1 } : undefined} transition={pop}>
      {/* eslint-disable-next-line @next/next/no-img-element -- registry components stay framework agnostic */}
      {row.avatar ? <img src={row.avatar} alt="" width={28} height={28} decoding="async" /> : row.icon}
    </motion.span>
    {!last && <motion.span className={styles.segment} aria-hidden="true" initial={{ scaleY: 0 }} animate={shown ? { scaleY: 1 } : undefined} transition={draw} />}
    <motion.div className={styles.content} initial={fresh ? (reduced ? { opacity: 0 } : { opacity: 0, y: -10, filter: `blur(${motionTokens.blur.soft}px)` }) : false} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={reduced ? { duration: .15 } : { y: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease: enter, delay: .05 }, filter: { duration: motionTokens.duration.standard, ease: enter, delay: .05 } }}>
      <Trigger className={styles.trigger} {...(row.detail ? { type: "button" as const, "data-timeline-trigger": "", "aria-expanded": expanded, "aria-controls": expanded ? detailId : undefined, onClick: onToggle } : {})}>
        <span className={styles.text}>
          <span className={styles.title}>{row.actor && <span className={styles.actor}>{row.actor}</span>}{row.actor ? " " : ""}{row.title}</span>
          {row.meta && <span className={styles.meta}>{row.meta}</span>}
        </span>
        <time className={styles.time} dateTime={new Date(row.time).toISOString()} title={timeFull}><RiseText text={timeLabel} reduced={reduced} /><span className={styles.srOnly}>{timeFull}</span></time>
        {row.detail && <motion.span className={styles.chevron} aria-hidden="true" initial={false} animate={{ rotate: expanded ? 180 : 0 }} transition={reduced ? { duration: 0 } : motionTokens.spring.snappy}><ChevronDown size={16} strokeWidth={1.75} /></motion.span>}
      </Trigger>
      <AnimatePresence initial={false}>
        {expanded && row.detail && <motion.div key="detail" id={detailId} className={styles.detail}
          initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0, transition: reduced ? { duration: 0 } : { ...motionTokens.spring.smooth, visualDuration: .28 } }}
          transition={reduced ? { duration: 0 } : motionTokens.spring.smooth}>
          <motion.div className={styles.detailInner} initial={reduced ? { opacity: 0 } : { opacity: 0, y: -4, filter: `blur(${motionTokens.blur.soft}px)` }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, transition: { duration: .1, ease: standard } }} transition={reduced ? { duration: .15 } : { duration: motionTokens.duration.standard, ease: enter, delay: .06 }}>{row.detail}</motion.div>
        </motion.div>}
      </AnimatePresence>
    </motion.div>
  </motion.li>;
}

export function Timeline({ events, now, label, timeZone = "UTC", locale = "en-US", maxHeight, scrollToNew = true, defaultExpanded = [], headingLevel = 3, className }: TimelineProps) {
  const reduced = useReducedMotionSafe();
  const id = useId();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(() => new Set(defaultExpanded));

  // Rows added after the first render are fresh: they slide in and the rest glide down. Their titles are announced.
  const ids = events.map(event => event.id).join("|");
  const [known, setKnown] = useState(() => ({ ids, set: new Set(events.map(event => event.id)), fresh: new Set<string>(), announcement: "" }));
  if (known.ids !== ids) {
    const added = events.filter(event => !known.set.has(event.id));
    setKnown({ ids, set: new Set(events.map(event => event.id)), fresh: new Set([...known.fresh, ...added.map(event => event.id)]), announcement: added.length ? `New update: ${added.map(event => [event.actor, event.title].filter(Boolean).join(" ")).join(". ")}` : known.announcement });
  }
  // The bottom edge feathers while more updates wait below, and clears once the end is in view.
  const trackRef = useRef<HTMLDivElement>(null);
  const scrolls = maxHeight !== undefined;
  useEffect(() => {
    const scroller = scrollerRef.current, track = trackRef.current;
    if (!scrolls || !scroller || !track || typeof ResizeObserver === "undefined") return;
    const update = () => { if (scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop > 2) scroller.dataset.more = ""; else delete scroller.dataset.more; };
    update();
    scroller.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(scroller);
    observer.observe(track);
    return () => { scroller.removeEventListener("scroll", update); observer.disconnect(); };
  }, [scrolls]);

  const newestId = events.reduce<TimelineEvent | null>((latest, event) => !latest || new Date(event.at).getTime() > new Date(latest.at).getTime() ? event : latest, null)?.id;
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scrollToNew || !scroller || scroller.scrollTop < 1) return;
    scroller.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }, [newestId, scrollToNew, reduced]);

  const [initialDays] = useState(() => new Set(events.map(event => dayKey(new Date(event.at).getTime(), timeZone))));
  const groups = useMemo<Group[]>(() => {
    const today = dayKey(now, timeZone), yesterday = dayKey(now - 24 * HOUR, timeZone);
    const heading = new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric", timeZone });
    const byDay = new Map<string, Row[]>();
    [...events].map(event => ({ ...event, time: new Date(event.at).getTime() })).sort((a, b) => b.time - a.time).forEach(event => {
      const day = dayKey(event.time, timeZone);
      byDay.set(day, [...(byDay.get(day) ?? []), { ...event, day }]);
    });
    return [...byDay].map(([day, rows]) => ({ day, rows, label: day === today ? "Today" : day === yesterday ? "Yesterday" : heading.format(new Date(rows[0].time)) }));
  }, [events, now, timeZone, locale]);
  const formats = useMemo(() => ({
    clock: new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit", timeZone }),
    full: new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", timeZone }),
  }), [locale, timeZone]);

  // Rows that come into view together are spaced a beat apart, so the line reads as drawing down the feed.
  const nextReveal = useRef(0);
  const schedule = useCallback(() => {
    if (reduced) return 0;
    const current = performance.now() / 1000;
    const start = Math.min(Math.max(current, nextReveal.current), current + .45);
    nextReveal.current = start + STEP;
    return start - current;
  }, [reduced]);
  const clock = useMemo<Clock>(() => ({ schedule, reduced, fresh: known.fresh }), [schedule, reduced, known.fresh]);

  function toggle(id: string) {
    setExpanded(current => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const triggers = [...(scrollerRef.current?.querySelectorAll<HTMLElement>("[data-timeline-trigger]") ?? [])];
    const index = triggers.indexOf(document.activeElement as HTMLElement);
    if (index < 0) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? triggers.length - 1 : Math.min(Math.max(index + (event.key === "ArrowDown" ? 1 : -1), 0), triggers.length - 1);
    triggers[next]?.focus();
  }

  return <RevealClock.Provider value={clock}>
    <div className={[styles.root, className].filter(Boolean).join(" ")} role="region" aria-label={label}>
      <div ref={scrollerRef} className={styles.scroller} data-scrolls={scrolls || undefined} style={scrolls ? { "--timeline-height": typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight } as CSSProperties : undefined} onKeyDown={onKeyDown}>
        {/* Presence starts enabled so markers keep their hidden first frame; rows and days present at mount opt out of entering themselves. */}
        <div ref={trackRef}><AnimatePresence>
          {groups.map(group => <DaySection key={group.day} id={`${id}-${group.day}`} fresh={!initialDays.has(group.day)} reduced={reduced}>
            <div className={styles.day} role="heading" aria-level={headingLevel} id={`${id}-${group.day}`}>
              <span>{group.label}</span>
              <span className={styles.count} aria-hidden="true"><RollingCount value={group.rows.length} reduced={reduced} /> {group.rows.length === 1 ? "update" : "updates"}</span>
              <span className={styles.srOnly}>{`, ${group.rows.length} ${group.rows.length === 1 ? "update" : "updates"}`}</span>
            </div>
            <ol className={styles.list}>
              <AnimatePresence>
                {group.rows.map((row, index) => {
                  const today = group.label === "Today" && now - row.time < 12 * HOUR;
                  const time = today ? relative(row.time, now) : { short: formats.clock.format(new Date(row.time)), long: "" };
                  return <TimelineRow key={row.id} row={row} last={index === group.rows.length - 1} expanded={expanded.has(row.id)} onToggle={() => toggle(row.id)}
                    timeLabel={time.short} timeFull={today ? `${time.long}, ${formats.full.format(new Date(row.time))}` : formats.full.format(new Date(row.time))} />;
                })}
              </AnimatePresence>
            </ol>
          </DaySection>)}
        </AnimatePresence></div>
      </div>
      <span className={styles.srOnly} role="status">{known.announcement}</span>
    </div>
  </RevealClock.Provider>;
}

export default Timeline;
