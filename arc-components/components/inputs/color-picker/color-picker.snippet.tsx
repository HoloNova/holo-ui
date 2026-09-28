"use client";

import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import type { Transition } from "motion/react";
import { AnimatePresence, Reorder, animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { Check, Pipette, Plus } from "lucide-react";
import { useEffect, useEffectEvent, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";

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
const ARC_COLOR_PICKER_STYLES = `/* The swatch is the panel's top left corner: the panel opens over it and grows out of its box. Leave room below and to the right. */
.arc-color-picker-root {
  --picker-fill: var(--surface);
  --picker-width: min(19rem, calc(100vw - 32px));
  --checker: repeating-conic-gradient(oklch(88% 0 0) 0 25%, oklch(100% 0 0) 0 50%) 0 0 / 10px 10px;
  position: relative;
  display: inline-block;
  font-family: var(--font-body);
  letter-spacing: var(--tracking-body);
  color: var(--foreground);
}
:global(:root[data-theme="dark"]) .arc-color-picker-root { --picker-fill: var(--surface-raised); --checker: repeating-conic-gradient(oklch(42% 0 0) 0 25%, oklch(30% 0 0) 0 50%) 0 0 / 10px 10px; }

.arc-color-picker-trigger, .arc-color-picker-head { display: flex; height: 44px; align-items: center; gap: 10px; padding: 6px 16px 6px 6px; }
.arc-color-picker-trigger {
  border: 1px solid var(--border); border-radius: 22px; background: var(--picker-fill); box-shadow: var(--shadow-resting); color: inherit; font: inherit; cursor: pointer;
  -webkit-tap-highlight-color: transparent; transition: border-color var(--duration-fast) var(--ease-standard);
}
.arc-color-picker-triggerText { display: grid; min-width: 0; text-align: start; line-height: 1.15; }
.arc-color-picker-name { color: var(--text-secondary); font-size: var(--text-xs); }
.arc-color-picker-hex { font-size: var(--text-sm); font-variant-numeric: tabular-nums; font-weight: 500; }

/* A chip over a checkerboard, so opacity reads as opacity. */
.arc-color-picker-chip { position: relative; display: block; width: 32px; height: 32px; flex: none; overflow: hidden; border-radius: 50%; background: var(--checker); }
.arc-color-picker-chip > span { position: absolute; inset: 0; border-radius: inherit; box-shadow: inset 0 0 0 1px oklch(0% 0 0 / .1); }

/* The floating layer. Its drop shadow follows the clipped shape, so the shadow grows with the panel. */
.arc-color-picker-float { position: absolute; z-index: 20; top: -1px; left: -1px; filter: drop-shadow(0 18px 36px oklch(0% 0 0 / .12)) drop-shadow(0 2px 6px oklch(0% 0 0 / .06)); pointer-events: none; }
:global(:root[data-theme="dark"]) .arc-color-picker-float { filter: drop-shadow(0 20px 44px oklch(0% 0 0 / .5)); }
.arc-color-picker-float[data-open] { pointer-events: auto; }
.arc-color-picker-panel { width: var(--picker-width); padding-bottom: 14px; border: 1px solid var(--border); border-radius: var(--radius-panel); background: var(--picker-fill); will-change: clip-path; }
.arc-color-picker-head { gap: 10px; padding-right: 6px; }
.arc-color-picker-head .arc-color-picker-triggerText { flex: 1; }
.arc-color-picker-headActions { display: flex; gap: 2px; }
.arc-color-picker-iconButton {
  display: grid; width: 32px; height: 32px; place-items: center; padding: 0; border: 0; border-radius: 12px; background: transparent; color: var(--text-secondary); cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard), transform var(--duration-fast) var(--ease-standard);
}
.arc-color-picker-iconButton:active { transform: scale(.94); }
.arc-color-picker-body { display: grid; gap: 14px; padding: 8px 14px 0; }

/* Saturation runs left to right, brightness bottom to top, over the pure hue. */
.arc-color-picker-area {
  position: relative; height: 164px; border-radius: 16px; cursor: crosshair; touch-action: none;
  background: linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent), var(--picker-hue);
  box-shadow: inset 0 0 0 1px oklch(0% 0 0 / .08);
}
.arc-color-picker-areaThumb, .arc-color-picker-sliderThumb {
  position: absolute; width: 22px; height: 22px; border-radius: 50%; translate: -50% -50%; cursor: grab;
  box-shadow: 0 0 0 3px #fff, 0 2px 8px oklch(0% 0 0 / .3), inset 0 0 0 1px oklch(0% 0 0 / .12);
  transition: scale var(--duration-spring) var(--ease-spring);
}
.arc-color-picker-areaThumb { background: var(--picker-opaque); }
.arc-color-picker-area[data-active] .arc-color-picker-areaThumb, .arc-color-picker-sliderThumb[data-active] { scale: 1.2; cursor: grabbing; }

.arc-color-picker-slider { position: relative; height: 14px; margin: 0 11px; border-radius: var(--radius-pill); cursor: pointer; touch-action: none; }
.arc-color-picker-slider::before { content: ""; position: absolute; inset: 0 -11px; border-radius: inherit; background: var(--track); box-shadow: inset 0 0 0 1px oklch(0% 0 0 / .08); }
.arc-color-picker-sliderThumb { top: 50%; background: var(--checker); }
.arc-color-picker-sliderThumb::after { content: ""; position: absolute; inset: 0; border-radius: inherit; background: var(--thumb-fill); }
/* The gradient stops sit at the thumb's travel ends, so the color under the thumb is the value it reports. */
.arc-color-picker-hue { --track: linear-gradient(to right, #f00 11px, #ff0 calc(11px + (100% - 22px) * .1666), #0f0 calc(11px + (100% - 22px) * .3333), #0ff 50%, #00f calc(11px + (100% - 22px) * .6666), #f0f calc(11px + (100% - 22px) * .8333), #f00 calc(100% - 11px)); }
.arc-color-picker-alpha { --track: linear-gradient(to right, transparent 11px, var(--picker-opaque) calc(100% - 11px)), var(--checker); }

.arc-color-picker-field { display: flex; height: 40px; align-items: stretch; overflow: hidden; margin-top: 2px; border: 1px solid var(--border); border-radius: 14px; background: var(--surface-muted); transition: border-color var(--duration-fast) var(--ease-standard); }
.arc-color-picker-field[data-invalid] { border-color: var(--danger); }
.arc-color-picker-format {
  display: flex; min-width: 64px; align-items: center; justify-content: center; padding: 0 10px; border: 0; border-right: 1px solid var(--border); background: transparent;
  color: var(--foreground); font: inherit; font-size: var(--text-xs); font-weight: 500; cursor: pointer; transition: background-color var(--duration-fast) var(--ease-standard);
}
.arc-color-picker-inputWrap { position: relative; display: flex; min-width: 0; flex: 1; }
.arc-color-picker-input, .arc-color-picker-morph { padding: 0 12px; font: inherit; font-size: 13px; font-variant-numeric: tabular-nums; }
.arc-color-picker-input { width: 100%; min-width: 0; border: 0; background: transparent; color: var(--foreground); caret-color: var(--foreground); }
.arc-color-picker-input[data-morphing] { color: transparent; }
.arc-color-picker-morph { position: absolute; inset: 0; display: flex; align-items: center; overflow: hidden; color: var(--foreground); pointer-events: none; white-space: nowrap; }
.arc-color-picker-error { min-height: 0; margin: -10px 2px -4px; color: var(--danger); font-size: var(--text-xs); }
.arc-color-picker-error:empty { display: none; }

.arc-color-picker-contrast { display: flex; align-items: center; gap: 10px; font-size: var(--text-sm); }
.arc-color-picker-sample { display: grid; width: 36px; height: 28px; flex: none; place-items: center; border: 1px solid var(--border); border-radius: 9px; background: var(--picker-bg); color: var(--picker-color); font-weight: 500; }
.arc-color-picker-ratio { font-variant-numeric: tabular-nums; font-weight: 500; min-width: 4.4ch; }
.arc-color-picker-against { flex: 1; min-width: 0; overflow: hidden; color: var(--text-secondary); font-size: var(--text-xs); text-overflow: ellipsis; white-space: nowrap; }
.arc-color-picker-grade { position: relative; display: inline-grid; height: 22px; align-items: center; padding: 0 8px; border-radius: var(--radius-pill); font-size: var(--text-xs); font-weight: 500; white-space: nowrap; transition: background-color var(--duration-standard) var(--ease-standard), color var(--duration-standard) var(--ease-standard); }
.arc-color-picker-grade[data-grade="pass"] { background: color-mix(in oklch, var(--success) 14%, transparent); color: var(--success); }
.arc-color-picker-grade[data-grade="large"] { background: color-mix(in oklch, var(--warning) 16%, transparent); color: var(--warning); }
.arc-color-picker-grade[data-grade="fail"] { background: color-mix(in oklch, var(--danger) 12%, transparent); color: var(--danger); }

.arc-color-picker-swatches { display: flex; align-items: center; gap: 6px; min-height: 32px; }
.arc-color-picker-add {
  display: grid; width: 30px; height: 30px; flex: none; place-items: center; padding: 0; border: 1px dashed var(--border-strong); border-radius: 50%; background: transparent; color: var(--text-secondary); cursor: pointer;
  transition: color var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard), transform var(--duration-fast) var(--ease-standard);
}
.arc-color-picker-add:active { transform: scale(.92); }
.arc-color-picker-swatchList { display: flex; min-width: 0; flex: 1; gap: 6px; }
.arc-color-picker-swatchSlot { position: relative; flex: none; touch-action: pan-y; }
.arc-color-picker-swatch { display: grid; width: 30px; height: 30px; place-items: center; padding: 0; border: 0; border-radius: 50%; background: transparent; cursor: pointer; }
.arc-color-picker-swatchChip { width: 26px; height: 26px; transition: scale var(--duration-spring) var(--ease-spring); }
.arc-color-picker-swatch[data-current] { box-shadow: inset 0 0 0 2px var(--foreground); }
.arc-color-picker-swatch[data-current] .arc-color-picker-swatchChip { scale: .78; }

.arc-color-picker-srOnly { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

@media (hover: hover) and (pointer: fine) {
  .arc-color-picker-trigger:hover { border-color: var(--border-strong); }
  .arc-color-picker-iconButton:hover, .arc-color-picker-format:hover { background: var(--surface-muted); color: var(--foreground); }
  .arc-color-picker-format:hover { background: color-mix(in oklch, var(--foreground) 5%, transparent); }
  .arc-color-picker-add:hover { border-color: var(--foreground); color: var(--foreground); }
}
@media (max-width: 360px) { .arc-color-picker-against { display: none; } }
@media (prefers-contrast: more) { .arc-color-picker-trigger, .arc-color-picker-panel, .arc-color-picker-field { border-color: var(--border-strong); } }
@media (prefers-reduced-motion: reduce) { .arc-color-picker-areaThumb, .arc-color-picker-sliderThumb, .arc-color-picker-swatchChip, .arc-color-picker-iconButton, .arc-color-picker-add { transition: none; } }
`;

const styles: Record<string, string> = new Proxy({
  "add": "arc-color-picker-add",
  "against": "arc-color-picker-against",
  "alpha": "arc-color-picker-alpha",
  "area": "arc-color-picker-area",
  "areaThumb": "arc-color-picker-areaThumb",
  "body": "arc-color-picker-body",
  "chip": "arc-color-picker-chip",
  "contrast": "arc-color-picker-contrast",
  "error": "arc-color-picker-error",
  "field": "arc-color-picker-field",
  "float": "arc-color-picker-float",
  "format": "arc-color-picker-format",
  "grade": "arc-color-picker-grade",
  "head": "arc-color-picker-head",
  "headActions": "arc-color-picker-headActions",
  "hex": "arc-color-picker-hex",
  "hue": "arc-color-picker-hue",
  "iconButton": "arc-color-picker-iconButton",
  "input": "arc-color-picker-input",
  "inputWrap": "arc-color-picker-inputWrap",
  "morph": "arc-color-picker-morph",
  "name": "arc-color-picker-name",
  "panel": "arc-color-picker-panel",
  "ratio": "arc-color-picker-ratio",
  "root": "arc-color-picker-root",
  "sample": "arc-color-picker-sample",
  "slider": "arc-color-picker-slider",
  "sliderThumb": "arc-color-picker-sliderThumb",
  "srOnly": "arc-color-picker-srOnly",
  "swatch": "arc-color-picker-swatch",
  "swatchChip": "arc-color-picker-swatchChip",
  "swatchList": "arc-color-picker-swatchList",
  "swatchSlot": "arc-color-picker-swatchSlot",
  "swatches": "arc-color-picker-swatches",
  "trigger": "arc-color-picker-trigger",
  "triggerText": "arc-color-picker-triggerText"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-color-picker-${prop}`,
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



export type ColorFormat = "hex" | "rgb" | "hsl" | "oklch";
export interface ColorSwatch { id: string; color: string }

/**
 * A color field whose swatch grows into a full picker. Pick saturation and brightness on the area, hue and opacity on the sliders, or type a value
 * in hex, RGB, HSL, or OKLCH; the format button morphs the text between them. The eyedropper appears where the browser supports it, saved
 * swatches can be added, applied, dragged or moved with Alt and the arrow keys, and removed with Delete. A contrast readout compares the color with
 * the background it will sit on. Arrow keys move every thumb, Shift takes bigger steps, and Escape closes the panel.
 */
export interface ColorPickerProps {
  /** Any color the picker can read: hex, rgb(), hsl(), or oklch(). */
  value?: string;
  defaultValue?: string;
  /** Receives the color as hex, with two alpha digits when it is not opaque. */
  onValueChange?: (hex: string) => void;
  /** The background the color will sit on, for the contrast readout. */
  background?: string;
  /** Name shown on the swatch, such as "Accent". */
  label?: string;
  swatches?: ColorSwatch[];
  defaultSwatches?: ColorSwatch[];
  onSwatchesChange?: (swatches: ColorSwatch[]) => void;
  /** Most saved swatches. Saving past it drops the oldest. */
  maxSwatches?: number;
  defaultFormat?: ColorFormat;
  className?: string;
}

export type Hsva = { h: number; s: number; v: number; a: number };
type Rgba = { r: number; g: number; b: number; a: number };

const { spring, duration, ease, blur } = motionTokens;
const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const round = (value: number, digits = 0) => { const f = 10 ** digits; return Math.round(value * f) / f; };
const physical = (visualDuration: number, bounce: number): Transition => {
  const root = 2 * Math.PI / (visualDuration * 1.2);
  return { type: "spring", stiffness: root * root, damping: 2 * (1 - bounce) * root, mass: 1, restDelta: .0005, restSpeed: .005 };
};
/** Thumbs chase the pointer on a quick spring with a little life, so a click lands with a soft settle and a drag trails by a hair. */
const thumbSpring = physical(.26, .22);
const openSpring = physical(spring.morph.visualDuration, .1), closeSpring = physical(.3, 0);
const instant: Transition = { duration: 0 };

/* Color math. sRGB channels are 0 to 1. */
function hsvToRgb({ h, s, v, a }: Hsva): Rgba {
  const f = (n: number) => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); };
  return { r: f(5), g: f(3), b: f(1), a };
}
function rgbToHsv({ r, g, b, a }: Rgba, hue = 0): Hsva {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = hue;
  if (d > 1e-6) {
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max, a };
}
function hslToRgb(h: number, s: number, l: number, a: number): Rgba {
  const k = (n: number) => (n + h / 30) % 12, c = s * Math.min(l, 1 - l);
  const f = (n: number) => l - c * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return { r: f(0), g: f(8), b: f(4), a };
}
function rgbToHsl({ r, g, b }: Rgba, hue: number) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  const s = d < 1e-6 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { h: d < 1e-6 ? hue : rgbToHsv({ r, g, b, a: 1 }).h, s, l };
}
const toLinear = (c: number) => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4;
const fromLinear = (c: number) => c <= .0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - .055;
function rgbToOklch({ r, g, b }: Rgba, hue: number) {
  const lr = toLinear(r), lg = toLinear(g), lb = toLinear(b);
  const l = Math.cbrt(.4122214708 * lr + .5363325363 * lg + .0514459929 * lb);
  const m = Math.cbrt(.2119034982 * lr + .6806995451 * lg + .1073969566 * lb);
  const s = Math.cbrt(.0883024619 * lr + .2817188376 * lg + .6299787005 * lb);
  const L = .2104542553 * l + .793617785 * m - .0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + .4505937099 * s;
  const B = .0259040371 * l + .7827717662 * m - .808675766 * s;
  const C = Math.hypot(A, B);
  let H = Math.atan2(B, A) * 180 / Math.PI;
  if (H < 0) H += 360;
  return { l: L, c: C, h: C < .0005 ? hue : H };
}
function oklchToRgb(L: number, C: number, H: number, a: number): Rgba {
  const A = C * Math.cos(H * Math.PI / 180), B = C * Math.sin(H * Math.PI / 180);
  const l = (L + .3963377774 * A + .2158037573 * B) ** 3;
  const m = (L - .1055613458 * A - .0638541728 * B) ** 3;
  const s = (L - .0894841775 * A - 1.291485548 * B) ** 3;
  return {
    r: clamp(fromLinear(4.0767416621 * l - 3.3077115913 * m + .2309699292 * s)),
    g: clamp(fromLinear(-1.2684380046 * l + 2.6097574011 * m - .3413193965 * s)),
    b: clamp(fromLinear(-.0041960863 * l - .7034186147 * m + 1.707614701 * s)),
    a,
  };
}
const byte = (c: number) => Math.round(clamp(c) * 255);
const hex2 = (c: number) => byte(c).toString(16).padStart(2, "0").toUpperCase();

export function toHex(hsva: Hsva) {
  const { r, g, b, a } = hsvToRgb(hsva);
  return `#${hex2(r)}${hex2(g)}${hex2(b)}${a < .999 ? hex2(a) : ""}`;
}
function format(hsva: Hsva, kind: ColorFormat) {
  const rgb = hsvToRgb(hsva);
  const alpha = hsva.a < .999 ? ` / ${Math.round(hsva.a * 100)}%` : "";
  if (kind === "hex") return toHex(hsva);
  if (kind === "rgb") return `rgb(${byte(rgb.r)} ${byte(rgb.g)} ${byte(rgb.b)}${alpha})`;
  if (kind === "hsl") { const { h, s, l } = rgbToHsl(rgb, hsva.h); return `hsl(${Math.round(h) % 360} ${Math.round(s * 100)}% ${Math.round(l * 100)}%${alpha})`; }
  const { l, c, h } = rgbToOklch(rgb, hsva.h);
  return `oklch(${round(l * 100, 1)}% ${round(c, 3)} ${round(h, 1) % 360}${alpha})`;
}
const readAlpha = (text?: string) => text === undefined ? 1 : text.endsWith("%") ? clamp(parseFloat(text) / 100) : clamp(parseFloat(text));

/** Reads hex, rgb(), hsl(), and oklch() in modern or comma syntax. Returns null for anything else. */
export function parseColor(input: string, hue = 0): Hsva | null {
  const text = input.trim().toLowerCase();
  let match = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(text);
  if (match) {
    let digits = match[1];
    if (digits.length <= 4) digits = digits.split("").map(d => d + d).join("");
    const n = (i: number) => parseInt(digits.slice(i, i + 2), 16) / 255;
    return rgbToHsv({ r: n(0), g: n(2), b: n(4), a: digits.length === 8 ? n(6) : 1 }, hue);
  }
  match = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[/,]\s*([\d.]+%?))?\s*\)$/.exec(text);
  if (match) return rgbToHsv({ r: clamp(+match[1] / 255), g: clamp(+match[2] / 255), b: clamp(+match[3] / 255), a: readAlpha(match[4]) }, hue);
  match = /^hsla?\(\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%?[\s,]+([\d.]+)%?(?:\s*[/,]\s*([\d.]+%?))?\s*\)$/.exec(text);
  if (match) {
    const h = +match[1] % 360;
    const next = rgbToHsv(hslToRgb(h, clamp(+match[2] / 100), clamp(+match[3] / 100), readAlpha(match[4])), h);
    return { ...next, h };
  }
  match = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?(?:\s*\/\s*([\d.]+%?))?\s*\)$/.exec(text);
  if (match) {
    const L = match[2] ? +match[1] / 100 : +match[1];
    return rgbToHsv(oklchToRgb(clamp(L), +match[3], +match[4], readAlpha(match[5])), hue);
  }
  return null;
}

