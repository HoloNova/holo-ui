"use client";

import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import type { CSSProperties, ReactNode, RefObject } from "react";
import type { TargetAndTransition } from "motion/react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { isValidElement, useEffect, useLayoutEffect, useRef, useState } from "react";

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
const ARC_SPLIT_BUTTON_STYLES = `/* One pill, two actions. The whole pill presses in for the main action; the menu half answers in color only, because Radix measures it on pointerdown to place the menu. */
.arc-split-button-group { display: inline-flex; align-items: stretch; border: 1px solid var(--foreground); border-radius: var(--radius-control); background: var(--foreground); transition: transform var(--duration-spring) var(--ease-spring); }
.arc-split-button-group:has(> .arc-split-button-primary:active:not(:disabled)) { transform: scale(.97); transition-duration: var(--duration-instant); transition-timing-function: var(--ease-standard); }
.arc-split-button-primary, .arc-split-button-trigger { border: 0; background: var(--foreground); color: var(--background); font: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: background-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard), opacity var(--duration-fast) var(--ease-standard); }
.arc-split-button-primary { position: relative; display: inline-grid; min-height: var(--control-height-md); place-items: center; padding: 0 var(--space-4); border-radius: calc(var(--radius-control) - 1px) 0 0 calc(var(--radius-control) - 1px); font-size: var(--text-sm); font-weight: 500; }
/* The slot springs to the width of the next label; the content leads from the start edge and is clipped only while it morphs. */
.arc-split-button-primarySlot { display: inline-flex; min-width: 0; align-items: center; }
.arc-split-button-primarySlot[data-morphing] { clip-path: inset(-50% calc(var(--space-2) * -1)); }
.arc-split-button-primaryContent { display: inline-flex; flex: none; align-items: center; gap: var(--space-2); white-space: nowrap; }
.arc-split-button-mainIcon { display: inline-grid; flex: none; place-items: center; }
.arc-split-button-iconPhase { grid-area: 1 / 1; display: inline-flex; align-items: center; justify-content: center; }
.arc-split-button-glyphs { position: relative; display: inline-flex; flex: none; white-space: pre; }
.arc-split-button-glyph { display: inline-block; }
.arc-split-button-trigger { display: grid; width: 38px; min-height: var(--control-height-md); place-items: center; border-left: 1px solid color-mix(in oklch, var(--background) 18%, var(--foreground)); border-radius: 0 calc(var(--radius-control) - 1px) calc(var(--radius-control) - 1px) 0; }
.arc-split-button-chevron { transition: transform var(--duration-spring) var(--ease-spring); }
.arc-split-button-trigger[data-state="open"] .arc-split-button-chevron { transform: rotate(180deg); }
@media (hover: hover) and (pointer: fine) {
  .arc-split-button-primary:hover:not(:disabled), .arc-split-button-trigger:hover:not(:disabled) { background: color-mix(in oklch, var(--foreground) 88%, var(--background)); }
  .arc-split-button-secondary .arc-split-button-primary:hover:not(:disabled), .arc-split-button-secondary .arc-split-button-trigger:hover:not(:disabled) { background: var(--surface-muted); }
}
.arc-split-button-primary:active:not(:disabled), .arc-split-button-trigger:active:not(:disabled), .arc-split-button-trigger[data-state="open"] { background: color-mix(in oklch, var(--foreground) 80%, var(--background)); }
.arc-split-button-primary:focus-visible, .arc-split-button-trigger:focus-visible, .arc-split-button-item:focus-visible { z-index: 1; outline: 2px solid var(--focus-ring); outline-offset: 3px; }
.arc-split-button-primary:disabled, .arc-split-button-trigger:disabled { cursor: not-allowed; opacity: .52; }
.arc-split-button-secondary { border-color: var(--border); border-radius: var(--radius-pill); background: var(--surface); }
.arc-split-button-secondary .arc-split-button-primary, .arc-split-button-secondary .arc-split-button-trigger { min-height: 36px; background: var(--surface); color: var(--foreground); }
.arc-split-button-secondary .arc-split-button-primary { min-width: 142px; border-radius: var(--radius-pill) 0 0 var(--radius-pill); padding-inline: 12px; font-size: 12px; }
.arc-split-button-secondary .arc-split-button-trigger { width: 32px; border-left-color: var(--border-subtle); border-radius: 0 var(--radius-pill) var(--radius-pill) 0; }
.arc-split-button-secondary .arc-split-button-primary:active:not(:disabled), .arc-split-button-secondary .arc-split-button-trigger:active:not(:disabled), .arc-split-button-secondary .arc-split-button-trigger[data-state="open"] { background: color-mix(in oklch, var(--surface-muted), var(--border) 55%); }
.arc-split-button-icon { display: inline-flex; }
.arc-split-button-srOnly { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
/* The menu grows from the trigger edge: offset toward the trigger, scale from the Radix origin, fade quickly; it leaves faster than it arrives.
   Transitions instead of keyframes, so a close that interrupts the open reverses from where the menu is instead of snapping to rest first. */
.arc-split-button-menu { --menu-x: 0px; --menu-y: -5px; z-index: 60; min-width: 12rem; padding: 5px; border: 1px solid var(--border); border-radius: var(--radius-panel); background: var(--surface-raised); color: var(--foreground); box-shadow: var(--shadow-floating); transform-origin: var(--radix-dropdown-menu-content-transform-origin); transition: opacity var(--duration-fast) var(--ease-enter), transform var(--duration-spring) var(--ease-spring); }
.arc-split-button-menu[data-side="top"] { --menu-y: 5px; }
.arc-split-button-menu[data-side="left"] { --menu-x: 5px; --menu-y: 0px; }
.arc-split-button-menu[data-side="right"] { --menu-x: -5px; --menu-y: 0px; }
@starting-style {
  .arc-split-button-menu[data-state="open"] { opacity: 0; transform: translate(var(--menu-x), var(--menu-y)) scale(.97); }
  .arc-split-button-menu[data-state="open"] .arc-split-button-item { opacity: 0; transform: translate(calc(var(--menu-x) * .4), calc(var(--menu-y) * .4)); }
}
/* Radix unmounts when the exit animation ends, so a no-op keyframe times the exit while the transition does the visual work. */
.arc-split-button-menu[data-state="closed"] { opacity: 0; transform: translate(calc(var(--menu-x) * .5), calc(var(--menu-y) * .5)) scale(.985); transition: opacity 130ms var(--ease-standard), transform 130ms var(--ease-standard); animation: menu-exit 130ms linear both; pointer-events: none; }
/* Highlight follows the pointer and arrow keys instantly, like a native menu. */
.arc-split-button-item { display: flex; min-height: 36px; align-items: center; gap: 10px; padding: 0 11px; border-radius: calc(var(--radius-panel) - 6px); font-size: var(--text-sm); cursor: pointer; outline: none; transition: opacity var(--duration-standard) var(--ease-enter) calc(min(var(--i, 0), 4) * 35ms), transform var(--duration-standard) var(--ease-enter) calc(min(var(--i, 0), 4) * 35ms); }
.arc-split-button-item[data-highlighted] { background: var(--surface-muted); }
.arc-split-button-item[data-disabled] { cursor: default; opacity: .45; }
.arc-split-button-destructive { color: var(--danger); }
.arc-split-button-destructive[data-highlighted] { background: color-mix(in oklch, var(--danger) 8%, var(--surface)); }
@keyframes menu-exit { to { --menu-exit: 1; } }
@media (prefers-reduced-motion: reduce) {
  .arc-split-button-group, .arc-split-button-primary, .arc-split-button-trigger, .arc-split-button-chevron { transition: none; }
  .arc-split-button-group:has(> .arc-split-button-primary:active:not(:disabled)) { transform: none; }
  .arc-split-button-item { transition: none; }
  .arc-split-button-menu, .arc-split-button-menu[data-state="closed"] { transform: none; transition: opacity var(--duration-instant) linear; }
}
`;

