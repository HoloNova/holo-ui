"use client";

import type { FormEvent, KeyboardEvent, ReactNode } from "react";
import type { Variants } from "motion/react";
import { AnimatePresence, LayoutGroup, motion, useAnimate, useIsPresent, useReducedMotion } from "motion/react";
import { Check, Clock, Mail, MessageCircle, Phone, Users } from "lucide-react";
import { forwardRef, useEffect, useId, useLayoutEffect, useRef, useState } from "react";

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
const ARC_CONTACT_SECTION_STYLES = `.arc-contact-section-contact { container: contact / inline-size; background: var(--background); color: var(--foreground); font-family: var(--font-body); letter-spacing: var(--tracking-body); }
.arc-contact-section-tabular { font-variant-numeric: tabular-nums; }

.arc-contact-section-inner { display: grid; max-width: 1120px; gap: var(--space-10); margin: 0 auto; padding: var(--space-20) var(--space-8); }
.arc-contact-section-contact[data-variant="form"] .arc-contact-section-inner { grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr); align-items: start; gap: var(--space-12); }
.arc-contact-section-intro { display: grid; align-content: start; gap: var(--space-3); max-width: 520px; }
.arc-contact-section-title { margin: 0; font-family: var(--font-display); font-size: clamp(1.75rem, 1rem + 3cqi, var(--text-4xl)); font-weight: 500; letter-spacing: var(--tracking-display); line-height: var(--leading-display); text-wrap: balance; }
.arc-contact-section-description { margin: 0; color: var(--text-secondary); font-size: var(--text-base); line-height: 1.5; text-wrap: pretty; }
.arc-contact-section-facts { display: grid; gap: var(--space-2); margin: var(--space-4) 0 0; padding: 0; list-style: none; }
.arc-contact-section-facts li { display: flex; min-height: 32px; align-items: center; gap: var(--space-2); color: var(--text-secondary); font-size: var(--text-sm); }
.arc-contact-section-facts svg { flex: none; }

/* Morphing surface: height springs between faces; the leaving face floats out of flow. */
.arc-contact-section-morph { position: relative; overflow: hidden; }
.arc-contact-section-face { width: 100%; }

.arc-contact-section-formCard { border: 1px solid var(--border); border-radius: 28px; background: var(--surface); }
.arc-contact-section-formCard > .arc-contact-section-face { padding: var(--space-6); }
.arc-contact-section-formBody { display: grid; gap: var(--space-5); }
.arc-contact-section-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-4); }
.arc-contact-section-topicField { display: grid; }
.arc-contact-section-fieldLabel { margin-bottom: var(--space-2); color: var(--foreground); font-size: var(--text-sm); font-weight: 500; line-height: var(--leading-body); }
.arc-contact-section-topics { display: flex; flex-wrap: wrap; gap: var(--space-1); }
.arc-contact-section-topic { position: relative; isolation: isolate; height: var(--control-height-sm); border: 1px solid var(--border); border-radius: var(--radius-pill); padding: 0 var(--space-4); background: none; color: var(--text-secondary); font: inherit; font-size: var(--text-sm); font-weight: 500; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: color var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard); }
.arc-contact-section-topic[aria-checked="true"] { border-color: transparent; color: var(--accent-foreground); }
@media (hover: hover) and (pointer: fine) { .arc-contact-section-topic:not([aria-checked="true"]):hover { border-color: var(--border-strong); color: var(--foreground); } }
.arc-contact-section-topicHighlight { position: absolute; z-index: -1; inset: -1px; border-radius: inherit; background: var(--accent); }
.arc-contact-section-failure { overflow: hidden; margin: 0; color: var(--danger); font-size: var(--text-sm); }
.arc-contact-section-submitRow { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-3) var(--space-4); }
.arc-contact-section-fine { margin: 0; color: var(--text-muted); font-size: var(--text-sm); }

.arc-contact-section-success { display: grid; justify-items: center; gap: var(--space-3); padding: var(--space-10) var(--space-2); text-align: center; }
.arc-contact-section-successMark { display: grid; width: 52px; height: 52px; place-items: center; margin-bottom: var(--space-2); border-radius: 50%; background: color-mix(in oklch, var(--success) 13%, transparent); color: var(--success); }
.arc-contact-section-successMark svg { width: 26px; height: 26px; }
.arc-contact-section-successTitle { margin: 0; font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 500; letter-spacing: var(--tracking-display); line-height: var(--leading-display); }
.arc-contact-section-successText { max-width: 360px; margin: 0 0 var(--space-3); color: var(--text-secondary); font-size: var(--text-sm); line-height: 1.55; }

/* Channels: a tab list beside one detail surface that morphs to each channel. */
.arc-contact-section-channels { display: grid; grid-template-columns: minmax(220px, 300px) minmax(0, 1fr); align-items: start; gap: var(--space-6); }
.arc-contact-section-channelList { display: grid; gap: 2px; }
.arc-contact-section-channel { position: relative; isolation: isolate; display: flex; align-items: center; gap: var(--space-3); border: 0; border-radius: 16px; padding: var(--space-3) var(--space-4); background: none; color: var(--foreground); font: inherit; text-align: left; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.arc-contact-section-channelHighlight { position: absolute; z-index: -1; inset: 0; border-radius: inherit; background: var(--surface-muted); }
.arc-contact-section-channelIcon { display: flex; flex: none; color: var(--text-muted); transition: color var(--duration-fast) var(--ease-standard); }
.arc-contact-section-channel[aria-selected="true"] .arc-contact-section-channelIcon { color: var(--accent); }
.arc-contact-section-channelText { display: grid; gap: 1px; min-width: 0; }
.arc-contact-section-channelText > span:first-child { font-size: var(--text-sm); font-weight: 500; }
.arc-contact-section-channelText > span:last-child { overflow: hidden; color: var(--text-muted); font-size: var(--text-xs); text-overflow: ellipsis; white-space: nowrap; }
@media (hover: hover) and (pointer: fine) { .arc-contact-section-channel:hover .arc-contact-section-channelIcon { color: var(--foreground); } }
.arc-contact-section-channelPanel { border: 1px solid var(--border); border-radius: 24px; background: var(--surface); }
.arc-contact-section-channelPanel > .arc-contact-section-face { padding: var(--space-6); }
.arc-contact-section-channelDetail { display: grid; justify-items: start; gap: var(--space-3); }
.arc-contact-section-channelDetail h3 { margin: 0; font-size: var(--text-lg); font-weight: 500; }
.arc-contact-section-channelDetail p { max-width: 480px; margin: 0 0 var(--space-2); color: var(--text-secondary); font-size: var(--text-sm); line-height: 1.6; }
.arc-contact-section-copyRow { display: flex; width: min(100%, 360px); align-items: center; justify-content: space-between; gap: var(--space-3); border: 1px solid var(--border); border-radius: var(--radius-control); padding: 4px 4px 4px var(--space-4); font-size: var(--text-sm); }
.arc-contact-section-copyRow > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.arc-contact-section-confirm { display: grid; justify-items: start; gap: var(--space-2); }
.arc-contact-section-confirmNote { overflow: hidden; color: var(--text-secondary); font-size: var(--text-sm); }
.arc-contact-section-agent { display: flex; align-items: center; gap: var(--space-2); padding-top: var(--space-1); }
.arc-contact-section-agent strong { color: var(--foreground); font-weight: 500; }

/* Offices */
.arc-contact-section-offices { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-4); margin: 0; padding: 0; list-style: none; }
.arc-contact-section-office { display: grid; align-content: start; gap: var(--space-3); border: 1px solid var(--border); border-radius: 24px; padding: var(--space-6); background: var(--surface); }
.arc-contact-section-officeHead { display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-3); }
.arc-contact-section-officeHead h3 { margin: 0; font-size: var(--text-lg); font-weight: 500; }
.arc-contact-section-officeTime { display: inline-flex; flex: none; align-items: center; gap: 6px; color: var(--text-secondary); font-size: var(--text-sm); }
.arc-contact-section-officeTime svg { align-self: center; }
.arc-contact-section-officeStatus { display: inline-flex; align-items: center; gap: var(--space-2); color: var(--text-secondary); font-size: var(--text-sm); }
.arc-contact-section-statusDot { width: 7px; height: 7px; border-radius: 50%; background: var(--border-strong); transition: background-color var(--duration-standard) var(--ease-standard); }
.arc-contact-section-officeStatus[data-open] .arc-contact-section-statusDot { background: var(--success); box-shadow: 0 0 0 3px color-mix(in oklch, var(--success) 18%, transparent); }
.arc-contact-section-address { display: grid; margin-top: var(--space-1); color: var(--text-secondary); font-size: var(--text-sm); font-style: normal; line-height: 1.55; }
.arc-contact-section-officeActions { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-2); margin-top: var(--space-2); border-top: 1px solid var(--border-subtle); padding-top: var(--space-3); }
.arc-contact-section-officeLink { color: var(--foreground); font-size: var(--text-sm); text-decoration: none; }
@media (hover: hover) and (pointer: fine) { .arc-contact-section-officeLink:hover { text-decoration: underline; text-underline-offset: 3px; } }

@container contact (max-width: 820px) {
  .arc-contact-section-contact[data-variant="form"] .arc-contact-section-inner { grid-template-columns: minmax(0, 1fr); gap: var(--space-8); }
  .arc-contact-section-channels { grid-template-columns: minmax(0, 1fr); }
  .arc-contact-section-channelList { display: flex; overflow-x: auto; scrollbar-width: none; }
  .arc-contact-section-channelList::-webkit-scrollbar { display: none; }
  .arc-contact-section-channel { flex: none; }
  .arc-contact-section-channelText > span:last-child { display: none; }
}
@container contact (max-width: 520px) {
  .arc-contact-section-inner { padding: var(--space-12) var(--space-4); }
  .arc-contact-section-row { grid-template-columns: minmax(0, 1fr); }
  .arc-contact-section-formCard > .arc-contact-section-face, .arc-contact-section-channelPanel > .arc-contact-section-face { padding: var(--space-5); }
  .arc-contact-section-submitRow > button { width: 100%; }
}

.arc-contact-section-preview { display: grid; width: 100%; justify-items: center; gap: var(--space-4); }
.arc-contact-section-frame { width: 100%; overflow: hidden; border: 1px solid var(--border); border-radius: 20px; background: var(--background); }
.arc-contact-section-previewNote { min-height: 20px; margin: 0; color: var(--text-muted); font-size: var(--text-xs); }

@media (prefers-reduced-motion: reduce) {
  .arc-contact-section-topic, .arc-contact-section-channelIcon, .arc-contact-section-statusDot { transition: none; }
}
`;

