"use client";

import { Fragment, type CSSProperties } from "react";

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
const ARC_TEXT_REVEAL_STYLES = `.arc-text-reveal-reveal { max-width: 24ch; margin: 0; overflow: visible; color: var(--foreground); text-wrap: balance; }
.arc-text-reveal-line { display: block; }
/* The clip hides the rise below the line through a feathered bottom edge, so a blurred word surfaces softly instead of being cut by a hard line.
   Padding with matching negative margins leaves room for descenders and the blur without changing layout; the feather sits below the descenders, so resting words are never dimmed. */
.arc-text-reveal-clip { display: inline-block; vertical-align: top; padding: .1em .16em .24em; margin: -.1em -.16em -.24em; mask-image: linear-gradient(#000 calc(100% - .18em), transparent); }
/* Three tracks: the rise settles longest, the fade finishes first, and the blur clears between them.
   Backwards fill holds the hidden start through each word's delay, then lets go at the end, so resting words keep no transform or filter layer and render as crisp as plain text. */
.arc-text-reveal-word { display: inline-block; animation: rise .76s var(--ease-enter) var(--reveal-delay, 0s) backwards, fade .44s var(--ease-standard) var(--reveal-delay, 0s) backwards, focus .58s var(--ease-enter) var(--reveal-delay, 0s) backwards; }
.arc-text-reveal-srOnly { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; user-select: none; }
@keyframes rise { from { transform: translateY(.62em); } }
@keyframes fade { from { opacity: 0; } }
@keyframes focus { from { filter: blur(var(--reveal-blur, 4px)); } }
@media (prefers-reduced-motion: reduce) { .arc-text-reveal-clip { mask-image: none; } .arc-text-reveal-word { animation: fade .15s linear backwards; } }
`;

const styles: Record<string, string> = new Proxy({
  "clip": "arc-text-reveal-clip",
  "line": "arc-text-reveal-line",
  "reveal": "arc-text-reveal-reveal",
  "srOnly": "arc-text-reveal-srOnly",
  "word": "arc-text-reveal-word"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-text-reveal-${prop}`,
});


/**
 * Reveals a short headline or sentence once, as it mounts: each word rises out of its own clip while it sharpens from a soft blur.
 * The entrance runs in CSS, so it starts on first paint, never waits for hydration, and never leaves text hidden when scripts are slow.
 * Use `\n` in `text` for a deliberate line break and change the element's `key` to replay it.
 */
export interface TextRevealProps { text: string; as?: "h1" | "h2" | "h3" | "p"; className?: string; id?: string; /** Seconds to wait before the first word rises. Defaults to 0. */ delay?: number }
/** Total stagger stays under this many seconds, however long the text is. */
const MAX_STAGGER = motionTokens.duration.considered;

export function TextReveal({ text, as = "h2", className, id, delay = 0 }: TextRevealProps) {
  const Tag = as;
  const lines = text.split("\n").map(line => line.split(" ").filter(Boolean));
  const count = lines.reduce((total, words) => total + words.length, 0);
  const step = Math.min(motionTokens.stagger.word, MAX_STAGGER / Math.max(count, 1));
  const blur = as === "p" ? motionTokens.blur.soft : motionTokens.blur.text;
  let index = 0;
  return <Tag id={id} className={[styles.reveal, className].filter(Boolean).join(" ")} style={{ "--reveal-blur": `${blur}px` } as CSSProperties}>
    <span className={styles.srOnly}>{text.replace(/\n/g, " ")}</span>
    {lines.map((words, lineIndex) => <Fragment key={lineIndex}><span className={styles.line} aria-hidden="true">{words.map((word, wordIndex) => {
      const position = index++;
      return <Fragment key={`${word}-${position}`}><span className={styles.clip}><span className={styles.word} style={{ "--reveal-delay": `${delay + position * step + lineIndex * step}s` } as CSSProperties}>{word}</span></span>{wordIndex < words.length - 1 ? " " : null}</Fragment>;
    })}</span>{lineIndex < lines.length - 1 ? " " : null}</Fragment>)}
  </Tag>;
}

export default TextReveal;