const styles: Record<string, string> = new Proxy({
  "chevron": "arc-split-button-chevron",
  "destructive": "arc-split-button-destructive",
  "glyph": "arc-split-button-glyph",
  "glyphs": "arc-split-button-glyphs",
  "group": "arc-split-button-group",
  "icon": "arc-split-button-icon",
  "iconPhase": "arc-split-button-iconPhase",
  "item": "arc-split-button-item",
  "mainIcon": "arc-split-button-mainIcon",
  "menu": "arc-split-button-menu",
  "primary": "arc-split-button-primary",
  "primaryContent": "arc-split-button-primaryContent",
  "primarySlot": "arc-split-button-primarySlot",
  "secondary": "arc-split-button-secondary",
  "srOnly": "arc-split-button-srOnly",
  "trigger": "arc-split-button-trigger"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-split-button-${prop}`,
});



export interface SplitButtonAction { label: string; onSelect?: () => void; disabled?: boolean; destructive?: boolean; icon?: ReactNode; }
export interface SplitButtonProps { label: string; actions: SplitButtonAction[]; onClick?: () => void; disabled?: boolean; icon?: ReactNode; variant?: "primary" | "secondary"; }

const rest: TargetAndTransition = { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" };
const fadeIn: TargetAndTransition = { ...rest, opacity: 0 };
const fadeOut: TargetAndTransition = { opacity: 0, transition: { duration: motionTokens.duration.instant } };
const glyphIn: TargetAndTransition = { opacity: 0, y: 5, filter: `blur(${motionTokens.blur.soft}px)` };
const glyphOut: TargetAndTransition = { opacity: 0, y: -4, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } };
const iconIn: TargetAndTransition = { opacity: 0, scale: .6, filter: `blur(${motionTokens.blur.subtle}px)` };
const iconOut: TargetAndTransition = { ...iconIn, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } };
/** Scale rides the spring; opacity and blur tween so blur never overshoots below zero. */
const iconEnter = { ...motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] }, filter: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] } } as const;

/** Names the icon element, so swapping Copy for Check morphs while a re-render of the same icon stays still. */
function iconKey(node: ReactNode): string {
  if (!isValidElement(node)) return node == null || typeof node === "boolean" ? "" : String(node);
  const type = node.type as string | { displayName?: string; name?: string };
  return typeof type === "string" ? type : type?.displayName ?? type?.name ?? "icon";
}

/** Springs the slot to the natural width of its content when the label changes; other resizes (a late web font) jump. */
function useMorphWidth(content: RefObject<HTMLElement | null>, key: string, reduced: boolean) {
  const width = useMotionValue<number | "auto">("auto");
  const lastKey = useRef(key), armedUntil = useRef(0);
  useLayoutEffect(() => {
    if (lastKey.current === key) return;
    lastKey.current = key;
    armedUntil.current = performance.now() + 700;
  }, [key]);
  useEffect(() => {
    const node = content.current, slot = node?.parentElement;
    if (!node || !slot || typeof ResizeObserver === "undefined") return;
    let measured = false;
    const observer = new ResizeObserver(([entry]) => {
      const next = entry.contentRect.width;
      if (!next || !measured || reduced || performance.now() > armedUntil.current) { measured = next > 0; width.jump(next || "auto"); delete slot.dataset.morphing; return; }
      slot.dataset.morphing = "";
      animate(width, next, { ...motionTokens.spring.morph, onComplete: () => { delete slot.dataset.morphing; } });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [content, reduced, width]);
  return width;
}

type Glyph = { id: string; char: string; order: number };
const toGlyphs = (chars: string[], seq: number): Glyph[] => chars.map((char, order) => ({ id: `${seq}:${order}`, char, order }));

/** Shared leading and trailing characters keep their identity, so "Copy page" to "Copied" only replaces the changed letters. */
function useGlyphs(text: string) {
  const [state, setState] = useState(() => ({ text, seq: 0, glyphs: toGlyphs([...text], 0) }));
  if (state.text === text) return state.glyphs;
  const prev = [...state.text], next = [...text];
  let start = 0, end = 0;
  while (start < prev.length && start < next.length && prev[start] === next[start]) start++;
  while (end < prev.length - start && end < next.length - start && prev[prev.length - 1 - end] === next[next.length - 1 - end]) end++;
  if (start < 2) start = 0;
  if (end < 2) end = 0;
  const seq = state.seq + 1;
  const glyphs = [...state.glyphs.slice(0, start), ...toGlyphs(next.slice(start, next.length - end), seq), ...state.glyphs.slice(state.glyphs.length - end)];
  setState({ text, seq, glyphs });
  return glyphs;
}

function MorphText({ text, reduced }: { text: string; reduced: boolean }) {
  const glyphs = useGlyphs(text);
  return <span className={styles.glyphs}>
    <AnimatePresence mode="popLayout" initial={false}>
      {glyphs.map(glyph => <motion.span key={glyph.id} className={styles.glyph} layout={reduced ? false : "position"} layoutDependency={text} initial={reduced ? fadeIn : glyphIn} animate={rest} exit={reduced ? fadeOut : glyphOut} transition={reduced ? { duration: motionTokens.duration.instant } : { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter], delay: Math.min(glyph.order * motionTokens.stagger.char, .1), layout: motionTokens.spring.morph }}>{glyph.char}</motion.span>)}
    </AnimatePresence>
  </span>;
}

/** The main action morphs its icon and label in place while its width follows on a spring; the menu half never scales, so the menu opens from a still anchor. */
export function SplitButton({ label, actions, onClick, disabled, icon, variant = "primary" }: SplitButtonProps) {
  const reduced = useReducedMotion() ?? false;
  const contentRef = useRef<HTMLSpanElement>(null);
  const glyph = iconKey(icon);
  const width = useMorphWidth(contentRef, `${glyph}|${label}`, reduced);
  return <DropdownPrimitive.Root>
    <div className={[styles.group, variant === "secondary" ? styles.secondary : ""].filter(Boolean).join(" ")}>
      <button className={styles.primary} type="button" onClick={onClick} disabled={disabled}>
        <motion.span className={styles.primarySlot} style={{ width }} aria-hidden="true">
          <span ref={contentRef} className={styles.primaryContent}>
            {icon ? <span className={styles.mainIcon}><AnimatePresence initial={false}><motion.span key={glyph} className={styles.iconPhase} initial={reduced ? fadeIn : iconIn} animate={rest} exit={reduced ? fadeOut : iconOut} transition={reduced ? { duration: motionTokens.duration.instant } : iconEnter}>{icon}</motion.span></AnimatePresence></span> : null}
            <MorphText text={label} reduced={reduced} />
          </span>
        </motion.span>
        <span className={styles.srOnly} aria-live="polite">{label}</span>
      </button>
      <DropdownPrimitive.Trigger className={styles.trigger} type="button" aria-label={`${label} more actions`} disabled={disabled}><ChevronDown className={styles.chevron} size={15} strokeWidth={1.8} aria-hidden="true" /></DropdownPrimitive.Trigger>
    </div>
    <DropdownPrimitive.Portal><DropdownPrimitive.Content className={styles.menu} sideOffset={4} align="end" collisionPadding={12} loop>
      {actions.map((action, index) => <DropdownPrimitive.Item key={action.label} className={[styles.item, action.destructive ? styles.destructive : ""].filter(Boolean).join(" ")} style={{ "--i": index } as CSSProperties} disabled={action.disabled} onSelect={action.onSelect}>{action.icon ? <span className={styles.icon} aria-hidden="true">{action.icon}</span> : null}{action.label}</DropdownPrimitive.Item>)}
    </DropdownPrimitive.Content></DropdownPrimitive.Portal>
  </DropdownPrimitive.Root>;
}

export default SplitButton;
