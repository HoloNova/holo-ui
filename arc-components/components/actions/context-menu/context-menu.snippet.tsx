"use client";

import type { CSSProperties, FocusEvent, KeyboardEvent, ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Copy, MoreHorizontal, Trash2 } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

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
const ARC_CONTEXT_MENU_STYLES = `.arc-context-menu-target { display: block; outline: none; }
.arc-context-menu-target:focus-visible { border-radius: var(--radius-control); outline: 3px solid var(--focus-ring); outline-offset: 4px; }
/* Motion scales the menu from the pointer (transform-origin is set inline) and fades it out faster than it arrives. */
.arc-context-menu-menu { position: fixed; z-index: 100; min-width: min(13rem, calc(100vw - 16px)); max-width: calc(100vw - 16px); max-height: min(300px, calc(100vh - 16px)); overflow-y: auto; padding: 5px; border: 1px solid var(--border); border-radius: var(--radius-panel); background: var(--surface-raised); color: var(--foreground); box-shadow: var(--shadow-floating); outline: none; }
.arc-context-menu-highlight { position: absolute; top: 0; right: 5px; left: 5px; border-radius: calc(var(--radius-panel) - 6px); background: var(--surface-muted); opacity: 0; pointer-events: none; transition: background-color var(--duration-fast) var(--ease-standard); }
.arc-context-menu-highlight[data-tone="danger"] { background: color-mix(in oklch, var(--danger) 8%, var(--surface)); }
.arc-context-menu-item { position: relative; display: flex; width: 100%; min-height: 34px; align-items: center; gap: 9px; padding: 0 11px; border: 0; border-radius: calc(var(--radius-panel) - 6px); background: transparent; color: inherit; font: inherit; font-size: var(--text-sm); text-align: left; cursor: pointer; outline: none; transition: background-color var(--duration-instant) var(--ease-standard), color var(--duration-fast) var(--ease-standard); animation: context-item-in var(--duration-standard) var(--ease-enter) both; animation-delay: calc(min(var(--i, 0), 4) * 35ms); }
/* The gliding highlight is the focus indicator, as in the dropdown menu. */
.arc-context-menu-item:focus-visible { outline: none; }
/* Rows press with a tint, not a scale. */
.arc-context-menu-item:active:not(:disabled) { background: color-mix(in oklch, var(--foreground) 5%, transparent); }
.arc-context-menu-item:disabled { opacity: .45; cursor: default; }
.arc-context-menu-item.destructive { color: var(--danger); }
.arc-context-menu-icon { display: inline-flex; width: 17px; color: var(--text-secondary); }
.arc-context-menu-item > span:last-child { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.arc-context-menu-destructive .arc-context-menu-icon { color: currentColor; }
@keyframes context-item-in { from { opacity: 0; transform: translateY(-2px); } }
@media (prefers-reduced-motion: reduce) { .arc-context-menu-item, .arc-context-menu-highlight { animation: none; transition: none; } }
`;

