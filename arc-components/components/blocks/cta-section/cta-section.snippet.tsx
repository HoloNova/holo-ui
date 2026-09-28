"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { ArrowRight, Check, X } from "lucide-react";
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
const ARC_CTA_SECTION_STYLES = `.arc-cta-section-cta { container: cta / inline-size; background: var(--background); color: var(--foreground); font-family: var(--font-body); letter-spacing: var(--tracking-body); }
.arc-cta-section-cta *, .arc-cta-section-cta *::before, .arc-cta-section-cta *::after { box-sizing: border-box; }

.arc-cta-section-title { margin: 0; font-family: var(--font-display); font-size: clamp(1.875rem, 1rem + 3.4cqi, var(--text-4xl)); font-weight: 500; letter-spacing: var(--tracking-display); line-height: var(--leading-display); text-wrap: balance; }
.arc-cta-section-description { margin: 0; color: var(--text-secondary); font-size: var(--text-lg); line-height: 1.5; text-wrap: pretty; }
.arc-cta-section-actions { display: flex; flex-wrap: wrap; gap: var(--space-3); }

/* Actions: the arrow leans forward on hover; links match the button shapes. */
.arc-cta-section-arrow { transition: transform var(--duration-fast) var(--ease-standard); }
@media (hover: hover) and (pointer: fine) { .arc-cta-section-action:hover .arc-cta-section-arrow, .arc-cta-section-linkAction:hover .arc-cta-section-arrow { transform: translateX(3px); } }
.arc-cta-section-linkAction { display: inline-flex; height: var(--control-height-lg); align-items: center; justify-content: center; gap: 8px; border: 1px solid transparent; border-radius: var(--radius-control); padding: 0 20px; font-size: var(--text-sm); font-weight: 500; text-decoration: none; transition: background-color var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard), transform var(--duration-instant) var(--ease-standard); }
.arc-cta-section-linkAction[data-size="sm"] { height: var(--control-height-sm); padding: 0 14px; }
.arc-cta-section-linkAction[data-variant="primary"] { background: var(--foreground); color: var(--background); }
.arc-cta-section-linkAction[data-variant="secondary"] { border-color: var(--border); background: var(--surface); color: var(--foreground); }
.arc-cta-section-linkAction:active { transform: scale(.97); }

/* Centered: a closing section on one quiet surface. */
.arc-cta-section-centeredWrap { max-width: 1120px; margin: 0 auto; padding: var(--space-16) var(--space-8); }
.arc-cta-section-centered { display: grid; justify-items: center; gap: var(--space-4); border: 1px solid var(--border); border-radius: var(--radius-surface); padding: var(--space-24) var(--space-8); background: color-mix(in oklch, var(--surface-muted) 45%, var(--surface)); text-align: center; }
.arc-cta-section-centered .arc-cta-section-title { max-width: 18ch; }
.arc-cta-section-centered .arc-cta-section-description { max-width: 34rem; }
.arc-cta-section-centered .arc-cta-section-actions { justify-content: center; margin-top: var(--space-4); }
.arc-cta-section-note { display: inline-flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: var(--space-3); margin: var(--space-3) 0 0; color: var(--text-muted); font-size: var(--text-sm); }
.arc-cta-section-faces { display: flex; padding-left: 6px; }
.arc-cta-section-faces img { display: block; width: 26px; height: 26px; margin-left: -6px; border: 2px solid var(--surface); border-radius: 50%; object-fit: cover; }

/* Split: copy beside a setup card that completes itself. */
.arc-cta-section-split { display: grid; max-width: 1120px; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: center; gap: var(--space-16); margin: 0 auto; padding: var(--space-24) var(--space-8); }
.arc-cta-section-splitCopy { display: grid; justify-items: start; gap: var(--space-4); }
.arc-cta-section-splitCopy .arc-cta-section-actions { margin-top: var(--space-4); }
.arc-cta-section-points { display: grid; gap: var(--space-2); margin: var(--space-2) 0 0; padding: 0; list-style: none; }
.arc-cta-section-points li { display: flex; align-items: center; gap: var(--space-3); color: var(--text-secondary); font-size: var(--text-sm); }
.arc-cta-section-points svg { flex: none; color: var(--success); }
.arc-cta-section-stage { display: grid; min-height: 380px; place-items: center; border: 1px solid var(--border); border-radius: var(--radius-surface); padding: var(--space-8); background: color-mix(in oklch, var(--surface-muted) 55%, var(--surface)); }

.arc-cta-section-setup { width: min(100%, 360px); border: 1px solid var(--border); border-radius: var(--radius-panel); background: var(--surface-raised); box-shadow: var(--shadow-raised); overflow: hidden; }
.arc-cta-section-setupHead { display: flex; align-items: center; gap: 10px; padding: 16px 18px 14px; }
.arc-cta-section-workspaceMark { display: grid; width: 28px; height: 28px; flex: none; place-items: center; border-radius: 8px; background: var(--foreground); color: var(--background); font-size: var(--text-sm); font-weight: 500; }
.arc-cta-section-setupTitle { font-size: var(--text-sm); font-weight: 500; }
.arc-cta-section-setupStatus { display: inline-grid; margin-left: auto; color: var(--text-muted); font-size: var(--text-xs); justify-items: end; }
.arc-cta-section-setupStatus > span { grid-area: 1 / 1; opacity: 0; transform: translateY(4px); filter: blur(2px); transition: opacity 180ms var(--ease-standard), transform 240ms var(--ease-enter), filter 180ms var(--ease-standard); }
.arc-cta-section-setupStatus > span[data-shown] { opacity: 1; transform: none; filter: blur(0); }
.arc-cta-section-setup[data-done] .arc-cta-section-setupStatus > span:last-child { color: var(--success); font-weight: 500; }
.arc-cta-section-progress { height: 2px; margin: 0 18px; border-radius: 1px; background: var(--border); overflow: hidden; }
.arc-cta-section-progress > span { display: block; height: 100%; background: var(--success); transform-origin: left; transition: transform 520ms var(--ease-in-out); }
.arc-cta-section-steps { display: grid; gap: 2px; margin: 0; padding: 10px 8px 12px; list-style: none; }
.arc-cta-section-step { display: flex; min-height: 44px; align-items: center; gap: 12px; border-radius: 14px; padding: 0 10px; color: var(--text-muted); font-size: var(--text-sm); transition: color 200ms var(--ease-standard), background-color 200ms var(--ease-standard); }
.arc-cta-section-step[data-active] { background: var(--surface-muted); color: var(--foreground); }
.arc-cta-section-step[data-done] { color: var(--foreground); }
.arc-cta-section-stepMark { position: relative; display: grid; width: 20px; height: 20px; flex: none; place-items: center; border: 1.5px dashed var(--border-strong); border-radius: 50%; color: transparent; transition: border-color 200ms var(--ease-standard), background-color 200ms var(--ease-standard), color 200ms var(--ease-standard); }
.arc-cta-section-stepMark svg { transform: scale(.5); opacity: 0; transition: transform var(--duration-spring) var(--ease-spring), opacity 160ms var(--ease-standard); }
.arc-cta-section-step[data-active] .arc-cta-section-stepMark { border-style: solid; border-color: var(--text-muted); }
.arc-cta-section-step[data-done] .arc-cta-section-stepMark { border-style: solid; border-color: var(--success); background: var(--success); color: var(--background); }
.arc-cta-section-step[data-done] .arc-cta-section-stepMark svg { transform: scale(1); opacity: 1; }
.arc-cta-section-stepLabel { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.arc-cta-section-stepFaces { display: flex; margin-left: auto; padding-left: 6px; }
.arc-cta-section-stepFaces img { display: block; width: 22px; height: 22px; margin-left: -6px; border: 2px solid var(--surface-raised); border-radius: 50%; object-fit: cover; opacity: 0; transform: translateX(-6px) scale(.9); transition: opacity 200ms var(--ease-standard), transform var(--duration-spring) var(--ease-spring); }
.arc-cta-section-step[data-done] .arc-cta-section-stepFaces img, .arc-cta-section-step[data-active] .arc-cta-section-stepFaces img { opacity: 1; transform: none; }

/* Banner: one line that closes its gap when dismissed. */
.arc-cta-section-bannerWrap { overflow: hidden; transform-origin: top center; }
.arc-cta-section-bannerPad { max-width: calc(1120px + 2 * var(--space-8)); margin: 0 auto; padding: var(--space-6) var(--space-8); }
.arc-cta-section-banner { display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); border: 1px solid var(--border); border-radius: 20px; padding: 10px 10px 10px 20px; background: var(--surface); }
.arc-cta-section-bannerText { display: flex; min-width: 0; flex-wrap: wrap; align-items: baseline; gap: 2px var(--space-2); margin: 0; font-size: var(--text-sm); line-height: var(--leading-body); }
.arc-cta-section-bannerText strong { font-weight: 500; }
.arc-cta-section-bannerText span { color: var(--text-secondary); }
.arc-cta-section-bannerActions { display: flex; flex: none; align-items: center; gap: var(--space-1); }
.arc-cta-section-dismiss { display: grid; width: var(--control-height-sm); height: var(--control-height-sm); place-items: center; border: 0; border-radius: 50%; background: none; color: var(--text-muted); cursor: pointer; -webkit-tap-highlight-color: transparent; transition: background-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard), transform var(--duration-instant) var(--ease-standard); }
@media (hover: hover) and (pointer: fine) { .arc-cta-section-dismiss:hover { background: var(--surface-muted); color: var(--foreground); } }
.arc-cta-section-dismiss:active { transform: scale(.94); }

@container cta (max-width: 860px) {
  .arc-cta-section-split { grid-template-columns: minmax(0, 1fr); gap: var(--space-10); padding: var(--space-16) var(--space-8); }
  .arc-cta-section-stage { min-height: 320px; }
}
@container cta (max-width: 560px) {
  .arc-cta-section-centeredWrap { padding: var(--space-10) var(--space-4); }
  .arc-cta-section-centered { padding: var(--space-16) var(--space-5); border-radius: 28px; }
  .arc-cta-section-split { padding: var(--space-12) var(--space-4); }
  .arc-cta-section-stage { padding: var(--space-5); border-radius: 28px; }
  .arc-cta-section-description { font-size: var(--text-base); }
  .arc-cta-section-actions { width: 100%; flex-direction: column; }
  .arc-cta-section-actions > * { width: 100%; }
  .arc-cta-section-bannerPad { padding: var(--space-4); }
  .arc-cta-section-banner { align-items: flex-start; flex-direction: column; padding: 16px; }
  .arc-cta-section-bannerActions { width: 100%; justify-content: space-between; }
}

.arc-cta-section-preview { display: grid; width: 100%; justify-items: center; gap: var(--space-4); }
.arc-cta-section-frame { width: 100%; overflow: hidden; border: 1px solid var(--border); border-radius: 20px; background: var(--background); }
.arc-cta-section-restore { display: grid; min-height: 104px; place-items: center; padding: var(--space-6); }

@media (prefers-reduced-motion: reduce) {
  .arc-cta-section-arrow, .arc-cta-section-setupStatus > span, .arc-cta-section-progress > span, .arc-cta-section-step, .arc-cta-section-stepMark, .arc-cta-section-stepMark svg, .arc-cta-section-stepFaces img { transition: none; }
}
`;

