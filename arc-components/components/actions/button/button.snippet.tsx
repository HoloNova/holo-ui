"use client";

import type { ButtonHTMLAttributes, ReactNode, Ref, RefObject } from "react";
import type { TargetAndTransition, Variants } from "motion/react";
import { AnimatePresence, animate, motion, useIsPresent, useMotionValue, useReducedMotion } from "motion/react";
import { forwardRef, isValidElement, useCallback, useEffect, useLayoutEffect, useRef } from "react";

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
const ARC_BUTTON_STYLES = `/* Press scale is driven by Motion (whileTap) alone, so transform never gets a CSS transition here. */
.arc-button-button { position: relative; display: inline-flex; min-height: var(--control-height-md); align-items: center; justify-content: center; gap: var(--space-2); border: 1px solid transparent; border-radius: var(--radius-control); padding: 0 var(--space-4); font: inherit; font-size: var(--text-sm); font-weight: 500; line-height: var(--leading-body); white-space: nowrap; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: color var(--duration-fast) var(--ease-standard), background var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard), opacity var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard); }
.arc-button-button:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 3px; }
.arc-button-button:disabled { cursor: not-allowed; opacity: .52; }
.arc-button-button[aria-busy="true"] { cursor: progress; }
/* Anchors of floating layers never scale: Radix opens on pointerdown and would measure a shrunken trigger. */
.arc-button-button:is([aria-haspopup]:not([aria-haspopup="false"]), [data-state], [role="combobox"]) { transform: none !important; }
/* The slot's width follows the incoming label on a spring. The label stays centered and may overflow evenly while the slot catches up;
   the outgoing label pops out of flow against the slot itself, so it keeps its place instead of following the new content box. */
.arc-button-labelSlot { position: relative; display: inline-flex; min-width: 0; align-items: center; justify-content: center; transition: opacity var(--duration-fast) var(--ease-standard); }
.arc-button-labelSlot[data-morphing] { clip-path: inset(-50% calc(var(--space-3) * -1)); }
.arc-button-labelContent { display: inline-flex; flex: none; align-items: center; }
.arc-button-labelPhase { display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2); white-space: nowrap; }
.arc-button-labelPhase svg { flex: none; }
.arc-button-primary { color: var(--background); background: var(--foreground); border-color: var(--foreground); }
.arc-button-secondary { color: var(--foreground); background: var(--surface); border-color: var(--border); }
.arc-button-ghost { color: var(--text-secondary); background: transparent; border-color: transparent; }
.arc-button-danger { color: var(--danger); background: var(--surface); border-color: var(--border); }
@media (hover: hover) and (pointer: fine) {
  .arc-button-primary:hover:not(:disabled) { opacity: .91; box-shadow: var(--shadow-resting); }
  .arc-button-secondary:hover:not(:disabled) { background: var(--surface-muted); box-shadow: var(--shadow-resting); }
  .arc-button-ghost:hover:not(:disabled) { color: var(--foreground); background: var(--surface-muted); }
  .arc-button-danger:hover:not(:disabled) { border-color: var(--danger); background: var(--surface-muted); }
}
/* Color feedback on press, so touch and menu triggers (which never scale) still answer the finger. */
.arc-button-primary:active:not(:disabled) { opacity: .84; }
.arc-button-secondary:active:not(:disabled), .arc-button-ghost:active:not(:disabled) { color: var(--foreground); background: var(--surface-muted); }
.arc-button-danger:active:not(:disabled) { border-color: var(--danger); background: var(--surface-muted); }
.arc-button-sm { min-height: var(--control-height-sm); padding-inline: var(--space-3); font-size: var(--text-sm); }
.arc-button-md { min-height: var(--control-height-md); }
.arc-button-lg { min-height: var(--control-height-lg); padding-inline: var(--space-5); font-size: var(--text-sm); }
.arc-button-loader { position: absolute; left: 50%; top: 50%; display: grid; width: var(--space-4); height: var(--space-4); margin: calc(var(--space-4) / -2); }
.arc-button-spinner { border: 1.5px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: spin .7s linear infinite; }
.arc-button-loadingLabel { opacity: 0; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .arc-button-button { transition: none; } .arc-button-labelSlot { transition: opacity var(--duration-instant) linear; } .arc-button-spinner { animation-duration: .01ms; animation-iteration-count: 1; } }
`;

