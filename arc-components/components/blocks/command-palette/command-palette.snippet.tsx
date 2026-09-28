"use client";

import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import type { Transition, ValueAnimationTransition, Variants } from "motion/react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { ArrowRight, Command as CommandIcon, CornerDownLeft, Search, X } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";

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
const ARC_COMMAND_PALETTE_STYLES = `.arc-command-palette-palette {
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius-panel);
  background: var(--surface);
  box-shadow: 0 18px 44px color-mix(in srgb, var(--foreground) 10%, transparent);
  transform-origin: top center;
}

.arc-command-palette-searchRow {
  position: relative;
  display: flex;
  min-height: 54px;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-bottom: 1px solid var(--border-subtle);
  transition: background var(--duration-fast) var(--ease-standard);
}

.arc-command-palette-searchRow:focus-within { background: var(--surface-muted); }
.arc-command-palette-searchIcon, .arc-command-palette-itemIcon { display: grid; flex: none; place-items: center; color: var(--text-muted); }
.arc-command-palette-searchIcon { width: 22px; height: 22px; }
.arc-command-palette-searchRow input { min-width: 0; flex: 1; border: 0; outline: 0; background: transparent; color: var(--foreground); font: inherit; font-size: var(--text-sm); }
.arc-command-palette-searchRow input::placeholder { color: var(--text-muted); }
.arc-command-palette-searchRow input:focus-visible { outline: none; }

.arc-command-palette-commandKey, .arc-command-palette-shortcut, .arc-command-palette-hint kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface-muted);
  color: var(--text-muted);
  font-family: inherit;
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
}

.arc-command-palette-commandKey { min-width: 38px; height: 24px; padding: 0 6px; }
.arc-command-palette-clearButton { display: grid; width: 24px; height: 24px; flex: none; place-items: center; border: 0; border-radius: 7px; background: transparent; color: var(--text-muted); cursor: pointer; transition: color var(--duration-fast) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard); }
@media (hover: hover) and (pointer: fine) { .arc-command-palette-clearButton:hover, .arc-command-palette-closeButton:hover { background: var(--surface); color: var(--foreground); } }
.arc-command-palette-clearButton:active, .arc-command-palette-closeButton:active { background: var(--surface); color: var(--foreground); }
.arc-command-palette-clearButton:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.arc-command-palette-closeButton { display: grid; min-width: 27px; height: 22px; place-items: center; border: 1px solid var(--border-subtle); border-radius: 6px; background: transparent; color: var(--text-muted); font: inherit; font-size: 10px; cursor: pointer; transition: color var(--duration-fast) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard); }
.arc-command-palette-closeButton:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }

/* The frame animates to the list height; the list keeps its own scroll. */
.arc-command-palette-resultsFrame { overflow: hidden; }
.arc-command-palette-results { position: relative; max-height: 342px; overflow: auto; padding: 6px 8px; }
.arc-command-palette-highlight { position: absolute; top: 0; right: 8px; left: 8px; border: 1px solid color-mix(in srgb, var(--accent) 42%, var(--border)); border-radius: 10px; background: var(--accent-subtle); opacity: 0; pointer-events: none; }
/* Groups are positioned so a row that pops out of the flow is placed against the same box it was measured in, even mid-glide. */
.arc-command-palette-group { position: relative; }
.arc-command-palette-group + .arc-command-palette-group { margin-top: 4px; padding-top: 4px; border-top: 1px solid var(--border-subtle); }
.arc-command-palette-groupHeading { display: block; padding: 5px 8px 3px; color: var(--text-muted); font-size: 10px; font-weight: 500; letter-spacing: .02em; }

.arc-command-palette-result { position: relative; display: flex; width: 100%; min-height: 40px; align-items: center; gap: 9px; border: 1px solid transparent; border-radius: 10px; padding: 5px 8px; background: transparent; color: var(--foreground); text-align: left; cursor: pointer; }
/* The active row is drawn by the shared highlight; the row itself only tints its icon and arrow. */
.arc-command-palette-itemIcon { transition: color var(--duration-fast) var(--ease-standard); }
.arc-command-palette-activeResult .arc-command-palette-itemIcon, .arc-command-palette-activeResult .arc-command-palette-resultArrow { color: var(--accent-strong); }
.arc-command-palette-result:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: -2px; }
.arc-command-palette-itemIcon { width: 20px; height: 20px; }
.arc-command-palette-resultCopy { min-width: 0; flex: 1; }
.arc-command-palette-resultCopy strong, .arc-command-palette-resultCopy small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.arc-command-palette-resultCopy strong { font-size: var(--text-sm); font-weight: 500; }
.arc-command-palette-resultCopy small { margin-top: 2px; color: var(--text-muted); font-size: var(--text-xs); }
.arc-command-palette-shortcut { min-width: 22px; height: 21px; padding: 0 5px; }
.arc-command-palette-resultArrow { flex: none; color: var(--text-muted); opacity: .35; transition: opacity var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard), transform var(--duration-spring) var(--ease-spring); }
.arc-command-palette-activeResult .arc-command-palette-resultArrow { opacity: .8; transform: translateX(2px); }

.arc-command-palette-empty { display: grid; justify-items: center; gap: 4px; padding: 26px 12px 28px; text-align: center; }
.arc-command-palette-empty > span { display: grid; width: 32px; height: 32px; place-items: center; margin-bottom: 5px; color: var(--text-muted); }
.arc-command-palette-empty strong { font-size: var(--text-sm); font-weight: 500; }
.arc-command-palette-empty small { color: var(--text-muted); font-size: var(--text-xs); }
.arc-command-palette-hint { position: relative; display: flex; flex-wrap: wrap; gap: 10px; padding: 8px 14px 10px; border-top: 1px solid var(--border-subtle); color: var(--text-muted); font-size: 10px; }
.arc-command-palette-hint span { display: inline-flex; align-items: center; gap: 4px; }
.arc-command-palette-hint kbd { min-width: 18px; height: 18px; padding: 0 4px; }
.arc-command-palette-visuallyHidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

@media (max-width: 480px) {
  .arc-command-palette-searchRow { gap: 8px; padding: 8px 11px; }
  .arc-command-palette-results { padding: 6px; }
  .arc-command-palette-highlight { right: 6px; left: 6px; }
  .arc-command-palette-result { gap: 8px; }
  .arc-command-palette-shortcut, .arc-command-palette-commandKey { display: none; }
  .arc-command-palette-hint { gap: 7px; padding: 8px 11px 9px; }
}

@media (max-width: 340px) {
  .arc-command-palette-hint span:last-child { display: none; }
  .arc-command-palette-result { padding-inline: 6px; }
}

@media (prefers-reduced-motion: reduce) {
  .arc-command-palette-searchRow, .arc-command-palette-itemIcon, .arc-command-palette-resultArrow, .arc-command-palette-clearButton, .arc-command-palette-closeButton { transition: none; }
  .arc-command-palette-activeResult .arc-command-palette-resultArrow { transform: none; }
}
`;

