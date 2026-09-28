"use client";

import type { Variants } from "motion/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

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
const ARC_MULTI_SELECT_STYLES = `.arc-multi-select-field { position: relative; display: grid; gap: var(--space-2); min-width: 0; }
.arc-multi-select-control { position: relative; min-width: 0; }
.arc-multi-select-label { font-size: var(--text-sm); font-weight: 500; line-height: var(--leading-body); }
/* The trigger anchors the menu, so press feedback stays in color; it never scales. */
.arc-multi-select-trigger { position: relative; display: flex; width: 100%; min-height: var(--control-height-md); align-items: center; gap: 8px; border: 1px solid var(--border); border-radius: var(--radius-control); padding: 5px 11px 5px 12px; background: var(--surface); color: var(--foreground); font: inherit; font-size: var(--text-sm); text-align: left; cursor: pointer; transition: border-color var(--duration-fast) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard); }
@media (hover: hover) and (pointer: fine) { .arc-multi-select-trigger:hover:not(:disabled) { border-color: var(--border-strong); background: var(--surface-muted); } }
.arc-multi-select-trigger:active:not(:disabled), .arc-multi-select-trigger[aria-expanded="true"] { border-color: var(--border-strong); background: var(--surface-muted); }
.arc-multi-select-trigger:focus-visible { border-color: var(--accent); outline: 3px solid var(--accent-subtle); outline-offset: 0; }
.arc-multi-select-trigger:disabled { opacity: .5; cursor: not-allowed; }
/* The chevron stays pinned to the trailing edge; a selection only reserves room for the clear button beside it, so nothing jumps. */
.arc-multi-select-hasClear .arc-multi-select-chevron { margin-left: 26px; }
.arc-multi-select-value { position: relative; display: flex; min-width: 0; min-height: 26px; flex: 1; align-items: center; overflow: hidden; }
.arc-multi-select-placeholder, .arc-multi-select-description { color: var(--text-muted); }
/* The placeholder sits outside the flow so the first chip can open its slot from the leading edge. */
.arc-multi-select-placeholder { position: absolute; inset: 0; display: flex; align-items: center; overflow: hidden; white-space: nowrap; }
/* The slot clips while its width springs open or closed; the chip keeps its natural width so the label never re-truncates mid-flight. */
.arc-multi-select-slot { display: flex; flex: 0 1 auto; min-width: 0; overflow: hidden; }
.arc-multi-select-slot:has(.arc-multi-select-more) { flex-shrink: 0; }
.arc-multi-select-chip, .arc-multi-select-more { box-sizing: border-box; flex: 0 0 auto; max-width: 9rem; overflow: hidden; margin-right: 5px; border-radius: 999px; padding: 4px 8px; background: var(--surface-muted); box-shadow: inset 0 0 0 1px var(--border-subtle); color: var(--foreground); text-overflow: ellipsis; white-space: nowrap; font-size: var(--text-xs); transition: background-color var(--duration-fast) var(--ease-standard); }
.arc-multi-select-trigger[aria-expanded="true"] .arc-multi-select-chip, .arc-multi-select-trigger[aria-expanded="true"] .arc-multi-select-more { background: var(--surface); }
@media (hover: hover) and (pointer: fine) { .arc-multi-select-trigger:hover:not(:disabled) .arc-multi-select-chip, .arc-multi-select-trigger:hover:not(:disabled) .arc-multi-select-more { background: var(--surface); } }
.arc-multi-select-more { display: inline-flex; color: var(--text-secondary); font-variant-numeric: tabular-nums; }
.arc-multi-select-count { display: inline-grid; }
.arc-multi-select-count > span { grid-area: 1 / 1; }
.arc-multi-select-srOnly { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
.arc-multi-select-clear { position: absolute; top: 0; bottom: 0; right: 36px; display: grid; width: 22px; height: 22px; margin: auto 0; place-items: center; border: 0; border-radius: 999px; background: transparent; color: var(--text-muted); cursor: pointer; transition: background-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard); }
@media (hover: hover) and (pointer: fine) { .arc-multi-select-clear:hover { background: var(--surface); color: var(--foreground); } }
.arc-multi-select-clear:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 1px; }
.arc-multi-select-chevron { flex: 0 0 auto; color: var(--text-muted); transition: transform var(--duration-spring) var(--ease-spring); }
.arc-multi-select-trigger[aria-expanded="true"] .arc-multi-select-chevron { transform: rotate(180deg); }
.arc-multi-select-description { font-size: var(--text-xs); }
.arc-multi-select-menu { position: absolute; z-index: 80; top: calc(100% + 8px); right: 0; left: 0; overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius-panel); padding: 5px; background: var(--surface-raised); box-shadow: var(--shadow-floating); transform-origin: top center; will-change: transform, opacity; }
/* Arrow keys move the highlight often, so it changes almost instantly. Selection is shown by the check, not by weight, so labels never reflow. */
.arc-multi-select-option { display: flex; width: 100%; min-height: 38px; align-items: center; justify-content: space-between; gap: 12px; border: 0; border-radius: calc(var(--radius-control) - 6px); padding: 0 11px; background: transparent; color: var(--foreground); font: inherit; font-size: var(--text-sm); text-align: left; cursor: pointer; transition: background-color 80ms var(--ease-standard), color 80ms var(--ease-standard); }
.arc-multi-select-option[data-active="true"] { background: var(--surface-muted); }
.arc-multi-select-option:disabled { opacity: .42; cursor: not-allowed; }
.arc-multi-select-check { flex: 0 0 auto; }
@media (prefers-reduced-motion: reduce) { .arc-multi-select-trigger, .arc-multi-select-chevron, .arc-multi-select-option, .arc-multi-select-clear, .arc-multi-select-chip, .arc-multi-select-more { transition: none; } }
`;

