"use client";

import Image, { type StaticImageData } from "next/image";
import { AnimatePresence, motion, useAnimate, useReducedMotion, type Transition, type Variants } from "motion/react";
import { ArrowRight, Bell, Check, ChevronDown } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type FocusEvent, type FormEvent, type KeyboardEvent } from "react";

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
const ARC_CHANGELOG_FEED_STYLES = `.arc-changelog-feed-feed { box-sizing: border-box; width: min(100%, 920px); margin-inline: auto; overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius-panel); background: var(--surface); color: var(--foreground); font-family: var(--font-body); letter-spacing: var(--tracking-body); }
.arc-changelog-feed-feed *, .arc-changelog-feed-feed *::before, .arc-changelog-feed-feed *::after { box-sizing: border-box; }
.arc-changelog-feed-srOnly { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }

/* Header */
.arc-changelog-feed-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px 24px; padding: 32px 28px 20px; }
.arc-changelog-feed-heading { min-width: 0; }
.arc-changelog-feed-heading h2 { margin: 0; font: 400 clamp(30px, 4vw, 38px)/1.1 var(--font-display); letter-spacing: var(--tracking-display); }
.arc-changelog-feed-heading p { margin: 8px 0 0; color: var(--text-secondary); font-size: 14px; line-height: 1.4; }

/* Subscribe */
.arc-changelog-feed-subscribeWrap { position: relative; flex: none; padding-top: 2px; }
.arc-changelog-feed-subscribe { height: 38px; overflow: hidden; border: 1px solid var(--foreground); border-radius: var(--radius-pill); background: var(--foreground); color: var(--background); transition: background-color .24s var(--ease-standard), border-color .24s var(--ease-standard), color .24s var(--ease-standard); }
.arc-changelog-feed-subscribe[data-state="editing"] { border-color: var(--border-strong); background: var(--surface); color: var(--foreground); }
.arc-changelog-feed-subscribe[data-state="done"] { border-color: var(--border); background: var(--surface-muted); color: var(--foreground); }
.arc-changelog-feed-subscribe[data-error] { border-color: var(--danger); }
.arc-changelog-feed-subscribeInner { position: relative; display: flex; width: max-content; height: 100%; }
.arc-changelog-feed-subscribeIdle { display: inline-flex; align-items: center; gap: 7px; height: 100%; padding: 0 17px 0 15px; border: 0; background: transparent; color: inherit; font: 500 13px/1 var(--font-body); white-space: nowrap; cursor: pointer; outline: none; }
.arc-changelog-feed-subscribeForm { display: flex; align-items: center; gap: 6px; height: 100%; padding: 0 4px 0 15px; }
.arc-changelog-feed-subscribeForm input { width: 188px; min-width: 0; height: 100%; padding: 0; border: 0; background: transparent; color: var(--foreground); font: 14px/1 var(--font-body); outline: none; }
.arc-changelog-feed-subscribeForm input::placeholder { color: var(--text-muted); }
.arc-changelog-feed-subscribeSubmit { display: grid; flex: none; place-items: center; width: 28px; height: 28px; padding: 0; border: 0; border-radius: 50%; background: var(--foreground); color: var(--background); cursor: pointer; outline: none; transition: transform .12s var(--ease-standard); }
.arc-changelog-feed-subscribeSubmit:active { transform: scale(.94); }
.arc-changelog-feed-subscribeDone { display: inline-flex; align-items: center; gap: 7px; height: 100%; padding: 0 5px 0 13px; font-size: 13px; font-weight: 500; white-space: nowrap; }
.arc-changelog-feed-drawnCheck { flex: none; color: var(--success); }
.arc-changelog-feed-subscribeUndo { height: 26px; margin-left: 4px; padding: 0 10px; border: 0; border-radius: var(--radius-pill); background: transparent; color: var(--text-secondary); font: 500 12px/1 var(--font-body); cursor: pointer; outline: none; transition: background-color .16s var(--ease-standard), color .16s var(--ease-standard); }
.arc-changelog-feed-subscribeNote { position: absolute; top: calc(100% + 7px); right: 6px; margin: 0; color: var(--text-muted); font-size: 12px; line-height: 16px; white-space: nowrap; }
.arc-changelog-feed-subscribeNote[data-error] { color: var(--danger); }
.arc-changelog-feed-subscribeNote span { display: inline-block; }

/* Filters */
.arc-changelog-feed-toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 16px; padding: 6px 28px 20px; }
.arc-changelog-feed-chips { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.arc-changelog-feed-chip { display: inline-flex; align-items: center; gap: 8px; height: 34px; padding: 0 13px 0 12px; border: 1px solid var(--border); border-radius: var(--radius-pill); background: transparent; color: var(--text-secondary); font: 500 13px/1 var(--font-body); cursor: pointer; transition: background-color .22s var(--ease-standard), border-color .22s var(--ease-standard), color .22s var(--ease-standard), transform .12s var(--ease-standard); }
.arc-changelog-feed-chip:active { transform: scale(.97); }
.arc-changelog-feed-chip[aria-pressed="true"] { border-color: var(--foreground); background: var(--foreground); color: var(--background); }
.arc-changelog-feed-chipMark { display: grid; flex: none; place-items: center; overflow: hidden; border-radius: 50%; background: var(--kind); transition: background-color .22s var(--ease-standard); }
.arc-changelog-feed-chip[aria-pressed="true"] .arc-changelog-feed-chipMark { background: var(--mark); }
.arc-changelog-feed-chipTick { display: grid; place-items: center; color: var(--tick); }
.arc-changelog-feed-chipCount { color: var(--text-muted); font-size: 12px; font-variant-numeric: tabular-nums; transition: color .22s var(--ease-standard); }
.arc-changelog-feed-chip[aria-pressed="true"] .arc-changelog-feed-chipCount { color: color-mix(in srgb, var(--background) 62%, transparent); }
.arc-changelog-feed-clear { height: 34px; padding: 0 8px; border: 0; border-radius: var(--radius-pill); background: transparent; color: var(--text-secondary); font: 500 13px/1 var(--font-body); cursor: pointer; }
.arc-changelog-feed-shown { display: inline-flex; align-items: baseline; gap: 4px; margin: 0; color: var(--text-muted); font-size: 13px; font-variant-numeric: tabular-nums; white-space: nowrap; }
.arc-changelog-feed-shown > span:last-child { display: inline-block; }

.arc-changelog-feed-chip[data-kind="new"], .arc-changelog-feed-kind[data-kind="new"] { --kind: var(--accent); --mark: var(--accent); --tick: var(--accent-foreground); }
.arc-changelog-feed-chip[data-kind="improved"], .arc-changelog-feed-kind[data-kind="improved"] { --kind: var(--text-muted); --mark: var(--background); --tick: var(--foreground); }
.arc-changelog-feed-chip[data-kind="fixed"], .arc-changelog-feed-kind[data-kind="fixed"] { --kind: var(--success); --mark: var(--success); --tick: var(--background); }

/* Rolling numbers */
.arc-changelog-feed-roll { position: relative; display: inline-flex; overflow: hidden; font-variant-numeric: tabular-nums; }
.arc-changelog-feed-roll > span { display: inline-block; }

/* Month bar */
.arc-changelog-feed-monthBar { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 60px; padding: 10px 28px; border-block: 1px solid var(--border); }
.arc-changelog-feed-monthLabel { display: flex; align-items: baseline; gap: 12px; min-width: 0; }
.arc-changelog-feed-monthText { position: relative; display: inline-flex; font: 500 18px/1.3 var(--font-body); letter-spacing: -.015em; white-space: nowrap; }
.arc-changelog-feed-monthText > span { display: inline-block; }
.arc-changelog-feed-monthYear { display: inline; }
.arc-changelog-feed-monthCount { display: inline-flex; align-items: baseline; gap: 4px; color: var(--text-muted); font-size: 13px; white-space: nowrap; }
.arc-changelog-feed-monthNav { display: flex; flex: none; gap: 2px; padding: 3px; border-radius: var(--radius-pill); background: var(--surface-muted); }
.arc-changelog-feed-monthNav button { position: relative; min-width: 42px; height: 28px; padding: 0 10px; border: 0; border-radius: var(--radius-pill); background: transparent; color: var(--text-secondary); font: 500 12px/1 var(--font-body); cursor: pointer; transition: color .2s var(--ease-standard); }
.arc-changelog-feed-monthNav button[aria-current="true"] { color: var(--foreground); }
.arc-changelog-feed-monthPill { position: absolute; inset: 0; border-radius: var(--radius-pill); background: var(--surface); box-shadow: 0 0 0 1px var(--border), var(--shadow-resting); }
.arc-changelog-feed-monthShort { position: relative; z-index: 1; }

/* Feed */
.arc-changelog-feed-scroller { position: relative; height: 560px; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin; outline: none; -webkit-mask-image: linear-gradient(to bottom, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to bottom, #000 calc(100% - 36px), transparent); }
.arc-changelog-feed-list { position: relative; }
.arc-changelog-feed-group { position: relative; }
.arc-changelog-feed-groupTitle { margin: 0; padding: 30px 28px 10px; border-bottom: 1px solid var(--border-subtle); color: var(--text-muted); font-size: 13px; font-weight: 500; }
.arc-changelog-feed-entries { position: relative; margin: 0; padding: 0; list-style: none; }
.arc-changelog-feed-entry { position: relative; border-bottom: 1px solid var(--border-subtle); background: var(--surface); }
.arc-changelog-feed-entries > .arc-changelog-feed-entry:last-child { border-bottom: 0; }
.arc-changelog-feed-row { display: grid; grid-template-columns: 104px minmax(0, 1fr) 20px; align-items: start; gap: 4px 24px; width: 100%; padding: 22px 28px; border: 0; background: transparent; color: inherit; font: inherit; letter-spacing: inherit; text-align: left; cursor: pointer; transition: background-color .2s var(--ease-standard); }
.arc-changelog-feed-meta { display: grid; justify-items: start; gap: 8px; padding-top: 1px; }
.arc-changelog-feed-meta time { color: var(--text-secondary); font-size: 13px; line-height: 20px; font-variant-numeric: tabular-nums; }
.arc-changelog-feed-version { padding: 1px 7px; border: 1px solid var(--border); border-radius: 7px; color: var(--text-secondary); font: 500 11px/18px ui-monospace, SFMono-Regular, Menlo, monospace; font-variant-numeric: tabular-nums; letter-spacing: 0; white-space: nowrap; }
.arc-changelog-feed-body { display: grid; gap: 6px; min-width: 0; }
.arc-changelog-feed-kind { display: inline-flex; align-items: center; gap: 7px; color: var(--text-secondary); font-size: 12px; font-weight: 500; line-height: 20px; }
.arc-changelog-feed-kind i { width: 7px; height: 7px; border-radius: 50%; background: var(--kind); }
.arc-changelog-feed-title { color: var(--foreground); font-size: 16px; font-weight: 500; line-height: 1.35; letter-spacing: -.012em; }
.arc-changelog-feed-summary { max-width: 62ch; color: var(--text-secondary); font-size: 14px; line-height: 1.5; }
.arc-changelog-feed-chevron { display: grid; place-items: center; width: 20px; height: 20px; margin-top: 1px; color: var(--text-muted); transition: color .2s var(--ease-standard); }
.arc-changelog-feed-entry[data-open] .arc-changelog-feed-chevron { color: var(--foreground); }
.arc-changelog-feed-panel { overflow: hidden; }
.arc-changelog-feed-panelInner { padding: 0 72px 28px 156px; }
.arc-changelog-feed-details { display: grid; gap: 6px; max-width: 62ch; margin: 0; padding: 0; list-style: none; }
.arc-changelog-feed-details li { position: relative; padding-left: 16px; color: var(--text-secondary); font-size: 14px; line-height: 1.5; }
.arc-changelog-feed-details li::before { position: absolute; top: .75em; left: 1px; width: 6px; height: 1px; content: ""; background: var(--text-muted); }
.arc-changelog-feed-photo { max-width: 560px; margin: 18px 0 0; }
.arc-changelog-feed-photoFrame { position: relative; aspect-ratio: 16 / 10; overflow: hidden; border-radius: 16px; background: var(--surface-muted); }
.arc-changelog-feed-photoFrame img { display: block; width: 100%; height: 100%; object-fit: cover; }
.arc-changelog-feed-photoFrame::after { position: absolute; inset: 0; border-radius: inherit; content: ""; box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--foreground) 8%, transparent); pointer-events: none; }
.arc-changelog-feed-photo figcaption { margin-top: 9px; color: var(--text-muted); font-size: 12px; line-height: 1.4; }
.arc-changelog-feed-code { max-width: 560px; margin-top: 18px; overflow: hidden; border: 1px solid var(--border); border-radius: 16px; background: var(--surface-muted); }
.arc-changelog-feed-codeHead { display: flex; align-items: center; justify-content: space-between; gap: 12px; height: 40px; padding: 0 6px 0 14px; border-bottom: 1px solid var(--border); color: var(--text-muted); font-size: 12px; }
.arc-changelog-feed-code pre { margin: 0; padding: 14px 16px 16px; overflow-x: auto; color: var(--foreground); font: 12px/1.7 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: 0; tab-size: 2; scrollbar-width: thin; }
.arc-changelog-feed-endCap { margin: 0; padding: 34px 28px 56px; color: var(--text-muted); font-size: 13px; text-align: center; }


@media (hover: hover) and (pointer: fine) {
  .arc-changelog-feed-chip:not([aria-pressed="true"]):hover { border-color: var(--border-strong); color: var(--foreground); }
  .arc-changelog-feed-clear:hover, .arc-changelog-feed-monthNav button:hover, .arc-changelog-feed-subscribeUndo:hover { color: var(--foreground); }
  .arc-changelog-feed-subscribeUndo:hover { background: var(--surface); }
  .arc-changelog-feed-row:hover { background: color-mix(in srgb, var(--surface-muted) 60%, transparent); }
  .arc-changelog-feed-row:hover .arc-changelog-feed-chevron { color: var(--foreground); }
}

@media (max-width: 640px) {
  .arc-changelog-feed-feed { border-radius: var(--radius-panel); }
  .arc-changelog-feed-header { flex-direction: column; gap: 18px; padding: 26px 20px 26px; }
  .arc-changelog-feed-subscribeNote { right: auto; left: 6px; }
  .arc-changelog-feed-subscribeForm input { width: 172px; font-size: 16px; }
  .arc-changelog-feed-toolbar { padding: 4px 20px 18px; }
  .arc-changelog-feed-monthBar { padding-inline: 20px; }
  .arc-changelog-feed-scroller { height: 520px; }
  .arc-changelog-feed-groupTitle { padding-inline: 20px; }
  .arc-changelog-feed-row { grid-template-columns: minmax(0, 1fr) 20px; grid-template-areas: "meta chevron" "body body"; gap: 10px 12px; padding: 18px 20px; }
  .arc-changelog-feed-meta { display: flex; grid-area: meta; align-items: center; gap: 10px; padding-top: 0; }
  .arc-changelog-feed-body { grid-area: body; }
  .arc-changelog-feed-chevron { grid-area: chevron; margin-top: 0; }
  .arc-changelog-feed-panelInner { padding: 0 20px 24px; }
}

@media (max-width: 480px) {
  .arc-changelog-feed-monthCount, .arc-changelog-feed-monthYear { display: none; }
  .arc-changelog-feed-monthText { font-size: 16px; }
  .arc-changelog-feed-monthNav button { min-width: 0; padding: 0 9px; }
  .arc-changelog-feed-shown { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .arc-changelog-feed-feed *, .arc-changelog-feed-feed *::before, .arc-changelog-feed-feed *::after { transition-duration: 0ms !important; }
  .arc-changelog-feed-chip:active, .arc-changelog-feed-subscribeSubmit:active { transform: none; }
}
`;

