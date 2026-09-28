"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import { AnimatePresence, motion, useAnimate, useReducedMotion } from "motion/react";
import { X as Xmark } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

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
const ARC_TAG_INPUT_STYLES = `/* No row gap: grid tracks clamp a negative margin at zero, so a closed message row would still pay the gap. Each row carries its own space instead. */
/* The field fills its column, so a new tag never widens it or re-centers it inside a centered layout. */
.arc-tag-input-field { display: grid; width: 100%; min-width: 0; }
.arc-tag-input-field label { margin-bottom: var(--space-2); font-size: var(--text-sm); font-weight: 500; }
/* The shell animates its height to .arc-tag-input-content, which carries the wrapping rows. The ring contracts onto the border on focus. */
.arc-tag-input-control { box-sizing: content-box; overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius-control); background: var(--surface); box-shadow: 0 0 0 6px transparent; transition: border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-standard) var(--ease-standard); }
@media (hover: hover) and (pointer: fine) { .arc-tag-input-control:hover:not(:focus-within) { border-color: var(--border-strong); } }
.arc-tag-input-control:focus-within { border-color: var(--foreground); box-shadow: 0 0 0 3px var(--focus-ring); outline: 2px solid transparent; outline-offset: 2px; }
/* Equal 7px padding makes one row fill the minimum height exactly, so existing tags hold their line when a second row opens. */
.arc-tag-input-content { position: relative; display: flex; flex-wrap: wrap; align-items: center; align-content: flex-start; gap: 6px; min-height: calc(var(--control-height-md) - 2px); box-sizing: border-box; padding: 7px; cursor: text; }
.arc-tag-input-tag { position: relative; display: inline-flex; align-items: center; gap: 3px; min-height: 28px; box-sizing: border-box; border: 1px solid var(--border); border-radius: var(--radius-pill); padding: 0 4px 0 9px; background: var(--surface-muted); color: var(--foreground); font-size: var(--text-sm); white-space: nowrap; cursor: default; }
.arc-tag-input-tag button { display: grid; width: 22px; height: 22px; place-items: center; border: 0; border-radius: 50%; background: transparent; color: var(--text-secondary); cursor: pointer; transition: background-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard), transform var(--duration-spring) var(--ease-spring); }
@media (hover: hover) and (pointer: fine) { .arc-tag-input-tag button:hover { background: var(--surface); color: var(--foreground); } }
.arc-tag-input-tag button:focus-visible { background: var(--surface); color: var(--foreground); outline: none; box-shadow: inset 0 0 0 1.5px var(--focus-ring); }
/* Quick press, spring release. */
.arc-tag-input-tag button:active { transform: scale(.96); transition: background-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard), transform 100ms var(--ease-standard); }
.arc-tag-input-content input { flex: 1 1 100px; min-width: 80px; min-height: 28px; box-sizing: border-box; border: 0; padding: 0 5px; background: transparent; color: var(--foreground); font: inherit; font-size: var(--text-sm); }
.arc-tag-input-content input:focus, .arc-tag-input-content input:focus-visible { outline: none; }
.arc-tag-input-content input::placeholder { color: transparent; }
/* The visible placeholder is drawn here so it can rise in when the last tag leaves. The native one stays for assistive tech. Inset matches the content and input padding. */
.arc-tag-input-placeholder { position: absolute; inset: 0; display: flex; align-items: center; overflow: hidden; padding: 0 12px; color: var(--text-muted); font-size: var(--text-sm); white-space: nowrap; pointer-events: none; }
/* The pick ring rides above the pills and sizes itself to the picked tag, so it can glide between tags without scaling its border. */
.arc-tag-input-ring { position: absolute; top: 0; left: 0; z-index: 1; box-sizing: border-box; border: 1px solid var(--accent); border-radius: var(--radius-pill); background: var(--accent-subtle); opacity: 0; pointer-events: none; }
/* A resting tag is not a stacking context (its filter ends at none), so its label and button sit above the ring while its fill stays below. */
.arc-tag-input-tagLabel, .arc-tag-input-tag button { position: relative; z-index: 2; }
.arc-tag-input-tag[data-picked] button { color: var(--foreground); }
/* The row's space is padding inside the clipped slot, so the height animates from a true zero. */
.arc-tag-input-messageSlot { display: block; overflow: hidden; }
.arc-tag-input-hint { display: block; padding-top: var(--space-2); color: var(--text-muted); font-size: var(--text-xs); line-height: var(--leading-body); }
/* Words are measured against this box when they pop out to leave, so it must be the positioned parent. */
.arc-tag-input-words { position: relative; display: block; }
.arc-tag-input-word { display: inline-block; white-space: pre; }
.arc-tag-input-srOnly { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
@media (prefers-reduced-motion: reduce) { .arc-tag-input-control, .arc-tag-input-tag button { transition: none; } .arc-tag-input-tag button:active { transform: none; } }
`;