const styles: Record<string, string> = new Proxy({
  "button": "arc-button-button",
  "danger": "arc-button-danger",
  "ghost": "arc-button-ghost",
  "labelContent": "arc-button-labelContent",
  "labelPhase": "arc-button-labelPhase",
  "labelSlot": "arc-button-labelSlot",
  "lg": "arc-button-lg",
  "loader": "arc-button-loader",
  "loadingLabel": "arc-button-loadingLabel",
  "md": "arc-button-md",
  "primary": "arc-button-primary",
  "secondary": "arc-button-secondary",
  "sm": "arc-button-sm",
  "spinner": "arc-button-spinner"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-button-${prop}`,
});



export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onDrag" | "onDragEnd" | "onDragStart" | "onAnimationStart"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

/** Icon buttons press a little deeper, wide buttons a little less, so every size reads as the same push. */
const pressVariants: Variants = {
  pressed: (button: RefObject<HTMLButtonElement | null>) => {
    const width = button.current?.offsetWidth ?? 0;
    return { scale: width > 220 ? .985 : width && width <= 48 ? .96 : .97, transition: { duration: motionTokens.duration.instant, ease: [...motionTokens.ease.standard] } };
  },
};

const rest: TargetAndTransition = { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" };
/** Text rises about .3em out of a soft blur; the outgoing label lifts away a little faster. */
const textIn: TargetAndTransition = { opacity: 0, y: 4, filter: `blur(${motionTokens.blur.soft}px)` };
const textOut: TargetAndTransition = { opacity: 0, y: -3, filter: `blur(${motionTokens.blur.soft}px)`, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } };
const iconIn: TargetAndTransition = { opacity: 0, scale: .6, filter: `blur(${motionTokens.blur.subtle}px)` };
const iconOut: TargetAndTransition = { opacity: 0, scale: .6, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } };
const fadeIn: TargetAndTransition = { ...rest, opacity: 0 };
const fadeOut: TargetAndTransition = { opacity: 0, transition: { duration: motionTokens.duration.instant } };
/** Scale rides the spring; opacity and blur tween so blur never overshoots below zero. */
const iconEnter = { ...motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] }, filter: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] } } as const;

/** A key for the label content: text plus element names, so a new label or icon crossfades while prop-only updates stay in place. */
function labelKey(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number" || typeof node === "bigint") return String(node);
  if (Array.isArray(node)) return node.map(labelKey).join("");
  if (!isValidElement(node)) return "";
  const type = node.type as string | { displayName?: string; name?: string };
  return `<${typeof type === "string" ? type : type?.displayName ?? type?.name ?? ""}>${labelKey((node.props as { children?: ReactNode }).children)}`;
}

/** Springs the slot to the natural width of the incoming label when it changes, so a new label never snaps the button's size.
 *  The outgoing label is popped out of flow at once, so it never holds the old width. Other resizes (a late web font, a parent reflow) jump straight to the new width, so nothing wobbles on first paint. */
function useMorphWidth(content: RefObject<HTMLElement | null>, key: string, reduced: boolean) {
  const width = useMotionValue<number | "auto">("auto");
  const lastKey = useRef(key), armedUntil = useRef(0);
  useLayoutEffect(() => {
    if (lastKey.current === key) return;
    lastKey.current = key;
    armedUntil.current = performance.now() + 700;
  }, [key]);
  useEffect(() => {
    const node = content.current, slot = node?.parentElement;
    if (!node || !slot || typeof ResizeObserver === "undefined") return;
    let measured = false;
    const observer = new ResizeObserver(([entry]) => {
      const next = entry.contentRect.width;
      if (!next || !measured || reduced || performance.now() > armedUntil.current) { measured = next > 0; width.jump(next || "auto"); delete slot.dataset.morphing; return; }
      slot.dataset.morphing = "";
      animate(width, next, { ...motionTokens.spring.morph, onComplete: () => { delete slot.dataset.morphing; } });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [content, reduced, width]);
  return width;
}

function LabelPhase({ children, icon, reduced, ref }: { children: ReactNode; icon: boolean; reduced: boolean; ref?: Ref<HTMLSpanElement> }) {
  const present = useIsPresent();
  return <motion.span ref={ref} className={styles.labelPhase} aria-hidden={present ? undefined : true} initial={reduced ? fadeIn : icon ? iconIn : textIn} animate={rest} exit={reduced ? fadeOut : icon ? iconOut : textOut} transition={reduced ? { duration: motionTokens.duration.instant } : icon ? iconEnter : { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }}>{children}</motion.span>;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", loading = false, disabled, children, onClick, ...props },
  ref,
) {
  const reduceMotion = useReducedMotion() ?? false;
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const key = labelKey(children);
  const width = useMorphWidth(contentRef, key, reduceMotion);
  const setRefs = useCallback((node: HTMLButtonElement | null) => {
    buttonRef.current = node;
    if (typeof ref === "function") ref(node); else if (ref) ref.current = node;
  }, [ref]);
  // A trigger that anchors a menu, popover, or dialog keeps its rect still while pressed, so the layer never measures a scaled anchor.
  // Radix triggers (asChild) pass aria-haspopup or data-state through; the stylesheet repeats the guard.
  const popup = props["aria-haspopup"];
  const anchorsLayer = (popup !== undefined && popup !== false && popup !== "false") || props.role === "combobox" || (props as Record<string, unknown>)["data-state"] !== undefined;
  const inert = disabled || loading || props["aria-disabled"] === true || props["aria-disabled"] === "true";
  const classes = [styles.button, styles[variant], styles[size], className].filter(Boolean).join(" ");

  return (
    <motion.button
      ref={setRefs}
      tabIndex={props.tabIndex ?? 0}
      className={classes}
      disabled={disabled}
      aria-busy={loading || undefined}
      custom={buttonRef}
      variants={pressVariants}
      whileTap={reduceMotion || anchorsLayer || inert ? undefined : "pressed"}
      transition={motionTokens.spring.snappy}
      {...props}
      // Loading keeps the button focusable (a disabled button would drop keyboard focus mid-action) and swallows presses instead.
      aria-disabled={loading || props["aria-disabled"] || undefined}
      onClick={loading ? event => event.preventDefault() : onClick}
    >
      <AnimatePresence initial={false}>
        {loading ? <motion.span key="loader" className={styles.loader} aria-hidden="true" initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: .6 }} animate={{ opacity: 1, scale: 1 }} exit={reduceMotion ? fadeOut : { ...iconOut, scale: .8 }} transition={reduceMotion ? { duration: motionTokens.duration.instant } : iconEnter}><span className={styles.spinner} /></motion.span> : null}
      </AnimatePresence>
      <motion.span className={[styles.labelSlot, loading ? styles.loadingLabel : ""].filter(Boolean).join(" ")} style={{ width }}>
        <span ref={contentRef} className={styles.labelContent}>
          <AnimatePresence mode="popLayout" initial={false}>
            <LabelPhase key={key} icon={!/\S/.test(key.replace(/<[^>]*>/g, ""))} reduced={reduceMotion}>{children}</LabelPhase>
          </AnimatePresence>
        </span>
      </motion.span>
    </motion.button>
  );
});

Button.displayName = "Button";

export default Button;
