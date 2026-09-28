"use client";

import type { ComponentPropsWithoutRef, CSSProperties, KeyboardEvent, ReactNode } from "react";
import type { Transition, Variants } from "motion/react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { ChevronDown as NavArrowDown } from "lucide-react";
import { useId, useLayoutEffect, useRef, useState } from "react";

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
const ARC_EXPANDABLE_CARD_STYLES = `/* The track centers the card and measures the room it may grow into. */
.arc-expandable-card-track { display: flex; width: 100%; min-width: 0; justify-content: center; }
.arc-expandable-card-card { width: 100%; max-width: var(--expandable-card-width, 100%); overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius-surface); background: var(--surface); box-shadow: var(--shadow-resting); }
.arc-expandable-card-card[data-expanded="true"] { max-width: var(--expandable-card-expanded-width, var(--expandable-card-width, 100%)); }
/* Once measured, the width is animated in px, so the CSS cap steps aside and never clamps the morph. */
.arc-expandable-card-card[data-measured] { max-width: 100%; }
/* The card clips the header to its corners, so the header's hover fill never changes shape while the card opens or closes. */
.arc-expandable-card-trigger { display: flex; width: 100%; min-height: 64px; align-items: center; justify-content: space-between; gap: var(--space-5); border: 0; padding: var(--space-4) var(--space-5); background: transparent; color: var(--foreground); font: inherit; text-align: left; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: background-color var(--duration-fast) var(--ease-standard); }
@media (hover: hover) and (pointer: fine) { .arc-expandable-card-trigger:hover { background: var(--surface-muted); } .arc-expandable-card-trigger:hover .arc-expandable-card-arrow { color: var(--foreground); } }
.arc-expandable-card-trigger:active { background: var(--surface-muted); }
.arc-expandable-card-copy { min-width: 0; }
.arc-expandable-card-copy strong { display: block; font-size: var(--text-sm); font-weight: 500; }
.arc-expandable-card-description { display: block; margin-top: 4px; color: var(--text-muted); font-size: var(--text-xs); font-variant-numeric: tabular-nums; }
.arc-expandable-card-roll { position: relative; display: block; }
.arc-expandable-card-word { display: inline-block; white-space: pre; }
.arc-expandable-card-srOnly { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.arc-expandable-card-arrow { display: inline-flex; flex: 0 0 auto; align-items: center; justify-content: center; color: var(--text-muted); transition: color var(--duration-fast) var(--ease-standard); }
.arc-expandable-card-card[data-expanded="true"] .arc-expandable-card-arrow { color: var(--foreground); }
/* The divider is an inset line rather than a border, so a collapsed panel is truly zero height and nothing pops at the end of the close. */
.arc-expandable-card-panel { overflow: hidden; box-shadow: inset 0 1px 0 var(--border); background: var(--surface-muted); color: var(--text-secondary); font-size: var(--text-sm); }
.arc-expandable-card-panelInner { max-width: none; padding: var(--space-4) var(--space-5) var(--space-5); }
@media (prefers-reduced-motion: reduce) { .arc-expandable-card-trigger, .arc-expandable-card-arrow { transition: none; } }
`;

