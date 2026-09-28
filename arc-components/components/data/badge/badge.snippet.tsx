"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { AnimatePresence, animate, motion, useIsPresent, useMotionValue, useReducedMotion, type AnimationPlaybackControls, type HTMLMotionProps, type TargetAndTransition, type Transition } from "motion/react";
import { isValidElement, useEffect, useLayoutEffect, useRef } from "react";

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
const ARC_BADGE_STYLES = `.arc-badge-badge {
  display: inline-flex;
  min-height: 26px;
  align-items: center;
  border: 1px solid var(--badge-border, var(--border));
  border-radius: var(--radius-pill);
  padding: 0 10px;
  color: var(--badge-foreground, var(--foreground));
  background: var(--badge-background, var(--surface));
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: -.01em;
  line-height: 1;
  white-space: nowrap;
  /* Clip keeps the inline baseline while the pill morphs around swapped text. */
  overflow: clip;
  transition: border-color var(--duration-standard) var(--ease-standard), background-color var(--duration-standard) var(--ease-standard), color var(--duration-standard) var(--ease-standard);
}

@media (hover: hover) and (pointer: fine) {
  .arc-badge-badge:hover { border-color: color-mix(in oklch, var(--badge-color, var(--foreground)) 32%, var(--border)); background: color-mix(in oklch, var(--badge-color, var(--foreground)) 10%, var(--surface)); }
}
.arc-badge-sm { min-height: 22px; padding: 0 8px; font-size: 11px; }
.arc-badge-md { font-size: var(--text-xs); }

.arc-badge-body { display: block; }
.arc-badge-content { position: relative; display: inline-flex; width: max-content; align-items: center; gap: 5px; }
.arc-badge-sm .arc-badge-content { gap: 4px; }
.arc-badge-label, .arc-badge-glyph { position: relative; display: inline-flex; align-items: center; }
.arc-badge-text { display: block; }

.arc-badge-icon {
  position: relative;
  display: inline-flex;
  width: auto;
  height: auto;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  color: var(--badge-color, var(--foreground));
  line-height: 1;
}

.arc-badge-neutral { --badge-color: var(--text-secondary); --badge-foreground: var(--text-secondary); --badge-background: var(--surface-muted); --badge-border: var(--border); }
.arc-badge-success { --badge-color: var(--success); --badge-foreground: var(--success); --badge-background: color-mix(in oklch, var(--success) 10%, var(--surface)); --badge-border: color-mix(in oklch, var(--success) 25%, var(--border)); }
.arc-badge-info { --badge-color: var(--accent); --badge-foreground: var(--accent-strong); --badge-background: var(--accent-subtle); --badge-border: color-mix(in oklch, var(--accent) 24%, var(--border)); }
.arc-badge-warning { --badge-color: var(--warning); --badge-foreground: var(--warning); --badge-background: color-mix(in oklch, var(--warning) 11%, var(--surface)); --badge-border: color-mix(in oklch, var(--warning) 27%, var(--border)); }
.arc-badge-danger { --badge-color: var(--danger); --badge-foreground: var(--danger); --badge-background: color-mix(in oklch, var(--danger) 10%, var(--surface)); --badge-border: color-mix(in oklch, var(--danger) 26%, var(--border)); }

@media (prefers-reduced-motion: reduce) {
  .arc-badge-badge { transition-duration: var(--duration-instant); }
}
`;