const styles: Record<string, string> = new Proxy({
  "action": "arc-cta-section-action",
  "actions": "arc-cta-section-actions",
  "arrow": "arc-cta-section-arrow",
  "banner": "arc-cta-section-banner",
  "bannerActions": "arc-cta-section-bannerActions",
  "bannerPad": "arc-cta-section-bannerPad",
  "bannerText": "arc-cta-section-bannerText",
  "bannerWrap": "arc-cta-section-bannerWrap",
  "centered": "arc-cta-section-centered",
  "centeredWrap": "arc-cta-section-centeredWrap",
  "cta": "arc-cta-section-cta",
  "description": "arc-cta-section-description",
  "dismiss": "arc-cta-section-dismiss",
  "faces": "arc-cta-section-faces",
  "frame": "arc-cta-section-frame",
  "linkAction": "arc-cta-section-linkAction",
  "note": "arc-cta-section-note",
  "points": "arc-cta-section-points",
  "preview": "arc-cta-section-preview",
  "progress": "arc-cta-section-progress",
  "restore": "arc-cta-section-restore",
  "setup": "arc-cta-section-setup",
  "setupHead": "arc-cta-section-setupHead",
  "setupStatus": "arc-cta-section-setupStatus",
  "setupTitle": "arc-cta-section-setupTitle",
  "split": "arc-cta-section-split",
  "splitCopy": "arc-cta-section-splitCopy",
  "stage": "arc-cta-section-stage",
  "step": "arc-cta-section-step",
  "stepFaces": "arc-cta-section-stepFaces",
  "stepLabel": "arc-cta-section-stepLabel",
  "stepMark": "arc-cta-section-stepMark",
  "steps": "arc-cta-section-steps",
  "title": "arc-cta-section-title",
  "workspaceMark": "arc-cta-section-workspaceMark"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-cta-section-${prop}`,
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


// ── Helper: cta-section-data.ts ──

export interface CtaAction {
  label: string;
  /** Renders a link. */
  href?: string;
  onClick?: () => void;
  /** With no href or onClick, the button confirms in place with this label, which suits previews. */
  confirmedLabel?: string;
}

export const ctaCopy = {
  centered: {
    title: "Start building in minutes",
    description: "Set up a workspace, invite your team, and ship the first project this week. Free for 14 days.",
    primary: { label: "Start free trial", confirmedLabel: "Trial started" },
    secondary: { label: "Talk to sales", confirmedLabel: "We'll email you" },
    note: "No credit card required",
  },
  split: {
    title: "Your team, set up before lunch",
    description: "Import your projects, bring everyone in, and keep working the way you already do.",
    primary: { label: "Create a workspace", confirmedLabel: "Workspace created" },
    secondary: { label: "Book a demo", confirmedLabel: "Demo requested" },
    points: ["Import from any tracker in one step", "Single sign-on and audit logs included", "Cancel anytime from settings"],
  },
  banner: {
    title: "Workflows are here",
    description: "Automate handoffs between teams with no code.",
    primary: { label: "See how it works", confirmedLabel: "Opened" },
  },
} satisfies Record<string, { title: string; description: string; primary: CtaAction; secondary?: CtaAction; note?: string; points?: string[] }>;

/** Faces for the social proof line in the centered variant. */
export const ctaFaces = (["sofia-ramirez", "nathan-cole", "chloe-nguyen", "tyler-hayes"] as PersonId[]).map(id => avatar(id));

/** Sample content for the split variant's setup card. */
export const ctaSetup = {
  workspace: "Northwind",
  steps: ["Create workspace", "Import 214 issues", "Invite 4 teammates"],
  faces: (["emma-collins", "marcus-johnson", "jasmine-brooks", "daniel-kim"] as PersonId[]).map(id => avatar(id)),
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



// inlined:  CtaAction 
export type CtaVariant = "centered" | "split" | "banner";

export interface CtaSectionProps {
  /** `centered` is a closing section, `split` sits beside a product visual, `banner` is one dismissible line. */
  variant?: CtaVariant;
  title?: string;
  description?: string;
  primaryAction?: CtaAction;
  /** Not shown in the banner variant. Pass null to hide it. */
  secondaryAction?: CtaAction | null;
  /** Small print under the actions in the centered variant, such as "No credit card required". */
  note?: string;
  /** Faces beside the note in the centered variant. Pass an empty array to hide them. */
  faces?: string[];
  /** Short benefit lines in the split variant. */
  points?: string[];
  /** Replaces the split variant's setup card. */
  visual?: ReactNode;
  /** Banner only: shows a dismiss button and calls this after it closes. */
  onDismiss?: () => void;
  className?: string;
}

type Bezier = [number, number, number, number];
const enter = [...motionTokens.ease.enter] as Bezier;
const standard = [...motionTokens.ease.standard] as Bezier;

/** A link, a callback, or (with neither) a button that confirms in place, so previews always answer a click. */
function Action({ action, variant, size = "lg", arrow }: { action: CtaAction; variant: "primary" | "secondary"; size?: "sm" | "md" | "lg"; arrow?: boolean }) {
  const [confirmed, setConfirmed] = useState(false);
  if (action.href) {
    return <a className={styles.linkAction} data-variant={variant} data-size={size} href={action.href}>
      {action.label}{arrow && <ArrowRight className={styles.arrow} size={16} strokeWidth={2} aria-hidden="true" />}
    </a>;
  }
  const simulated = !action.onClick;
  return <Button
    className={styles.action}
    variant={variant}
    size={size}
    aria-live={simulated ? "polite" : undefined}
    onClick={() => { if (action.onClick) action.onClick(); else setConfirmed(value => !value); }}
  >
    {confirmed
      ? <><Check size={16} strokeWidth={2.25} aria-hidden="true" />{action.confirmedLabel ?? action.label}</>
      : <>{action.label}{arrow && <ArrowRight className={styles.arrow} size={16} strokeWidth={2} aria-hidden="true" />}</>}
  </Button>;
}

/** A setup card that ticks through its steps once it scrolls into view. */
function SetupVisual({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: .5 });
  const total = ctaSetup.steps.length;
  const [step, setStep] = useState(0);
  const shown = reduced ? total : step;

  useEffect(() => {
    if (!inView || reduced) return;
    const timers = ctaSetup.steps.map((_, index) => window.setTimeout(() => setStep(index + 1), 520 + index * 620));
    return () => timers.forEach(window.clearTimeout);
  }, [inView, reduced]);

  return <div ref={ref} className={styles.setup} aria-hidden="true" data-done={shown === total ? "" : undefined}>
    <div className={styles.setupHead}>
      <span className={styles.workspaceMark}>{ctaSetup.workspace.charAt(0)}</span>
      <span className={styles.setupTitle}>{ctaSetup.workspace}</span>
      <span className={styles.setupStatus}>
        <span data-shown={shown < total ? "" : undefined}>Setting up</span>
        <span data-shown={shown === total ? "" : undefined}>Ready</span>
      </span>
    </div>
    <div className={styles.progress}><span style={{ transform: `scaleX(${shown / total})` }} /></div>
    <ol className={styles.steps}>
      {ctaSetup.steps.map((label, index) => {
        const done = index < shown;
        return <li key={label} className={styles.step} data-done={done ? "" : undefined} data-active={index === shown ? "" : undefined}>
          <span className={styles.stepMark}><Check size={12} strokeWidth={2.75} /></span>
          <span className={styles.stepLabel}>{label}</span>
          {index === total - 1 && <span className={styles.stepFaces}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {ctaSetup.faces.map((src, face) => <img key={src} src={src} alt="" width={22} height={22} style={{ transitionDelay: `${face * 60}ms` }} />)}
          </span>}
        </li>;
      })}
    </ol>
  </div>;
}

function Faces({ faces }: { faces: string[] }) {
  if (!faces.length) return null;
  return <span className={styles.faces} aria-hidden="true">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    {faces.slice(0, 4).map(src => <img key={src} src={src} alt="" width={26} height={26} />)}
  </span>;
}

/**
 * A call to action in three shapes: a centered closing section, a split layout beside a setup card that completes
 * itself in view, and a compact banner that closes its gap when dismissed.
 */
export const CtaSection = forwardRef<HTMLElement, CtaSectionProps>(function CtaSection({
  variant = "centered",
  title,
  description,
  primaryAction,
  secondaryAction,
  note,
  faces = ctaFaces,
  points,
  visual,
  onDismiss,
  className,
}, ref) {
  const id = useId();
  const reduced = !!useReducedMotion();
  const [open, setOpen] = useState(true);
  const copy = ctaCopy[variant];
  const heading = title ?? copy.title;
  const text = description ?? copy.description;
  const primary = primaryAction ?? copy.primary;
  const secondary = secondaryAction === null ? null : secondaryAction ?? ("secondary" in copy ? copy.secondary : undefined);
  const classes = [styles.cta, className].filter(Boolean).join(" ");

  if (variant === "banner") {
    return <section ref={ref} className={classes} data-variant="banner" aria-labelledby={`${id}-title`}>
      <AnimatePresence initial={false} onExitComplete={onDismiss}>
        {open && <motion.div
          key="banner"
          className={styles.bannerWrap}
          exit={reduced ? { opacity: 0, transition: { duration: .12 } } : { opacity: 0, height: 0, scale: .98, transition: { height: motionTokens.spring.smooth, scale: { duration: .2, ease: standard }, opacity: { duration: .16, ease: standard } } }}
        >
          <div className={styles.bannerPad}><div className={styles.banner}>
            <p className={styles.bannerText}>
              <strong id={`${id}-title`}>{heading}</strong>
              <span>{text}</span>
            </p>
            <div className={styles.bannerActions}>
              <Action action={primary} variant="primary" size="sm" arrow />
              {onDismiss !== undefined && <button type="button" className={styles.dismiss} aria-label="Dismiss" onClick={() => setOpen(false)}>
                <X size={16} strokeWidth={1.75} aria-hidden="true" />
              </button>}
            </div>
          </div></div>
        </motion.div>}
      </AnimatePresence>
    </section>;
  }

  if (variant === "split") {
    const list = points ?? ctaCopy.split.points;
    return <section ref={ref} className={classes} data-variant="split" aria-labelledby={`${id}-title`}>
      <div className={styles.split}>
        <div className={styles.splitCopy}>
          <h2 id={`${id}-title`} className={styles.title}>{heading}</h2>
          <p className={styles.description}>{text}</p>
          {list.length > 0 && <ul className={styles.points}>
            {list.map(point => <li key={point}><Check size={16} strokeWidth={2} aria-hidden="true" />{point}</li>)}
          </ul>}
          <div className={styles.actions}>
            <Action action={primary} variant="primary" arrow />
            {secondary && <Action action={secondary} variant="secondary" />}
          </div>
        </div>
        <motion.div
          className={styles.stage}
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: .35 }}
          transition={{ duration: .7, ease: enter }}
        >
          {visual ?? <SetupVisual reduced={reduced} />}
        </motion.div>
      </div>
    </section>;
  }

  const small = note ?? ctaCopy.centered.note;
  return <section ref={ref} className={classes} data-variant="centered" aria-labelledby={`${id}-title`}>
    <div className={styles.centeredWrap}>
      <div className={styles.centered}>
        <h2 id={`${id}-title`} className={styles.title}>{heading}</h2>
        <p className={styles.description}>{text}</p>
        <div className={styles.actions}>
          <Action action={primary} variant="primary" arrow />
          {secondary && <Action action={secondary} variant="secondary" />}
        </div>
        {(small || faces.length > 0) && <p className={styles.note}><Faces faces={faces} />{small}</p>}
      </div>
    </div>
  </section>;
});

CtaSection.displayName = "CtaSection";

const variantOptions = [{ value: "centered", label: "Centered" }, { value: "split", label: "Split" }, { value: "banner", label: "Banner" }];

/** Preview: all three shapes. Buttons confirm in place; nothing is sent. */
export function CtaSectionBlock() {
  const [variant, setVariant] = useState<CtaVariant>("centered");
  const [dismissed, setDismissed] = useState(false);
  return <div className={styles.preview}>
    <SegmentedControl label="Call to action layout" options={variantOptions} value={variant} onValueChange={next => { setVariant(next as CtaVariant); setDismissed(false); }} />
    <div className={styles.frame}>
      {variant === "banner" && dismissed
        ? <div className={styles.restore}><Button variant="secondary" size="sm" onClick={() => setDismissed(false)}>Show the banner again</Button></div>
        : <CtaSection key={variant} variant={variant} onDismiss={variant === "banner" ? () => setDismissed(true) : undefined} />}
    </div>
  </div>;
}

export default CtaSectionBlock;
