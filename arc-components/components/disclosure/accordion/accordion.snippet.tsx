"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import type { ReactNode } from "react";
import type { TargetAndTransition, Variants } from "motion/react";
import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";

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
const ARC_ACCORDION_STYLES = `.arc-accordion-accordion { width: 100%; border-top: 1px solid var(--border); }
.arc-accordion-item { border-bottom: 1px solid var(--border); }
.arc-accordion-header { margin: 0; }
.arc-accordion-trigger { display: flex; width: 100%; min-height: var(--control-height-lg); align-items: center; justify-content: space-between; gap: var(--space-5); padding: var(--space-2) 0; border: 0; background: transparent; color: var(--foreground); font: inherit; font-size: var(--text-sm); font-weight: 500; line-height: var(--leading-body); text-align: left; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: color var(--duration-fast) var(--ease-standard); }
@media (hover: hover) and (pointer: fine) { .arc-accordion-trigger:hover { color: var(--text-secondary); } .arc-accordion-trigger:hover .arc-accordion-icon { color: var(--foreground); } }
.arc-accordion-trigger:focus-visible { outline: 3px solid var(--focus-ring); outline-offset: 3px; border-radius: var(--radius-control); }
/* Rotation is driven by a spring in accordion.tsx; CSS only handles color. */
.arc-accordion-icon { display: inline-flex; flex: 0 0 auto; color: var(--text-muted); transition: color var(--duration-fast) var(--ease-standard); }
.arc-accordion-trigger[data-state="open"] .arc-accordion-icon { color: var(--foreground); }
.arc-accordion-panel { overflow: hidden; color: var(--text-secondary); font-size: var(--text-sm); line-height: var(--leading-body); }
.arc-accordion-panelInner { padding: 0 var(--space-8) var(--space-5) 0; }
.arc-accordion-lg .arc-accordion-trigger { min-height: 76px; gap: var(--space-8); padding-block: var(--space-5); font-size: var(--text-lg); letter-spacing: var(--tracking-body); }
.arc-accordion-lg .arc-accordion-panel { font-size: var(--text-base); line-height: 1.65; }
.arc-accordion-lg .arc-accordion-panelInner { max-width: 62ch; padding: 0 var(--space-12) var(--space-6) 0; }
@media (max-width: 520px) { .arc-accordion-lg .arc-accordion-trigger { min-height: 68px; font-size: var(--text-base); } .arc-accordion-lg .arc-accordion-panel { font-size: var(--text-sm); } .arc-accordion-lg .arc-accordion-panelInner { padding-right: var(--space-6); } }
@media (prefers-reduced-motion: reduce) { .arc-accordion-trigger, .arc-accordion-icon { transition: none; } }
`;

const styles: Record<string, string> = new Proxy({
  "accordion": "arc-accordion-accordion",
  "header": "arc-accordion-header",
  "icon": "arc-accordion-icon",
  "item": "arc-accordion-item",
  "lg": "arc-accordion-lg",
  "panel": "arc-accordion-panel",
  "panelInner": "arc-accordion-panelInner",
  "trigger": "arc-accordion-trigger",
  "tsx": "arc-accordion-tsx"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-accordion-${prop}`,
});



export interface AccordionItem { title: string; content: ReactNode; }
export interface AccordionProps {
  items: AccordionItem[];
  defaultOpen?: number;
  /** "lg" suits page-level FAQs: questions at the large text size, answers at body size. */
  size?: "md" | "lg";
}

/** Height follows the content on a spring that never overshoots; closed panels leave the accessibility tree once they finish collapsing. */
const panelOpen: TargetAndTransition = { height: "auto", opacity: 1, visibility: "visible" };
const panelClosed: TargetAndTransition = { height: 0, opacity: 0, transitionEnd: { visibility: "hidden" } };
/** The answer settles down into place with a brief focus pull as the panel opens. */
const contentOpen: TargetAndTransition = { y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } };
const contentClosed: TargetAndTransition = { y: -6, filter: `blur(${motionTokens.blur.subtle}px)` };
const panelMotion: Variants = {
  open: { ...panelOpen, transition: { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] } } },
  closed: { ...panelClosed, transition: { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } } },
};
const contentMotion: Variants = {
  open: { ...contentOpen, transition: { y: motionTokens.spring.smooth, filter: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] } } },
  closed: { ...contentClosed, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } },
};
/** Reduced motion: same end states in one step, so server and client render identical styles. */
const panelStill: Variants = { open: { ...panelOpen, transition: { duration: 0 } }, closed: { ...panelClosed, transition: { duration: 0 } } };
const contentStill: Variants = { open: { ...contentOpen, transition: { duration: 0 } }, closed: { ...contentClosed, transition: { duration: 0 } } };

export function Accordion({ items, defaultOpen = 0, size = "md" }: AccordionProps) {
  const initialValue = defaultOpen >= 0 && defaultOpen < items.length ? String(defaultOpen) : "";
  const [openValue, setOpenValue] = useState(initialValue);
  const reduced = useReducedMotion();
  return <AccordionPrimitive.Root className={[styles.accordion, size === "lg" ? styles.lg : ""].filter(Boolean).join(" ")} type="single" collapsible value={openValue} onValueChange={setOpenValue}>
    {items.map((item, index) => { const open = openValue === String(index); return <AccordionPrimitive.Item className={styles.item} value={String(index)} key={`${item.title}-${index}`}>
      <AccordionPrimitive.Header className={styles.header}>
        <AccordionPrimitive.Trigger className={styles.trigger}>
          <span>{item.title}</span><motion.span className={styles.icon} initial={false} animate={{ rotate: open ? 180 : 0 }} transition={reduced ? { duration: 0 } : motionTokens.spring.snappy}><ChevronDown width={17} height={17} aria-hidden="true" /></motion.span>
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      {/* Radix keeps semantics and ids; motion owns the height so a toggle mid-flight retargets instead of restarting. */}
      <AccordionPrimitive.Content forceMount asChild>
        <motion.div className={styles.panel} initial={false} animate={open ? "open" : "closed"} variants={reduced ? panelStill : panelMotion}>
          <motion.div className={styles.panelInner} variants={reduced ? contentStill : contentMotion}>{item.content}</motion.div>
        </motion.div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>; })}
  </AccordionPrimitive.Root>;
}

export default Accordion;
