"use client";

import { AnimatePresence, animate, motion, useReducedMotion, type AnimationPlaybackControls } from "motion/react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

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
const ARC_TEXT_MORPH_STYLES = `/* The frame carries the animated width. Its mask reveals new letters through a soft trailing edge as it grows and fades leaving ones as it shrinks.
   Padding with matching negative margins gives the mask room for blur and descenders without changing layout; the edge sits entirely in that room, so resting text is never dimmed.
   The track always starts at the frame's leading edge, even in centered text: otherwise it would recenter inside the old width and leaving letters would jump. */
.arc-text-morph-frame.frame, .arc-text-morph-frame { position: relative; display: inline-block; box-sizing: content-box; padding: .5em .5em .5em .2em; margin: -.5em -.5em -.5em -.2em; text-align: start; white-space: nowrap; mask-image: linear-gradient(90deg, #000 calc(100% - .5em), transparent); }
/* The track sizes to the letters in flow. Leaving letters are taken out of flow and positioned against it. */
.arc-text-morph-track { position: relative; display: inline-block; white-space: nowrap; }
.arc-text-morph-glyph { display: inline-block; white-space: pre; transform-origin: 50% 60%; }
.arc-text-morph-srOnly { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; user-select: none; }
`;

const styles: Record<string, string> = new Proxy({
  "frame": "arc-text-morph-frame",
  "glyph": "arc-text-morph-glyph",
  "srOnly": "arc-text-morph-srOnly",
  "track": "arc-text-morph-track"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-text-morph-${prop}`,
});


/**
 * Morphs one short label into the next in place. Letters both strings share glide to their new positions, new letters sharpen in, removed letters blur away,
 * and the width follows on a spring so the surrounding layout glides instead of jumping. Use it for status words that change a few letters at a time,
 * such as Publish, Publishing, and Published, or Follow and Following. It stays on one line, and assistive technology reads the plain text.
 */
export interface TextMorphProps { children: string; as?: "span" | "div" | "p" | "strong" | "h1" | "h2" | "h3"; className?: string; id?: string }

const enter = [...motionTokens.ease.enter] as [number, number, number, number];
const standard = [...motionTokens.ease.standard] as [number, number, number, number];
const blurred = `blur(${motionTokens.blur.soft}px)`;
/** Lets leaving letters start to clear before the first new letter sharpens in their place. */
const HANDOFF = .05;
/** Letters match by character and occurrence, so the second "i" in one string pairs with the second "i" in the next. */
function toGlyphs(text: string) {
  const seen = new Map<string, number>();
  return Array.from(text).map(char => { const count = seen.get(char) ?? 0; seen.set(char, count + 1); return { char, key: `${char}-${count}` }; });
}
const measure = (element: HTMLElement) => parseFloat(getComputedStyle(element).width);

export function TextMorph({ children, as = "span", className, id }: TextMorphProps) {
  const Tag = as;
  const reduced = useReducedMotion();
  const frame = useRef<HTMLSpanElement>(null);
  const track = useRef<HTMLSpanElement>(null);
  const width = useRef(0);
  const sizing = useRef<AnimationPlaybackControls | null>(null);
  const glyphs = useMemo(() => toGlyphs(children), [children]);
  // The previous label tells which letters are new, so only they stagger, in reading order, however far along the word they sit.
  const [labels, setLabels] = useState({ current: children, previous: children });
  if (labels.current !== children) setLabels({ current: children, previous: labels.current });
  const kept = useMemo(() => new Set(toGlyphs(labels.previous).map(glyph => glyph.key)), [labels.previous]);
  let entering = 0;

  // The frame holds an explicit width so a new label never snaps it; the spring then follows the track, which already has the new letters in place.
  useLayoutEffect(() => {
    const frameElement = frame.current, trackElement = track.current;
    if (!frameElement || !trackElement) return;
    const next = measure(trackElement);
    if (!Number.isFinite(next)) return;
    if (width.current && Math.abs(next - width.current) > .5 && !reduced) sizing.current = animate(frameElement, { width: next }, motionTokens.spring.morph);
    else { sizing.current?.stop(); frameElement.style.width = `${next}px`; }
    width.current = next;
  }, [children, reduced]);
  // Font loading or a responsive font size changes the width without a new label: follow it immediately.
  useEffect(() => {
    const frameElement = frame.current, trackElement = track.current;
    if (!frameElement || !trackElement || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const next = measure(trackElement);
      if (!Number.isFinite(next) || Math.abs(next - width.current) < .5) return;
      sizing.current?.stop(); frameElement.style.width = `${next}px`; width.current = next;
    });
    observer.observe(trackElement);
    return () => observer.disconnect();
  }, []);

  return <Tag id={id} className={className}>
    <span className={styles.srOnly}>{children}</span>
    <span ref={frame} className={styles.frame} aria-hidden="true"><span ref={track} className={styles.track}>
      <AnimatePresence mode="popLayout" initial={false}>
        {glyphs.map(({ char, key }) => { const order = kept.has(key) ? 0 : entering++; return <motion.span key={key} layout="position" className={styles.glyph}
          initial={reduced ? false : { opacity: 0, scale: .8, y: "0.14em", filter: blurred }}
          animate={{ opacity: 1, scale: 1, y: "0em", filter: "blur(0px)" }}
          exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: .86, y: "-0.1em", filter: blurred, transition: { duration: motionTokens.duration.exit, ease: standard } }}
          transition={reduced ? { duration: 0 } : { layout: motionTokens.spring.morph, default: { duration: motionTokens.duration.standard + .04, ease: enter, delay: HANDOFF + Math.min(order, 8) * motionTokens.stagger.char * 2 } }}>
          {char === " " ? "\u00a0" : char}
        </motion.span>; })}
      </AnimatePresence>
    </span></span>
  </Tag>;
}

export default TextMorph;
