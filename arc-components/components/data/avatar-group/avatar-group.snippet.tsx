"use client";

import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { useState, type CSSProperties } from "react";

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
const ARC_AVATAR_GROUP_STYLES = `.arc-avatar-group-group { --avatar-size: 36px; display: inline-flex; height: var(--avatar-size); align-items: center; padding-left: 6px; }
.arc-avatar-group-group.sm { --avatar-size: 28px; }
.arc-avatar-group-group.lg { --avatar-size: 48px; }
/* Each slot is the avatar's visible width, so a slot that opens or closes moves the rest of the stack smoothly. */
.arc-avatar-group-slot { position: relative; display: inline-flex; flex: 0 0 auto; height: var(--avatar-size); align-items: center; }
/* One wrapper per person carries every hover move as a single translate, so the stack never changes size. */
.arc-avatar-group-lift { --fan: 0px; --aside: 0px; --rise: 0px; position: relative; display: inline-flex; margin-left: -6px; border-radius: var(--radius-pill); transform: translate(calc(var(--fan) + var(--aside)), var(--rise)); transition: transform 260ms var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard); }
.arc-avatar-group-avatar, .arc-avatar-group-overflow { border: 2px solid var(--surface); box-shadow: 0 0 0 1px var(--border); transition: box-shadow var(--duration-fast) var(--ease-standard); }
.arc-avatar-group-overflow { position: relative; display: inline-grid; place-items: center; overflow: hidden; border-radius: var(--radius-pill); background: var(--surface-muted); color: var(--text-secondary); font-size: var(--text-xs); font-weight: 500; font-variant-numeric: tabular-nums; }
.arc-avatar-group-count { display: inline-block; }
.arc-avatar-group-overflow.sm { width: 28px; height: 28px; font-size: 10px; }
.arc-avatar-group-overflow.md { width: 36px; height: 36px; }
.arc-avatar-group-overflow.lg { width: 48px; height: 48px; font-size: var(--text-sm); }
/* The name floats above the stack, outside the layout, so showing it never moves anything. */
.arc-avatar-group-tip { position: absolute; z-index: 2; bottom: calc(100% + 8px); left: 50%; padding: 4px 8px; border-radius: var(--radius-pill); background: var(--foreground); color: var(--background); font-size: var(--text-xs); font-weight: 500; line-height: 1.2; white-space: nowrap; pointer-events: none; opacity: 0; transform: translate(-50%, 3px); transition: opacity var(--duration-fast) var(--ease-standard), transform var(--duration-fast) var(--ease-standard); }
/* Pointing at the stack loosens its overlap from the center; the person under the pointer lifts with a crisp ring and names themselves, and their neighbors ease aside. */
@media (hover: hover) and (pointer: fine) {
  .arc-avatar-group-group:hover .arc-avatar-group-lift { --fan: calc((var(--index) - (var(--count) - 1) / 2) * 4px); }
  .arc-avatar-group-slot:hover { z-index: 1; }
  .arc-avatar-group-slot:hover .arc-avatar-group-lift { --rise: -2px; }
  .arc-avatar-group-slot:hover ~ .arc-avatar-group-slot .arc-avatar-group-lift { --aside: 3px; }
  .arc-avatar-group-slot:has(~ .arc-avatar-group-slot:hover) .arc-avatar-group-lift { --aside: -3px; }
  .arc-avatar-group-slot:hover .arc-avatar-group-avatar, .arc-avatar-group-slot:hover .arc-avatar-group-overflow { box-shadow: 0 0 0 1px var(--border-strong); }
  .arc-avatar-group-slot:hover .arc-avatar-group-tip { opacity: 1; transform: translate(-50%, 0); transition-delay: 60ms; }
}
/* Reduced motion keeps the stack still; the ring and name still answer the pointer. */
@media (prefers-reduced-motion: reduce) { .arc-avatar-group-lift { transform: none !important; transition: none; } .arc-avatar-group-tip { transform: translate(-50%, 0); transition: none; } }
`;

