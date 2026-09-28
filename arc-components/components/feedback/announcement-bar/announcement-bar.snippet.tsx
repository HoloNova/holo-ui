"use client";

import type { AnimationPlaybackControls, Transition, Variants } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import { AnimatePresence, animate, motion, useIsPresent, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { ArrowRight, ChevronDown, ChevronUp, Pause, Play, X } from "lucide-react";
import { forwardRef, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";

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
const ARC_ANNOUNCEMENT_BAR_STYLES = `/* The outer section animates its height to zero on dismiss, so whatever sits below eases up with it. */
.arc-announcement-bar-collapse { overflow: hidden; container-type: inline-size; font-family: var(--font-body); letter-spacing: var(--tracking-body); }

/* The side column mirrors the controls, so the message stays centered on the page rather than in the leftover space. */
.arc-announcement-bar-bar { --icon: 32px; --control-gap: 2px; --muted: var(--text-secondary); display: grid; grid-template-columns: calc(var(--controls, 0) * var(--icon) + max(var(--controls, 0) - 1, 0) * var(--control-gap)) minmax(0, 1fr) auto; align-items: center; gap: var(--space-3); padding: 6px 8px 6px 16px; border-bottom: 1px solid var(--border); background: var(--surface-muted); color: var(--foreground); }
.arc-announcement-bar-bar[data-tone="inverted"] { --muted: color-mix(in oklch, var(--background) 66%, transparent); border-bottom-color: transparent; background: var(--foreground); color: var(--background); }

.arc-announcement-bar-side { min-width: 0; }
.arc-announcement-bar-viewport { position: relative; min-height: 32px; overflow: hidden; }

/* Faces overlap in place; the entering one reports its height and the viewport springs to it. */
.arc-announcement-bar-face { position: absolute; top: 0; right: 0; left: 0; display: flex; min-height: 32px; align-items: center; justify-content: center; }
.arc-announcement-bar-message { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: center; gap: 2px 12px; margin: 0; padding: 6px 0; font-size: var(--text-sm); line-height: 1.4; text-align: center; text-wrap: balance; }
.arc-announcement-bar-text { min-width: 0; }

/* The countdown is one run of text: every cell shares the line box, so digits, colons, and the day mark sit on the message baseline. */
.arc-announcement-bar-countdown { display: inline-flex; align-items: baseline; gap: 6px; color: var(--muted); white-space: nowrap; }
.arc-announcement-bar-countdownLabel { color: inherit; }
.arc-announcement-bar-time { display: inline-flex; align-items: baseline; color: var(--foreground); font-variant-numeric: tabular-nums; font-weight: 500; line-height: inherit; }
.arc-announcement-bar-time[data-pending] { opacity: 0; }
.arc-announcement-bar-bar[data-tone="inverted"] .arc-announcement-bar-time { color: var(--background); }
.arc-announcement-bar-digit { position: relative; display: inline-block; overflow: hidden; overflow: clip; text-align: center; }
.arc-announcement-bar-digitSizer { visibility: hidden; }
.arc-announcement-bar-digitFace { position: absolute; inset: 0; display: block; }
.arc-announcement-bar-unit { display: inline-flex; align-items: baseline; }
.arc-announcement-bar-unitMark { margin-left: 1px; color: var(--muted); font-weight: 400; }
/* "case" lifts the colon to the middle of the figures, which it loses once the digits are split into cells. */
.arc-announcement-bar-sep { display: inline-block; padding-inline: 1px; color: var(--muted); font-feature-settings: "case"; font-weight: 400; }
.arc-announcement-bar-gap { display: inline-block; width: .4em; }

.arc-announcement-bar-cta { display: inline-flex; align-items: center; gap: 4px; padding: 0; border: 0; background: none; color: inherit; cursor: pointer; font: inherit; font-weight: 500; text-decoration: none; white-space: nowrap; -webkit-tap-highlight-color: transparent; }
.arc-announcement-bar-cta svg { transition: transform var(--duration-fast) var(--ease-standard); }

.arc-announcement-bar-controls { display: flex; align-items: center; gap: var(--control-gap); }
.arc-announcement-bar-icon, .arc-announcement-bar-ring { position: relative; display: grid; width: var(--icon); height: var(--icon); flex: none; place-items: center; padding: 0; border: 0; border-radius: 50%; background: transparent; color: var(--muted); cursor: pointer; -webkit-tap-highlight-color: transparent; transition: color var(--duration-fast) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard); }
.arc-announcement-bar-icon:active, .arc-announcement-bar-ring:active { background: color-mix(in oklch, currentColor 12%, transparent); color: inherit; }
.arc-announcement-bar-ring svg { width: 20px; height: 20px; overflow: visible; transform: rotate(-90deg); }
.arc-announcement-bar-ringTrack { fill: none; stroke: currentColor; stroke-opacity: .22; stroke-width: 1.75; }
.arc-announcement-bar-ringFill { fill: none; stroke: currentColor; stroke-linecap: round; stroke-width: 1.75; }
.arc-announcement-bar-ringIcon { position: absolute; inset: 0; display: grid; place-items: center; }
.arc-announcement-bar-ringIcon svg { width: 9px; height: 9px; transform: none; fill: currentColor; }
.arc-announcement-bar-bar[data-tone="inverted"] .arc-announcement-bar-icon, .arc-announcement-bar-bar[data-tone="inverted"] .arc-announcement-bar-ring { color: var(--muted); }

@media (hover: hover) and (pointer: fine) {
  .arc-announcement-bar-icon:hover, .arc-announcement-bar-ring:hover { background: color-mix(in oklch, currentColor 10%, transparent); }
  .arc-announcement-bar-bar .arc-announcement-bar-icon:hover, .arc-announcement-bar-bar .arc-announcement-bar-ring:hover { color: var(--foreground); }
  .arc-announcement-bar-bar[data-tone="inverted"] .arc-announcement-bar-icon:hover, .arc-announcement-bar-bar[data-tone="inverted"] .arc-announcement-bar-ring:hover { color: var(--background); }
  .arc-announcement-bar-cta:hover svg { transform: translateX(2px); }
}

/* Narrow bars drop the mirror column and read from the start edge. */
@container (max-width: 560px) {
  .arc-announcement-bar-bar { grid-template-columns: 0 minmax(0, 1fr) auto; gap: 0 var(--space-2); padding-left: 14px; }
  .arc-announcement-bar-face { justify-content: flex-start; }
  .arc-announcement-bar-message { justify-content: flex-start; column-gap: 10px; text-align: left; }
}

@media (prefers-reduced-motion: reduce) {
  .arc-announcement-bar-icon, .arc-announcement-bar-ring, .arc-announcement-bar-cta svg { transition: none; }
}
`;

const styles: Record<string, string> = new Proxy({
  "bar": "arc-announcement-bar-bar",
  "collapse": "arc-announcement-bar-collapse",
  "controls": "arc-announcement-bar-controls",
  "countdown": "arc-announcement-bar-countdown",
  "countdownLabel": "arc-announcement-bar-countdownLabel",
  "cta": "arc-announcement-bar-cta",
  "digit": "arc-announcement-bar-digit",
  "digitFace": "arc-announcement-bar-digitFace",
  "digitSizer": "arc-announcement-bar-digitSizer",
  "face": "arc-announcement-bar-face",
  "gap": "arc-announcement-bar-gap",
  "icon": "arc-announcement-bar-icon",
  "message": "arc-announcement-bar-message",
  "ring": "arc-announcement-bar-ring",
  "ringFill": "arc-announcement-bar-ringFill",
  "ringIcon": "arc-announcement-bar-ringIcon",
  "ringTrack": "arc-announcement-bar-ringTrack",
  "sep": "arc-announcement-bar-sep",
  "side": "arc-announcement-bar-side",
  "text": "arc-announcement-bar-text",
  "time": "arc-announcement-bar-time",
  "unit": "arc-announcement-bar-unit",
  "unitMark": "arc-announcement-bar-unitMark",
  "viewport": "arc-announcement-bar-viewport"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-announcement-bar-${prop}`,
});



export interface AnnouncementAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface Announcement {
  /** Stable id, reported to callbacks. */
  id: string;
  message: ReactNode;
  action?: AnnouncementAction;
  /** Counts down to a moment, for example the end of a sale. */
  countdown?: { to: Date | string | number; label?: string };
}

/**
 * A slim bar for the top of a page. It can rotate several messages, each rising in from below while the bar springs to
 * the new height; rotation pauses on hover, focus, or a hidden tab, and `controls` adds previous, next, and a pause ring. Messages can carry a
 * call to action and a live countdown. Dismissing collapses the height smoothly so the page below eases up, and with an
 * `id` the dismissal is remembered in `localStorage`.
 */
export interface AnnouncementBarProps {
  messages: Announcement[];
  /** Remembers dismissal under this id. Change the id to show a new campaign to everyone again. */
  id?: string;
  /** Whether the bar is shown. Leave it out to let the component manage it. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Index of the visible message. */
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  /** Milliseconds each message stays before the next one. Defaults to 6000. */
  interval?: number;
  /** Rotate automatically. Pauses on hover, focus, or a hidden tab, and is turned off when the visitor prefers reduced motion. Defaults to true. */
  autoPlay?: boolean;
  /** Show previous, next, and pause controls when there are several messages. Defaults to false: only the close button shows. */
  controls?: boolean;
  dismissible?: boolean;
  tone?: "neutral" | "inverted";
  onAction?: (announcement: Announcement) => void;
  onCountdownEnd?: (announcement: Announcement) => void;
  /** Accessible name of the region. */
  label?: string;
  className?: string;
}

const storageKey = (id: string) => `arc-announcement:${id}`;
/** Forgets a remembered dismissal so the bar with this id shows again. */
export function clearAnnouncementDismissal(id: string) {
  try { window.localStorage.removeItem(storageKey(id)); } catch { /* Storage can be blocked. */ }
}

type Bezier = [number, number, number, number];
const enter = [...motionTokens.ease.enter] as Bezier;
const standard = [...motionTokens.ease.standard] as Bezier;
const physical = (visualDuration: number, bounce: number): Transition => {
  const root = 2 * Math.PI / (visualDuration * 1.2);
  return { type: "spring", stiffness: root * root, damping: 2 * (1 - bounce) * root, mass: 1 };
};
const RISE = physical(.46, .1), HEIGHT = physical(.42, 0), COLLAPSE = physical(.44, 0);

/** Next rises from below and leaves upward; previous runs the other way. */
const faceVariants: Variants = {
  hidden: (direction: number) => ({ opacity: 0, y: `${direction * 70}%`, filter: `blur(${motionTokens.blur.soft}px)` }),
  shown: { opacity: 1, y: "0%", filter: "blur(0px)", transition: { y: RISE, opacity: { duration: .24, ease: enter }, filter: { duration: .28, ease: enter } } },
  gone: (direction: number) => ({ opacity: 0, y: `${direction * -60}%`, filter: `blur(${motionTokens.blur.soft}px)`, transition: { y: RISE, opacity: { duration: .16, ease: standard }, filter: { duration: .16, ease: standard } } }),
};
const fadeVariants: Variants = { hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: .2 } }, gone: { opacity: 0, transition: { duration: .12 } } };

function parts(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(total / 86400), h: Math.floor(total % 86400 / 3600), m: Math.floor(total % 3600 / 60), s: total % 60 };
}
const pad = (value: number) => String(value).padStart(2, "0");

/**
 * One character cell. A changed digit drops in from above while the old one falls away, like a counter winding down.
 * The invisible sizer keeps the cell in the text flow, so it shares the baseline of the words around it.
 */
function Digit({ char, reduced }: { char: string; reduced: boolean }) {
  return <span className={styles.digit}>
    <span className={styles.digitSizer} aria-hidden="true">0</span>
    <AnimatePresence initial={false}>
      <motion.span key={char} className={styles.digitFace}
        initial={reduced ? { opacity: 0 } : { y: "-70%", opacity: 0 }} animate={{ y: "0%", opacity: 1 }} exit={reduced ? { opacity: 0 } : { y: "70%", opacity: 0 }}
        transition={reduced ? { duration: .12 } : { y: physical(.32, .08), opacity: { duration: .16 } }}>{char}</motion.span>
    </AnimatePresence>
  </span>;
}

function Countdown({ to, label, reduced, onEnd }: { to: Date | string | number; label?: string; reduced: boolean; onEnd?: () => void }) {
  const target = new Date(to).getTime();
  const [now, setNow] = useState<number | null>(null);
  const ended = useRef(false);
  const endRef = useRef(onEnd);
  useEffect(() => { endRef.current = onEnd; }, [onEnd]);
  useEffect(() => {
    let timer = 0;
    const tick = () => {
      const current = Date.now();
      setNow(current);
      if (current >= target) {
        if (!ended.current) { ended.current = true; endRef.current?.(); }
        return;
      }
      // Wake just after each whole second so digits change on the beat.
      timer = window.setTimeout(tick, 1000 - (current % 1000) + 8);
    };
    timer = window.setTimeout(tick, 0);
    return () => window.clearTimeout(timer);
  }, [target]);
  const { d, h, m, s } = parts(now === null ? 0 : target - now);
  const pending = now === null;
  const spoken = pending ? "" : `${d ? `${d} days ` : ""}${h} hours ${m} minutes`;
  const digits = (value: string, key: string) => value.split("").map((char, index) => <Digit key={`${key}${value.length - index}`} char={pending ? "0" : char} reduced={reduced} />);
  return <span className={styles.countdown}>
    {label ? <span className={styles.countdownLabel}>{label}</span> : null}
    <span role="timer" aria-live="off" aria-label={spoken} className={styles.time} data-pending={pending || undefined}>
      {d ? <><span className={styles.unit}>{digits(String(d), "d")}<span className={styles.unitMark} aria-hidden="true">d</span></span><span className={styles.gap} aria-hidden="true" /></> : null}
      {digits(pad(h), "h")}<span className={styles.sep} aria-hidden="true">:</span>{digits(pad(m), "m")}<span className={styles.sep} aria-hidden="true">:</span>{digits(pad(s), "s")}
    </span>
  </span>;
}

function Face({ announcement, direction, reduced, position, total, onSize, onAction, onCountdownEnd }: { announcement: Announcement; direction: number; reduced: boolean; position: number; total: number; onSize: (height: number) => void; onAction?: (announcement: Announcement) => void; onCountdownEnd?: (announcement: Announcement) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const present = useIsPresent();
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || !present) return;
    const report = () => onSize(node.offsetHeight);
    report();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(report);
    observer.observe(node);
    return () => observer.disconnect();
  }, [onSize, present]);
  const { action, countdown } = announcement;
  const cta = action ? action.href
    ? <a className={styles.cta} href={action.href} onClick={() => { action.onClick?.(); onAction?.(announcement); }}>{action.label}<ArrowRight size={14} strokeWidth={1.75} aria-hidden="true" /></a>
    : <button type="button" className={styles.cta} onClick={() => { action.onClick?.(); onAction?.(announcement); }}>{action.label}<ArrowRight size={14} strokeWidth={1.75} aria-hidden="true" /></button> : null;
  return <motion.div ref={ref} className={styles.face} custom={direction} variants={reduced ? fadeVariants : faceVariants} initial="hidden" animate="shown" exit="gone"
    role={total > 1 ? "group" : undefined} aria-roledescription={total > 1 ? "slide" : undefined} aria-label={total > 1 ? `${position} of ${total}` : undefined} inert={!present || undefined}>
    <p className={styles.message}>
      <span className={styles.text}>{announcement.message}</span>
      {countdown ? <Countdown to={countdown.to} label={countdown.label} reduced={reduced} onEnd={() => onCountdownEnd?.(announcement)} /> : null}
      {cta}
    </p>
  </motion.div>;
}

const RING = 2 * Math.PI * 8;

export const AnnouncementBar = forwardRef<HTMLElement, AnnouncementBarProps>(function AnnouncementBar({
  messages, id, open: openProp, defaultOpen = true, onOpenChange, index: indexProp, defaultIndex = 0, onIndexChange,
  interval = 6000, autoPlay = true, controls = false, dismissible = true, tone = "neutral", onAction, onCountdownEnd, label = "Announcements", className,
}, ref) {
  const reduced = !!useReducedMotion();
  const uid = useId();
  const total = messages.length;

  /* Open state: controlled, or internal and hidden at once when this id was dismissed before. */
  const [openInternal, setOpenInternal] = useState(defaultOpen);
  const [remembered, setRemembered] = useState(false);
  useLayoutEffect(() => {
    if (!id || openProp !== undefined) return;
    let stored = false;
    try { stored = window.localStorage.getItem(storageKey(id)) === "dismissed"; } catch { /* Storage can be blocked. */ }
    // Storage is only readable on the client; hide before paint so a dismissed bar never flashes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setRemembered(true);
  }, [id, openProp]);
  const open = openProp ?? (openInternal && !remembered);

  const dismiss = () => {
    if (id) { try { window.localStorage.setItem(storageKey(id), "dismissed"); } catch { /* Storage can be blocked. */ } }
    if (openProp === undefined) setOpenInternal(false);
    onOpenChange?.(false);
  };

  /* Rotation. */
  const [indexInternal, setIndexInternal] = useState(defaultIndex);
  const current = total ? ((indexProp ?? indexInternal) % total + total) % total : 0;
  const [direction, setDirection] = useState(1);
  const go = useCallback((step: number) => {
    if (total < 2) return;
    const next = ((current + step) % total + total) % total;
    setDirection(step > 0 ? 1 : -1);
    if (indexProp === undefined) setIndexInternal(next);
    onIndexChange?.(next);
  }, [current, indexProp, onIndexChange, total]);

  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const read = () => setHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", read);
    return () => document.removeEventListener("visibilitychange", read);
  }, []);
  const rotating = autoPlay && !reduced && total > 1;
  const running = rotating && open && !userPaused && !hovered && !focused && !hidden;

  /* The ring is the clock: its progress runs to one, then advances. Pausing stops it where it is; resuming finishes the rest. */
  const progress = useMotionValue(0);
  const dash = useTransform(progress, value => RING * (1 - value));
  const goRef = useRef(go);
  useEffect(() => { goRef.current = go; }, [go]);
  useEffect(() => { progress.jump(0); }, [current, progress]);
  useEffect(() => {
    if (!running) return;
    let controls: AnimationPlaybackControls | null = animate(progress, 1, {
      duration: interval / 1000 * (1 - progress.get()), ease: "linear",
      onComplete: () => { controls = null; goRef.current(1); },
    });
    return () => controls?.stop();
  }, [running, current, interval, progress]);

  /* The viewport springs to the height of the current message, which can wrap on narrow screens. */
  const height = useMotionValue<number | "auto">("auto");
  const measured = useRef(0);
  const onSize = useCallback((next: number) => {
    if (Math.abs(next - measured.current) < .5) return;
    const first = measured.current === 0;
    measured.current = next;
    if (first || reduced) height.jump(next);
    else animate(height, next, HEIGHT);
  }, [height, reduced]);

  const announcement = messages[current];
  if (!announcement) return null;
  const navigable = controls && total > 1;
  const controlCount = (navigable ? 2 + (rotating ? 1 : 0) : 0) + (dismissible ? 1 : 0);

  return <AnimatePresence initial={false}>
    {open ? <motion.section key="bar" ref={ref} className={[styles.collapse, className].filter(Boolean).join(" ")} aria-label={label}
      aria-roledescription={total > 1 ? "carousel" : undefined}
      initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
      exit={reduced ? { opacity: 0, transition: { duration: .16 } } : { height: 0, opacity: 0, transition: { height: COLLAPSE, opacity: { duration: .2, ease: standard } } }}
      transition={reduced ? { duration: .16 } : { height: COLLAPSE, opacity: { duration: .24, ease: enter } }}
      onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(true); }} onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}>
      <div className={styles.bar} data-tone={tone} style={{ "--controls": controlCount } as CSSProperties}>
        <div className={styles.side} aria-hidden="true" />
        <motion.div className={styles.viewport} style={{ height }} id={`${uid}-slides`} aria-live={running ? "off" : "polite"} aria-atomic="false">
          <AnimatePresence initial={false} custom={direction}>
            <Face key={announcement.id} announcement={announcement} direction={direction} reduced={reduced} position={current + 1} total={total}
              onSize={onSize} onAction={onAction} onCountdownEnd={onCountdownEnd} />
          </AnimatePresence>
        </motion.div>
        <div className={styles.controls}>
          {navigable ? <>
            <button type="button" className={styles.icon} aria-label="Previous announcement" aria-controls={`${uid}-slides`} onClick={() => go(-1)}><ChevronUp size={16} strokeWidth={1.75} aria-hidden="true" /></button>
            {rotating ? <button type="button" className={styles.ring} aria-label={userPaused ? "Resume announcements" : "Pause announcements"} aria-pressed={userPaused} onClick={() => setUserPaused(paused => !paused)}>
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <circle cx="10" cy="10" r="8" className={styles.ringTrack} />
                <motion.circle cx="10" cy="10" r="8" className={styles.ringFill} strokeDasharray={RING} style={{ strokeDashoffset: dash }} />
              </svg>
              <span className={styles.ringIcon}>{userPaused ? <Play size={9} strokeWidth={2.4} aria-hidden="true" /> : <Pause size={9} strokeWidth={2.4} aria-hidden="true" />}</span>
            </button> : null}
            <button type="button" className={styles.icon} aria-label="Next announcement" aria-controls={`${uid}-slides`} onClick={() => go(1)}><ChevronDown size={16} strokeWidth={1.75} aria-hidden="true" /></button>
          </> : null}
          {dismissible ? <button type="button" className={styles.icon} aria-label="Dismiss" onClick={dismiss}><X size={16} strokeWidth={1.75} aria-hidden="true" /></button> : null}
        </div>
      </div>
    </motion.section> : null}
  </AnimatePresence>;
});

export default AnnouncementBar;
