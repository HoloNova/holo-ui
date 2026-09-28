"use client";

import type { KeyboardEvent, ReactNode } from "react";
import type { Variants } from "motion/react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Plus } from "lucide-react";
import { forwardRef, useId, useMemo, useState } from "react";

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
const ARC_FAQ_SECTION_STYLES = `.arc-faq-section-faq { container: faq / inline-size; background: var(--background); color: var(--foreground); font-family: var(--font-body); letter-spacing: var(--tracking-body); }

.arc-faq-section-stack { display: grid; gap: var(--space-8); max-width: 720px; margin: 0 auto; padding: var(--space-20) var(--space-6); }
.arc-faq-section-intro { display: grid; gap: var(--space-3); }
.arc-faq-section-accordion .arc-faq-section-intro, .arc-faq-section-search .arc-faq-section-intro { justify-items: center; text-align: center; }
.arc-faq-section-title { margin: 0; font-family: var(--font-display); font-size: clamp(1.75rem, 1rem + 3cqi, var(--text-4xl)); font-weight: 500; letter-spacing: var(--tracking-display); line-height: var(--leading-display); text-wrap: balance; }
.arc-faq-section-description { max-width: 480px; margin: 0; color: var(--text-secondary); font-size: var(--text-base); line-height: var(--leading-body); text-wrap: pretty; }

.arc-faq-section-list { margin: 0; padding: 0; border-top: 1px solid var(--border); list-style: none; }
.arc-faq-section-item { overflow: hidden; border-bottom: 1px solid var(--border); }
.arc-faq-section-heading { margin: 0; font: inherit; }
.arc-faq-section-trigger { display: flex; width: 100%; min-height: 64px; align-items: center; justify-content: space-between; gap: var(--space-4); border: 0; padding: var(--space-4) var(--space-1); background: none; color: var(--foreground); font: inherit; font-size: var(--text-base); font-weight: 500; line-height: var(--leading-body); text-align: left; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.arc-faq-section-question { min-width: 0; }
.arc-faq-section-icon { flex: none; color: var(--text-muted); transition: transform var(--duration-spring) var(--ease-spring), color var(--duration-fast) var(--ease-standard); }
.arc-faq-section-item[data-open] .arc-faq-section-icon { color: var(--foreground); transform: rotate(45deg); }
@media (hover: hover) and (pointer: fine) { .arc-faq-section-trigger:hover .arc-faq-section-icon { color: var(--foreground); } }
.arc-faq-section-panel { overflow: hidden; }
.arc-faq-section-answer { margin: 0; padding: 0 var(--space-10) var(--space-5) var(--space-1); color: var(--text-secondary); font-size: var(--text-base); line-height: 1.6; text-wrap: pretty; }
.arc-faq-section-hint { overflow: hidden; margin: 0; padding: 0 var(--space-10) var(--space-4) var(--space-1); color: var(--text-muted); font-size: var(--text-sm); line-height: var(--leading-body); }
.arc-faq-section-mark { border-radius: 4px; padding: 0 1px; background: var(--accent-subtle); color: inherit; }

.arc-faq-section-contact { display: flex; width: 100%; align-items: center; justify-content: space-between; gap: var(--space-4); border: 1px solid var(--border); border-radius: 20px; padding: var(--space-4) var(--space-5); background: var(--surface); color: var(--foreground); font: inherit; text-align: left; text-decoration: none; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: transform var(--duration-fast) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard); }
.arc-faq-section-contact:active { transform: scale(.99); }
.arc-faq-section-contactText { display: grid; gap: 2px; min-width: 0; }
.arc-faq-section-contactText > span:first-child { font-size: var(--text-sm); font-weight: 500; }
.arc-faq-section-contactText > span:last-child:not(:first-child) { color: var(--text-muted); font-size: var(--text-sm); }
.arc-faq-section-contactArrow { flex: none; color: var(--text-muted); transition: transform var(--duration-fast) var(--ease-standard); }
@media (hover: hover) and (pointer: fine) {
  .arc-faq-section-contact:hover { background: var(--surface-muted); }
  .arc-faq-section-contact:hover .arc-faq-section-contactArrow { color: var(--foreground); transform: translateX(2px); }
}

/* Two column: a topic rail beside the questions for that topic. */
.arc-faq-section-columnsGrid { display: grid; max-width: 1120px; grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr); align-items: start; gap: var(--space-16); margin: 0 auto; padding: var(--space-20) var(--space-8); }
.arc-faq-section-rail { position: sticky; top: var(--space-6); display: grid; gap: var(--space-6); }
.arc-faq-section-categories { display: grid; gap: 2px; }
.arc-faq-section-category { position: relative; isolation: isolate; display: flex; height: 40px; align-items: center; justify-content: space-between; gap: var(--space-3); border: 0; border-radius: 12px; padding: 0 var(--space-3); background: none; color: var(--text-secondary); font: inherit; font-size: var(--text-sm); font-weight: 500; text-align: left; white-space: nowrap; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: color var(--duration-fast) var(--ease-standard); }
.arc-faq-section-category[aria-pressed="true"] { color: var(--foreground); }
@media (hover: hover) and (pointer: fine) { .arc-faq-section-category:hover { color: var(--foreground); } }
.arc-faq-section-categoryHighlight { position: absolute; z-index: -1; inset: 0; border-radius: inherit; background: var(--surface-muted); }
.arc-faq-section-count { color: var(--text-muted); font-size: var(--text-xs); font-variant-numeric: tabular-nums; }
.arc-faq-section-stage { position: relative; min-width: 0; }
.arc-faq-section-stageFace { width: 100%; }

/* Searchable */
.arc-faq-section-searchRow { display: grid; gap: var(--space-2); }
.arc-faq-section-resultCount { margin: 0; color: var(--text-muted); font-size: var(--text-sm); font-variant-numeric: tabular-nums; }
.arc-faq-section-empty { display: grid; justify-items: center; gap: var(--space-3); padding: var(--space-6) 0; text-align: center; }
.arc-faq-section-empty p { margin: 0; color: var(--text-secondary); font-size: var(--text-sm); }
.arc-faq-section-clear { height: var(--control-height-sm); border: 1px solid var(--border); border-radius: var(--radius-control); padding: 0 var(--space-4); background: var(--surface); color: var(--foreground); font: inherit; font-size: var(--text-sm); font-weight: 500; cursor: pointer; transition: transform var(--duration-fast) var(--ease-standard); }
.arc-faq-section-clear:active { transform: scale(.97); }

@container faq (max-width: 760px) {
  .arc-faq-section-columnsGrid { grid-template-columns: minmax(0, 1fr); gap: var(--space-8); padding-inline: var(--space-6); }
  .arc-faq-section-rail { position: static; }
  .arc-faq-section-categories { display: flex; overflow-x: auto; scrollbar-width: none; }
  .arc-faq-section-categories::-webkit-scrollbar { display: none; }
  .arc-faq-section-category { flex: none; }
}
@container faq (max-width: 480px) {
  .arc-faq-section-stack, .arc-faq-section-columnsGrid { padding: var(--space-12) var(--space-4); }
  .arc-faq-section-answer, .arc-faq-section-hint { padding-right: var(--space-2); }
}

.arc-faq-section-preview { display: grid; width: 100%; justify-items: center; gap: var(--space-4); }
.arc-faq-section-frame { width: 100%; overflow: hidden; border: 1px solid var(--border); border-radius: 20px; background: var(--background); }

@media (prefers-reduced-motion: reduce) {
  .arc-faq-section-icon, .arc-faq-section-contact, .arc-faq-section-contactArrow, .arc-faq-section-category, .arc-faq-section-clear { transition: none; }
  .arc-faq-section-contact:active, .arc-faq-section-clear:active { transform: none; }
}
`;

