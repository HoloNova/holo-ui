"use client";

import type { InputHTMLAttributes, KeyboardEvent, MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { animate, AnimatePresence, motion, useReducedMotion } from "motion/react";
import { forwardRef, useEffect, useId, useImperativeHandle, useMemo, useRef, useState, } from "react";

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
const ARC_COMBOBOX_STYLES = `.arc-combobox-field { position: relative; display: grid; gap: var(--space-2); min-width: 0; }
.arc-combobox-field label { font-size: var(--text-sm); font-weight: 500; }
.arc-combobox-control { position: relative; z-index: 2; display: flex; min-height: var(--control-height-md); align-items: center; gap: var(--space-2); border: 1px solid var(--border); border-radius: var(--radius-control); padding: 0 var(--space-3); background: var(--surface); color: var(--foreground); transition: border-color var(--duration-fast) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard); }
@media (hover: hover) and (pointer: fine) { .arc-combobox-control:hover:not(.arc-combobox-disabled) { border-color: var(--border-strong); background: var(--surface-muted); } }
.arc-combobox-control:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px var(--focus-ring); }
.arc-combobox-control.open { border-color: var(--border-strong); background: var(--surface-muted); }
.arc-combobox-control.disabled { opacity: .5; cursor: not-allowed; }
.arc-combobox-searchIcon { flex: 0 0 auto; color: var(--text-muted); }
.arc-combobox-control input { width: 100%; min-width: 0; border: 0; outline: 0; padding: 0; background: transparent; color: var(--foreground); font: inherit; font-size: var(--text-sm); }
.arc-combobox-control input:focus-visible { outline: none; }
.arc-combobox-control input::placeholder { color: var(--text-muted); }
.arc-combobox-chevron { flex: 0 0 auto; color: var(--text-muted); transition: transform var(--duration-spring) var(--ease-spring); }
.arc-combobox-open .arc-combobox-chevron { transform: rotate(180deg); }
.arc-combobox-clear { display: grid; width: 22px; height: 22px; flex: 0 0 auto; place-items: center; border: 0; border-radius: var(--radius-control); background: transparent; color: var(--text-muted); cursor: pointer; transition: background-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard); }
@media (hover: hover) and (pointer: fine) { .arc-combobox-clear:hover { background: var(--surface-muted); color: var(--foreground); } }
.arc-combobox-clear:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 1px; }
.arc-combobox-hint { color: var(--text-muted); font-size: var(--text-xs); }
.arc-combobox-popover { position: absolute; z-index: 80; top: calc(100% + 8px); right: 0; left: 0; overflow: hidden; transform-origin: top center; border: 1px solid var(--border); border-radius: var(--radius-panel); padding: 5px; background: var(--surface-raised); color: var(--foreground); box-shadow: var(--shadow-floating); will-change: transform, opacity; }
.arc-combobox-autoHeight { overflow: hidden; }
.arc-combobox-listbox { max-height: min(300px, 40vh); overflow-y: auto; overscroll-behavior: contain; }
/* Arrow keys move the highlight often, so it changes almost instantly. */
.arc-combobox-option { display: flex; min-height: 36px; align-items: center; justify-content: space-between; gap: var(--space-3); border-radius: calc(var(--radius-control) - 6px); padding: 0 12px; color: var(--foreground); font-size: var(--text-sm); cursor: pointer; outline: none; user-select: none; transition: background-color 80ms var(--ease-standard), color 80ms var(--ease-standard); }
.arc-combobox-option[data-active="true"] { background: var(--surface-muted); }
.arc-combobox-option[data-disabled="true"] { opacity: .42; cursor: not-allowed; }
.arc-combobox-check { flex: 0 0 auto; color: var(--foreground); }
.arc-combobox-empty { padding: var(--space-3); color: var(--text-muted); font-size: var(--text-sm); }
@media (prefers-reduced-motion: reduce) { .arc-combobox-control, .arc-combobox-chevron, .arc-combobox-clear, .arc-combobox-option { transition: none; } }
`;

const styles: Record<string, string> = new Proxy({
  "autoHeight": "arc-combobox-autoHeight",
  "check": "arc-combobox-check",
  "chevron": "arc-combobox-chevron",
  "clear": "arc-combobox-clear",
  "control": "arc-combobox-control",
  "disabled": "arc-combobox-disabled",
  "empty": "arc-combobox-empty",
  "field": "arc-combobox-field",
  "hint": "arc-combobox-hint",
  "listbox": "arc-combobox-listbox",
  "open": "arc-combobox-open",
  "option": "arc-combobox-option",
  "popover": "arc-combobox-popover",
  "searchIcon": "arc-combobox-searchIcon"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-combobox-${prop}`,
});



export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
  keywords?: string[];
}

export interface ComboboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "placeholder"> {
  label: string;
  options: ComboboxOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  description?: string;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

/** Follows the listbox height with a critically damped spring, so filtering never snaps the menu. */
function AutoHeight({ children, reduceMotion }: { children: ReactNode; reduceMotion: boolean | null }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const observer = new ResizeObserver(() => setHeight(inner.offsetHeight));
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);
  return <motion.div className={styles.autoHeight} initial={false} animate={{ height }} transition={reduceMotion ? { duration: 0 } : motionTokens.spring.smooth}><div ref={innerRef}>{children}</div></motion.div>;
}

export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(function Combobox(
  {
    label,
    options,
    value: controlledValue,
    defaultValue = "",
    onValueChange,
    description,
    placeholder = "Search or select…",
    emptyMessage = "No matches found",
    id,
    className,
    disabled,
    onFocus,
    ...inputProps
  },
  forwardedRef,
) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const listboxId = `${controlId}-listbox`;
  const hintId = description ? `${controlId}-description` : undefined;
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const reduceMotion = useReducedMotion();
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const selectedValue = controlledValue ?? uncontrolledValue;
  const selectedOption = options.find((option) => option.value === selectedValue);

  useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement);

  // A chosen label settles into the field: it rises in from below with a soft blur. Clearing fades the
  // placeholder in instead of snapping from the old label.
  const settledValue = useRef(selectedValue);
  useEffect(() => {
    if (settledValue.current === selectedValue) return;
    settledValue.current = selectedValue;
    const input = inputRef.current;
    if (!input || reduceMotion || (selectedValue && open)) return;
    const controls = selectedValue
      ? animate(input, { opacity: [0, 1], y: ["0.35em", "0em"], filter: [`blur(${motionTokens.blur.soft}px)`, "blur(0px)"] }, { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] })
      : animate(input, { opacity: [0, 1] }, { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] });
    return () => controls.complete();
  }, [selectedValue, reduceMotion, open]);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return options;
    return options.filter((option) =>
      [option.label, ...(option.keywords ?? [])].some((term) => term.toLocaleLowerCase().includes(normalizedQuery)),
    );
  }, [options, query]);

  const enabledIndices = filteredOptions.reduce<number[]>((indices, option, index) => {
    if (!option.disabled) indices.push(index);
    return indices;
  }, []);

  useEffect(() => {
    if (!open) return;
    const activeOption = activeIndex >= 0 ? filteredOptions[activeIndex] : undefined;
    const option = activeOption ? optionRefs.current[activeOption.value] : null;
    const listbox = option?.parentElement;
    if (option && listbox) {
      const top = option.offsetTop;
      const bottom = top + option.offsetHeight;
      if (top < listbox.scrollTop) listbox.scrollTop = top;
      else if (bottom > listbox.scrollTop + listbox.clientHeight) listbox.scrollTop = bottom - listbox.clientHeight;
    }
  }, [activeIndex, filteredOptions, open]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const choose = (option: ComboboxOption) => {
    if (option.disabled) return;
    setUncontrolledValue(option.value);
    onValueChange?.(option.value);
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  };

  const clear = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setUncontrolledValue("");
    onValueChange?.("");
    setQuery("");
    setOpen(true);
    inputRef.current?.focus();
  };

  const openMenu = () => {
    if (disabled) return;
    setOpen(true);
    setQuery("");
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      if (!enabledIndices.length) return;
      const currentPosition = enabledIndices.indexOf(activeIndex);
      const nextPosition = event.key === "ArrowDown"
        ? (currentPosition + 1) % enabledIndices.length
        : (currentPosition - 1 + enabledIndices.length) % enabledIndices.length;
      setActiveIndex(enabledIndices[nextPosition]);
      return;
    }
    if (event.key === "Enter" && open && activeIndex >= 0) {
      event.preventDefault();
      const option = filteredOptions[activeIndex];
      if (option) choose(option);
      return;
    }
    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
      setQuery("");
      return;
    }
  };

  const inputValue = open ? query : selectedOption?.label ?? "";
  const activeOption = activeIndex >= 0 ? filteredOptions[activeIndex] : undefined;

  return (
    <div ref={rootRef} className={styles.field}>
      <label htmlFor={controlId}>{label}</label>
      <div className={[styles.control, open ? styles.open : "", disabled ? styles.disabled : "", className ?? ""].filter(Boolean).join(" ")}>
        <Search className={styles.searchIcon} size={16} strokeWidth={1.8} aria-hidden="true" />
        <input
          {...inputProps}
          ref={inputRef}
          id={controlId}
          type="text"
          role="combobox"
          value={inputValue}
          // While searching, the chosen label stays in place as muted placeholder copy instead of vanishing.
          placeholder={selectedOption?.label ?? placeholder}
          disabled={disabled}
          aria-describedby={hintId}
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={open && activeOption ? `${controlId}-option-${activeOption.value}` : undefined}
          onFocus={(event) => {
            onFocus?.(event);
            openMenu();
          }}
          onClick={openMenu}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
        />
        <AnimatePresence initial={false}>
          {selectedOption && !disabled && (
            <motion.button
              type="button"
              className={styles.clear}
              aria-label="Clear selection"
              onMouseDown={event => event.preventDefault()}
              onClick={clear}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6, filter: `blur(${motionTokens.blur.subtle}px)` }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)", transition: reduceMotion ? { duration: motionTokens.duration.instant } : { ...motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast } } }}
              exit={{ opacity: 0, ...(reduceMotion ? {} : { scale: 0.6, filter: `blur(${motionTokens.blur.subtle}px)` }), transition: { duration: motionTokens.duration.instant, ease: [...motionTokens.ease.standard] } }}
              whileTap={{ scale: reduceMotion ? 1 : 0.96, transition: { duration: 0.1, ease: [...motionTokens.ease.standard] } }}
            >
              <X size={15} strokeWidth={1.9} aria-hidden="true" />
            </motion.button>
          )}
        </AnimatePresence>
        <ChevronDown className={styles.chevron} size={16} strokeWidth={1.8} aria-hidden="true" />
      </div>
      {description && <span id={hintId} className={styles.hint}>{description}</span>}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className={styles.popover}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: reduceMotion ? { duration: motionTokens.duration.instant } : { ...motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] } } }}
            exit={{ opacity: 0, ...(reduceMotion ? {} : { y: -4, scale: 0.98 }), transition: { duration: 0.13, ease: [...motionTokens.ease.standard] } }}
            role="presentation"
          >
            <AutoHeight reduceMotion={reduceMotion}>
            <div id={listboxId} className={styles.listbox} role="listbox" aria-label={`${label} options`}>
              {filteredOptions.length ? filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  ref={(element) => { optionRefs.current[option.value] = element; }}
                  id={`${controlId}-option-${option.value}`}
                  className={styles.option}
                  data-active={index === activeIndex ? "true" : undefined}
                  data-disabled={option.disabled ? "true" : undefined}
                  role="option"
                  aria-selected={option.value === selectedValue}
                  aria-disabled={option.disabled || undefined}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                  onClick={() => choose(option)}
                >
                  <span>{option.label}</span>
                  {option.value === selectedValue && <Check className={styles.check} size={15} strokeWidth={2} aria-hidden="true" />}
                </div>
              )) : <motion.div className={styles.empty} role="status" initial={reduceMotion ? false : { opacity: 0, y: 4, filter: `blur(${motionTokens.blur.soft}px)` }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }}>{emptyMessage}</motion.div>}
            </div>
            </AutoHeight>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

Combobox.displayName = "Combobox";
