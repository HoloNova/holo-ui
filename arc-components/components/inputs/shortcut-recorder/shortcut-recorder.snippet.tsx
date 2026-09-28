"use client";

import type { HTMLAttributes, KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import type { Variants } from "motion/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { RotateCcw, Search, X } from "lucide-react";
import { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";

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
const ARC_SHORTCUT_RECORDER_STYLES = `/* ---------------------------------------------- Kbd ---------------------------------------------- */

/* A key cap: a one pixel edge with a slightly heavier bottom, so it reads as a key without a shadow. Held, it drops a pixel and takes the accent. */
.arc-shortcut-recorder-kbd { display: inline-grid; min-width: 26px; height: 26px; box-sizing: border-box; place-items: center; padding: 0 7px 1px; border: 1px solid var(--border-strong); border-bottom-width: 2px; border-radius: 8px; background: var(--surface-raised); color: var(--foreground); font-family: var(--font-body); font-size: var(--text-xs); font-weight: 500; line-height: 1; letter-spacing: 0; font-variant-numeric: tabular-nums; white-space: nowrap; transition: transform var(--duration-spring) var(--ease-spring), border-color var(--duration-fast) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard), border-bottom-width var(--duration-fast) var(--ease-standard); }
.arc-shortcut-recorder-kbd[data-size="sm"] { min-width: 22px; height: 22px; padding: 0 5px 1px; border-radius: 7px; font-size: 11px; }
.arc-shortcut-recorder-kbd[data-pressed] { transform: translateY(1px); border-color: color-mix(in oklch, var(--accent) 55%, var(--border-strong)); border-bottom-width: 1px; background: var(--accent-subtle); color: var(--accent-strong); transition-duration: 90ms; }
.arc-shortcut-recorder-kbd[data-tone="warning"] { border-color: color-mix(in oklch, var(--warning) 55%, var(--border-strong)); background: color-mix(in oklch, var(--warning) 12%, var(--surface-raised)); color: var(--foreground); }
.arc-shortcut-recorder-keys { display: inline-flex; flex: none; align-items: center; gap: 4px; }

/* ---------------------------------------------- Recorder ---------------------------------------------- */

.arc-shortcut-recorder-field { display: grid; min-width: 0; font-family: var(--font-body); letter-spacing: var(--tracking-body); }
.arc-shortcut-recorder-label { justify-self: start; margin-bottom: var(--space-2); color: var(--foreground); font-size: var(--text-sm); font-weight: 500; line-height: var(--leading-body); }

.arc-shortcut-recorder-control { position: relative; display: flex; min-width: 0; height: var(--control-height-md); box-sizing: border-box; align-items: center; border: 1px solid var(--border-strong); border-radius: var(--radius-control); background: var(--surface); transition: border-color var(--duration-fast) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard); }
@media (hover: hover) and (pointer: fine) { .arc-shortcut-recorder-control[data-state="idle"]:hover { border-color: var(--foreground); } }
.arc-shortcut-recorder-control:has(.arc-shortcut-recorder-recorder:focus-visible) { border-color: var(--foreground); }
.arc-shortcut-recorder-control[data-state="recording"] { border-color: var(--accent); background: color-mix(in oklch, var(--accent) 4%, var(--surface)); }
.arc-shortcut-recorder-control[data-state="conflict"] { border-color: var(--warning); }
.arc-shortcut-recorder-field[data-disabled] .arc-shortcut-recorder-control { opacity: .5; background: var(--surface-muted); }

.arc-shortcut-recorder-recorder { display: flex; min-width: 0; height: 100%; flex: 1; align-items: center; padding: 0 6px 0 9px; border: 0; border-radius: var(--radius-control); background: transparent; color: var(--foreground); cursor: pointer; font: inherit; text-align: left; -webkit-tap-highlight-color: transparent; touch-action: manipulation; outline: none; }
.arc-shortcut-recorder-recorder:disabled { cursor: not-allowed; }
.arc-shortcut-recorder-row { position: relative; display: flex; min-width: 0; align-items: center; gap: 4px; }
.arc-shortcut-recorder-chipSlot { display: inline-flex; }
.arc-shortcut-recorder-placeholder { padding-left: 3px; color: var(--text-muted); font-size: var(--text-sm); white-space: nowrap; }
.arc-shortcut-recorder-placeholder[data-recording] { color: var(--text-secondary); }
/* A recording light: steady in reduced motion, a slow breath otherwise. */
.arc-shortcut-recorder-dot { width: 7px; height: 7px; flex: none; margin: 0 6px 0 3px; border-radius: 50%; background: var(--accent); animation: breathe 1.4s var(--ease-in-out) infinite; }
.arc-shortcut-recorder-dot[data-reduced] { animation: none; }
@keyframes breathe { 50% { opacity: .35; } }

.arc-shortcut-recorder-actions { display: flex; flex: none; align-items: center; gap: 2px; padding-right: 4px; }
.arc-shortcut-recorder-action { display: grid; width: 32px; height: 32px; place-items: center; padding: 0; border: 0; border-radius: calc(var(--radius-control) - 5px); background: transparent; color: var(--text-muted); cursor: pointer; -webkit-tap-highlight-color: transparent; transition: background-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard); }
@media (hover: hover) and (pointer: fine) { .arc-shortcut-recorder-action:hover { background: var(--surface-muted); color: var(--foreground); } }
.arc-shortcut-recorder-action:active { background: var(--surface-muted); color: var(--foreground); }

.arc-shortcut-recorder-messageSlot { position: relative; overflow: hidden; }
.arc-shortcut-recorder-message { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 2px var(--space-3); padding-top: var(--space-2); font-size: var(--text-xs); line-height: var(--leading-body); }
.arc-shortcut-recorder-message[data-tone="hint"] { color: var(--text-muted); }
.arc-shortcut-recorder-message[data-tone="warning"] { color: var(--text-secondary); }
.arc-shortcut-recorder-message[data-tone="warning"] .arc-shortcut-recorder-messageText::before { content: ""; display: inline-block; width: 6px; height: 6px; margin: 0 7px 1px 1px; border-radius: 50%; background: var(--warning); vertical-align: middle; }
.arc-shortcut-recorder-strong { color: var(--foreground); font-weight: 500; }
.arc-shortcut-recorder-messageActions { display: inline-flex; gap: var(--space-3); }
.arc-shortcut-recorder-link { padding: 0; border: 0; background: none; color: var(--foreground); cursor: pointer; font: inherit; font-weight: 500; text-decoration: underline; text-decoration-color: var(--border-strong); text-underline-offset: 3px; transition: text-decoration-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard); }
.arc-shortcut-recorder-link[data-quiet] { color: var(--text-muted); font-weight: 400; text-decoration: none; }
@media (hover: hover) and (pointer: fine) { .arc-shortcut-recorder-link:hover { text-decoration-color: currentColor; } .arc-shortcut-recorder-link[data-quiet]:hover { color: var(--foreground); } }

/* ---------------------------------------------- Cheatsheet ---------------------------------------------- */

.arc-shortcut-recorder-list { container-type: inline-size; display: grid; min-width: 0; gap: var(--space-3); font-family: var(--font-body); letter-spacing: var(--tracking-body); }
.arc-shortcut-recorder-searchRow { display: flex; height: var(--control-height-sm); box-sizing: border-box; align-items: center; gap: var(--space-2); padding: 0 6px 0 12px; border: 1px solid var(--border); border-radius: var(--radius-control); background: var(--surface); transition: border-color var(--duration-fast) var(--ease-standard); }
.arc-shortcut-recorder-searchRow:focus-within { border-color: var(--foreground); }
.arc-shortcut-recorder-searchIcon { flex: none; color: var(--text-muted); }
.arc-shortcut-recorder-search { min-width: 0; height: 100%; flex: 1; padding: 0; border: 0; background: transparent; color: var(--foreground); font: inherit; font-size: var(--text-sm); outline: none; -webkit-appearance: none; appearance: none; }
.arc-shortcut-recorder-search::placeholder { color: var(--text-muted); }
.arc-shortcut-recorder-search::-webkit-search-cancel-button { display: none; }
.arc-shortcut-recorder-count { flex: none; color: var(--text-muted); font-size: var(--text-xs); font-variant-numeric: tabular-nums; }
.arc-shortcut-recorder-clear { display: grid; width: 24px; height: 24px; flex: none; place-items: center; padding: 0; border: 0; border-radius: var(--radius-pill); background: color-mix(in oklch, var(--foreground) 8%, transparent); color: var(--text-secondary); cursor: pointer; }

.arc-shortcut-recorder-groups { display: grid; align-items: start; gap: 0 var(--space-6); }
@container (min-width: 520px) { .arc-shortcut-recorder-groups { grid-template-columns: 1fr 1fr; } }
.arc-shortcut-recorder-group { overflow: hidden; margin-inline: -8px; padding-inline: 8px; }
.arc-shortcut-recorder-groupLabel { margin: 0; padding: var(--space-3) 0 var(--space-1); color: var(--text-muted); font-size: var(--text-xs); font-weight: 400; }
.arc-shortcut-recorder-rows { display: grid; margin: 0; padding: 0; list-style: none; }
.arc-shortcut-recorder-item { overflow: hidden; margin-inline: -8px; }
/* Rows fade when a held modifier is not in them, and light when their whole combination is down. */
.arc-shortcut-recorder-itemInner { display: flex; min-height: 36px; align-items: center; justify-content: space-between; gap: var(--space-3); padding: 0 8px; border-radius: 10px; transition: opacity var(--duration-standard) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard); }
.arc-shortcut-recorder-item + .arc-shortcut-recorder-item .arc-shortcut-recorder-itemInner { box-shadow: inset 0 1px 0 var(--border-subtle); }
.arc-shortcut-recorder-item[data-dim] .arc-shortcut-recorder-itemInner { opacity: .38; }
.arc-shortcut-recorder-item[data-match] .arc-shortcut-recorder-itemInner { background: var(--accent-subtle); box-shadow: none; }
.arc-shortcut-recorder-item[data-match] + .arc-shortcut-recorder-item .arc-shortcut-recorder-itemInner { box-shadow: none; }
.arc-shortcut-recorder-itemLabel { min-width: 0; overflow: hidden; color: var(--text-secondary); font-size: var(--text-sm); text-overflow: ellipsis; white-space: nowrap; transition: color var(--duration-fast) var(--ease-standard); }
.arc-shortcut-recorder-item[data-match] .arc-shortcut-recorder-itemLabel { color: var(--foreground); }
.arc-shortcut-recorder-empty { margin: 0; padding: var(--space-4) 0; color: var(--text-muted); font-size: var(--text-sm); }

.arc-shortcut-recorder-srOnly { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap; }

@media (prefers-reduced-motion: reduce) {
  .arc-shortcut-recorder-kbd, .arc-shortcut-recorder-control, .arc-shortcut-recorder-itemInner { transition-duration: 0ms; }
  .arc-shortcut-recorder-kbd[data-pressed] { transform: none; }
  .arc-shortcut-recorder-dot { animation: none; }
}
`;

const styles: Record<string, string> = new Proxy({
  "action": "arc-shortcut-recorder-action",
  "actions": "arc-shortcut-recorder-actions",
  "chipSlot": "arc-shortcut-recorder-chipSlot",
  "clear": "arc-shortcut-recorder-clear",
  "control": "arc-shortcut-recorder-control",
  "count": "arc-shortcut-recorder-count",
  "dot": "arc-shortcut-recorder-dot",
  "empty": "arc-shortcut-recorder-empty",
  "field": "arc-shortcut-recorder-field",
  "group": "arc-shortcut-recorder-group",
  "groupLabel": "arc-shortcut-recorder-groupLabel",
  "groups": "arc-shortcut-recorder-groups",
  "item": "arc-shortcut-recorder-item",
  "itemInner": "arc-shortcut-recorder-itemInner",
  "itemLabel": "arc-shortcut-recorder-itemLabel",
  "kbd": "arc-shortcut-recorder-kbd",
  "keys": "arc-shortcut-recorder-keys",
  "label": "arc-shortcut-recorder-label",
  "link": "arc-shortcut-recorder-link",
  "list": "arc-shortcut-recorder-list",
  "message": "arc-shortcut-recorder-message",
  "messageActions": "arc-shortcut-recorder-messageActions",
  "messageSlot": "arc-shortcut-recorder-messageSlot",
  "messageText": "arc-shortcut-recorder-messageText",
  "placeholder": "arc-shortcut-recorder-placeholder",
  "recorder": "arc-shortcut-recorder-recorder",
  "row": "arc-shortcut-recorder-row",
  "rows": "arc-shortcut-recorder-rows",
  "search": "arc-shortcut-recorder-search",
  "searchIcon": "arc-shortcut-recorder-searchIcon",
  "searchRow": "arc-shortcut-recorder-searchRow",
  "srOnly": "arc-shortcut-recorder-srOnly",
  "strong": "arc-shortcut-recorder-strong"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-shortcut-recorder-${prop}`,
});



/* ================================================================================================
 * Shortcut model. A shortcut is a string such as "mod+shift+k". `mod` is ⌘ on Apple platforms and
 * Ctrl elsewhere, so one binding reads right everywhere. Keys come from the physical key where it
 * matters, so ⌥K records as "alt+k" instead of "˚".
 * ============================================================================================== */

export type Platform = "mac" | "other";
export interface ShortcutToken { /** What the key cap shows. */ label: string; /** Physical key id, matched against held keys. */ id: string; spoken: string }

const MODIFIER_ORDER = ["mod", "ctrl", "alt", "shift", "meta"] as const;
type Modifier = (typeof MODIFIER_ORDER)[number];
const isModifier = (part: string): part is Modifier => (MODIFIER_ORDER as readonly string[]).includes(part);

const CODE_KEYS: Record<string, string> = {
  Comma: ",", Period: ".", Slash: "/", Semicolon: ";", Quote: "'", BracketLeft: "[", BracketRight: "]", Backslash: "\\", Minus: "-", Equal: "=", Backquote: "`",
  Space: "space", Enter: "enter", NumpadEnter: "enter", Escape: "escape", Backspace: "backspace", Delete: "delete", Tab: "tab",
  ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", Home: "home", End: "end", PageUp: "pageup", PageDown: "pagedown",
};
const MODIFIER_KEYS: Record<string, string> = { Meta: "meta", OS: "meta", Control: "ctrl", Alt: "alt", AltGraph: "alt", Shift: "shift" };

/** The physical key id for an event: "k", "1", "enter", "meta", "shift"… `null` for keys that never make a shortcut, such as Caps Lock. */
export function keyId(event: Pick<KeyboardEvent, "key" | "code">): string | null {
  const { code, key } = event;
  if (MODIFIER_KEYS[key]) return MODIFIER_KEYS[key];
  if (/^Key[A-Z]$/.test(code)) return code.slice(3).toLowerCase();
  if (/^Digit\d$/.test(code)) return code.slice(5);
  if (/^Numpad\d$/.test(code)) return code.slice(6);
  if (CODE_KEYS[code]) return CODE_KEYS[code];
  if (/^F\d{1,2}$/.test(key)) return key.toLowerCase();
  if (key === "CapsLock" || key === "Fn" || key === "Dead" || key === "Unidentified" || key === "Process") return null;
  return key.length === 1 ? key.toLowerCase() : null;
}

function splitShortcut(shortcut: string) {
  const parts = shortcut.toLowerCase().split("+").map(part => part.trim()).filter(Boolean);
  const key = parts.filter(part => !isModifier(part)).pop() ?? "";
  return { mods: new Set(parts.filter(isModifier)), key };
}

/** One spelling per combination: on a Mac, Command is `mod`; elsewhere, Ctrl is. Modifiers come in a fixed order. */
export function normalizeShortcut(shortcut: string, platform: Platform) {
  const { mods, key } = splitShortcut(shortcut);
  if (platform === "mac" && mods.delete("meta")) mods.add("mod");
  if (platform === "other" && mods.delete("ctrl")) mods.add("mod");
  return [...MODIFIER_ORDER.filter(mod => mods.has(mod)), key].filter(Boolean).join("+");
}

/** Reads a keydown into a shortcut string, or `null` while only modifiers are down. */
export function shortcutFromEvent(event: Pick<KeyboardEvent, "key" | "code" | "metaKey" | "ctrlKey" | "altKey" | "shiftKey">, platform: Platform) {
  const key = keyId(event);
  if (!key || ["meta", "ctrl", "alt", "shift"].includes(key)) return null;
  const mods: string[] = [];
  if (platform === "mac" ? event.metaKey : event.ctrlKey) mods.push("mod");
  if (platform === "mac" ? event.ctrlKey : false) mods.push("ctrl");
  if (event.altKey) mods.push("alt");
  if (event.shiftKey) mods.push("shift");
  if (platform === "other" && event.metaKey) mods.push("meta");
  return normalizeShortcut([...mods, key].join("+"), platform);
}

/** True when a keydown is this shortcut. Use it to run the action a recorded shortcut is bound to. */
export function matchesShortcut(event: Pick<KeyboardEvent, "key" | "code" | "metaKey" | "ctrlKey" | "altKey" | "shiftKey">, shortcut: string, platform: Platform) {
  const pressed = shortcutFromEvent(event, platform);
  return !!pressed && pressed === normalizeShortcut(shortcut, platform);
}

const MAC_KEYS: Record<string, [string, string]> = { enter: ["↩", "Return"], backspace: ["⌫", "Delete"], delete: ["⌦", "Forward delete"], tab: ["⇥", "Tab"], escape: ["esc", "Escape"] };
const SHARED_KEYS: Record<string, [string, string]> = {
  space: ["Space", "Space"], enter: ["Enter", "Enter"], escape: ["Esc", "Escape"], backspace: ["Backspace", "Backspace"], delete: ["Del", "Delete"], tab: ["Tab", "Tab"],
  up: ["↑", "Up arrow"], down: ["↓", "Down arrow"], left: ["←", "Left arrow"], right: ["→", "Right arrow"], home: ["Home", "Home"], end: ["End", "End"], pageup: ["PgUp", "Page up"], pagedown: ["PgDn", "Page down"],
  ",": [",", "Comma"], ".": [".", "Period"], "/": ["/", "Slash"], ";": [";", "Semicolon"], "'": ["'", "Quote"], "[": ["[", "Left bracket"], "]": ["]", "Right bracket"], "\\": ["\\", "Backslash"], "-": ["-", "Minus"], "=": ["=", "Equals"], "`": ["`", "Backtick"],
};

/** Key caps for a shortcut in platform order: ⌃ ⌥ ⇧ ⌘ on a Mac, Ctrl Alt Shift Win elsewhere. */
export function shortcutTokens(shortcut: string, platform: Platform): ShortcutToken[] {
  const { mods, key } = splitShortcut(normalizeShortcut(shortcut, platform));
  const tokens: ShortcutToken[] = [];
  if (platform === "mac") {
    if (mods.has("ctrl")) tokens.push({ label: "⌃", id: "ctrl", spoken: "Control" });
    if (mods.has("alt")) tokens.push({ label: "⌥", id: "alt", spoken: "Option" });
    if (mods.has("shift")) tokens.push({ label: "⇧", id: "shift", spoken: "Shift" });
    if (mods.has("mod") || mods.has("meta")) tokens.push({ label: "⌘", id: "meta", spoken: "Command" });
  } else {
    if (mods.has("mod") || mods.has("ctrl")) tokens.push({ label: "Ctrl", id: "ctrl", spoken: "Control" });
    if (mods.has("alt")) tokens.push({ label: "Alt", id: "alt", spoken: "Alt" });
    if (mods.has("shift")) tokens.push({ label: "Shift", id: "shift", spoken: "Shift" });
    if (mods.has("meta")) tokens.push({ label: "Win", id: "meta", spoken: "Windows" });
  }
  if (key) {
    const named = (platform === "mac" ? MAC_KEYS[key] : undefined) ?? SHARED_KEYS[key];
    tokens.push(named ? { label: named[0], id: key, spoken: named[1] } : { label: key.toUpperCase(), id: key, spoken: key.toUpperCase() });
  }
  return tokens;
}

/** "⌘⇧K" on a Mac, "Ctrl+Shift+K" elsewhere, plus a spoken form for assistive technology. */
export function formatShortcut(shortcut: string, platform: Platform) {
  const tokens = shortcutTokens(shortcut, platform);
  return { text: tokens.map(token => token.label).join(platform === "mac" ? "" : "+"), spoken: tokens.map(token => token.spoken).join(" ") };
}

const subscribe = () => () => {};
/** Reduced motion that only applies after hydration, so server and client render the same styles. */
function useReducedFlag() {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  return !!useReducedMotion() && hydrated;
}
const detectPlatform = (): Platform => {
  if (typeof navigator === "undefined") return "mac";
  const hint = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ?? navigator.platform ?? navigator.userAgent;
  return /mac|iphone|ipad|ipod/i.test(hint) ? "mac" : "other";
};
/** The viewer's platform. Server renders assume a Mac and settle on the first client render. */
export function usePlatform(override?: Platform): Platform {
  const detected = useSyncExternalStore(subscribe, detectPlatform, () => "mac" as Platform);
  return override ?? detected;
}

/** Keys held down right now, by physical id. Clears on window blur, and after Command lifts (macOS drops the other keyups). */
export function usePressedKeys(enabled = true) {
  const [held, setHeld] = useState<ReadonlySet<string>>(() => new Set());
  useEffect(() => {
    if (!enabled) return;
    const update = (change: (next: Set<string>) => void) => setHeld(current => { const next = new Set(current); change(next); return next.size === current.size && [...next].every(key => current.has(key)) ? current : next; });
    const down = (event: KeyboardEvent) => { const id = keyId(event); if (id) update(next => next.add(id)); };
    const up = (event: KeyboardEvent) => {
      const id = keyId(event);
      update(next => {
        if (id) next.delete(id);
        if (id === "meta") [...next].forEach(key => { if (!["ctrl", "alt", "shift"].includes(key)) next.delete(key); });
        if (!event.metaKey) next.delete("meta"); if (!event.ctrlKey) next.delete("ctrl"); if (!event.altKey) next.delete("alt"); if (!event.shiftKey) next.delete("shift");
      });
    };
    const clear = () => setHeld(current => current.size ? new Set() : current);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    document.addEventListener("visibilitychange", clear);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); window.removeEventListener("blur", clear); document.removeEventListener("visibilitychange", clear); };
  }, [enabled]);
  return enabled ? held : EMPTY;
}
const EMPTY: ReadonlySet<string> = new Set();

/* ================================================================================================
 * Kbd and ShortcutKeys
 * ============================================================================================== */

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  /** Draws the key pushed down and lit, such as while it is held. */
  pressed?: boolean;
  size?: "sm" | "md";
}

