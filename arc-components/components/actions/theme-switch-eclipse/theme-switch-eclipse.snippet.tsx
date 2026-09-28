"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

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
const ARC_THEME_SWITCH_ECLIPSE_STYLES = `/* Each transition uses the same library Button, which owns the press scale; this file only animates the icon in place. */
.arc-theme-switch-eclipse-themeSwitch {
  position: relative;
  width: auto;
  padding-inline: var(--space-3);
}
.arc-theme-switch-eclipse-iconOnly { width: 38px; min-width: 38px; height: 38px; min-height: 38px; border-radius: 12px; padding: 0; }
@media (hover: hover) and (pointer: fine) {
  .arc-theme-switch-eclipse-themeSwitch:hover:not(:disabled) { border-color: var(--border-strong); }
  .arc-theme-switch-eclipse-iconOnly:hover:not(:disabled) { background: var(--surface-muted); box-shadow: none; }
}
.arc-theme-switch-eclipse-themeSwitch:focus-visible { outline-offset: 3px; }
.arc-theme-switch-eclipse-iconWrap {
  position: relative;
  display: inline-grid;
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
  place-items: center;
}
/* The nudge only eases once the switch has settled, so a theme that arrives during hydration lands without motion. */
.arc-theme-switch-eclipse-settled .arc-theme-switch-eclipse-iconWrap { transition: transform var(--duration-spring) var(--ease-spring); }
.arc-theme-switch-eclipse-icon { position: absolute; display: grid; width: 18px; height: 18px; place-items: center; }
.arc-theme-switch-eclipse-label { white-space: nowrap; }
/* Each variant nudges the icon the way its page transition travels, and eases back when the theme returns. */
.arc-theme-switch-eclipse-themeSwitch.reveal[data-theme="dark"] .arc-theme-switch-eclipse-iconWrap { transform: scale(1.08); }
.arc-theme-switch-eclipse-themeSwitch.eclipse[data-theme="dark"] .arc-theme-switch-eclipse-iconWrap { transform: translateX(-2px); }
.arc-theme-switch-eclipse-themeSwitch.split[data-theme="dark"] .arc-theme-switch-eclipse-iconWrap { transform: translateX(1px); }
.arc-theme-switch-eclipse-themeSwitch.rise[data-theme="dark"] .arc-theme-switch-eclipse-iconWrap { transform: translateY(-2px); }
@media (prefers-reduced-motion: reduce) {
  .arc-theme-switch-eclipse-settled .arc-theme-switch-eclipse-iconWrap { transition: none; }
}
`;

const styles: Record<string, string> = new Proxy({
  "eclipse": "arc-theme-switch-eclipse-eclipse",
  "icon": "arc-theme-switch-eclipse-icon",
  "iconOnly": "arc-theme-switch-eclipse-iconOnly",
  "iconWrap": "arc-theme-switch-eclipse-iconWrap",
  "label": "arc-theme-switch-eclipse-label",
  "reveal": "arc-theme-switch-eclipse-reveal",
  "rise": "arc-theme-switch-eclipse-rise",
  "settled": "arc-theme-switch-eclipse-settled",
  "split": "arc-theme-switch-eclipse-split",
  "themeSwitch": "arc-theme-switch-eclipse-themeSwitch"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-theme-switch-eclipse-${prop}`,
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



export type ThemeSwitchVariant = "reveal" | "eclipse" | "split" | "rise";
export type Theme = "light" | "dark";

export interface ThemeSwitchProps {
  theme: Theme;
  variant?: ThemeSwitchVariant;
  onThemeChange: (next: Theme, variant: ThemeSwitchVariant, trigger: HTMLElement) => void;
  label?: string;
  iconOnly?: boolean;
}

/** Rotation and scale ride the spring; opacity and blur tween so the blur never overshoots below zero. */
const iconSpring = { ...motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] }, filter: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] } } as const;
const iconExit = { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } as const;
const blur = `blur(${motionTokens.blur.subtle}px)`;

/** A stored preference usually reaches the theme prop just after hydration. That correction swaps the icon in place;
 *  only changes after the first painted frames animate, so a page that loads in dark mode never spins its switches. */
function useSettled() {
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    let second = 0;
    const first = requestAnimationFrame(() => { second = requestAnimationFrame(() => setSettled(true)); });
    return () => { cancelAnimationFrame(first); cancelAnimationFrame(second); };
  }, []);
  return settled;
}

/** Both icons turn the same way (clockwise into dark, back out of it), so the swap reads as one rotation rather than two fades. */
function ThemeIcon({ theme, reduced, settled }: { theme: Theme; reduced: boolean; settled: boolean }) {
  const Icon = theme === "light" ? Sun : Moon;
  const angle = theme === "light" ? 30 : -30;
  return (
    <AnimatePresence initial={false} mode="popLayout">
      <motion.span
        key={theme}
        className={styles.icon}
        initial={!settled ? false : reduced ? { opacity: 0 } : { opacity: 0, scale: .7, rotate: angle, filter: blur }}
        animate={{ opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" }}
        exit={!settled ? { opacity: 0, transition: { duration: 0 } } : reduced ? { opacity: 0, transition: { duration: motionTokens.duration.instant } } : { opacity: 0, scale: .7, rotate: angle, filter: blur, transition: iconExit }}
        transition={reduced ? { duration: motionTokens.duration.instant } : iconSpring}
        aria-hidden="true"
      >
        <Icon size={15} strokeWidth={1.9} />
      </motion.span>
    </AnimatePresence>
  );
}

export function ThemeSwitch({ theme, variant = "reveal", onThemeChange, label, iconOnly = false }: ThemeSwitchProps) {
  const reduced = useReducedMotion() ?? false;
  const settled = useSettled();
  const next = theme === "light" ? "dark" : "light";
  const classes = [styles.themeSwitch, styles[variant], iconOnly ? styles.iconOnly : "", settled ? styles.settled : ""].join(" ");

  return (
    <Button
      type="button"
      size="sm"
      variant="secondary"
      className={classes}
      data-theme={theme}
      aria-label={label ?? `Switch to ${next} mode`}
      aria-pressed={theme === "dark"}
      onClick={event => onThemeChange(next, variant, event.currentTarget)}
    >
      <span className={styles.iconWrap}><ThemeIcon theme={theme} reduced={reduced} settled={settled} /></span>
      {!iconOnly && <span className={styles.label}>Switch theme</span>}
    </Button>
  );
}

export default ThemeSwitch;