const styles: Record<string, string> = new Proxy({
  "accordion": "arc-faq-section-accordion",
  "answer": "arc-faq-section-answer",
  "categories": "arc-faq-section-categories",
  "category": "arc-faq-section-category",
  "categoryHighlight": "arc-faq-section-categoryHighlight",
  "clear": "arc-faq-section-clear",
  "columnsGrid": "arc-faq-section-columnsGrid",
  "contact": "arc-faq-section-contact",
  "contactArrow": "arc-faq-section-contactArrow",
  "contactText": "arc-faq-section-contactText",
  "count": "arc-faq-section-count",
  "description": "arc-faq-section-description",
  "empty": "arc-faq-section-empty",
  "faq": "arc-faq-section-faq",
  "frame": "arc-faq-section-frame",
  "heading": "arc-faq-section-heading",
  "hint": "arc-faq-section-hint",
  "icon": "arc-faq-section-icon",
  "intro": "arc-faq-section-intro",
  "item": "arc-faq-section-item",
  "list": "arc-faq-section-list",
  "mark": "arc-faq-section-mark",
  "panel": "arc-faq-section-panel",
  "preview": "arc-faq-section-preview",
  "question": "arc-faq-section-question",
  "rail": "arc-faq-section-rail",
  "resultCount": "arc-faq-section-resultCount",
  "search": "arc-faq-section-search",
  "searchRow": "arc-faq-section-searchRow",
  "stack": "arc-faq-section-stack",
  "stage": "arc-faq-section-stage",
  "stageFace": "arc-faq-section-stageFace",
  "title": "arc-faq-section-title",
  "trigger": "arc-faq-section-trigger"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-faq-section-${prop}`,
});


// ── Inlined Subcomponent Helpers for Standalone Execution ──
export const Button = forwardRef<HTMLButtonElement, any>(function Button({ className = "", children, ...props }, ref) {
  return <button ref={ref} className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity ${className}`} {...props}>{children}</button>;
});