const styles: Record<string, string> = new Proxy({
  "arrow": "arc-expandable-card-arrow",
  "card": "arc-expandable-card-card",
  "copy": "arc-expandable-card-copy",
  "description": "arc-expandable-card-description",
  "panel": "arc-expandable-card-panel",
  "panelInner": "arc-expandable-card-panelInner",
  "roll": "arc-expandable-card-roll",
  "srOnly": "arc-expandable-card-srOnly",
  "track": "arc-expandable-card-track",
  "trigger": "arc-expandable-card-trigger",
  "word": "arc-expandable-card-word"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-expandable-card-${prop}`,
});



export interface ExpandableCardProps extends Omit<ComponentPropsWithoutRef<"article">, "title" | "children" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration" | "onDrag" | "onDragStart" | "onDragEnd" | "onDragOver" | "onDragLeave" | "onDragEnter" | "onDragExit" | "onDrop"> {
  title: string;
  description?: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  /** Collapsed width cap in px. The card is centered and never wider than its container. Fills the container when omitted. */
  width?: number;
  /** Expanded width cap in px, so the card can grow sideways into more room. Defaults to `width`. */
  expandedWidth?: number;
}

/**
 * One morph: the box grows in width and height on the same spring, which never overshoots, so close is the exact mirror of open.
 * Size is animated for real (not with a scale), so the text, border, and corner radius never stretch.
 */
const morph = motionTokens.spring.smooth;
/** On close the details fade out first, then the box starts to shrink; on open they fade in once the box has made room. */
const closeHold = 0.06;
/** A close that reverses an open still in flight skips the hold, so the spring turns around with its velocity instead of stalling. */
const settleTime = 450;
const boxTransition = (expanded: boolean, hold: boolean): Transition => expanded || !hold ? morph : { ...morph, delay: closeHold };
const contentTransition = (expanded: boolean): Transition => expanded
  ? { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.standard], delay: 0.12 }
  : { duration: 0.1, ease: [...motionTokens.ease.standard] };
const still: Transition = { duration: 0 };

/** Changed words in the summary rise in; unchanged words hold still. */
const wordMotion: Variants = {
  enter: { opacity: 0, y: ".35em", filter: `blur(${motionTokens.blur.soft}px)` },
  center: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] } },
  exit: { opacity: 0, y: "-.3em", filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } },
};

function RollingText({ text, reduced }: { text: string; reduced: boolean }) {
  return <span className={styles.roll}>
    <span className={styles.srOnly}>{text}</span>
    <span aria-hidden="true"><AnimatePresence mode="popLayout" initial={false}>
      {text.split(/(\s+)/).map((word, index) => <motion.span key={`${index}:${word}`} className={styles.word} variants={wordMotion} initial={reduced ? false : "enter"} animate="center" exit={reduced ? undefined : "exit"}>{word}</motion.span>)}
    </AnimatePresence></span>
  </span>;
}

export function ExpandableCard({ title, description, children, defaultExpanded = false, width, expandedWidth, className, style, onKeyDown, ...rest }: ExpandableCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [hold, setHold] = useState(true);
  const lastToggle = useRef(0);
  // The room the card can use, measured from its centering track. Until it is known, CSS caps the width.
  const [room, setRoom] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const reduceMotion = useReducedMotion() ?? false;

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => setRoom(track.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  const openCap = expandedWidth ?? width;
  const fit = (cap: number | undefined) => room === null ? undefined : Math.min(room, cap ?? room);
  const boxWidth = fit(expanded ? openCap : width);
  // The details are laid out at their final width the whole time, so nothing reflows while the box changes size.
  const innerWidth = fit(openCap);

  // The width lives in a motion value: the first measurement lands without motion, later changes spring from the current width and velocity.
  const boxWidthValue = useMotionValue<number | string>("100%");
  const placed = useRef(false);
  const widthTransition = reduceMotion ? still : boxTransition(expanded, hold);
  useLayoutEffect(() => {
    if (boxWidth === undefined) return;
    if (!placed.current) { placed.current = true; boxWidthValue.jump(boxWidth); return; }
    const controls = animate(boxWidthValue, boxWidth, widthTransition);
    return () => controls.stop();
  }, [boxWidth, boxWidthValue]); // eslint-disable-line react-hooks/exhaustive-deps

  // Caps for the first paint, before the room is measured.
  const capVars = { "--expandable-card-width": width ? `${width}px` : undefined, "--expandable-card-expanded-width": openCap ? `${openCap}px` : undefined } as CSSProperties;

  const toggle = (next: boolean) => {
    const now = performance.now();
    setHold(now - lastToggle.current > settleTime);
    lastToggle.current = now;
    setExpanded(next);
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.key !== "Escape" || !expanded) return;
    event.preventDefault();
    toggle(false);
    triggerRef.current?.focus();
  };

  return <div ref={trackRef} className={styles.track}>
    <motion.article
      {...rest}
      className={[styles.card, className].filter(Boolean).join(" ")}
      data-expanded={expanded}
      data-measured={room === null ? undefined : ""}
      style={{ ...style, ...capVars, width: boxWidthValue }}
      onKeyDown={handleKeyDown}
    >
      <button ref={triggerRef} type="button" className={styles.trigger} aria-expanded={expanded} aria-controls={panelId} onClick={() => toggle(!expanded)}>
        <span className={styles.copy}><strong>{title}</strong>{description && <span className={styles.description}><RollingText text={description} reduced={reduceMotion} /></span>}</span>
        <motion.span className={styles.arrow} initial={false} animate={{ rotate: expanded ? 180 : 0 }} transition={reduceMotion ? still : boxTransition(expanded, hold)}><NavArrowDown width={18} height={18} aria-hidden="true" /></motion.span>
      </button>
      {/* The panel stays mounted so a second click mid-animation reverses from where it is; inert keeps closed details out of reach. */}
      <motion.div id={panelId} className={styles.panel} inert={!expanded} initial={false} animate={{ height: expanded ? "auto" : 0 }} transition={reduceMotion ? still : boxTransition(expanded, hold)}>
        <motion.div className={styles.panelInner} style={innerWidth === undefined ? undefined : { width: innerWidth - 2 }} initial={false} animate={{ opacity: expanded ? 1 : 0 }} transition={reduceMotion ? still : contentTransition(expanded)}>{children}</motion.div>
      </motion.div>
    </motion.article>
  </div>;
}

export default ExpandableCard;
