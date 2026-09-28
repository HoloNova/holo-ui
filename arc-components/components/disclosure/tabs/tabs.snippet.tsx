"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import type { AnimationPlaybackControls, Variants } from "motion/react";
import type { ComponentPropsWithoutRef, RefObject } from "react";
import { AnimatePresence, LayoutGroup, animate, motion, useReducedMotion } from "motion/react";
import { ChevronLeft as NavArrowLeft, ChevronRight as NavArrowRight } from "lucide-react";
import { createContext, useCallback, useContext, useId, useLayoutEffect, useRef, useState } from "react";

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
const ARC_TABS_STYLES = `/* Positioned so an outgoing panel pops out exactly where it was while the next one takes its place. */
.arc-tabs-root { position: relative; }
.arc-tabs-listShell { position: relative; display: inline-flex; max-width: 100%; min-width: 0; align-items: center; isolation: isolate; border: 1px solid var(--border); border-radius: var(--radius-control); background: var(--surface-muted); }
.arc-tabs-viewport { min-width: 0; overflow-x: auto; border-radius: inherit; scrollbar-width: none; }
.arc-tabs-viewport::-webkit-scrollbar { display: none; }
.arc-tabs-listShell[data-left="true"] .arc-tabs-viewport { mask-image: linear-gradient(to right, transparent, black 35px, black); }
.arc-tabs-listShell[data-right="true"] .arc-tabs-viewport { mask-image: linear-gradient(to right, black, black calc(100% - 35px), transparent); }
.arc-tabs-listShell[data-left="true"][data-right="true"] .arc-tabs-viewport { mask-image: linear-gradient(to right, transparent, black 35px, black calc(100% - 35px), transparent); }
/* The list owns the stacking context so the gliding highlight passes under every label, not over earlier ones. */
.arc-tabs-list { isolation: isolate; display: inline-flex; width: max-content; align-items: center; gap: var(--space-1); padding: var(--space-1); }
.arc-tabs-scrollButton { position: absolute; z-index: 2; top: 0; bottom: 0; display: grid; width: 33px; place-items: center; border: 0; background: var(--surface-muted); color: var(--foreground); }
.arc-tabs-scrollLeft { left: 0; border-radius: var(--radius-control) 0 0 var(--radius-control); }
.arc-tabs-scrollRight { right: 0; border-radius: 0 var(--radius-control) var(--radius-control) 0; }
.arc-tabs-scrollButton:disabled { opacity: 0; pointer-events: none; }
.arc-tabs-scrollButton:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: -3px; }
.arc-tabs-trigger { position: relative; -webkit-tap-highlight-color: transparent; display: inline-grid; min-width: 5.5rem; place-items: center; flex: 0 0 auto; min-height: var(--control-height-sm); border: 0; border-radius: calc(var(--radius-control) - 3px); padding: 0 var(--space-3); background: transparent; color: var(--text-muted); font: inherit; font-size: var(--text-sm); font-weight: 500; white-space: nowrap; cursor: pointer; transition: color var(--duration-fast) var(--ease-standard); }
@media (hover: hover) and (pointer: fine) { .arc-tabs-trigger:hover { color: var(--foreground); } }
.arc-tabs-trigger:active { color: var(--foreground); }.arc-tabs-trigger[data-state="active"] { color: var(--accent-strong); }
.arc-tabs-selection { position: absolute; z-index: -1; inset: 0; border: 1px solid var(--border); border-radius: inherit; background: var(--surface); box-shadow: var(--shadow-resting); will-change: transform; }
.arc-tabs-triggerLabel { position: relative; z-index: 1; }
.arc-tabs-trigger:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.arc-tabs-trigger:disabled { cursor: not-allowed; opacity: .5; }
.arc-tabs-content { margin-top: var(--space-4); color: var(--text-secondary); font-size: var(--text-sm); line-height: var(--leading-body); }
/* The outgoing panel is lifted out of flow by the presence animation; drop its margin so it stays in place and ignore stray clicks. */
.arc-tabs-content[data-motion-pop-id] { margin-top: 0; }
.arc-tabs-content[data-state="inactive"] { pointer-events: none; }
.arc-tabs-content:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 3px; border-radius: var(--radius-control); }
@media (prefers-reduced-motion: reduce) { .arc-tabs-trigger { transition: none; } }
`;

