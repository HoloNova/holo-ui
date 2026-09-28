"use client";

import type { CSSProperties, FocusEvent, KeyboardEvent, MouseEvent, PointerEvent, ReactNode, Ref } from "react";
import type { PanInfo, Transition, Variants } from "motion/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown, LoaderCircle, LogOut, Monitor, Moon, Sun, SunMoon } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";

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
const ARC_USER_MENU_STYLES = `.arc-user-menu-root { position: relative; display: inline-flex; flex: none; vertical-align: middle; }

/* The trigger anchors the menu, so it answers hover and press with color, never with scale. */
.arc-user-menu-trigger { --presence-surface: var(--user-menu-surface, var(--surface)); position: relative; display: inline-flex; height: 40px; flex: none; align-items: center; gap: var(--space-2); margin: 0; padding: 4px; border: 0; border-radius: var(--radius-pill); background: transparent; color: var(--foreground); font: inherit; font-family: var(--font-body); font-size: var(--text-sm); letter-spacing: var(--tracking-body); cursor: pointer; -webkit-tap-highlight-color: transparent; transition: background-color var(--duration-fast) var(--ease-standard); }
.arc-user-menu-trigger[data-name] { padding-right: 10px; }
@media (hover: hover) and (pointer: fine) { .arc-user-menu-trigger:hover { --presence-surface: var(--surface-muted); background: var(--surface-muted); } }
.arc-user-menu-trigger[data-state="open"] { --presence-surface: var(--surface-muted); background: var(--surface-muted); }
.arc-user-menu-trigger:active { --presence-surface: color-mix(in oklch, var(--surface-muted), var(--foreground) 8%); background: color-mix(in oklch, var(--surface-muted), var(--foreground) 8%); }
.arc-user-menu-triggerName { max-width: 11rem; overflow: hidden; font-weight: 500; line-height: 1; text-overflow: ellipsis; white-space: nowrap; }
.arc-user-menu-chevron { flex: none; margin-left: -2px; color: var(--text-muted); transition: transform var(--duration-spring) var(--ease-spring), color var(--duration-fast) var(--ease-standard); }
.arc-user-menu-trigger:hover .arc-user-menu-chevron, .arc-user-menu-trigger[data-state="open"] .arc-user-menu-chevron { color: var(--foreground); }
.arc-user-menu-trigger[data-state="open"] .arc-user-menu-chevron { transform: rotate(180deg); }
@media (max-width: 639px) {
  .arc-user-menu-trigger[data-name] { padding-right: 4px; }
  .arc-user-menu-triggerName, .arc-user-menu-chevron { display: none; }
}

.arc-user-menu-face { position: relative; display: inline-grid; width: var(--face-size); height: var(--face-size); flex: none; }
.arc-user-menu-face[data-size="sm"] { --face-size: 32px; --dot-size: 11px; }
.arc-user-menu-face[data-size="md"] { --face-size: 40px; --dot-size: 12px; }
.arc-user-menu-portrait { display: block; width: 100%; height: 100%; border-radius: var(--radius-pill); background: var(--surface-muted); object-fit: cover; object-position: 50% 15%; outline: 1px solid color-mix(in oklch, var(--foreground) 9%, transparent); outline-offset: -1px; user-select: none; }
.arc-user-menu-initials { display: grid; place-items: center; color: var(--text-secondary); font-size: calc(var(--face-size) * .36); font-weight: 500; line-height: 1; }
.arc-user-menu-face .arc-user-menu-dot { position: absolute; right: -1px; bottom: -1px; box-shadow: 0 0 0 2px var(--presence-surface, var(--surface)); }

/* One mark, three shapes: solid for available, a bar for busy, a ring for away. Color and shape change together, so status never rests on color alone. */
.arc-user-menu-dot { --dot-color: var(--success); position: relative; display: inline-block; width: var(--dot-size, 10px); height: var(--dot-size, 10px); flex: none; border-radius: var(--radius-pill); background: var(--dot-color); transition: background-color var(--duration-standard) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard); }
.arc-user-menu-dot::before, .arc-user-menu-dot::after { content: ""; position: absolute; inset: 0; margin: auto; background: var(--presence-surface, var(--surface)); transition: transform var(--duration-spring) var(--ease-spring), background-color var(--duration-fast) var(--ease-standard); }
.arc-user-menu-dot::before { width: 46%; height: 46%; border-radius: var(--radius-pill); transform: scale(0); }
.arc-user-menu-dot::after { width: 58%; height: 22%; min-height: 1.5px; border-radius: 1px; transform: scaleX(0); }
.arc-user-menu-dot[data-status="busy"] { --dot-color: var(--danger); }
.arc-user-menu-dot[data-status="busy"]::after { transform: scaleX(1); }
.arc-user-menu-dot[data-status="away"] { --dot-color: var(--warning); }
.arc-user-menu-dot[data-status="away"]::before, .arc-user-menu-dot[data-status="offline"]::before { transform: scale(1); }
.arc-user-menu-dot[data-status="offline"] { --dot-color: var(--text-muted); }

/* The panel scales out of the avatar it belongs to; the component sets the origin once it is placed. */
.arc-user-menu-panel { --presence-surface: var(--surface-raised); --row: 40px; --inset: 6px; position: fixed; top: 0; left: 0; z-index: 60; box-sizing: border-box; width: 17rem; max-width: calc(100vw - 24px); padding: var(--inset); border: 1px solid var(--border); border-radius: var(--radius-panel); background: var(--surface-raised); box-shadow: var(--shadow-floating); color: var(--foreground); font-family: var(--font-body); letter-spacing: var(--tracking-body); line-height: var(--leading-body); text-align: left; outline: none; transform-origin: var(--origin-x, 100%) var(--origin-y, 0px); }
.arc-user-menu-panel[data-inline] { position: absolute; top: calc(100% + 8px); left: auto; }
.arc-user-menu-panel[data-inline][data-align="end"] { right: 0; }
.arc-user-menu-panel[data-inline][data-align="start"] { left: 0; }
.arc-user-menu-panel[data-inline][data-align="center"] { left: 50%; margin-left: -8.5rem; }

.arc-user-menu-header { display: flex; align-items: center; gap: var(--space-3); padding: 8px 8px 10px; }
.arc-user-menu-identity { display: grid; min-width: 0; flex: 1; gap: 1px; }
.arc-user-menu-nameRow { display: flex; min-width: 0; align-items: center; gap: var(--space-2); }
.arc-user-menu-name { overflow: hidden; color: var(--foreground); font-size: var(--text-sm); font-weight: 500; text-overflow: ellipsis; white-space: nowrap; }
.arc-user-menu-plan { display: inline-flex; flex: none; align-items: center; height: 18px; padding: 0 7px; border-radius: var(--radius-pill); background: var(--accent-subtle); color: var(--accent-strong); font-size: 11px; font-weight: 500; line-height: 1; }
.arc-user-menu-email { overflow: hidden; color: var(--text-muted); font-size: var(--text-xs); text-overflow: ellipsis; white-space: nowrap; }

.arc-user-menu-list { position: relative; }
.arc-user-menu-separator { height: 1px; margin: var(--inset) calc(var(--inset) * -1); background: var(--border-subtle); }

/* One highlight follows the pointer and the keyboard. It is the only hover treatment in the menu. */
.arc-user-menu-highlight { position: absolute; top: 0; right: 0; left: 0; border-radius: calc(var(--radius-panel) - var(--inset)); background: var(--accent-subtle); opacity: 0; pointer-events: none; }
.arc-user-menu-highlight[data-tone="danger"] { background: color-mix(in oklch, var(--danger) 11%, transparent); }

.arc-user-menu-item { position: relative; display: flex; width: 100%; height: var(--row); box-sizing: border-box; align-items: center; gap: var(--space-3); margin: 0; padding: 0 12px; border: 0; border-radius: calc(var(--radius-panel) - var(--inset)); background: transparent; color: var(--foreground); font: inherit; font-size: var(--text-sm); text-align: left; cursor: pointer; outline: none; user-select: none; -webkit-tap-highlight-color: transparent; transition: color var(--duration-fast) var(--ease-standard); }
.arc-user-menu-icon { display: inline-grid; width: 16px; flex: none; place-items: center; color: var(--text-secondary); transition: color var(--duration-fast) var(--ease-standard); }
.arc-user-menu-item:focus .arc-user-menu-icon { color: var(--accent-strong); }
.arc-user-menu-itemLabel { position: relative; display: inline-flex; min-width: 0; flex: 1; }
.arc-user-menu-rise { display: inline-block; white-space: nowrap; }
.arc-user-menu-item[data-tone="danger"], .arc-user-menu-item[data-tone="danger"] .arc-user-menu-icon { color: color-mix(in oklch, var(--danger) 58%, var(--text-secondary)); }
.arc-user-menu-item[data-tone="danger"]:focus, .arc-user-menu-item[data-tone="danger"]:focus .arc-user-menu-icon { color: var(--danger); }
@media (hover: none) { .arc-user-menu-item:active { background: var(--surface-muted); } }

.arc-user-menu-keys { display: inline-flex; flex: none; align-items: center; gap: 1px; margin-left: auto; color: var(--text-muted); font-family: var(--font-body); font-size: var(--text-xs); letter-spacing: 0; opacity: .8; font-variant-numeric: tabular-nums; }
.arc-user-menu-key { display: inline-block; min-width: 1.05em; font: inherit; text-align: center; }

.arc-user-menu-row { position: relative; display: flex; height: 44px; align-items: center; gap: var(--space-3); padding: 0 6px 0 12px; }
.arc-user-menu-rowLabel { flex: 1; color: var(--foreground); font-size: var(--text-sm); }
.arc-user-menu-row .arc-user-menu-icon .arc-user-menu-dot { --dot-size: 10px; }
/* The thumb slides under the icons; the group owns the stacking context. */
.arc-user-menu-segments { --segment: 32px; position: relative; isolation: isolate; display: inline-grid; height: 30px; flex: none; grid-auto-columns: var(--segment); grid-auto-flow: column; padding: 2px; border-radius: var(--radius-pill); background: color-mix(in oklch, var(--foreground) 6%, transparent); }
.arc-user-menu-thumb { position: absolute; z-index: -1; top: 2px; bottom: 2px; left: 2px; width: var(--segment); border-radius: var(--radius-pill); background: var(--surface-raised); box-shadow: 0 1px 2px oklch(0% 0 0 / .1), 0 0 0 1px var(--border-subtle); transform: translateX(calc(var(--index) * 100%)); transition: transform var(--duration-spring) var(--ease-spring); }
:global([data-theme="dark"]) .arc-user-menu-thumb { background: color-mix(in oklch, var(--foreground) 20%, var(--surface-raised)); box-shadow: none; }
.arc-user-menu-segment { display: grid; place-items: center; margin: 0; padding: 0; border: 0; border-radius: var(--radius-pill); background: transparent; color: var(--text-muted); cursor: pointer; outline: none; -webkit-tap-highlight-color: transparent; transition: color var(--duration-fast) var(--ease-standard); }
.arc-user-menu-segment .arc-user-menu-dot { --dot-size: 9px; --presence-surface: var(--surface-raised); }
@media (hover: hover) and (pointer: fine) { .arc-user-menu-segment:hover { color: var(--text-secondary); } }
.arc-user-menu-segment[aria-checked="true"] { color: var(--foreground); }

.arc-user-menu-spinner { animation: user-menu-spin .8s linear infinite; }
@keyframes user-menu-spin { to { transform: rotate(360deg); } }

/* Below 640px the same content rises as a bottom sheet with larger rows. */
.arc-user-menu-scrim { position: fixed; inset: 0; z-index: 70; background: oklch(0% 0 0 / .32); -webkit-tap-highlight-color: transparent; }
.arc-user-menu-sheet { --row: 48px; --inset: 10px; position: fixed; top: auto; right: 0; bottom: 0; left: 0; z-index: 71; width: auto; max-width: none; max-height: 88dvh; overflow-y: auto; overscroll-behavior: contain; padding: 8px var(--inset) calc(12px + env(safe-area-inset-bottom)); border-bottom: 0; border-radius: var(--radius-panel) var(--radius-panel) 0 0; }
.arc-user-menu-handle { display: block; width: 36px; height: 5px; margin: 0 auto 10px; border-radius: var(--radius-pill); background: var(--border-strong); cursor: grab; }
.arc-user-menu-sheet .arc-user-menu-header { padding: 4px 8px 12px; }
.arc-user-menu-sheet .arc-user-menu-item, .arc-user-menu-sheet .arc-user-menu-rowLabel { font-size: var(--text-base); }
.arc-user-menu-sheet .arc-user-menu-row { height: 56px; }
.arc-user-menu-sheet .arc-user-menu-segments { --segment: 44px; height: 38px; }
.arc-user-menu-sheet .arc-user-menu-keys { display: none; }

@media (prefers-reduced-motion: reduce) {
  .arc-user-menu-trigger, .arc-user-menu-chevron, .arc-user-menu-dot, .arc-user-menu-dot::before, .arc-user-menu-dot::after, .arc-user-menu-segment, .arc-user-menu-thumb, .arc-user-menu-item, .arc-user-menu-icon { transition: none; }
  .arc-user-menu-spinner { animation-duration: 2.4s; }
}
`;