/** A key cap. Use it inline in copy, in menus, or through `ShortcutKeys` for a whole combination. */
export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd({ children, pressed = false, size = "md", className, ...props }, ref) {
  return <kbd ref={ref} {...props} className={[styles.kbd, className].filter(Boolean).join(" ")} data-size={size} data-pressed={pressed || undefined}>{children}</kbd>;
});
Kbd.displayName = "Kbd";

export interface ShortcutKeysProps {
  shortcut: string;
  platform?: Platform;
  /** Held key ids from `usePressedKeys`; matching caps light up. */
  pressed?: ReadonlySet<string>;
  size?: "sm" | "md";
  className?: string;
}

/** A shortcut as key caps, with a spoken label for assistive technology. */
export function ShortcutKeys({ shortcut, platform: platformProp, pressed, size = "md", className }: ShortcutKeysProps) {
  const platform = usePlatform(platformProp);
  const tokens = shortcutTokens(shortcut, platform);
  return <span className={[styles.keys, className].filter(Boolean).join(" ")} role="img" aria-label={tokens.map(token => token.spoken).join(" ")}>
    {tokens.map((token, index) => <Kbd key={`${index}-${token.id}`} size={size} pressed={pressed?.has(token.id)} aria-hidden="true">{token.label}</Kbd>)}
  </span>;
}

