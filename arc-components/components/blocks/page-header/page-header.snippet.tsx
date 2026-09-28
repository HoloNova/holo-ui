"use client";

import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import type { FocusEvent, ReactNode, UIEvent } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion, type Transition, type Variants } from "motion/react";
import { Archive, ArchiveRestore, Bell, BellOff, BellRing, CalendarDays, Check, ChevronRight, Circle, CircleAlert, CircleCheck, CircleDashed, Ellipsis, FileSpreadsheet, FileText, Film, Link2, Megaphone, PenTool, Plus, Presentation, type LucideIcon } from "lucide-react";
import { Fragment, useEffect, useId, useRef, useState } from "react";

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
const ARC_PAGE_HEADER_STYLES = `/* The frame is the page: a fixed header over a scrolling body. Breakpoints follow the frame width, not the viewport. */
.arc-page-header-frame { --pad: 28px; position: relative; display: flex; width: min(100%, 980px); height: 640px; min-width: 0; flex-direction: column; margin-inline: auto; overflow: hidden; border: 1px solid var(--border); border-radius: 16px; background: var(--surface); color: var(--foreground); font-family: var(--font-body); font-size: var(--text-sm); letter-spacing: var(--tracking-body); line-height: var(--leading-body); container: page-header / inline-size; }

.arc-page-header-header { position: relative; z-index: 1; flex: none; padding: 16px var(--pad) 0; background: var(--surface); box-shadow: inset 0 -1px 0 var(--border); }
.arc-page-header-bar { display: grid; min-height: var(--control-height-sm); grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 16px; }
/* Breadcrumbs and the compact title share one cell and trade places when the header condenses. */
.arc-page-header-lead { display: grid; min-width: 0; align-items: center; }
.arc-page-header-lead > * { grid-area: 1 / 1; min-width: 0; }

.arc-page-header-crumbs ol { display: flex; min-width: 0; align-items: center; gap: 6px; margin: 0; padding: 0; list-style: none; }
.arc-page-header-crumbs li { display: inline-flex; flex: none; align-items: center; gap: 6px; color: var(--text-muted); white-space: nowrap; }
.arc-page-header-crumbs li:last-child { flex: 0 1 auto; min-width: 0; }
.arc-page-header-crumbs li > svg { flex: none; color: var(--border-strong); }
.arc-page-header-crumb { margin: 0; border: 0; border-radius: 8px; padding: 4px 2px; background: none; color: var(--text-muted); font: inherit; letter-spacing: inherit; cursor: pointer; transition: color var(--duration-fast) var(--ease-standard); }
.arc-page-header-current { display: block; min-width: 0; overflow: hidden; color: var(--text-secondary); text-overflow: ellipsis; }

.arc-page-header-compact { display: inline-flex; max-width: calc(100% + 8px); justify-self: start; align-items: center; gap: 10px; margin-left: -8px; border: 0; border-radius: 8px; padding: 5px 8px; background: transparent; color: var(--foreground); font: inherit; letter-spacing: inherit; text-align: left; cursor: pointer; transition: background-color var(--duration-fast) var(--ease-standard); }
.arc-page-header-compactTitle { min-width: 0; overflow: hidden; font-size: var(--text-base); font-weight: 500; text-overflow: ellipsis; white-space: nowrap; }
.arc-page-header-compactBadge { flex: none; }
.arc-page-header-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

/* Secondary actions fold to the right, under the overflow button, as their slot narrows. Only the right edge clips. */
.arc-page-header-actions { display: flex; align-items: center; justify-content: flex-end; }
.arc-page-header-secondary { display: flex; flex: none; clip-path: inset(-8px 0 -8px -8px); }
.arc-page-header-secondaryInner { display: flex; flex: none; gap: 8px; padding-right: 8px; }
.arc-page-header-trailing { display: flex; flex: none; align-items: center; gap: 8px; }
.arc-page-header-actions .arc-page-header-iconButton { width: var(--control-height-sm); padding-inline: 0; }

.arc-page-header-intro { overflow: clip; }
.arc-page-header-introInner { display: grid; justify-items: start; gap: 10px; padding: 18px 0 20px; }
.arc-page-header-titleRow { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px; transform-origin: 0 0; }
.arc-page-header-title { margin: 0; font-family: var(--font-display); font-size: var(--text-3xl); font-weight: 500; letter-spacing: var(--tracking-display); line-height: var(--leading-display); }
.arc-page-header-title:focus { outline: none; }
.arc-page-header-details { display: grid; justify-items: start; gap: 14px; }
.arc-page-header-description { max-width: 60ch; margin: 0; color: var(--text-secondary); text-wrap: pretty; }
.arc-page-header-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 18px; color: var(--text-muted); font-size: var(--text-xs); }
.arc-page-header-metaIcon { display: inline-flex; align-items: center; gap: 6px; }
.arc-page-header-meta strong { color: var(--text-secondary); font-weight: 500; }

/* Tabs bleed to the frame edges so the rule under them spans the page; the first label lines up with the title. */
.arc-page-header-tabs { position: relative; display: flex; gap: 2px; margin: 2px calc(var(--pad) * -1) 0; padding: 0 calc(var(--pad) - 10px); overflow-x: auto; overscroll-behavior-x: contain; scrollbar-width: none; }
.arc-page-header-tabs::-webkit-scrollbar { display: none; }
.arc-page-header-tab { position: relative; display: inline-flex; height: 44px; flex: none; align-items: center; gap: 6px; border: 0; padding: 0 10px; background: none; color: var(--text-secondary); font: inherit; font-weight: 500; letter-spacing: inherit; white-space: nowrap; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: color var(--duration-fast) var(--ease-standard); }
.arc-page-header-tab::before { position: absolute; inset: 8px 0; border-radius: 8px; background: color-mix(in oklch, var(--foreground) 4.5%, transparent); content: ""; opacity: 0; transition: opacity var(--duration-fast) var(--ease-standard); }
.arc-page-header-tab[data-state="active"] { color: var(--foreground); }
.arc-page-header-tabLabel, .arc-page-header-count { position: relative; }
.arc-page-header-count { color: var(--text-muted); font-variant-numeric: tabular-nums; }
.arc-page-header-tab[data-state="active"] .arc-page-header-count { color: var(--text-secondary); }
/* The shared counter renders at display size by default; here it takes the tab's type. */
.arc-page-header-count > span { color: inherit; font-family: inherit; font-size: inherit; font-weight: inherit; letter-spacing: inherit; line-height: inherit; }
.arc-page-header-indicator { position: absolute; right: 10px; bottom: 0; left: 10px; height: 2px; border-radius: 2px 2px 0 0; background: var(--accent); }

.arc-page-header-scroller { position: relative; flex: 1 1 auto; min-height: 0; overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain; padding: 28px var(--pad) 84px; scrollbar-color: var(--border-strong) transparent; scrollbar-width: thin; }
/* Every panel is taller than the condensed viewport, so condensing never clamps the scroll back to the top. */
.arc-page-header-panel { min-height: 600px; }
.arc-page-header-sectionTitle { margin: 0 0 8px; font-size: var(--text-sm); font-weight: 500; }
.arc-page-header-note { color: var(--text-muted); font-size: var(--text-xs); font-variant-numeric: tabular-nums; white-space: nowrap; }

.arc-page-header-overview { display: grid; gap: 36px; }
.arc-page-header-progress { max-width: 480px; }
.arc-page-header-milestones, .arc-page-header-activity, .arc-page-header-issues, .arc-page-header-updates, .arc-page-header-files { margin: 0; padding: 0; list-style: none; }
.arc-page-header-milestones li { display: grid; min-height: 48px; grid-template-columns: 16px minmax(0, 1fr) auto; align-items: center; gap: 2px 12px; border-bottom: 1px solid var(--border-subtle); }
.arc-page-header-milestones li:last-child, .arc-page-header-activity li:last-child, .arc-page-header-files li:last-child { border-bottom: 0; }
.arc-page-header-milestones li > svg { color: var(--text-muted); }
.arc-page-header-milestones li[data-state="done"] > svg { color: var(--success); }
.arc-page-header-milestones li[data-state="active"] > svg { color: var(--accent); }
.arc-page-header-activity li { display: grid; min-height: 52px; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 12px; border-bottom: 1px solid var(--border-subtle); }
.arc-page-header-activity p { margin: 0; color: var(--text-secondary); }
.arc-page-header-activity strong { color: var(--foreground); font-weight: 500; }

.arc-page-header-issue, .arc-page-header-update { overflow-x: visible; overflow-y: clip; border-bottom: 1px solid var(--border-subtle); }
.arc-page-header-issue:last-child, .arc-page-header-update:last-child { border-bottom-color: transparent; }
.arc-page-header-issueInner { position: relative; isolation: isolate; display: grid; min-height: 52px; grid-template-columns: 32px minmax(0, 1fr) auto auto; align-items: center; gap: 12px; margin-inline: -10px; padding: 4px 10px; }
.arc-page-header-check { position: relative; display: grid; width: 32px; height: 32px; place-items: center; margin-left: -7px; border: 0; border-radius: 50%; padding: 0; background: none; color: var(--text-muted); cursor: pointer; transition: color var(--duration-fast) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard); }
.arc-page-header-checkGlyph { display: grid; place-items: center; }
.arc-page-header-issue[data-closing] .arc-page-header-check { color: var(--success); cursor: default; }
.arc-page-header-issueText { display: flex; min-width: 0; align-items: baseline; gap: 12px; }
.arc-page-header-issueId { flex: none; min-width: 60px; color: var(--text-muted); font-size: var(--text-xs); }
.arc-page-header-issueTitle { min-width: 0; overflow: hidden; text-decoration: line-through transparent; text-overflow: ellipsis; white-space: nowrap; transition: color var(--duration-standard) var(--ease-standard), text-decoration-color var(--duration-standard) var(--ease-standard); }
.arc-page-header-issue[data-closing] .arc-page-header-issueTitle { color: var(--text-muted); text-decoration-color: currentColor; }
.arc-page-header-issueLabel { color: var(--text-muted); font-size: var(--text-xs); }
/* A new row arrives lit and settles to the page, so it is easy to find without a lasting marker. */
.arc-page-header-issue[data-fresh] .arc-page-header-issueInner::before, .arc-page-header-update[data-fresh] .arc-page-header-updateInner::before { position: absolute; z-index: -1; inset: 3px 0; border-radius: 10px; background: color-mix(in oklch, var(--foreground) 6%, transparent); content: ""; animation: arrived 1.8s var(--ease-standard) both; }
@keyframes arrived { 0%, 35% { opacity: 1; } 100% { opacity: 0; } }

.arc-page-header-updateInner { position: relative; isolation: isolate; display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 14px; margin-inline: -10px; padding: 18px 10px; }
.arc-page-header-updateHead { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 10px; min-height: 22px; }
.arc-page-header-author { font-weight: 500; }
.arc-page-header-updateInner p { max-width: 64ch; margin: 6px 0 0; color: var(--text-secondary); text-wrap: pretty; }

.arc-page-header-files li { display: grid; min-height: 56px; grid-template-columns: 16px minmax(0, 1fr) auto 52px; align-items: center; gap: 14px; border-bottom: 1px solid var(--border-subtle); }
.arc-page-header-files li > svg { color: var(--text-secondary); }
.arc-page-header-fileName { display: grid; min-width: 0; }
.arc-page-header-fileName > span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.arc-page-header-fileDate { color: var(--text-muted); font-size: var(--text-xs); text-align: right; white-space: nowrap; }

.arc-page-header-empty { display: grid; justify-items: center; gap: 4px; padding: 72px 16px; text-align: center; }
.arc-page-header-empty > svg { margin-bottom: 8px; color: var(--success); }
.arc-page-header-empty p { margin: 0; font-size: var(--text-base); font-weight: 500; }
.arc-page-header-empty span { color: var(--text-muted); }
.arc-page-header-empty button { margin-top: 14px; }

.arc-page-header-toastLayer { position: absolute; z-index: 3; right: 16px; bottom: 16px; left: 16px; display: flex; justify-content: center; pointer-events: none; }
.arc-page-header-toast { display: inline-flex; max-width: 100%; align-items: center; gap: 8px; border: 1px solid var(--border); border-radius: var(--radius-control); padding: 9px 14px; background: var(--surface-raised); box-shadow: var(--shadow-floating); color: var(--foreground); font-size: var(--text-sm); }
.arc-page-header-toast > svg { flex: none; color: var(--text-secondary); }
.arc-page-header-toast[data-tone="success"] > svg { color: var(--success); }
.arc-page-header-toast[data-tone="error"] > svg { color: var(--danger); }
.arc-page-header-srOnly { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

/* The menu grows from the overflow button. Transitions, not keyframes, so a quick reopen reverses from where it is. */
.arc-page-header-menu { --menu-y: -5px; position: relative; z-index: 60; min-width: 13rem; border: 1px solid var(--border); border-radius: var(--radius-panel); padding: 5px; background: var(--surface-raised); box-shadow: var(--shadow-floating); color: var(--foreground); font-family: var(--font-body); font-size: var(--text-sm); letter-spacing: var(--tracking-body); transform-origin: var(--radix-dropdown-menu-content-transform-origin); transition: opacity var(--duration-fast) var(--ease-enter), transform var(--duration-spring) var(--ease-spring); }
.arc-page-header-menu[data-side="top"] { --menu-y: 5px; }
@starting-style { .arc-page-header-menu[data-state="open"] { opacity: 0; transform: translateY(var(--menu-y)) scale(.97); } }
.arc-page-header-menu[data-state="closed"] { opacity: 0; transform: translateY(calc(var(--menu-y) * .5)) scale(.985); transition: opacity 130ms var(--ease-standard), transform 130ms var(--ease-standard); animation: menu-exit 130ms linear both; pointer-events: none; }
@keyframes menu-exit { to { --menu-exit: 1; } }
.arc-page-header-highlight { position: absolute; top: 0; right: 5px; left: 5px; border-radius: calc(var(--radius-panel) - 6px); background: var(--surface-muted); opacity: 0; pointer-events: none; }
.arc-page-header-item { position: relative; display: flex; min-height: 36px; align-items: center; gap: 10px; border-radius: calc(var(--radius-panel) - 6px); padding: 0 11px; outline: none; cursor: pointer; user-select: none; }
.arc-page-header-item > svg { flex: none; color: var(--text-secondary); }
.arc-page-header-item[data-disabled] { opacity: .45; cursor: default; }
.arc-page-header-separator { height: 1px; margin: 4px -5px; background: var(--border-subtle); }

@media (hover: hover) and (pointer: fine) {
  .arc-page-header-crumb:hover { color: var(--foreground); }
  .arc-page-header-compact:hover { background: color-mix(in oklch, var(--foreground) 4.5%, transparent); }
  .arc-page-header-tab:hover { color: var(--foreground); }
  .arc-page-header-tab:hover::before { opacity: 1; }
  .arc-page-header-check:hover { background: color-mix(in oklch, var(--foreground) 5%, transparent); color: var(--foreground); }
  .arc-page-header-issue[data-closing] .arc-page-header-check:hover { background: none; color: var(--success); }
}

/* Before the first measurement, narrow frames already hide the actions that will fold, so nothing flashes on load. */
@container page-header (max-width: 719px) { .arc-page-header-frame:not([data-measured]) .arc-page-header-secondary { width: 0 !important; opacity: 0 !important; } }
@container page-header (max-width: 559px) {
  .arc-page-header-header, .arc-page-header-scroller { --pad: 18px; }
  .arc-page-header-crumbs .arc-page-header-rootCrumb, .arc-page-header-compact .arc-page-header-compactBadge { display: none; }
  /* The tab row scrolls sideways here; its far edge fades so the next tab reads as more to come. */
  .arc-page-header-tabs { padding-right: calc(var(--pad) + 14px); mask-image: linear-gradient(to right, #000 calc(100% - 28px), transparent); }
  .arc-page-header-milestones li { grid-template-columns: 16px minmax(0, 1fr); padding-block: 10px; }
  .arc-page-header-milestones li > .arc-page-header-note { grid-column: 2; }
  .arc-page-header-title { font-size: var(--text-2xl); }
  .arc-page-header-introInner { padding-top: 16px; }
  .arc-page-header-issueInner { grid-template-columns: 32px minmax(0, 1fr) auto; align-items: start; padding-block: 10px; }
  .arc-page-header-issueInner .arc-page-header-check { margin-top: -6px; }
  .arc-page-header-issueText { display: grid; gap: 2px; }
  .arc-page-header-issueTitle { overflow: visible; white-space: normal; }
  .arc-page-header-issueLabel, .arc-page-header-fileDate { display: none; }
  .arc-page-header-files li { grid-template-columns: 16px minmax(0, 1fr) auto; }
  .arc-page-header-activity li { grid-template-columns: auto minmax(0, 1fr); padding-block: 10px; }
  .arc-page-header-activity li > .arc-page-header-note { grid-column: 2; margin-top: -8px; }
}
@container page-header (max-width: 459px) {
  .arc-page-header-createText { display: none; }
  .arc-page-header-actions .arc-page-header-create { width: var(--control-height-sm); padding-inline: 0; }
}
/* On a phone the frame is the screen, so it takes most of it rather than stopping short with the body cut mid list. */
@media (max-width: 560px) { .arc-page-header-frame { height: clamp(560px, calc(100svh - 48px), 760px); border-radius: 14px; } }

@media (prefers-reduced-motion: reduce) {
  .arc-page-header-crumb, .arc-page-header-compact, .arc-page-header-tab, .arc-page-header-tab::before, .arc-page-header-check, .arc-page-header-issueTitle { transition: none; }
  .arc-page-header-menu, .arc-page-header-menu[data-state="closed"] { transform: none; transition: opacity var(--duration-instant) linear; }
}
`;