export function Avatar({ src, alt = "", name = "", className = "" }: any) {
  return <span className={`relative inline-flex items-center justify-center overflow-hidden rounded-full bg-[var(--surface-muted)] text-[var(--foreground)] font-medium text-xs w-8 h-8 ${className}`}>{src ? <img src={src} alt={alt} className="w-full h-full object-cover" /> : (name ? name[0] : "")}</span>;
}

export function AvatarGroup({ children, className = "" }: any) {
  return <div className={`flex items-center -space-x-2 ${className}`}>{children}</div>;
}

export const Input = forwardRef<HTMLInputElement, any>(function Input({ className = "", ...props }, ref) {
  return <input ref={ref} className={`w-full px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] outline-none focus:border-[var(--accent)] ${className}`} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, any>(function Textarea({ className = "", ...props }, ref) {
  return <textarea ref={ref} className={`w-full px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] outline-none focus:border-[var(--accent)] ${className}`} {...props} />;
});

export const PasswordField = forwardRef<HTMLInputElement, any>(function PasswordField({ className = "", ...props }, ref) {
  return <input ref={ref} type="password" className={`w-full px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] outline-none focus:border-[var(--accent)] ${className}`} {...props} />;
});

export const SearchField = forwardRef<HTMLInputElement, any>(function SearchField({ className = "", ...props }, ref) {
  return <input ref={ref} type="search" placeholder="Search..." className={`w-full px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] outline-none focus:border-[var(--accent)] ${className}`} {...props} />;
});

export function OtpInput({ length = 6, value = "", onChange, className = "" }: any) {
  return <div className={`flex gap-2 ${className}`}>{[...Array(length)].map((_, i) => <input key={i} maxLength={1} value={value[i] || ""} className="w-10 h-12 text-center text-lg font-semibold rounded-xl border border-[var(--border)] bg-[var(--surface)]" readOnly />)}</div>;
}

export function Badge({ children, className = "" }: any) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--surface-muted)] text-[var(--text-secondary)] ${className}`}>{children}</span>;
}

export function Progress({ value = 0, className = "" }: any) {
  return <div className={`w-full h-2 rounded-full bg-[var(--surface-muted)] overflow-hidden ${className}`}><div className="h-full bg-[var(--foreground)] transition-all duration-300" style={{ width: `${value}%` }} /></div>;
}

export function Switch({ checked, onCheckedChange, className = "", ...props }: any) {
  return <button type="button" role="switch" aria-checked={checked} onClick={() => onCheckedChange?.(!checked)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${checked ? 'bg-[var(--control-on)]' : 'bg-[var(--control-track)]'} ${className}`} {...props}><span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transform transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} /></button>;
}