/* ================================================================================================
 * ShortcutRecorder
 * ============================================================================================== */

export interface ShortcutBinding { shortcut: string; label: string }

export interface ShortcutRecorderProps {
  label: string;
  hideLabel?: boolean;
  value?: string | null;
  defaultValue?: string | null;
  /** `replaced` is the binding the new shortcut was taken from after "Use anyway", so the caller can unbind it. */
  onValueChange?: (value: string | null, details: { replaced?: ShortcutBinding }) => void;
  /** What the reset button restores. Defaults to `defaultValue`. */
  resetValue?: string | null;
  /** Shortcuts already in use. Recording one of them asks before taking it. */
  bindings?: ShortcutBinding[];
  /** Also warn about combinations the browser or system keeps, such as ⌘W and ⌘C. On by default. */
  warnReserved?: boolean;
  /** Require ⌘, Ctrl, or ⌥ (function keys are always allowed). On by default. */
  requireModifier?: boolean;
  platform?: Platform;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

const RESERVED: ShortcutBinding[] = [
  { shortcut: "mod+w", label: "Close tab" }, { shortcut: "mod+t", label: "New tab" }, { shortcut: "mod+n", label: "New window" }, { shortcut: "mod+q", label: "Quit" },
  { shortcut: "mod+l", label: "Address bar" }, { shortcut: "mod+r", label: "Reload" }, { shortcut: "mod+shift+t", label: "Reopen tab" },
  { shortcut: "mod+c", label: "Copy" }, { shortcut: "mod+v", label: "Paste" }, { shortcut: "mod+x", label: "Cut" }, { shortcut: "mod+z", label: "Undo" }, { shortcut: "mod+a", label: "Select all" },
];

type Pending = { shortcut: string; conflict: ShortcutBinding; reserved: boolean };

const chip: Variants = {
  enter: { opacity: 0, scale: .72, y: 4, filter: `blur(${motionTokens.blur.subtle}px)` },
  rest: (index: number) => ({ opacity: 1, scale: 1, y: 0, filter: "blur(0px)", transition: { ...motionTokens.spring.snappy, delay: index * motionTokens.stagger.item, opacity: { duration: .14, delay: index * motionTokens.stagger.item }, filter: { duration: .16, delay: index * motionTokens.stagger.item } } }),
  exit: { opacity: 0, scale: .8, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: .1 } },
};
const chipFade: Variants = { enter: { opacity: 0 }, rest: { opacity: 1, scale: 1, y: 0, filter: "none", transition: { duration: .1 } }, exit: { opacity: 0, transition: { duration: .06 } } };

