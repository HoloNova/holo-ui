"use client";

import { AnimatePresence, LayoutGroup, animate, motion, useMotionValue, useReducedMotion, type Transition, type Variants } from "motion/react";
import { Check, KeyRound } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useId, useRef, useState, type FormEvent } from "react";

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
const ARC_SIGN_IN_STYLES = `.arc-sign-in-signIn { container: sign-in / inline-size; width: min(100%, 432px); min-width: 0; overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius-surface); background: var(--surface); color: var(--foreground); font-family: var(--font-body); letter-spacing: var(--tracking-body); }
/* Clips the leaving step while the height glides. Steps carry their own padding, so focus rings never reach the clip. */
.arc-sign-in-viewport { overflow: hidden; }
/* The leaving step pops out against this box. */
.arc-sign-in-track { position: relative; }
.arc-sign-in-step { display: grid; min-width: 0; padding: var(--space-8); }

.arc-sign-in-heading { display: grid; gap: var(--space-2); margin-bottom: var(--space-6); }
.arc-sign-in-heading h2 { margin: 0; font-family: var(--font-display); font-size: var(--text-3xl); font-weight: 400; letter-spacing: var(--tracking-display); line-height: var(--leading-display); text-wrap: balance; outline: none; }
.arc-sign-in-heading p { margin: 0; color: var(--text-secondary); font-size: var(--text-sm); line-height: var(--leading-body); text-wrap: pretty; }
.arc-sign-in-heading .arc-sign-in-email { overflow-wrap: anywhere; }

.arc-sign-in-form { display: grid; gap: var(--space-4); }
/* No gap inside: a closing suggestion row would otherwise leave a gap behind until it unmounts. */
.arc-sign-in-fieldGroup { display: grid; min-width: 0; }
.arc-sign-in-wide { width: 100%; }
.arc-sign-in-suggestion { overflow: hidden; }
.arc-sign-in-suggestion p { margin: 0; padding: var(--space-2) 0 var(--space-1); color: var(--text-secondary); font-size: var(--text-xs); line-height: var(--leading-body); overflow-wrap: anywhere; }
.arc-sign-in-textButton { border: 0; border-radius: 4px; padding: 0; background: none; color: var(--foreground); font: inherit; font-weight: 500; text-decoration: underline; text-decoration-color: var(--border-strong); text-underline-offset: 3px; cursor: pointer; transition: text-decoration-color var(--duration-fast) var(--ease-standard); }

.arc-sign-in-divider { display: flex; align-items: center; gap: var(--space-3); margin: var(--space-5) 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1; }
.arc-sign-in-divider::before, .arc-sign-in-divider::after { flex: 1; height: 1px; background: var(--border); content: ""; }
.arc-sign-in-alternatives { display: grid; gap: var(--space-2); }
.arc-sign-in-sso { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-2); }
.arc-sign-in-sso .arc-sign-in-ssoButton { min-width: 0; padding-inline: var(--space-2); }
.arc-sign-in-providerMark { flex: none; }
@media (max-width: 380px) { .arc-sign-in-sso .arc-sign-in-ssoButton { gap: 6px; font-size: var(--text-xs); } }

/* The account being signed in to. Its avatar is the one that grows into the signed in state. */
.arc-sign-in-identity { display: flex; min-width: 0; align-items: center; gap: var(--space-3); margin-bottom: var(--space-6); border: 1px solid var(--border); border-radius: var(--radius-control); padding: var(--space-2) var(--space-2) var(--space-2) var(--space-3); }
.arc-sign-in-identityEmail { flex: 1; min-width: 0; font-size: var(--text-sm); line-height: var(--leading-body); overflow-wrap: anywhere; }
.arc-sign-in-identity > button { flex: none; }
.arc-sign-in-avatarMover { position: relative; z-index: 1; display: inline-flex; flex: none; }
.arc-sign-in-avatarSmall { width: 32px; height: 32px; font-size: 11px; }
.arc-sign-in-avatarLarge { position: absolute; inset: 4px; font-size: 26px; }
/* Both steps render the large photo and size it here, so the morph never waits on a second image. */
.arc-sign-in-avatarMover .arc-sign-in-avatarFill { width: 100%; height: 100%; font-size: inherit; }

.arc-sign-in-resend { position: relative; display: inline-flex; min-height: var(--control-height-sm); align-items: center; justify-self: start; margin: var(--space-3) 0 calc(var(--space-2) * -1) calc(var(--space-2) * -1); border: 0; border-radius: var(--radius-pill); padding: 0 var(--space-2); background: none; color: var(--foreground); font: inherit; font-size: var(--text-sm); font-weight: 500; line-height: var(--leading-body); cursor: pointer; transition: color var(--duration-fast) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard); }
.arc-sign-in-resend[aria-disabled="true"] { color: var(--text-muted); font-weight: 400; cursor: default; }
.arc-sign-in-resendLabel { display: inline-flex; align-items: baseline; gap: .3em; white-space: nowrap; }
.arc-sign-in-time { display: inline-flex; font-variant-numeric: tabular-nums; }
.arc-sign-in-timeColumn { position: relative; display: inline-flex; justify-content: center; }
.arc-sign-in-timeColumn > span { display: inline-block; }

.arc-sign-in-avatarStage { position: relative; width: 96px; height: 96px; margin: 0 0 var(--space-6) -4px; }
.arc-sign-in-ring { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; color: var(--success); transform: rotate(-90deg); }
.arc-sign-in-badge { position: absolute; right: 2px; bottom: 4px; z-index: 2; display: grid; width: 26px; height: 26px; place-items: center; border: 2px solid var(--surface); border-radius: var(--radius-pill); background: var(--success); color: var(--surface); }
.arc-sign-in-details { display: grid; margin: 0 0 var(--space-6); border-top: 1px solid var(--border); padding: 0; }
.arc-sign-in-details div { display: flex; justify-content: space-between; gap: var(--space-4); border-bottom: 1px solid var(--border); padding: var(--space-3) 0; font-size: var(--text-sm); line-height: var(--leading-body); }
.arc-sign-in-details dt { color: var(--text-secondary); }
.arc-sign-in-details dd { margin: 0; text-align: right; }

.arc-sign-in-footer { display: flex; min-height: 48px; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-1) var(--space-4); border-top: 1px solid var(--border); padding: var(--space-3) var(--space-8); color: var(--text-muted); font-size: var(--text-xs); line-height: var(--leading-body); }
.arc-sign-in-status { position: relative; display: block; min-width: 0; flex: 1 1 12rem; }
.arc-sign-in-switch { color: var(--text-secondary); white-space: nowrap; }
.arc-sign-in-switch .arc-sign-in-textButton { text-decoration-color: transparent; }
.arc-sign-in-status > span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.arc-sign-in-srOnly { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

@media (hover: hover) and (pointer: fine) {
  .arc-sign-in-textButton:hover { text-decoration-color: currentColor; }
  .arc-sign-in-resend:not([aria-disabled="true"]):hover { background: var(--surface-muted); }
}

@container sign-in (max-width: 380px) {
  .arc-sign-in-step { padding: var(--space-6) var(--space-5); }
  .arc-sign-in-heading h2 { font-size: var(--text-2xl); }
  .arc-sign-in-identity { gap: var(--space-2); padding-left: var(--space-2); }
  .arc-sign-in-footer { padding-inline: var(--space-5); }
}
@media (max-width: 480px) { .arc-sign-in-signIn { border-radius: var(--radius-panel); } }
@media (prefers-reduced-motion: reduce) { .arc-sign-in-textButton, .arc-sign-in-resend { transition: none; } }
`;