/** WCAG contrast of a color, composited over the background, against that background. */
function contrast(hsva: Hsva, background: Rgba) {
  const fg = hsvToRgb(hsva);
  const mix = (c: number, bg: number) => c * fg.a + bg * (1 - fg.a);
  const lum = (r: number, g: number, b: number) => .2126 * toLinear(r) + .7152 * toLinear(g) + .0722 * toLinear(b);
  const a = lum(mix(fg.r, background.r), mix(fg.g, background.g), mix(fg.b, background.b)), b = lum(background.r, background.g, background.b);
  return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
}
const level = (ratio: number) => ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA large" : "Fails";

const formats: ColorFormat[] = ["hex", "rgb", "hsl", "oklch"];
const formatNames: Record<ColorFormat, string> = { hex: "Hex", rgb: "RGB", hsl: "HSL", oklch: "OKLCH" };

const subscribe = () => () => {};
function useHydrated() { return useSyncExternalStore(subscribe, () => true, () => false); }
function useEyeDropper() { return useSyncExternalStore(subscribe, () => "EyeDropper" in window, () => false); }
type EyeDropperCtor = new () => { open: () => Promise<{ sRGBHex: string }> };

/** Springs a motion value to a new target, or jumps under reduced motion. Retargeting keeps the current velocity. */
function useFollow(target: number, reduced: boolean) {
  const value = useMotionValue(target);
  useEffect(() => {
    if (reduced) { value.jump(target); return; }
    const controls = animate(value, target, thumbSpring);
    return () => controls.stop();
  }, [reduced, target, value]);
  return value;
}

