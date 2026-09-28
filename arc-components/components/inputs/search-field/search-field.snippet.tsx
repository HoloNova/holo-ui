"use client";

import type { InputHTMLAttributes } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Search, X as Xmark } from "lucide-react";
import { forwardRef, useId, useRef } from "react";

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
const ARC_SEARCH_FIELD_STYLES = `.arc-search-field-field { display: grid; gap: var(--space-2); min-width: 0; }
.arc-search-field-field label { font-size: var(--text-sm); font-weight: 500; }
/* The focus ring contracts onto the border while it fades in; the shell never changes size. */
.arc-search-field-shell { display: flex; min-height: var(--control-height-md); align-items: center; gap: var(--space-2); border: 1px solid var(--border-strong); border-radius: var(--radius-control); padding: 0 var(--space-3); background: var(--surface); box-shadow: 0 0 0 6px transparent; transition: border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-standard) var(--ease-standard); }
@media (hover: hover) and (pointer: fine) { .arc-search-field-shell:hover:not(:focus-within) { border-color: var(--foreground); } }
.arc-search-field-shell:focus-within { border-color: var(--foreground); box-shadow: 0 0 0 3px var(--focus-ring); outline: 2px solid transparent; outline-offset: 2px; }
/* The glass wakes up with the field: muted at rest, full contrast while searching. */
.arc-search-field-shell > svg { flex: 0 0 auto; color: var(--text-muted); transition: color var(--duration-fast) var(--ease-standard); }
.arc-search-field-shell:focus-within > svg, .arc-search-field-shell[data-filled="true"] > svg { color: var(--foreground); }
.arc-search-field-input { width: 100%; min-width: 0; border: 0; background: transparent; color: var(--foreground); font: inherit; font-size: var(--text-sm); outline: 0; }
.arc-search-field-input:focus-visible { outline: 0; }
.arc-search-field-input::placeholder { color: var(--text-muted); }
.arc-search-field-input::-webkit-search-cancel-button { display: none; }
.arc-search-field-clearSlot { display: grid; width: 24px; height: 24px; flex: 0 0 auto; place-items: center; }
.arc-search-field-shell button { display: grid; width: 24px; height: 24px; flex: 0 0 auto; place-items: center; border: 0; border-radius: var(--radius-control); background: transparent; color: var(--text-muted); transition: background-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard); }
@media (hover: hover) and (pointer: fine) { .arc-search-field-shell button:hover { background: var(--surface-muted); color: var(--foreground); } }
.arc-search-field-shell button:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { .arc-search-field-shell, .arc-search-field-shell > svg, .arc-search-field-shell button { transition: none; } }
`;

const styles: Record<string, string> = new Proxy({
  "clearSlot": "arc-search-field-clearSlot",
  "field": "arc-search-field-field",
  "input": "arc-search-field-input",
  "shell": "arc-search-field-shell"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-search-field-${prop}`,
});

export interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> { label: string; value: string; onValueChange: (value: string) => void }
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField({ label, value, onValueChange, id, className, ...props }, ref) {
  const generated = useId(); const controlId = id ?? generated; const reduced = useReducedMotion(); const inputRef = useRef<HTMLInputElement | null>(null);
  const setRefs = (node: HTMLInputElement | null) => { inputRef.current = node; if (typeof ref === "function") ref(node); else if (ref) ref.current = node; };
  // Clearing returns focus to the field, since the clear button unmounts under the pointer.
  function clear() { onValueChange(""); inputRef.current?.focus(); }
  return <div className={styles.field}><label htmlFor={controlId}>{label}</label><div className={styles.shell} data-filled={value ? "true" : undefined}>
    <Search width={18} height={18} aria-hidden="true"/><input {...props} ref={setRefs} id={controlId} type="search" value={value} onChange={event => onValueChange(event.target.value)} className={[styles.input, className].filter(Boolean).join(" ")} />
    {/* The clear button has a reserved slot, so the field never changes width when it appears or leaves. */}
    <span className={styles.clearSlot}><AnimatePresence initial={false}>{value ? <motion.button key="clear" type="button" tabIndex={0} onClick={clear} aria-label="Clear search" initial={reduced ? { opacity: 0 } : { opacity: 0, scale: .8, filter: `blur(${motionTokens.blur.subtle}px)` }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: .8, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.instant, ease: [...motionTokens.ease.standard] } }} whileTap={reduced ? undefined : { scale: .96, transition: { duration: .1, ease: [...motionTokens.ease.standard] } }} transition={reduced ? { duration: motionTokens.duration.instant } : { ...motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast }, filter: { duration: motionTokens.duration.fast } }}><Xmark width={16} height={16} aria-hidden="true" /></motion.button> : null}</AnimatePresence></span>
  </div></div>;
});