export function Checkbox({ checked, onCheckedChange, className = "", ...props }: any) {
  return <input type="checkbox" checked={checked} onChange={e => onCheckedChange?.(e.target.checked)} className={`rounded border-[var(--border)] text-[var(--accent)] ${className}`} {...props} />;
}

export function SegmentedControl({ value, onChange, options = [], className = "" }: any) {
  return (
    <div className={`inline-flex p-1 rounded-xl bg-[var(--surface-muted)] text-sm ${className}`}>
      {options.map((opt: any) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const active = val === value;
        return (
          <button key={val} type="button" onClick={() => onChange?.(val)} className={`px-3 py-1 rounded-lg font-medium transition-all ${active ? 'bg-[var(--surface)] shadow-sm text-[var(--foreground)]' : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'}`}>{label}</button>
        );
      })}
    </div>
  );
}

export function CopyButton({ text, className = "" }: any) {
  return <button type="button" onClick={() => navigator.clipboard?.writeText(text || "")} className={`px-2.5 py-1 text-xs rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] ${className}`}>Copy</button>;
}

export function AnimatedCounter({ value, className = "" }: any) {
  return <span className={className}>{value}</span>;
}

export function TextMorph({ children, className = "" }: any) {
  return <span className={className}>{children}</span>;
}

export function Sparkline({ data = [], className = "" }: any) {
  return <svg className={`w-24 h-8 ${className}`}><path d="M0 16 L20 10 L40 18 L60 8 L80 12 L100 4" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>;
}

export function LineChart({ data = [], className = "" }: any) {
  return <svg className={`w-full h-32 ${className}`}><path d="M0 64 L50 40 L100 70 L150 30 L200 45 L250 15" fill="none" stroke="currentColor" strokeWidth="2" /></svg>;
}

export function Calendar(props: any) {
  return <div className="p-3 border border-[var(--border)] rounded-2xl bg-[var(--surface)]">Calendar</div>;
}



export type FaqSectionVariant = "accordion" | "columns" | "search";

export interface FaqItem {
  /** Stable id used for open state. Defaults to the question. */
  id?: string;
  question: string;
  /** Plain text answer; it is also what search matches. */
  answer: string;
  /** Groups questions in the columns variant. */
  category?: string;
}

export interface FaqSectionProps {
  /** `accordion` is one centered list, `columns` groups questions beside a category rail, `search` filters as you type. */
  variant?: FaqSectionVariant;
  title?: string;
  description?: string;
  items?: FaqItem[];
  /** Allow several answers open at once. Defaults to false. */
  multiple?: boolean;
  /** Open item ids (controlled). */
  value?: string[];
  /** Initially open item ids when uncontrolled. */
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** Active category in the columns variant (controlled). */
  category?: string;
  onCategoryChange?: (category: string) => void;
  /** Search text in the search variant (controlled). */
  query?: string;
  onQueryChange?: (query: string) => void;
  /** A way to reach a person when the answer isn't here. Pass null to hide it. */
  contact?: { label: string; description?: string; href?: string; onClick?: () => void } | null;
  className?: string;
}

type Bezier = [number, number, number, number];
const enter = [...motionTokens.ease.enter] as Bezier;
const standard = [...motionTokens.ease.standard] as Bezier;

export const faqExampleItems: FaqItem[] = [
  { question: "What is Arc?", answer: "Arc is a library of React components and blocks built on Motion and Radix. You copy the source into your project, so every line is yours to change.", category: "General" },
  { question: "Does it work with my design system?", answer: "Yes. Components read semantic tokens such as surface, border, and accent, so mapping them to your palette takes one stylesheet.", category: "General" },
  { question: "Is reduced motion supported?", answer: "Every animation has a reduced motion branch. It keeps the final state, focus, and feedback while removing travel and looping.", category: "General" },
  { question: "Which frameworks are supported?", answer: "Arc targets React 19 and Next.js 16. The components are client components and also run in Vite and React Router apps.", category: "Technical" },
  { question: "How do I install a component?", answer: "Run the shadcn CLI with the component name, or copy the files by hand. Each page lists the packages it needs.", category: "Technical" },
  { question: "How do updates work?", answer: "New components and fixes ship in small releases. Run the CLI again to pull the latest version of anything you installed.", category: "Technical" },
  { question: "Can I use Arc in client projects?", answer: "Yes. Free components are MIT licensed, and a Pro license covers commercial work for you or your team.", category: "Licensing" },
  { question: "What happens when my plan ends?", answer: "You keep every component you installed. Renewing only matters for new releases and updates.", category: "Licensing" },
];