const styles: Record<string, string> = new Proxy({
  "badge": "arc-badge-badge",
  "body": "arc-badge-body",
  "content": "arc-badge-content",
  "danger": "arc-badge-danger",
  "glyph": "arc-badge-glyph",
  "icon": "arc-badge-icon",
  "info": "arc-badge-info",
  "label": "arc-badge-label",
  "md": "arc-badge-md",
  "neutral": "arc-badge-neutral",
  "sm": "arc-badge-sm",
  "success": "arc-badge-success",
  "text": "arc-badge-text",
  "warning": "arc-badge-warning"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-badge-${prop}`,
});



export type BadgeTone = "neutral" | "success" | "info" | "warning" | "danger";
export type BadgeSize = "sm" | "md";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  size?: BadgeSize;
  icon?: ReactNode;
}

const exitFast: Transition = { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] };
const textIn: TargetAndTransition = { opacity: 0, y: "0.3em", filter: `blur(${motionTokens.blur.soft}px)` };
const textOut: TargetAndTransition = { opacity: 0, y: "-0.3em", filter: `blur(${motionTokens.blur.subtle}px)`, transition: exitFast };
const iconIn: TargetAndTransition = { opacity: 0, scale: .6, filter: `blur(${motionTokens.blur.subtle}px)` };
const shown: TargetAndTransition = { opacity: 1, y: "0em", scale: 1, filter: "blur(0px)" };
const fadeOnly: TargetAndTransition = { opacity: 0, transition: { duration: motionTokens.duration.instant } };

/** Outgoing copies are hidden from assistive tech while they fade, so only the current text is read. */
function Swap(props: HTMLMotionProps<"span">) {
  const present = useIsPresent();
  return <motion.span {...props} aria-hidden={present ? props["aria-hidden"] : true} />;
}

/** A new icon component crossfades in; re-rendering the same icon stays still. */
function iconKey(icon: ReactNode) {
  if (!isValidElement(icon)) return "icon";
  const type = icon.type as string | { displayName?: string; name?: string };
  return typeof type === "string" ? type : type.displayName ?? type.name ?? "icon";
}

export function Badge({ tone = "neutral", size = "md", icon, className, children, ...props }: BadgeProps) {
  const reduce = useReducedMotion();
  const text = typeof children === "string" || typeof children === "number" ? String(children) : null;
  const glyphKey = icon ? iconKey(icon) : "";
  const body = useRef<HTMLSpanElement>(null);
  const content = useRef<HTMLSpanElement>(null);
  // Width stays auto at rest. Only a new label or icon springs it from the old size to the new one; passive reflows (a font swap, a hidden parent) follow instantly.
  const width = useMotionValue<number | "auto">("auto");
  const changedAt = useRef(0);
  useLayoutEffect(() => { changedAt.current = performance.now(); }, [text, glyphKey]);
  useEffect(() => {
    const node = content.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    let last: number | undefined;
    let controls: AnimationPlaybackControls | undefined;
    const settle = () => { width.jump("auto"); if (body.current) body.current.style.width = "auto"; };
    const observer = new ResizeObserver(([entry]) => {
      const next = entry.borderBoxSize?.[0]?.inlineSize ?? node.offsetWidth;
      const current = width.get();
      const from = typeof current === "number" ? current : last;
      last = next;
      controls?.stop();
      if (reduce || from === undefined || from === next || performance.now() - changedAt.current > 120) return settle();
      // Pin the old width before this frame paints, then spring to the new one.
      if (body.current) body.current.style.width = `${from}px`;
      controls = animate(width, [from, next], { ...motionTokens.spring.morph, onComplete: settle });
    });
    observer.observe(node);
    return () => { observer.disconnect(); controls?.stop(); };
  }, [width, reduce]);
  const enter: Transition = reduce ? { duration: motionTokens.duration.instant } : { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] };
  const classes = [styles.badge, styles[tone], styles[size], className].filter(Boolean).join(" ");
  // The pill follows its content: text and icon swap in place while the width springs to the new size.
  return <span {...props} className={classes}>
    <motion.span ref={body} className={styles.body} style={{ width }}>
      <span ref={content} className={styles.content}>
        {icon ? <span className={styles.icon} aria-hidden="true"><AnimatePresence mode="popLayout" initial={false}><Swap key={glyphKey} className={styles.glyph} initial={reduce ? { opacity: 0 } : iconIn} animate={shown} exit={reduce ? fadeOnly : { ...iconIn, transition: exitFast }} transition={reduce ? enter : motionTokens.spring.snappy}>{icon}</Swap></AnimatePresence></span> : null}
        {text === null ? children : <span className={styles.label}><AnimatePresence mode="popLayout" initial={false}><Swap key={text} className={styles.text} initial={reduce ? { opacity: 0 } : textIn} animate={shown} exit={reduce ? fadeOnly : textOut} transition={enter}>{text}</Swap></AnimatePresence></span>}
      </span>
    </motion.span>
  </span>;
}

export default Badge;
