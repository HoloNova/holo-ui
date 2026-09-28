"use client";

import Image from "next/image";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, ReactNode, RefObject } from "react";
import type { Transition, Variants } from "motion/react";
import { AnimatePresence, LayoutGroup, motion, useIsPresent, useReducedMotion } from "motion/react";
import { ArrowRight, BookOpen, Boxes, ChevronDown, History, LayoutTemplate, Menu, MessagesSquare, Palette, PanelsTopLeft, Route, X } from "lucide-react";
import { forwardRef, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";

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
const ARC_SITE_HEADER_STYLES = `/* The header is its own size container, so the layout folds by the space it has rather than the viewport. */
.arc-site-header-header { position: relative; z-index: 20; container: site-header / inline-size; border-bottom: 1px solid transparent; background: transparent; color: var(--foreground); font-family: var(--font-body); letter-spacing: var(--tracking-body); transition: background-color var(--duration-standard) var(--ease-standard), border-color var(--duration-standard) var(--ease-standard), box-shadow var(--duration-standard) var(--ease-standard); }
.arc-site-header-sticky { position: sticky; top: 0; }
.arc-site-header-header[data-scrolled] { border-bottom-color: var(--border); background: var(--background); box-shadow: var(--shadow-resting); }

.arc-site-header-inner { position: relative; max-width: 1200px; margin: 0 auto; padding: 0 var(--space-6); }
.arc-site-header-bar { display: flex; height: 64px; align-items: center; gap: var(--space-2); }
.arc-site-header-header[data-variant="centered"] .arc-site-header-bar { display: grid; grid-template-columns: 1fr auto 1fr; }
.arc-site-header-brandSlot { display: flex; min-width: 0; }
.arc-site-header-brand { display: inline-flex; align-items: center; gap: var(--space-2); border: 0; border-radius: 12px; padding: var(--space-2) var(--space-2) var(--space-2) 0; background: none; color: var(--foreground); font: inherit; font-size: var(--text-base); font-weight: 500; text-decoration: none; cursor: pointer; }
.arc-site-header-brandMark { width: 22px; height: 22px; flex: none; }

.arc-site-header-nav { min-width: 0; margin-left: var(--space-4); }
.arc-site-header-header[data-variant="centered"] .arc-site-header-nav { margin: 0; }
.arc-site-header-navList { display: flex; align-items: center; gap: 2px; margin: 0; padding: 0; list-style: none; }
.arc-site-header-header[data-variant="centered"] .arc-site-header-navList { padding: 3px; border: 1px solid var(--border); border-radius: var(--radius-pill); background: var(--surface-muted); }
.arc-site-header-navCell { display: flex; }
.arc-site-header-navItem { position: relative; isolation: isolate; display: inline-flex; height: 36px; align-items: center; gap: 4px; border: 0; border-radius: 12px; padding: 0 var(--space-3); background: none; color: var(--text-secondary); font: inherit; font-size: var(--text-sm); font-weight: 500; text-decoration: none; white-space: nowrap; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: color var(--duration-fast) var(--ease-standard); }
.arc-site-header-header[data-variant="centered"] .arc-site-header-navItem { height: 32px; border-radius: var(--radius-pill); padding: 0 14px; }
.arc-site-header-navItem:is([data-current], [data-open]) { color: var(--foreground); }
@media (hover: hover) and (pointer: fine) { .arc-site-header-navItem:hover { color: var(--foreground); } }
.arc-site-header-navLabel { position: relative; }
.arc-site-header-chevron { color: var(--text-muted); transition: transform var(--duration-standard) var(--ease-standard); }
.arc-site-header-navItem[data-open] .arc-site-header-chevron { transform: rotate(180deg); }
.arc-site-header-hover { position: absolute; z-index: -1; inset: 0; border-radius: inherit; background: var(--surface-muted); }
.arc-site-header-indicator { position: absolute; right: var(--space-3); bottom: 4px; left: var(--space-3); height: 2px; border-radius: 2px; background: var(--accent); }
.arc-site-header-navItem:has(.arc-site-header-chevron) .arc-site-header-indicator { right: calc(var(--space-3) + 18px); }
.arc-site-header-header[data-variant="centered"] .arc-site-header-indicator { z-index: -1; inset: 0; height: auto; border: 1px solid var(--border); border-radius: inherit; background: var(--surface); box-shadow: var(--shadow-resting); }

.arc-site-header-actions { display: flex; align-items: center; gap: var(--space-2); margin-left: auto; }
.arc-site-header-header[data-variant="centered"] .arc-site-header-actions { justify-self: end; }
.arc-site-header-action { display: inline-flex; height: 36px; align-items: center; justify-content: center; border: 1px solid transparent; border-radius: var(--radius-control); padding: 0 14px; font: inherit; font-size: var(--text-sm); font-weight: 500; text-decoration: none; white-space: nowrap; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: transform var(--duration-fast) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard), opacity var(--duration-fast) var(--ease-standard); }
.arc-site-header-action:active { transform: scale(.97); }
.arc-site-header-secondary { background: none; color: var(--text-secondary); }
.arc-site-header-primary { background: var(--foreground); color: var(--background); }
@media (hover: hover) and (pointer: fine) {
  .arc-site-header-secondary:hover { background: var(--surface-muted); color: var(--foreground); }
  .arc-site-header-primary:hover { opacity: .9; }
}
.arc-site-header-menuButton { position: relative; display: none; width: 40px; height: 40px; place-items: center; border: 0; border-radius: 12px; background: none; color: var(--foreground); cursor: pointer; -webkit-tap-highlight-color: transparent; transition: background-color var(--duration-fast) var(--ease-standard); }
.arc-site-header-menuButton:active { background: var(--surface-muted); }
.arc-site-header-menuIcon { display: grid; place-items: center; }

/* Mega menu panel: one surface whose height springs to each section's content. */
.arc-site-header-panel { position: absolute; top: calc(100% - 4px); right: var(--space-6); left: var(--space-6); overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius-panel); background: var(--surface-raised); box-shadow: var(--shadow-floating); transform-origin: 50% 0; }
.arc-site-header-face { position: relative; padding: var(--space-3); }
.arc-site-header-face[data-leaving] { position: absolute; top: 0; right: 0; left: 0; pointer-events: none; }
.arc-site-header-faceGrid { display: grid; gap: var(--space-2); }
.arc-site-header-faceGrid[data-featured] { grid-template-columns: minmax(0, 1fr) minmax(200px, 260px); }
.arc-site-header-panelLinks { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2px; margin: 0; padding: 0; list-style: none; }
.arc-site-header-panelLink { display: flex; width: 100%; height: 100%; align-items: flex-start; gap: var(--space-3); border: 0; border-radius: 16px; padding: var(--space-3); background: none; color: var(--foreground); font: inherit; text-align: left; text-decoration: none; cursor: pointer; transition: background-color var(--duration-fast) var(--ease-standard); }
.arc-site-header-panelLink:focus-visible, .arc-site-header-feature:focus-visible { background: var(--surface-muted); }
.arc-site-header-panelIcon { display: flex; flex: none; margin-top: 1px; color: var(--text-secondary); }
.arc-site-header-panelText { display: grid; gap: 2px; min-width: 0; }
.arc-site-header-panelText > span:first-child { font-size: var(--text-sm); font-weight: 500; }
.arc-site-header-panelText > span:last-child:not(:first-child) { color: var(--text-muted); font-size: var(--text-sm); }
.arc-site-header-feature { display: grid; align-content: start; gap: 6px; border: 0; border-radius: 18px; padding: var(--space-2) var(--space-2) var(--space-3); background: var(--surface-muted); color: var(--foreground); font: inherit; text-align: left; text-decoration: none; cursor: pointer; }
.arc-site-header-featureImage { position: relative; display: block; overflow: hidden; aspect-ratio: 16 / 10; margin-bottom: 4px; border-radius: 12px; background: var(--border); }
.arc-site-header-featureImage img { object-fit: cover; transition: transform var(--duration-considered) var(--ease-standard); }
.arc-site-header-featureTitle { display: inline-flex; align-items: center; gap: 6px; padding: 0 var(--space-1); font-size: var(--text-sm); font-weight: 500; }
.arc-site-header-featureTitle svg { color: var(--text-muted); transition: transform var(--duration-fast) var(--ease-standard); }
.arc-site-header-featureText { padding: 0 var(--space-1); color: var(--text-muted); font-size: var(--text-sm); }
@media (hover: hover) and (pointer: fine) {
  .arc-site-header-panelLink:hover { background: var(--surface-muted); }
  .arc-site-header-feature:hover .arc-site-header-featureImage img { transform: scale(1.03); }
  .arc-site-header-feature:hover .arc-site-header-featureTitle svg { transform: translateX(2px); }
}

/* Mobile sheet: drops from the bar and pushes nothing; the scrim closes it. */
.arc-site-header-scrim { position: absolute; top: 100%; right: 0; left: 0; height: 100dvh; background: oklch(0% 0 0 / .16); }
.arc-site-header-sheet { position: absolute; top: 100%; right: 0; left: 0; overflow: hidden; border-bottom: 1px solid var(--border); background: var(--background); }
.arc-site-header-sheetInner { max-height: calc(100dvh - 65px); overflow-y: auto; overscroll-behavior: contain; padding: var(--space-2) var(--space-4) var(--space-5); }
.arc-site-header-sheetList { margin: 0; padding: 0; list-style: none; }
.arc-site-header-sheetItem { border-bottom: 1px solid var(--border-subtle); }
.arc-site-header-sheetRow { display: flex; width: 100%; min-height: 52px; align-items: center; justify-content: space-between; gap: var(--space-3); border: 0; padding: 0 var(--space-1); background: none; color: var(--foreground); font: inherit; font-size: var(--text-base); font-weight: 500; text-align: left; text-decoration: none; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.arc-site-header-sheetChevron { color: var(--text-muted); transition: transform var(--duration-standard) var(--ease-standard); }
.arc-site-header-sheetRow[aria-expanded="true"] .arc-site-header-sheetChevron { transform: rotate(180deg); }
.arc-site-header-sheetDot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }
.arc-site-header-sheetGroup { overflow: hidden; }
.arc-site-header-sheetGroup ul { display: grid; margin: 0; padding: 0 0 var(--space-3); list-style: none; }
.arc-site-header-sheetLink { display: flex; width: 100%; min-height: 44px; align-items: center; gap: var(--space-3); border: 0; border-radius: 12px; padding: 0 var(--space-2); background: none; color: var(--text-secondary); font: inherit; font-size: var(--text-sm); text-align: left; text-decoration: none; cursor: pointer; }
.arc-site-header-sheetLink:active { background: var(--surface-muted); color: var(--foreground); }
.arc-site-header-sheetActions { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); margin-top: var(--space-5); }
.arc-site-header-sheetActions .arc-site-header-action { height: var(--control-height-md); }
.arc-site-header-sheetActions .arc-site-header-secondary { border-color: var(--border); }

@container site-header (max-width: 759px) {
  .arc-site-header-inner { padding: 0 var(--space-4); }
  .arc-site-header-nav, .arc-site-header-wideOnly, .arc-site-header-panel { display: none; }
  .arc-site-header-menuButton { display: grid; }
  .arc-site-header-header[data-variant="centered"] .arc-site-header-bar { display: flex; }
}
@container site-header (min-width: 760px) {
  .arc-site-header-sheet, .arc-site-header-scrim { display: none; }
}

/* Preview frame: a small page that scrolls under the header. */
.arc-site-header-preview { display: grid; width: 100%; justify-items: center; gap: var(--space-4); }
.arc-site-header-frame { position: relative; width: 100%; height: 520px; overflow-y: auto; overscroll-behavior: contain; border: 1px solid var(--border); border-radius: 20px; background: var(--background); container-type: inline-size; }
.arc-site-header-page { margin-top: -65px; }
.arc-site-header-pageHero { display: grid; justify-items: center; gap: var(--space-3); padding: 128px var(--space-6) 72px; background: var(--arc-gradient-soft, var(--surface-muted)); text-align: center; }
.arc-site-header-pageHero h2 { margin: 0; font-family: var(--font-display); font-size: var(--text-3xl); font-weight: 500; letter-spacing: var(--tracking-display); line-height: var(--leading-display); }
.arc-site-header-pageHero p { max-width: 420px; margin: 0; color: var(--text-secondary); font-size: var(--text-sm); line-height: var(--leading-body); }
.arc-site-header-pageRows { display: grid; gap: var(--space-3); padding: var(--space-6); }
.arc-site-header-pageRow { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-3); }
.arc-site-header-pageRow span { height: 120px; border-radius: 16px; background: var(--surface-muted); }
@container (max-width: 520px) { .arc-site-header-pageRow { grid-template-columns: 1fr; } .arc-site-header-pageRow span:not(:first-child) { display: none; } .arc-site-header-pageHero { padding: 112px var(--space-4) 56px; } }

@media (prefers-reduced-motion: reduce) {
  .arc-site-header-header, .arc-site-header-navItem, .arc-site-header-chevron, .arc-site-header-action, .arc-site-header-panelLink, .arc-site-header-featureImage img, .arc-site-header-featureTitle svg, .arc-site-header-sheetChevron { transition: none; }
  .arc-site-header-action:active { transform: none; }
}

.arc-site-header-srOnly { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
`;

const styles: Record<string, string> = new Proxy({
  "action": "arc-site-header-action",
  "actions": "arc-site-header-actions",
  "bar": "arc-site-header-bar",
  "brand": "arc-site-header-brand",
  "brandMark": "arc-site-header-brandMark",
  "brandSlot": "arc-site-header-brandSlot",
  "chevron": "arc-site-header-chevron",
  "face": "arc-site-header-face",
  "faceGrid": "arc-site-header-faceGrid",
  "feature": "arc-site-header-feature",
  "featureImage": "arc-site-header-featureImage",
  "featureText": "arc-site-header-featureText",
  "featureTitle": "arc-site-header-featureTitle",
  "frame": "arc-site-header-frame",
  "header": "arc-site-header-header",
  "hover": "arc-site-header-hover",
  "indicator": "arc-site-header-indicator",
  "inner": "arc-site-header-inner",
  "menuButton": "arc-site-header-menuButton",
  "menuIcon": "arc-site-header-menuIcon",
  "nav": "arc-site-header-nav",
  "navCell": "arc-site-header-navCell",
  "navItem": "arc-site-header-navItem",
  "navLabel": "arc-site-header-navLabel",
  "navList": "arc-site-header-navList",
  "page": "arc-site-header-page",
  "pageHero": "arc-site-header-pageHero",
  "pageRow": "arc-site-header-pageRow",
  "pageRows": "arc-site-header-pageRows",
  "panel": "arc-site-header-panel",
  "panelIcon": "arc-site-header-panelIcon",
  "panelLink": "arc-site-header-panelLink",
  "panelLinks": "arc-site-header-panelLinks",
  "panelText": "arc-site-header-panelText",
  "preview": "arc-site-header-preview",
  "primary": "arc-site-header-primary",
  "scrim": "arc-site-header-scrim",
  "secondary": "arc-site-header-secondary",
  "sheet": "arc-site-header-sheet",
  "sheetActions": "arc-site-header-sheetActions",
  "sheetChevron": "arc-site-header-sheetChevron",
  "sheetDot": "arc-site-header-sheetDot",
  "sheetGroup": "arc-site-header-sheetGroup",
  "sheetInner": "arc-site-header-sheetInner",
  "sheetItem": "arc-site-header-sheetItem",
  "sheetLink": "arc-site-header-sheetLink",
  "sheetList": "arc-site-header-sheetList",
  "sheetRow": "arc-site-header-sheetRow",
  "srOnly": "arc-site-header-srOnly",
  "sticky": "arc-site-header-sticky",
  "wideOnly": "arc-site-header-wideOnly"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-site-header-${prop}`,
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


// ── Helper: media.ts ──
/**
 * Shared demo media. Files live in `public/media/`, credits in `public/media/CREDITS.md`.
 * Portraits are 400 px squares; photos are 1600 px on the long side.
 */

export interface MediaPerson {
  id: string;
  name: string;
  role?: string;
  src: string;
}

export interface MediaPhoto {
  id: string;
  alt: string;
  src: string;
  width: number;
  height: number;
}

export const people = [
  { id: "emma-collins", name: "Emma Collins", role: "Product designer", src: "/media/people/emma-collins.jpg" },
  { id: "marcus-johnson", name: "Marcus Johnson", role: "Frontend engineer", src: "/media/people/marcus-johnson.jpg" },
  { id: "jasmine-brooks", name: "Jasmine Brooks", role: "Design lead", src: "/media/people/jasmine-brooks.jpg" },
  { id: "olivia-bennett", name: "Olivia Bennett", role: "Platform engineer", src: "/media/people/olivia-bennett.jpg" },
  { id: "sofia-ramirez", name: "Sofia Ramirez", role: "Operations lead", src: "/media/people/sofia-ramirez.jpg" },
  { id: "ryan-sullivan", name: "Ryan Sullivan", role: "Account executive", src: "/media/people/ryan-sullivan.jpg" },
  { id: "hannah-walsh", name: "Hannah Walsh", role: "Customer success", src: "/media/people/hannah-walsh.jpg" },
  { id: "chloe-nguyen", name: "Chloe Nguyen", role: "Data analyst", src: "/media/people/chloe-nguyen.jpg" },
  { id: "ava-mitchell", name: "Ava Mitchell", role: "Marketing manager", src: "/media/people/ava-mitchell.jpg" },
  { id: "daniel-kim", name: "Daniel Kim", role: "Backend engineer", src: "/media/people/daniel-kim.jpg" },
  { id: "jordan-reyes", name: "Jordan Reyes", role: "Support specialist", src: "/media/people/jordan-reyes.jpg" },
  { id: "mateo-alvarez", name: "Mateo Alvarez", role: "Mobile engineer", src: "/media/people/mateo-alvarez.jpg" },
  { id: "tyler-hayes", name: "Tyler Hayes", role: "Sales lead", src: "/media/people/tyler-hayes.jpg" },
  { id: "andre-williams", name: "Andre Williams", role: "Finance partner", src: "/media/people/andre-williams.jpg" },
  { id: "nathan-cole", name: "Nathan Cole", role: "Engineering manager", src: "/media/people/nathan-cole.jpg" },
  { id: "diane-foster", name: "Diane Foster", role: "Chief operating officer", src: "/media/people/diane-foster.jpg" },
] as const satisfies readonly MediaPerson[];

export const photos = [
  { id: "lounge-chair", alt: "A woven oak lounge chair with a sheepskin and linen cushion on a concrete floor", src: "/media/photos/lounge-chair.jpg", width: 1280, height: 1600 },
  { id: "table-lamp", alt: "A white mushroom table lamp glowing beside books and a small vase", src: "/media/photos/table-lamp.jpg", width: 1600, height: 900 },
  { id: "linen-throw", alt: "Folded natural linen throws with fringed edges in soft window light", src: "/media/photos/linen-throw.jpg", width: 1067, height: 1600 },
  { id: "glass-carafe", alt: "A hand pouring water from a ribbed glass carafe into tumblers", src: "/media/photos/glass-carafe.jpg", width: 1280, height: 1600 },
  { id: "stoneware-cups", alt: "Two speckled stoneware cups with a lid on a pale table", src: "/media/photos/stoneware-cups.jpg", width: 1067, height: 1600 },
  { id: "stacked-bowls", alt: "Two stacked speckled ceramic bowls against a dark wall", src: "/media/photos/stacked-bowls.jpg", width: 1600, height: 1067 },
  { id: "ceramic-lamp", alt: "A sculptural ceramic lamp with a linen shade on a walnut sideboard", src: "/media/photos/ceramic-lamp.jpg", width: 1067, height: 1600 },
  { id: "living-room", alt: "A bright living room with timber beams, arched windows, and cream sofas", src: "/media/photos/living-room.jpg", width: 1200, height: 1600 },
  { id: "sunroom", alt: "A sunroom with a round dining table, plants, and windows on three sides", src: "/media/photos/sunroom.jpg", width: 1600, height: 1067 },
  { id: "home-office", alt: "A home office with a wooden desk and deep green walls", src: "/media/photos/home-office.jpg", width: 1600, height: 1200 },
  { id: "reading-chair", alt: "A grey armchair and ottoman with a knit throw in a dark green room", src: "/media/photos/reading-chair.jpg", width: 1600, height: 900 },
  { id: "bedroom", alt: "A made bed with striped linen pillows against an oak headboard", src: "/media/photos/bedroom.jpg", width: 1067, height: 1600 },
  { id: "restaurant", alt: "A warm restaurant dining room with woven pendant lights and a tree", src: "/media/photos/restaurant.jpg", width: 1067, height: 1600 },
  { id: "wine-bar", alt: "A glass carafe of red wine on a bar table in low evening light", src: "/media/photos/wine-bar.jpg", width: 1600, height: 1067 },
  { id: "concert-hall", alt: "Curved stainless steel panels of the Walt Disney Concert Hall against a blue sky", src: "/media/photos/concert-hall.jpg", width: 1600, height: 1143 },
  { id: "curved-facade", alt: "A white tiled building facade with curved balconies", src: "/media/photos/curved-facade.jpg", width: 1600, height: 1067 },
  { id: "pool-house", alt: "A modern glass house beside a long pool under a clear sky", src: "/media/photos/pool-house.jpg", width: 1600, height: 900 },
  { id: "terracotta-waves", alt: "Wavy terracotta walls rising toward a blue sky", src: "/media/photos/terracotta-waves.jpg", width: 1067, height: 1600 },
  { id: "mountain-ridges", alt: "Layered mountain ridges under a warm evening sky", src: "/media/photos/mountain-ridges.jpg", width: 1600, height: 1068 },
  { id: "alpine-lake", alt: "A calm alpine lake reflecting a rocky peak at golden hour", src: "/media/photos/alpine-lake.jpg", width: 1067, height: 1600 },
  { id: "coastline", alt: "A long coastline with waves rolling onto a beach below green cliffs", src: "/media/photos/coastline.jpg", width: 1200, height: 1600 },
  { id: "sea-at-dusk", alt: "A calm sea at dusk with a low island on the horizon", src: "/media/photos/sea-at-dusk.jpg", width: 1067, height: 1600 },
  { id: "lisbon-tram", alt: "A yellow tram on a street lined with historic buildings in Lisbon", src: "/media/photos/lisbon-tram.jpg", width: 1600, height: 1064 },
  { id: "lisbon-bridge", alt: "The 25 de Abril Bridge crossing the Tagus in Lisbon", src: "/media/photos/lisbon-bridge.jpg", width: 1600, height: 1166 },
  { id: "lisbon-rooftops", alt: "Terracotta rooftops of Lisbon running down to the river", src: "/media/photos/lisbon-rooftops.jpg", width: 1280, height: 1600 },
  { id: "salmon-dinner", alt: "Seared salmon with a bright herb salsa and a glass of red wine", src: "/media/photos/salmon-dinner.jpg", width: 1067, height: 1600 },
  { id: "chef-plating", alt: "A chef spooning sauce onto a plated dish in a dark kitchen", src: "/media/photos/chef-plating.jpg", width: 1600, height: 1600 },
] as const satisfies readonly MediaPhoto[];

export type PersonId = (typeof people)[number]["id"];
export type PhotoId = (typeof photos)[number]["id"];

/** Looks up a person by id. */
export function person(id: PersonId): MediaPerson {
  return people.find(entry => entry.id === id)!;
}

/** Looks up a photo by id. */
export function photo(id: PhotoId): MediaPhoto {
  return photos.find(entry => entry.id === id)!;
}

/** Square 400 px avatar path for a person id, for `src` props. */
export const avatar = (id: PersonId) => person(id).src;

/** 800 × 1000 portrait crop of the same photo, for image-led layouts. */
export const portrait = (id: PersonId) => `/media/people/portrait/${id}.jpg`;

/** The first `count` people, for avatar stacks and lists. */
export const peopleSample = (count: number) => people.slice(0, count);



export type SiteHeaderVariant = "simple" | "centered" | "mega";

/** One destination inside a mega menu panel. */
export interface SiteHeaderLink {
  label: string;
  /** One short line under the label. */
  description?: string;
  /** A plain decorative icon beside the label. */
  icon?: ReactNode;
  href?: string;
}

/** A card beside the links in a mega menu panel. */
export interface SiteHeaderFeature {
  title: string;
  description?: string;
  href?: string;
  image?: { src: string; alt: string };
}

/** A top level destination. With `links` and the mega variant it opens a panel; otherwise it is a plain link. */
export interface SiteHeaderItem {
  /** Stable value, also used for `current`. */
  value: string;
  label: string;
  href?: string;
  links?: SiteHeaderLink[];
  feature?: SiteHeaderFeature;
}

export interface SiteHeaderAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

/** What `onNavigate` receives. */
export interface SiteHeaderDestination {
  label: string;
  href?: string;
  /** The top level item the destination belongs to. */
  section?: string;
}

export interface SiteHeaderProps {
  /** `simple` puts links beside the brand, `centered` centers them in a quiet capsule, `mega` opens panels for items with links. */
  variant?: SiteHeaderVariant;
  brand?: { name: string; href?: string; mark?: ReactNode };
  items?: SiteHeaderItem[];
  /** Value of the item that holds the current page (controlled). */
  current?: string;
  /** Initial current item when uncontrolled. */
  defaultCurrent?: string;
  /** Called when a destination inside an item is chosen, with that item's value. */
  onCurrentChange?: (value: string) => void;
  /** Called for every destination: items, panel links, the brand, and actions with an href. */
  onNavigate?: (destination: SiteHeaderDestination) => void;
  /** A quiet action before the primary one, such as Sign in. Pass null to hide it. */
  secondaryAction?: SiteHeaderAction | null;
  /** The one primary action at the end of the bar. Pass null to hide it. */
  primaryAction?: SiteHeaderAction | null;
  /** Sticks to the top of its scroll container. Defaults to true. */
  sticky?: boolean;
  /** The element that scrolls, when it is not the window. The header turns solid once it scrolls. */
  scrollContainer?: RefObject<HTMLElement | null>;
  /** Pixels of scroll before the background turns solid. Defaults to 8. */
  scrollThreshold?: number;
  /** Accessible name of the navigation landmark. */
  label?: string;
  className?: string;
}

type Bezier = [number, number, number, number];
const enter = [...motionTokens.ease.enter] as Bezier;
const standard = [...motionTokens.ease.standard] as Bezier;
/** Duration based springs restated as stiffness and damping, so a retarget keeps the velocity already in flight. */
const physical = (visualDuration: number, bounce: number): Transition => {
  const root = 2 * Math.PI / (visualDuration * 1.2);
  return { type: "spring", stiffness: root * root, damping: 2 * (1 - bounce) * root, mass: 1 };
};
const GROW = physical(.44, .12), SHRINK = physical(.34, 0), GLIDE = physical(.3, .1), SLIDE = physical(.4, .06);
const HOVER_INTENT = 70, LEAVE_GRACE = 180, TRAVEL = 36;
/** Matches the container query in site-header.module.css. */
const COLLAPSE_BELOW = 760;

/** Panel content slides in from the side of the newly opened item; opening from closed drops in from the bar. */
const faceVariants: Variants = {
  hidden: (direction: number) => ({ opacity: 0, x: direction * TRAVEL, y: direction ? 0 : -6, filter: `blur(${motionTokens.blur.subtle}px)` }),
  shown: { opacity: 1, x: 0, y: 0, filter: "blur(0px)", transition: { x: SLIDE, y: SLIDE, opacity: { duration: .2, ease: enter, delay: .02 }, filter: { duration: .24, ease: enter } } },
  gone: (direction: number) => ({ opacity: 0, x: direction * -TRAVEL * .6, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { x: SLIDE, opacity: { duration: .12, ease: standard }, filter: { duration: .12, ease: standard } } }),
};
const fadeVariants: Variants = { hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: .14 } }, gone: { opacity: 0, transition: { duration: .08 } } };

export function ArcMark(props: { className?: string }) {
  return <svg className={props.className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 48V29C9 15 19 7 32 7s23 8 23 22v19" />
    <path d="M20 48V31c0-8 5-13 12-13s12 5 12 13v17" />
    <path d="M32 38v10" />
  </svg>;
}

const ICON = { size: 18, strokeWidth: 1.75, "aria-hidden": true } as const;
const curvedFacade = photo("curved-facade");

export const siteHeaderExampleItems: SiteHeaderItem[] = [
  {
    value: "product", label: "Product",
    links: [
      { label: "Components", description: "140 interactive React components", icon: <Boxes {...ICON} /> },
      { label: "Blocks", description: "Complete sections, ready to ship", icon: <PanelsTopLeft {...ICON} /> },
      { label: "Templates", description: "Starter sites with every page", icon: <LayoutTemplate {...ICON} /> },
      { label: "Themes", description: "Tune color, radius, and motion", icon: <Palette {...ICON} /> },
    ],
    feature: { title: "What's new in 2.4", description: "Site headers, footers, and hero sections.", image: { src: curvedFacade.src, alt: curvedFacade.alt } },
  },
  {
    value: "resources", label: "Resources",
    links: [
      { label: "Documentation", description: "Install, theme, and compose", icon: <BookOpen {...ICON} /> },
      { label: "Guides", description: "Patterns for real product work", icon: <Route {...ICON} /> },
      { label: "Changelog", description: "Every release, week by week", icon: <History {...ICON} /> },
      { label: "Community", description: "Questions, answers, and showcases", icon: <MessagesSquare {...ICON} /> },
    ],
  },
  { value: "pricing", label: "Pricing" },
  { value: "customers", label: "Customers" },
];

function useScrolled(threshold: number, container?: RefObject<HTMLElement | null>) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const node = container?.current ?? null;
    const target: HTMLElement | Window = node ?? window;
    const read = () => node ? node.scrollTop : window.scrollY;
    // Turns solid past the threshold and clear again only near the top, so it never flickers at the edge.
    const update = () => { const y = read(); setScrolled(previous => previous ? y > threshold / 2 : y > threshold); };
    update();
    target.addEventListener("scroll", update, { passive: true });
    return () => target.removeEventListener("scroll", update);
  }, [threshold, container]);
  return scrolled;
}

/** A panel face reports its natural height while current; a leaving face floats out of flow and turns inert. */
function Face({ direction, reduced, onHeight, children }: { direction: number; reduced: boolean; onHeight: (height: number) => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const present = useIsPresent();
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || !present) return;
    onHeight(node.offsetHeight);
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => onHeight(node.offsetHeight));
    observer.observe(node);
    return () => observer.disconnect();
  }, [present, onHeight]);
  return <motion.div ref={ref} className={styles.face} data-face="" data-leaving={present ? undefined : ""} inert={!present} custom={direction} variants={reduced ? fadeVariants : faceVariants} initial="hidden" animate="shown" exit="gone">
    {children}
  </motion.div>;
}

type DestinationProps = Omit<HTMLAttributes<HTMLElement>, "onClick" | "children"> & { link: { href?: string; label: string }; onChoose: (event: ReactMouseEvent) => void; children: ReactNode };
/** Renders an anchor when the destination has an href and a button otherwise, so demos and real sites share one path. */
function Destination({ link, onChoose, children, ...rest }: DestinationProps) {
  return link.href
    ? <a {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)} href={link.href} onClick={onChoose}>{children}</a>
    : <button {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)} type="button" onClick={onChoose}>{children}</button>;
}

/**
 * A website header in three layouts. It sticks to the top and turns solid once the page scrolls, marks the current section
 * with an indicator that glides between links, opens springy mega menu panels whose content slides in from the side you
 * moved toward, and folds into a menu sheet on narrow containers.
 */
export const SiteHeader = forwardRef<HTMLElement, SiteHeaderProps>(function SiteHeader({
  variant = "mega",
  brand = { name: "Arc" },
  items = siteHeaderExampleItems,
  current: currentProp,
  defaultCurrent,
  onCurrentChange,
  onNavigate,
  secondaryAction = { label: "Sign in" },
  primaryAction = { label: "Get Arc" },
  sticky = true,
  scrollContainer,
  scrollThreshold = 8,
  label = "Main",
  className,
}, ref) {
  const id = useId();
  const reduced = !!useReducedMotion();
  const scrolled = useScrolled(scrollThreshold, scrollContainer);
  const [innerCurrent, setInnerCurrent] = useState(defaultCurrent);
  const current = currentProp ?? innerCurrent;
  const [hovered, setHovered] = useState<string | null>(null);
  const [open, setOpen] = useState<{ value: string; direction: number } | null>(null);
  const [panel, setPanel] = useState<{ height: number | null; grow: boolean }>({ height: null, grow: true });
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRefs = useRef(new Map<string, HTMLButtonElement | HTMLAnchorElement>());
  const panelRef = useRef<HTMLDivElement>(null);
  const openTimer = useRef<number | undefined>(undefined), closeTimer = useRef<number | undefined>(undefined);
  const focusFirst = useRef(false);
  const hasPanels = variant === "mega";
  const openItem = open ? items.find(item => item.value === open.value) : undefined;

  const setRefs = useCallback((node: HTMLElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") ref(node); else if (ref) ref.current = node;
  }, [ref]);

  const clearTimers = useCallback(() => { window.clearTimeout(openTimer.current); window.clearTimeout(closeTimer.current); }, []);
  useEffect(() => clearTimers, [clearTimers]);

  const openPanel = useCallback((value: string | null) => {
    setOpen(previous => {
      if (!value) return null;
      if (previous?.value === value) return previous;
      const from = previous ? items.findIndex(item => item.value === previous.value) : -1;
      const to = items.findIndex(item => item.value === value);
      return { value, direction: from < 0 ? 0 : Math.sign(to - from) };
    });
    if (!value) setPanel({ height: null, grow: true });
  }, [items]);

  const close = useCallback((restoreFocus = false) => {
    clearTimers();
    const was = open?.value;
    openPanel(null);
    if (restoreFocus && was) triggerRefs.current.get(was)?.focus();
  }, [open, openPanel, clearTimers]);

  const closeMenu = useCallback((restoreFocus = false) => {
    setMenuOpen(false);
    setExpanded(null);
    if (restoreFocus) menuButtonRef.current?.focus();
  }, []);

  const choose = useCallback((destination: SiteHeaderDestination, section: string | undefined) => {
    if (section) {
      if (currentProp === undefined) setInnerCurrent(section);
      onCurrentChange?.(section);
    }
    onNavigate?.(destination);
    close();
    closeMenu();
  }, [close, closeMenu, currentProp, onCurrentChange, onNavigate]);

  // Outside presses and Escape close whichever layer is open.
  useEffect(() => {
    if (!open && !menuOpen) return;
    const onPointer = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) { close(); closeMenu(); } };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { if (open) close(true); else closeMenu(true); } };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onPointer); document.removeEventListener("keydown", onKey); };
  }, [open, menuOpen, close, closeMenu]);

  // The sheet belongs to narrow layouts: widening the container closes it, and it holds the page still while open.
  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width >= COLLAPSE_BELOW) { setMenuOpen(false); setExpanded(null); } else setOpen(null);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const scroller: HTMLElement = scrollContainer?.current ?? document.documentElement;
    const previous = scroller.style.getPropertyValue("overflow");
    scroller.style.setProperty("overflow", "hidden");
    return () => { if (previous) scroller.style.setProperty("overflow", previous); else scroller.style.removeProperty("overflow"); };
  }, [menuOpen, scrollContainer]);

  useEffect(() => {
    if (!open || !focusFirst.current) return;
    focusFirst.current = false;
    const frame = requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>("[data-panel-link]")?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  function onTriggerPointerEnter(event: ReactPointerEvent, value: string) {
    if (event.pointerType !== "mouse") return;
    window.clearTimeout(closeTimer.current);
    window.clearTimeout(openTimer.current);
    if (open) openPanel(value);
    else openTimer.current = window.setTimeout(() => openPanel(value), HOVER_INTENT);
  }
  function onRegionPointerLeave(event: ReactPointerEvent) {
    if (event.pointerType !== "mouse") return;
    window.clearTimeout(openTimer.current);
    closeTimer.current = window.setTimeout(() => openPanel(null), LEAVE_GRACE);
  }
  function onRegionPointerEnter(event: ReactPointerEvent) {
    if (event.pointerType === "mouse") window.clearTimeout(closeTimer.current);
  }

  function onNavKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const triggers = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("[data-nav-item]"));
    const index = triggers.indexOf(document.activeElement as HTMLElement);
    if (index < 0) return;
    event.preventDefault();
    const nextIndex = (index + (event.key === "ArrowRight" ? 1 : -1) + triggers.length) % triggers.length;
    triggers[nextIndex].focus();
    if (open) { const item = items[nextIndex]; openPanel(item && hasPanels && item.links?.length ? item.value : null); }
  }
  function onTriggerKeyDown(event: ReactKeyboardEvent, value: string) {
    if (event.key === "ArrowDown") { event.preventDefault(); focusFirst.current = true; openPanel(value); if (open?.value === value) panelRef.current?.querySelector<HTMLElement>("[data-panel-link]")?.focus(); }
  }
  function onPanelKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Home" && event.key !== "End") return;
    const unique = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("[data-face]:not([data-leaving]) [data-panel-link]"));
    if (!unique.length) return;
    event.preventDefault();
    const index = unique.indexOf(document.activeElement as HTMLElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? unique.length - 1 : event.key === "ArrowDown" ? Math.min(index + 1, unique.length - 1) : index - 1;
    if (next < 0) { close(true); return; }
    unique[next]?.focus();
  }

  // Growing carries a little life; shrinking settles without overshoot.
  const onHeight = useCallback((height: number) => setPanel(previous => previous.height === height ? previous : { height, grow: previous.height === null || height > previous.height }), []);

  const actionNode = (action: SiteHeaderAction, kind: "secondary" | "primary", extra = "") => {
    const onClick = () => { action.onClick?.(); if (action.href) onNavigate?.({ label: action.label, href: action.href }); closeMenu(); };
    const cls = `${styles.action} ${styles[kind]} ${extra}`;
    return action.href ? <a className={cls} href={action.href} onClick={onClick}>{action.label}</a> : <button type="button" className={cls} onClick={onClick}>{action.label}</button>;
  };

  const brandNode = <Destination link={{ label: brand.name, href: brand.href }} className={styles.brand} onChoose={() => { onNavigate?.({ label: brand.name, href: brand.href }); close(); closeMenu(); }}>
    {brand.mark ?? <ArcMark className={styles.brandMark} />}<span>{brand.name}</span>
  </Destination>;

  return <header
    ref={setRefs}
    className={[styles.header, sticky ? styles.sticky : "", className].filter(Boolean).join(" ")}
    data-variant={variant}
    data-scrolled={scrolled || menuOpen || !!open ? "" : undefined}
  >
    <div className={styles.inner} onPointerLeave={onRegionPointerLeave} onPointerEnter={onRegionPointerEnter}>
      <div className={styles.bar}>
        <div className={styles.brandSlot}>{brandNode}</div>
        <LayoutGroup id={id}>
          <nav className={styles.nav} aria-label={label} onKeyDown={onNavKeyDown} onPointerLeave={() => setHovered(null)}>
            <ul className={styles.navList}>
              {items.map(item => {
                const isCurrent = current === item.value;
                const withPanel = hasPanels && !!item.links?.length;
                const isOpen = open?.value === item.value;
                const panelId = `${id}-panel`;
                const common = {
                  className: styles.navItem,
                  "data-nav-item": "",
                  "data-current": isCurrent ? "" : undefined,
                  "data-open": isOpen ? "" : undefined,
                  onPointerEnter: (event: ReactPointerEvent) => { if (event.pointerType === "mouse") setHovered(item.value); if (withPanel) onTriggerPointerEnter(event, item.value); else if (event.pointerType === "mouse" && open) closeTimer.current = window.setTimeout(() => openPanel(null), LEAVE_GRACE); },
                  onFocus: () => setHovered(null),
                };
                const decorations = <>
                  {hovered === item.value && variant !== "centered" && <motion.span layoutId="hover" className={styles.hover} transition={reduced ? { duration: 0 } : GLIDE} aria-hidden="true" />}
                  {isCurrent && <motion.span layoutId="current" className={styles.indicator} transition={reduced ? { duration: 0 } : motionTokens.spring.morph} aria-hidden="true" />}
                </>;
                return <li key={item.value} className={styles.navCell}>
                  {withPanel
                    ? <button
                        {...common}
                        ref={(node: HTMLButtonElement | null) => { if (node) triggerRefs.current.set(item.value, node); else triggerRefs.current.delete(item.value); }}
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={isOpen ? panelId : undefined}
                        onClick={() => { clearTimers(); openPanel(isOpen ? null : item.value); }}
                        onKeyDown={event => onTriggerKeyDown(event, item.value)}
                      >
                        {decorations}
                        <span className={styles.navLabel}>{item.label}</span>
                        <ChevronDown className={styles.chevron} size={14} strokeWidth={2} aria-hidden="true" />
                      </button>
                    : <Destination
                        link={item}
                        {...common}
                        aria-current={isCurrent ? "page" : undefined}
                        onChoose={() => choose({ label: item.label, href: item.href, section: item.value }, item.value)}
                      >
                        {decorations}
                        <span className={styles.navLabel}>{item.label}</span>
                      </Destination>}
                </li>;
              })}
            </ul>
          </nav>
        </LayoutGroup>
        <div className={styles.actions}>
          {secondaryAction && actionNode(secondaryAction, "secondary", styles.wideOnly)}
          {primaryAction && actionNode(primaryAction, "primary")}
          <button ref={menuButtonRef} type="button" className={styles.menuButton} aria-expanded={menuOpen} aria-controls={`${id}-sheet`} aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => { if (menuOpen) closeMenu(); else setMenuOpen(true); }}>
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span key={menuOpen ? "close" : "open"} className={styles.menuIcon} initial={reduced ? { opacity: 0 } : { opacity: 0, rotate: menuOpen ? -45 : 45, scale: .8 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={reduced ? { opacity: 0 } : { opacity: 0, rotate: menuOpen ? 45 : -45, scale: .8 }} transition={reduced ? { duration: 0 } : { ...motionTokens.spring.snappy, opacity: { duration: .12 } }}>
                {menuOpen ? <X size={20} strokeWidth={1.75} aria-hidden="true" /> : <Menu size={20} strokeWidth={1.75} aria-hidden="true" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {hasPanels && <AnimatePresence>
        {openItem?.links && <motion.div
          key="panel"
          id={`${id}-panel`}
          ref={panelRef}
          className={styles.panel}
          role="region"
          aria-label={openItem.label}
          onKeyDown={onPanelKeyDown}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: -6, scale: .985 }}
          animate={{ opacity: 1, y: 0, scale: 1, height: panel.height ?? "auto" }}
          exit={reduced ? { opacity: 0, transition: { duration: .1 } } : { opacity: 0, y: -4, scale: .99, transition: { duration: .14, ease: standard } }}
          transition={reduced ? { duration: 0 } : { height: panel.grow ? GROW : SHRINK, y: GROW, scale: GROW, opacity: { duration: .16, ease: enter } }}
        >
          <AnimatePresence initial={false} custom={open?.direction ?? 0}>
            <Face key={openItem.value} direction={open?.direction ?? 0} reduced={reduced} onHeight={onHeight}>
              <div className={styles.faceGrid} data-featured={openItem.feature ? "" : undefined}>
                <ul className={styles.panelLinks}>
                  {openItem.links.map(link => <li key={link.label}>
                    <Destination link={link} className={styles.panelLink} data-panel-link="" onChoose={() => choose({ label: link.label, href: link.href, section: openItem.value }, openItem.value)}>
                      {link.icon && <span className={styles.panelIcon}>{link.icon}</span>}
                      <span className={styles.panelText}><span>{link.label}</span>{link.description && <span>{link.description}</span>}</span>
                    </Destination>
                  </li>)}
                </ul>
                {openItem.feature && <Destination link={{ label: openItem.feature.title, href: openItem.feature.href }} className={styles.feature} data-panel-link="" onChoose={() => choose({ label: openItem.feature!.title, href: openItem.feature!.href, section: openItem.value }, openItem.value)}>
                  {openItem.feature.image && <span className={styles.featureImage}><Image src={openItem.feature.image.src} alt={openItem.feature.image.alt} fill sizes="260px" /></span>}
                  <span className={styles.featureTitle}>{openItem.feature.title}<ArrowRight size={14} strokeWidth={2} aria-hidden="true" /></span>
                  {openItem.feature.description && <span className={styles.featureText}>{openItem.feature.description}</span>}
                </Destination>}
              </div>
            </Face>
          </AnimatePresence>
        </motion.div>}
      </AnimatePresence>}
    </div>

    <AnimatePresence>
      {menuOpen && <>
        <motion.div key="scrim" className={styles.scrim} onClick={() => closeMenu()} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .2, ease: standard }} aria-hidden="true" />
        <motion.div
          key="sheet"
          id={`${id}-sheet`}
          className={styles.sheet}
          initial={reduced ? { opacity: 0 } : { height: 0 }}
          animate={reduced ? { opacity: 1 } : { height: "auto" }}
          exit={reduced ? { opacity: 0 } : { height: 0, transition: SHRINK }}
          transition={reduced ? { duration: 0 } : GROW}
        >
          <nav className={styles.sheetInner} aria-label={label}>
            <ul className={styles.sheetList}>
              {items.map((item, index) => {
                const isCurrent = current === item.value;
                const group = !!item.links?.length && variant === "mega";
                const isExpanded = expanded === item.value;
                const rowMotion = { initial: reduced ? false : { opacity: 0, y: -6 }, animate: { opacity: 1, y: 0 }, transition: { duration: .26, ease: enter, delay: reduced ? 0 : .04 + index * motionTokens.stagger.item } } as const;
                return <motion.li key={item.value} className={styles.sheetItem} {...rowMotion}>
                  {group ? <>
                    <button type="button" className={styles.sheetRow} data-current={isCurrent ? "" : undefined} aria-expanded={isExpanded} aria-controls={`${id}-group-${item.value}`} onClick={() => setExpanded(isExpanded ? null : item.value)}>
                      <span>{item.label}</span><ChevronDown className={styles.sheetChevron} size={18} strokeWidth={1.75} aria-hidden="true" />
                    </button>
                    <AnimatePresence initial={false}>
                      {isExpanded && <motion.div key="group" id={`${id}-group-${item.value}`} className={styles.sheetGroup} initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }} animate={reduced ? { opacity: 1 } : { height: "auto", opacity: 1 }} exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }} transition={reduced ? { duration: 0 } : { height: motionTokens.spring.smooth, opacity: { duration: .16 } }}>
                        <ul>{item.links!.map(link => <li key={link.label}>
                          <Destination link={link} className={styles.sheetLink} onChoose={() => choose({ label: link.label, href: link.href, section: item.value }, item.value)}>
                            {link.icon}<span>{link.label}</span>
                          </Destination>
                        </li>)}</ul>
                      </motion.div>}
                    </AnimatePresence>
                  </> : <Destination link={item} className={styles.sheetRow} data-current={isCurrent ? "" : undefined} aria-current={isCurrent ? "page" : undefined} onChoose={() => choose({ label: item.label, href: item.href, section: item.value }, item.value)}>
                    <span>{item.label}</span>{isCurrent && <span className={styles.sheetDot} aria-hidden="true" />}
                  </Destination>}
                </motion.li>;
              })}
            </ul>
            {(secondaryAction || primaryAction) && <motion.div className={styles.sheetActions} initial={reduced ? false : { opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .26, ease: enter, delay: reduced ? 0 : .04 + items.length * motionTokens.stagger.item }}>
              {secondaryAction && actionNode(secondaryAction, "secondary")}
              {primaryAction && actionNode(primaryAction, "primary")}
            </motion.div>}
          </nav>
        </motion.div>
      </>}
    </AnimatePresence>
  </header>;
});

SiteHeader.displayName = "SiteHeader";

const variantOptions = [{ value: "mega", label: "Mega menu" }, { value: "simple", label: "Simple" }, { value: "centered", label: "Centered" }];
const pageLabels: Record<string, string> = { product: "Product", resources: "Resources", pricing: "Pricing", customers: "Customers" };

/** Preview: the header inside a small scrolling page, with a switch between its three layouts. */
export function SiteHeaderBlock({ variant: initial = "mega" }: { variant?: SiteHeaderVariant }) {
  const [variant, setVariant] = useState<SiteHeaderVariant>(initial);
  const [current, setCurrent] = useState("product");
  const [last, setLast] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  return <div className={styles.preview}>
    <SegmentedControl label="Header layout" options={variantOptions} value={variant} onValueChange={value => setVariant(value as SiteHeaderVariant)} />
    <div className={styles.frame} ref={scrollRef}>
      <SiteHeader
        variant={variant}
        current={current}
        onCurrentChange={setCurrent}
        onNavigate={destination => setLast(destination.label)}
        scrollContainer={scrollRef}
        secondaryAction={{ label: "Sign in", onClick: () => setLast("Sign in") }}
        primaryAction={{ label: "Get Arc", onClick: () => setLast("Get Arc") }}
      />
      <div className={styles.page}>
        <div className={styles.pageHero}>
          <h2>{pageLabels[current] ?? "Arc"}</h2>
          <p className={styles.srOnly} aria-live="polite">{last ? `Opened ${last}` : ""}</p>
        </div>
        <div className={styles.pageRows} aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => <div key={index} className={styles.pageRow}><span /><span /><span /></div>)}
        </div>
      </div>
    </div>
  </div>;
}

export default SiteHeaderBlock;
