"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import type { HTMLMotionProps, MotionProps, Transition, Variants } from "motion/react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";

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
const ARC_CARD_STYLES = `/* Isolation keeps the rounded clip on the media while the card lifts on its own layer (Safari drops it otherwise).
   Motion drives the lift and the quick look morph, so transform never gets a CSS transition here. */
.arc-card-card { position: relative; min-width: 0; overflow: hidden; isolation: isolate; border: 1px solid var(--border); border-radius: var(--radius-panel); background: var(--surface); color: var(--foreground); transition: border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-standard) var(--ease-standard); }
/* A pointed-at card floats a little, so the shadow arrives with the lift. Touch and pen never lift. */
.arc-card-card[data-hover] { border-color: var(--border-strong); box-shadow: var(--shadow-raised); }
.arc-card-card:has(.arc-card-trigger:focus-visible) { border-color: var(--border-strong); outline: 2px solid var(--focus-ring); outline-offset: 3px; }
.arc-card-media { position: relative; overflow: hidden; background: var(--surface-muted); }
.arc-card-zoom { display: grid; min-height: 112px; place-items: center; }
.arc-card-content { padding: var(--space-5); }
/* Fit-content width keeps the title's box the shape of its text, so it scales evenly when it grows into the quick look. */
.arc-card-title { width: fit-content; max-width: 100%; margin: 0; font-size: var(--text-lg); font-weight: 500; letter-spacing: var(--tracking-body); line-height: 1.3; text-wrap: balance; }
.arc-card-trigger { padding: 0; border: 0; background: none; color: inherit; font: inherit; letter-spacing: inherit; text-align: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; }
/* The title's hit area stretches over the whole card, so pointing anywhere opens the quick look while the action stays on top. */
.arc-card-trigger::after { content: ""; position: absolute; inset: 0; }
.arc-card-trigger:focus-visible { outline: none; }
.arc-card-description { max-width: 34ch; margin: var(--space-2) 0 0; color: var(--text-secondary); font-size: var(--text-sm); line-height: var(--leading-body); text-wrap: pretty; }
.arc-card-footer { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); margin-top: var(--space-5); }
.arc-card-byline { display: flex; flex: 1 1 auto; align-items: center; gap: var(--space-3); min-width: 0; }
.arc-card-avatar { display: grid; flex: none; width: var(--space-8); height: var(--space-8); overflow: hidden; border-radius: var(--radius-pill); background: var(--surface-muted); }
.arc-card-avatar > * { width: 100%; height: 100%; object-fit: cover; }
/* A shrinkable column, so a narrow footer truncates the byline instead of sliding it under the action. */
.arc-card-bylineText { display: grid; grid-template-columns: minmax(0, 1fr); min-width: 0; font-size: var(--text-xs); line-height: var(--leading-body); }
.arc-card-meta { overflow: hidden; color: var(--foreground); font-weight: 500; text-overflow: ellipsis; white-space: nowrap; }
.arc-card-status { position: relative; overflow: clip visible; color: var(--text-muted); white-space: nowrap; font-variant-numeric: tabular-nums; }
/* The line clips sideways only, so a status too long for its column ends in an ellipsis while its words still rise in unclipped. */
.arc-card-roll { position: relative; display: block; }
.arc-card-line { display: block; overflow: clip visible; text-overflow: ellipsis; }
.arc-card-word { display: inline-block; white-space: pre; }
.arc-card-srOnly { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.arc-card-action { position: relative; z-index: 1; display: flex; flex: none; flex-wrap: wrap; gap: var(--space-3); }

.arc-card-overlay { position: fixed; inset: 0; z-index: 50; background: oklch(10% 0 0 / .46); backdrop-filter: blur(7px); }
/* Centered with auto margins, so transform stays free for the morph. */
.arc-card-panel { position: fixed; inset: 0; z-index: 51; width: min(calc(100vw - var(--space-8)), 30rem); height: fit-content; max-height: calc(100dvh - var(--space-8)); margin: auto; overflow: hidden auto; overscroll-behavior: contain; border: 1px solid var(--border); border-radius: var(--radius-surface); background: var(--surface-raised); color: var(--foreground); box-shadow: var(--shadow-floating); transition: background-color var(--duration-standard) var(--ease-standard), box-shadow var(--duration-standard) var(--ease-standard); }
.arc-card-panel:focus { outline: none; }
/* Closing: the panel takes the card's box and look, so it lands exactly where the card sits and hands back without a seam. */
.arc-card-panel[data-returning] { inset: auto; top: var(--landing-top); left: var(--landing-left); width: var(--landing-width); height: var(--landing-height); max-height: none; margin: 0; overflow: hidden; border-color: var(--border); background: var(--surface); box-shadow: none; pointer-events: none; }
.arc-card-panel[data-returning] .arc-card-content { padding: var(--space-5); }
.arc-card-panel[data-returning] .arc-card-title { font-size: var(--text-lg); }
.arc-card-panel .arc-card-content { padding: var(--space-6); }
.arc-card-panel .arc-card-title { font-size: var(--text-xl); }
.arc-card-panel .arc-card-description { max-width: var(--card-measure, 34ch); }
/* The slot carries the entrance, so the button's own press answers instantly. */
.arc-card-closeSlot { position: absolute; top: var(--space-4); right: var(--space-4); z-index: 2; display: grid; }
.arc-card-close { display: grid; width: var(--space-8); height: var(--space-8); place-items: center; padding: 0; border: 1px solid color-mix(in oklch, var(--border) 70%, transparent); border-radius: var(--radius-pill); background: color-mix(in oklch, var(--surface-raised) 74%, transparent); backdrop-filter: blur(12px); color: var(--foreground); cursor: pointer; -webkit-tap-highlight-color: transparent; transition: background-color var(--duration-fast) var(--ease-standard); }
@media (hover: hover) and (pointer: fine) { .arc-card-close:hover { background: var(--surface-raised); } }
.arc-card-close:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.arc-card-details { margin-top: var(--space-6); padding-top: var(--space-5); border-top: 1px solid var(--border); color: var(--text-secondary); font-size: var(--text-sm); line-height: var(--leading-body); }

@media (prefers-reduced-motion: reduce) {
  .arc-card-card, .arc-card-close { transition-duration: var(--duration-instant); }
}
`;

