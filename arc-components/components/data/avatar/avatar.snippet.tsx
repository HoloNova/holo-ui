"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLayoutEffect, useRef, useState, type HTMLAttributes } from "react";

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
const ARC_AVATAR_STYLES = `.arc-avatar-avatar {
  position: relative;
  display: inline-grid;
  flex: 0 0 auto;
  place-items: center;
  overflow: visible;
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  background: var(--surface-muted);
  color: var(--foreground);
  font-size: var(--text-xs);
  font-weight: 500;
}

.arc-avatar-avatar img {
  pointer-events: none;
  border-radius: inherit;
  object-fit: cover;
  transition: opacity var(--duration-standard) var(--ease-enter), filter var(--duration-standard) var(--ease-enter);
}

/* Set only while a photo is still downloading after mount, so cached photos never fade. */
.arc-avatar-avatar img[data-loading] {
  opacity: 0;
  filter: blur(4px);
  transition: none;
}

.arc-avatar-fallback { animation: avatar-fallback-in var(--duration-standard) var(--ease-enter) both; }

.arc-avatar-sm { width: 28px; height: 28px; font-size: 10px; }
.arc-avatar-md { width: 36px; height: 36px; }
.arc-avatar-lg { width: 48px; height: 48px; font-size: var(--text-sm); }
.arc-avatar-xl { width: 88px; height: 88px; font-size: 23px; }

.arc-avatar-status {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 2;
  width: 10px;
  height: 10px;
  border: 2px solid var(--surface);
  border-radius: var(--radius-pill);
  box-shadow: 0 0 0 1px color-mix(in oklch, var(--border) 70%, transparent);
}

.arc-avatar-sm .arc-avatar-status { width: 8px; height: 8px; border-width: 1.5px; }
.arc-avatar-lg .arc-avatar-status { width: 12px; height: 12px; }
.arc-avatar-xl .arc-avatar-status { width: 14px; height: 14px; right: 4px; bottom: 4px; }
.arc-avatar-online { background: var(--success); }
.arc-avatar-offline { background: var(--text-muted); }

@keyframes avatar-fallback-in { from { opacity: 0; } to { opacity: 1; } }

@media (prefers-reduced-motion: reduce) {
  .arc-avatar-avatar img { transition: none; }
  .arc-avatar-avatar img[data-loading] { filter: none; }
  .arc-avatar-fallback { animation: none; }
}
`;

const styles: Record<string, string> = new Proxy({
  "avatar": "arc-avatar-avatar",
  "fallback": "arc-avatar-fallback",
  "lg": "arc-avatar-lg",
  "md": "arc-avatar-md",
  "offline": "arc-avatar-offline",
  "online": "arc-avatar-online",
  "sm": "arc-avatar-sm",
  "status": "arc-avatar-status",
  "xl": "arc-avatar-xl"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-avatar-${prop}`,
});


export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> { name: string; src?: string; size?: "sm" | "md" | "lg" | "xl"; status?: "online" | "offline" }
export function Avatar({ name, src, size = "md", status, className, ...props }: AvatarProps) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join("");
  const reduceMotion = !!useReducedMotion();
  const image = useRef<HTMLImageElement>(null);
  const [failedSrc, setFailedSrc] = useState<string>();
  // A photo that is already decoded shows at once. One that is still loading waits, then fades in from a soft blur.
  useLayoutEffect(() => { const node = image.current; if (node && !node.complete) node.dataset.loading = ""; }, [src]);
  const showImage = src && failedSrc !== src;
  return <span {...props} className={[styles.avatar, styles[size], className].filter(Boolean).join(" ")} role="img" aria-label={`${name}${status ? `, ${status}` : ""}`}>
    {showImage ? <Image key={src} ref={image} src={src} alt="" fill sizes={size === "xl" ? "88px" : size === "lg" ? "48px" : size === "md" ? "36px" : "28px"} onLoad={event => { delete event.currentTarget.dataset.loading; }} onError={() => setFailedSrc(src)} /> : <span className={src ? styles.fallback : undefined} aria-hidden="true">{initials}</span>}
    <AnimatePresence initial={false}>{status && <motion.i key={status} className={[styles.status, styles[status]].join(" ")} aria-hidden="true" initial={{ opacity: 0, scale: .6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .6, transition: { duration: reduceMotion ? 0 : motionTokens.duration.fast } }} transition={reduceMotion ? { duration: 0 } : motionTokens.spring.snappy} />}</AnimatePresence>
  </span>;
}