const styles: Record<string, string> = new Proxy({
  "avatar": "arc-avatar-group-avatar",
  "count": "arc-avatar-group-count",
  "group": "arc-avatar-group-group",
  "lg": "arc-avatar-group-lg",
  "lift": "arc-avatar-group-lift",
  "md": "arc-avatar-group-md",
  "overflow": "arc-avatar-group-overflow",
  "slot": "arc-avatar-group-slot",
  "sm": "arc-avatar-group-sm",
  "tip": "arc-avatar-group-tip"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-avatar-group-${prop}`,
});


// ── Inlined Subcomponent Helpers for Standalone Execution ──
export const Button = forwardRef<HTMLButtonElement, any>(function Button({ className = "", children, ...props }, ref) {
  return <button ref={ref} className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity ${className}`} {...props}>{children}</button>;
});

export function Avatar({ src, alt = "", name = "", className = "" }: any) {
  return <span className={`relative inline-flex items-center justify-center overflow-hidden rounded-full bg-[var(--surface-muted)] text-[var(--foreground)] font-medium text-xs w-8 h-8 ${className}`}>{src ? <img src={src} alt={alt} className="w-full h-full object-cover" /> : (name ? name[0] : "")}</span>;
}

export function AvatarGroup({ children, className = "" }: any) {
  return <div className={`flex items-center -space-x-2 ${className}`}>{children}</div>;
}

export const Input = forwardRef<HTMLInputElement, any>(function Input({ className = "", ...props }, ref) {
  return <input ref={ref} className={`w-full px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] outline-none focus:border-[var(--accent)] ${className}`} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, any>(function Textarea({ className = "", ...props }, ref) {
  return <textarea ref={ref} className={`w-full px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] outline-none focus:border-[var(--accent)] ${className}`} {...props} />;
});

export const PasswordField = forwardRef<HTMLInputElement, any>(function PasswordField({ className = "", ...props }, ref) {
  return <input ref={ref} type="password" className={`w-full px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] outline-none focus:border-[var(--accent)] ${className}`} {...props} />;
});

export const SearchField = forwardRef<HTMLInputElement, any>(function SearchField({ className = "", ...props }, ref) {
  return <input ref={ref} type="search" placeholder="Search..." className={`w-full px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] outline-none focus:border-[var(--accent)] ${className}`} {...props} />;
});

export function OtpInput({ length = 6, value = "", onChange, className = "" }: any) {
  return <div className={`flex gap-2 ${className}`}>{[...Array(length)].map((_, i) => <input key={i} maxLength={1} value={value[i] || ""} className="w-10 h-12 text-center text-lg font-semibold rounded-xl border border-[var(--border)] bg-[var(--surface)]" readOnly />)}</div>;
}

export function Badge({ children, className = "" }: any) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--surface-muted)] text-[var(--text-secondary)] ${className}`}>{children}</span>;
}

export function Progress({ value = 0, className = "" }: any) {
  return <div className={`w-full h-2 rounded-full bg-[var(--surface-muted)] overflow-hidden ${className}`}><div className="h-full bg-[var(--foreground)] transition-all duration-300" style={{ width: `${value}%` }} /></div>;
}

export function Switch({ checked, onCheckedChange, className = "", ...props }: any) {
  return <button type="button" role="switch" aria-checked={checked} onClick={() => onCheckedChange?.(!checked)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${checked ? 'bg-[var(--control-on)]' : 'bg-[var(--control-track)]'} ${className}`} {...props}><span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transform transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} /></button>;
}

export function Checkbox({ checked, onCheckedChange, className = "", ...props }: any) {
  return <input type="checkbox" checked={checked} onChange={e => onCheckedChange?.(e.target.checked)} className={`rounded border-[var(--border)] text-[var(--accent)] ${className}`} {...props} />;
}

export function SegmentedControl({ value, onChange, options = [], className = "" }: any) {
  return (
    <div className={`inline-flex p-1 rounded-xl bg-[var(--surface-muted)] text-sm ${className}`}>
      {options.map((opt: any) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const active = val === value;
        return (
          <button key={val} type="button" onClick={() => onChange?.(val)} className={`px-3 py-1 rounded-lg font-medium transition-all ${active ? 'bg-[var(--surface)] shadow-sm text-[var(--foreground)]' : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'}`}>{label}</button>
        );
      })}
    </div>
  );
}