const styles: Record<string, string> = new Proxy({
  "body": "arc-changelog-feed-body",
  "chevron": "arc-changelog-feed-chevron",
  "chip": "arc-changelog-feed-chip",
  "chipCount": "arc-changelog-feed-chipCount",
  "chipMark": "arc-changelog-feed-chipMark",
  "chipTick": "arc-changelog-feed-chipTick",
  "chips": "arc-changelog-feed-chips",
  "clear": "arc-changelog-feed-clear",
  "code": "arc-changelog-feed-code",
  "codeHead": "arc-changelog-feed-codeHead",
  "details": "arc-changelog-feed-details",
  "drawnCheck": "arc-changelog-feed-drawnCheck",
  "endCap": "arc-changelog-feed-endCap",
  "entries": "arc-changelog-feed-entries",
  "entry": "arc-changelog-feed-entry",
  "feed": "arc-changelog-feed-feed",
  "group": "arc-changelog-feed-group",
  "groupTitle": "arc-changelog-feed-groupTitle",
  "header": "arc-changelog-feed-header",
  "heading": "arc-changelog-feed-heading",
  "kind": "arc-changelog-feed-kind",
  "list": "arc-changelog-feed-list",
  "meta": "arc-changelog-feed-meta",
  "monthBar": "arc-changelog-feed-monthBar",
  "monthCount": "arc-changelog-feed-monthCount",
  "monthLabel": "arc-changelog-feed-monthLabel",
  "monthNav": "arc-changelog-feed-monthNav",
  "monthPill": "arc-changelog-feed-monthPill",
  "monthShort": "arc-changelog-feed-monthShort",
  "monthText": "arc-changelog-feed-monthText",
  "monthYear": "arc-changelog-feed-monthYear",
  "panel": "arc-changelog-feed-panel",
  "panelInner": "arc-changelog-feed-panelInner",
  "photo": "arc-changelog-feed-photo",
  "photoFrame": "arc-changelog-feed-photoFrame",
  "roll": "arc-changelog-feed-roll",
  "row": "arc-changelog-feed-row",
  "scroller": "arc-changelog-feed-scroller",
  "shown": "arc-changelog-feed-shown",
  "srOnly": "arc-changelog-feed-srOnly",
  "subscribe": "arc-changelog-feed-subscribe",
  "subscribeDone": "arc-changelog-feed-subscribeDone",
  "subscribeForm": "arc-changelog-feed-subscribeForm",
  "subscribeIdle": "arc-changelog-feed-subscribeIdle",
  "subscribeInner": "arc-changelog-feed-subscribeInner",
  "subscribeNote": "arc-changelog-feed-subscribeNote",
  "subscribeSubmit": "arc-changelog-feed-subscribeSubmit",
  "subscribeUndo": "arc-changelog-feed-subscribeUndo",
  "subscribeWrap": "arc-changelog-feed-subscribeWrap",
  "summary": "arc-changelog-feed-summary",
  "title": "arc-changelog-feed-title",
  "toolbar": "arc-changelog-feed-toolbar",
  "version": "arc-changelog-feed-version"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-changelog-feed-${prop}`,
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



export type ChangelogKind = "new" | "improved" | "fixed";
type Kind = ChangelogKind;
export type ChangelogMedia =
  | { type: "photo"; src: StaticImageData | string; alt: string; caption: string; /** Pixel size, needed when `src` is a URL rather than an imported image. */ width?: number; height?: number }
  | { type: "code"; file: string; code: string };
type Media = ChangelogMedia;
export type ChangelogEntry = { id: string; month: string; date: string; iso: string; version: string; kind: Kind; title: string; summary: string; details: string[]; media?: Media };
export type ChangelogMonth = { key: string; label: string; short: string };
type Entry = ChangelogEntry;
type Month = ChangelogMonth;

const kinds: { id: Kind; label: string }[] = [
  { id: "new", label: "New" },
  { id: "improved", label: "Improved" },
  { id: "fixed", label: "Fixed" },
];

/** Sample photos load by URL from public/media, so the block installs without binary imports. */
const ceramics = photo("terracotta-waves"), journal = photo("alpine-lake"), bottle = photo("wine-bar"), interior = photo("living-room"), seaAtDusk = photo("sea-at-dusk");

const exampleMonths: Month[] = [
  { key: "2026-09", label: "September 2026", short: "Sep" },
  { key: "2026-08", label: "August 2026", short: "Aug" },
  { key: "2026-07", label: "July 2026", short: "Jul" },
  { key: "2026-06", label: "June 2026", short: "Jun" },
];

const webhookSnippet = `im" + "port { verifyWebhook } from "@halden/node";

const event = verifyWebhook(body, headers, secret);

if (event.type === "order.paid") {
  await fulfil(event.data.order); // ord_7Hq2Lx
}`;

const dnsSnippet = `Type    Name       Value
CNAME   shop       edge.halden.example
TXT     _halden    verify=hd_4f81c2`;

const exampleEntries: Entry[] = [
  { id: "masonry", month: "2026-09", date: "Sep 18", iso: "2026-09-18", version: "4.12.0", kind: "new", title: "Masonry gallery layout", summary: "Mix portrait and landscape work without cropping a single frame.", details: ["Choose two to five columns for each breakpoint.", "Drag an image and the columns rebalance while you move it.", "Captions fall back to the image alt text."], media: { type: "photo", src: ceramics.src, width: ceramics.width, height: ceramics.height, alt: "Wavy terracotta walls rising toward a blue sky", caption: "Gallery by Oda Lindqvist Ceramics, Bergen" } },
  { id: "resumable", month: "2026-09", date: "Sep 18", iso: "2026-09-18", version: "4.12.0", kind: "improved", title: "Uploads resume after a dropped connection", summary: "Large uploads continue from the last finished chunk instead of starting over.", details: ["Files upload in 8 MB chunks, each retried up to five times.", "The upload queue survives a page reload."] },
  { id: "currency", month: "2026-09", date: "Sep 9", iso: "2026-09-09", version: "4.11.2", kind: "fixed", title: "Discount codes stay applied after a currency switch", summary: "Switching from EUR to CHF at checkout no longer clears an applied code.", details: ["Affected 0.4% of checkouts since 4.11.0.", "Totals are now recalculated on the server after every switch."] },
  { id: "webhooks", month: "2026-09", date: "Sep 2", iso: "2026-09-02", version: "4.11.0", kind: "new", title: "Order webhooks", summary: "Receive a signed request when an order is paid, refunded, or shipped.", details: ["Every request carries a timestamped signature.", "Failed deliveries retry with backoff for 72 hours."], media: { type: "code", file: "webhooks.ts", code: webhookSnippet } },
  { id: "covers", month: "2026-08", date: "Aug 26", iso: "2026-08-26", version: "4.10.0", kind: "new", title: "Journal posts with full-bleed covers", summary: "Open a story with one photograph that runs edge to edge on every screen.", details: ["Set a focal point so the crop holds on narrow phones.", "Covers load a blurred preview first, then the full image."], media: { type: "photo", src: journal.src, width: journal.width, height: journal.height, alt: "A calm alpine lake reflecting a rocky peak at golden hour", caption: "Journal cover from Studio Varga, Budapest" } },
  { id: "avif", month: "2026-08", date: "Aug 26", iso: "2026-08-26", version: "4.10.0", kind: "improved", title: "Product pages load 38% faster on mobile", summary: "Images now ship as AVIF with responsive sizes for each device.", details: ["Median largest paint dropped from 2.9 s to 1.8 s.", "Older browsers still receive WebP or JPEG."] },
  { id: "inventory", month: "2026-08", date: "Aug 14", iso: "2026-08-14", version: "4.9.3", kind: "fixed", title: "Stock no longer goes negative during a sale", summary: "Concurrent checkouts now reserve inventory in a single step.", details: ["Two buyers can no longer purchase the last item at the same moment.", "Oversold orders from August 9 to 13 were refunded automatically."] },
  { id: "shortcuts", month: "2026-08", date: "Aug 5", iso: "2026-08-05", version: "4.9.0", kind: "improved", title: "Keyboard shortcuts in the editor", summary: "Move, duplicate, and publish blocks without reaching for the mouse.", details: ["Press ⌘K to open the command menu from anywhere.", "Press ⌘D to duplicate the selected block.", "Press ⇧⌘P to publish the current page."] },
  { id: "variants", month: "2026-07", date: "Jul 22", iso: "2026-07-22", version: "4.8.0", kind: "new", title: "Variants with their own photos", summary: "Each colour or size can show its own gallery on the product page.", details: ["The page switches photos when a buyer picks a variant.", "Variants without photos fall back to the product gallery."], media: { type: "photo", src: bottle.src, width: bottle.width, height: bottle.height, alt: "A carafe of red wine on a bar table in evening light", caption: "Carafe, 500 ml from Ferment Lab, Lyon" } },
  { id: "timezone", month: "2026-07", date: "Jul 10", iso: "2026-07-10", version: "4.7.1", kind: "fixed", title: "Scheduled posts respect the studio time zone", summary: "A post scheduled for 09:00 in Zurich no longer goes live at 09:00 UTC.", details: ["Existing schedules were corrected on July 10.", "The scheduler now shows the time zone next to every slot."] },
  { id: "domains", month: "2026-07", date: "Jul 3", iso: "2026-07-03", version: "4.7.0", kind: "improved", title: "Custom domains verify in under a minute", summary: "Add two DNS records and Halden checks them every few seconds.", details: ["Certificates are issued as soon as the records resolve.", "Verification used to take up to an hour."], media: { type: "code", file: "DNS records", code: dnsSnippet } },
  { id: "rooms", month: "2026-06", date: "Jun 24", iso: "2026-06-24", version: "4.6.0", kind: "new", title: "Shoppable room photos", summary: "Tag products directly on an interior photo and link each tag to checkout.", details: ["Tags follow the photo when it is cropped or resized.", "Up to twelve products per photo."], media: { type: "photo", src: interior.src, width: interior.width, height: interior.height, alt: "A bright living room with timber beams, arched windows, and cream sofas", caption: "Room by Maison Aubert, Montréal" } },
  { id: "csv", month: "2026-06", date: "Jun 12", iso: "2026-06-12", version: "4.5.2", kind: "fixed", title: "CSV exports keep accented names", summary: "Names like Zoë and Håkon now open correctly in every spreadsheet app.", details: ["Exports are written as UTF-8 with a byte order mark.", "Re-export any file created since 4.5.0."] },
  { id: "search", month: "2026-06", date: "Jun 3", iso: "2026-06-03", version: "4.5.0", kind: "improved", title: "Media search understands subject and colour", summary: "Type what is in the picture and the library finds it.", details: ["Search works across 40,000 images in under 200 ms.", "Results group near-duplicates so each shot appears once."], media: { type: "photo", src: seaAtDusk.src, width: seaAtDusk.width, height: seaAtDusk.height, alt: "A calm sea at dusk with a low island on the horizon", caption: "Result for “sea at dusk” in the media library" } },
];


const blurSoft = `blur(${motionTokens.blur.soft}px)`;
const blurSubtle = `blur(${motionTokens.blur.subtle}px)`;
const none = "blur(0px)";
const instant: Transition = { duration: 0 };
const exitSpring: Transition = { type: "spring", visualDuration: 0.28, bounce: 0 };

/** Values rise when they grow and fall when they shrink; the outgoing value leaves the opposite way. */
const roll: Variants = {
  enter: (direction: number) => ({ opacity: 0, y: `${direction * 55}%`, filter: blurSubtle }),
  center: { opacity: 1, y: "0%", filter: none },
  exit: (direction: number) => ({ opacity: 0, y: `${direction * -55}%`, filter: blurSubtle }),
};
const rise: Variants = {
  enter: (direction: number) => ({ opacity: 0, y: direction * 14, filter: blurSoft }),
  center: { opacity: 1, y: 0, filter: none },
  exit: (direction: number) => ({ opacity: 0, y: direction * -14, filter: blurSoft, transition: { duration: motionTokens.duration.exit, ease: [...motionTokens.ease.standard] } }),
};

function RollingNumber({ value, reduce }: { value: number; reduce: boolean }) {
  const [state, setState] = useState({ value, direction: 1 });
  if (state.value !== value) setState({ value, direction: value > state.value ? 1 : -1 });
  return <span className={styles.roll}>
    <AnimatePresence mode="popLayout" initial={false} custom={state.direction}>
      <motion.span key={value} custom={state.direction} variants={roll} initial="enter" animate="center" exit="exit" transition={reduce ? instant : motionTokens.spring.snappy}>{value}</motion.span>
    </AnimatePresence>
  </span>;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
type SubscribeState = "idle" | "editing" | "done";

/** One pill that becomes a field, then a confirmation. The shell morphs its width; the content swaps a beat later inside it. */
function SubscribeControl({ reduce }: { reduce: boolean }) {
  const inputId = useId();
  const [state, setState] = useState<SubscribeState>("idle");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);
  const [width, setWidth] = useState<number | null>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idleRef = useRef<HTMLButtonElement>(null);
  const undoRef = useRef<HTMLButtonElement>(null);
  const focusNext = useRef(false);
  const [shakeScope, animate] = useAnimate<HTMLDivElement>();

  useEffect(() => {
    const element = innerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setWidth(element.offsetWidth));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!focusNext.current) return;
    focusNext.current = false;
    const target = state === "editing" ? inputRef.current : state === "done" ? undoRef.current : idleRef.current;
    target?.focus({ preventScroll: true });
  }, [state]);

  function go(next: SubscribeState, focus = true) { focusNext.current = focus; setState(next); }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!emailPattern.test(email.trim())) {
      setError(true);
      if (!reduce && shakeScope.current) animate(shakeScope.current, { x: [0, -6, 5, -3, 2, 0] }, { duration: 0.4, ease: "easeOut" });
      inputRef.current?.focus();
      return;
    }
    setError(false);
    go("done");
  }
  function onKeyDown(event: KeyboardEvent<HTMLFormElement>) { if (event.key === "Escape") { setError(false); go("idle"); } }
  function onBlur(event: FocusEvent<HTMLFormElement>) { if (!event.currentTarget.contains(event.relatedTarget) && !email.trim()) { setError(false); go("idle", false); } }
  function undo() { setEmail(""); go("idle"); }

  const swap: Transition = reduce ? { duration: motionTokens.duration.instant } : { opacity: { duration: 0.2, delay: 0.05 }, filter: { duration: 0.2, delay: 0.05 }, scale: { ...motionTokens.spring.morph, delay: 0.03 } };
  const leave = { opacity: 0, scale: 0.96, filter: blurSubtle, transition: { duration: motionTokens.duration.instant } };
  const note = error ? "Enter a valid email address" : state === "done" ? "Subscribed." : "";

  return <div className={styles.subscribeWrap}>
    <div ref={shakeScope}>
      <motion.div className={styles.subscribe} data-state={state} data-error={error || undefined} initial={false} animate={{ width: width ?? "auto" }} transition={reduce ? instant : motionTokens.spring.morph}>
        <div ref={innerRef} className={styles.subscribeInner}>
          <AnimatePresence mode="popLayout" initial={false}>
            {state === "idle" && <motion.button key="idle" ref={idleRef} type="button" className={styles.subscribeIdle} onClick={() => go("editing")} initial={{ opacity: 0, scale: 0.96, filter: blurSubtle }} animate={{ opacity: 1, scale: 1, filter: none }} exit={leave} transition={swap}>
              <Bell size={14} aria-hidden="true" />Subscribe
            </motion.button>}
            {state === "editing" && <motion.form key="form" className={styles.subscribeForm} noValidate onSubmit={submit} onKeyDown={onKeyDown} onBlur={onBlur} initial={{ opacity: 0, scale: 0.96, filter: blurSubtle }} animate={{ opacity: 1, scale: 1, filter: none }} exit={leave} transition={swap}>
              <label className={styles.srOnly} htmlFor={inputId}>Email address</label>
              <input ref={inputRef} id={inputId} type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" value={email} aria-invalid={error || undefined} onChange={(event) => { setEmail(event.target.value); if (error) setError(false); }} />
              <button type="submit" className={styles.subscribeSubmit} aria-label="Subscribe to release notes"><ArrowRight size={14} /></button>
            </motion.form>}
            {state === "done" && <motion.div key="done" className={styles.subscribeDone} initial={{ opacity: 0, scale: 0.96, filter: blurSubtle }} animate={{ opacity: 1, scale: 1, filter: none }} exit={leave} transition={swap}>
              <svg className={styles.drawnCheck} width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <motion.path d="M4 12.5l5 5L20 6.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={reduce ? instant : { duration: 0.42, ease: [...motionTokens.ease.standard], delay: 0.12 }} />
              </svg>
              <span>Subscribed</span>
              <button ref={undoRef} type="button" className={styles.subscribeUndo} onClick={undo} aria-label={`Undo subscription for ${email.trim()}`}>Undo</button>
            </motion.div>}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
    <p className={styles.subscribeNote} data-error={error || undefined} role="status" aria-live="polite">
      <AnimatePresence mode="popLayout" initial={false}>
        {note && <motion.span key={note} initial={{ opacity: 0, y: -4, filter: blurSubtle }} animate={{ opacity: 1, y: 0, filter: none }} exit={{ opacity: 0, transition: { duration: motionTokens.duration.instant } }} transition={reduce ? instant : { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }}>{note}</motion.span>}
      </AnimatePresence>
    </p>
  </div>;
}

function EntryMedia({ media }: { media: Media }) {
  if (media.type === "photo") {
    return <figure className={styles.photo}>
      <div className={styles.photoFrame}>{typeof media.src === "string"
        ? <Image src={media.src} alt={media.alt} width={media.width ?? 1600} height={media.height ?? 1067} sizes="(max-width: 700px) 100vw, 560px" />
        : <Image src={media.src} alt={media.alt} placeholder="blur" sizes="(max-width: 700px) 100vw, 560px" />}</div>
      <figcaption>{media.caption}</figcaption>
    </figure>;
  }
  return <div className={styles.code}>
    <div className={styles.codeHead}><span>{media.file}</span><CopyButton value={media.code} label={`Copy ${media.file}`} iconOnly variant="plain" /></div>
    <pre><code>{media.code}</code></pre>
  </div>;
}

function EntryRow({ entry, open, onToggle, reduce }: { entry: Entry; open: boolean; onToggle: () => void; reduce: boolean }) {
  const panelId = useId();
  const kind = kinds.find((item) => item.id === entry.kind)!;
  const layout: Transition = reduce ? instant : motionTokens.spring.smooth;
  return <motion.li
    layout="position"
    className={styles.entry}
    data-open={open || undefined}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={reduce ? { opacity: 0, transition: { duration: motionTokens.duration.instant } } : { opacity: 0, scale: 0.98, filter: blurSubtle, transition: { duration: motionTokens.duration.exit, ease: [...motionTokens.ease.standard] } }}
    transition={reduce ? { duration: 0, opacity: { duration: motionTokens.duration.instant } } : { ...motionTokens.spring.smooth, layout }}
  >
    <button type="button" className={styles.row} aria-expanded={open} aria-controls={panelId} onClick={onToggle}>
      <span className={styles.meta}>
        <time dateTime={entry.iso}>{entry.date}</time>
        <span className={styles.version}>v{entry.version}</span>
      </span>
      <span className={styles.body}>
        <span className={styles.kind} data-kind={entry.kind}><i aria-hidden="true" />{kind.label}</span>
        <span className={styles.title}>{entry.title}</span>
        <span className={styles.summary}>{entry.summary}</span>
      </span>
      <motion.span className={styles.chevron} aria-hidden="true" initial={false} animate={{ rotate: open ? 180 : 0 }} transition={reduce ? instant : motionTokens.spring.snappy}><ChevronDown size={16} /></motion.span>
    </button>
    <AnimatePresence initial={false}>
      {open && <motion.div key="panel" id={panelId} className={styles.panel} initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0, transition: reduce ? instant : exitSpring }} transition={reduce ? instant : motionTokens.spring.smooth}>
        <motion.div
          className={styles.panelInner}
          initial={{ opacity: 0, y: 8, filter: blurSoft }}
          animate={{ opacity: 1, y: 0, filter: none }}
          exit={{ opacity: 0, transition: { duration: motionTokens.duration.instant } }}
          transition={reduce ? { duration: 0, opacity: { duration: motionTokens.duration.instant } } : { y: { ...motionTokens.spring.smooth, delay: 0.06 }, opacity: { duration: 0.28, delay: 0.06 }, filter: { duration: 0.28, delay: 0.06 } }}
        >
          <ul className={styles.details}>{entry.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
          {entry.media && <EntryMedia media={entry.media} />}
        </motion.div>
      </motion.div>}
    </AnimatePresence>
  </motion.li>;
}

export interface ChangelogFeedProps {
  /** Release notes, newest first. Each entry belongs to one of `months` by key. */
  entries?: ChangelogEntry[];
  /** Months shown in the month bar, newest first. */
  months?: ChangelogMonth[];
  title?: string;
  /** One line under the title, such as the latest release. */
  subtitle?: string;
  /** Closing line at the end of the list. */
  endNote?: string;
  /** Entry ids open on first render. Defaults to the newest entry. */
  defaultOpen?: string[];
  className?: string;
}

export function ChangelogFeed({
  entries = exampleEntries,
  months = exampleMonths,
  title = "Changelog",
  subtitle = "Halden 4.12 shipped on September 18, 2026",
  endNote = "That is everything since Halden 4.5 in June.",
  defaultOpen,
  className,
}: ChangelogFeedProps = {}) {
  const uid = useId();
  const totalCount = entries.length;
  const kindCounts = useMemo(() => kinds.reduce<Record<Kind, number>>((counts, kind) => ({ ...counts, [kind.id]: entries.filter((entry) => entry.kind === kind.id).length }), { new: 0, improved: 0, fixed: 0 }), [entries]);
  const monthOrder = useCallback((key: string) => months.findIndex((month) => month.key === key), [months]);
  const reduce = useReducedMotion() ?? false;
  const [filters, setFilters] = useState<Kind[]>([]);
  const [open, setOpen] = useState<string[]>(() => defaultOpen ?? (entries[0] ? [entries[0].id] : []));
  const [active, setActive] = useState({ key: months[0].key, direction: 1 });
  const scrollRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const groupRefs = useRef(new Map<string, HTMLElement>());
  const frame = useRef(0);

  const visible = useMemo(() => entries.filter((entry) => filters.length === 0 || filters.includes(entry.kind)), [entries, filters]);
  const groups = useMemo(() => months.map((month) => ({ ...month, items: visible.filter((entry) => entry.month === month.key) })).filter((group) => group.items.length > 0), [months, visible]);
  const current = groups.find((group) => group.key === active.key) ?? groups[0];

  const sync = useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller || groups.length === 0) return;
    const line = scroller.getBoundingClientRect().top + 28;
    let key = groups[0].key;
    for (const group of groups) {
      const element = groupRefs.current.get(group.key);
      if (element && element.getBoundingClientRect().top <= line) key = group.key;
    }
    if (scroller.scrollTop > 0 && scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2) key = groups[groups.length - 1].key;
    setActive((previous) => previous.key === key ? previous : { key, direction: monthOrder(key) > monthOrder(previous.key) ? 1 : -1 });
  }, [groups, monthOrder]);

  const onScroll = useCallback(() => {
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => { frame.current = 0; sync(); });
  }, [sync]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const observer = new ResizeObserver(() => onScroll());
    observer.observe(list);
    return () => observer.disconnect();
  }, [onScroll]);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  function toggleFilter(kind: Kind) { setFilters((previous) => previous.includes(kind) ? previous.filter((item) => item !== kind) : [...previous, kind]); }
  function toggleEntry(id: string) { setOpen((previous) => previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]); }
  function jumpTo(key: string) {
    const scroller = scrollRef.current;
    const element = groupRefs.current.get(key);
    if (!scroller || !element) return;
    const top = scroller.scrollTop + element.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
    scroller.scrollTo({ top: Math.max(0, top - 1), behavior: reduce ? "auto" : "smooth" });
  }

  const shownLabel = filters.length === 0 ? `${totalCount} updates` : `${visible.length} of ${totalCount} updates`;
  const layout: Transition = reduce ? instant : motionTokens.spring.smooth;

  return <section className={[styles.feed, className].filter(Boolean).join(" ")} aria-labelledby={`${uid}-title`}>
    <header className={styles.header}>
      <div className={styles.heading}>
        <h2 id={`${uid}-title`}>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <SubscribeControl reduce={reduce} />
    </header>

    <div className={styles.toolbar}>
      <div className={styles.chips} role="group" aria-label="Filter by type">
        {kinds.map((kind) => {
          const on = filters.includes(kind.id);
          return <button key={kind.id} type="button" className={styles.chip} data-kind={kind.id} aria-pressed={on} onClick={() => toggleFilter(kind.id)}>
            <motion.span className={styles.chipMark} aria-hidden="true" initial={false} animate={{ width: on ? 16 : 7, height: on ? 16 : 7 }} transition={reduce ? instant : motionTokens.spring.morph}>
              <motion.span className={styles.chipTick} initial={false} animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.4 }} transition={reduce ? instant : { ...motionTokens.spring.snappy, delay: on ? 0.05 : 0 }}><Check size={11} strokeWidth={2.6} /></motion.span>
            </motion.span>
            <span>{kind.label}</span>
            <span className={styles.chipCount}>{kindCounts[kind.id]}</span>
          </button>;
        })}
        <AnimatePresence initial={false}>
          {filters.length > 0 && <motion.button key="clear" type="button" className={styles.clear} onClick={() => setFilters([])} initial={{ opacity: 0, x: -6, filter: blurSubtle }} animate={{ opacity: 1, x: 0, filter: none }} exit={{ opacity: 0, x: -4, filter: blurSubtle, transition: { duration: motionTokens.duration.instant } }} transition={reduce ? instant : motionTokens.spring.snappy}>Show all</motion.button>}
        </AnimatePresence>
      </div>
      <p className={styles.shown} aria-hidden="true">
        <RollingNumber value={visible.length} reduce={reduce} />
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={filters.length === 0 ? "all" : "some"} initial={{ opacity: 0, filter: blurSubtle }} animate={{ opacity: 1, filter: none }} exit={{ opacity: 0, transition: { duration: motionTokens.duration.instant } }} transition={reduce ? instant : { duration: motionTokens.duration.standard }}>{filters.length === 0 ? "updates" : `of ${totalCount} updates`}</motion.span>
        </AnimatePresence>
      </p>
      <p className={styles.srOnly} role="status" aria-live="polite">{`Showing ${shownLabel}`}</p>
    </div>

    <div className={styles.monthBar}>
      <div className={styles.monthLabel} aria-hidden="true">
        <span className={styles.monthText}>
          <AnimatePresence mode="popLayout" initial={false} custom={active.direction}>
            <motion.span key={current?.key ?? "none"} custom={active.direction} variants={rise} initial="enter" animate="center" exit="exit" transition={reduce ? instant : motionTokens.spring.morph}>{current ? <>{current.label.split(" ")[0]}<span className={styles.monthYear}> {current.label.split(" ")[1]}</span></> : "No updates"}</motion.span>
          </AnimatePresence>
        </span>
        <span className={styles.monthCount}><RollingNumber value={current?.items.length ?? 0} reduce={reduce} />{current?.items.length === 1 ? "update" : "updates"}</span>
      </div>
      <nav className={styles.monthNav} aria-label="Jump to month">
        {groups.map((group) => {
          const selected = group.key === current?.key;
          return <button key={group.key} type="button" aria-label={`Jump to ${group.label}`} aria-current={selected ? "true" : undefined} onClick={() => jumpTo(group.key)}>
            {selected && <motion.span layoutId={`${uid}-month`} className={styles.monthPill} transition={reduce ? instant : motionTokens.spring.morph} />}
            <span className={styles.monthShort}>{group.short}</span>
          </button>;
        })}
      </nav>
    </div>

    <motion.div layoutScroll ref={scrollRef} className={styles.scroller} onScroll={onScroll} tabIndex={0} aria-label="Release notes">
      <div ref={listRef} className={styles.list}>
        <AnimatePresence mode="popLayout" initial={false}>
          {groups.map((group, index) => <motion.section
            key={group.key}
            layout="position"
            className={styles.group}
            aria-labelledby={`${uid}-${group.key}`}
            ref={(element: HTMLElement | null) => { if (element) groupRefs.current.set(group.key, element); else groupRefs.current.delete(group.key); }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: motionTokens.duration.exit } }}
            transition={{ layout, opacity: { duration: reduce ? motionTokens.duration.instant : motionTokens.duration.standard } }}
          >
            <h3 id={`${uid}-${group.key}`} className={index === 0 ? styles.srOnly : styles.groupTitle}>{group.label}</h3>
            <ul className={styles.entries}>
              <AnimatePresence mode="popLayout" initial={false}>
                {group.items.map((entry) => <EntryRow key={entry.id} entry={entry} open={open.includes(entry.id)} onToggle={() => toggleEntry(entry.id)} reduce={reduce} />)}
              </AnimatePresence>
            </ul>
          </motion.section>)}
        </AnimatePresence>
        <motion.p layout="position" transition={{ layout }} className={styles.endCap}>{endNote}</motion.p>
      </div>
    </motion.div>
  </section>;
}

export default ChangelogFeed;
