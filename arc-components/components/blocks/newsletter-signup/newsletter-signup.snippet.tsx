"use client";

import Image from "next/image";
import type { FormEvent, ReactNode } from "react";
import type { Variants } from "motion/react";
import { AnimatePresence, motion, useAnimate, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { forwardRef, useEffect, useId, useRef, useState } from "react";

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
const ARC_NEWSLETTER_SIGNUP_STYLES = `.arc-newsletter-signup-newsletter {
  --paper: var(--surface-raised);
  --paper-back: color-mix(in oklch, var(--surface-raised), var(--surface-muted) 55%);
  --paper-far: var(--surface-muted);
  --paper-shadow: 0 1px 1px oklch(0% 0 0 / .03), 0 10px 28px -6px oklch(0% 0 0 / .09);
  container: newsletter / inline-size;
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-body);
  letter-spacing: var(--tracking-body);
  text-align: start;
}
:global(:root[data-theme="dark"]) .arc-newsletter-signup-newsletter {
  --paper: oklch(24.5% 0 0);
  --paper-back: oklch(22.5% 0 0);
  --paper-far: oklch(21% 0 0);
  --paper-shadow: 0 1px 1px oklch(0% 0 0 / .2), 0 14px 32px -6px oklch(0% 0 0 / .45);
}
.arc-newsletter-signup-newsletter *, .arc-newsletter-signup-newsletter *::before, .arc-newsletter-signup-newsletter *::after { box-sizing: border-box; }
.arc-newsletter-signup-srOnly { position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

/* Inline: copy and form on the left, the issue stack on the right. */
.arc-newsletter-signup-inline { display: grid; max-width: 1120px; grid-template-columns: minmax(0, 1fr); gap: var(--space-12) var(--space-16); margin: 0 auto; padding: var(--space-24) var(--space-8); }
.arc-newsletter-signup-newsletter[data-aside] .arc-newsletter-signup-inline { grid-template-columns: minmax(0, 1fr) minmax(0, 440px); align-items: center; }
/* Without the stack or readers the section is the copy and form alone. */
.arc-newsletter-signup-newsletter[data-variant="inline"]:not([data-aside]) .arc-newsletter-signup-inline { max-width: 720px; }
.arc-newsletter-signup-intro { display: grid; max-width: 540px; }
.arc-newsletter-signup-title { margin: 0; font-family: var(--font-display); font-size: clamp(2rem, 1.1rem + 3.2cqi, var(--text-4xl)); font-weight: 500; letter-spacing: var(--tracking-display); line-height: 1.04; text-wrap: balance; }
.arc-newsletter-signup-description { margin: var(--space-4) 0 0; color: var(--text-secondary); font-size: var(--text-lg); line-height: 1.5; text-wrap: pretty; }
.arc-newsletter-signup-intro .arc-newsletter-signup-form { margin-top: var(--space-10); }
.arc-newsletter-signup-aside { display: grid; justify-items: center; gap: var(--space-6); min-width: 0; }

/* The stack: every issue shares one grid cell, so the stack is as tall as one issue and nothing shifts when they trade places. */
.arc-newsletter-signup-stack { display: grid; width: 100%; max-width: 440px; padding-top: calc(12px * 2); }
.arc-newsletter-signup-issue {
  display: grid;
  grid-area: 1 / 1;
  align-content: start;
  min-width: 0;
  border: 1px solid var(--border);
  border-radius: 22px;
  padding: 22px 22px 18px;
  background: var(--paper);
  box-shadow: var(--paper-shadow);
  transform-origin: 50% 0;
  transition: background-color var(--duration-considered) var(--ease-standard);
}
.arc-newsletter-signup-issueSizer { visibility: hidden; box-shadow: none; }
.arc-newsletter-signup-issue[data-depth="1"] { background: var(--paper-back); box-shadow: none; }
.arc-newsletter-signup-issue[data-depth="2"] { background: var(--paper-far); box-shadow: none; }
.arc-newsletter-signup-issueHead { display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-3); }
.arc-newsletter-signup-masthead { font-family: var(--font-display); font-size: var(--text-xl); font-weight: 500; letter-spacing: -.02em; line-height: 1.2; }
.arc-newsletter-signup-issueNumber, .arc-newsletter-signup-issueMeta { color: var(--text-muted); font-size: 13px; line-height: var(--leading-body); font-variant-numeric: tabular-nums; }
.arc-newsletter-signup-issueMeta { display: flex; min-width: 0; gap: 6px; margin: 2px 0 0; white-space: nowrap; }
.arc-newsletter-signup-issueMeta > span:last-child { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.arc-newsletter-signup-recipient { color: var(--text-secondary); }
.arc-newsletter-signup-recipientEmail { color: var(--foreground); }
.arc-newsletter-signup-subject { min-height: calc(2em * 1.12); margin: var(--space-5) 0 var(--space-4); border-top: 1px solid var(--border); padding-top: var(--space-5); font-family: var(--font-display); font-size: 1.625rem; font-weight: 500; letter-spacing: -.03em; line-height: 1.12; text-wrap: balance; box-sizing: content-box; }
.arc-newsletter-signup-stack[data-compact] .arc-newsletter-signup-subject { font-size: var(--text-xl); }
.arc-newsletter-signup-stories { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }
.arc-newsletter-signup-story { display: grid; grid-template-columns: 44px minmax(0, 1fr) auto; align-items: center; gap: 12px; min-height: 44px; }
.arc-newsletter-signup-thumb { display: block; width: 44px; height: 44px; border-radius: 10px; object-fit: cover; background: var(--surface-muted); }
.arc-newsletter-signup-storyTitle { display: -webkit-box; overflow: hidden; color: var(--text-secondary); font-size: var(--text-sm); line-height: 1.35; -webkit-box-orient: vertical; -webkit-line-clamp: 2; text-wrap: pretty; }
.arc-newsletter-signup-minutes { color: var(--text-muted); font-size: var(--text-xs); font-variant-numeric: tabular-nums; white-space: nowrap; }

/* Readers: faces and a count that ticks up by one. */
.arc-newsletter-signup-readers { display: flex; align-items: center; gap: var(--space-3); color: var(--text-secondary); font-size: var(--text-sm); line-height: var(--leading-body); }
.arc-newsletter-signup-faces { display: flex; flex: none; padding-left: 6px; }
.arc-newsletter-signup-faces img { display: block; width: 28px; height: 28px; margin-left: -6px; border: 2px solid var(--background); border-radius: 50%; object-fit: cover; }
.arc-newsletter-signup-card .arc-newsletter-signup-faces img { border-color: var(--surface); }
.arc-newsletter-signup-readerLine { min-width: 0; font-variant-numeric: tabular-nums; white-space: nowrap; }
.arc-newsletter-signup-count { display: inline-block; color: var(--foreground); }
.arc-newsletter-signup-count > span { color: inherit; font-family: inherit; font-size: inherit; font-weight: 500; letter-spacing: inherit; line-height: inherit; vertical-align: bottom; }
.arc-newsletter-signup-you { color: var(--text-secondary); }

/* Card: a self-contained card whose top is a tray holding the stack, cropped where the card body begins. */
.arc-newsletter-signup-newsletter[data-variant="card"] { padding: var(--space-20) var(--space-6); }
.arc-newsletter-signup-cardShell { display: grid; width: 100%; place-items: center; }
.arc-newsletter-signup-card { display: grid; width: min(100%, 460px); overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius-surface); background: var(--surface); box-shadow: var(--shadow-resting); }
.arc-newsletter-signup-tray { display: grid; height: 248px; grid-template-rows: minmax(0, 1fr); overflow: hidden; justify-items: center; border-bottom: 1px solid var(--border); padding: 20px 32px 0; background: var(--surface-muted); }
.arc-newsletter-signup-tray .arc-newsletter-signup-stack { height: 100%; -webkit-mask-image: linear-gradient(to bottom, #000 calc(100% - 64px), transparent); mask-image: linear-gradient(to bottom, #000 calc(100% - 64px), transparent); }
.arc-newsletter-signup-tray .arc-newsletter-signup-issue { box-shadow: none; }
.arc-newsletter-signup-cardBody { display: grid; padding: var(--space-8); }
.arc-newsletter-signup-cardTitle { margin: 0; font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 500; letter-spacing: var(--tracking-display); line-height: var(--leading-display); text-wrap: balance; }
.arc-newsletter-signup-card .arc-newsletter-signup-description { margin-top: var(--space-2); font-size: var(--text-base); }
.arc-newsletter-signup-card .arc-newsletter-signup-form { margin-top: var(--space-6); }
.arc-newsletter-signup-card .arc-newsletter-signup-readers { margin-top: var(--space-5); border-top: 1px solid var(--border-subtle); padding-top: var(--space-5); }
:global(:root[data-theme="dark"]) .arc-newsletter-signup-tray { background: var(--background); }

/* The pill: one field that holds the input and the button. */
.arc-newsletter-signup-form { container: signup / inline-size; display: grid; gap: var(--space-3); min-width: 0; }
.arc-newsletter-signup-pill { position: relative; display: flex; height: 58px; align-items: center; gap: 6px; border: 1px solid var(--border-strong); border-radius: 999px; padding: 5px 5px 5px 22px; background: var(--surface); transition: border-color var(--duration-fast) var(--ease-standard), background-color var(--duration-standard) var(--ease-standard); }
@media (hover: hover) and (pointer: fine) { .arc-newsletter-signup-pill:not([data-done]):hover { border-color: color-mix(in oklch, var(--foreground) 32%, var(--border-strong)); } }
.arc-newsletter-signup-pill:focus-within { border-color: var(--foreground); }
.arc-newsletter-signup-pill.pill[data-invalid] { border-color: var(--danger); }
.arc-newsletter-signup-pill.pill[data-done] { border-color: color-mix(in oklch, var(--success) 45%, var(--border)); }
.arc-newsletter-signup-input { width: 100%; min-width: 0; height: 100%; flex: 1; border: 0; padding: 0; background: none; color: var(--foreground); font: inherit; font-size: var(--text-base); letter-spacing: inherit; outline: none; transition: color var(--duration-standard) var(--ease-standard); }
.arc-newsletter-signup-input::placeholder { color: var(--text-muted); }
.arc-newsletter-signup-pill[data-done] .arc-newsletter-signup-input { color: var(--text-secondary); }

.arc-newsletter-signup-submit { position: relative; display: inline-flex; height: 100%; min-height: 44px; flex: none; align-items: center; justify-content: center; border: 0; border-radius: 999px; padding: 0 20px; background: var(--foreground); color: var(--background); font: inherit; font-size: var(--text-sm); font-weight: 500; cursor: pointer; white-space: nowrap; -webkit-tap-highlight-color: transparent; transition: background-color var(--duration-standard) var(--ease-standard), color var(--duration-standard) var(--ease-standard); }
@media (hover: hover) and (pointer: fine) { .arc-newsletter-signup-submit[data-state="idle"]:hover, .arc-newsletter-signup-submit[data-state="retry"]:hover { background: color-mix(in oklch, var(--foreground) 84%, var(--background)); } }
.arc-newsletter-signup-submit[data-state="sending"] { cursor: progress; }
.arc-newsletter-signup-submit[data-state="done"] { background: color-mix(in oklch, var(--success) 13%, var(--surface)); color: var(--success); cursor: default; }
.arc-newsletter-signup-labels { display: inline-grid; place-items: center; }
.arc-newsletter-signup-sizer, .arc-newsletter-signup-label { display: inline-flex; grid-area: 1 / 1; align-items: center; gap: 8px; }
.arc-newsletter-signup-sizer { visibility: hidden; }
.arc-newsletter-signup-note.sizer { display: block; }
.arc-newsletter-signup-spinner { width: 14px; height: 14px; border: 2px solid color-mix(in oklch, currentColor 30%, transparent); border-top-color: currentColor; border-radius: 50%; animation: spin 700ms linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.arc-newsletter-signup-check { display: inline-flex; width: 16px; height: 16px; }
.arc-newsletter-signup-check svg { width: 16px; height: 16px; }

/* Two lines are reserved so the note, an error, and the confirmation never move what sits below. */
.arc-newsletter-signup-message { display: grid; }
.arc-newsletter-signup-message > * { grid-area: 1 / 1; min-width: 0; }
.arc-newsletter-signup-messageLive { position: relative; }
.arc-newsletter-signup-note { margin: 0; padding-left: 22px; color: var(--text-muted); font-size: var(--text-sm); line-height: var(--leading-body); text-wrap: pretty; }
.arc-newsletter-signup-note[data-tone="error"] { color: var(--danger); }
.arc-newsletter-signup-note[data-tone="success"] { color: var(--text-secondary); }
.arc-newsletter-signup-link, .arc-newsletter-signup-textButton { color: var(--foreground); text-decoration: underline; text-decoration-color: var(--border-strong); text-underline-offset: 3px; transition: text-decoration-color var(--duration-fast) var(--ease-standard); }
.arc-newsletter-signup-textButton { border: 0; padding: 0; background: none; font: inherit; cursor: pointer; }
@media (hover: hover) and (pointer: fine) { .arc-newsletter-signup-link:hover, .arc-newsletter-signup-textButton:hover { text-decoration-color: currentColor; } }

@container newsletter (max-width: 860px) {
  .arc-newsletter-signup-newsletter[data-variant="inline"] .arc-newsletter-signup-inline { grid-template-columns: minmax(0, 1fr); gap: var(--space-12); padding: var(--space-16) var(--space-8); }
  .arc-newsletter-signup-intro { max-width: 600px; }
}
@container newsletter (max-width: 520px) {
  .arc-newsletter-signup-newsletter[data-variant="inline"] .arc-newsletter-signup-inline { padding: var(--space-12) var(--space-4); gap: var(--space-10); }
  .arc-newsletter-signup-description { font-size: var(--text-base); }
  .arc-newsletter-signup-intro .arc-newsletter-signup-form { margin-top: var(--space-8); }
  .arc-newsletter-signup-issue { border-radius: 20px; padding: 18px 18px 16px; }
  .arc-newsletter-signup-subject, .arc-newsletter-signup-stack[data-compact] .arc-newsletter-signup-subject { font-size: var(--text-xl); }
  .arc-newsletter-signup-newsletter[data-variant="card"] { padding: var(--space-10) var(--space-4); }
  .arc-newsletter-signup-card { border-radius: 28px; }
  .arc-newsletter-signup-tray { height: 232px; padding: 16px 20px 0; }
  .arc-newsletter-signup-cardBody { padding: var(--space-6); }
  .arc-newsletter-signup-note { padding-left: 4px; }
}
@container newsletter (max-width: 400px) {
  .arc-newsletter-signup-minutes { display: none; }
  /* The recipient matters more than the date once the issue is addressed. */
  .arc-newsletter-signup-issueMeta:has(.arc-newsletter-signup-recipient) > :not(.arc-newsletter-signup-recipient) { display: none; }
  .arc-newsletter-signup-story { grid-template-columns: 44px minmax(0, 1fr); }
  .arc-newsletter-signup-faces img { width: 24px; height: 24px; }
  .arc-newsletter-signup-readers { gap: var(--space-2); }
}
@container newsletter (max-width: 360px) {
  .arc-newsletter-signup-readers { align-items: flex-start; }
  .arc-newsletter-signup-readerLine { min-height: calc(2 * 1.4em); white-space: normal; }
}
/* On narrow phones the field and the button separate and stack, both full width. */
@container signup (max-width: 300px) {
  .arc-newsletter-signup-pill { height: auto; flex-direction: column; align-items: stretch; gap: 8px; border: 0; padding: 0; background: none; }
  .arc-newsletter-signup-input { height: 52px; flex: none; border: 1px solid var(--border-strong); border-radius: 999px; padding: 0 20px; background: var(--surface); transition: border-color var(--duration-fast) var(--ease-standard), color var(--duration-standard) var(--ease-standard); }
  .arc-newsletter-signup-input:focus { border-color: var(--foreground); }
  .arc-newsletter-signup-pill.pill[data-invalid] .arc-newsletter-signup-input { border-color: var(--danger); }
  .arc-newsletter-signup-pill.pill[data-done] .arc-newsletter-signup-input { border-color: color-mix(in oklch, var(--success) 45%, var(--border)); }
  .arc-newsletter-signup-submit { height: 48px; }
  .arc-newsletter-signup-note { padding-left: 4px; }
}

/* Preview chrome. */
.arc-newsletter-signup-preview { display: grid; width: 100%; justify-items: center; gap: var(--space-4); }
.arc-newsletter-signup-controls { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: var(--space-3) var(--space-6); }
.arc-newsletter-signup-simulate { display: inline-flex; align-items: center; gap: 10px; color: var(--text-secondary); font-size: var(--text-sm); }
.arc-newsletter-signup-simulate label { cursor: pointer; }
.arc-newsletter-signup-frame { width: 100%; overflow: hidden; border: 1px solid var(--border); border-radius: 20px; background: var(--background); }
.arc-newsletter-signup-caption { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: var(--leading-body); text-align: center; }

@media (prefers-reduced-motion: reduce) {
  .arc-newsletter-signup-pill, .arc-newsletter-signup-submit, .arc-newsletter-signup-input, .arc-newsletter-signup-issue { transition: none; }
  .arc-newsletter-signup-spinner { animation-duration: 1.6s; }
}
`;

const styles: Record<string, string> = new Proxy({
  "aside": "arc-newsletter-signup-aside",
  "caption": "arc-newsletter-signup-caption",
  "card": "arc-newsletter-signup-card",
  "cardBody": "arc-newsletter-signup-cardBody",
  "cardShell": "arc-newsletter-signup-cardShell",
  "cardTitle": "arc-newsletter-signup-cardTitle",
  "check": "arc-newsletter-signup-check",
  "controls": "arc-newsletter-signup-controls",
  "count": "arc-newsletter-signup-count",
  "description": "arc-newsletter-signup-description",
  "faces": "arc-newsletter-signup-faces",
  "form": "arc-newsletter-signup-form",
  "frame": "arc-newsletter-signup-frame",
  "inline": "arc-newsletter-signup-inline",
  "input": "arc-newsletter-signup-input",
  "intro": "arc-newsletter-signup-intro",
  "issue": "arc-newsletter-signup-issue",
  "issueHead": "arc-newsletter-signup-issueHead",
  "issueMeta": "arc-newsletter-signup-issueMeta",
  "issueNumber": "arc-newsletter-signup-issueNumber",
  "issueSizer": "arc-newsletter-signup-issueSizer",
  "label": "arc-newsletter-signup-label",
  "labels": "arc-newsletter-signup-labels",
  "link": "arc-newsletter-signup-link",
  "masthead": "arc-newsletter-signup-masthead",
  "message": "arc-newsletter-signup-message",
  "messageLive": "arc-newsletter-signup-messageLive",
  "minutes": "arc-newsletter-signup-minutes",
  "newsletter": "arc-newsletter-signup-newsletter",
  "note": "arc-newsletter-signup-note",
  "pill": "arc-newsletter-signup-pill",
  "preview": "arc-newsletter-signup-preview",
  "readerLine": "arc-newsletter-signup-readerLine",
  "readers": "arc-newsletter-signup-readers",
  "recipient": "arc-newsletter-signup-recipient",
  "recipientEmail": "arc-newsletter-signup-recipientEmail",
  "simulate": "arc-newsletter-signup-simulate",
  "sizer": "arc-newsletter-signup-sizer",
  "spinner": "arc-newsletter-signup-spinner",
  "srOnly": "arc-newsletter-signup-srOnly",
  "stack": "arc-newsletter-signup-stack",
  "stories": "arc-newsletter-signup-stories",
  "story": "arc-newsletter-signup-story",
  "storyTitle": "arc-newsletter-signup-storyTitle",
  "subject": "arc-newsletter-signup-subject",
  "submit": "arc-newsletter-signup-submit",
  "textButton": "arc-newsletter-signup-textButton",
  "thumb": "arc-newsletter-signup-thumb",
  "title": "arc-newsletter-signup-title",
  "tray": "arc-newsletter-signup-tray",
  "you": "arc-newsletter-signup-you"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-newsletter-signup-${prop}`,
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


// ── Helper: newsletter-signup-data.ts ──

/** One story teased in an issue. `image` is a small square-cropped thumbnail. */
export interface NewsletterStory {
  title: string;
  image: string;
  minutes: number;
}

/** One issue of the newsletter, as it appears on the stack. */
export interface NewsletterIssue {
  number: number;
  /** Send date as it should read, such as "Friday, September 25". */
  date: string;
  subject: string;
  /** Up to three stories. */
  stories: NewsletterStory[];
}

/** The publication shown beside the form: the next issue lands on the stack of recent ones when someone subscribes. */
export interface NewsletterPublication {
  name: string;
  /** The next issue. It is addressed to the new reader and joins the front of the stack on success. */
  upcoming: NewsletterIssue;
  /** Recent issues, newest first. The first three make the stack. */
  recent: NewsletterIssue[];
}

const story = (title: string, image: PhotoId, minutes: number): NewsletterStory => ({ title, image: photo(image).src, minutes });

export const newsletterCopy = {
  inline: {
    title: "Five minutes on interface craft, every Friday",
    description: "Three links worth your time and one short essay on the details that make software feel right.",
  },
  card: {
    title: "Get the next issue on Friday",
    description: "Three links and one short essay on interface craft. Five minutes, once a week.",
  },
  privacy: "No tracking pixels. Unsubscribe with one click.",
  privacyLink: { label: "Privacy policy", href: "#privacy" },
};

/** Sample publication. Dates follow a Friday send; images come from `public/media/photos`. */
export const newsletterPublication: NewsletterPublication = {
  name: "Margins",
  upcoming: {
    number: 149,
    date: "Friday, October 2",
    subject: "Designing for the second visit, not the first",
    stories: [
      story("Empty states that invite a first step", "reading-chair", 5),
      story("Texture without noise, from a ceramics studio", "stacked-bowls", 4),
      story("How a concert hall seats two thousand people", "concert-hall", 7),
    ],
  },
  recent: [
    {
      number: 148,
      date: "Friday, September 25",
      subject: "Why the best settings pages feel quiet",
      stories: [
        story("What a sunroom teaches about contrast", "sunroom", 4),
        story("The case for a single accent color", "ceramic-lamp", 3),
        story("Lisbon tram signs and wayfinding at scale", "lisbon-tram", 6),
      ],
    },
    {
      number: 147,
      date: "Friday, September 18",
      subject: "Springs that settle instead of bounce",
      stories: [
        story("Reading the ridge line of an animation curve", "mountain-ridges", 5),
        story("A table lamp and the warmth of dark mode", "table-lamp", 3),
        story("Curves in architecture and in corners", "curved-facade", 4),
      ],
    },
    {
      number: 146,
      date: "Friday, September 11",
      subject: "Copy that sounds like a person",
      stories: [
        story("Error messages that take the blame", "glass-carafe", 4),
        story("Writing buttons as verbs", "home-office", 3),
        story("Tone of voice at the dinner table", "salmon-dinner", 5),
      ],
    },
  ],
};

/** Readers shown under the stack and in the card. */
export const newsletterReaders = {
  count: 12480,
  faces: (["jasmine-brooks", "daniel-kim", "ava-mitchell"] as PersonId[]).map(id => avatar(id)),
};

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



// inlined:  NewsletterIssue, NewsletterPublication, NewsletterStory 
export type NewsletterVariant = "inline" | "card";

export interface NewsletterSignupProps {
  /** `inline` puts the copy and form beside the issue stack; `card` is a self-contained card with the stack in a tray on top. */
  variant?: NewsletterVariant;
  title?: string;
  description?: string;
  placeholder?: string;
  buttonLabel?: string;
  /** Short line under the form about frequency and privacy. */
  privacyNote?: ReactNode;
  /** Link after the privacy note. Pass null to hide it. */
  privacyLink?: { label: string; href: string } | null;
  /** Reader count and up to three faces. The count ticks up by one when someone subscribes. Pass null to hide it. */
  readers?: { count: number; faces: string[] } | null;
  /** The issue stack. On success the upcoming issue, addressed to the new reader, lands on top. Pass null for a form without the stack. */
  publication?: NewsletterPublication | null;
  /** Called with a valid, trimmed email. Reject to show an error and keep the email; resolve to show the success state. */
  onSubscribe?: (email: string) => void | Promise<void>;
  className?: string;
}

type Phase = "idle" | "sending" | "done";
type Problem = { kind: "invalid" | "failed"; text: string };
type Bezier = [number, number, number, number];
const enter = [...motionTokens.ease.enter] as Bezier;
const standard = [...motionTokens.ease.standard] as Bezier;
const MESSAGES = {
  empty: "Enter your email address",
  format: "Enter an email like name@company.com",
  failed: "That didn't go through. Your email is kept, so try again.",
};
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** How far each issue behind the front one peeks out above it. */
const STEP = 12;

function validate(value: string): Problem | null {
  const email = value.trim();
  if (!email) return { kind: "invalid", text: MESSAGES.empty };
  if (!EMAIL.test(email)) return { kind: "invalid", text: MESSAGES.format };
  return null;
}

const swapIn = { opacity: 0, y: 6, filter: `blur(${motionTokens.blur.subtle}px)` };
const swapShown = { opacity: 1, y: 0, filter: "blur(0px)" };
const swapOut = { opacity: 0, y: -6, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: .14, ease: standard } };
const fadeIn = { opacity: 0 };
const fadeOut = { opacity: 0, transition: { duration: .1 } };

/** A line that swaps in place: the old text lifts away and the new one rises out of a soft blur. */
function Swap({ id, children, reduced, className, live }: { id: string; children: ReactNode; reduced: boolean; className?: string; live?: "polite" }) {
  return <div className={className} aria-live={live}>
    <AnimatePresence initial={false} mode="popLayout">
      <motion.div key={id} initial={reduced ? fadeIn : swapIn} animate={swapShown} exit={reduced ? fadeOut : swapOut} transition={{ duration: reduced ? .12 : .26, ease: enter }}>{children}</motion.div>
    </AnimatePresence>
  </div>;
}

/** One issue: masthead, recipient line, subject, and three stories with thumbnails. */
function IssueCard({ issue, name, to }: { issue: NewsletterIssue; name: string; to?: string }) {
  return <>
    <header className={styles.issueHead}>
      <span className={styles.masthead}>{name}</span>
      <span className={styles.issueNumber}>Issue {issue.number}</span>
    </header>
    <p className={styles.issueMeta}>
      <span className={styles.issueDate}>{issue.date}</span>
      {to && <><span aria-hidden="true">&middot;</span><span className={styles.recipient}>To <span className={styles.recipientEmail}>{to}</span></span></>}
    </p>
    <h3 className={styles.subject}>{issue.subject}</h3>
    <ul className={styles.stories}>
      {issue.stories.slice(0, 3).map(story => <li key={story.title} className={styles.story}>
        <Image className={styles.thumb} src={story.image} alt="" width={88} height={88} sizes="44px" />
        <span className={styles.storyTitle}>{story.title}</span>
        <span className={styles.minutes}>{story.minutes} min</span>
      </li>)}
    </ul>
  </>;
}

type Placement = { depth: number; upcoming: boolean };
/** The front issue sits flat; each one behind steps up and shrinks a little so its top edge shows. */
const stackVariants: Variants = {
  placed: ({ depth }: Placement) => ({ opacity: 1, y: -depth * STEP, scale: 1 - depth * .045 }),
  // The upcoming issue arrives from below, where the form is; older ones slide in from behind.
  away: ({ upcoming }: Placement) => upcoming ? { opacity: 0, y: 56, scale: 1 } : { opacity: 0, y: -3 * STEP, scale: 1 - 3 * .045 },
};
/** Position rides the no-overshoot spring; opacity resolves fast so two issues never read through each other. */
const settle = { ...motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.instant, ease: "linear" as const } };
/** Reduced motion: issues take their places at once and only fade. */
const still = { duration: 0, opacity: { duration: motionTokens.duration.fast } };

/**
 * A stack of recent issues. When someone subscribes, the upcoming issue, addressed to them, lands on the front
 * and the older ones step back; the oldest drops away.
 */
function IssueStack({ publication, delivered, to, reduced, compact }: { publication: NewsletterPublication; delivered: boolean; to: string; reduced: boolean; compact?: boolean }) {
  const issues = (delivered ? [publication.upcoming, ...publication.recent] : publication.recent).slice(0, 3);
  return <div className={styles.stack} data-compact={compact ? "" : undefined}>
    {/* An unseen copy of the upcoming issue keeps the stack as tall as the tallest issue it will ever hold. */}
    <div className={`${styles.issue} ${styles.issueSizer}`} aria-hidden="true"><IssueCard issue={publication.upcoming} name={publication.name} to={to || " "} /></div>
    <AnimatePresence initial={false}>
      {issues.map((issue, depth) => {
        const upcoming = issue === publication.upcoming;
        const placement: Placement = { depth, upcoming };
        return <motion.article
          key={issue.number}
          className={styles.issue}
          data-depth={depth}
          aria-hidden={depth > 0 ? true : undefined}
          aria-label={depth === 0 ? `${publication.name}, issue ${issue.number}` : undefined}
          custom={placement}
          variants={stackVariants}
          initial="away"
          animate="placed"
          exit="away"
          transition={reduced ? still : settle}
          style={{ zIndex: 3 - depth }}
        >
          <IssueCard issue={issue} name={publication.name} to={upcoming ? to : undefined} />
        </motion.article>;
      })}
    </AnimatePresence>
  </div>;
}

/** Faces and a reader count that ticks up by one when you join. */
function Readers({ readers, done, reduced }: { readers: { count: number; faces: string[] }; done: boolean; reduced: boolean }) {
  return <div className={styles.readers}>
    <span className={styles.faces} aria-hidden="true">
      {readers.faces.slice(0, 3).map(src => <Image key={src} src={src} alt="" width={56} height={56} sizes="28px" />)}
    </span>
    <span className={styles.readerLine}>
      <span className={styles.count}><AnimatedCounter value={readers.count + (done ? 1 : 0)} /></span>
      {" "}readers
      <AnimatePresence initial={false}>
        {done && <motion.span key="you" className={styles.you} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? .12 : motionTokens.duration.standard, ease: enter, delay: reduced ? 0 : .18 }}>, including you</motion.span>}
      </AnimatePresence>
    </span>
  </div>;
}

/**
 * A newsletter signup framed by the newsletter itself: a stack of recent issues. Subscribing drops the next issue,
 * addressed to the new reader, onto the front of the stack and ticks the reader count up by one.
 * Comes as an inline page section or a self-contained card.
 */
export const NewsletterSignup = forwardRef<HTMLElement, NewsletterSignupProps>(function NewsletterSignup({
  variant = "inline",
  title,
  description,
  placeholder = "you@company.com",
  buttonLabel = "Subscribe",
  privacyNote = newsletterCopy.privacy,
  privacyLink = newsletterCopy.privacyLink,
  readers = newsletterReaders,
  publication = newsletterPublication,
  onSubscribe,
  className,
}, ref) {
  const id = useId();
  const reduced = !!useReducedMotion();
  const [email, setEmail] = useState("");
  const [problem, setProblem] = useState<Problem | null>(null);
  const [tried, setTried] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [sentTo, setSentTo] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const again = useRef<HTMLButtonElement>(null);
  const busy = useRef(false);
  const refocus = useRef(false);
  const [pill, animatePill] = useAnimate<HTMLDivElement>();
  const copy = newsletterCopy[variant];

  useEffect(() => {
    if (phase === "idle" && refocus.current) { refocus.current = false; input.current?.focus(); }
    if (phase === "done") again.current?.focus();
  }, [phase]);

  function shake() {
    if (reduced || !pill.current) return;
    animatePill(pill.current, { x: [0, -6, 5, -3, 1, 0] }, { duration: .36, ease: "easeOut" });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy.current || phase !== "idle") return;
    setTried(true);
    const found = validate(email);
    setProblem(found);
    if (found) { shake(); input.current?.focus(); return; }
    const value = email.trim();
    busy.current = true;
    setPhase("sending");
    try {
      await (onSubscribe ? onSubscribe(value) : new Promise(resolve => setTimeout(resolve, 1100)));
      setSentTo(value);
      setPhase("done");
    } catch {
      setPhase("idle");
      setProblem({ kind: "failed", text: MESSAGES.failed });
      shake();
    } finally {
      busy.current = false;
    }
  }

  function reset() {
    setEmail("");
    setProblem(null);
    setTried(false);
    refocus.current = true;
    setPhase("idle");
  }

  const done = phase === "done";
  const sending = phase === "sending";
  const messageId = `${id}-message`;
  const labelKey = done ? "done" : sending ? "sending" : problem?.kind === "failed" ? "retry" : "idle";
  const labels: Record<string, ReactNode> = {
    idle: <>{buttonLabel}<ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" /></>,
    retry: <>Try again<ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" /></>,
    sending: <><span className={styles.spinner} aria-hidden="true" />Subscribing</>,
    done: <><span className={styles.check} aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduced ? 0 : .34, ease: enter, delay: .12 }} /></svg></span>Subscribed</>,
  };

  const doneText = "Check your inbox to confirm.";
  const note = <>{privacyNote}{privacyLink && <> <a className={styles.link} href={privacyLink.href}>{privacyLink.label}</a></>}</>;
  // Plain copies of the note and the confirmation, used only to reserve the line's height.
  const measures = [<>{privacyNote}{privacyLink && ` ${privacyLink.label}`}</>, `${doneText} Use a different email`, MESSAGES.empty, MESSAGES.format, MESSAGES.failed];
  const form = <form className={styles.form} onSubmit={submit} noValidate aria-label={title ?? copy.title}>
    <motion.div ref={pill} className={styles.pill} data-invalid={problem ? "" : undefined} data-done={done ? "" : undefined}>
      <label htmlFor={`${id}-email`} className={styles.srOnly}>Email address</label>
      <input
        ref={input}
        id={`${id}-email`}
        className={styles.input}
        type="email"
        name="email"
        inputMode="email"
        autoComplete="email"
        enterKeyHint="send"
        autoCapitalize="off"
        spellCheck={false}
        placeholder={placeholder}
        value={email}
        readOnly={phase !== "idle"}
        aria-invalid={problem?.kind === "invalid" ? true : undefined}
        aria-describedby={messageId}
        onBlur={() => { if (email.trim() && !tried && phase === "idle") { setTried(true); setProblem(validate(email)); } }}
        onChange={event => { setEmail(event.target.value); if (tried) setProblem(validate(event.target.value)); else if (problem) setProblem(null); }}
      />
      <motion.button
        type={done ? "button" : "submit"}
        className={styles.submit}
        data-state={labelKey}
        aria-busy={sending || undefined}
        aria-disabled={sending || done || undefined}
        tabIndex={done ? -1 : undefined}
        whileTap={{ scale: reduced || sending || done ? 1 : .97 }}
        transition={motionTokens.spring.snappy}
      >
        <span className={styles.labels}>
          {Object.keys(labels).map(key => <span key={key} className={styles.sizer} aria-hidden="true">{key === "done" ? <><span className={styles.check} />Subscribed</> : labels[key]}</span>)}
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span key={labelKey} className={styles.label} initial={reduced ? fadeIn : swapIn} animate={swapShown} exit={reduced ? fadeOut : swapOut} transition={{ duration: reduced ? .12 : .24, ease: enter }}>
              {labels[labelKey]}
            </motion.span>
          </AnimatePresence>
        </span>
      </motion.button>
    </motion.div>
    <div className={styles.message}>
      {/* Every message the line can show sits here unseen, so the line is always as tall as the longest one and nothing below it moves. */}
      {measures.map((text, index) => <p key={index} className={`${styles.note} ${styles.sizer}`} aria-hidden="true">{text}</p>)}
      <Swap id={problem ? `problem-${problem.text}` : done ? "done" : "note"} reduced={reduced} className={styles.messageLive} live="polite">
        <p id={messageId} className={styles.note} data-tone={problem ? "error" : done ? "success" : undefined} role={problem ? "alert" : undefined}>
          {problem?.text ?? (done
            ? <>{doneText}<span className={styles.srOnly}> The link went to {sentTo}.</span> <button ref={again} type="button" className={styles.textButton} onClick={reset}>Use a different email</button></>
            : note)}
        </p>
      </Swap>
    </div>
  </form>;

  const root = [styles.newsletter, className].filter(Boolean).join(" ");

  if (variant === "card") {
    return <section ref={ref} className={root} data-variant="card" aria-labelledby={`${id}-title`}>
      {/* The shell spans the section so a host layout can set its gutter without reaching into the card. */}
      <div className={styles.cardShell}>
      <div className={styles.card}>
        {publication && <div className={styles.tray}>
          <IssueStack publication={publication} delivered={done} to={sentTo} reduced={reduced} compact />
        </div>}
        <div className={styles.cardBody}>
          <h2 id={`${id}-title`} className={styles.cardTitle}>{title ?? copy.title}</h2>
          <p className={styles.description}>{description ?? copy.description}</p>
          {form}
          {readers && <Readers readers={readers} done={done} reduced={reduced} />}
        </div>
      </div>
      </div>
    </section>;
  }

  return <section ref={ref} className={root} data-variant="inline" data-aside={publication || readers ? "" : undefined} aria-labelledby={`${id}-title`}>
    <div className={styles.inline}>
      <div className={styles.intro}>
        <h2 id={`${id}-title`} className={styles.title}>{title ?? copy.title}</h2>
        <p className={styles.description}>{description ?? copy.description}</p>
        {form}
      </div>
      {(publication || readers) && <div className={styles.aside}>
        {publication && <IssueStack publication={publication} delivered={done} to={sentTo} reduced={reduced} />}
        {readers && <Readers readers={readers} done={done} reduced={reduced} />}
      </div>}
    </div>
  </section>;
});

NewsletterSignup.displayName = "NewsletterSignup";

const variantOptions = [{ value: "inline", label: "Inline" }, { value: "card", label: "Card" }];

/** Preview: both layouts. Subscribing is simulated and nothing is sent; the switch makes the next send fail. */
export function NewsletterSignupBlock() {
  const [variant, setVariant] = useState<NewsletterVariant>("inline");
  const [fail, setFail] = useState(false);
  const switchId = useId();
  const simulate = () => new Promise<void>((resolve, reject) => setTimeout(() => fail ? reject(new Error("Simulated failure")) : resolve(), 1100));
  return <div className={styles.preview}>
    <div className={styles.controls}>
      <SegmentedControl label="Newsletter layout" options={variantOptions} value={variant} onValueChange={next => setVariant(next as NewsletterVariant)} />
      <div className={styles.simulate}>
        <Switch id={switchId} checked={fail} onCheckedChange={setFail} />
        <label htmlFor={switchId}>Fail the next send</label>
      </div>
    </div>
    <div className={styles.frame}>
      <NewsletterSignup key={variant} variant={variant} onSubscribe={simulate} />
    </div>
    <p className={styles.caption}>Subscribing is simulated in this preview. Nothing is sent.</p>
  </div>;
}

export default NewsletterSignupBlock;