const styles: Record<string, string> = new Proxy({
  "activeResult": "arc-command-palette-activeResult",
  "clearButton": "arc-command-palette-clearButton",
  "closeButton": "arc-command-palette-closeButton",
  "commandKey": "arc-command-palette-commandKey",
  "empty": "arc-command-palette-empty",
  "group": "arc-command-palette-group",
  "groupHeading": "arc-command-palette-groupHeading",
  "highlight": "arc-command-palette-highlight",
  "hint": "arc-command-palette-hint",
  "itemIcon": "arc-command-palette-itemIcon",
  "palette": "arc-command-palette-palette",
  "result": "arc-command-palette-result",
  "resultArrow": "arc-command-palette-resultArrow",
  "resultCopy": "arc-command-palette-resultCopy",
  "results": "arc-command-palette-results",
  "resultsFrame": "arc-command-palette-resultsFrame",
  "searchIcon": "arc-command-palette-searchIcon",
  "searchRow": "arc-command-palette-searchRow",
  "shortcut": "arc-command-palette-shortcut",
  "visuallyHidden": "arc-command-palette-visuallyHidden"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-command-palette-${prop}`,
});



export interface CommandItem { id: string; label: string; description?: string; group?: string; keywords?: string[]; icon?: ReactNode; shortcut?: string; }
export interface CommandPaletteProps { items: CommandItem[]; placeholder?: string; onSelect?: (item: CommandItem) => void; onClose?: () => void; label?: string; }

const enter: Transition = { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] };
const leave: Transition = { duration: .1, ease: [...motionTokens.ease.standard] };
const GLIDE_ROWS = 6;
/** Rows fade out while the rest glide into their place; when the list snaps they leave at once so nothing overlaps the new rows. */
const rowExit: Variants = { exit: (glide: boolean) => ({ opacity: 0, transition: glide ? leave : { duration: 0 } }) };

export function CommandPalette({ items, placeholder = "Search commands", onSelect, onClose, label = "Command palette" }: CommandPaletteProps) {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [listHeight, setListHeight] = useState<number | "auto">("auto");
  const reduced = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const pointer = useRef(false);
  const lastPointer = useRef({ x: -1, y: -1 });
  const highlightShown = useRef(false);
  const highlightY = useMotionValue(0);
  const highlightHeight = useMotionValue(0);
  const highlightOpacity = useMotionValue(0);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter(item => [item.label, item.description, item.group, ...(item.keywords ?? [])].filter(Boolean).join(" ").toLowerCase().includes(normalized));
  }, [items, query]);
  const groupedItems = useMemo(() => {
    const grouped = new Map<string, Array<{ item: CommandItem; index: number }>>();
    filtered.forEach((item, index) => {
      const group = item.group ?? "Actions";
      const entries = grouped.get(group) ?? [];
      entries.push({ item, index });
      grouped.set(group, entries);
    });
    return [...grouped.entries()];
  }, [filtered]);
  // When every remaining row moves within about a viewport, the list closes its gaps with a glide. A long jump (the first letters typed into a long list) snaps like a search result list instead of streaking rows through the frame; only the frame height morphs.
  const [shift, setShift] = useState({ list: filtered, glide: true });
  if (shift.list !== filtered) {
    const before = new Map(shift.list.map((item, index) => [item.id, index]));
    setShift({ list: filtered, glide: filtered.every((item, index) => Math.abs((before.get(item.id) ?? index) - index) <= GLIDE_ROWS) });
  }
  const glide = shift.glide && !reduced;
  const safeActiveIndex = activeIndex === null
    ? -1
    : Math.min(activeIndex, Math.max(filtered.length - 1, 0));
  const activeId = filtered[safeActiveIndex]?.id;

  useEffect(() => {
    const focusShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", focusShortcut);
    return () => document.removeEventListener("keydown", focusShortcut);
  }, []);

  // The results frame follows the list height, so filtering closes or opens the gap instead of snapping.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const observer = new ResizeObserver(([entry]) => setListHeight(Math.round(entry.borderBoxSize?.[0]?.blockSize ?? list.offsetHeight)));
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  // One highlight follows the active result: a spring for the pointer, a 70ms slide for arrow keys, a fade when it first appears.
  useLayoutEffect(() => {
    const node = activeId ? document.getElementById(`${inputId}-${activeId}`) : null;
    if (!node) {
      highlightShown.current = false;
      animate(highlightOpacity, 0, { duration: reduced ? 0 : .1 });
      return;
    }
    const move: ValueAnimationTransition<number> = !highlightShown.current || reduced ? { duration: 0 } : pointer.current ? motionTokens.spring.snappy : { duration: .07, ease: [...motionTokens.ease.enter] };
    // Rows sit inside positioned groups, so their offset is summed up to the list (layout transforms stay out of it).
    let top = 0;
    for (let element: HTMLElement | null = node; element && element !== listRef.current; element = element.offsetParent as HTMLElement | null) top += element.offsetTop + (element === node ? 0 : element.clientTop);
    animate(highlightY, top, move);
    animate(highlightHeight, node.offsetHeight, move);
    animate(highlightOpacity, 1, { duration: reduced ? 0 : .08 });
    highlightShown.current = true;
  }, [activeId, inputId, reduced, highlightY, highlightHeight, highlightOpacity]);

  useEffect(() => {
    if (!activeId) return;
    document.getElementById(`${inputId}-${activeId}`)?.scrollIntoView({ block: "nearest" });
  }, [activeId, inputId]);

  function choose(item: CommandItem) {
    onSelect?.(item);
    setQuery("");
    setActiveIndex(null);
    inputRef.current?.focus();
  }
  function handleKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    pointer.current = false;
    if (event.key === "ArrowDown") { event.preventDefault(); setActiveIndex(index => Math.min((index ?? -1) + 1, Math.max(filtered.length - 1, 0))); }
    if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex(index => Math.max((index ?? filtered.length) - 1, 0)); }
    if (event.key === "Home") { event.preventDefault(); setActiveIndex(0); }
    if (event.key === "End") { event.preventDefault(); setActiveIndex(Math.max(filtered.length - 1, 0)); }
    // Enter runs the highlighted result; after typing, with nothing highlighted yet, it runs the top match.
    const target = filtered[safeActiveIndex] ?? (query ? filtered[0] : undefined);
    if (event.key === "Enter" && target) { event.preventDefault(); choose(target); }
    if (event.key === "Escape") {
      event.preventDefault();
      if (query) { setQuery(""); setActiveIndex(null); }
      else onClose?.();
    }
  }

  return <motion.div className={styles.palette} initial={reduced ? false : { opacity: 0, y: 6, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={reduced ? { duration: 0 } : { default: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] } }}>
    <div className={styles.searchRow}>
      <span className={styles.searchIcon}><Search width={18} height={18} strokeWidth={1.8} aria-hidden="true"/></span>
      <label className={styles.visuallyHidden} htmlFor={inputId}>{label}</label>
      <input ref={inputRef} id={inputId} role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls={`${inputId}-results`} aria-activedescendant={activeId ? `${inputId}-${activeId}` : undefined} value={query} onChange={event => { setQuery(event.target.value); setActiveIndex(null); }} onKeyDown={handleKeyDown} placeholder={placeholder} autoComplete="off"/>
      <AnimatePresence mode="popLayout" initial={false}>
        {query ? <motion.button key="clear" className={styles.clearButton} type="button" aria-label="Clear search" onClick={() => { setQuery(""); setActiveIndex(null); inputRef.current?.focus(); }} initial={reduced ? false : { opacity: 0, scale: .6, filter: `blur(${motionTokens.blur.subtle}px)` }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: .6, filter: `blur(${motionTokens.blur.subtle}px)`, transition: leave }} transition={reduced ? { duration: 0 } : { default: motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.instant } }}><X width={15} height={15} aria-hidden="true"/></motion.button> : null}
      </AnimatePresence>
      {onClose ? <button className={styles.closeButton} type="button" aria-label="Close command palette" onClick={onClose}>Esc</button> : null}
      <kbd className={styles.commandKey}>⌘ K</kbd>
    </div>
    <motion.div className={styles.resultsFrame} initial={false} animate={{ height: listHeight }} transition={reduced ? { duration: 0 } : motionTokens.spring.smooth}>
      <motion.div ref={listRef} layoutScroll id={`${inputId}-results`} className={styles.results} role="listbox" aria-label="Command results">
        <motion.span className={styles.highlight} style={{ y: highlightY, height: highlightHeight, opacity: highlightOpacity }} aria-hidden="true"/>
        {/* Results leave before the empty state arrives, so the frame makes one height change instead of two. */}
        <AnimatePresence mode="wait" initial={false}>
          {filtered.length ? <motion.div key="results" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, transition: leave }} transition={enter}>
            {/* Filtered-out rows pop out of the flow as they fade, so the rest glide up and the frame starts closing on the same keystroke. */}
            <AnimatePresence mode="popLayout" initial={false} custom={glide}>
              {groupedItems.map(([group, entries]) => <motion.div layout={glide ? "position" : false} className={styles.group} role="group" aria-label={group} key={group} variants={rowExit} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit="exit" transition={reduced ? { duration: 0 } : { default: enter, layout: motionTokens.spring.smooth }}>
                <span className={styles.groupHeading} aria-hidden="true">{group}</span>
                <AnimatePresence mode="popLayout" initial={false} custom={glide}>{entries.map(({ item, index }) => <motion.button layout={glide ? "position" : false} key={item.id} id={`${inputId}-${item.id}`} className={`${styles.result} ${index === safeActiveIndex ? styles.activeResult : ""}`} type="button" role="option" aria-selected={index === safeActiveIndex} onClick={() => choose(item)} onPointerMove={event => {
                  // Ignore the synthetic moves browsers send while the list scrolls under a still pointer.
                  if (event.clientX === lastPointer.current.x && event.clientY === lastPointer.current.y) return;
                  lastPointer.current = { x: event.clientX, y: event.clientY };
                  if (index !== safeActiveIndex) { pointer.current = true; setActiveIndex(index); }
                }} variants={rowExit} initial={reduced ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit="exit" transition={reduced ? { duration: 0 } : { default: enter, layout: motionTokens.spring.smooth }}><span className={styles.itemIcon} aria-hidden="true">{item.icon ?? <CommandIcon width={17} height={17}/>}</span><span className={styles.resultCopy}><strong>{item.label}</strong>{item.description && <small>{item.description}</small>}</span>{item.shortcut && <kbd className={styles.shortcut}>{item.shortcut}</kbd>}<ArrowRight className={styles.resultArrow} width={16} height={16} aria-hidden="true"/></motion.button>)}</AnimatePresence>
              </motion.div>)}
            </AnimatePresence>
          </motion.div> : <motion.div key="empty" className={styles.empty} initial={reduced ? false : { opacity: 0, y: 6, filter: `blur(${motionTokens.blur.subtle}px)` }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -4, transition: leave }} transition={enter}><span><Search width={20} height={20} aria-hidden="true"/></span><strong>No matching actions</strong><small>Try a different word or clear the search.</small></motion.div>}
        </AnimatePresence>
      </motion.div>
    </motion.div>
    <div className={styles.hint}><span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span><span><kbd><CornerDownLeft width={11} height={11} aria-hidden="true"/></kbd> Select</span>
      <AnimatePresence mode="popLayout" initial={false}>{query && <motion.span key="clear-hint" initial={reduced ? false : { opacity: 0, y: 3, filter: `blur(${motionTokens.blur.subtle}px)` }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, filter: `blur(${motionTokens.blur.subtle}px)`, transition: leave }} transition={enter}><kbd>esc</kbd> Clear</motion.span>}</AnimatePresence>
    </div>
  </motion.div>;
}

export default CommandPalette;