const keyOf = (item: FaqItem) => item.id ?? item.question;
const normalize = (text: string) => text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Wraps each match of `query` in a mark, keeping the original casing. */
function Highlight({ text, query }: { text: string; query: string }) {
  const needle = normalize(query.trim());
  if (!needle) return <>{text}</>;
  const haystack = normalize(text);
  const parts: ReactNode[] = [];
  let from = 0, at = haystack.indexOf(needle);
  while (at >= 0) {
    if (at > from) parts.push(text.slice(from, at));
    parts.push(<mark key={at} className={styles.mark}>{text.slice(at, at + needle.length)}</mark>);
    from = at + needle.length;
    at = haystack.indexOf(needle, from);
  }
  parts.push(text.slice(from));
  return <>{parts}</>;
}

/** A short window of the answer around the first match, for closed items that match only in their answer. */
function snippet(answer: string, query: string) {
  const at = normalize(answer).indexOf(normalize(query.trim()));
  if (at < 0) return null;
  const start = Math.max(0, answer.lastIndexOf(" ", Math.max(0, at - 36)) + 1);
  const end = Math.min(answer.length, at + query.length + 60);
  return `${start > 0 ? "…" : ""}${answer.slice(start, end).trim()}${end < answer.length ? "…" : ""}`;
}

const panelVariants: Variants = {
  open: { height: "auto", opacity: 1, transition: { height: motionTokens.spring.smooth, opacity: { duration: .2, ease: enter } } },
  closed: { height: 0, opacity: 0, transition: { height: motionTokens.spring.smooth, opacity: { duration: .12, ease: standard } } },
};
const contentVariants: Variants = {
  open: { y: 0, filter: "blur(0px)", transition: { y: motionTokens.spring.smooth, filter: { duration: .22, ease: enter } } },
  closed: { y: -6, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: .12, ease: standard } },
};
const reducedPanel: Variants = { open: { height: "auto", opacity: 1, transition: { duration: 0 } }, closed: { height: 0, opacity: 0, transition: { duration: 0 } } };

/** Arrow keys, Home, and End move between the questions of one list. */
function onListKeyDown(event: KeyboardEvent<HTMLElement>) {
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
  const triggers = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("[data-faq-trigger]"));
  const index = triggers.indexOf(document.activeElement as HTMLElement);
  if (index < 0) return;
  event.preventDefault();
  const next = event.key === "Home" ? 0 : event.key === "End" ? triggers.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + triggers.length) % triggers.length;
  triggers[next].focus();
}

