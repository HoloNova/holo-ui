"use client";

import type { AnimationPlaybackControls } from "motion/react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, usePageInView, useReducedMotion, useTransform } from "motion/react";
import { useEffect, useRef, useSyncExternalStore } from "react";

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
const ARC_TEXT_SHIMMER_STYLES = `/* The band is the current text color; the resting base leans toward muted text. Override with --text-shimmer-highlight and --text-shimmer-base. */
.arc-text-shimmer-shimmer { --ts-highlight: var(--text-shimmer-highlight, currentColor); --ts-base: var(--text-shimmer-base, color-mix(in oklab, currentColor 12%, var(--text-muted))); }
.arc-text-shimmer-stage { position: relative; display: inline-block; max-width: 100%; }
.arc-text-shimmer-label { display: inline-block; max-width: 100%; background-repeat: no-repeat; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.arc-text-shimmer-label::selection { -webkit-text-fill-color: currentColor; }
@supports not (color: color-mix(in oklab, red, blue)) { .arc-text-shimmer-label { background: none !important; -webkit-text-fill-color: currentColor; } }
@media (forced-colors: active) { .arc-text-shimmer-label { background: none !important; -webkit-text-fill-color: currentColor; } }
`;

const styles: Record<string, string> = new Proxy({
  "label": "arc-text-shimmer-label",
  "shimmer": "arc-text-shimmer-shimmer",
  "stage": "arc-text-shimmer-stage"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-text-shimmer-${prop}`,
});

const subscribeHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
/** Half width of the highlight band in em, and a bell shaped falloff as [offset, strength] stops. */
const band = 2.2;
const falloff = [[-1, 0], [-.5, .5], [-.2, .9], [0, 1], [.2, .9], [.5, .5], [1, 0]] as const;
const percent = (value: number) => `${(value * 100).toFixed(1)}%`;

/** Paints the band at sweep position `t` (0 sits left of the text, 1 right of it) over a base that is `settle` of the way to solid. */
function shimmerImage(t: number, settle: number) {
  const base = `color-mix(in oklab, var(--ts-highlight) ${percent(settle)}, var(--ts-base))`;
  const stops = falloff.map(([offset, strength]) => `color-mix(in oklab, var(--ts-highlight) ${percent(strength)}, ${base}) calc(${(t * 100).toFixed(2)}% + ${((2 * t - 1 + offset) * band).toFixed(3)}em)`);
  return `linear-gradient(90deg, ${base}, ${stops.join(", ")}, ${base})`;
}

/**
 * A calm light sweep across a short status line, such as "Thinking" or "Generating summary", to show that work is ongoing.
 * The band uses the current text color over a muted base. When `active` turns false the band glides off and the text settles to solid.
 * A changed label rises in place. The component sets `aria-busy`; announce completion from your own live region.
 */
export interface TextShimmerProps {
  /** The status text. Keep it to one short line. */
  children: string;
  /** Sweep while work is ongoing. Defaults to true. */
  active?: boolean;
  /** Seconds for one sweep across the text. Defaults to 1.8. */
  duration?: number;
  as?: "span" | "p" | "div" | "h2" | "h3" | "h4";
  className?: string;
  id?: string;
}
export function TextShimmer({ children, active = true, duration = 1.8, as = "span", className, id }: TextShimmerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const prefersReduced = useReducedMotion();
  const hydrated = useSyncExternalStore(subscribeHydration, clientSnapshot, serverSnapshot);
  const reduced = Boolean(hydrated && prefersReduced);
  const inView = useInView(ref, { margin: "64px" });
  const pageVisible = usePageInView();
  const sweep = useMotionValue(0);
  const settle = useMotionValue(active ? 0 : 1);
  const backgroundImage = useTransform(() => shimmerImage(sweep.get(), settle.get()));
  const running = active && !reduced && inView && pageVisible;
  const Tag = as;

  // Loop the sweep only while work is ongoing, visible, and motion is allowed. A paused band resumes where it stopped.
  useEffect(() => {
    if (reduced) sweep.jump(0);
    if (!running) return;
    let controls: AnimationPlaybackControls | undefined;
    const pass = (delay: number) => {
      if (sweep.get() >= 1) sweep.jump(0);
      controls = animate(sweep, 1, { duration: duration * (1 - sweep.get()), delay, ease: "linear", onComplete: () => pass(duration * .32) });
    };
    pass(sweep.get() > 0 ? 0 : .12);
    return () => controls?.stop();
  }, [running, reduced, duration, sweep]);

  // Finishing lets a band in flight glide off while the base resolves to solid, so the text never hard cuts.
  useEffect(() => {
    if (active) {
      const dim = animate(settle, 0, { duration: reduced ? 0 : motionTokens.duration.standard, ease: [...motionTokens.ease.standard] });
      return () => dim.stop();
    }
    const t = sweep.get();
    const glide = !reduced && t > 0 && t < 1 ? animate(sweep, 1, { duration: Math.min(.42, duration * (1 - t) * .5), ease: [...motionTokens.ease.enter] }) : undefined;
    const solid = animate(settle, 1, { duration: reduced ? motionTokens.duration.instant : .36, ease: [...motionTokens.ease.standard] });
    return () => { glide?.stop(); solid.stop(); };
  }, [active, reduced, duration, sweep, settle]);

  return <Tag id={id} className={[styles.shimmer, className].filter(Boolean).join(" ")} data-state={active ? "active" : "idle"} aria-busy={active || undefined}>
    <span ref={ref} className={styles.stage}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={children} className={styles.label} style={{ backgroundImage }}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: "0.3em", filter: `blur(${motionTokens.blur.soft}px)` }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: "0em", filter: "blur(0px)" }}
          exit={reduced ? { opacity: 0, transition: { duration: motionTokens.duration.instant } } : { opacity: 0, y: "-0.24em", filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } }}
          transition={{ duration: reduced ? motionTokens.duration.instant : motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }}>{children}</motion.span>
      </AnimatePresence>
    </span>
  </Tag>;
}

export default TextShimmer;