const styles: Record<string, string> = new Proxy({
  "alternatives": "arc-sign-in-alternatives",
  "avatarFill": "arc-sign-in-avatarFill",
  "avatarLarge": "arc-sign-in-avatarLarge",
  "avatarMover": "arc-sign-in-avatarMover",
  "avatarSmall": "arc-sign-in-avatarSmall",
  "avatarStage": "arc-sign-in-avatarStage",
  "badge": "arc-sign-in-badge",
  "details": "arc-sign-in-details",
  "divider": "arc-sign-in-divider",
  "email": "arc-sign-in-email",
  "fieldGroup": "arc-sign-in-fieldGroup",
  "footer": "arc-sign-in-footer",
  "form": "arc-sign-in-form",
  "heading": "arc-sign-in-heading",
  "identity": "arc-sign-in-identity",
  "identityEmail": "arc-sign-in-identityEmail",
  "providerMark": "arc-sign-in-providerMark",
  "resend": "arc-sign-in-resend",
  "resendLabel": "arc-sign-in-resendLabel",
  "ring": "arc-sign-in-ring",
  "signIn": "arc-sign-in-signIn",
  "srOnly": "arc-sign-in-srOnly",
  "sso": "arc-sign-in-sso",
  "ssoButton": "arc-sign-in-ssoButton",
  "status": "arc-sign-in-status",
  "step": "arc-sign-in-step",
  "suggestion": "arc-sign-in-suggestion",
  "switch": "arc-sign-in-switch",
  "textButton": "arc-sign-in-textButton",
  "time": "arc-sign-in-time",
  "timeColumn": "arc-sign-in-timeColumn",
  "track": "arc-sign-in-track",
  "viewport": "arc-sign-in-viewport",
  "wide": "arc-sign-in-wide"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-sign-in-${prop}`,
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



type Step = "email" | "code" | "done";
type Provider = "Google" | "Apple" | "GitHub";
export type SignInMethod = "Email code" | "Passkey" | Provider;
export interface SignInAccount { name: string; email: string; photo?: string }
export interface SignInProps {
  /** The code the simulated email contains. */
  demoCode?: string;
  /** Called once the simulated sign in succeeds. */
  onSignIn?: (account: SignInAccount, method: SignInMethod) => void;
}
type StepCustom = { direction: number; reduce: boolean; still?: boolean };

const RESEND_SECONDS = 30;
const providers: Provider[] = ["Google", "Apple", "GitHub"];
/** The official four-colour Google "G"; Apple and GitHub ship monochrome marks, drawn in currentColor below. */
function GoogleLogo() {
  return <svg className={styles.providerMark} width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>;
}
const providerMarks: Record<Provider, string> = {
  Google: "M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z",
  Apple: "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701",
  GitHub: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
};
const people: SignInAccount[] = [
  { name: "Emma Collins", email: "emma@northwind.studio", photo: avatar("emma-collins") },
  { name: "Marcus Johnson", email: "marcus@northwind.studio", photo: avatar("marcus-johnson") },
  { name: "Ava Mitchell", email: "ava@northwind.studio", photo: avatar("ava-mitchell") },
  { name: "Jasmine Brooks", email: "jasmine@northwind.studio", photo: avatar("jasmine-brooks") },
  { name: "Sofia Ramirez", email: "sofia@northwind.studio", photo: avatar("sofia-ramirez") },
];
const domainFixes: Record<string, string> = { "gmial.com": "gmail.com", "gamil.com": "gmail.com", "gmai.com": "gmail.com", "gnail.com": "gmail.com", "gmail.co": "gmail.com", "hotmial.com": "hotmail.com", "outlok.com": "outlook.com", "outlook.co": "outlook.com", "iclod.com": "icloud.com", "icoud.com": "icloud.com", "yaho.com": "yahoo.com" };

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
function suggestionFor(value: string) {
  const [local, domain, extra] = value.trim().toLowerCase().split("@");
  return local && domain && extra === undefined && domainFixes[domain] ? `${local}@${domainFixes[domain]}` : "";
}
/** Known teammates keep their photo; anyone else gets a name from their address and an initials avatar. */
function accountFor(value: string): SignInAccount {
  const email = value.trim().toLowerCase();
  const parts = email.split("@")[0].split(/[._+-]+/).filter(Boolean);
  const known = people.find(person => person.name.toLowerCase().split(" ")[0] === parts[0]);
  if (known) return { ...known, email };
  return { name: parts.slice(0, 2).map(part => part[0].toUpperCase() + part.slice(1)).join(" ") || "Arc member", email };
}

const stepMotion: Variants = {
  enter: ({ direction, reduce, still }: StepCustom) => still ? { opacity: 1, x: 0, filter: "blur(0px)" } : reduce ? { opacity: 0 } : { opacity: 0, x: direction * 28, filter: `blur(${motionTokens.blur.soft}px)` },
  center: ({ reduce }: StepCustom) => ({ opacity: 1, x: 0, filter: "blur(0px)", transition: reduce ? { duration: motionTokens.duration.instant } : { x: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease: motionTokens.ease.enter, delay: .05 }, filter: { duration: motionTokens.duration.standard, ease: motionTokens.ease.enter } } }),
  exit: ({ direction, reduce }: StepCustom) => reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, x: direction * -20, filter: `blur(${motionTokens.blur.soft}px)`, transition: { x: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.exit, ease: motionTokens.ease.standard }, filter: { duration: motionTokens.duration.exit } } },
};
/** Seconds roll down while the timer runs and back up when a new code restarts it. */
const roll: Variants = {
  enter: (direction: number) => ({ opacity: 0, y: `${-0.7 * direction}em`, filter: `blur(${motionTokens.blur.subtle}px)` }),
  center: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: (direction: number) => ({ opacity: 0, y: `${0.7 * direction}em`, filter: `blur(${motionTokens.blur.subtle}px)` }),
};

function RollingTime({ seconds, reduce }: { seconds: number; reduce: boolean }) {
  const [shown, setShown] = useState({ seconds, direction: 1 });
  if (shown.seconds !== seconds) setShown({ seconds, direction: seconds < shown.seconds ? 1 : -1 });
  const text = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  const transition: Transition = reduce ? { duration: 0 } : { y: motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast }, filter: { duration: motionTokens.duration.fast } };
  return <span className={styles.time}>{text.split("").map((character, index) => <span key={index} className={styles.timeColumn}>
    <AnimatePresence initial={false} mode="popLayout" custom={shown.direction}><motion.span key={character} custom={shown.direction} variants={roll} initial="enter" animate="center" exit="exit" transition={transition}>{character}</motion.span></AnimatePresence>
  </span>)}</span>;
}

/** The card follows its content on a spring only while the step changes; otherwise it stays auto, so field messages open without lag. */
function useStepHeight(step: Step, reduce: boolean) {
  const track = useRef<HTMLDivElement>(null);
  const height = useMotionValue<number | "auto">("auto");
  const measured = useRef(0);
  const gliding = useRef(false);
  const lastStep = useRef(step);
  const glide = useCallback((to: number) => {
    gliding.current = true;
    animate(height, to, { ...motionTokens.spring.smooth, onComplete: () => { gliding.current = false; height.jump("auto"); } });
  }, [height]);
  useEffect(() => {
    const node = track.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      measured.current = entry.borderBoxSize?.[0]?.blockSize ?? node.offsetHeight;
      if (gliding.current) glide(measured.current);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [glide]);
  useLayoutEffect(() => {
    if (lastStep.current === step) return;
    lastStep.current = step;
    const current = height.get();
    const from = typeof current === "number" ? current : measured.current;
    const to = track.current?.offsetHeight ?? 0;
    if (reduce || !from || !to) { gliding.current = false; height.jump("auto"); return; }
    if (current === "auto") height.jump(from);
    glide(to);
  }, [step, reduce, height, glide]);
  return { track, height };
}

export function SignIn({ demoCode = "123456", onSignIn }: SignInProps) {
  const id = useId();
  const reduce = !!useReducedMotion();
  const [step, setStep] = useState<Step>("email");
  const [direction, setDirection] = useState(1);
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const [busy, setBusy] = useState<null | "email" | "code" | "passkey" | Provider>(null);
  const [account, setAccount] = useState<SignInAccount>(people[0]);
  const [method, setMethod] = useState<SignInMethod>("Email code");
  const [status, setStatus] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);
  const focusNext = useRef<"email" | "done" | null>(null);
  const timers = useRef<number[]>([]);
  const { track, height } = useStepHeight(step, reduce);

  const emailError = (touched || attempted) && !isEmail(email) ? (email.trim() ? "Enter a full address, like name@example.com." : "Enter your email address.") : "";
  const suggestion = touched || attempted ? suggestionFor(email) : "";
  const custom: StepCustom = { direction, reduce };
  const avatarTransition: Transition = reduce ? { duration: 0 } : motionTokens.spring.morph;
  const rise = (index: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 10, filter: `blur(${motionTokens.blur.soft}px)` },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: (reduce ? { duration: motionTokens.duration.instant } : { y: { ...motionTokens.spring.smooth, delay: .14 + index * motionTokens.stagger.line }, opacity: { duration: motionTokens.duration.standard, ease: motionTokens.ease.enter, delay: .14 + index * motionTokens.stagger.line }, filter: { duration: motionTokens.duration.standard, delay: .14 + index * motionTokens.stagger.line } }) as Transition,
  });

  useEffect(() => { const pending = timers.current; return () => pending.forEach(window.clearTimeout); }, []);
  useEffect(() => {
    if (step !== "code" || resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn(seconds => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [step, resendIn]);
  useEffect(() => {
    const target = focusNext.current;
    focusNext.current = null;
    if (target === "email") { emailRef.current?.focus(); emailRef.current?.select(); }
    if (target === "done") doneRef.current?.focus();
  }, [step]);

  function later(run: () => void, ms: number) { timers.current.push(window.setTimeout(run, ms)); }
  function go(next: Step, towards: number, focus: "email" | "done" | null = null) { focusNext.current = focus; setDirection(towards); setStep(next); }
  const focusCode = () => codeRef.current?.querySelector("input")?.focus();

  function complete(next: SignInAccount, how: SignInMethod) {
    setBusy(null);
    setAccount(next);
    setMethod(how);
    go("done", 1, "done");
    setStatus(`Signed in with ${how === "Email code" ? "an email code" : how}`);
    onSignIn?.(next, how);
  }

  function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setAttempted(true);
    if (!isEmail(email)) { emailRef.current?.focus(); return; }
    setBusy("email");
    setStatus("Sending a code");
    later(() => {
      setBusy(null);
      setAccount(accountFor(email));
      setCode("");
      setCodeError("");
      setResendIn(RESEND_SECONDS);
      go("code", 1);
      setStatus("Code sent");
    }, 800);
  }

  function applySuggestion() {
    setEmail(suggestion);
    setStatus(`Email changed to ${suggestion}`);
    emailRef.current?.focus();
  }

  function verify(value: string) {
    if (busy) return;
    if (value.length < 6) { setCodeError("Enter all 6 digits."); focusCode(); return; }
    setBusy("code");
    setStatus("Checking code");
    later(() => {
      if (value === demoCode) { complete(account, "Email code"); return; }
      setBusy(null);
      setCode("");
      setCodeError("That code didn't match. Check the latest email and try again.");
      setStatus("Code didn't match");
      focusCode();
    }, 700);
  }

  function changeCode(value: string) {
    if (busy) return;
    setCode(value);
    if (codeError && value) setCodeError("");
    if (value.length === 6) verify(value);
  }

  function resend() {
    if (busy || resendIn > 0) return;
    setResendIn(RESEND_SECONDS);
    setCode("");
    setCodeError("");
    setStatus("New code sent");
    focusCode();
  }

  function changeEmail() {
    if (busy) return;
    setAttempted(false);
    go("email", -1, "email");
    setStatus("Edit your email");
  }

  function signInWith(how: "passkey" | Provider) {
    if (busy) return;
    setBusy(how);
    setStatus(how === "passkey" ? "Waiting for your passkey" : `Opening ${how}`);
    later(() => complete(people[0], how === "passkey" ? "Passkey" : how), how === "passkey" ? 1100 : 900);
  }

  function signOut() {
    setEmail(account.email);
    setTouched(false);
    setAttempted(false);
    setCode("");
    go("email", -1, "email");
    setStatus("Signed out");
  }

  return (
    <section className={styles.signIn} aria-label="Sign in">
      <LayoutGroup id={id}>
        <motion.div className={styles.viewport} style={{ height }}>
          <div ref={track} className={styles.track}>
            <AnimatePresence mode="popLayout" initial={false} custom={custom}>
              {step === "email" && <motion.div key="email" className={styles.step} custom={custom} variants={stepMotion} initial="enter" animate="center" exit="exit">
                <div className={styles.heading}><h2>Sign in to Arc</h2><p>Enter your email and we will send you a 6 digit code.</p></div>
                <form className={styles.form} onSubmit={submitEmail} noValidate>
                  <div className={styles.fieldGroup}>
                    <Input ref={emailRef} label="Email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="name@example.com" value={email} readOnly={busy === "email"} error={emailError} onChange={event => setEmail(event.target.value)} onBlur={() => { if (email.trim()) setTouched(true); }} />
                    <AnimatePresence initial={false}>
                      {suggestion && <motion.div key="suggestion" className={styles.suggestion} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={reduce ? { duration: 0 } : { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast } }}>
                        <p>Did you mean <button type="button" className={styles.textButton} aria-label={`Use ${suggestion}`} onClick={applySuggestion}>{suggestion}</button>?</p>
                      </motion.div>}
                    </AnimatePresence>
                  </div>
                  <Button type="submit" className={styles.wide} loading={busy === "email"}>Continue</Button>
                </form>
                <div className={styles.divider}>or</div>
                <div className={styles.alternatives}>
                  <Button type="button" variant="secondary" className={styles.wide} loading={busy === "passkey"} onClick={() => signInWith("passkey")}><KeyRound size={16} strokeWidth={1.75} aria-hidden="true" />Sign in with a passkey</Button>
                  <div className={styles.sso} role="group" aria-label="Single sign-on">
                    {providers.map(provider => <Button key={provider} type="button" variant="secondary" className={styles.ssoButton} aria-label={`Continue with ${provider}`} loading={busy === provider} onClick={() => signInWith(provider)}>{provider === "Google" ? <GoogleLogo /> : <svg className={styles.providerMark} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={providerMarks[provider]} /></svg>}{provider}</Button>)}
                  </div>
                </div>
              </motion.div>}

              {step === "code" && <motion.div key="code" className={styles.step} custom={custom} variants={stepMotion} initial="enter" animate="center" exit="exit">
                <div className={styles.heading}><h2>Check your email</h2><p>Enter the 6 digit code we sent. It expires in 10 minutes.</p></div>
                <div className={styles.identity}>
                  <motion.span layoutId="account-avatar" className={`${styles.avatarMover} ${styles.avatarSmall}`} transition={avatarTransition}><Avatar name={account.name} src={account.photo} size="xl" className={styles.avatarFill} /></motion.span>
                  <span className={styles.identityEmail}>{account.email}</span>
                  <Button type="button" variant="ghost" size="sm" aria-label="Change email" onClick={changeEmail}>Change</Button>
                </div>
                <form className={styles.form} onSubmit={event => { event.preventDefault(); verify(code); }} noValidate>
                  <div ref={codeRef}><OtpInput label="Verification code" description={`For this demo, the code is ${demoCode}.`} value={code} onChange={changeCode} error={codeError} autoFocus /></div>
                  <Button type="submit" className={styles.wide} loading={busy === "code"}>Verify</Button>
                </form>
                <button type="button" className={styles.resend} aria-disabled={resendIn > 0 || undefined} aria-label={resendIn > 0 ? `Resend code, available in ${resendIn} seconds` : "Resend code"} onClick={resend}>
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span key={resendIn > 0 ? "wait" : "ready"} className={styles.resendLabel} initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, filter: `blur(${motionTokens.blur.soft}px)` }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -4, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast } }} transition={reduce ? { duration: motionTokens.duration.instant } : { duration: motionTokens.duration.standard, ease: motionTokens.ease.enter }}>
                      {resendIn > 0 ? <>Resend code in <RollingTime seconds={resendIn} reduce={reduce} /></> : "Resend code"}
                    </motion.span>
                  </AnimatePresence>
                </button>
              </motion.div>}

              {step === "done" && <motion.div key="done" className={styles.step} custom={{ ...custom, still: true }} variants={stepMotion} initial="enter" animate="center" exit="exit">
                <div className={styles.avatarStage}>
                  <svg className={styles.ring} viewBox="0 0 96 96" aria-hidden="true"><motion.circle cx="48" cy="48" r="47" fill="none" stroke="currentColor" strokeWidth="1.5" initial={reduce ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ pathLength: { duration: motionTokens.duration.considered * 1.25, ease: motionTokens.ease.inOut, delay: .22 }, opacity: { duration: motionTokens.duration.instant, delay: .22 } }} /></svg>
                  <motion.span layoutId="account-avatar" className={`${styles.avatarMover} ${styles.avatarLarge}`} initial={method === "Email code" || reduce ? false : { opacity: 0, scale: .7 }} animate={{ opacity: 1, scale: 1 }} transition={avatarTransition}><Avatar name={account.name} src={account.photo} size="xl" className={styles.avatarFill} /></motion.span>
                  <motion.span className={styles.badge} aria-hidden="true" initial={reduce ? false : { opacity: 0, scale: .4 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...motionTokens.spring.snappy, delay: .78 }}><Check size={14} strokeWidth={2.25} /></motion.span>
                </div>
                <motion.div className={styles.heading} {...rise(0)}><h2 ref={doneRef} tabIndex={-1}>Welcome back, {account.name.split(" ")[0]}</h2><p className={styles.email}>{account.email}</p></motion.div>
                <motion.dl className={styles.details} {...rise(1)}>
                  <div><dt>Signed in with</dt><dd>{method}</dd></div>
                  <div><dt>This browser</dt><dd>Remembered for 30 days</dd></div>
                </motion.dl>
                <motion.div {...rise(2)}><Button type="button" variant="secondary" className={styles.wide} onClick={signOut}>Sign out</Button></motion.div>
              </motion.div>}
            </AnimatePresence>
          </div>
        </motion.div>
      </LayoutGroup>

      <footer className={styles.footer}>
        <p className={styles.srOnly} role="status" aria-live="polite">{status}</p>
        <span className={styles.status} aria-hidden="true">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={status} initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, filter: `blur(${motionTokens.blur.soft}px)` }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -4, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast } }} transition={reduce ? { duration: motionTokens.duration.instant } : { duration: motionTokens.duration.standard, ease: motionTokens.ease.enter }}>{status}</motion.span>
          </AnimatePresence>
        </span>
        <span className={styles.switch}>No account? <button type="button" className={styles.textButton} onClick={() => setStatus("Sign up opens in your app")}>Sign up</button></span>
      </footer>
    </section>
  );
}

export default SignIn;