/** Tracks a pointer drag over an element and reports its position as fractions of the element's box. */
function usePad(onMove: (x: number, y: number) => void, onActive: (active: boolean) => void) {
  const pointer = useRef<number | null>(null);
  const read = (event: ReactPointerEvent<HTMLElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    onMove(clamp((event.clientX - box.left) / box.width), clamp((event.clientY - box.top) / box.height));
  };
  return {
    onPointerDown(event: ReactPointerEvent<HTMLElement>) {
      if (event.button !== 0 || pointer.current !== null) return;
      pointer.current = event.pointerId;
      event.currentTarget.setPointerCapture(event.pointerId);
      onActive(true);
      read(event);
    },
    onPointerMove(event: ReactPointerEvent<HTMLElement>) { if (event.pointerId === pointer.current) read(event); },
    onPointerUp(event: ReactPointerEvent<HTMLElement>) { if (event.pointerId !== pointer.current) return; pointer.current = null; onActive(false); },
    onPointerCancel(event: ReactPointerEvent<HTMLElement>) { if (event.pointerId !== pointer.current) return; pointer.current = null; onActive(false); },
  };
}

/** Arrow keys step by a small amount, Shift by ten, Page keys by ten, Home and End to the ends. */
function stepFor(event: ReactKeyboardEvent, axis: "x" | "y" | "both") {
  const big = event.shiftKey || event.key.startsWith("Page");
  const size = big ? 10 : 1;
  const map: Record<string, [number, number]> = {
    ArrowRight: [size, 0], ArrowLeft: [-size, 0], ArrowUp: axis === "both" ? [0, size] : [size, 0], ArrowDown: axis === "both" ? [0, -size] : [-size, 0],
    PageUp: [10, 0], PageDown: [-10, 0],
  };
  return map[event.key] ?? null;
}