const styles: Record<string, string> = new Proxy({
  "address": "arc-contact-section-address",
  "agent": "arc-contact-section-agent",
  "channel": "arc-contact-section-channel",
  "channelDetail": "arc-contact-section-channelDetail",
  "channelHighlight": "arc-contact-section-channelHighlight",
  "channelIcon": "arc-contact-section-channelIcon",
  "channelList": "arc-contact-section-channelList",
  "channelPanel": "arc-contact-section-channelPanel",
  "channelText": "arc-contact-section-channelText",
  "channels": "arc-contact-section-channels",
  "confirm": "arc-contact-section-confirm",
  "confirmNote": "arc-contact-section-confirmNote",
  "contact": "arc-contact-section-contact",
  "copyRow": "arc-contact-section-copyRow",
  "description": "arc-contact-section-description",
  "face": "arc-contact-section-face",
  "facts": "arc-contact-section-facts",
  "failure": "arc-contact-section-failure",
  "fieldLabel": "arc-contact-section-fieldLabel",
  "fine": "arc-contact-section-fine",
  "formBody": "arc-contact-section-formBody",
  "formCard": "arc-contact-section-formCard",
  "frame": "arc-contact-section-frame",
  "inner": "arc-contact-section-inner",
  "intro": "arc-contact-section-intro",
  "morph": "arc-contact-section-morph",
  "office": "arc-contact-section-office",
  "officeActions": "arc-contact-section-officeActions",
  "officeHead": "arc-contact-section-officeHead",
  "officeLink": "arc-contact-section-officeLink",
  "officeStatus": "arc-contact-section-officeStatus",
  "officeTime": "arc-contact-section-officeTime",
  "offices": "arc-contact-section-offices",
  "preview": "arc-contact-section-preview",
  "previewNote": "arc-contact-section-previewNote",
  "row": "arc-contact-section-row",
  "statusDot": "arc-contact-section-statusDot",
  "submitRow": "arc-contact-section-submitRow",
  "success": "arc-contact-section-success",
  "successMark": "arc-contact-section-successMark",
  "successText": "arc-contact-section-successText",
  "successTitle": "arc-contact-section-successTitle",
  "tabular": "arc-contact-section-tabular",
  "title": "arc-contact-section-title",
  "topic": "arc-contact-section-topic",
  "topicField": "arc-contact-section-topicField",
  "topicHighlight": "arc-contact-section-topicHighlight",
  "topics": "arc-contact-section-topics"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-contact-section-${prop}`,
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



export type ContactSectionVariant = "form" | "channels" | "offices";

export interface ContactMessage {
  name: string;
  email: string;
  topic: string;
  message: string;
}

export interface ContactChannel {
  value: string;
  label: string;
  /** One line under the label in the list, such as a response time. */
  meta: string;
  icon?: ReactNode;
  /** The detail shown when the channel is selected. */
  detail: ReactNode;
}

export interface ContactOffice {
  city: string;
  /** IANA time zone, used for the live local time and open status. */
  timeZone: string;
  address: string[];
  email?: string;
  /** Opening hours in local 24 hour time. Defaults to 9 to 18. */
  hours?: [number, number];
}

export interface ContactSectionProps {
  /** `form` validates and morphs into a confirmation, `channels` lists ways to reach you, `offices` shows live local times. */
  variant?: ContactSectionVariant;
  title?: string;
  description?: string;
  /** Topics offered in the form. */
  topics?: string[];
  /** Called with a valid message. Reject to keep the form and show an error; resolve to show the confirmation. */
  onSubmit?: (message: ContactMessage) => void | Promise<void>;
  channels?: ContactChannel[];
  /** Selected channel (controlled). */
  channel?: string;
  defaultChannel?: string;
  onChannelChange?: (value: string) => void;
  offices?: ContactOffice[];
  className?: string;
}

type Bezier = [number, number, number, number];
const enter = [...motionTokens.ease.enter] as Bezier;
const standard = [...motionTokens.ease.standard] as Bezier;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_MESSAGE = 500;

/** Faces slide along one axis in the direction of travel and settle out of a soft blur. */
const faceVariants: Variants = {
  hidden: ({ direction, axis }: { direction: number; axis: "x" | "y" }) => ({ opacity: 0, x: axis === "x" ? direction * 18 : 0, y: axis === "y" ? direction * 18 : 0, filter: `blur(${motionTokens.blur.soft}px)` }),
  shown: { opacity: 1, x: 0, y: 0, filter: "blur(0px)", transition: { x: motionTokens.spring.smooth, y: motionTokens.spring.smooth, opacity: { duration: .24, ease: enter, delay: .04 }, filter: { duration: .28, ease: enter, delay: .04 } } },
  gone: ({ direction, axis }: { direction: number; axis: "x" | "y" }) => ({ opacity: 0, x: axis === "x" ? direction * -12 : 0, y: axis === "y" ? direction * -12 : 0, filter: `blur(${motionTokens.blur.soft}px)`, transition: { duration: .14, ease: standard } }),
};
const fadeVariants: Variants = { hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: .16 } }, gone: { opacity: 0, transition: { duration: .08 } } };

function Face({ children, custom, reduced, className }: { children: ReactNode; custom: { direction: number; axis: "x" | "y" }; reduced: boolean; className?: string }) {
  const present = useIsPresent();
  return <motion.div className={className} data-face="" data-leaving={present ? undefined : ""} inert={!present} custom={custom} variants={reduced ? fadeVariants : faceVariants} initial="hidden" animate="shown" exit="gone">{children}</motion.div>;
}

/**
 * One surface that springs from the height of its old content to the new one when `faceKey` changes, while the faces
 * crossfade along an axis. Between switches the height is automatic, so fields that grow inside it never get clipped.
 */
function MorphPanel({ faceKey, direction = 1, axis = "y", reduced, className, children, ...rest }: { faceKey: string; direction?: number; axis?: "x" | "y"; reduced: boolean; className?: string; children: ReactNode; id?: string; role?: string; "aria-labelledby"?: string }) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const lastKey = useRef(faceKey);
  const lastHeight = useRef(0);
  useEffect(() => {
    const node = scope.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    lastHeight.current = node.offsetHeight;
    const observer = new ResizeObserver(() => { lastHeight.current = node.offsetHeight; });
    observer.observe(node);
    return () => observer.disconnect();
  }, [scope]);
  useLayoutEffect(() => {
    if (lastKey.current === faceKey) return;
    lastKey.current = faceKey;
    const node = scope.current;
    const face = node?.querySelector<HTMLElement>(":scope > [data-face]:not([data-leaving])");
    if (!node || !face || reduced) return;
    const from = lastHeight.current || node.offsetHeight;
    const to = face.offsetHeight;
    if (Math.abs(from - to) < 1) return;
    node.style.setProperty("height", `${from}px`);
    const controls = animate(node, { height: [from, to] }, motionTokens.spring.smooth);
    controls.then(() => node.style.removeProperty("height"));
    return () => { controls.stop(); node.style.removeProperty("height"); };
  }, [faceKey, animate, scope, reduced]);
  return <div ref={scope} className={[styles.morph, className].filter(Boolean).join(" ")} {...rest}>
    <AnimatePresence initial={false} mode="popLayout" custom={{ direction, axis }}>
      <Face key={faceKey} custom={{ direction, axis }} reduced={reduced} className={styles.face}>{children}</Face>
    </AnimatePresence>
  </div>;
}

/** Topic chips as a radio group: a highlight glides to the choice and arrow keys move it. */
function TopicPicker({ topics, value, onChange, reduced }: { topics: string[]; value: string; onChange: (topic: string) => void; reduced: boolean }) {
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  function onKeyDown(event: KeyboardEvent) {
    const delta = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (topics.indexOf(value) + delta + topics.length) % topics.length;
    onChange(topics[next]);
    refs.current[next]?.focus();
  }
  return <div className={styles.topicField}>
    <span id={`${id}-label`} className={styles.fieldLabel}>Topic</span>
    <LayoutGroup id={id}>
      <div className={styles.topics} role="radiogroup" aria-labelledby={`${id}-label`} onKeyDown={onKeyDown}>
        {topics.map((topic, index) => <button key={topic} ref={node => { refs.current[index] = node; }} type="button" role="radio" aria-checked={topic === value} tabIndex={topic === value ? 0 : -1} className={styles.topic} onClick={() => onChange(topic)}>
          {topic === value && <motion.span layoutId="topic" className={styles.topicHighlight} transition={reduced ? { duration: 0 } : motionTokens.spring.morph} aria-hidden="true" />}
          <span>{topic}</span>
        </button>)}
      </div>
    </LayoutGroup>
  </div>;
}

type Errors = Partial<Record<"name" | "email" | "message", string>>;
function validate(values: { name: string; email: string; message: string }): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Enter your name";
  if (!values.email.trim()) errors.email = "Enter your email address";
  else if (!EMAIL.test(values.email.trim())) errors.email = "Enter an email like name@example.com";
  if (values.message.trim().length < 20) errors.message = values.message.trim() ? "Add a little more detail, at least 20 characters" : "Tell us how we can help";
  return errors;
}

function ContactForm({ topics, onSubmit, reduced }: { topics: string[]; onSubmit?: ContactSectionProps["onSubmit"]; reduced: boolean }) {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [topic, setTopic] = useState(topics[0] ?? "");
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [phase, setPhase] = useState<"editing" | "sending" | "sent">("editing");
  const [failure, setFailure] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState({ name: "", email: "" });
  const nameRef = useRef<HTMLInputElement>(null), emailRef = useRef<HTMLInputElement>(null), messageRef = useRef<HTMLTextAreaElement>(null);
  const restoreFocus = useRef(false);
  const successRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (phase === "sent") successRef.current?.focus();
    if (phase === "editing" && restoreFocus.current) { restoreFocus.current = false; nameRef.current?.focus(); }
  }, [phase]);

  const update = (field: keyof typeof values) => (event: { target: { value: string } }) => {
    const next = { ...values, [field]: event.target.value };
    setValues(next);
    if (submitted) setErrors(validate(next));
  };

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (phase !== "editing") return;
    setSubmitted(true);
    setFailure(null);
    const found = validate(values);
    setErrors(found);
    if (found.name) { nameRef.current?.focus(); return; }
    if (found.email) { emailRef.current?.focus(); return; }
    if (found.message) { messageRef.current?.focus(); return; }
    setPhase("sending");
    const payload = { name: values.name.trim(), email: values.email.trim(), topic, message: values.message.trim() };
    try {
      await (onSubmit ? onSubmit(payload) : new Promise(resolve => setTimeout(resolve, 1100)));
      setSentTo({ name: payload.name.split(/\s+/)[0], email: payload.email });
      setPhase("sent");
    } catch {
      setPhase("editing");
      setFailure("We couldn't send your message. Check your connection and try again.");
    }
  }

  function reset() {
    setValues({ name: "", email: "", message: "" });
    setErrors({});
    setSubmitted(false);
    setFailure(null);
    restoreFocus.current = true;
    setPhase("editing");
  }

  const left = MAX_MESSAGE - values.message.length;
  return <MorphPanel faceKey={phase === "sent" ? "sent" : "form"} direction={phase === "sent" ? 1 : -1} reduced={reduced} className={styles.formCard}>
    {phase === "sent"
      ? <div className={styles.success} aria-live="polite">
          <span className={styles.successMark} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduced ? 0 : .42, ease: enter, delay: .16 }} />
            </svg>
          </span>
          <h3 ref={successRef} tabIndex={-1} className={styles.successTitle}>Thanks, {sentTo.name}</h3>
          <p className={styles.successText}>Your message is with our {topic.toLowerCase()} team. We&rsquo;ll reply to {sentTo.email} within one business day.</p>
          <Button variant="secondary" onClick={reset}>Send another message</Button>
        </div>
      : <form className={styles.formBody} onSubmit={submit} noValidate aria-label="Contact form">
          <div className={styles.row}>
            <Input ref={nameRef} label="Name" name="name" autoComplete="name" placeholder="Emma Collins" value={values.name} onChange={update("name")} error={errors.name} readOnly={phase === "sending"} />
            <Input ref={emailRef} label="Work email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="emma@northwind.example" value={values.email} onChange={update("email")} error={errors.email} readOnly={phase === "sending"} />
          </div>
          <TopicPicker topics={topics} value={topic} onChange={setTopic} reduced={reduced} />
          <Textarea ref={messageRef} label="Message" name="message" rows={4} maxLength={MAX_MESSAGE} placeholder="What are you building?" value={values.message} onChange={update("message")} error={errors.message} description={`${left} characters left`} readOnly={phase === "sending"} />
          <AnimatePresence initial={false}>
            {failure && <motion.p key="failure" role="alert" className={styles.failure} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={reduced ? { duration: 0 } : { height: motionTokens.spring.smooth, opacity: { duration: .16 } }}>{failure}</motion.p>}
          </AnimatePresence>
          <div className={styles.submitRow}>
            <p className={styles.fine}>We reply within one business day.</p>
            <Button type="submit" variant="primary" loading={phase === "sending"}>Send message</Button>
          </div>
        </form>}
  </MorphPanel>;
}

const hannah = person("hannah-walsh");
const ICON = { size: 18, strokeWidth: 1.75, "aria-hidden": true } as const;

/** A demo action that confirms in place: the label morphs, and the result stays visible below it. */
function ConfirmAction({ idle, busy, done, note }: { idle: string; busy?: boolean; done: string; note?: ReactNode }) {
  const reduced = !!useReducedMotion();
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return <div className={styles.confirm}>
    <Button variant={state === "done" ? "secondary" : "primary"} loading={state === "busy"} onClick={() => {
      if (state !== "idle") { setState("idle"); return; }
      if (busy) { setState("busy"); timer.current = window.setTimeout(() => setState("done"), 800); } else setState("done");
    }}>
      {state === "done" ? <><Check size={15} strokeWidth={2.25} aria-hidden="true" />{done}</> : idle}
    </Button>
    <div aria-live="polite">
      <AnimatePresence initial={false}>
        {state === "done" && note && <motion.div key="note" className={styles.confirmNote} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={reduced ? { duration: 0 } : { height: motionTokens.spring.smooth, opacity: { duration: .18 } }}>{note}</motion.div>}
      </AnimatePresence>
    </div>
  </div>;
}

export const contactExampleChannels: ContactChannel[] = [
  {
    value: "chat", label: "Chat with support", meta: "Replies in about 4 minutes", icon: <MessageCircle {...ICON} />,
    detail: <>
      <h3>Chat with support</h3>
      <p>Hannah and Jordan are online now. Chat is best for quick questions about installing, theming, or a component that misbehaves.</p>
      <ConfirmAction idle="Start a chat" busy done="Chat started" note={<span className={styles.agent}><Avatar name={hannah.name} src={hannah.src} size="sm" status="online" /><span><strong>{hannah.name}</strong> joined the chat. Say hello.</span></span>} />
    </>,
  },
  {
    value: "email", label: "Email support", meta: "Replies within a business day", icon: <Mail {...ICON} />,
    detail: <>
      <h3>Email support</h3>
      <p>Send screenshots, links, or a reproduction. Every message gets a reply from a person within one business day.</p>
      <div className={styles.copyRow}><span>support@example.com</span><CopyButton value="support@example.com" label="Copy email" /></div>
    </>,
  },
  {
    value: "sales", label: "Talk to sales", meta: "Weekdays, 9am to 6pm PT", icon: <Phone {...ICON} />,
    detail: <>
      <h3>Talk to sales</h3>
      <p>Licensing for a larger team, invoicing, or a security review. Tyler will walk you through it on a 20 minute call.</p>
      <div className={styles.copyRow}><span className={styles.tabular}>+1 (415) 555-0132</span><CopyButton value="+14155550132" label="Copy number" /></div>
      <ConfirmAction idle="Request a call" busy done="Call requested" note="Tyler will email you a few times that work this week." />
    </>,
  },
  {
    value: "community", label: "Ask the community", meta: "4,200 members", icon: <Users {...ICON} />,
    detail: <>
      <h3>Ask the community</h3>
      <p>Designers and engineers who ship with Arc answer questions about components, theming, and motion, usually within the hour.</p>
      <ConfirmAction idle="Open the forum" done="Forum opened" note="The forum opens in a new tab on the live site." />
    </>,
  },
];

export const contactExampleOffices: ContactOffice[] = [
  { city: "San Francisco", timeZone: "America/Los_Angeles", address: ["100 Example Street, Floor 4", "San Francisco, CA 94000"], email: "sf@example.com" },
  { city: "New York", timeZone: "America/New_York", address: ["200 Sample Avenue, Suite 12", "New York, NY 10000"], email: "nyc@example.com" },
  { city: "Lisbon", timeZone: "Europe/Lisbon", address: ["Rua do Exemplo 10, 3º", "1000-000 Lisboa, Portugal"], email: "lisbon@example.com" },
];

function useNow(intervalMs: number) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const timer = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);
  return now;
}

function officeState(office: ContactOffice, now: Date | null) {
  if (!now) return { time: "--:--", open: null as boolean | null };
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: office.timeZone, hour: "numeric", minute: "2-digit", weekday: "short", hourCycle: "h23" }).formatToParts(now);
  const get = (type: string) => parts.find(part => part.type === type)?.value ?? "";
  const hour = Number(get("hour")), weekday = get("weekday");
  const [start, end] = office.hours ?? [9, 18];
  const time = new Intl.DateTimeFormat("en-US", { timeZone: office.timeZone, hour: "numeric", minute: "2-digit" }).format(now);
  return { time, open: weekday !== "Sat" && weekday !== "Sun" && hour >= start && hour < end };
}

const hourLabel = (hour: number) => `${hour % 12 || 12}${hour < 12 || hour === 24 ? "am" : "pm"}`;

function Offices({ offices }: { offices: ContactOffice[] }) {
  const now = useNow(15000);
  return <ul className={styles.offices}>
    {offices.map(office => {
      const { time, open } = officeState(office, now);
      return <li key={office.city} className={styles.office}>
        <div className={styles.officeHead}>
          <h3>{office.city}</h3>
          <span className={styles.officeTime}><Clock size={14} strokeWidth={1.75} aria-hidden="true" /><span className={styles.tabular}>{time}</span></span>
        </div>
        <span className={styles.officeStatus} data-open={open === null ? undefined : open ? "" : undefined} data-closed={open === false ? "" : undefined}>
          <span className={styles.statusDot} aria-hidden="true" />{open === null ? "Checking hours" : open ? `Open until ${hourLabel((office.hours ?? [9, 18])[1])}` : "Closed now"}
        </span>
        <address className={styles.address}>{office.address.map(line => <span key={line}>{line}</span>)}</address>
        <div className={styles.officeActions}>
          {office.email && <a className={styles.officeLink} href={`mailto:${office.email}`}>{office.email}</a>}
          <CopyButton value={office.address.join(", ")} label="Copy address" variant="plain" />
        </div>
      </li>;
    })}
  </ul>;
}

function Channels({ channels, value, onChange, reduced }: { channels: ContactChannel[]; value: string; onChange: (value: string) => void; reduced: boolean }) {
  const id = useId();
  const [direction, setDirection] = useState(1);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const active = channels.find(channel => channel.value === value) ?? channels[0];
  const choose = (next: string) => {
    if (next === active.value) return;
    setDirection(Math.sign(channels.findIndex(channel => channel.value === next) - channels.indexOf(active)) || 1);
    onChange(next);
  };
  function onKeyDown(event: KeyboardEvent) {
    const delta = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 0;
    const edge = event.key === "Home" ? 0 : event.key === "End" ? channels.length - 1 : -1;
    if (!delta && edge < 0) return;
    event.preventDefault();
    const next = edge >= 0 ? edge : (channels.indexOf(active) + delta + channels.length) % channels.length;
    choose(channels[next].value);
    refs.current[next]?.focus();
  }
  return <div className={styles.channels}>
    <LayoutGroup id={id}>
      <div className={styles.channelList} role="tablist" aria-orientation="vertical" aria-label="Ways to reach us" onKeyDown={onKeyDown}>
        {channels.map((channel, index) => {
          const selected = channel.value === active.value;
          return <button key={channel.value} ref={node => { refs.current[index] = node; }} type="button" role="tab" id={`${id}-tab-${channel.value}`} aria-selected={selected} aria-controls={`${id}-panel`} tabIndex={selected ? 0 : -1} className={styles.channel} onClick={() => choose(channel.value)}>
            {selected && <motion.span layoutId="channel" className={styles.channelHighlight} transition={reduced ? { duration: 0 } : motionTokens.spring.morph} aria-hidden="true" />}
            <span className={styles.channelIcon}>{channel.icon}</span>
            <span className={styles.channelText}><span>{channel.label}</span><span>{channel.meta}</span></span>
          </button>;
        })}
      </div>
    </LayoutGroup>
    <MorphPanel faceKey={active.value} direction={direction} axis="y" reduced={reduced} className={styles.channelPanel} id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${active.value}`}>
      <div className={styles.channelDetail}>{active.detail}</div>
    </MorphPanel>
  </div>;
}