const styles: Record<string, string> = new Proxy({
  "check": "arc-multi-select-check",
  "chevron": "arc-multi-select-chevron",
  "chip": "arc-multi-select-chip",
  "clear": "arc-multi-select-clear",
  "control": "arc-multi-select-control",
  "count": "arc-multi-select-count",
  "description": "arc-multi-select-description",
  "field": "arc-multi-select-field",
  "hasClear": "arc-multi-select-hasClear",
  "label": "arc-multi-select-label",
  "menu": "arc-multi-select-menu",
  "more": "arc-multi-select-more",
  "option": "arc-multi-select-option",
  "placeholder": "arc-multi-select-placeholder",
  "slot": "arc-multi-select-slot",
  "srOnly": "arc-multi-select-srOnly",
  "trigger": "arc-multi-select-trigger",
  "value": "arc-multi-select-value"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-multi-select-${prop}`,
});



export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  label: string;
  options: MultiSelectOption[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  description?: string;
  maxVisible?: number;
  disabled?: boolean;
  className?: string;
}

const enter = motionTokens.ease.enter;
const standard = motionTokens.ease.standard;
/** Each chip sits in a slot whose width opens and collapses on a spring, so neighbours travel with it and nothing overlaps. */
const slot: Variants = {
  hidden: { width: 0, opacity: 0 },
  shown: { width: "auto", opacity: 1, transition: { width: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast, ease: enter } } },
  gone: { width: 0, opacity: 0, transition: { width: motionTokens.spring.smooth, opacity: { duration: 0.12, ease: standard } } },
};
/** The chip itself grows in from .9 with a soft blur and shrinks back as it leaves. */
const chip: Variants = {
  hidden: { scale: 0.9, filter: `blur(${motionTokens.blur.soft}px)` },
  shown: { scale: 1, filter: "blur(0px)", transition: { ...motionTokens.spring.snappy, filter: { duration: motionTokens.duration.standard, ease: enter } } },
  gone: { scale: 0.9, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: 0.14, ease: standard } },
};
/** Reduced motion keeps short crossfades; resting states match the moving variants so server and client markup agree. */
const fade: Variants = { hidden: { opacity: 0 }, shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.instant } }, gone: { opacity: 0, transition: { duration: motionTokens.duration.instant } } };
const slotFade: Variants = { hidden: { opacity: 0 }, shown: { width: "auto", opacity: 1, transition: { duration: motionTokens.duration.instant } }, gone: { opacity: 0, transition: { duration: motionTokens.duration.instant } } };
const chipStill: Variants = { hidden: { scale: 1, filter: "blur(0px)" }, shown: { scale: 1, filter: "blur(0px)" }, gone: { scale: 1, filter: "blur(0px)" } };
/** The overflow count rolls: a larger number rises from below, a smaller one drops from above. */
const roll: Variants = {
  hidden: (direction: number) => ({ opacity: 0, y: `${direction * 0.5}em`, filter: `blur(${motionTokens.blur.subtle}px)` }),
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.standard, ease: enter } },
  gone: (direction: number) => ({ opacity: 0, y: `${direction * -0.5}em`, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: 0.14, ease: standard } }),
};

/** A check that draws itself when an option is picked and retracts when it is removed. */
function CheckMark({ reduce }: { reduce: boolean | null }) {
  return <svg className={styles.check} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <motion.path d="M4 12.5 9 17.5 20 6.5" initial={reduce ? { opacity: 0 } : { pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} exit={reduce ? { opacity: 0 } : { pathLength: 0, opacity: 0 }} transition={reduce ? { duration: motionTokens.duration.instant } : { pathLength: { duration: motionTokens.duration.standard, ease: enter }, opacity: { duration: 0.08 } }} />
  </svg>;
}

export function MultiSelect({ label, options, value, defaultValue = [], onValueChange, placeholder = "Select options", description, maxVisible = 2, disabled = false, className }: MultiSelectProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const valueId = `${id}-value`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [internal, setInternal] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const selected = value ?? internal;
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const labelFor = (item: string) => options.find((option) => option.value === item)?.label ?? item;
  const visible = selected.slice(0, maxVisible).map((item) => ({ value: item, label: labelFor(item) }));
  const remaining = Math.max(0, selected.length - visible.length);
  // A closed menu forgets its highlight, so the next open starts clean instead of on a stale hovered row.
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) { setWasOpen(open); if (!open) setActiveIndex(-1); }
  const [previousRemaining, setPreviousRemaining] = useState(remaining);
  const [countDirection, setCountDirection] = useState(1);
  if (previousRemaining !== remaining) { setPreviousRemaining(remaining); setCountDirection(remaining > previousRemaining ? 1 : -1); }

  useEffect(() => {
    const close = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const update = (next: string[]) => { if (value === undefined) setInternal(next); onValueChange?.(next); };
  const toggle = (option: MultiSelectOption) => {
    if (disabled || option.disabled) return;
    update(selectedSet.has(option.value) ? selected.filter((item) => item !== option.value) : [...selected, option.value]);
  };
  const clear = () => { update([]); setOpen(false); };
  const enabled = options.map((option, index) => option.disabled ? -1 : index).filter((index) => index >= 0);
  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (event.key === "Enter" && open && activeIndex >= 0) { event.preventDefault(); toggle(options[activeIndex]); return; }
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setOpen((current) => !current); return; }
    if (event.key === "Escape") { setOpen(false); return; }
    if ((event.key === "ArrowDown" || event.key === "ArrowUp") && enabled.length) {
      event.preventDefault(); setOpen(true);
      const current = enabled.indexOf(activeIndex);
      const next = current < 0 ? (event.key === "ArrowDown" ? 0 : enabled.length - 1) : event.key === "ArrowDown" ? (current + 1) % enabled.length : (current - 1 + enabled.length) % enabled.length;
      setActiveIndex(enabled[next]);
    }
  };
  const reduce = useReducedMotion();

  return <div ref={rootRef} className={[styles.field, className].filter(Boolean).join(" ")}>
    <span id={labelId} className={styles.label}>{label}</span>
    <div className={styles.control}><button type="button" className={`${styles.trigger} ${selected.length ? styles.hasClear : ""}`} disabled={disabled} aria-labelledby={`${labelId} ${valueId}`} aria-haspopup="listbox" aria-expanded={open} aria-controls={`${id}-listbox`} onClick={() => setOpen((current) => !current)} onKeyDown={onKeyDown}>
      <span id={valueId} className={styles.srOnly}>{selected.length ? selected.map(labelFor).join(", ") : placeholder}</span>
      <span className={styles.value} aria-hidden="true">
        <AnimatePresence initial={false}>
          {visible.map((item) => <motion.span key={`chip-${item.value}`} className={styles.slot} variants={reduce ? slotFade : slot} initial="hidden" animate="shown" exit="gone"><motion.span className={styles.chip} variants={reduce ? chipStill : chip}>{item.label}</motion.span></motion.span>)}
          {remaining > 0 && <motion.span key="more" className={styles.slot} variants={reduce ? slotFade : slot} initial="hidden" animate="shown" exit="gone"><motion.span className={styles.more} variants={reduce ? chipStill : chip}>+<span className={styles.count}><AnimatePresence initial={false} custom={countDirection}><motion.span key={remaining} custom={countDirection} variants={reduce ? fade : roll} initial="hidden" animate="shown" exit="gone">{remaining}</motion.span></AnimatePresence></span></motion.span></motion.span>}
          {!selected.length && <motion.span key="placeholder" className={styles.placeholder} variants={fade} initial="hidden" animate="shown" exit="gone">{placeholder}</motion.span>}
        </AnimatePresence>
      </span>
      <ChevronDown className={styles.chevron} size={16} aria-hidden="true" />
    </button>
    <AnimatePresence initial={false}>{selected.length > 0 && !disabled && <motion.button type="button" aria-label="Clear selections" className={styles.clear} onClick={clear}
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, filter: `blur(${motionTokens.blur.subtle}px)` }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)", transition: reduce ? { duration: motionTokens.duration.instant } : { ...motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast } } }}
      exit={{ opacity: 0, ...(reduce ? {} : { scale: 0.6, filter: `blur(${motionTokens.blur.subtle}px)` }), transition: { duration: motionTokens.duration.instant, ease: standard } }}
      whileTap={{ scale: reduce ? 1 : 0.96, transition: { duration: 0.1, ease: standard } }}><X size={14} aria-hidden="true" /></motion.button>}</AnimatePresence>
    <AnimatePresence initial={false}>
      {open && <motion.div id={`${id}-listbox`} className={styles.menu} role="listbox" aria-label={label} aria-multiselectable="true"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: .97 }}
        animate={{ opacity: 1, y: 0, scale: 1, transition: reduce ? { duration: motionTokens.duration.instant } : { ...motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast, ease: enter } } }}
        exit={{ opacity: 0, ...(reduce ? {} : { y: -4, scale: .98 }), transition: { duration: 0.13, ease: standard } }}>
        {options.map((option, index) => <button type="button" role="option" aria-selected={selectedSet.has(option.value)} aria-disabled={option.disabled || undefined} key={option.value} className={styles.option} data-active={activeIndex === index} disabled={option.disabled} onPointerMove={() => { if (activeIndex !== index) setActiveIndex(index); }} onClick={() => toggle(option)}>
          <span>{option.label}</span><AnimatePresence initial={false}>{selectedSet.has(option.value) && <CheckMark key="check" reduce={reduce} />}</AnimatePresence>
        </button>)}
      </motion.div>}
    </AnimatePresence>
    </div>
    {description && <span className={styles.description}>{description}</span>}
  </div>;
}
