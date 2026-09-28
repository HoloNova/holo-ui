"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { AnimatePresence, animate, motion, useIsPresent, useMotionValue, useReducedMotion, type AnimationPlaybackControls, type HTMLMotionProps, type TargetAndTransition, type Transition, type Variants } from "motion/react";
import { Bell, Check, CheckCheck, CircleCheck, CircleDot, MessageCircle, TriangleAlert, X } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";

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
const ARC_NOTIFICATION_CENTER_STYLES = `.arc-notification-center-trigger { position: relative; display: grid; width: 42px; height: 42px; place-items: center; border: 1px solid var(--border); border-radius: 12px; background: var(--surface); color: var(--foreground); cursor: pointer; transition: border-color var(--duration-fast) var(--ease-standard), background var(--duration-fast) var(--ease-standard); }
.arc-notification-center-trigger[data-state="open"], .arc-notification-center-trigger:active { border-color: var(--border-strong); background: var(--surface-muted); }
@media (hover: hover) and (pointer: fine) { .arc-notification-center-trigger:hover { border-color: var(--border-strong); background: var(--surface-muted); } }
.arc-notification-center-trigger > span:first-child { display: grid; place-items: center; }
.arc-notification-center-badge { position: absolute; top: -6px; right: -6px; display: grid; min-width: 19px; height: 19px; padding: 0 4px; place-items: center; overflow: hidden; border: 2px solid var(--surface); border-radius: 999px; background: var(--foreground); color: var(--background); font-size: 10px; font-weight: 500; font-variant-numeric: tabular-nums; }
.arc-notification-center-panel { z-index: 90; display: flex; flex-direction: column; width: min(424px, calc(100vw - 24px)); max-height: min(590px, calc(100vh - 24px)); overflow: hidden; border: 1px solid var(--border); border-radius: 23px; background: var(--surface-raised); color: var(--foreground); box-shadow: var(--shadow-floating); font-family: var(--font-body); letter-spacing: var(--tracking-body); transform-origin: var(--radix-popover-content-transform-origin); }
/* The panel grows out of the bell: it starts a few pixels toward the trigger on whichever side Radix placed it, and leaves faster than it arrives. */
.arc-notification-center-panel { --panel-x: 0px; --panel-y: -6px; }
.arc-notification-center-panel[data-side="top"] { --panel-y: 6px; }
.arc-notification-center-panel[data-side="left"] { --panel-x: 6px; --panel-y: 0px; }
.arc-notification-center-panel[data-side="right"] { --panel-x: -6px; --panel-y: 0px; }
.arc-notification-center-panel[data-state="open"] { animation: panel-open var(--duration-standard) var(--ease-enter) both; }
.arc-notification-center-panel[data-state="closed"] { animation: panel-close var(--duration-instant) var(--ease-standard) both; }
.arc-notification-center-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 23px 24px 18px; }
.arc-notification-center-heading { display: flex; align-items: center; gap: 9px; }
.arc-notification-center-heading h2 { margin: 0; font-size: 20px; font-weight: 500; letter-spacing: -.025em; line-height: 1.2; }
.arc-notification-center-count { display: grid; min-width: 21px; height: 21px; padding: 0 5px; place-items: center; overflow: hidden; border-radius: 7px; background: var(--surface-muted); color: var(--text-secondary); font-size: 11px; font-variant-numeric: tabular-nums; }
.arc-notification-center-header p { position: relative; margin: 5px 0 0; color: var(--text-secondary); font-size: 12px; }
.arc-notification-center-close { display: grid; width: 30px; height: 30px; flex: none; place-items: center; border: 0; border-radius: 8px; background: transparent; color: var(--text-muted); cursor: pointer; transition: transform var(--duration-spring) var(--ease-spring), color var(--duration-fast) var(--ease-standard), background var(--duration-fast) var(--ease-standard); }
.arc-notification-center-close:active { transform: scale(.96); }
.arc-notification-center-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 52px; padding: 0 17px 13px 20px; border-bottom: 1px solid var(--border-subtle); }
.arc-notification-center-viewSwitch { display: inline-flex; align-items: center; gap: 3px; }
.arc-notification-center-viewSwitch button { position: relative; isolation: isolate; min-width: 61px; height: 31px; padding: 0 10px; border: 0; border-radius: 9px; background: transparent; color: var(--text-secondary); font: inherit; font-size: 12px; cursor: pointer; transition: color var(--duration-fast) var(--ease-standard); }
.arc-notification-center-viewSwitch .arc-notification-center-viewActive { color: var(--foreground); }
.arc-notification-center-viewSwitch button > span:last-child { position: relative; z-index: 1; }
.arc-notification-center-viewHighlight { position: absolute; z-index: -1; inset: 0; border-radius: 9px; background: var(--surface-muted); }
.arc-notification-center-markAll { display: inline-flex; align-items: center; gap: 6px; padding: 6px 0; border: 0; background: transparent; color: var(--text-secondary); font: inherit; font-size: 12px; white-space: nowrap; cursor: pointer; transition: transform var(--duration-spring) var(--ease-spring), color var(--duration-fast) var(--ease-standard); }
.arc-notification-center-markAll:active { transform: scale(.97); }
.arc-notification-center-list { min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 9px 11px 10px; scrollbar-width: none; }
.arc-notification-center-list::-webkit-scrollbar { display: none; }
.arc-notification-center-row { overflow: hidden; }
/* Rows settle in with a short cascade when the panel opens or a view adds them. */
.arc-notification-center-item { position: relative; padding: 10px 10px 9px; border-radius: 12px; transition: background var(--duration-fast) var(--ease-standard); animation: item-in var(--duration-standard) var(--ease-enter) calc(var(--index, 0) * 35ms) both; }
.arc-notification-center-itemExpanded { background: var(--surface-muted); }
.arc-notification-center-itemRead .arc-notification-center-itemTitle strong { color: var(--text-secondary); }
.arc-notification-center-itemMain { display: flex; align-items: flex-start; gap: 11px; min-width: 0; }
.arc-notification-center-eventIcon { display: grid; width: 24px; height: 36px; flex: none; place-items: center; color: var(--accent); }
.arc-notification-center-eventIcon.success { color: var(--success); }
.arc-notification-center-eventIcon.warning { color: var(--warning); }
.arc-notification-center-itemToggle { display: grid; min-width: 0; flex: 1; gap: 4px; padding: 2px 0 0; border: 0; background: transparent; color: var(--foreground); text-align: left; font: inherit; cursor: pointer; }
.arc-notification-center-itemTitle { display: flex; align-items: center; gap: 7px; min-width: 0; min-height: 18px; }
.arc-notification-center-itemTitle strong { overflow: hidden; font-size: 13px; font-weight: 500; line-height: 1.4; text-overflow: ellipsis; white-space: nowrap; }
.arc-notification-center-unreadDot { display: block; width: 6px; height: 6px; flex: none; border-radius: 50%; background: var(--foreground); }
.arc-notification-center-itemPreview { overflow: hidden; color: var(--text-secondary); font-size: 12px; line-height: 1.4; text-overflow: ellipsis; white-space: nowrap; }
.arc-notification-center-time { flex: none; padding-top: 3px; color: var(--text-muted); font-size: 11px; font-variant-numeric: tabular-nums; white-space: nowrap; }
.arc-notification-center-details { overflow: hidden; padding-left: 47px; }
.arc-notification-center-details p { margin: 11px 0 13px; color: var(--text-secondary); font-size: 12px; line-height: 1.55; }
.arc-notification-center-itemActions { display: flex; flex-wrap: wrap; gap: 6px; padding-bottom: 5px; }
.arc-notification-center-itemActions button { display: inline-flex; align-items: center; gap: 5px; min-height: 29px; padding: 4px 8px; overflow: clip; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--foreground); font: inherit; font-size: 11px; white-space: nowrap; cursor: pointer; transition: transform var(--duration-spring) var(--ease-spring), border-color var(--duration-fast) var(--ease-standard), background var(--duration-fast) var(--ease-standard); }
.arc-notification-center-itemActions button:active { transform: scale(.97); }
/* Quick press, spring release: the resting transition above carries the spring back. */
.arc-notification-center-close:active, .arc-notification-center-markAll:active, .arc-notification-center-itemActions button:active, .arc-notification-center-footer button:active { transition-duration: var(--duration-instant); transition-timing-function: var(--ease-standard); }
.arc-notification-center-morph { display: block; }
.arc-notification-center-morphContent { position: relative; display: inline-flex; width: max-content; align-items: center; gap: 5px; }
.arc-notification-center-actionIcon, .arc-notification-center-actionGlyph { position: relative; display: grid; place-items: center; }
.arc-notification-center-swap { position: relative; display: inline-block; max-width: 100%; vertical-align: top; }
.arc-notification-center-swapLine { display: block; }
.arc-notification-center-roll { position: relative; display: inline-grid; vertical-align: top; }
.arc-notification-center-rollValue { display: block; }
.arc-notification-center-emptyFrame { overflow: hidden; }
.arc-notification-center-empty { display: grid; justify-items: center; align-content: center; min-height: 190px; padding: 22px 12px; text-align: center; }
.arc-notification-center-empty > svg { margin-bottom: 13px; color: var(--text-muted); }
.arc-notification-center-empty strong { font-size: 14px; font-weight: 500; }
.arc-notification-center-empty p { margin: 4px 0 0; color: var(--text-secondary); font-size: 12px; }
.arc-notification-center-empty button { margin-top: 16px; padding: 0; border: 0; background: transparent; color: var(--foreground); font: inherit; font-size: 12px; text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }
.arc-notification-center-footerFrame { flex: none; overflow: hidden; }
.arc-notification-center-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 46px; padding: 8px 22px; border-top: 1px solid var(--border-subtle); color: var(--text-muted); font-size: 11px; }
.arc-notification-center-footer button { padding: 4px 0; border: 0; background: transparent; color: var(--text-secondary); font: inherit; font-size: 11px; cursor: pointer; transition: transform var(--duration-spring) var(--ease-spring), color var(--duration-fast) var(--ease-standard); }
.arc-notification-center-footer button:active { transform: scale(.97); }
@media (hover: hover) and (pointer: fine) {
  .arc-notification-center-close:hover, .arc-notification-center-item:hover { background: var(--surface-muted); }
  .arc-notification-center-close:hover, .arc-notification-center-viewSwitch button:hover, .arc-notification-center-markAll:hover, .arc-notification-center-footer button:hover { color: var(--foreground); }
  .arc-notification-center-itemActions button:hover { border-color: var(--border-strong); background: var(--surface); }
}
.arc-notification-center-trigger:focus-visible, .arc-notification-center-close:focus-visible, .arc-notification-center-viewSwitch button:focus-visible, .arc-notification-center-markAll:focus-visible, .arc-notification-center-itemToggle:focus-visible, .arc-notification-center-itemActions button:focus-visible, .arc-notification-center-empty button:focus-visible, .arc-notification-center-footer button:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
@keyframes panel-open { from { opacity: 0; transform: translate(var(--panel-x), var(--panel-y)) scale(.97); } }
@keyframes panel-close { to { opacity: 0; transform: translate(calc(var(--panel-x) / 2), calc(var(--panel-y) / 2)) scale(.98); } }
@keyframes item-in { from { opacity: 0; transform: translateY(4px); } }
@media (max-width: 380px) { .arc-notification-center-header { padding: 20px 16px 16px; } .arc-notification-center-heading h2 { font-size: 18px; } .arc-notification-center-toolbar { align-items: flex-start; padding: 0 12px 12px; } .arc-notification-center-list { padding: 8px 5px; } .arc-notification-center-item { padding-inline: 7px; } .arc-notification-center-itemMain { gap: 7px; } .arc-notification-center-time { padding-top: 4px; font-size: 10px; } .arc-notification-center-details { padding-left: 31px; } .arc-notification-center-itemActions { gap: 5px; } .arc-notification-center-itemActions button { padding-inline: 7px; } .arc-notification-center-markAll span { display: none; } .arc-notification-center-footer { padding-inline: 16px; } }
@media (prefers-reduced-motion: reduce) { .arc-notification-center-panel[data-state], .arc-notification-center-trigger, .arc-notification-center-close, .arc-notification-center-viewSwitch button, .arc-notification-center-markAll, .arc-notification-center-item, .arc-notification-center-itemActions button, .arc-notification-center-footer button { animation: none; transition-duration: 0ms; } .arc-notification-center-close:active, .arc-notification-center-markAll:active, .arc-notification-center-itemActions button:active, .arc-notification-center-footer button:active { transform: none; } }
`;