export function CopyButton({ text, className = "" }: any) {
  return <button type="button" onClick={() => navigator.clipboard?.writeText(text || "")} className={`px-2.5 py-1 text-xs rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] ${className}`}>Copy</button>;
}

export function AnimatedCounter({ value, className = "" }: any) {
  return <span className={className}>{value}</span>;
}

export function TextMorph({ children, className = "" }: any) {
  return <span className={className}>{children}</span>;
}

export function Sparkline({ data = [], className = "" }: any) {
  return <svg className={`w-24 h-8 ${className}`}><path d="M0 16 L20 10 L40 18 L60 8 L80 12 L100 4" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>;
}

export function LineChart({ data = [], className = "" }: any) {
  return <svg className={`w-full h-32 ${className}`}><path d="M0 64 L50 40 L100 70 L150 30 L200 45 L250 15" fill="none" stroke="currentColor" strokeWidth="2" /></svg>;
}

export function Calendar(props: any) {
  return <div className="p-3 border border-[var(--border)] rounded-2xl bg-[var(--surface)]">Calendar</div>;
}



export interface AvatarGroupMember { name: string; src?: string; status?: "online" | "offline"; }
export interface AvatarGroupProps { members: AvatarGroupMember[]; max?: number; size?: "sm" | "md" | "lg"; label?: string; }

/** The overflow count rolls the way it moved: more people rise in from below, fewer drop in from above. */
const rise: Variants = { hidden: (direction: number) => ({ opacity: 0, y: `${.4 * direction}em`, filter: `blur(${motionTokens.blur.subtle}px)` }), shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] } }, gone: (direction: number) => ({ opacity: 0, y: `${-.4 * direction}em`, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } }) };
// Same keys as `rise` so the settled style is identical whichever branch renders on the server.
const fade: Variants = { hidden: { opacity: 0, y: 0, filter: "blur(0px)" }, shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.instant } }, gone: { opacity: 0, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.instant } } };
// A person joining or leaving opens or closes their slot, so the rest of the stack slides instead of jumping.
const slot = { initial: { width: 0, opacity: 0, scale: .9 }, animate: { width: "auto", opacity: 1, scale: 1 }, exit: { width: 0, opacity: 0, scale: .9 } };

export function AvatarGroup({ members, max = 4, size = "md", label = "Team members" }: AvatarGroupProps) {
  const reduceMotion = !!useReducedMotion();
  const visible = members.slice(0, Math.max(0, max));
  const overflow = Math.max(0, members.length - visible.length);
  const transition = reduceMotion ? { duration: 0 } : motionTokens.spring.morph;
  const [count, setCount] = useState({ overflow, direction: 1 });
  if (count.overflow !== overflow) setCount({ overflow, direction: overflow < count.overflow ? -1 : 1 });
  return <div className={[styles.group, styles[size]].join(" ")} role="group" aria-label={label} style={{ "--count": visible.length + (overflow > 0 ? 1 : 0) } as CSSProperties}>
    <AnimatePresence initial={false}>
      {visible.map((member, index) => <motion.span key={member.name} className={styles.slot} style={{ "--index": index } as CSSProperties} {...slot} transition={transition}><span className={styles.lift}><Avatar className={styles.avatar} name={member.name} src={member.src} status={member.status} size={size} /><span className={styles.tip} aria-hidden="true">{member.name}</span></span></motion.span>)}
      {overflow > 0 ? <motion.span key="overflow" className={styles.slot} style={{ "--index": visible.length } as CSSProperties} {...slot} transition={transition}><span className={[styles.lift, styles.overflow, styles[size]].join(" ")} role="img" aria-label={`${overflow} more ${label.toLowerCase()}`}><AnimatePresence mode="popLayout" initial={false} custom={count.direction}><motion.span key={overflow} className={styles.count} custom={count.direction} variants={reduceMotion ? fade : rise} initial="hidden" animate="shown" exit="gone" aria-hidden="true">+{overflow}</motion.span></AnimatePresence></span></motion.span> : null}
    </AnimatePresence>
  </div>;
}

export default AvatarGroup;