/**
 * A contact section in three layouts: a validated form whose card springs into a confirmation, a list of support
 * channels whose detail panel morphs to each channel, and office cards with live local times and open status.
 */
export const ContactSection = forwardRef<HTMLElement, ContactSectionProps>(function ContactSection({
  variant = "form",
  title,
  description,
  topics = ["Sales", "Support", "Partnerships", "Press"],
  onSubmit,
  channels = contactExampleChannels,
  channel: channelProp,
  defaultChannel,
  onChannelChange,
  offices = contactExampleOffices,
  className,
}, ref) {
  const id = useId();
  const reduced = !!useReducedMotion();
  const [innerChannel, setInnerChannel] = useState(defaultChannel ?? channels[0]?.value ?? "");
  const activeChannel = channelProp ?? innerChannel;
  const setChannel = (next: string) => { if (channelProp === undefined) setInnerChannel(next); onChannelChange?.(next); };
  const copy = {
    form: { title: "Talk to our team", description: "Questions about licensing, a bug you can't pin down, or a component you wish existed. A person reads every message." },
    channels: { title: "Get help your way", description: "Pick whatever suits the question. Every channel reaches the same small team." },
    offices: { title: "Visit us", description: "We work across three time zones, so someone is usually awake. Drop by for coffee, just let us know first." },
  }[variant];

  return <section ref={ref} className={[styles.contact, className].filter(Boolean).join(" ")} data-variant={variant} aria-labelledby={`${id}-title`}>
    <div className={styles.inner}>
      <div className={styles.intro}>
        <h2 id={`${id}-title`} className={styles.title}>{title ?? copy.title}</h2>
        <p className={styles.description}>{description ?? copy.description}</p>
        {variant === "form" && <ul className={styles.facts}>
          <li><Clock size={16} strokeWidth={1.75} aria-hidden="true" />Replies within one business day</li>
          <li><Mail size={16} strokeWidth={1.75} aria-hidden="true" /><span>hello@example.com</span><CopyButton value="hello@example.com" label="Copy email" iconOnly variant="plain" /></li>
        </ul>}
      </div>
      {variant === "form" && <ContactForm topics={topics} onSubmit={onSubmit} reduced={reduced} />}
      {variant === "channels" && <Channels channels={channels} value={activeChannel} onChange={setChannel} reduced={reduced} />}
      {variant === "offices" && <Offices offices={offices} />}
    </div>
  </section>;
});

ContactSection.displayName = "ContactSection";

const variantOptions = [{ value: "form", label: "Form" }, { value: "channels", label: "Channels" }, { value: "offices", label: "Offices" }];

/** Preview: the contact section with a switch between its three layouts. Messages are simulated and never sent. */
export function ContactSectionBlock({ variant: initial = "form" }: { variant?: ContactSectionVariant }) {
  const [variant, setVariant] = useState<ContactSectionVariant>(initial);
  return <div className={styles.preview}>
    <SegmentedControl label="Contact layout" options={variantOptions} value={variant} onValueChange={next => setVariant(next as ContactSectionVariant)} />
    <div className={styles.frame}>
      <ContactSection key={variant} variant={variant} />
    </div>
  </div>;
}

export default ContactSectionBlock;