function Question({ item, open, onToggle, query = "", reduced, baseId, layout }: { item: FaqItem; open: boolean; onToggle: () => void; query?: string; reduced: boolean; baseId: string; layout?: boolean }) {
  const key = keyOf(item);
  const safe = `${baseId}-${key.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const hint = query && !open && !normalize(item.question).includes(normalize(query.trim())) ? snippet(item.answer, query) : null;
  return <motion.li className={styles.item} data-open={open ? "" : undefined}
    layout={layout && !reduced ? "position" : false}
    initial={layout ? (reduced ? { opacity: 0 } : { opacity: 0, height: 0 }) : false}
    animate={{ opacity: 1, height: "auto" }}
    exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, height: 0, transition: { height: motionTokens.spring.smooth, opacity: { duration: .12 } } }}
    transition={reduced ? { duration: 0 } : { height: motionTokens.spring.smooth, opacity: { duration: .2 }, layout: motionTokens.spring.smooth }}>
    <h3 className={styles.heading}>
      <button type="button" id={`${safe}-q`} className={styles.trigger} data-faq-trigger="" aria-expanded={open} aria-controls={`${safe}-a`} onClick={onToggle}>
        <span className={styles.question}><Highlight text={item.question} query={query} /></span>
        <Plus className={styles.icon} size={18} strokeWidth={1.75} aria-hidden="true" />
      </button>
    </h3>
    <AnimatePresence initial={false}>
      {hint && <motion.p key="hint" className={styles.hint} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={reduced ? { duration: 0 } : { height: motionTokens.spring.smooth, opacity: { duration: .16 } }}>
        <Highlight text={hint} query={query} />
      </motion.p>}
    </AnimatePresence>
    <AnimatePresence initial={false}>
      {open && <motion.div key="answer" id={`${safe}-a`} role="region" aria-labelledby={`${safe}-q`} className={styles.panel} variants={reduced ? reducedPanel : panelVariants} initial="closed" animate="open" exit="closed">
        <motion.p className={styles.answer} variants={reduced ? undefined : contentVariants}><Highlight text={item.answer} query={query} /></motion.p>
      </motion.div>}
    </AnimatePresence>
  </motion.li>;
}

function Contact({ contact }: { contact: NonNullable<FaqSectionProps["contact"]> }) {
  const inner = <><span className={styles.contactText}><span>{contact.label}</span>{contact.description && <span>{contact.description}</span>}</span><ArrowRight className={styles.contactArrow} size={16} strokeWidth={1.75} aria-hidden="true" /></>;
  return contact.href
    ? <a className={styles.contact} href={contact.href} onClick={contact.onClick}>{inner}</a>
    : <button type="button" className={styles.contact} onClick={contact.onClick}>{inner}</button>;
}

/**
 * A frequently asked questions section in three layouts: one centered accordion, a category rail beside its questions,
 * and a searchable list that filters and highlights as you type. Answers open on a height spring with the icon turning
 * to a close mark; arrow keys move between questions.
 */
export const FaqSection = forwardRef<HTMLElement, FaqSectionProps>(function FaqSection({
  variant = "accordion",
  title = "Frequently asked questions",
  description = "Everything you need to know before you install your first component.",
  items = faqExampleItems,
  multiple = false,
  value,
  defaultValue,
  onValueChange,
  category: categoryProp,
  onCategoryChange,
  query: queryProp,
  onQueryChange,
  contact = { label: "Still have a question?", description: "Our team replies within a day." },
  className,
}, ref) {
  const id = useId();
  const reduced = !!useReducedMotion();
  const [innerOpen, setInnerOpen] = useState<string[]>(defaultValue ?? (items[0] ? [keyOf(items[0])] : []));
  const open = value ?? innerOpen;
  const categories = useMemo(() => Array.from(new Set(items.map(item => item.category ?? "General"))), [items]);
  const [innerCategory, setInnerCategory] = useState(categories[0] ?? "General");
  const activeCategory = categoryProp ?? innerCategory;
  const [direction, setDirection] = useState(0);
  const [innerQuery, setInnerQuery] = useState("");
  const query = queryProp ?? innerQuery;

  const setOpen = (next: string[]) => { if (value === undefined) setInnerOpen(next); onValueChange?.(next); };
  const toggle = (key: string) => setOpen(open.includes(key) ? open.filter(entry => entry !== key) : multiple ? [...open, key] : [key]);
  const chooseCategory = (next: string) => {
    if (next === activeCategory) return;
    setDirection(Math.sign(categories.indexOf(next) - categories.indexOf(activeCategory)));
    if (categoryProp === undefined) setInnerCategory(next);
    onCategoryChange?.(next);
  };
  const setQuery = (next: string) => { if (queryProp === undefined) setInnerQuery(next); onQueryChange?.(next); };

  const needle = normalize(query.trim());
  const results = variant === "search" && needle ? items.filter(item => normalize(`${item.question} ${item.answer}`).includes(needle)) : items;
  const heading = <div className={styles.intro}>
    <h2 id={`${id}-title`} className={styles.title}>{title}</h2>
    {description && <p className={styles.description}>{description}</p>}
  </div>;
  const list = (entries: FaqItem[], layout = false) => <ul className={styles.list} onKeyDown={onListKeyDown}>
    <AnimatePresence initial={false}>
      {entries.map(item => <Question key={keyOf(item)} item={item} open={open.includes(keyOf(item))} onToggle={() => toggle(keyOf(item))} query={variant === "search" ? query : ""} reduced={reduced} baseId={id} layout={layout} />)}
    </AnimatePresence>
  </ul>;

  return <section ref={ref} className={[styles.faq, styles[variant], className].filter(Boolean).join(" ")} aria-labelledby={`${id}-title`}>
    {variant === "accordion" && <div className={styles.stack}>
      {heading}
      {list(items)}
      {contact && <Contact contact={contact} />}
    </div>}

    {variant === "columns" && <div className={styles.columnsGrid}>
      <div className={styles.rail}>
        {heading}
        <LayoutGroup id={`${id}-rail`}>
          <div className={styles.categories} role="group" aria-label="Question topics">
            {categories.map(entry => {
              const count = items.filter(item => (item.category ?? "General") === entry).length;
              return <button key={entry} type="button" className={styles.category} aria-pressed={entry === activeCategory} onClick={() => chooseCategory(entry)}>
                {entry === activeCategory && <motion.span layoutId="category" className={styles.categoryHighlight} transition={reduced ? { duration: 0 } : motionTokens.spring.morph} aria-hidden="true" />}
                <span>{entry}</span><span className={styles.count}>{count}</span>
              </button>;
            })}
          </div>
        </LayoutGroup>
        {contact && <Contact contact={contact} />}
      </div>
      <div className={styles.stage}>
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          <motion.div key={activeCategory} className={styles.stageFace} custom={direction}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: direction * 16, filter: `blur(${motionTokens.blur.subtle}px)` }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: direction * -12, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: .14, ease: standard } }}
            transition={reduced ? { duration: 0 } : { y: motionTokens.spring.smooth, opacity: { duration: .22, ease: enter }, filter: { duration: .22, ease: enter } }}>
            {list(items.filter(item => (item.category ?? "General") === activeCategory))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>}

    {variant === "search" && <div className={styles.stack}>
      {heading}
      <div className={styles.searchRow}>
        <SearchField label="Search questions" placeholder="Try install, license, or motion" value={query} onValueChange={setQuery} />
        <p className={styles.resultCount} aria-live="polite">{needle ? `${results.length} ${results.length === 1 ? "answer" : "answers"}` : `${items.length} questions`}</p>
      </div>
      {list(results, true)}
      <AnimatePresence initial={false}>
        {needle && results.length === 0 && <motion.div key="empty" className={styles.empty}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: .1 } }}
          transition={{ duration: reduced ? 0 : .26, ease: enter }}>
          <p>No answers mention “{query.trim()}”.</p>
          <button type="button" className={styles.clear} onClick={() => setQuery("")}>Clear search</button>
        </motion.div>}
      </AnimatePresence>
      {contact && <Contact contact={contact} />}
    </div>}
  </section>;
});

FaqSection.displayName = "FaqSection";

const variantOptions = [{ value: "accordion", label: "Accordion" }, { value: "columns", label: "Two column" }, { value: "search", label: "Searchable" }];

/** Preview: the FAQ with a switch between its three layouts. */
export function FaqSectionBlock({ variant: initial = "accordion" }: { variant?: FaqSectionVariant }) {
  const [variant, setVariant] = useState<FaqSectionVariant>(initial);
  const [asked, setAsked] = useState(false);
  return <div className={styles.preview}>
    <SegmentedControl label="FAQ layout" options={variantOptions} value={variant} onValueChange={next => setVariant(next as FaqSectionVariant)} />
    <div className={styles.frame}>
      <FaqSection key={variant} variant={variant} contact={{ label: asked ? "Message sent to support" : "Still have a question?", description: asked ? "Hannah will reply within a day." : "Our team replies within a day.", onClick: () => setAsked(true) }} />
    </div>
  </div>;
}

export default FaqSectionBlock;