const styles: Record<string, string> = new Proxy({
  "content": "arc-tabs-content",
  "list": "arc-tabs-list",
  "listShell": "arc-tabs-listShell",
  "root": "arc-tabs-root",
  "scrollButton": "arc-tabs-scrollButton",
  "scrollLeft": "arc-tabs-scrollLeft",
  "scrollRight": "arc-tabs-scrollRight",
  "selection": "arc-tabs-selection",
  "trigger": "arc-tabs-trigger",
  "triggerLabel": "arc-tabs-triggerLabel",
  "viewport": "arc-tabs-viewport"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-tabs-${prop}`,
});



type RootProps = ComponentPropsWithoutRef<typeof TabsPrimitive.Root>;
/** `direction` is +1 when the new tab sits after the old one; `panelHeightRef` holds the visible panel height so the next panel can morph from it; `leavingRectRef` pins the outgoing panel where it was on screen. */
const TabsContext = createContext<{ active: string; layoutId: string; direction: number; panelHeightRef: RefObject<number | null>; leavingRectRef: RefObject<DOMRect | null> }>({ active: "", layoutId: "tabs", direction: 1, panelHeightRef: { current: null }, leavingRectRef: { current: null } });

export function Tabs({ value, defaultValue, onValueChange, className, ...props }: RootProps) {
  const [internal, setInternal] = useState(defaultValue ?? "");
  const [direction, setDirection] = useState(1);
  const active = value ?? internal;
  const layoutId = useId();
  const root = useRef<HTMLDivElement>(null);
  const panelHeightRef = useRef<number | null>(null);
  const leavingRectRef = useRef<DOMRect | null>(null);
  function handleChange(next: string) {
    const frame = root.current;
    leavingRectRef.current = frame?.querySelector(':scope > [role="tabpanel"][data-state="active"]')?.getBoundingClientRect() ?? null;
    const order = frame ? Array.from(frame.querySelectorAll<HTMLElement>('[role="tab"][data-value]')).filter(tab => tab.closest(`.${styles.root}`) === frame).map(tab => tab.dataset.value) : [];
    const from = order.indexOf(active), to = order.indexOf(next);
    if (from >= 0 && to >= 0 && from !== to) setDirection(to > from ? 1 : -1);
    if (value === undefined) setInternal(next); onValueChange?.(next);
  }
  return <TabsContext.Provider value={{ active, layoutId, direction, panelHeightRef, leavingRectRef }}><LayoutGroup id={layoutId}><TabsPrimitive.Root {...props} ref={root} className={[styles.root, className].filter(Boolean).join(" ")} value={active} onValueChange={handleChange}/></LayoutGroup></TabsContext.Provider>;
}

export function TabsList({ className, ...props }: ComponentPropsWithoutRef<typeof TabsPrimitive.List>) {
  const { active } = useContext(TabsContext);
  const reduced = useReducedMotion();
  const shell = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ overflow: false, left: false, right: false });
  const update = useCallback(() => {
    const frame = shell.current;
    const scroll = viewport.current;
    if (!frame || !scroll) return;
    const max = Math.max(0, scroll.scrollWidth - scroll.clientWidth);
    const next = { overflow: scroll.scrollWidth > frame.clientWidth + 1, left: scroll.scrollLeft > 1, right: scroll.scrollLeft < max - 1 };
    setEdges(previous => previous.overflow === next.overflow && previous.left === next.left && previous.right === next.right ? previous : next);
  }, []);
  const reveal = useCallback((tab: HTMLElement | null) => {
    const scroll = viewport.current;
    if (!scroll || !tab) return;
    const frame = scroll.getBoundingClientRect();
    const item = tab.getBoundingClientRect();
    const max = Math.max(0, scroll.scrollWidth - scroll.clientWidth);
    const left = frame.left + (scroll.scrollLeft > 1 ? 34 : 0);
    const right = frame.right - (scroll.scrollLeft < max - 1 ? 34 : 0);
    const delta = item.left < left ? item.left - left : item.right > right ? item.right - right : 0;
    if (delta) scroll.scrollBy({ left: delta, behavior: reduced ? "instant" : "smooth" });
  }, [reduced]);
  useLayoutEffect(() => {
    const frame = shell.current;
    const scroll = viewport.current;
    const content = list.current;
    if (!frame || !scroll || !content) return;
    const observer = new ResizeObserver(update);
    observer.observe(frame);
    observer.observe(scroll);
    observer.observe(content);
    scroll.addEventListener("scroll", update, { passive: true });
    update();
    return () => { observer.disconnect(); scroll.removeEventListener("scroll", update); };
  }, [update]);
  useLayoutEffect(() => { reveal(list.current?.querySelector<HTMLElement>('[role="tab"][data-state="active"]') ?? null); }, [active, reveal]);
  const scrollTabs = (direction: number) => viewport.current?.scrollBy({ left: direction * (viewport.current?.clientWidth ?? 0) * .75, behavior: reduced ? "instant" : "smooth" });
  return <div ref={shell} className={styles.listShell} data-overflow={edges.overflow} data-left={edges.left} data-right={edges.right}>
    {edges.overflow && <button type="button" className={`${styles.scrollButton} ${styles.scrollLeft}`} aria-label="Scroll tabs left" disabled={!edges.left} onClick={() => scrollTabs(-1)}><NavArrowLeft width={17} height={17} aria-hidden="true"/></button>}
    <motion.div ref={viewport} layoutScroll className={styles.viewport} onFocusCapture={event => { if (event.target instanceof HTMLElement && event.target.getAttribute("role") === "tab") reveal(event.target); }}>
      <TabsPrimitive.List {...props} ref={list} className={[styles.list, className].filter(Boolean).join(" ")}/>
    </motion.div>
    {edges.overflow && <button type="button" className={`${styles.scrollButton} ${styles.scrollRight}`} aria-label="Scroll tabs right" disabled={!edges.right} onClick={() => scrollTabs(1)}><NavArrowRight width={17} height={17} aria-hidden="true"/></button>}
  </div>;
}

export function TabsTrigger({ className, children, value, ...props }: ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) {
  const { active } = useContext(TabsContext);
  const reduced = useReducedMotion();
  // The LayoutGroup in Tabs scopes the highlight to this instance, so it glides between triggers but never flies in from another tab set.
  return <TabsPrimitive.Trigger {...props} value={value} data-value={value} className={[styles.trigger, className].filter(Boolean).join(" ")}>
    {active === value && <motion.span className={styles.selection} layoutId="selection" layoutDependency={active} transition={reduced ? { duration: 0 } : motionTokens.spring.morph} aria-hidden="true"/>}
    <span className={styles.triggerLabel}>{children}</span>
  </TabsPrimitive.Trigger>;
}

const panelMotion: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 8 }),
  center: { opacity: 1, x: 0, transition: { opacity: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }, x: motionTokens.spring.smooth } },
  exit: (direction: number) => ({ opacity: 0, x: direction * -6, transition: { duration: motionTokens.duration.instant, ease: [...motionTokens.ease.standard] } }),
};
/** Reduced motion: a short crossfade in place. Keys match panelMotion so server and client render identical styles. */
const panelFade: Variants = {
  enter: { opacity: 0, x: 0 },
  center: { opacity: 1, x: 0, transition: { duration: motionTokens.duration.instant } },
  exit: { opacity: 0, x: 0, transition: { duration: .1 } },
};

export function TabsContent({ className, value, forceMount, children, ...props }: ComponentPropsWithoutRef<typeof TabsPrimitive.Content>) {
  const { active, direction, panelHeightRef, leavingRectRef } = useContext(TabsContext);
  const reduced = useReducedMotion();
  const panel = useRef<HTMLDivElement>(null);
  const selected = active === value;
  const classes = [styles.content, className].filter(Boolean).join(" ");
  // The incoming panel starts at the outgoing panel's height and settles at its own, so content below glides instead of jumping.
  useLayoutEffect(() => {
    const node = panel.current;
    if (!node || forceMount) return;
    // Outgoing: the tab root may have changed size around it, so pin the panel to where it was while it fades.
    if (!selected) { const before = leavingRectRef.current; const now = node.getBoundingClientRect(); if (before) node.style.translate = `${before.left - now.left}px ${before.top - now.top}px`; node.inert = true; return; }
    node.style.translate = ""; node.inert = false;
    const from = panelHeightRef.current;
    const to = node.offsetHeight;
    let controls: AnimationPlaybackControls | undefined;
    const release = () => { node.style.height = ""; node.style.overflow = ""; };
    if (from !== null && Math.abs(from - to) > 1 && !reduced) {
      if (to > from) node.style.overflow = "clip";
      controls = animate(node, { height: [from, to] }, { ...motionTokens.spring.smooth, onComplete: release });
    }
    panelHeightRef.current = controls && from !== null ? from : to;
    const observer = new ResizeObserver(() => { panelHeightRef.current = node.offsetHeight; });
    observer.observe(node);
    return () => { observer.disconnect(); controls?.stop(); release(); };
  }, [selected, reduced, forceMount, panelHeightRef, leavingRectRef]);
  if (forceMount) return <TabsPrimitive.Content {...props} value={value} forceMount className={classes}>{children}</TabsPrimitive.Content>;
  return <AnimatePresence initial={false} mode="popLayout" custom={direction}>
    {selected && <TabsPrimitive.Content {...props} key={value} value={value} forceMount asChild>
      <motion.div ref={panel} className={classes} custom={direction} variants={reduced ? panelFade : panelMotion} initial="enter" animate="center" exit="exit">{children}</motion.div>
    </TabsPrimitive.Content>}
  </AnimatePresence>;
}