interface SliderProps { label: string; value: number; valueText: string; max: number; unit: number; onChange: (value: number) => void; className: string; style?: CSSProperties; reduced: boolean; fill: string; onActive: (active: boolean) => void; active: boolean }
function Slider({ label, value, valueText, max, unit, onChange, className, style, reduced, fill, onActive, active }: SliderProps) {
  const x = useFollow(value / max, reduced);
  const left = useTransform(x, v => `${v * 100}%`);
  const pad = usePad(fx => onChange(fx * max), onActive);
  return <div className={`${styles.slider} ${className}`} style={style} {...pad}>
    <motion.div className={styles.sliderThumb} role="slider" tabIndex={0} aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.round(value)} aria-valuetext={valueText}
      style={{ left, "--thumb-fill": fill } as unknown as CSSProperties} data-active={active || undefined}
      onKeyDown={event => {
        if (event.key === "Home" || event.key === "End") { event.preventDefault(); onChange(event.key === "Home" ? 0 : max); return; }
        const step = stepFor(event, "x");
        if (!step) return;
        event.preventDefault();
        onChange(clamp(value + step[0] * unit, 0, max));
      }} />
  </div>;
}

function Chip({ color, className }: { color: string; className?: string }) {
  return <span className={`${styles.chip} ${className ?? ""}`}><span style={{ background: color }} /></span>;
}