const styles: Record<string, string> = new Proxy({
  "action": "arc-card-action",
  "avatar": "arc-card-avatar",
  "byline": "arc-card-byline",
  "bylineText": "arc-card-bylineText",
  "card": "arc-card-card",
  "close": "arc-card-close",
  "closeSlot": "arc-card-closeSlot",
  "content": "arc-card-content",
  "description": "arc-card-description",
  "details": "arc-card-details",
  "footer": "arc-card-footer",
  "line": "arc-card-line",
  "media": "arc-card-media",
  "meta": "arc-card-meta",
  "overlay": "arc-card-overlay",
  "panel": "arc-card-panel",
  "roll": "arc-card-roll",
  "srOnly": "arc-card-srOnly",
  "status": "arc-card-status",
  "title": "arc-card-title",
  "trigger": "arc-card-trigger",
  "word": "arc-card-word",
  "zoom": "arc-card-zoom"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-card-${prop}`,
});



export interface CardProps extends HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  media?: ReactNode;
  action?: ReactNode;
  /** A small leading visual for the footer, such as the owner's avatar. */
  avatar?: ReactNode;
  /** Who the card belongs to, such as the owner's name. */
  meta?: ReactNode;
  /** A short status under the meta, such as "Updated 2 hours ago". Changed words rise in and are announced politely. */
  status?: string;
  /** Content for a quick look. When set, the whole card opens and grows into a larger view; Escape or the close control morphs it back. */
  details?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type Side = "card" | "panel";
type Geometry = { card?: number; panel?: number; measure?: number };
type Landing = { top: number; left: number; width: number; height: number };

const { blur, duration, ease, spring, stagger } = motionTokens;
/** One critically damped spring carries the surface both ways, so it never overshoots and can reverse mid-flight. Closing is a touch quicker. */
const grow: Transition = { ...spring.smooth, visualDuration: .3 };
const settle: Transition = { ...spring.smooth, visualDuration: .26 };
const RETURN_MS = 300;
const fade: Transition = { duration: duration.instant };
/** The photo drifts in slowly while the card is pointed at, and eases back a little faster. */
const ZOOM = 1.04;
const zoomIn: Transition = { duration: duration.considered * 2, ease: [...ease.standard] };
const zoomOut: Transition = { duration: duration.considered, ease: [...ease.standard] };
/** Quick look extras arrive once the surface has mostly grown, so they never ride the stretch. */
const reveal: Transition = { delay: duration.instant, duration: duration.standard, ease: [...ease.enter] };
const closeIn: Transition = { delay: duration.instant, duration: duration.fast, ease: [...ease.enter] };

/** A new status replaces the whole line: the old one lifts away quickly while the new words rise in one after another. */
const lineMotion: Variants = {
  enter: {},
  center: {},
  exit: { opacity: 0, y: "-.3em", filter: `blur(${blur.subtle}px)`, transition: { duration: duration.fast, ease: [...ease.standard] } },
};
const wordMotion: Variants = {
  enter: { opacity: 0, y: ".3em", filter: `blur(${blur.soft}px)` },
  center: (order: number) => ({ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: duration.standard, ease: [...ease.enter], delay: order * stagger.word } }),
};

function Status({ text, reduced }: { text: string; reduced: boolean }) {
  return <span className={styles.status} role="status">
    <span className={styles.srOnly}>{text}</span>
    <span className={styles.roll} aria-hidden="true"><AnimatePresence mode="popLayout" initial={false}>
      <motion.span key={text} className={styles.line} variants={lineMotion} initial={reduced ? false : "enter"} animate="center" exit={reduced ? undefined : "exit"}>
        {text.split(/(\s+)/).map((part, index) => <motion.span key={index} className={styles.word} custom={index / 2} variants={wordMotion}>{part}</motion.span>)}
      </motion.span>
    </AnimatePresence></span>
  </span>;
}

/** Motion only scale-corrects pixel radii, so token radii are read back in pixels for the morph. */
function px(node: Element, value: string) {
  const amount = parseFloat(value);
  if (!Number.isFinite(amount)) return undefined;
  return value.trim().endsWith("rem") ? amount * parseFloat(getComputedStyle(node.ownerDocument.documentElement).fontSize) : amount;
}

export function Card({ title, description, media, action, avatar, meta, status, details, open: openProp, defaultOpen = false, onOpenChange, children, className, style, ...props }: CardProps) {
  const reduced = useReducedMotion() ?? false;
  const group = useId();
  const cardRef = useRef<HTMLElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const [hovered, setHovered] = useState(false);
  const [geometry, setGeometry] = useState<Geometry>({});
  /** Where the quick look lands when it closes: the card's box on screen. The panel travels there above the page, then hands back to the card. */
  const [landing, setLanding] = useState<Landing | null>(null);
  const open = details ? openProp ?? uncontrolled : false;
  const morph = Boolean(details) && !reduced;
  const returning = !open && landing !== null;
  const hasDescription = Boolean(description);
  const setOpen = useCallback((next: boolean) => { if (openProp === undefined) setUncontrolled(next); onOpenChange?.(next); }, [openProp, onOpenChange]);

  // The quick look keeps the card's line length, so the description never rewraps while it travels.
  useEffect(() => {
    const node = cardRef.current, text = descriptionRef.current;
    if (!morph || !node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const computed = getComputedStyle(node);
      const radius = px(node, computed.borderTopLeftRadius), surface = px(node, computed.getPropertyValue("--radius-surface")), measure = text?.offsetWidth || undefined;
      setGeometry(current => current.card !== undefined && current.measure === measure ? current : { card: current.card ?? radius, panel: current.panel ?? surface, measure });
    });
    observer.observe(node);
    if (text) observer.observe(text);
    return () => observer.disconnect();
  }, [morph, hasDescription]);

  // Closing keeps the quick look mounted and sends it back to the card's box, so the surface never drops behind the page or a clipped preview.
  const wasOpen = useRef(open);
  useLayoutEffect(() => {
    const closed = wasOpen.current && !open;
    wasOpen.current = open;
    const node = cardRef.current;
    if (open) setLanding(null); // eslint-disable-line react-hooks/set-state-in-effect -- reopening mid-return cancels the landing
    else if (closed && morph && node) {
      const box = node.getBoundingClientRect();
      setLanding({ top: box.top, left: box.left, width: box.width, height: box.height });
    }
  }, [open, morph]);
  // Once the surface has visually landed, the card takes over. Any last sub-pixel of travel carries on in the card itself, so the handoff has no seam.
  useEffect(() => {
    if (!returning) return;
    const timer = window.setTimeout(() => setLanding(null), RETURN_MS);
    return () => window.clearTimeout(timer);
  }, [returning]);

  /** The same pieces live in the card and in the quick look; a shared id lets each one travel between them.
      Crossfade is off: the arriving piece takes over at full opacity and the other hides, so one solid surface moves instead of two translucent copies. */
  const shared = (id: string, side: Side, layout: true | "position" = true): MotionProps => morph ? { layoutId: id, layout, layoutCrossfade: false, layoutDependency: side === "card" ? open : returning ? "return" : "panel", transition: { layout: side === "card" ? settle : grow } } : {};

  const footer = (side: Side) => avatar || meta || status || action ? <div className={styles.footer}>
    {avatar || meta || status ? <motion.div className={styles.byline} {...shared("byline", side, "position")}>
      {avatar ? <span className={styles.avatar}>{avatar}</span> : null}
      <span className={styles.bylineText}>{meta ? <span className={styles.meta}>{meta}</span> : null}{status ? <Status text={status} reduced={reduced} /> : null}</span>
    </motion.div> : null}
    {action ? <motion.div className={styles.action} {...shared("action", side, "position")}>{action}</motion.div> : null}
  </div> : null;

  const card = <motion.article
    {...(props as HTMLMotionProps<"article">)}
    ref={cardRef}
    className={[styles.card, className].filter(Boolean).join(" ")}
    style={{ ...style, borderRadius: geometry.card ?? style?.borderRadius }}
    data-hover={hovered || undefined}
    whileHover={reduced ? undefined : { y: -2 }}
    onHoverStart={() => setHovered(true)}
    onHoverEnd={() => setHovered(false)}
    {...shared("card", "card")}
    transition={{ default: spring.snappy, layout: settle }}
  >
    {media ? <motion.div className={styles.media} {...shared("media", "card")}><motion.div className={styles.zoom} initial={false} animate={{ scale: hovered && !reduced ? ZOOM : 1 }} transition={hovered ? zoomIn : zoomOut}>{media}</motion.div></motion.div> : null}
    <div className={styles.content}>
      <motion.h3 className={styles.title} {...shared("title", "card")}>{details ? <Dialog.Trigger asChild><button type="button" className={styles.trigger}>{title}</button></Dialog.Trigger> : title}</motion.h3>
      {description ? <motion.p ref={descriptionRef} className={styles.description} {...shared("description", "card", "position")}>{description}</motion.p> : null}
      {children}
      {footer("card")}
    </div>
  </motion.article>;

  if (!details) return card;

  // The quick look grows out of the card: the surface, photo, and copy travel on one spring while the details settle in beneath them.
  return <Dialog.Root open={open} onOpenChange={setOpen}>
    <LayoutGroup id={group}>
      {card}
      <AnimatePresence>
        {(open || returning) && <Dialog.Portal key="quick-look" forceMount>
          <AnimatePresence>{open && <Dialog.Overlay key="overlay" asChild forceMount><motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: reduced ? fade : { duration: duration.exit, ease: [...ease.standard] } }} transition={reduced ? fade : { duration: duration.standard, ease: [...ease.enter] }} /></Dialog.Overlay>}</AnimatePresence>
          <Dialog.Content asChild forceMount {...(description ? {} : { "aria-describedby": undefined })}>
            <motion.div
              className={styles.panel}
              data-framer-portal-id={group}
              data-returning={returning || undefined}
              layoutScroll
              style={{ borderRadius: geometry.panel, "--card-measure": geometry.measure ? `${geometry.measure}px` : undefined, ...(landing && returning ? { "--landing-top": `${landing.top}px`, "--landing-left": `${landing.left}px`, "--landing-width": `${landing.width}px`, "--landing-height": `${landing.height}px` } : {}) } as CSSProperties}
              {...(morph ? {
                ...shared("card", "panel"),
                initial: false,
                animate: geometry.card !== undefined && geometry.panel !== undefined ? { borderRadius: returning ? geometry.card : geometry.panel } : undefined,
                transition: { layout: returning ? settle : grow, borderRadius: returning ? settle : grow },
                exit: { opacity: 0, transition: { duration: 0 } },
              } : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0, transition: fade }, transition: fade })}
            >
              {media ? <motion.div className={styles.media} {...shared("media", "panel")}><motion.div className={styles.zoom} initial={{ scale: hovered && !reduced ? ZOOM : 1 }} animate={{ scale: 1 }} transition={grow}>{media}</motion.div></motion.div> : null}
              <motion.span className={styles.closeSlot} initial={reduced ? { opacity: 0 } : { opacity: 0, scale: .9 }} animate={returning ? { opacity: 0, scale: .9 } : { opacity: 1, scale: 1 }} transition={returning ? fade : reduced ? fade : closeIn}><Dialog.Close asChild><motion.button type="button" className={styles.close} aria-label="Close quick look" whileTap={reduced ? undefined : { scale: .94 }} transition={spring.snappy}><X width={16} height={16} strokeWidth={1.75} aria-hidden="true" /></motion.button></Dialog.Close></motion.span>
              <div className={styles.content}>
                <Dialog.Title asChild><motion.h2 className={styles.title} {...shared("title", "panel")}>{title}</motion.h2></Dialog.Title>
                {description ? <Dialog.Description asChild><motion.p className={styles.description} {...shared("description", "panel", "position")}>{description}</motion.p></Dialog.Description> : null}
                {children}
                {footer("panel")}
                <motion.div className={styles.details} initial={reduced ? false : { opacity: 0, y: 6 }} animate={returning ? { opacity: 0, y: 0 } : { opacity: 1, y: 0 }} exit={{ opacity: 0, transition: fade }} transition={returning || reduced ? fade : reveal}>{details}</motion.div>
              </div>
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>}
      </AnimatePresence>
    </LayoutGroup>
  </Dialog.Root>;
}
