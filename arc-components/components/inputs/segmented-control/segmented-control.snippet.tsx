"use client";

import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useLayoutEffect, useRef, type KeyboardEvent, type ReactNode } from "react";

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
const ARC_SEGMENTED_CONTROL_STYLES = `/* The frame can shrink below its content inside flex and grid parents; the track then scrolls inside it. */
.arc-segmented-control-root { display: inline-flex; min-width: 0; max-width: 100%; flex-shrink: 1; border: 1px solid var(--border); border-radius: var(--radius-control); background: var(--surface-muted); }
/* The track owns the stacking context so the gliding highlight passes under every label, not over earlier ones. */
.arc-segmented-control-track { --fade-start: 0px; --fade-end: 0px; isolation: isolate; display: flex; min-width: 0; gap: 2px; overflow-x: auto; overscroll-behavior-x: contain; padding: 3px; border-radius: inherit; scrollbar-width: none; -webkit-mask-image: linear-gradient(to right, transparent, #000 var(--fade-start), #000 calc(100% - var(--fade-end)), transparent); mask-image: linear-gradient(to right, transparent, #000 var(--fade-start), #000 calc(100% - var(--fade-end)), transparent); }
.arc-segmented-control-track::-webkit-scrollbar { display: none; }
.arc-segmented-control-track[data-fade-start] { --fade-start: 20px; }
.arc-segmented-control-track[data-fade-end] { --fade-end: 20px; }
/* Items never scale or change weight; only the highlight travels and the label color follows it. */
.arc-segmented-control-button { position: relative; flex: 0 0 auto; min-height: var(--control-height-sm); border: 0; border-radius: calc(var(--radius-control) - 3px); padding: 0 13px; background: transparent; color: var(--text-muted); font: inherit; font-size: var(--text-sm); font-weight: 500; white-space: nowrap; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: color var(--duration-fast) var(--ease-standard); }
@media (hover: hover) and (pointer: fine) { .arc-segmented-control-button:hover { color: var(--foreground); } }
.arc-segmented-control-button:active, .arc-segmented-control-button[aria-pressed="true"] { color: var(--foreground); }
.arc-segmented-control-selection { position: absolute; z-index: -1; inset: 0; border: 1px solid var(--border); border-radius: inherit; background: var(--surface); box-shadow: var(--shadow-resting); }
.arc-segmented-control-label { position: relative; z-index: 1; display: inline-flex; align-items: center; gap: 6px; }
@media (max-width: 380px) { .arc-segmented-control-button { padding: 0 10px; } }
@media (prefers-reduced-motion: reduce) { .arc-segmented-control-button { transition: none; } }
`;

const styles: Record<string, string> = new Proxy({
  "button": "arc-segmented-control-button",
  "label": "arc-segmented-control-label",
  "root": "arc-segmented-control-root",
  "selection": "arc-segmented-control-selection",
  "track": "arc-segmented-control-track"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-segmented-control-${prop}`,
});



export interface Segment { value: string; label: string; /** Optional content after the label, such as a badge. */ accessory?: ReactNode; }
export interface SegmentedControlProps {
  options: Segment[];
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  /** Called when the pointer or focus reaches an option, before it is chosen. Use it to start loading what that option shows. */
  onOptionIntent?: (value: string) => void;
  className?: string;
}

export default function SegmentedControl({ options, value, onValueChange, label, onOptionIntent, className }: SegmentedControlProps) {
  const id = useId();
  const reduced = useReducedMotion();
  const track = useRef<HTMLDivElement>(null);

  // When the options are wider than the container, the track scrolls inside itself. Edges fade only on the side with more to see.
  useLayoutEffect(() => {
    const node = track.current;
    if (!node) return;
    const edges = () => {
      const rest = node.scrollWidth - node.clientWidth - node.scrollLeft;
      node.toggleAttribute("data-fade-start", node.scrollLeft > 1);
      node.toggleAttribute("data-fade-end", rest > 1);
    };
    edges();
    node.addEventListener("scroll", edges, { passive: true });
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(edges);
    observer?.observe(node);
    return () => { node.removeEventListener("scroll", edges); observer?.disconnect(); };
  }, [options.length]);

  // The selected option is always scrolled fully into view, with a little room so it clears the fade.
  const first = useRef(true);
  useEffect(() => {
    const node = track.current;
    const button = node?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!node || !button || node.scrollWidth <= node.clientWidth) { first.current = false; return; }
    const room = 20, start = button.offsetLeft - room, end = button.offsetLeft + button.offsetWidth + room - node.clientWidth;
    const left = node.scrollLeft > start ? start : node.scrollLeft < end ? end : node.scrollLeft;
    if (left !== node.scrollLeft) node.scrollTo({ left: Math.max(0, left), behavior: first.current || reduced ? "auto" : "smooth" });
    first.current = false;
  }, [value, reduced]);

  // Arrow keys, Home and End move the selection like a tab list; only the selected option is a tab stop.
  const selectedIndex = Math.max(0, options.findIndex(option => option.value === value));
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = options.length - 1;
    const target = event.key === "ArrowRight" || event.key === "ArrowDown" ? (selectedIndex === last ? 0 : selectedIndex + 1)
      : event.key === "ArrowLeft" || event.key === "ArrowUp" ? (selectedIndex === 0 ? last : selectedIndex - 1)
        : event.key === "Home" ? 0 : event.key === "End" ? last : -1;
    if (target < 0 || !options[target]) return;
    event.preventDefault();
    onValueChange(options[target].value);
    track.current?.querySelector<HTMLElement>(`[data-value="${CSS.escape(options[target].value)}"]`)?.focus({ preventScroll: true });
  };

  return <div className={`${styles.root} ${className ?? ""}`} role="group" aria-label={label}>
    <LayoutGroup id={id}><motion.div ref={track} layoutScroll className={styles.track}>
      {options.map((option, index) => <button key={option.value} id={`${id}-${option.value}`} className={styles.button} type="button" data-value={option.value} aria-pressed={value === option.value} tabIndex={index === selectedIndex ? 0 : -1} onClick={() => onValueChange(option.value)} onKeyDown={onKeyDown} onPointerEnter={onOptionIntent ? () => onOptionIntent(option.value) : undefined} onFocus={onOptionIntent ? () => onOptionIntent(option.value) : undefined}>
        {value === option.value && <motion.span className={styles.selection} layoutId="selection" layoutDependency={value} transition={reduced ? { duration: 0 } : motionTokens.spring.morph} aria-hidden="true" />}
        <span className={styles.label}>{option.label}{option.accessory}</span>
      </button>)}
    </motion.div></LayoutGroup>
  </div>;
}
