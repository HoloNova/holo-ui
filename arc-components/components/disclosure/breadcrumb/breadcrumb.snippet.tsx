"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronRight as NavArrowRight } from "lucide-react";

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
const ARC_BREADCRUMB_STYLES = `/* The gap between crumbs matches the gap inside one, so every chevron sits centered between its two labels. */
.arc-breadcrumb-list { position: relative; display: flex; flex-wrap: wrap; align-items: center; gap: 2px 6px; margin: 0; padding: 0; list-style: none; }
.arc-breadcrumb-list li { display: inline-flex; align-items: center; gap: 6px; color: var(--text-muted); font-size: var(--text-sm); line-height: var(--leading-body); white-space: nowrap; }
.arc-breadcrumb-list li > svg { width: 16px; height: 16px; flex: 0 0 auto; color: var(--border-strong); stroke-width: 1.75; }
/* Each crumb reserves the width of its medium weight label, so becoming the current page never shifts the path. */
.arc-breadcrumb-list a, .arc-breadcrumb-list li > span, .arc-breadcrumb-list li > button { display: inline-flex; flex-direction: column; border-radius: 7px; padding: 4px 2px; }
.arc-breadcrumb-list a::after, .arc-breadcrumb-list li > span::after, .arc-breadcrumb-list li > button::after { height: 0; overflow: hidden; content: attr(data-label); font-weight: 500; visibility: hidden; user-select: none; pointer-events: none; }
.arc-breadcrumb-list li > button { border: 0; margin: 0; background: none; font: inherit; line-height: inherit; text-align: start; cursor: pointer; }
.arc-breadcrumb-list a, .arc-breadcrumb-list li > button { color: var(--text-secondary); text-decoration: underline 1px; text-decoration-color: transparent; text-underline-offset: 4px; transition: color var(--duration-fast) var(--ease-standard), text-decoration-color var(--duration-fast) var(--ease-standard); }
.arc-breadcrumb-list a:focus-visible, .arc-breadcrumb-list li > button:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.arc-breadcrumb-list [aria-current="page"] { color: var(--accent-strong); font-weight: 500; transition: color var(--duration-fast) var(--ease-standard); }
@media (hover: hover) and (pointer: fine) { .arc-breadcrumb-list a:hover, .arc-breadcrumb-list li > button:hover { color: var(--accent-strong); text-decoration-color: color-mix(in oklch, currentColor 45%, transparent); } }
@media (prefers-reduced-motion: reduce) { .arc-breadcrumb-list a, .arc-breadcrumb-list li > button, .arc-breadcrumb-list [aria-current="page"] { transition: none; } }
`;

const styles: Record<string, string> = new Proxy({
  "list": "arc-breadcrumb-list"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-breadcrumb-${prop}`,
});

export interface BreadcrumbItem {
  label: string;
  href?: string;
  /** Runs when the crumb is chosen. Without an href the crumb renders as a button, for paths that live in local state. */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}
export interface BreadcrumbProps { items: BreadcrumbItem[]; ariaLabel?: string }
/** Crumbs present on first render stay still; crumbs added later slide in from the path before them. */
export function Breadcrumb({ items, ariaLabel = "Breadcrumb" }: BreadcrumbProps) {
  const reduced = useReducedMotion() ?? false;
  const still = { duration: 0 };
  const path = items.map(item => item.label).join("/");
  return <nav aria-label={ariaLabel}><ol className={styles.list}><AnimatePresence mode="popLayout" initial={false}>{items.map((item, index) => {
    const current = index === items.length - 1;
    return <motion.li key={`${item.label}-${index}`}
      layout={reduced ? false : "position"} layoutDependency={path}
      initial={reduced ? false : { opacity: 0, x: -8, filter: `blur(${motionTokens.blur.subtle}px)` }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      exit={reduced ? { opacity: 0, transition: still } : { opacity: 0, x: -4, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.instant, ease: [...motionTokens.ease.standard] } }}
      transition={reduced ? still : { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter], layout: motionTokens.spring.smooth }}>
      {index > 0 && <NavArrowRight width={14} height={14} aria-hidden="true"/>}
      {!current && item.href ? <Link href={item.href} data-label={item.label} onClick={item.onClick}>{item.label}</Link>
        : !current && item.onClick ? <button type="button" data-label={item.label} onClick={item.onClick}>{item.label}</button>
        : <span aria-current={current ? "page" : undefined} data-label={item.label}>{item.label}</span>}
    </motion.li>;
  })}</AnimatePresence></ol></nav>;
}