const styles: Record<string, string> = new Proxy({
  "destructive": "arc-context-menu-destructive",
  "highlight": "arc-context-menu-highlight",
  "icon": "arc-context-menu-icon",
  "item": "arc-context-menu-item",
  "menu": "arc-context-menu-menu",
  "target": "arc-context-menu-target"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-context-menu-${prop}`,
});



export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  checked?: boolean;
}

export interface ContextMenuProps {
  children: ReactNode;
  items: ContextMenuItem[];
  label?: string;
}

type Highlight = { index: number; top: number; height: number; danger: boolean; glide: boolean };

const MENU_WIDTH = 208;

export function ContextMenu({ children, items, label = "Context menu" }: ContextMenuProps) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  // The portal mounts on first open (client only) and stays so the menu can animate out.
  const [portal, setPortal] = useState(false);
  // Each open gets its own key, so reopening at a new point fades the old menu out in place
  // and grows a fresh one from the pointer instead of teleporting the visible menu.
  const [point, setPoint] = useState({ x: 0, y: 0, originX: 0, originY: 0, key: 0 });
  const [highlight, setHighlight] = useState<Highlight | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const pointer = useRef(false);
  const clearTimer = useRef(0);
  // A primary press on the target while the menu is open closes it; the click that follows must not reopen it.
  const pressedWhileOpen = useRef(false);
  // An exiting menu keeps its last props, so its handlers check this before moving focus or selecting.
  const live = useRef(false);

  useEffect(() => { live.current = open; }, [open]);
  useEffect(() => () => window.clearTimeout(clearTimer.current), []);
  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]:not(:disabled)')?.focus({ preventScroll: true });
    const closeOnPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnViewportChange = (event: Event) => {
      if (event.target instanceof Node && menuRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnPointerDown);
    window.addEventListener("scroll", closeOnViewportChange, true);
    window.addEventListener("resize", closeOnViewportChange);
    return () => {
      document.removeEventListener("pointerdown", closeOnPointerDown);
      window.removeEventListener("scroll", closeOnViewportChange, true);
      window.removeEventListener("resize", closeOnViewportChange);
    };
  }, [open, point.key]);

  function showMenu(x: number, y: number) {
    const menuHeight = Math.min(300, items.length * 40 + 16);
    const left = Math.max(8, Math.min(x, window.innerWidth - MENU_WIDTH - 8));
    const top = Math.max(8, Math.min(y, window.innerHeight - menuHeight - 8));
    // The menu grows from the pointer, even when it is clamped away from a viewport edge.
    setPoint(current => ({ x: left, y: top, originX: Math.max(0, Math.min(MENU_WIDTH, x - left)), originY: Math.max(0, Math.min(menuHeight, y - top)), key: current.key + 1 }));
    window.clearTimeout(clearTimer.current);
    pointer.current = false;
    setHighlight(null);
    setPortal(true);
    setOpen(true);
  }

  function onTargetKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) {
      event.preventDefault();
      const rect = targetRef.current?.getBoundingClientRect();
      if (rect) showMenu(rect.left + 12, rect.bottom + 8);
    }
  }

  function onTargetClick() {
    if (pressedWhileOpen.current) { pressedWhileOpen.current = false; return; }
    const rect = targetRef.current?.getBoundingClientRect();
    if (rect) showMenu(rect.left + 12, rect.bottom + 8);
  }

  function onMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const enabled = items.map((item, index) => ({ item, index })).filter(({ item }) => !item.disabled);
    const current = document.activeElement?.getAttribute("data-index");
    const currentPosition = enabled.findIndex(({ index }) => String(index) === current);
    let nextPosition: number | undefined;
    if (event.key === "ArrowDown") nextPosition = (currentPosition + 1) % enabled.length;
    if (event.key === "ArrowUp") nextPosition = currentPosition < 0 ? enabled.length - 1 : (currentPosition - 1 + enabled.length) % enabled.length;
    if (event.key === "Home") nextPosition = 0;
    if (event.key === "End") nextPosition = enabled.length - 1;
    if (nextPosition !== undefined && enabled.length) {
      event.preventDefault();
      event.currentTarget.querySelector<HTMLElement>(`[data-index="${enabled[nextPosition].index}"]`)?.focus();
    }
    if (event.key === "Escape") { event.preventDefault(); setOpen(false); targetRef.current?.focus(); }
  }

  function place(item: HTMLElement, glide: boolean) {
    window.clearTimeout(clearTimer.current);
    const next = { index: Number(item.dataset.index), top: item.offsetTop, height: item.offsetHeight, danger: item.dataset.tone === "danger" };
    setHighlight(current => ({ ...next, glide: glide && current !== null }));
  }

  // Keyboard focus places the highlight instantly; the pointer makes it glide between rows.
  function onMenuFocus(event: FocusEvent<HTMLDivElement>) {
    const item = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[role="menuitem"]') : null;
    if (item) {
      // A pointer-opened menu focuses its first row without showing a highlight, like a native menu.
      if (!pointer.current && item.matches(":focus-visible")) place(item, false);
      return;
    }
    // A short grace period keeps the highlight gliding across the gap between rows.
    window.clearTimeout(clearTimer.current);
    clearTimer.current = window.setTimeout(() => setHighlight(null), pointer.current ? 70 : 0);
  }

  return <>
    <div ref={targetRef} className={styles.target} tabIndex={0} onPointerDown={event => { pressedWhileOpen.current = open && event.button === 0; }} onClick={onTargetClick} onContextMenu={event => { event.preventDefault(); showMenu(event.clientX, event.clientY); }} onKeyDown={onTargetKeyDown} aria-label={label} aria-haspopup="menu" aria-expanded={open}>
      {children}
    </div>
    {portal ? createPortal(<AnimatePresence>
      {open && <motion.div key={point.key} ref={node => { if (node) menuRef.current = node; }} className={styles.menu} role="menu" aria-label={label} tabIndex={-1} style={{ left: point.x, top: point.y, transformOrigin: `${point.originX}px ${point.originY}px` }} onKeyDown={onMenuKeyDown} onFocus={onMenuFocus} onPointerMoveCapture={() => { pointer.current = true; }} onKeyDownCapture={() => { pointer.current = false; }} onPointerLeave={event => { if (live.current) event.currentTarget.focus({ preventScroll: true }); }}
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} exit={reduced ? { opacity: 0, transition: { duration: .1 } } : { opacity: 0, scale: .98, transition: { duration: .13, ease: [...motionTokens.ease.standard] } }} transition={reduced ? { duration: motionTokens.duration.instant } : { default: motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] } }}>
        <motion.span className={styles.highlight} data-tone={highlight?.danger ? "danger" : undefined} aria-hidden="true" initial={false} animate={highlight ? { y: highlight.top, height: highlight.height, opacity: 1 } : { opacity: 0 }} transition={{ default: highlight?.glide && !reduced ? motionTokens.spring.snappy : { duration: 0 }, opacity: { duration: reduced ? 0 : .08 } }}/>
        {items.map((item, index) => <button key={item.id} type="button" role="menuitem" tabIndex={-1} data-index={index} data-tone={item.destructive ? "danger" : undefined} style={{ "--i": index } as CSSProperties} disabled={item.disabled} className={[styles.item, item.destructive ? styles.destructive : ""].filter(Boolean).join(" ")} onPointerMove={event => { if (!live.current) return; window.clearTimeout(clearTimer.current); if (document.activeElement !== event.currentTarget) event.currentTarget.focus({ preventScroll: true }); if (highlight?.index !== index) place(event.currentTarget, true); }} onPointerLeave={() => { if (live.current) menuRef.current?.focus({ preventScroll: true }); }} onClick={() => { if (!live.current) return; live.current = false; item.onSelect?.(); setOpen(false); targetRef.current?.focus(); }}>
          <span className={styles.icon} aria-hidden="true">{item.icon ?? (item.checked ? <Check size={15} /> : <MoreHorizontal size={15} />)}</span><span>{item.label}</span>
        </button>)}
      </motion.div>}
    </AnimatePresence>, document.body) : null}
  </>;
}

export const contextMenuExampleItems: ContextMenuItem[] = [
  { id: "copy", label: "Copy link", icon: <Copy size={15} /> },
  { id: "delete", label: "Delete project", icon: <Trash2 size={15} />, destructive: true },
];

export default ContextMenu;
