"use client";

import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import type { CSSProperties, FocusEvent, ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";

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
const ARC_DROPDOWN_MENU_STYLES = `.arc-dropdown-menu-trigger { display: inline-flex; max-width: 100%; min-height: var(--control-height-sm); align-items: center; gap: var(--space-2); padding: 0 var(--space-3); border: 1px solid var(--border); border-radius: var(--radius-control); background: var(--surface); color: var(--foreground); font: inherit; font-size: var(--text-sm); font-weight: 500; cursor: pointer; transition: background-color var(--duration-instant) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard); }
@media (hover: hover) and (pointer: fine) { .arc-dropdown-menu-trigger:hover { border-color: var(--border-strong); background: var(--surface-muted); box-shadow: var(--shadow-resting); } }
/* The trigger anchors the menu, so press feedback stays in color. A scaled rect would be measured on pointerdown and shift the menu. */
.arc-dropdown-menu-trigger[data-state="open"] { border-color: var(--border-strong); background: var(--surface-muted); box-shadow: none; }
.arc-dropdown-menu-trigger:active { border-color: var(--border-strong); background: color-mix(in oklch, var(--surface-muted), var(--border) 55%); box-shadow: none; }
.arc-dropdown-menu-trigger:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.arc-dropdown-menu-item:focus-visible { outline: none; }
.arc-dropdown-menu-triggerIcon { display: inline-flex; flex: none; color: var(--text-secondary); }
.arc-dropdown-menu-label { position: relative; display: inline-flex; min-width: 0; flex: 0 1 auto; overflow-x: clip; }
.arc-dropdown-menu-labelMeasure { position: absolute; top: 0; left: 0; visibility: hidden; white-space: nowrap; pointer-events: none; }
.arc-dropdown-menu-labelText { display: block; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.arc-dropdown-menu-chevron { flex: none; color: var(--text-muted); transition: transform var(--duration-spring) var(--ease-spring), color var(--duration-fast) var(--ease-standard); }
.arc-dropdown-menu-trigger[data-state="open"] .arc-dropdown-menu-chevron { transform: rotate(180deg); }
/* The menu grows from the trigger edge: offset toward the trigger, scale from the Radix origin, fade quickly.
   Transitions instead of keyframes, so a close that interrupts the open (or a reopen during the close) reverses from where it is. */
.arc-dropdown-menu-menu { --menu-x: 0px; --menu-y: -5px; position: relative; z-index: 60; min-width: 12rem; padding: 5px; border: 1px solid var(--border); border-radius: var(--radius-panel); background: var(--surface-raised); box-shadow: var(--shadow-floating); transform-origin: var(--radix-dropdown-menu-content-transform-origin); transition: opacity var(--duration-fast) var(--ease-enter), transform var(--duration-spring) var(--ease-spring); }
.arc-dropdown-menu-menu[data-side="top"] { --menu-y: 5px; }
.arc-dropdown-menu-menu[data-side="left"] { --menu-x: 5px; --menu-y: 0px; }
.arc-dropdown-menu-menu[data-side="right"] { --menu-x: -5px; --menu-y: 0px; }
@starting-style {
  .arc-dropdown-menu-menu[data-state="open"] { opacity: 0; transform: translate(var(--menu-x), var(--menu-y)) scale(.97); }
  .arc-dropdown-menu-menu[data-state="open"] .arc-dropdown-menu-item { opacity: 0; transform: translate(calc(var(--menu-x) * .4), calc(var(--menu-y) * .4)); }
}
/* Radix unmounts when the exit animation ends, so a no-op keyframe times the exit while the transition does the visual work. */
.arc-dropdown-menu-menu[data-state="closed"] { opacity: 0; transform: translate(calc(var(--menu-x) * .5), calc(var(--menu-y) * .5)) scale(.985); transition: opacity 130ms var(--ease-standard), transform 130ms var(--ease-standard); animation: menu-exit 130ms linear both; pointer-events: none; }
.arc-dropdown-menu-highlight { position: absolute; top: 0; right: 5px; left: 5px; border-radius: calc(var(--radius-panel) - 6px); background: var(--surface-muted); opacity: 0; pointer-events: none; transition: background-color var(--duration-fast) var(--ease-standard); }
.arc-dropdown-menu-highlight[data-tone="danger"] { background: color-mix(in oklch, var(--danger) 8%, var(--surface)); }
.arc-dropdown-menu-item { position: relative; display: flex; min-height: 36px; align-items: center; gap: 10px; padding: 0 11px; border-radius: calc(var(--radius-panel) - 6px); color: var(--foreground); font-size: var(--text-sm); cursor: pointer; outline: none; transition: color var(--duration-fast) var(--ease-standard), opacity var(--duration-standard) var(--ease-enter) calc(min(var(--i, 0), 4) * 35ms), transform var(--duration-standard) var(--ease-enter) calc(min(var(--i, 0), 4) * 35ms); }
.arc-dropdown-menu-icon { display: inline-flex; width: 17px; color: var(--text-secondary); }
.arc-dropdown-menu-separator { height: 1px; margin: var(--space-1) calc(var(--space-1) * -1); background: var(--border-subtle); }
.arc-dropdown-menu-destructive { color: var(--danger); }
.arc-dropdown-menu-destructive .arc-dropdown-menu-icon { color: var(--danger); }
.arc-dropdown-menu-item[data-disabled] { opacity: .45; cursor: default; }
@keyframes menu-exit { to { --menu-exit: 1; } }
@media (prefers-reduced-transparency: reduce) { .arc-dropdown-menu-menu { background: var(--surface-raised); backdrop-filter: none; -webkit-backdrop-filter: none; } }
@media (prefers-reduced-motion: reduce) {
  .arc-dropdown-menu-trigger, .arc-dropdown-menu-chevron, .arc-dropdown-menu-item, .arc-dropdown-menu-highlight { transition: none; }
  .arc-dropdown-menu-menu, .arc-dropdown-menu-menu[data-state="closed"] { transform: none; transition: opacity var(--duration-instant) linear; }
}
`;

const styles: Record<string, string> = new Proxy({
  "chevron": "arc-dropdown-menu-chevron",
  "destructive": "arc-dropdown-menu-destructive",
  "highlight": "arc-dropdown-menu-highlight",
  "icon": "arc-dropdown-menu-icon",
  "item": "arc-dropdown-menu-item",
  "label": "arc-dropdown-menu-label",
  "labelMeasure": "arc-dropdown-menu-labelMeasure",
  "labelText": "arc-dropdown-menu-labelText",
  "menu": "arc-dropdown-menu-menu",
  "separator": "arc-dropdown-menu-separator",
  "trigger": "arc-dropdown-menu-trigger",
  "triggerIcon": "arc-dropdown-menu-triggerIcon"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-dropdown-menu-${prop}`,
});



export interface DropdownItem { label: string; onSelect?: () => void; disabled?: boolean; icon?: ReactNode; destructive?: boolean; separatorBefore?: boolean; }
export interface DropdownMenuProps { label: string; items: DropdownItem[]; icon?: ReactNode; }

type Highlight = { top: number; height: number; danger: boolean; glide: boolean };

/** A new trigger label rises in while the old one leaves, and the trigger width springs to the measured text instead of snapping. */
function TriggerLabel({ text }: { text: string }) {
  const reduced = useReducedMotion();
  const measure = useRef<HTMLSpanElement>(null);
  const measured = useRef<string | null>(null);
  const [size, setSize] = useState<{ width: number | "auto"; animate: boolean }>({ width: "auto", animate: false });
  useLayoutEffect(() => {
    const node = measure.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      const current = node.textContent;
      // Only a text change morphs; the first measure and font swaps settle instantly.
      const animate = measured.current !== null && measured.current !== current;
      measured.current = current;
      setSize({ width: Math.ceil(entry.borderBoxSize?.[0]?.inlineSize ?? node.offsetWidth), animate });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <motion.span className={styles.label} initial={false} animate={{ width: size.width }} transition={size.animate && !reduced ? motionTokens.spring.morph : { duration: 0 }}>
    <span ref={measure} className={styles.labelMeasure} aria-hidden="true">{text}</span>
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span key={text} className={styles.labelText} initial={reduced ? false : { opacity: 0, y: "0.3em", filter: `blur(${motionTokens.blur.soft}px)` }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: "-0.3em", filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: .15, ease: [...motionTokens.ease.standard] } }} transition={{ duration: .24, ease: [...motionTokens.ease.enter] }}>{text}</motion.span>
    </AnimatePresence>
  </motion.span>;
}

export function DropdownMenu({ label, items, icon }: DropdownMenuProps) {
  const reduced = useReducedMotion();
  const [highlight, setHighlight] = useState<Highlight | null>(null);
  const pointer = useRef(false);
  const clearTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(clearTimer.current), []);
  // Radix focuses the highlighted item (pointer or keyboard) and the content when the pointer leaves an item.
  function onMenuFocus(event: FocusEvent<HTMLDivElement>) {
    const item = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[role="menuitem"]') : null;
    window.clearTimeout(clearTimer.current);
    if (!item) {
      // A short grace period keeps the highlight gliding across separators and item gaps.
      clearTimer.current = window.setTimeout(() => setHighlight(null), pointer.current ? 70 : 0);
      return;
    }
    const next = { top: item.offsetTop, height: item.offsetHeight, danger: item.dataset.tone === "danger" };
    const glide = pointer.current;
    setHighlight(current => ({ ...next, glide: glide && current !== null }));
  }
  return <DropdownPrimitive.Root onOpenChange={open => { if (open) { window.clearTimeout(clearTimer.current); setHighlight(null); } }}>
    <DropdownPrimitive.Trigger className={styles.trigger} type="button">{icon && <span className={styles.triggerIcon} aria-hidden="true">{icon}</span>}<TriggerLabel text={label}/><ChevronDown className={styles.chevron} size={15} strokeWidth={1.8} aria-hidden="true"/></DropdownPrimitive.Trigger>
    <DropdownPrimitive.Portal><DropdownPrimitive.Content className={styles.menu} sideOffset={6} align="end" collisionPadding={12} loop onFocus={onMenuFocus} onPointerMoveCapture={() => { pointer.current = true; }} onKeyDownCapture={() => { pointer.current = false; }}>
      {/* One highlight glides between items for the pointer and jumps instantly for the keyboard. */}
      <motion.span className={styles.highlight} data-tone={highlight?.danger ? "danger" : undefined} aria-hidden="true" initial={false} animate={highlight ? { y: highlight.top, height: highlight.height, opacity: 1 } : { opacity: 0 }} transition={{ default: highlight?.glide && !reduced ? motionTokens.spring.snappy : { duration: 0 }, opacity: { duration: reduced ? 0 : .08 } }}/>
      {items.map((item, index) => <Fragment key={item.label}>{item.separatorBefore && <DropdownPrimitive.Separator className={styles.separator}/>}<DropdownPrimitive.Item className={[styles.item, item.destructive ? styles.destructive : ""].filter(Boolean).join(" ")} data-tone={item.destructive ? "danger" : undefined} style={{ "--i": index } as CSSProperties} disabled={item.disabled} onSelect={item.onSelect}>{item.icon && <span className={styles.icon} aria-hidden="true">{item.icon}</span>}{item.label}</DropdownPrimitive.Item></Fragment>)}
    </DropdownPrimitive.Content></DropdownPrimitive.Portal>
  </DropdownPrimitive.Root>;
}

export default DropdownMenu;