const styles: Record<string, string> = new Proxy({
  "actions": "arc-page-header-actions",
  "activity": "arc-page-header-activity",
  "author": "arc-page-header-author",
  "bar": "arc-page-header-bar",
  "check": "arc-page-header-check",
  "checkGlyph": "arc-page-header-checkGlyph",
  "compact": "arc-page-header-compact",
  "compactBadge": "arc-page-header-compactBadge",
  "compactTitle": "arc-page-header-compactTitle",
  "count": "arc-page-header-count",
  "create": "arc-page-header-create",
  "createText": "arc-page-header-createText",
  "crumb": "arc-page-header-crumb",
  "crumbs": "arc-page-header-crumbs",
  "current": "arc-page-header-current",
  "description": "arc-page-header-description",
  "details": "arc-page-header-details",
  "dot": "arc-page-header-dot",
  "empty": "arc-page-header-empty",
  "fileDate": "arc-page-header-fileDate",
  "fileName": "arc-page-header-fileName",
  "files": "arc-page-header-files",
  "frame": "arc-page-header-frame",
  "header": "arc-page-header-header",
  "highlight": "arc-page-header-highlight",
  "iconButton": "arc-page-header-iconButton",
  "indicator": "arc-page-header-indicator",
  "intro": "arc-page-header-intro",
  "introInner": "arc-page-header-introInner",
  "issue": "arc-page-header-issue",
  "issueId": "arc-page-header-issueId",
  "issueInner": "arc-page-header-issueInner",
  "issueLabel": "arc-page-header-issueLabel",
  "issueText": "arc-page-header-issueText",
  "issueTitle": "arc-page-header-issueTitle",
  "issues": "arc-page-header-issues",
  "item": "arc-page-header-item",
  "lead": "arc-page-header-lead",
  "menu": "arc-page-header-menu",
  "meta": "arc-page-header-meta",
  "metaIcon": "arc-page-header-metaIcon",
  "milestones": "arc-page-header-milestones",
  "note": "arc-page-header-note",
  "overview": "arc-page-header-overview",
  "panel": "arc-page-header-panel",
  "progress": "arc-page-header-progress",
  "rootCrumb": "arc-page-header-rootCrumb",
  "scroller": "arc-page-header-scroller",
  "secondary": "arc-page-header-secondary",
  "secondaryInner": "arc-page-header-secondaryInner",
  "sectionTitle": "arc-page-header-sectionTitle",
  "separator": "arc-page-header-separator",
  "srOnly": "arc-page-header-srOnly",
  "tab": "arc-page-header-tab",
  "tabLabel": "arc-page-header-tabLabel",
  "tabs": "arc-page-header-tabs",
  "title": "arc-page-header-title",
  "titleRow": "arc-page-header-titleRow",
  "toast": "arc-page-header-toast",
  "toastLayer": "arc-page-header-toastLayer",
  "trailing": "arc-page-header-trailing",
  "update": "arc-page-header-update",
  "updateHead": "arc-page-header-updateHead",
  "updateInner": "arc-page-header-updateInner",
  "updates": "arc-page-header-updates"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-page-header-${prop}`,
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



/** The header condenses past CONDENSE_AT and only opens again near the top, so it never flickers at the threshold. */
const CONDENSE_AT = 16;
const EXPAND_AT = 4;
/** Secondary actions fold into the overflow menu when the breadcrumbs would get less room than this, and return with a little slack. */
const LEAD_MIN = 240;
const LEAD_RETURN = 272;
const DONE_AT_START = 31;
const PROJECT_URL = "https://northline.example/projects/checkout-redesign";

type PersonId = "emma" | "marcus" | "ava" | "sofia" | "jasmine";
const people: Record<PersonId, { name: string; src: string }> = {
  emma: { name: "Emma Collins", src: "/media/people/emma-collins.jpg" },
  marcus: { name: "Marcus Johnson", src: "/media/people/marcus-johnson.jpg" },
  ava: { name: "Ava Mitchell", src: "/media/people/ava-mitchell.jpg" },
  sofia: { name: "Sofia Ramirez", src: "/media/people/sofia-ramirez.jpg" },
  jasmine: { name: "Jasmine Brooks", src: "/media/people/jasmine-brooks.jpg" },
};
const members = (["emma", "marcus", "ava", "sofia", "jasmine"] as const).map(key => people[key]);

type Section = "overview" | "issues" | "updates" | "files";
const sections: { value: Section; label: string }[] = [{ value: "overview", label: "Overview" }, { value: "issues", label: "Issues" }, { value: "updates", label: "Updates" }, { value: "files", label: "Files" }];
const order = (section: Section) => sections.findIndex(item => item.value === section);

type Issue = { id: string; title: string; owner: PersonId; label: string; fresh?: boolean };
const startingIssues: Issue[] = [
  { id: "CHK-138", title: "Saved card list clips the expiry date on small screens", owner: "sofia", label: "Bug" },
  { id: "CHK-136", title: "Add an edit link beside each section of the review step", owner: "emma", label: "Design" },
  { id: "CHK-135", title: "Wallet sheet opens twice after a failed card check", owner: "marcus", label: "Bug" },
  { id: "CHK-133", title: "Show the delivery estimate before payment", owner: "ava", label: "Research" },
  { id: "CHK-131", title: "Promo code field loses focus after an invalid code", owner: "sofia", label: "Bug" },
  { id: "CHK-129", title: "Track drop-off between review and pay", owner: "ava", label: "Analytics" },
  { id: "CHK-127", title: "Preselect the last used card for returning customers", owner: "marcus", label: "Feature" },
  { id: "CHK-124", title: "Write clearer copy for declined cards", owner: "emma", label: "Content" },
  { id: "CHK-122", title: "Address autocomplete drops apartment numbers", owner: "sofia", label: "Bug" },
];
const draftIssues = ["Keyboard focus skips the save card checkbox", "Recalculate tax when the shipping country changes", "Pay button needs a pressed and loading state", "Review totals wrap awkwardly at large text sizes"];

type Update = { id: string; author: PersonId; date: string; tone: "success" | "warning"; status: string; body: string; fresh?: boolean };
const startingUpdates: Update[] = [
  { id: "u4", author: "emma", date: "Sep 19", tone: "success", status: "On track", body: "Saved payment methods reached every iOS customer on Thursday. Returning customers now finish checkout 3.1 points more often. The review step is next." },
  { id: "u3", author: "ava", date: "Sep 12", tone: "success", status: "On track", body: "Five usability sessions are done. People trust a single review step as long as the total stays visible while they edit." },
  { id: "u2", author: "marcus", date: "Sep 5", tone: "warning", status: "At risk", body: "Card tokenization is waiting on the payments team. We moved the review step ahead so the October date can hold." },
  { id: "u1", author: "emma", date: "Aug 29", tone: "success", status: "On track", body: "Kickoff. Scope is saved cards, one review step, and a staged rollout starting October 14." },
];
const draftUpdates = ["The review step is in staging behind a flag. If error rates hold through Friday, we open it to 10% of traffic on Monday.", "Declined card copy is final and with support for review. No change to the October 14 rollout."];

const files: { name: string; kind: string; size: string; owner: PersonId; date: string; icon: LucideIcon }[] = [
  { name: "Checkout flows v3", kind: "Design file", size: "18.4 MB", owner: "emma", date: "Sep 20", icon: PenTool },
  { name: "Review step walkthrough", kind: "Video", size: "46 MB", owner: "emma", date: "Sep 18", icon: Film },
  { name: "Payments API notes", kind: "Document", size: "96 KB", owner: "marcus", date: "Sep 16", icon: FileText },
  { name: "Usability findings, round two", kind: "PDF", size: "2.1 MB", owner: "ava", date: "Sep 13", icon: FileText },
  { name: "Rollout plan", kind: "Slides", size: "4.8 MB", owner: "sofia", date: "Sep 11", icon: Presentation },
  { name: "Conversion baseline", kind: "Spreadsheet", size: "640 KB", owner: "ava", date: "Sep 9", icon: FileSpreadsheet },
  { name: "Empty and error states", kind: "Design file", size: "9.2 MB", owner: "emma", date: "Sep 6", icon: PenTool },
  { name: "Launch checklist", kind: "Document", size: "54 KB", owner: "sofia", date: "Sep 2", icon: FileText },
];

const milestoneIcons = { done: CircleCheck, active: CircleDashed, planned: Circle };
const milestones: { name: string; note: string; state: keyof typeof milestoneIcons }[] = [
  { name: "Saved payment methods", note: "Shipped Sep 18", state: "done" },
  { name: "Single review step", note: "In progress, due Oct 1", state: "active" },
  { name: "Staged rollout", note: "Planned for Oct 14", state: "planned" },
];
const activity: { who: PersonId; text: string; time: string }[] = [
  { who: "ava", text: "moved CHK-131 to review", time: "1h ago" },
  { who: "marcus", text: "merged the saved cards endpoint", time: "3h ago" },
  { who: "emma", text: "shared Checkout flows v3", time: "Yesterday" },
  { who: "sofia", text: "closed CHK-119, a double charge on retry", time: "Yesterday" },
  { who: "jasmine", text: "set the rollout date to October 14", time: "Sep 17" },
];

type Notice = { key: number; text: string; tone: "success" | "error" | "neutral" };
type MenuAction = { key: string; label: string; icon: ReactNode; onSelect: () => void; disabled?: boolean; separatorBefore?: boolean };

const still: Transition = { duration: 0 };
const quick: Transition = { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] };
const blur = (px: number) => `blur(${px}px)`;
const icon = { size: 16, strokeWidth: 1.75, "aria-hidden": true } as const;

/** Panels slide a few pixels in the direction of the tab that was chosen. */
const panelSlide: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 12 }),
  center: { opacity: 1, x: 0, transition: { x: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] } } },
  exit: (direction: number) => ({ opacity: 0, x: direction * -8, transition: { duration: motionTokens.duration.instant, ease: [...motionTokens.ease.standard] } }),
};
const panelFade: Variants = { enter: { opacity: 0, x: 0 }, center: { opacity: 1, x: 0, transition: { duration: motionTokens.duration.instant } }, exit: { opacity: 0, x: 0, transition: { duration: .1 } } };

/** Rows open and close their own height, so the list closes the gap instead of jumping. */
function rowMotion(reduce: boolean) {
  return reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: motionTokens.duration.instant } }
    : { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: "auto" }, exit: { opacity: 0, height: 0 }, transition: { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.standard] } } };
}

function StatusDot() {
  return <span className={styles.dot} />;
}

/** The overflow button never scales: it anchors the menu. A shared highlight glides between items under the pointer. */
function OverflowMenu({ actions, reduce }: { actions: MenuAction[]; reduce: boolean }) {
  const [highlight, setHighlight] = useState<{ top: number; height: number; glide: boolean } | null>(null);
  const pointer = useRef(false);
  const clearTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(clearTimer.current), []);
  function onFocus(event: FocusEvent<HTMLDivElement>) {
    const item = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[role="menuitem"]') : null;
    window.clearTimeout(clearTimer.current);
    if (!item) { clearTimer.current = window.setTimeout(() => setHighlight(null), pointer.current ? 70 : 0); return; }
    const glide = pointer.current;
    setHighlight(current => ({ top: item.offsetTop, height: item.offsetHeight, glide: glide && current !== null }));
  }
  return <DropdownPrimitive.Root onOpenChange={open => { if (open) { window.clearTimeout(clearTimer.current); setHighlight(null); } }}>
    <DropdownPrimitive.Trigger asChild><Button variant="secondary" size="sm" className={styles.iconButton} aria-label="More actions"><Ellipsis size={17} strokeWidth={1.75} aria-hidden="true" /></Button></DropdownPrimitive.Trigger>
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content className={styles.menu} align="end" sideOffset={6} collisionPadding={12} loop onFocus={onFocus} onPointerMoveCapture={() => { pointer.current = true; }} onKeyDownCapture={() => { pointer.current = false; }}>
        <motion.span className={styles.highlight} aria-hidden="true" initial={false} animate={highlight ? { y: highlight.top, height: highlight.height, opacity: 1 } : { opacity: 0 }} transition={{ default: highlight?.glide && !reduce ? motionTokens.spring.snappy : still, opacity: { duration: reduce ? 0 : .08 } }} />
        {actions.map(action => <Fragment key={action.key}>
          {action.separatorBefore && <DropdownPrimitive.Separator className={styles.separator} />}
          <DropdownPrimitive.Item className={styles.item} disabled={action.disabled} onSelect={action.onSelect}>{action.icon}{action.label}</DropdownPrimitive.Item>
        </Fragment>)}
      </DropdownPrimitive.Content>
    </DropdownPrimitive.Portal>
  </DropdownPrimitive.Root>;
}

function OverviewPanel({ done, open }: { done: number; open: number }) {
  const total = done + open;
  return <div className={styles.overview}>
    <div className={styles.progress}><Progress value={done} max={total} label={`${done} of ${total} issues done`} showValue /></div>
    <div>
      <h3 className={styles.sectionTitle}>Milestones</h3>
      <ol className={styles.milestones}>{milestones.map(item => {
        const Icon = milestoneIcons[item.state];
        return <li key={item.name} data-state={item.state}><Icon size={16} strokeWidth={1.75} aria-hidden="true" /><span className={styles.milestoneName}>{item.name}</span><span className={styles.note}>{item.note}</span></li>;
      })}</ol>
    </div>
    <div>
      <h3 className={styles.sectionTitle}>Recent activity</h3>
      <ul className={styles.activity}>{activity.map(item => <li key={`${item.who}-${item.text}`}><Avatar name={people[item.who].name} src={people[item.who].src} size="sm" /><p><strong>{people[item.who].name}</strong> {item.text}</p><span className={styles.note}>{item.time}</span></li>)}</ul>
    </div>
  </div>;
}

function IssuesPanel({ issues, closing, reduce, onComplete, onReset, register }: { issues: Issue[]; closing: string[]; reduce: boolean; onComplete: (issue: Issue) => void; onReset: () => void; register: (id: string, node: HTMLButtonElement | null) => void }) {
  const row = rowMotion(reduce);
  return <>
    <ul className={styles.issues} aria-label="Open issues">
      <AnimatePresence initial={false}>
        {issues.map(issue => {
          const isClosing = closing.includes(issue.id);
          const owner = people[issue.owner];
          return <motion.li key={issue.id} className={styles.issue} data-fresh={issue.fresh || undefined} data-closing={isClosing || undefined} {...row}>
            <div className={styles.issueInner}>
              <button ref={node => register(issue.id, node)} type="button" className={styles.check} aria-label={`Mark ${issue.id} done`} aria-disabled={isClosing || undefined} onClick={() => onComplete(issue)}>
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.span key={isClosing ? "done" : "open"} className={styles.checkGlyph} initial={reduce ? { opacity: 0 } : { opacity: 0, scale: .5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: reduce ? 1 : .5, transition: quick }} transition={reduce ? still : motionTokens.spring.snappy}>
                    {isClosing ? <CircleCheck size={18} strokeWidth={1.75} aria-hidden="true" /> : <Circle size={18} strokeWidth={1.75} aria-hidden="true" />}
                  </motion.span>
                </AnimatePresence>
              </button>
              <span className={styles.issueText}><span className={styles.issueId}>{issue.id}</span><span className={styles.issueTitle}>{issue.title}</span></span>
              <span className={styles.issueLabel}>{issue.label}</span>
              <Avatar name={owner.name} src={owner.src} size="sm" />
            </div>
          </motion.li>;
        })}
      </AnimatePresence>
    </ul>
    {issues.length === 0 && <motion.div className={styles.empty} initial={{ opacity: 0, y: reduce ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} transition={reduce ? { duration: motionTokens.duration.instant } : motionTokens.spring.smooth}>
      <CircleCheck size={24} strokeWidth={1.75} aria-hidden="true" />
      <p>No open issues</p>
      <span>Everything in this project is done.</span>
      <Button variant="secondary" size="sm" onClick={onReset}>Restore sample issues</Button>
    </motion.div>}
  </>;
}

function UpdatesPanel({ updates, reduce }: { updates: Update[]; reduce: boolean }) {
  const row = rowMotion(reduce);
  return <ol className={styles.updates} aria-label="Project updates">
    <AnimatePresence initial={false}>
      {updates.map(update => {
        const author = people[update.author];
        return <motion.li key={update.id} className={styles.update} data-fresh={update.fresh || undefined} {...row}>
          <article className={styles.updateInner}>
            <Avatar name={author.name} src={author.src} size="md" />
            <div>
              <div className={styles.updateHead}><span className={styles.author}>{author.name}</span><span className={styles.note}>{update.date}</span><Badge size="sm" tone={update.tone} icon={<StatusDot />}>{update.status}</Badge></div>
              <p>{update.body}</p>
            </div>
          </article>
        </motion.li>;
      })}
    </AnimatePresence>
  </ol>;
}

function FilesPanel() {
  return <ul className={styles.files} aria-label="Project files">{files.map(file => {
    const Icon = file.icon;
    const owner = people[file.owner];
    return <li key={file.name}><Icon size={16} strokeWidth={1.75} aria-hidden="true" /><span className={styles.fileName}><span>{file.name}</span><span className={styles.note}>{file.kind}, {file.size}</span></span><Avatar name={owner.name} src={owner.src} size="sm" /><span className={styles.fileDate}>{file.date}</span></li>;
  })}</ul>;
}

export function PageHeader() {
  const id = useId();
  const reduce = useReducedMotion() ?? false;
  const bar = useRef<HTMLDivElement>(null);
  const secondary = useRef<HTMLDivElement>(null);
  const trailing = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const tabList = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const toggles = useRef(new Map<string, HTMLButtonElement>());
  const timers = useRef(new Set<number>());
  const counters = useRef({ issue: 0, update: 0, notice: 0 });
  const [view, setView] = useState<{ section: Section; direction: number }>({ section: "overview", direction: 1 });
  const [condensed, setCondensed] = useState(false);
  const [layout, setLayout] = useState({ measured: false, collapsed: false, animate: false });
  const [following, setFollowing] = useState(false);
  const [archived, setArchived] = useState(false);
  const [sharing, setSharing] = useState<"idle" | "sending" | "sent">("idle");
  const [issues, setIssues] = useState(startingIssues);
  const [closing, setClosing] = useState<string[]>([]);
  const [done, setDone] = useState(DONE_AT_START);
  const [updates, setUpdates] = useState(startingUpdates);
  const [notice, setNotice] = useState<Notice | null>(null);

  // Only the header width is observed, so a label that grows (Follow to Following) never folds the button you just pressed.
  // The first measurement applies at once; later width changes fold the actions with a spring.
  useEffect(() => {
    const row = bar.current, folded = secondary.current, fixed = trailing.current;
    if (!row || !folded || !fixed || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const room = row.clientWidth - folded.offsetWidth - fixed.offsetWidth - 16;
      setLayout(current => {
        const collapsed = current.measured && current.collapsed ? room < LEAD_RETURN : room < LEAD_MIN;
        return current.measured && current.collapsed === collapsed ? current : { measured: true, collapsed, animate: current.measured };
      });
    });
    observer.observe(row);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(handle => window.clearTimeout(handle));
  }, []);

  useEffect(() => {
    if (!notice) return;
    const handle = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(handle);
  }, [notice]);

  // Keep the chosen tab in view when the list scrolls sideways on narrow screens.
  useEffect(() => {
    const list = tabList.current;
    const tab = list?.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
    if (!list || !tab) return;
    const start = tab.offsetLeft - 12;
    const end = tab.offsetLeft + tab.offsetWidth + 12 - list.clientWidth;
    const behavior = reduce ? "auto" : "smooth";
    if (list.scrollLeft > start) list.scrollTo({ left: start, behavior });
    else if (list.scrollLeft < end) list.scrollTo({ left: end, behavior });
  }, [view.section, reduce]);

  function later(run: () => void, delay: number) {
    const handle = window.setTimeout(() => { timers.current.delete(handle); run(); }, delay);
    timers.current.add(handle);
  }

  function notify(text: string, tone: Notice["tone"] = "success") {
    counters.current.notice += 1;
    setNotice({ key: counters.current.notice, text, tone });
  }

  /** Switching sections while condensed shows the top of the new panel and keeps the compact bar. */
  function selectSection(next: Section, reveal = false) {
    setView(current => current.section === next ? current : { section: next, direction: order(next) > order(current.section) ? 1 : -1 });
    const node = scroller.current;
    if (node && (reveal || next !== view.section) && node.scrollTop > CONDENSE_AT + 1) node.scrollTop = CONDENSE_AT + 1;
  }

  function onScroll(event: UIEvent<HTMLDivElement>) {
    const top = event.currentTarget.scrollTop;
    setCondensed(current => (current ? top > EXPAND_AT : top > CONDENSE_AT));
  }

  function backToTop() {
    scroller.current?.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    titleRef.current?.focus({ preventScroll: true });
  }

  function toggleFollow() {
    const next = !following;
    setFollowing(next);
    notify(next ? "Following Checkout redesign" : "Stopped following Checkout redesign", next ? "success" : "neutral");
  }

  function shareUpdate() {
    if (archived || sharing !== "idle") return;
    setSharing("sending");
    later(() => {
      const index = counters.current.update++;
      const key = `draft-${index}`;
      setUpdates(list => [{ id: key, author: "jasmine", date: "Just now", tone: "success", status: "On track", body: draftUpdates[index % draftUpdates.length], fresh: true }, ...list]);
      setSharing("sent");
      selectSection("updates", true);
      notify("Update shared with the project team");
      later(() => setSharing("idle"), 1800);
      later(() => setUpdates(list => list.map(item => item.id === key ? { ...item, fresh: false } : item)), 1800);
    }, 700);
  }

  function createIssue() {
    if (archived) return;
    const index = counters.current.issue++;
    const issue: Issue = { id: `CHK-${139 + index}`, title: draftIssues[index % draftIssues.length], owner: "jasmine", label: "Triage", fresh: true };
    setIssues(list => [issue, ...list]);
    selectSection("issues", true);
    notify(`${issue.id} created and assigned to you`);
    later(() => setIssues(list => list.map(item => item.id === issue.id ? { ...item, fresh: false } : item)), 1800);
  }

  function completeIssue(issue: Issue) {
    if (closing.includes(issue.id)) return;
    const index = issues.findIndex(item => item.id === issue.id);
    const remaining = issues.filter(item => item.id !== issue.id && !closing.includes(item.id));
    const neighbor = remaining[Math.min(index, remaining.length - 1)];
    setClosing(list => [...list, issue.id]);
    later(() => {
      const hadFocus = document.activeElement === toggles.current.get(issue.id);
      setIssues(list => list.filter(item => item.id !== issue.id));
      setClosing(list => list.filter(item => item !== issue.id));
      setDone(count => count + 1);
      notify(`${issue.id} marked done`);
      if (hadFocus) (neighbor ? toggles.current.get(neighbor.id) : scroller.current?.querySelector<HTMLElement>('[role="tabpanel"][data-state="active"]'))?.focus();
    }, 380);
  }

  function resetIssues() {
    setIssues(startingIssues);
    setDone(DONE_AT_START);
    notify("Sample issues restored", "neutral");
  }

  function toggleArchive() {
    const next = !archived;
    setArchived(next);
    notify(next ? "Project archived. New issues and updates are paused." : "Project restored", "neutral");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(PROJECT_URL);
      notify("Link copied");
    } catch {
      notify("Couldn't copy the link. Try again from the address bar.", "error");
    }
  }

  function openCrumb(label: string) {
    notify(`${label} would open here.`, "neutral");
  }

  const status = archived ? { tone: "neutral" as const, label: "Archived" } : { tone: "success" as const, label: "On track" };
  const menuActions: MenuAction[] = [
    ...(layout.collapsed ? [
      { key: "follow", label: following ? "Unfollow" : "Follow", icon: following ? <BellOff {...icon} /> : <Bell {...icon} />, onSelect: toggleFollow },
      { key: "share", label: "Share update", icon: <Megaphone {...icon} />, onSelect: shareUpdate, disabled: archived || sharing !== "idle" },
    ] : []),
    { key: "copy", label: "Copy link", icon: <Link2 {...icon} />, onSelect: copyLink, separatorBefore: layout.collapsed },
    { key: "archive", label: archived ? "Restore project" : "Archive project", icon: archived ? <ArchiveRestore {...icon} /> : <Archive {...icon} />, onSelect: toggleArchive },
  ];

  /** Leaving copy fades fast; arriving copy settles on the smooth spring with a short blur. */
  const swap = (entering: boolean): Transition => reduce ? still : { ...motionTokens.spring.smooth, opacity: { duration: entering ? motionTokens.duration.standard : motionTokens.duration.fast, ease: [...motionTokens.ease.standard], delay: entering ? .05 : 0 }, filter: { duration: entering ? motionTokens.duration.standard : motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } };
  const shown = { opacity: 1, y: 0, scale: 1, filter: blur(0) };

  return (
    <TabsPrimitive.Root asChild value={view.section} onValueChange={value => selectSection(value as Section)}>
      <section className={styles.frame} aria-labelledby={`${id}-title`} data-measured={layout.measured || undefined}>
        <header className={styles.header}>
          <div ref={bar} className={styles.bar}>
            <div className={styles.lead}>
              <motion.nav className={styles.crumbs} aria-label="Breadcrumb" inert={condensed} initial={false} animate={condensed ? { opacity: 0, y: -8, filter: blur(motionTokens.blur.subtle) } : shown} transition={swap(!condensed)}>
                <ol>
                  <li className={styles.rootCrumb}><button type="button" className={styles.crumb} onClick={() => openCrumb("Northline")}>Northline</button><ChevronRight size={14} strokeWidth={1.75} aria-hidden="true" /></li>
                  <li><button type="button" className={styles.crumb} onClick={() => openCrumb("Projects")}>Projects</button><ChevronRight size={14} strokeWidth={1.75} aria-hidden="true" /></li>
                  <li><span className={styles.current} aria-current="page">Checkout redesign</span></li>
                </ol>
              </motion.nav>
              <motion.button type="button" className={styles.compact} inert={!condensed} aria-label="Checkout redesign, back to top" onClick={backToTop} initial={false} animate={condensed ? shown : { opacity: 0, y: 14, filter: blur(motionTokens.blur.soft) }} transition={swap(condensed)}>
                <span className={styles.compactTitle}>Checkout redesign</span>
                <Badge className={styles.compactBadge} size="sm" tone={status.tone} icon={<StatusDot />}>{status.label}</Badge>
              </motion.button>
            </div>

            <div className={styles.actions}>
              <motion.div className={styles.secondary} inert={layout.collapsed} initial={false} animate={layout.collapsed ? { width: 0, opacity: 0 } : { width: "auto", opacity: 1 }} transition={layout.animate && !reduce ? { width: motionTokens.spring.smooth, opacity: { duration: layout.collapsed ? motionTokens.duration.fast : motionTokens.duration.standard, ease: [...motionTokens.ease.standard], delay: layout.collapsed ? .04 : .08 } } : still}>
                <div ref={secondary} className={styles.secondaryInner}>
                  <Button variant="secondary" size="sm" onClick={toggleFollow}>{following ? <><BellRing {...icon} /> Following</> : <><Bell {...icon} /> Follow</>}</Button>
                  <Button variant="secondary" size="sm" loading={sharing === "sending"} disabled={archived} onClick={shareUpdate}>{sharing === "sent" ? <><Check {...icon} /> Shared</> : <><Megaphone {...icon} /> Share update</>}</Button>
                </div>
              </motion.div>
              <div ref={trailing} className={styles.trailing}>
                <OverflowMenu actions={menuActions} reduce={reduce} />
                <Button className={styles.create} size="sm" aria-label="New issue" disabled={archived} onClick={createIssue}><Plus {...icon} /><span className={styles.createText}>New issue</span></Button>
              </div>
            </div>
          </div>

          <motion.div className={styles.intro} initial={false} animate={{ height: condensed ? 0 : "auto" }} transition={reduce ? still : motionTokens.spring.smooth}>
            <div className={styles.introInner}>
              <motion.div className={styles.titleRow} initial={false} animate={condensed ? { opacity: 0, y: -10, scale: .62, filter: blur(motionTokens.blur.subtle) } : shown} transition={swap(!condensed)}>
                <h2 ref={titleRef} id={`${id}-title`} className={styles.title} tabIndex={-1}>Checkout redesign</h2>
                <Badge tone={status.tone} icon={<StatusDot />}>{status.label}</Badge>
              </motion.div>
              <motion.div className={styles.details} initial={false} animate={condensed ? { opacity: 0, y: -6 } : { opacity: 1, y: 0 }} transition={swap(!condensed)}>
                <p className={styles.description}>Rebuilding mobile checkout around saved payment methods and a single review step, then rolling it out in stages from October 14.</p>
                <div className={styles.meta}>
                  <AvatarGroup members={members} max={4} size="sm" label="Project members" />
                  <span>Led by <strong>Emma Collins</strong></span>
                  <span className={styles.metaIcon}><CalendarDays size={14} strokeWidth={1.75} aria-hidden="true" />Target Oct 14</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <LayoutGroup id={id}>
            <TabsPrimitive.List asChild aria-label="Project sections">
              <motion.div ref={tabList} layoutScroll className={styles.tabs}>
                {sections.map(item => {
                  const count = item.value === "issues" ? issues.length : item.value === "updates" ? updates.length : item.value === "files" ? files.length : null;
                  return <TabsPrimitive.Trigger key={item.value} value={item.value} className={styles.tab}>
                    <span className={styles.tabLabel}>{item.label}</span>
                    {count !== null && <span className={styles.count}><AnimatedCounter value={count} /></span>}
                    {view.section === item.value && <motion.span className={styles.indicator} layoutId="indicator" layoutDependency={view.section} transition={reduce ? still : motionTokens.spring.morph} aria-hidden="true" />}
                  </TabsPrimitive.Trigger>;
                })}
              </motion.div>
            </TabsPrimitive.List>
          </LayoutGroup>
        </header>

        <div ref={scroller} className={styles.scroller} onScroll={onScroll}>
          <AnimatePresence initial={false} mode="popLayout" custom={view.direction}>
            <TabsPrimitive.Content key={view.section} value={view.section} forceMount asChild>
              <motion.div className={styles.panel} custom={view.direction} variants={reduce ? panelFade : panelSlide} initial="enter" animate="center" exit="exit">
                {view.section === "overview" && <OverviewPanel done={done} open={issues.length} />}
                {view.section === "issues" && <IssuesPanel issues={issues} closing={closing} reduce={reduce} onComplete={completeIssue} onReset={resetIssues} register={(key, node) => { if (node) toggles.current.set(key, node); else toggles.current.delete(key); }} />}
                {view.section === "updates" && <UpdatesPanel updates={updates} reduce={reduce} />}
                {view.section === "files" && <FilesPanel />}
              </motion.div>
            </TabsPrimitive.Content>
          </AnimatePresence>
        </div>

        <div className={styles.toastLayer} aria-hidden="true">
          <AnimatePresence initial={false} mode="popLayout">
            {notice && <motion.div key={notice.key} className={styles.toast} data-tone={notice.tone} initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, filter: blur(motionTokens.blur.soft) }} animate={{ opacity: 1, y: 0, filter: blur(0) }} exit={reduce ? { opacity: 0, transition: still } : { opacity: 0, y: 8, filter: blur(motionTokens.blur.subtle), transition: quick }} transition={reduce ? { duration: motionTokens.duration.instant } : { ...motionTokens.spring.snappy, opacity: { duration: .2 }, filter: { duration: .2 } }}>
              {notice.tone === "success" ? <Check {...icon} /> : notice.tone === "error" ? <CircleAlert {...icon} /> : null}
              <span>{notice.text}</span>
            </motion.div>}
          </AnimatePresence>
        </div>
        <p className={styles.srOnly} role="status" aria-live="polite">{notice?.text}</p>
      </section>
    </TabsPrimitive.Root>
  );
}

export default PageHeader;