let swatchCount = 0;
const newId = () => `swatch-${Date.now().toString(36)}-${swatchCount++}`;

export function ColorPicker({
  value, defaultValue = "#2F6BFF", onValueChange, background = "#FFFFFF", label = "Color", swatches: swatchesProp, defaultSwatches, onSwatchesChange,
  maxSwatches = 7, defaultFormat = "hex", className,
}: ColorPickerProps) {
  const uid = useId().replace(/[^a-zA-Z0-9-]/g, "");
  const hydrated = useHydrated();
  const reduced = !!useReducedMotion() && hydrated;
  const canPick = useEyeDropper();

  const [hsva, setHsva] = useState<Hsva>(() => parseColor(value ?? defaultValue) ?? { h: 220, s: .8, v: 1, a: 1 });
  const [synced, setSynced] = useState(value);
  if (value !== undefined && value !== synced) {
    setSynced(value);
    if (value.toUpperCase() !== toHex(hsva)) { const next = parseColor(value, hsva.h); if (next) setHsva(next); }
  }
  const [ownSwatches, setOwnSwatches] = useState<ColorSwatch[]>(defaultSwatches ?? []);
  const swatches = swatchesProp ?? ownSwatches;
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const [kind, setKind] = useState<ColorFormat>(defaultFormat);
  const [draft, setDraft] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [morph, setMorph] = useState<{ id: number; from: string; to: string; phase: 0 | 1 } | null>(null);
  const [active, setActive] = useState<"area" | "hue" | "alpha" | null>(null);
  const [focusSwatch, setFocusSwatch] = useState<string | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const areaThumb = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const swatchRefs = useRef(new Map<string, HTMLButtonElement>());
  const dragged = useRef(false);
  const fieldX = useMotionValue(0);
  /** Whether the panel is meant to be open right now, read when a closing animation finishes. */
  const openNow = useRef(false);

  const hex = toHex(hsva);
  const rgb = hsvToRgb(hsva);
  const css = `rgb(${byte(rgb.r)} ${byte(rgb.g)} ${byte(rgb.b)} / ${round(hsva.a, 3)})`;
  const opaque = `rgb(${byte(rgb.r)} ${byte(rgb.g)} ${byte(rgb.b)})`;
  const pure = `hsl(${hsva.h} 100% 50%)`;
  const bg = parseColor(background);
  const ratio = contrast(hsva, bg ? hsvToRgb(bg) : { r: 1, g: 1, b: 1, a: 1 });
  const text = format(hsva, kind);

  function commit(next: Hsva) {
    setHsva(next);
    const nextHex = toHex(next);
    if (nextHex !== hex) onValueChange?.(nextHex);
  }
  function setSwatches(next: ColorSwatch[]) { if (!swatchesProp) setOwnSwatches(next); onSwatchesChange?.(next); }

  // The surface: one progress value grows the swatch's box into the panel's box; the content fades in behind the leading edge.
  const progress = useMotionValue(0), fade = useMotionValue(0);
  const size = { W: useMotionValue(300), H: useMotionValue(420), w: useMotionValue(160), h: useMotionValue(44) };
  const clipPath = useTransform(() => {
    const q = clamp(progress.get());
    return `inset(0px ${round((size.W.get() - size.w.get()) * (1 - q), 2)}px ${round((size.H.get() - size.h.get()) * (1 - q), 2)}px 0px round ${round(22 + 4 * q, 2)}px)`;
  });
  const contentOpacity = useTransform(progress, [.35, .9], [0, 1]);
  const contentY = useTransform(progress, [0, 1], [-10, 0]);

  useLayoutEffect(() => {
    if (!shown) return;
    const panel = panelRef.current, trigger = triggerRef.current;
    if (!panel || !trigger) return;
    const measure = () => { size.W.set(panel.offsetWidth); size.H.set(panel.offsetHeight); size.w.set(trigger.offsetWidth); size.h.set(trigger.offsetHeight); };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(panel);
    return () => observer.disconnect();
  }, [shown, size.W, size.H, size.w, size.h]);

  useEffect(() => {
    if (!shown) return;
    if (reduced) {
      progress.jump(open ? 1 : progress.get());
      const controls = animate(fade, open ? 1 : 0, { duration: .14 });
      controls.then(() => { if (!openNow.current) { progress.jump(0); setShown(false); } });
      return () => controls.stop();
    }
    fade.jump(1);
    const controls = animate(progress, open ? 1 : 0, open ? openSpring : closeSpring);
    if (!open) controls.then(() => { if (!openNow.current) setShown(false); });
    return () => controls.stop();
  }, [fade, open, progress, reduced, shown]);

  useEffect(() => {
    if (open) requestAnimationFrame(() => areaThumb.current?.focus({ preventScroll: true }));
  }, [open]);

  function show() { openNow.current = true; setShown(true); setOpen(true); }
  function hide(returnFocus = true) {
    openNow.current = false;
    setOpen(false); setDraft(null); setInvalid(false);
    if (returnFocus) triggerRef.current?.focus({ preventScroll: true });
  }

  const dismiss = useEffectEvent((event: Event) => {
    if (event instanceof KeyboardEvent) {
      if (event.key !== "Escape") return;
      hide(!!rootRef.current?.contains(document.activeElement));
      return;
    }
    if (!rootRef.current?.contains(event.target as Node)) hide(false);
  });
  useEffect(() => {
    if (!open) return;
    const listener = (event: Event) => dismiss(event);
    document.addEventListener("pointerdown", listener, true);
    document.addEventListener("keydown", listener);
    return () => { document.removeEventListener("pointerdown", listener, true); document.removeEventListener("keydown", listener); };
  }, [open]);

  // The saturation and brightness area.
  const areaX = useFollow(hsva.s, reduced), areaY = useFollow(1 - hsva.v, reduced);
  const areaLeft = useTransform(areaX, v => `${v * 100}%`), areaTop = useTransform(areaY, v => `${v * 100}%`);
  const areaPad = usePad((x, y) => commit({ ...hsva, s: x, v: 1 - y }), on => setActive(on ? "area" : null));

  // Format morph: the new text mounts showing the old string, then morphs to the new one, and the live field returns once it settles.
  useEffect(() => {
    if (!morph || morph.phase === 1) return;
    const frame = requestAnimationFrame(() => setMorph(current => current && current.id === morph.id ? { ...current, phase: 1 } : current));
    return () => cancelAnimationFrame(frame);
  }, [morph]);
  useEffect(() => {
    if (!morph || morph.phase === 0) return;
    const timer = window.setTimeout(() => setMorph(current => current?.id === morph.id ? null : current), 620);
    return () => window.clearTimeout(timer);
  }, [morph]);

  function cycleFormat() {
    const next = formats[(formats.indexOf(kind) + 1) % formats.length];
    setKind(next); setDraft(null); setInvalid(false);
    if (!reduced) setMorph({ id: Date.now(), from: text, to: format(hsva, next), phase: 0 });
  }

  function submitDraft() {
    if (draft === null) return true;
    const next = parseColor(draft, hsva.h);
    if (!next) {
      setInvalid(true);
      if (!reduced) animate(fieldX, [0, -5, 4, -2, 0], { duration: .32, ease: "easeOut" });
      return false;
    }
    commit(next); setDraft(null); setInvalid(false);
    return true;
  }

  function pickFromScreen() {
    if (!canPick) return;
    const Ctor = (window as unknown as { EyeDropper: EyeDropperCtor }).EyeDropper;
    new Ctor().open().then(result => { const next = parseColor(result.sRGBHex, hsva.h); if (next) commit({ ...next, a: hsva.a }); }).catch(() => {});
  }

  function saveSwatch() {
    const entry = { id: newId(), color: hex };
    setSwatches([entry, ...swatches].slice(0, maxSwatches));
    setFocusSwatch(entry.id);
  }
  function onSwatchKey(event: ReactKeyboardEvent<HTMLButtonElement>, index: number) {
    const item = swatches[index];
    const move = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      const next = swatches.filter(entry => entry.id !== item.id);
      setSwatches(next);
      const neighbor = next[Math.min(index, next.length - 1)];
      setFocusSwatch(neighbor?.id ?? null);
      requestAnimationFrame(() => neighbor ? swatchRefs.current.get(neighbor.id)?.focus({ preventScroll: true }) : inputRef.current?.focus({ preventScroll: true }));
      return;
    }
    if (!move && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    if (move && event.altKey) {
      const to = index + move;
      if (to < 0 || to >= swatches.length) return;
      const next = [...swatches];
      next.splice(index, 1); next.splice(to, 0, item);
      setSwatches(next);
      requestAnimationFrame(() => swatchRefs.current.get(item.id)?.focus({ preventScroll: true }));
      return;
    }
    const target = event.key === "Home" ? 0 : event.key === "End" ? swatches.length - 1 : (index + move + swatches.length) % swatches.length;
    setFocusSwatch(swatches[target].id);
    swatchRefs.current.get(swatches[target].id)?.focus({ preventScroll: true });
  }

  const ratioValue = useFollow(ratio, reduced);
  const ratioText = useTransform(ratioValue, v => v.toFixed(2));
  const grade = level(ratio);
  const hidden = reduced ? { opacity: 0 } : { opacity: 0, y: "0.3em", filter: `blur(${blur.subtle}px)` };
  const swatchTab = swatches.some(entry => entry.id === focusSwatch) ? focusSwatch : swatches[0]?.id;
  const style = { "--picker-color": css, "--picker-opaque": opaque, "--picker-hue": pure, "--picker-bg": background } as CSSProperties;

  return <div ref={rootRef} className={[styles.root, className].filter(Boolean).join(" ")} style={style}>
    <button ref={triggerRef} type="button" className={styles.trigger} aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? `${uid}-panel` : undefined}
      onClick={() => open ? hide() : show()}>
      <Chip color={css} />
      <span className={styles.triggerText}><span className={styles.name}>{label}</span><span className={styles.hex}>{hex}</span></span>
    </button>

    {shown && <div className={styles.float} data-open={open || undefined}>
      <motion.div ref={panelRef} id={`${uid}-panel`} role="dialog" aria-label={`${label} color`} className={styles.panel} inert={!open} style={{ clipPath, opacity: fade }}>
        <div className={styles.head}>
          <Chip color={css} />
          <span className={styles.triggerText}><span className={styles.name}>{label}</span><span className={styles.hex}>{hex}</span></span>
          <motion.span className={styles.headActions} style={{ opacity: contentOpacity }}>
            {canPick && <button type="button" className={styles.iconButton} aria-label="Pick a color from the screen" onClick={pickFromScreen}><Pipette size={18} strokeWidth={1.75} aria-hidden="true" /></button>}
            <button type="button" className={styles.iconButton} aria-label="Done" onClick={() => hide()}><Check size={18} strokeWidth={1.75} aria-hidden="true" /></button>
          </motion.span>
        </div>

        <motion.div className={styles.body} style={{ opacity: contentOpacity, y: contentY }}>
          <div className={styles.area} data-active={active === "area" || undefined} {...areaPad}>
            <motion.div ref={areaThumb} className={styles.areaThumb} role="slider" tabIndex={0} aria-roledescription="2D slider"
              aria-label="Saturation and brightness" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(hsva.s * 100)}
              aria-valuetext={`Saturation ${Math.round(hsva.s * 100)}%, brightness ${Math.round(hsva.v * 100)}%`}
              style={{ left: areaLeft, top: areaTop }}
              onKeyDown={event => {
                const step = stepFor(event, "both");
                if (!step) return;
                event.preventDefault();
                commit({ ...hsva, s: clamp(hsva.s + step[0] / 100), v: clamp(hsva.v + step[1] / 100) });
              }} />
          </div>

          <Slider label="Hue" value={hsva.h} valueText={`${Math.round(hsva.h)} degrees`} max={360} unit={1} className={styles.hue} reduced={reduced} fill={pure}
            onChange={h => commit({ ...hsva, h: clamp(h, 0, 359.9) })} active={active === "hue"} onActive={on => setActive(on ? "hue" : null)} />
          <Slider label="Opacity" value={hsva.a * 100} valueText={`${Math.round(hsva.a * 100)}%`} max={100} unit={1} className={styles.alpha} reduced={reduced} fill={css}
            onChange={a => commit({ ...hsva, a: clamp(a / 100) })} active={active === "alpha"} onActive={on => setActive(on ? "alpha" : null)} />

          <motion.div className={styles.field} data-invalid={invalid || undefined} style={{ x: fieldX }}>
            <button type="button" className={styles.format} onClick={cycleFormat} aria-label={`Format: ${formatNames[kind]}. Switch format`}>
              <TextMorph>{formatNames[kind]}</TextMorph>
            </button>
            <span className={styles.inputWrap}>
              <input ref={inputRef} className={styles.input} value={draft ?? text} spellCheck={false} autoComplete="off" aria-label={`${label} in ${formatNames[kind]}`}
                aria-invalid={invalid || undefined} aria-describedby={invalid ? `${uid}-error` : undefined} data-morphing={morph ? "" : undefined}
                onChange={event => { setDraft(event.target.value); setInvalid(false); }}
                onKeyDown={event => {
                  if (event.key === "Enter") { event.preventDefault(); if (submitDraft()) event.currentTarget.select(); }
                  if (event.key === "Escape" && draft !== null) { event.stopPropagation(); event.nativeEvent.stopImmediatePropagation(); setDraft(null); setInvalid(false); }
                }}
                onBlur={() => { if (!submitDraft()) { setDraft(null); setInvalid(false); } }} />
              {morph && <span className={styles.morph} aria-hidden="true"><TextMorph>{morph.phase === 0 ? morph.from : morph.to}</TextMorph></span>}
            </span>
          </motion.div>
          <p id={`${uid}-error`} className={styles.error} aria-live="polite">{invalid ? "Enter a hex, RGB, HSL, or OKLCH color" : ""}</p>

          <div className={styles.contrast}>
            <span className={styles.sample} aria-hidden="true">Aa</span>
            <span className={styles.ratio}><motion.span>{ratioText}</motion.span>:1</span>
            <span className={styles.against}>against background</span>
            <span className={styles.grade} data-grade={grade === "Fails" ? "fail" : grade === "AA large" ? "large" : "pass"}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={grade} initial={hidden} animate={{ opacity: 1, y: "0em", filter: "blur(0px)" }}
                  exit={{ ...hidden, transition: { duration: duration.instant } }} transition={reduced ? { duration: .12 } : { duration: .2, ease: [...ease.enter] }}>{grade}</motion.span>
              </AnimatePresence>
            </span>
            <span className={styles.srOnly}>{`Contrast ${ratio.toFixed(2)} to 1, ${grade === "Fails" ? "fails" : `passes ${grade}`}`}</span>
          </div>

          <div className={styles.swatches}>
            <button type="button" className={styles.add} onClick={saveSwatch} aria-label={`Save ${hex}`}><Plus size={16} strokeWidth={1.75} aria-hidden="true" /></button>
            <Reorder.Group as="div" axis="x" values={swatches} onReorder={setSwatches} className={styles.swatchList} role="listbox" aria-label="Saved colors" aria-orientation="horizontal">
              <AnimatePresence initial={false}>
                {swatches.map((entry, index) => <Reorder.Item key={entry.id} value={entry} as="div" className={styles.swatchSlot} dragElastic={.12}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, scale: .4 }} animate={{ opacity: 1, scale: 1 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, scale: .4, transition: { duration: duration.fast } }}
                  transition={reduced ? instant : { ...spring.snappy, layout: spring.smooth }} whileDrag={reduced ? undefined : { scale: 1.15, zIndex: 2 }}
                  onDragStart={() => { dragged.current = true; }} onDragEnd={() => requestAnimationFrame(() => { dragged.current = false; })}>
                  <button ref={node => { if (node) swatchRefs.current.set(entry.id, node); else swatchRefs.current.delete(entry.id); }}
                    type="button" role="option" aria-selected={entry.color.toUpperCase() === hex} className={styles.swatch} data-current={entry.color.toUpperCase() === hex || undefined}
                    aria-label={`${entry.color}. Alt and arrow keys to move, Delete to remove`} tabIndex={entry.id === swatchTab ? 0 : -1}
                    onFocus={() => setFocusSwatch(entry.id)} onKeyDown={event => onSwatchKey(event, index)}
                    onClick={() => { if (dragged.current) return; const next = parseColor(entry.color, hsva.h); if (next) commit(next); }}>
                    <Chip color={entry.color} className={styles.swatchChip} />
                  </button>
                </Reorder.Item>)}
              </AnimatePresence>
            </Reorder.Group>
          </div>
        </motion.div>
      </motion.div>
    </div>}
  </div>;
}

export default ColorPicker;