/**
 * A field that records a keyboard shortcut. Press it, then press the combination: held modifiers light up as caps while you
 * build the chord, the finished shortcut settles into place, and a combination that is already taken asks before it is used.
 * Escape cancels, Backspace clears, and the reset button restores the default. Caps follow the platform: ⌘ on a Mac, Ctrl elsewhere.
 */
export function ShortcutRecorder({
  label, hideLabel = false, value, defaultValue = null, onValueChange, resetValue, bindings = [], warnReserved = true, requireModifier = true,
  platform: platformProp, placeholder = "Record shortcut", description, disabled = false, id, className,
}: ShortcutRecorderProps) {
  const reduced = useReducedFlag();
  const platform = usePlatform(platformProp);
  const uid = useId();
  const buttonId = id ?? `${uid}-button`;
  const labelId = `${uid}-label`, messageId = `${uid}-message`;

  const [inner, setInner] = useState<string | null>(defaultValue);
  const current = value !== undefined ? value : inner;
  const restoreTo = resetValue !== undefined ? resetValue : defaultValue;

  const [recording, setRecording] = useState(false);
  const [live, setLive] = useState<string[]>([]);
  const [pending, setPending] = useState<Pending | null>(null);
  const [nudge, setNudge] = useState<string | null>(null);
  const [settled, setSettled] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const buttonRef = useRef<HTMLButtonElement>(null);

  const spoken = (shortcut: string | null) => shortcut ? formatShortcut(shortcut, platform).spoken : "none";

  const commit = useCallback((next: string | null, replaced?: ShortcutBinding) => {
    setPending(null);
    setNudge(null);
    if (value === undefined) setInner(next);
    onValueChange?.(next, { replaced });
    setSettled(count => count + 1);
    setAnnouncement(next ? `Shortcut set to ${formatShortcut(next, platform).spoken}` : "Shortcut cleared");
  }, [onValueChange, platform, value]);

  const start = () => {
    if (disabled) return;
    setPending(null); setNudge(null); setLive([]);
    setRecording(true);
    setAnnouncement("Recording. Press the new shortcut, or Escape to cancel.");
  };
  const stop = () => { setRecording(false); setLive([]); };

  const conflictFor = (shortcut: string): Pending | null => {
    const normal = normalizeShortcut(shortcut, platform);
    if (current && normalizeShortcut(current, platform) === normal) return null;
    const taken = bindings.find(binding => normalizeShortcut(binding.shortcut, platform) === normal);
    if (taken) return { shortcut, conflict: taken, reserved: false };
    const reserved = warnReserved ? RESERVED.find(binding => normalizeShortcut(binding.shortcut, platform) === normal) : undefined;
    return reserved ? { shortcut, conflict: reserved, reserved: true } : null;
  };

  const liveMods = (event: ReactKeyboardEvent) => {
    const mods: string[] = [];
    if (event.ctrlKey && platform === "mac") mods.push("ctrl");
    if (event.altKey) mods.push("alt");
    if (event.shiftKey) mods.push("shift");
    if (platform === "mac" ? event.metaKey : event.ctrlKey) mods.push("mod");
    if (platform === "other" && event.metaKey) mods.push("meta");
    return mods;
  };

  function onKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (!recording) {
      if ((event.key === "Backspace" || event.key === "Delete") && current) { event.preventDefault(); commit(null); }
      return;
    }
    if (event.key === "Tab" && !event.shiftKey && !event.metaKey && !event.ctrlKey && !event.altKey) { stop(); return; }
    event.preventDefault();
    const bare = !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey;
    if (bare && event.key === "Escape") { stop(); setAnnouncement("Recording canceled"); return; }
    if (bare && (event.key === "Backspace" || event.key === "Delete")) { stop(); commit(null); return; }
    const shortcut = shortcutFromEvent(event.nativeEvent, platform);
    if (!shortcut) { setLive(liveMods(event)); return; }
    const { mods, key } = splitShortcut(shortcut);
    const strong = mods.has("mod") || mods.has("ctrl") || mods.has("alt") || mods.has("meta");
    if (requireModifier && !strong && !/^f\d+$/.test(key)) {
      const hint = platform === "mac" ? "Include ⌘, ⌃, or ⌥" : "Include Ctrl or Alt";
      setNudge(hint); setAnnouncement(hint); setLive(liveMods(event));
      return;
    }
    stop();
    const conflict = conflictFor(shortcut);
    if (conflict) {
      setPending(conflict);
      setAnnouncement(`${formatShortcut(shortcut, platform).spoken} is ${conflict.reserved ? "reserved for" : "used by"} ${conflict.conflict.label}. Use anyway, or record another.`);
      return;
    }
    commit(shortcut);
  }
  function onKeyUp(event: ReactKeyboardEvent<HTMLButtonElement>) { if (recording) setLive(liveMods(event)); }

  const shown = pending?.shortcut ?? current;
  const tokens = recording ? shortcutTokens(live.join("+"), platform) : shown ? shortcutTokens(shown, platform) : [];
  const state = recording ? "recording" : pending ? "conflict" : "idle";
  const canReset = !recording && (pending !== null || (current ?? null) !== (restoreTo ?? null));
  const canClear = !recording && !!current && !pending;
  const message = pending
    ? { tone: "warning" as const, key: `c-${pending.shortcut}`, body: <>{pending.reserved ? "Reserved for" : "Already used by"} <strong className={styles.strong}>{pending.conflict.label}</strong></> }
    : nudge ? { tone: "hint" as const, key: `n-${nudge}`, body: <>{nudge}</> }
    : recording ? { tone: "hint" as const, key: "rec", body: <>Esc to cancel, Backspace to clear</> }
    : description ? { tone: "hint" as const, key: "d", body: <>{description}</> } : null;

  useEffect(() => {
    if (!settled) return;
    const timer = window.setTimeout(() => setSettled(0), 700);
    return () => window.clearTimeout(timer);
  }, [settled]);

  return <div className={[styles.field, className].filter(Boolean).join(" ")} data-disabled={disabled || undefined}>
    <span id={labelId} className={hideLabel ? styles.srOnly : styles.label}>{label}</span>
    <div className={styles.control} data-state={state}>
      <button ref={buttonRef} id={buttonId} type="button" className={styles.recorder} disabled={disabled} aria-labelledby={`${labelId} ${buttonId}`} aria-describedby={message ? messageId : undefined}
        aria-pressed={recording}
        onClick={event => { if (recording) { if (event.detail !== 0) { stop(); setAnnouncement("Recording canceled"); } return; } start(); }}
        onKeyDown={onKeyDown} onKeyUp={onKeyUp} onBlur={() => { if (recording) { stop(); setNudge(null); } }}>
        <span className={styles.srOnly}>{recording ? "Recording" : shown ? spoken(shown) : placeholder}</span>
        <span className={styles.row} aria-hidden="true">
          {recording && <span className={styles.dot} data-reduced={reduced || undefined} />}
          <AnimatePresence initial={false} mode="popLayout">
            {tokens.map((token, index) => <motion.span key={`${token.id}`} layout={reduced ? false : "position"} custom={recording ? 0 : index} variants={reduced ? chipFade : chip} initial="enter" animate="rest" exit="exit"
              transition={reduced ? { duration: 0 } : { layout: motionTokens.spring.snappy }} className={styles.chipSlot}>
              <Kbd pressed={recording || (settled > 0 && !pending)} data-tone={pending ? "warning" : undefined}>{token.label}</Kbd>
            </motion.span>)}
            {tokens.length === 0 && <motion.span key={recording ? "prompt" : "placeholder"} className={styles.placeholder} data-recording={recording || undefined}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 4, filter: `blur(${motionTokens.blur.subtle}px)` }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, transition: { duration: .08 } }} transition={reduced ? { duration: .1 } : { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] }}>
              {recording ? "Press keys" : placeholder}
            </motion.span>}
          </AnimatePresence>
        </span>
      </button>

      <span className={styles.actions}>
        <AnimatePresence initial={false}>
          {canReset && <motion.button key="reset" type="button" className={styles.action} aria-label={`Reset to ${restoreTo ? formatShortcut(restoreTo, platform).spoken : "none"}`}
            onClick={() => { commit(restoreTo ?? null); buttonRef.current?.focus(); }}
            initial={{ opacity: 0, scale: .6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .6, transition: { duration: .1 } }} transition={reduced ? { duration: 0 } : motionTokens.spring.snappy}>
            <RotateCcw size={15} strokeWidth={1.75} aria-hidden="true" />
          </motion.button>}
          {canClear && <motion.button key="clear" type="button" className={styles.action} aria-label="Clear shortcut" onClick={() => { commit(null); buttonRef.current?.focus(); }}
            initial={{ opacity: 0, scale: .6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .6, transition: { duration: .1 } }} transition={reduced ? { duration: 0 } : motionTokens.spring.snappy}>
            <X size={15} strokeWidth={1.75} aria-hidden="true" />
          </motion.button>}
        </AnimatePresence>
      </span>
    </div>

    <AnimatePresence initial={false}>
      {message && <motion.div key="slot" className={styles.messageSlot} initial={reduced ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0, transition: reduced ? { duration: 0 } : { height: motionTokens.spring.smooth, opacity: { duration: .1 } } }}
        transition={reduced ? { duration: 0 } : { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast } }}>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div key={message.key} id={messageId} className={styles.message} data-tone={message.tone}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: "0.35em", filter: `blur(${motionTokens.blur.soft}px)` }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, transition: { duration: .08 } }} transition={{ duration: reduced ? .1 : motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }}>
            <span className={styles.messageText}>{message.body}</span>
            {pending && <span className={styles.messageActions}>
              <button type="button" className={styles.link} onClick={() => { const taken = pending; commit(taken.shortcut, taken.reserved ? undefined : taken.conflict); buttonRef.current?.focus(); }}>Use anyway</button>
              <button type="button" className={styles.link} data-quiet="" onClick={() => { setPending(null); setAnnouncement("Kept the previous shortcut"); buttonRef.current?.focus(); }}>Cancel</button>
            </span>}
          </motion.div>
        </AnimatePresence>
      </motion.div>}
    </AnimatePresence>
    <span className={styles.srOnly} role="status" aria-live="polite">{announcement}</span>
  </div>;
}