const styles: Record<string, string> = new Proxy({
  "content": "arc-tag-input-content",
  "control": "arc-tag-input-control",
  "field": "arc-tag-input-field",
  "hint": "arc-tag-input-hint",
  "messageSlot": "arc-tag-input-messageSlot",
  "placeholder": "arc-tag-input-placeholder",
  "ring": "arc-tag-input-ring",
  "srOnly": "arc-tag-input-srOnly",
  "tag": "arc-tag-input-tag",
  "tagLabel": "arc-tag-input-tagLabel",
  "word": "arc-tag-input-word",
  "words": "arc-tag-input-words"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-tag-input-${prop}`,
});



export interface TagInputProps {
  label: string;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  description?: string;
  id?: string;
}

/** Changed words rise in and unblur while unchanged words hold still. Assistive tech reads the plain copy. */
function MotionText({ text }: { text: string }) {
  const reduced = useReducedMotion();
  const words = text.split(" ");
  return <><span className={styles.srOnly}>{text}</span><span className={styles.words} aria-hidden="true"><AnimatePresence initial={false} mode="popLayout">{words.map((word, index) => <motion.span key={`${index}:${word}`} className={styles.word}
    initial={reduced ? { opacity: 0 } : { opacity: 0, y: "0.35em", filter: `blur(${motionTokens.blur.soft}px)` }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: "-0.35em", filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: .14, ease: [...motionTokens.ease.standard] } }}
    transition={reduced ? { duration: motionTokens.duration.instant } : { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }}>{index < words.length - 1 ? `${word} ` : word}</motion.span>)}</AnimatePresence></span></>;
}

/** Helper copy: the row opens its height on a spring, then the words settle in. */
function FieldMessage({ id, text, className }: { id?: string; text?: string; className: string }) {
  return <AnimatePresence initial={false}>{text ? <MessageRow key="message" id={id} text={text} className={className} /> : null}</AnimatePresence>;
}

/** The row tracks the measured copy, so a longer message that wraps opens its next line instead of snapping. */
function MessageRow({ id, text, className }: { id?: string; text: string; className: string }) {
  const reduced = useReducedMotion();
  const copyRef = useRef<HTMLSpanElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");
  useEffect(() => {
    const node = copyRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => setHeight(entry.borderBoxSize?.[0]?.blockSize ?? node.offsetHeight));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  // Reduced motion mounts the row at full height: a zero-duration open would still paint one collapsed frame.
  return <motion.span className={styles.messageSlot} initial={reduced ? false : { height: 0, opacity: 0 }} animate={{ height, opacity: 1 }} exit={{ height: 0, opacity: 0, transition: reduced ? { duration: 0 } : { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.instant } } }} transition={reduced ? { duration: 0 } : { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast } }}>
    <motion.span ref={copyRef} id={id} className={className} initial={reduced ? false : { y: "0.35em", filter: `blur(${motionTokens.blur.soft}px)` }} animate={{ y: 0, filter: "blur(0px)" }} transition={{ duration: reduced ? 0 : motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }}><MotionText text={text} /></motion.span>
  </motion.span>;
}

/**
 * Tags keep the field still: a new tag blurs in where its text was typed while the caret glides aside, a removed tag
 * leaves its slot and the rest glide in, and the shell follows wrapped rows on a spring. Backspace or the arrow keys
 * pick a tag first, a ring glides to it, and the next Backspace removes it.
 */
export function TagInput({ label, value, defaultValue = [], onValueChange, placeholder = "Add a tag", description, id }: TagInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = description ? `${inputId}-description` : undefined;
  const [internal, setInternal] = useState(defaultValue);
  const [draft, setDraft] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const reduced = useReducedMotion();
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const contentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const ringAt = useRef("");
  // The shell follows its wrapped rows on a spring instead of jumping when a tag starts or leaves a line.
  const [height, setHeight] = useState<number | "auto">("auto");
  const tags = value ?? internal;
  const active = picked !== null && tags.includes(picked) ? picked : null;
  useEffect(() => {
    const node = contentRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => setHeight(node.offsetHeight));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  // The ring measures the picked tag's resting box, glides between picks, and fades in place when the pick clears.
  useLayoutEffect(() => {
    const ring = ringRef.current;
    const node = active === null ? null : contentRef.current?.querySelector<HTMLElement>(`[data-tag="${CSS.escape(active)}"]`);
    if (!ring) return;
    // It leaves on the same curve as a removed tag, so a picked tag and its ring fade out as one piece.
    if (!node) { if (ringAt.current) animate(ring, reduced ? { opacity: 0 } : { opacity: 0, scale: .9 }, { duration: reduced ? 0 : motionTokens.duration.instant, ease: [...motionTokens.ease.standard] }); ringAt.current = ""; return; }
    const box = { x: node.offsetLeft, y: node.offsetTop, width: node.offsetWidth, height: node.offsetHeight };
    const at = Object.values(box).join(" ");
    if (at === ringAt.current) return;
    // A ring that is still fading from the last pick glides on to the next one, so quick Backspaces read as one motion.
    if (!reduced && (ringAt.current || Number(getComputedStyle(ring).opacity) > .02)) animate(ring, { ...box, opacity: 1, scale: 1 }, { ...motionTokens.spring.morph, opacity: { duration: motionTokens.duration.fast } });
    else animate(ring, { ...box, opacity: [0, 1], scale: [reduced ? 1 : .9, 1] }, reduced ? { duration: 0, opacity: { duration: motionTokens.duration.instant } } : { duration: 0, opacity: { duration: motionTokens.duration.fast }, scale: motionTokens.spring.snappy });
    ringAt.current = at;
  });
  function say(message: string) { setNotice(previous => previous === message ? `${message}\u00a0` : message); }
  function update(next: string[]) { if (value === undefined) setInternal(next); onValueChange?.(next); }
  function pick(tag: string | null) { setPicked(tag); if (tag !== null) say(`${tag} selected. Press Backspace to remove it.`); }
  function add() {
    const tag = draft.trim(); if (!tag) return;
    const existing = tags.find(item => item.toLowerCase() === tag.toLowerCase());
    // A duplicate pulses the tag that already exists, so the ignored Enter still gets an answer.
    if (existing) { const node = scope.current?.querySelector(`[data-tag="${CSS.escape(existing)}"]`); if (node && !reduced) animate(node, { scale: [1, 1.06, 1] }, { duration: .32, ease: [...motionTokens.ease.standard] }); say(`${existing} is already added`); return; }
    update([...tags, tag]); setDraft(""); setPicked(null); say(`Added ${tag}`);
  }
  function remove(tag: string) { update(tags.filter(item => item !== tag)); setPicked(null); say(`Removed ${tag}`); inputRef.current?.focus(); }
  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const { key, currentTarget: input } = event;
    const atStart = input.selectionStart === 0 && input.selectionEnd === 0;
    const index = active === null ? tags.length : tags.indexOf(active);
    let handled = true;
    if (key === "Enter" || key === ",") add();
    else if ((key === "Backspace" || key === "Delete") && active !== null) remove(active);
    else if (key === "Backspace" && atStart && tags.length) pick(tags[tags.length - 1]);
    else if (key === "ArrowLeft" && (atStart || active !== null) && index > 0) pick(tags[index - 1]);
    else if (key === "ArrowRight" && active !== null) pick(tags[index + 1] ?? null);
    else if (key === "Escape" && active !== null) pick(null);
    else handled = false;
    if (handled) event.preventDefault();
  }
  // A click on a tag picks it without taking focus from the field. The remove button keeps its own press.
  function onTagPointer(event: MouseEvent<HTMLElement>, tag?: string) {
    if ((event.target as HTMLElement).closest("button")) return;
    if (!tag) { event.preventDefault(); return; }
    pick(active === tag ? null : tag); inputRef.current?.focus();
  }
  const move = reduced ? { duration: 0 } : motionTokens.spring.morph;
  const glide = reduced ? { duration: 0 } : motionTokens.spring.smooth;
  return <div className={styles.field}>
    <label htmlFor={inputId}>{label}</label>
    <motion.div ref={scope} className={styles.control} initial={false} animate={{ height }} transition={glide}>
      <div ref={contentRef} className={styles.content} onClick={event => { if (event.target === event.currentTarget) inputRef.current?.focus(); }}>
        <span ref={ringRef} className={styles.ring} aria-hidden="true" />
        <AnimatePresence initial={false}>{!draft && !tags.length && <motion.span key="placeholder" className={styles.placeholder} aria-hidden="true"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: "0.3em", filter: `blur(${motionTokens.blur.soft}px)` }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, transition: { duration: 0 } }}
          transition={reduced ? { duration: motionTokens.duration.instant } : { duration: .22, ease: [...motionTokens.ease.enter] }}>{placeholder}</motion.span>}</AnimatePresence>
        <AnimatePresence initial={false} mode="popLayout">{tags.map(tag => <motion.span layout={reduced ? false : "position"} className={styles.tag} key={tag} data-tag={tag} data-picked={tag === active || undefined}
          onMouseDown={event => onTagPointer(event)} onClick={event => onTagPointer(event, tag)}
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: .9, filter: `blur(${motionTokens.blur.soft}px)` }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
          exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: .9, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.instant, ease: [...motionTokens.ease.standard] } }}
          transition={reduced ? { duration: motionTokens.duration.instant } : { ...motionTokens.spring.morph, layout: move, opacity: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] }, filter: { duration: .22, ease: [...motionTokens.ease.enter] } }}><span className={styles.tagLabel}>{tag}</span><button type="button" onClick={() => remove(tag)} aria-label={`Remove ${tag}`}><Xmark width={14} height={14} aria-hidden="true" /></button></motion.span>)}</AnimatePresence>
        <motion.input layout={reduced ? false : "position"} transition={{ layout: move }} ref={inputRef} id={inputId} value={draft} onChange={event => { setDraft(event.currentTarget.value); setPicked(null); }} onKeyDown={onKeyDown} onBlur={() => { add(); setPicked(null); }} placeholder={tags.length ? "" : placeholder} aria-describedby={hintId} />
      </div>
    </motion.div>
    <span className={styles.srOnly} aria-live="polite">{notice}</span>
    <FieldMessage id={hintId} text={description} className={styles.hint} />
  </div>;
}