const styles: Record<string, string> = new Proxy({
  "chevron": "arc-user-menu-chevron",
  "dot": "arc-user-menu-dot",
  "email": "arc-user-menu-email",
  "face": "arc-user-menu-face",
  "handle": "arc-user-menu-handle",
  "header": "arc-user-menu-header",
  "highlight": "arc-user-menu-highlight",
  "icon": "arc-user-menu-icon",
  "identity": "arc-user-menu-identity",
  "initials": "arc-user-menu-initials",
  "item": "arc-user-menu-item",
  "itemLabel": "arc-user-menu-itemLabel",
  "key": "arc-user-menu-key",
  "keys": "arc-user-menu-keys",
  "list": "arc-user-menu-list",
  "name": "arc-user-menu-name",
  "nameRow": "arc-user-menu-nameRow",
  "panel": "arc-user-menu-panel",
  "plan": "arc-user-menu-plan",
  "portrait": "arc-user-menu-portrait",
  "rise": "arc-user-menu-rise",
  "root": "arc-user-menu-root",
  "row": "arc-user-menu-row",
  "rowLabel": "arc-user-menu-rowLabel",
  "scrim": "arc-user-menu-scrim",
  "segment": "arc-user-menu-segment",
  "segments": "arc-user-menu-segments",
  "separator": "arc-user-menu-separator",
  "sheet": "arc-user-menu-sheet",
  "spinner": "arc-user-menu-spinner",
  "thumb": "arc-user-menu-thumb",
  "trigger": "arc-user-menu-trigger",
  "triggerName": "arc-user-menu-triggerName"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-user-menu-${prop}`,
});



export type UserStatus = "available" | "busy" | "away";
export type ThemePreference = "light" | "dark" | "system";

/** Statuses in menu order. Each one has its own dot shape as well as color: solid, barred, or hollow. */
export const userStatuses: { value: UserStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "busy", label: "Busy" },
  { value: "away", label: "Away" },
];

const themes: { value: ThemePreference; label: string; icon: ReactNode }[] = [
  { value: "light", label: "Light", icon: <Sun size={15} strokeWidth={1.75} aria-hidden="true" /> },
  { value: "dark", label: "Dark", icon: <Moon size={15} strokeWidth={1.75} aria-hidden="true" /> },
  { value: "system", label: "System", icon: <Monitor size={15} strokeWidth={1.75} aria-hidden="true" /> },
];

export interface UserMenuUser { name: string; email: string; plan?: string; avatarSrc?: string; avatarSrcSet?: string }
export interface UserMenuItem { label: string; icon?: ReactNode; keys?: string[]; onSelect?: () => void }

/**
 * The account menu behind a person's photo in an app's top bar. It holds a compact identity header, a short group of account
 * destinations, an inline theme switch, and sign out. On screens narrower than 640px it opens as a bottom sheet instead.
 * Theme and status choices keep the menu open; everything else closes it and returns focus to the trigger.
 * When `onSignOut` returns a promise, the item shows its progress and the menu closes once it settles.
 */
export interface UserMenuProps {
  user: UserMenuUser;
  /** Presence status. Passing `status` or `onStatusChange` shows the presence dot and an inline status switch. */
  status?: UserStatus;
  defaultStatus?: UserStatus;
  onStatusChange?: (status: UserStatus) => void;
  theme?: ThemePreference;
  defaultTheme?: ThemePreference;
  /** Reports the choice. Applying it to the page is up to the app. */
  onThemeChange?: (theme: ThemePreference) => void;
  /** Shows the inline light, dark, and system switch. */
  showTheme?: boolean;
  /** Account destinations with optional shortcut hints, such as ["⌘", ","]. Keep it to three or four. */
  items?: UserMenuItem[];
  onSignOut?: () => void | Promise<unknown>;
  signOutKeys?: string[];
  align?: "start" | "center" | "end";
  /** Shows the name and a chevron beside the avatar from 640px up. */
  showName?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Renders the desktop panel in a portal on the body. Pass false to keep it inside the trigger's wrapper. */
  portal?: boolean;
  /** The trigger button, for returning focus after the menu is swapped out. */
  ref?: Ref<HTMLButtonElement>;
  className?: string;
}

type Highlight = { top: number; height: number; tone?: string; glide: boolean };
type OpenReason = "first" | "last" | "pointer" | null;

const compactQuery = "(max-width: 639px)";
const subscribeCompact = (change: () => void) => { const query = window.matchMedia(compactQuery); query.addEventListener("change", change); return () => query.removeEventListener("change", change); };
const subscribeNothing = () => () => {};
const statusLabel = (status: UserStatus) => userStatuses.find(option => option.value === status)?.label ?? status;
const enter = [...motionTokens.ease.enter] as [number, number, number, number];
const standard = [...motionTokens.ease.standard] as [number, number, number, number];
const exitEase = [0.4, 0, 1, 1] as [number, number, number, number];

/** The panel grows out of the trigger on a critically damped spring; rows follow a beat later. Closing is a short fade. */
const panelMotion: Variants = {
  closed: { opacity: 0, scale: .94 },
  open: { opacity: 1, scale: 1, transition: { type: "spring", visualDuration: .3, bounce: 0, opacity: { duration: .14, ease: enter }, delayChildren: .03, staggerChildren: .016 } },
  exit: { opacity: 0, scale: .97, transition: { duration: .12, ease: exitEase } },
};
const sheetMotion: Variants = {
  closed: { y: "100%" },
  open: { y: 0, transition: { ...motionTokens.spring.smooth, visualDuration: .36, delayChildren: .06, staggerChildren: .02 } },
  exit: { y: "100%", transition: { duration: .22, ease: exitEase } },
};
const stillMotion: Variants = { closed: { opacity: 0 }, open: { opacity: 1, transition: { duration: .12 } }, exit: { opacity: 0, transition: { duration: .1 } } };
const rowMotion: Variants = { closed: { opacity: 0, y: 3 }, open: { opacity: 1, y: 0, transition: { duration: .2, ease: enter } } };

/** A presence mark that morphs between statuses: the color crossfades while a hole opens for away and a bar slides in for busy. */
export function PresenceDot({ status, className }: { status: UserStatus | "offline"; className?: string }) {
  return <span className={[styles.dot, className].filter(Boolean).join(" ")} data-status={status} aria-hidden="true" />;
}

function Portrait({ user }: { user: UserMenuUser }) {
  const [failed, setFailed] = useState<string>();
  if (!user.avatarSrc || failed === user.avatarSrc) {
    const initials = user.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join("");
    return <span className={`${styles.portrait} ${styles.initials}`}>{initials}</span>;
  }
  // eslint-disable-next-line @next/next/no-img-element -- registry components stay framework agnostic; pass optimized URLs as avatarSrc and avatarSrcSet.
  return <img className={styles.portrait} src={user.avatarSrc} srcSet={user.avatarSrcSet} alt="" decoding="async" draggable={false} onError={() => setFailed(user.avatarSrc)} />;
}

function Face({ user, status, size }: { user: UserMenuUser; status?: UserStatus; size: "sm" | "md" }) {
  return <span className={styles.face} data-size={size}><Portrait user={user} />{status && <PresenceDot status={status} />}</span>;
}

/** Changing text rises out of a small blur while the old text lifts away. */
function Rise({ text, reduced }: { text: string; reduced: boolean }) {
  return <AnimatePresence mode="popLayout" initial={false}>
    <motion.span key={text} className={styles.rise} initial={reduced ? { opacity: 0 } : { opacity: 0, y: "0.35em", filter: `blur(${motionTokens.blur.subtle}px)` }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: "-0.35em", filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: standard } }}
      transition={reduced ? { duration: 0 } : { duration: motionTokens.duration.standard, ease: enter }}>{text}</motion.span>
  </AnimatePresence>;
}

function Keys({ keys }: { keys: string[] }) {
  return <kbd className={styles.keys} aria-hidden="true">{keys.map((key, index) => <kbd key={`${key}-${index}`} className={styles.key}>{key}</kbd>)}</kbd>;
}

/** A compact inline switch. It is one stop in the menu: up and down pass over it, left and right choose within it. */
function Segmented<T extends string>({ label, icon, value, options, onChange, variants }: { label: string; icon: ReactNode; value: T; options: { value: T; label: string; icon: ReactNode }[]; onChange: (value: T) => void; variants?: Variants }) {
  const index = Math.max(0, options.findIndex(option => option.value === value));
  return <motion.div className={styles.row} data-stop="group" data-label={label} variants={variants}>
    <span className={styles.icon} aria-hidden="true">{icon}</span>
    <span className={styles.rowLabel} aria-hidden="true">{label}</span>
    <div className={styles.segments} role="group" aria-label={label} style={{ "--index": index, "--count": options.length } as CSSProperties}>
      <span className={styles.thumb} aria-hidden="true" />
      {options.map(option => <button key={option.value} type="button" role="menuitemradio" tabIndex={-1} aria-checked={option.value === value} aria-label={option.label} title={option.label}
        className={styles.segment} onClick={() => onChange(option.value)}>{option.icon}</button>)}
    </div>
  </motion.div>;
}

const getStops = (root: HTMLElement | null) => Array.from(root?.querySelectorAll<HTMLElement>("[data-stop]") ?? []);
function focusStop(stop: HTMLElement | undefined) {
  if (!stop) return;
  const target = stop.dataset.stop === "group" ? stop.querySelector<HTMLElement>('[aria-checked="true"]') ?? stop.querySelector<HTMLElement>("button") : stop;
  target?.focus({ preventScroll: true });
}

export function UserMenu({ user, status: statusProp, defaultStatus = "available", onStatusChange, theme: themeProp, defaultTheme = "system", onThemeChange, showTheme = true, items = [], onSignOut, signOutKeys, align = "end", showName = false, open: openProp, defaultOpen = false, onOpenChange, portal = true, ref, className }: UserMenuProps) {
  const id = useId();
  const menuId = `${id}-menu`;
  const triggerId = `${id}-trigger`;
  const reduced = !!useReducedMotion();
  const hydrated = useSyncExternalStore(subscribeNothing, () => true, () => false);
  const compact = useSyncExternalStore(subscribeCompact, () => window.matchMedia(compactQuery).matches, () => false);
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const [innerStatus, setInnerStatus] = useState(defaultStatus);
  const [innerTheme, setInnerTheme] = useState(defaultTheme);
  const [signingOut, setSigningOut] = useState(false);
  const [highlight, setHighlight] = useState<Highlight | null>(null);
  const open = openProp ?? innerOpen;
  const showStatus = statusProp !== undefined || onStatusChange !== undefined;
  const status = statusProp ?? innerStatus;
  const theme = themeProp ?? innerTheme;
  const rootRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const reason = useRef<OpenReason>(null);
  const typed = useRef({ text: "", timer: 0 });
  const mounted = useRef(true);
  const pending = useRef(false);
  const sheet = hydrated && compact;
  const inline = !portal && !sheet;

  useEffect(() => { mounted.current = true; const current = typed.current; return () => { mounted.current = false; window.clearTimeout(current.timer); }; }, []);

  function setTriggerRef(node: HTMLButtonElement | null) {
    triggerRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as { current: HTMLButtonElement | null }).current = node;
  }

  function setOpen(next: boolean, why: OpenReason = null) {
    reason.current = next ? why : null;
    if (next) setSigningOut(pending.current);
    setHighlight(null);
    setInnerOpen(next);
    onOpenChange?.(next);
  }
  function close(returnFocus: boolean) {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus({ preventScroll: true });
  }

  // Focus moves in only when a person opened the menu, so a menu that starts open never steals focus or scrolls the page.
  useEffect(() => {
    if (!open) return;
    const why = reason.current;
    reason.current = null;
    if (!why) return;
    const frame = requestAnimationFrame(() => {
      const stops = getStops(listRef.current);
      if (why === "first") focusStop(stops[0]);
      else if (why === "last") focusStop(stops.at(-1));
      else surfaceRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [open, sheet]);

  // The panel is placed against the trigger and scales from the avatar's center, flipping above when there is no room below.
  useLayoutEffect(() => {
    if (!open || sheet) return;
    const place = () => {
      const panel = surfaceRef.current, trigger = triggerRef.current;
      if (!panel || !trigger) return;
      const rect = trigger.getBoundingClientRect();
      const width = panel.offsetWidth, height = panel.offsetHeight;
      let left: number, top: number;
      if (inline) {
        const root = rootRef.current?.getBoundingClientRect();
        left = (root?.left ?? 0) + panel.offsetLeft;
        top = (root?.top ?? 0) + panel.offsetTop;
      } else {
        const wanted = align === "start" ? rect.left : align === "center" ? rect.left + rect.width / 2 - width / 2 : rect.right - width;
        left = Math.min(Math.max(12, wanted), window.innerWidth - width - 12);
        const below = rect.bottom + 8;
        top = below + height > window.innerHeight - 12 && rect.top - 8 - height > 12 ? rect.top - 8 - height : below;
        panel.style.left = `${left}px`;
        panel.style.top = `${top}px`;
      }
      const faceCenter = rect.left + Math.min(rect.width, 40) / 2;
      const originX = align === "end" && rect.width > 40 ? rect.right - 20 - left : faceCenter - left;
      panel.style.setProperty("--origin-x", `${Math.min(Math.max(0, originX), width)}px`);
      panel.style.setProperty("--origin-y", top < rect.top ? `${height}px` : "0px");
    };
    place();
    if (inline) return;
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => { window.removeEventListener("resize", place); window.removeEventListener("scroll", place, true); };
  }, [open, sheet, inline, align]);

  // Outside presses close the panel. The sheet has its own scrim.
  useEffect(() => {
    if (!open || sheet) return;
    const onPointerDown = (event: globalThis.PointerEvent) => {
      const target = event.target as Node;
      if (surfaceRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      reason.current = null;
      setHighlight(null);
      setInnerOpen(false);
      onOpenChange?.(false);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open, sheet, onOpenChange]);

  // The page behind the sheet stays put.
  useEffect(() => {
    if (!open || !sheet) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => { root.style.overflow = previous; };
  }, [open, sheet]);

  function changeStatus(value: UserStatus) { setInnerStatus(value); onStatusChange?.(value); }
  function changeTheme(value: ThemePreference) { setInnerTheme(value); onThemeChange?.(value); }

  function signOut() {
    if (pending.current) return;
    const result = onSignOut?.();
    if (!result || typeof result.then !== "function") { close(true); return; }
    // Async sign out keeps the menu open with its progress on the item, then closes once it settles.
    pending.current = true;
    setSigningOut(true);
    const done = () => { pending.current = false; if (mounted.current) close(false); };
    result.then(done, done);
  }

  function onListFocus(event: FocusEvent<HTMLDivElement>) {
    const stop = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>("[data-stop]") : null;
    if (!stop) { setHighlight(null); return; }
    setHighlight(current => ({ top: stop.offsetTop, height: stop.offsetHeight, tone: stop.dataset.tone, glide: current !== null }));
  }

  // Focus follows a mouse or pen, so the keyboard carries on from wherever the pointer left the highlight.
  function onItemPointerMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch") return;
    if (document.activeElement !== event.currentTarget) event.currentTarget.focus({ preventScroll: true });
  }
  // The inline switches are not rows, so the pointer over them releases the highlight instead of dragging it along.
  function onListPointerMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch" || !highlight) return;
    const group = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[data-stop="group"]') : null;
    if (!group || group.contains(document.activeElement)) return;
    setHighlight(null);
    surfaceRef.current?.focus({ preventScroll: true });
  }
  function onListPointerLeave(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch") return;
    setHighlight(null);
    surfaceRef.current?.focus({ preventScroll: true });
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const stops = getStops(listRef.current);
    const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const current = active?.closest<HTMLElement>("[data-stop]") ?? null;
    const index = current ? stops.indexOf(current) : -1;
    const step = (to: HTMLElement | undefined) => { event.preventDefault(); focusStop(to); };
    switch (event.key) {
      case "ArrowDown": return step(stops[(index + 1) % stops.length]);
      case "ArrowUp": return step(stops[index <= 0 ? stops.length - 1 : index - 1]);
      case "Home": return step(stops[0]);
      case "End": return step(stops.at(-1));
      case "Escape": case "Tab": event.preventDefault(); return close(true);
      case "ArrowLeft": case "ArrowRight": {
        if (current?.dataset.stop !== "group") return;
        event.preventDefault();
        const segments = Array.from(current.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]'));
        const at = Math.max(0, segments.findIndex(segment => segment.getAttribute("aria-checked") === "true"));
        const next = segments[(at + (event.key === "ArrowRight" ? 1 : -1) + segments.length) % segments.length];
        next?.focus({ preventScroll: true });
        next?.click();
        return;
      }
    }
    if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey || event.key === " ") return;
    // Typeahead: letters jump to the next row whose label starts with what was typed.
    const memory = typed.current;
    window.clearTimeout(memory.timer);
    memory.text += event.key.toLowerCase();
    memory.timer = window.setTimeout(() => { memory.text = ""; }, 500);
    const ordered = [...stops.slice(index + 1), ...stops.slice(0, index + 1)];
    const search = memory.text.length > 1 && current?.dataset.label?.toLowerCase().startsWith(memory.text) ? [current] : ordered;
    const match = search.find(stop => stop.dataset.label?.toLowerCase().startsWith(memory.text));
    if (match) step(match);
  }

  function onTriggerClick(event: MouseEvent<HTMLButtonElement>) {
    if (open) { close(false); return; }
    setOpen(true, event.detail === 0 ? "first" : "pointer");
  }
  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    setOpen(true, event.key === "ArrowDown" ? "first" : "last");
  }

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > 80 || info.velocity.y > 500) close(true);
  }

  const glide: Transition = highlight?.glide && !reduced ? motionTokens.spring.snappy : { duration: 0 };
  const row = reduced ? undefined : rowMotion;
  const menuProps = { id: menuId, role: "menu", "aria-labelledby": triggerId, tabIndex: -1, onKeyDown };

  const content = <>
    <motion.div className={styles.header} variants={row}>
      <Face user={user} status={showStatus ? status : undefined} size="md" />
      <div className={styles.identity}>
        <div className={styles.nameRow}><span className={styles.name}>{user.name}</span>{user.plan && <span className={styles.plan}>{user.plan}</span>}</div>
        <span className={styles.email} title={user.email}>{user.email}</span>
      </div>
    </motion.div>
    <div ref={listRef} className={styles.list} onFocus={onListFocus} onPointerMove={onListPointerMove} onPointerLeave={onListPointerLeave}>
      <motion.span className={styles.highlight} data-tone={highlight?.tone} aria-hidden="true" initial={false}
        animate={highlight ? { y: highlight.top, height: highlight.height, opacity: 1 } : { opacity: 0 }}
        transition={{ default: glide, opacity: { duration: reduced ? 0 : .1 } }} />
      {items.length > 0 && <>
        <div className={styles.separator} role="separator" />
        {items.map(item => <motion.button key={item.label} type="button" role="menuitem" tabIndex={-1} className={styles.item} data-stop="item" data-label={item.label} variants={row}
          onPointerMove={onItemPointerMove} onClick={() => { close(true); item.onSelect?.(); }}>
          <span className={styles.icon} aria-hidden="true">{item.icon}</span>
          <span className={styles.itemLabel}>{item.label}</span>
          {item.keys && <Keys keys={item.keys} />}
        </motion.button>)}
      </>}
      {(showTheme || showStatus) && <>
        <div className={styles.separator} role="separator" />
        {showStatus && <Segmented label="Status" icon={<PresenceDot status={status} />} value={status} onChange={changeStatus}
          options={userStatuses.map(option => ({ ...option, icon: <PresenceDot status={option.value} /> }))} variants={row} />}
        {showTheme && <Segmented label="Theme" icon={<SunMoon size={16} strokeWidth={1.75} />} value={theme} onChange={changeTheme} options={themes} variants={row} />}
      </>}
      <div className={styles.separator} role="separator" />
      <motion.button type="button" role="menuitem" tabIndex={-1} className={styles.item} data-stop="item" data-tone="danger" data-label="Sign out" variants={row}
        aria-busy={signingOut || undefined} onPointerMove={onItemPointerMove} onClick={signOut}>
        <span className={styles.icon} aria-hidden="true">{signingOut ? <LoaderCircle className={styles.spinner} size={16} strokeWidth={1.75} /> : <LogOut size={16} strokeWidth={1.75} />}</span>
        <span className={styles.itemLabel}><Rise text={signingOut ? "Signing out" : "Sign out"} reduced={reduced} /></span>
        {signOutKeys && <Keys keys={signOutKeys} />}
      </motion.button>
    </div>
  </>;

  const panel = <AnimatePresence>
    {open && !sheet && <motion.div key="panel" ref={surfaceRef} {...menuProps} className={styles.panel} data-inline={inline || undefined} data-align={align}
      variants={reduced ? stillMotion : panelMotion} initial="closed" animate="open" exit="exit">
      {content}
    </motion.div>}
  </AnimatePresence>;

  const bottomSheet = <AnimatePresence>
    {open && sheet && <motion.div key="scrim" className={styles.scrim} aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: reduced ? .1 : .2, ease: standard }} onClick={() => close(true)} />}
    {open && sheet && <motion.div key="sheet" ref={surfaceRef} {...menuProps} className={`${styles.panel} ${styles.sheet}`} aria-modal="true"
      variants={reduced ? stillMotion : sheetMotion} initial="closed" animate="open" exit="exit"
      drag={reduced ? false : "y"} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: .04, bottom: .9 }} dragMomentum={false} onDragEnd={onDragEnd}>
      <span className={styles.handle} aria-hidden="true" />
      {content}
    </motion.div>}
  </AnimatePresence>;

  return <span ref={rootRef} className={styles.root}>
    <button ref={setTriggerRef} id={triggerId} type="button" className={[styles.trigger, className].filter(Boolean).join(" ")} data-state={open ? "open" : "closed"} data-name={showName || undefined}
      aria-haspopup="menu" aria-expanded={open} aria-controls={open ? menuId : undefined} aria-label={`Account menu, ${user.name}${showStatus ? `, ${statusLabel(status)}` : ""}`}
      onClick={onTriggerClick} onKeyDown={onTriggerKeyDown}>
      <Face user={user} status={showStatus ? status : undefined} size="sm" />
      {showName && <><span className={styles.triggerName}>{user.name}</span><ChevronDown className={styles.chevron} size={15} strokeWidth={1.75} aria-hidden="true" /></>}
    </button>
    {sheet ? createPortal(bottomSheet, document.body) : inline ? panel : hydrated ? createPortal(panel, document.body) : null}
  </span>;
}

export default UserMenu;