const styles: Record<string, string> = new Proxy({
  "actionGlyph": "arc-notification-center-actionGlyph",
  "actionIcon": "arc-notification-center-actionIcon",
  "badge": "arc-notification-center-badge",
  "close": "arc-notification-center-close",
  "count": "arc-notification-center-count",
  "details": "arc-notification-center-details",
  "empty": "arc-notification-center-empty",
  "emptyFrame": "arc-notification-center-emptyFrame",
  "eventIcon": "arc-notification-center-eventIcon",
  "footer": "arc-notification-center-footer",
  "footerFrame": "arc-notification-center-footerFrame",
  "header": "arc-notification-center-header",
  "heading": "arc-notification-center-heading",
  "item": "arc-notification-center-item",
  "itemActions": "arc-notification-center-itemActions",
  "itemExpanded": "arc-notification-center-itemExpanded",
  "itemMain": "arc-notification-center-itemMain",
  "itemPreview": "arc-notification-center-itemPreview",
  "itemRead": "arc-notification-center-itemRead",
  "itemTitle": "arc-notification-center-itemTitle",
  "itemToggle": "arc-notification-center-itemToggle",
  "list": "arc-notification-center-list",
  "markAll": "arc-notification-center-markAll",
  "morph": "arc-notification-center-morph",
  "morphContent": "arc-notification-center-morphContent",
  "panel": "arc-notification-center-panel",
  "roll": "arc-notification-center-roll",
  "rollValue": "arc-notification-center-rollValue",
  "row": "arc-notification-center-row",
  "success": "arc-notification-center-success",
  "swap": "arc-notification-center-swap",
  "swapLine": "arc-notification-center-swapLine",
  "time": "arc-notification-center-time",
  "toolbar": "arc-notification-center-toolbar",
  "trigger": "arc-notification-center-trigger",
  "unreadDot": "arc-notification-center-unreadDot",
  "viewActive": "arc-notification-center-viewActive",
  "viewHighlight": "arc-notification-center-viewHighlight",
  "viewSwitch": "arc-notification-center-viewSwitch",
  "warning": "arc-notification-center-warning"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-notification-center-${prop}`,
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



export interface NotificationItem {
  id: string;
  title: string;
  description?: string;
  time: string;
  read?: boolean;
  tone?: "info" | "success" | "warning";
  /** A local portrait asset for person-generated updates. */
  actor?: { name: string; photo: string };
}

export interface NotificationCenterProps {
  notifications: NotificationItem[];
  label?: string;
  onReadChange?: (notification: NotificationItem, read: boolean) => void;
  onDismiss?: (notification: NotificationItem) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  avoidCollisions?: boolean;
}

type View = "all" | "unread";

const enter: Transition = { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] };
const exitFast: Transition = { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] };
const instant: Transition = { duration: 0 };
const textIn: TargetAndTransition = { opacity: 0, y: "0.3em", filter: `blur(${motionTokens.blur.soft}px)` };
const textOut: TargetAndTransition = { opacity: 0, y: "-0.3em", filter: `blur(${motionTokens.blur.subtle}px)`, transition: exitFast };
const iconIn: TargetAndTransition = { opacity: 0, scale: .6, filter: `blur(${motionTokens.blur.subtle}px)` };
const shown: TargetAndTransition = { opacity: 1, y: "0em", scale: 1, filter: "blur(0px)" };
const fadeOut: TargetAndTransition = { opacity: 0, transition: { duration: motionTokens.duration.instant } };
/** Bulk actions cascade down the list, capped so the whole sweep stays under a quarter second. */
const cascade = (index: number) => Math.min(index * motionTokens.stagger.item, .2);

/** Outgoing copies are hidden from assistive tech while they fade, so live text reads only the current value. */
function Swap(props: HTMLMotionProps<"span">) {
  const present = useIsPresent();
  return <motion.span {...props} aria-hidden={present ? props["aria-hidden"] : true} />;
}

function SwapText({ children, reduce }: { children: string; reduce: boolean | null }) {
  return <span className={styles.swap}><AnimatePresence mode="popLayout" initial={false}><Swap key={children} className={styles.swapLine} initial={reduce ? { opacity: 0 } : textIn} animate={shown} exit={reduce ? fadeOut : textOut} transition={reduce ? instant : enter}>{children}</Swap></AnimatePresence></span>;
}

const rollVariants: Variants = {
  enter: (direction: number) => ({ opacity: 0, y: direction >= 0 ? "0.7em" : "-0.7em", filter: `blur(${motionTokens.blur.subtle}px)` }),
  center: { opacity: 1, y: "0em", filter: "blur(0px)" },
  exit: (direction: number) => ({ opacity: 0, y: direction >= 0 ? "-0.7em" : "0.7em", filter: `blur(${motionTokens.blur.subtle}px)`, transition: exitFast }),
};

/** Counts roll like an odometer: a higher number rises from below, a lower one drops from above. */
function RollingCount({ value, display = String(value), reduce }: { value: number; display?: string; reduce: boolean | null }) {
  const [previous, setPrevious] = useState(value);
  const [direction, setDirection] = useState(0);
  if (value !== previous) { setDirection(value > previous ? 1 : -1); setPrevious(value); }
  return <span className={styles.roll}><AnimatePresence mode="popLayout" initial={false} custom={direction}>
    <Swap key={display} className={styles.rollValue} custom={direction} variants={reduce ? undefined : rollVariants} initial={reduce ? { opacity: 0 } : "enter"} animate={reduce ? { opacity: 1 } : "center"} exit={reduce ? fadeOut : "exit"} transition={reduce ? instant : { y: motionTokens.spring.snappy, opacity: exitFast, filter: exitFast }}>{display}</Swap>
  </AnimatePresence></span>;
}

/** Follows the width of its content. After `morphKey` changes the width springs from the old size to the new one, then returns to auto, so a longer label grows the control instead of snapping it. */
function MorphWidth({ reduce, morphKey, children }: { reduce: boolean | null; morphKey: string; children: ReactNode }) {
  const frame = useRef<HTMLSpanElement>(null);
  const content = useRef<HTMLSpanElement>(null);
  const width = useMotionValue<number | "auto">("auto");
  const changedAt = useRef(0);
  useLayoutEffect(() => { changedAt.current = performance.now(); }, [morphKey]);
  useEffect(() => {
    const node = content.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    let last: number | undefined;
    let controls: AnimationPlaybackControls | undefined;
    const settle = () => { width.jump("auto"); if (frame.current) frame.current.style.width = "auto"; };
    const observer = new ResizeObserver(([entry]) => {
      const next = entry.borderBoxSize?.[0]?.inlineSize ?? node.offsetWidth;
      const current = width.get();
      const from = typeof current === "number" ? current : last;
      last = next;
      controls?.stop();
      if (reduce || from === undefined || from === next || performance.now() - changedAt.current > 120) return settle();
      // Pin the old width before this frame paints, then spring to the new one.
      if (frame.current) frame.current.style.width = `${from}px`;
      controls = animate(width, [from, next], { ...motionTokens.spring.morph, onComplete: settle });
    });
    observer.observe(node);
    return () => { observer.disconnect(); controls?.stop(); };
  }, [width, reduce]);
  return <motion.span ref={frame} className={styles.morph} style={{ width }}><span ref={content} className={styles.morphContent}>{children}</span></motion.span>;
}

function NotificationVisual({ item }: { item: NotificationItem }) {
  if (item.actor) return <Avatar name={item.actor.name} src={item.actor.photo} size="md" />;
  return <span className={[styles.eventIcon, styles[item.tone ?? "info"]].join(" ")} aria-hidden="true">
    {item.tone === "warning" ? <TriangleAlert size={18} strokeWidth={1.7} /> : item.tone === "success" ? <CircleCheck size={18} strokeWidth={1.7} /> : <MessageCircle size={18} strokeWidth={1.7} />}
  </span>;
}

export function NotificationCenter({ notifications: initial, label = "Notifications", onReadChange, onDismiss, open, onOpenChange, avoidCollisions = true }: NotificationCenterProps) {
  const reduce = useReducedMotion();
  const layoutId = useId();
  const [internalOpen, setInternalOpen] = useState(false);
  const [items, setItems] = useState(initial);
  const [view, setView] = useState<View>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [bulk, setBulk] = useState(false);
  const itemRefs = useRef(new Map<string, HTMLButtonElement>());
  const allTabRef = useRef<HTMLButtonElement>(null);
  const unreadTabRef = useRef<HTMLButtonElement>(null);
  const isOpen = open ?? internalOpen;
  const unreadCount = useMemo(() => items.filter((item) => !item.read).length, [items]);
  const readCount = items.length - unreadCount;
  const visible = view === "unread" ? items.filter((item) => !item.read) : items;
  const summary = unreadCount ? `${unreadCount} update${unreadCount === 1 ? "" : "s"} waiting for you` : "You’re all caught up";

  function setOpen(next: boolean) {
    if (open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  }

  function toggleRead(item: NotificationItem) {
    const next = !item.read;
    if (next && view === "unread") {
      const index = visible.findIndex((entry) => entry.id === item.id);
      const nextId = visible[index + 1]?.id ?? visible[index - 1]?.id;
      requestAnimationFrame(() => nextId ? itemRefs.current.get(nextId)?.focus() : unreadTabRef.current?.focus());
    }
    setBulk(false);
    setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, read: next } : entry));
    if (next && view === "unread") setExpandedId(null);
    onReadChange?.(item, next);
  }

  function markAllRead() {
    items.filter((item) => !item.read).forEach((item) => onReadChange?.(item, true));
    setBulk(true);
    setItems((current) => current.map((item) => ({ ...item, read: true })));
    setExpandedId(null);
    requestAnimationFrame(() => (view === "unread" ? unreadTabRef : allTabRef).current?.focus());
  }

  function dismiss(item: NotificationItem) {
    const index = visible.findIndex((entry) => entry.id === item.id);
    const nextId = visible[index + 1]?.id ?? visible[index - 1]?.id;
    requestAnimationFrame(() => nextId ? itemRefs.current.get(nextId)?.focus() : unreadTabRef.current?.focus());
    setBulk(false);
    setItems((current) => current.filter((entry) => entry.id !== item.id));
    if (expandedId === item.id) setExpandedId(null);
    onDismiss?.(item);
  }

  function clearRead() {
    items.filter((item) => item.read).forEach((item) => onDismiss?.(item));
    setBulk(true);
    setItems((current) => current.filter((item) => !item.read));
    requestAnimationFrame(() => allTabRef.current?.focus());
  }

  const height: Transition = reduce ? instant : { height: motionTokens.spring.smooth, opacity: enter };

  return <PopoverPrimitive.Root open={isOpen} onOpenChange={setOpen}>
    <PopoverPrimitive.Trigger asChild>
      {/* The trigger anchors the panel, so it gives press feedback with color only; scaling it would shift the panel. */}
      <button className={styles.trigger} type="button" aria-label={`${label}${unreadCount ? `, ${unreadCount} unread` : ""}`}>
        <motion.span animate={{ rotate: isOpen && !reduce ? -12 : 0 }} transition={reduce ? instant : motionTokens.spring.snappy}><Bell size={19} strokeWidth={1.75} aria-hidden="true" /></motion.span>
        <AnimatePresence initial={false}>{unreadCount > 0 && <motion.span key="badge" className={styles.badge} aria-hidden="true" initial={reduce ? { opacity: 0 } : { opacity: 0, scale: .6 }} animate={{ opacity: 1, scale: 1 }} exit={reduce ? fadeOut : { opacity: 0, scale: .6, transition: exitFast }} transition={reduce ? instant : motionTokens.spring.snappy}><RollingCount value={unreadCount} display={unreadCount > 9 ? "9+" : String(unreadCount)} reduce={reduce} /></motion.span>}</AnimatePresence>
      </button>
    </PopoverPrimitive.Trigger>
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content className={styles.panel} align="center" side="bottom" sideOffset={12} collisionPadding={12} avoidCollisions={avoidCollisions} aria-label={label}>
        <div className={styles.header}>
          <div><div className={styles.heading}><h2>{label}</h2><span className={styles.count}><RollingCount value={unreadCount} reduce={reduce} /></span></div><p aria-live="polite"><SwapText reduce={reduce}>{summary}</SwapText></p></div>
          <PopoverPrimitive.Close className={styles.close} aria-label="Close notifications"><X size={17} strokeWidth={1.75} aria-hidden="true" /></PopoverPrimitive.Close>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.viewSwitch} role="group" aria-label="Show notifications">
            {(["all", "unread"] as const).map((next) => <button key={next} ref={next === "unread" ? unreadTabRef : allTabRef} type="button" className={view === next ? styles.viewActive : undefined} aria-pressed={view === next} onClick={() => { setBulk(false); setView(next); setExpandedId(null); }}>{view === next && <motion.span className={styles.viewHighlight} layoutId={`${layoutId}-view`} transition={reduce ? instant : motionTokens.spring.morph} />}<span>{next === "all" ? "All" : "Unread"}</span></button>)}
          </div>
          <AnimatePresence initial={false}>{unreadCount > 0 && <motion.button key="mark-all" type="button" className={styles.markAll} onClick={markAllRead} initial={reduce ? { opacity: 0 } : { opacity: 0, filter: `blur(${motionTokens.blur.subtle}px)` }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={reduce ? fadeOut : { opacity: 0, filter: `blur(${motionTokens.blur.subtle}px)`, transition: exitFast }} transition={reduce ? instant : enter}><CheckCheck size={15} strokeWidth={1.75} aria-hidden="true" /><span>Mark all read</span></motion.button>}</AnimatePresence>
        </div>

        {/* Rows collapse their own height on the way out, so the list and the panel close the gap together. */}
        <div className={styles.list} role="list" aria-label={view === "all" ? "All notifications" : "Unread notifications"}>
          <AnimatePresence initial={false} custom={bulk}>
            {visible.map((item, index) => <motion.div key={item.id} role="listitem" className={styles.row} custom={bulk}
              variants={{ exit: (isBulk: boolean) => reduce ? fadeOut : { height: 0, opacity: 0, transition: { height: { ...motionTokens.spring.smooth, delay: isBulk ? cascade(index) : 0 }, opacity: { ...exitFast, delay: isBulk ? cascade(index) : 0 } } } }}
              initial={reduce ? { opacity: 0 } : { height: 0 }} animate={{ height: "auto", opacity: 1 }} exit="exit" transition={height}>
              <article className={[styles.item, item.read ? styles.itemRead : "", expandedId === item.id ? styles.itemExpanded : ""].filter(Boolean).join(" ")} style={{ "--index": Math.min(index, 7) } as CSSProperties}>
                <div className={styles.itemMain}>
                  <NotificationVisual item={item} />
                  <button ref={(node) => { if (node) itemRefs.current.set(item.id, node); else itemRefs.current.delete(item.id); }} type="button" className={styles.itemToggle} aria-expanded={expandedId === item.id} aria-label={`${item.title}${item.read ? "" : ", unread"}. ${expandedId === item.id ? "Hide details" : "Show details"}`} onClick={() => setExpandedId((current) => current === item.id ? null : item.id)}>
                    <span className={styles.itemTitle}><strong>{item.title}</strong>
                      <AnimatePresence initial={false} custom={bulk}>{!item.read && <motion.span key="dot" className={styles.unreadDot} aria-hidden="true" custom={bulk}
                        variants={{ exit: (isBulk: boolean) => reduce ? fadeOut : { opacity: 0, scale: .3, transition: { ...exitFast, delay: isBulk ? cascade(index) : 0 } } }}
                        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: .3 }} animate={{ opacity: 1, scale: 1 }} exit="exit" transition={reduce ? instant : motionTokens.spring.snappy} />}</AnimatePresence>
                    </span>
                    <span className={styles.itemPreview}>{item.description ?? (item.actor ? `From ${item.actor.name}` : "View update details")}</span>
                  </button>
                  <time className={styles.time}>{item.time}</time>
                </div>
                <AnimatePresence initial={false}>
                  {expandedId === item.id && <motion.div className={styles.details} initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={reduce ? fadeOut : { height: 0, opacity: 0, transition: { height: motionTokens.spring.smooth, opacity: exitFast } }} transition={height}>
                    <p>{item.description ?? (item.actor ? `${item.actor.name} shared an update with you.` : "This update is ready to review.")}</p>
                    <div className={styles.itemActions}>
                      <button type="button" onClick={() => toggleRead(item)}><MorphWidth reduce={reduce} morphKey={item.read ? "read" : "unread"}>
                        <span className={styles.actionIcon}><AnimatePresence mode="popLayout" initial={false}><Swap key={item.read ? "unread" : "read"} className={styles.actionGlyph} initial={reduce ? { opacity: 0 } : iconIn} animate={shown} exit={reduce ? fadeOut : { ...iconIn, transition: exitFast }} transition={reduce ? instant : motionTokens.spring.snappy}>{item.read ? <CircleDot size={14} strokeWidth={1.75} aria-hidden="true" /> : <Check size={14} strokeWidth={1.75} aria-hidden="true" />}</Swap></AnimatePresence></span>
                        <SwapText reduce={reduce}>{item.read ? "Mark unread" : "Mark read"}</SwapText>
                      </MorphWidth></button>
                      <button type="button" onClick={() => dismiss(item)}><X size={14} strokeWidth={1.75} aria-hidden="true" />Dismiss</button>
                    </div>
                  </motion.div>}
                </AnimatePresence>
              </article>
            </motion.div>)}
            {/* The empty state opens its height on the same spring the rows close on, so the panel morphs between them instead of stacking both. */}
            {visible.length === 0 && <motion.div key="empty" className={styles.emptyFrame} initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={reduce ? fadeOut : { height: 0, opacity: 0, transition: { height: motionTokens.spring.smooth, opacity: exitFast } }} transition={reduce ? instant : { height: motionTokens.spring.smooth, opacity: { ...enter, delay: motionTokens.duration.fast } }}>
              <motion.div className={styles.empty} initial={reduce ? false : { y: 6 }} animate={{ y: 0 }} transition={reduce ? instant : { ...enter, delay: motionTokens.duration.fast }}><CircleCheck size={24} strokeWidth={1.5} aria-hidden="true" /><strong><SwapText reduce={reduce}>{view === "unread" ? "Nothing unread" : "All clear"}</SwapText></strong><p><SwapText reduce={reduce}>{view === "unread" ? "You’ve seen every update." : "New updates will appear here."}</SwapText></p>{view === "unread" && items.length > 0 && <button type="button" onClick={() => { setBulk(false); setView("all"); }}>View all updates</button>}</motion.div>
            </motion.div>}
          </AnimatePresence>
        </div>

        <AnimatePresence initial={false}>{readCount > 0 && <motion.div key="footer" className={styles.footerFrame} initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={reduce ? fadeOut : { height: 0, opacity: 0, transition: { height: motionTokens.spring.smooth, opacity: exitFast } }} transition={height}>
          <div className={styles.footer}><span><RollingCount value={readCount} reduce={reduce} /> read</span><button type="button" onClick={clearRead}>Clear read</button></div>
        </motion.div>}</AnimatePresence>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  </PopoverPrimitive.Root>;
}

export default NotificationCenter;