/* ================================================================================================
 * ShortcutList
 * ============================================================================================== */

export interface ShortcutListItem { label: string; shortcut: string; /** Extra words that match when searching. */ keywords?: string }
export interface ShortcutListGroup { label: string; items: ShortcutListItem[] }

export interface ShortcutListProps {
  groups: ShortcutListGroup[];
  /** Accessible name of the list. */
  label?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Light up caps as keys are held, and fade rows that do not use the held modifiers. On by default. */
  highlightPressed?: boolean;
  platform?: Platform;
  className?: string;
}

/**
 * A searchable, grouped cheatsheet. Holding a modifier lights that cap in every row and fades rows that do not use it, so people
 * can explore by holding keys; a row whose whole combination is down lights up. Search matches names, groups, and key names such as "cmd k".
 */
export function ShortcutList({ groups, label = "Keyboard shortcuts", searchable = true, searchPlaceholder = "Search shortcuts", highlightPressed = true, platform: platformProp, className }: ShortcutListProps) {
  const reduced = useReducedFlag();
  const platform = usePlatform(platformProp);
  const held = usePressedKeys(highlightPressed);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const heldMods = useMemo(() => [...held].filter(key => ["meta", "ctrl", "alt", "shift"].includes(key)), [held]);
  const words = query.trim().toLowerCase().replace(/[⌘]/g, " cmd ").replace(/[⇧]/g, " shift ").replace(/[⌥]/g, " alt ").replace(/[⌃]/g, " ctrl ").split(/[\s+]+/).filter(Boolean);
  const aliases: Record<string, string> = { cmd: "command", command: "command", ctrl: "control", control: "control", opt: "option", option: platform === "mac" ? "option" : "alt", alt: platform === "mac" ? "option" : "alt", win: "windows", esc: "escape", return: platform === "mac" ? "return" : "enter" };

  const filtered = groups.map(group => ({
    ...group,
    items: group.items.filter(item => {
      if (!words.length) return true;
      const tokens = shortcutTokens(item.shortcut, platform);
      const haystack = `${item.label} ${group.label} ${item.keywords ?? ""} ${tokens.map(token => `${token.spoken} ${token.label}`).join(" ")}`.toLowerCase();
      return words.every(word => haystack.includes(aliases[word] ?? word) || haystack.includes(word));
    }),
  })).filter(group => group.items.length);

  const total = filtered.reduce((sum, group) => sum + group.items.length, 0);
  const rowTransition = reduced ? { duration: 0 } : motionTokens.spring.smooth;

  return <section className={[styles.list, className].filter(Boolean).join(" ")} aria-label={label}>
    {searchable && <div className={styles.searchRow}>
      <Search className={styles.searchIcon} size={16} strokeWidth={1.75} aria-hidden="true" />
      <input ref={searchRef} className={styles.search} type="search" placeholder={searchPlaceholder} value={query} aria-label={searchPlaceholder} onChange={event => setQuery(event.target.value)}
        onKeyDown={event => { if (event.key === "Escape" && query) { event.preventDefault(); setQuery(""); } }} autoComplete="off" spellCheck={false} />
      <span className={styles.count} aria-live="polite">{query ? `${total} ${total === 1 ? "match" : "matches"}` : ""}</span>
      <AnimatePresence initial={false}>
        {query && <motion.button key="clear" type="button" className={styles.clear} aria-label="Clear search" onClick={() => { setQuery(""); searchRef.current?.focus(); }}
          initial={{ opacity: 0, scale: .6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .6, transition: { duration: .1 } }} transition={reduced ? { duration: 0 } : motionTokens.spring.snappy}>
          <X size={14} strokeWidth={1.75} aria-hidden="true" />
        </motion.button>}
      </AnimatePresence>
    </div>}

    <div className={styles.groups}>
      <AnimatePresence initial={false}>
        {filtered.map(group => <motion.section key={group.label} className={styles.group} aria-label={group.label}
          initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }} transition={rowTransition}>
          <h4 className={styles.groupLabel}>{group.label}</h4>
          <ul className={styles.rows}>
            <AnimatePresence initial={false}>
              {group.items.map(item => {
                const tokens = shortcutTokens(item.shortcut, platform);
                const ids = tokens.map(token => token.id);
                const match = held.size > 0 && ids.every(key => held.has(key));
                const dim = heldMods.length > 0 && !match && !heldMods.every(mod => ids.includes(mod));
                return <motion.li key={item.label} className={styles.item} data-match={match || undefined} data-dim={dim || undefined}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }} transition={rowTransition}>
                  <span className={styles.itemInner}>
                    <span className={styles.itemLabel}>{item.label}</span>
                    <ShortcutKeys shortcut={item.shortcut} platform={platform} pressed={held} size="sm" />
                  </span>
                </motion.li>;
              })}
            </AnimatePresence>
          </ul>
        </motion.section>)}
      </AnimatePresence>
      {total === 0 && <p className={styles.empty}>No shortcuts match “{query.trim()}”</p>}
    </div>
  </section>;
}

export default ShortcutRecorder;
