"use client";

import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { ChevronDown, FileCode2 } from "lucide-react";
import { Fragment, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

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
const ARC_CODE_BLOCK_STYLES = `.arc-code-block-block { width: 100%; min-width: 0; max-width: 100%; overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius-panel); background: var(--surface); }
.arc-code-block-header { display: flex; min-height: 52px; align-items: center; justify-content: space-between; gap: var(--space-3); border-bottom: 1px solid var(--border-subtle); padding: var(--space-2) var(--space-3) var(--space-2) var(--space-4); background: var(--surface-raised); }
.arc-code-block-file { display: flex; min-width: 0; align-items: center; gap: var(--space-2); color: var(--text-secondary); font-family: var(--font-body); font-size: var(--text-sm); font-weight: 500; letter-spacing: var(--tracking-body); line-height: var(--leading-body); }
.arc-code-block-file > svg { flex: none; color: var(--text-muted); }
.arc-code-block-filename { position: relative; min-width: 0; overflow: hidden; color: var(--foreground); }
/* Changing text stacks old and new words in one cell; reserve spans hold the widest label so the cell never snaps. */
.arc-code-block-swap { display: inline-grid; min-width: 0; white-space: nowrap; }
.arc-code-block-swap > span, .arc-code-block-swapStack > span { grid-area: 1 / 1; min-width: 0; }
.arc-code-block-swapStack { display: grid; min-width: 0; }
.arc-code-block-swapText { display: block; overflow: hidden; text-overflow: ellipsis; }
.arc-code-block-reserve { visibility: hidden; }
.arc-code-block-sizer { position: absolute; top: 0; left: 0; white-space: nowrap; visibility: hidden; pointer-events: none; }
.arc-code-block-srOnly { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.arc-code-block-language { flex: none; color: var(--text-muted); font-family: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace; font-size: var(--text-xs); font-weight: 400; }
.arc-code-block-language::before { content: "·"; margin-right: var(--space-2); color: var(--border-strong); }
/* The source area follows its content height on a spring. Before it measures, a collapsed block clips from CSS. */
.arc-code-block-viewport { --code-collapsed: calc(var(--code-lines, 0) * var(--text-sm) * 1.7 + var(--space-5) * 2); overflow: hidden; }
.arc-code-block-pre { position: relative; overflow: auto; margin: 0; padding: var(--space-5); color: var(--foreground); font-family: ui-monospace, "SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace; font-size: var(--text-sm); font-variant-ligatures: none; line-height: 1.7; tab-size: 2; white-space: pre; }
/* The focused source rings the whole block: an inset ring on the scroller would be cut off by the rounded corners. */
.arc-code-block-pre:focus-visible { outline: none; }
.arc-code-block-block:has(.arc-code-block-pre:focus-visible) { outline: 2px solid var(--focus-ring); outline-offset: 3px; }
/* Block so new source can rise in with a transform; inline code ignores transforms. */
.arc-code-block-code { display: block; }
.arc-code-block-expand { display: flex; width: 100%; min-height: 44px; align-items: center; justify-content: center; gap: var(--space-2); border: 0; border-top: 1px solid var(--border-subtle); padding: 0 var(--space-4); background: var(--surface-raised); color: var(--text-secondary); font: inherit; font-size: var(--text-sm); font-weight: 500; cursor: pointer; transition: color var(--duration-fast) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard); }
/* Its bottom corners follow the block, so the inset ring curves with them instead of being clipped. */
.arc-code-block-expand:focus-visible { border-radius: 0 0 calc(var(--radius-panel) - 1px) calc(var(--radius-panel) - 1px); outline: 2px solid var(--focus-ring); outline-offset: -2px; }
.arc-code-block-chevron { display: grid; flex: none; place-items: center; color: var(--text-muted); }
/* Each role has contrast in both themes; color supports, but never replaces, source text. */
.arc-code-block-comment { color: var(--text-muted); font-style: italic; }
.arc-code-block-string { color: oklch(46% .13 150); }
.arc-code-block-number { color: oklch(50% .14 55); }
.arc-code-block-keyword { color: oklch(48% .15 285); }
.arc-code-block-type { color: oklch(46% .13 230); }
.arc-code-block-function { color: oklch(43% .12 25); }
.arc-code-block-property { color: oklch(44% .12 85); }
.arc-code-block-tag { color: oklch(46% .13 230); }
.arc-code-block-punctuation { color: var(--text-secondary); }
:global(:root[data-theme="dark"]) .arc-code-block-string { color: oklch(77% .15 150); }
:global(:root[data-theme="dark"]) .arc-code-block-number { color: oklch(80% .14 75); }
:global(:root[data-theme="dark"]) .arc-code-block-keyword { color: oklch(78% .16 285); }
:global(:root[data-theme="dark"]) .arc-code-block-type { color: oklch(79% .13 230); }
:global(:root[data-theme="dark"]) .arc-code-block-function { color: oklch(80% .13 25); }
:global(:root[data-theme="dark"]) .arc-code-block-property { color: oklch(79% .12 85); }
:global(:root[data-theme="dark"]) .arc-code-block-tag { color: oklch(79% .13 230); }
@media (hover: hover) and (pointer: fine) { .arc-code-block-expand:hover { background: var(--surface-muted); color: var(--foreground); } .arc-code-block-expand:hover .arc-code-block-chevron { color: var(--foreground); } }
@media (max-width: 420px) { .arc-code-block-header { padding-left: var(--space-3); } .arc-code-block-header :global(button) { width: var(--control-height-sm); padding-inline: 0; } .arc-code-block-header :global(button) > span:last-of-type { display: none; } .arc-code-block-viewport { --code-collapsed: calc(var(--code-lines, 0) * var(--text-xs) * 1.7 + var(--space-4) * 2); } .arc-code-block-pre { padding: var(--space-4); font-size: var(--text-xs); } }
@media (prefers-reduced-motion: reduce) { .arc-code-block-expand { transition: none; } }
`;

const styles: Record<string, string> = new Proxy({
  "block": "arc-code-block-block",
  "chevron": "arc-code-block-chevron",
  "code": "arc-code-block-code",
  "comment": "arc-code-block-comment",
  "expand": "arc-code-block-expand",
  "file": "arc-code-block-file",
  "filename": "arc-code-block-filename",
  "function": "arc-code-block-function",
  "header": "arc-code-block-header",
  "keyword": "arc-code-block-keyword",
  "language": "arc-code-block-language",
  "number": "arc-code-block-number",
  "pre": "arc-code-block-pre",
  "property": "arc-code-block-property",
  "punctuation": "arc-code-block-punctuation",
  "reserve": "arc-code-block-reserve",
  "sizer": "arc-code-block-sizer",
  "srOnly": "arc-code-block-srOnly",
  "string": "arc-code-block-string",
  "swap": "arc-code-block-swap",
  "swapStack": "arc-code-block-swapStack",
  "swapText": "arc-code-block-swapText",
  "tag": "arc-code-block-tag",
  "type": "arc-code-block-type",
  "viewport": "arc-code-block-viewport"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-code-block-${prop}`,
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



export interface CodeBlockProps {
  /** Source shown in the block and copied by the action. */
  code: string;
  /** File name displayed in the header. */
  filename?: string;
  /** Used for the header label and lightweight syntax highlighting. */
  language?: string;
  /** Collapse longer sources to this many lines, with a toggle that expands the rest in place. */
  maxLines?: number;
}

type TokenKind = "comment" | "string" | "number" | "keyword" | "type" | "function" | "property" | "tag" | "punctuation";

const keywordPattern = /^(?:abstract|as|async|await|break|case|catch|class|const|continue|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|im" + "port|in|instanceof|interface|let|new|of|private|protected|public|readonly|return|set|static|switch|throw|try|type|typeof|var|void|while|with|yield|SELECT|FROM|WHERE|INSERT|UPDATE|DELETE)$/;
const literalPattern = /^(?:true|false|null|undefined|NaN|Infinity)$/;
const typePattern = /^(?:Array|Boolean|Date|Error|Map|Number|Promise|Record|Set|String|ReactNode|HTMLElement|HTMLButtonElement|Event|unknown|never|void|any|boolean|number|string|object)$/;
const tokenPattern = /\/\*[\s\S]*?\*\/|\/\/[^\n]*|<!--[\s\S]*?-->|`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$-]*\b|[{}[\]();,.<>:=+*/!?|&-]/g;

function normaliseLanguage(language: string) {
  return language.toLowerCase().replace(/^\./, "");
}

function tokenKind(value: string, source: string, index: number, language: string): TokenKind | undefined {
  if (value.startsWith("//") || value.startsWith("/*") || value.startsWith("<!--")) return "comment";
  if (value.startsWith("\"") || value.startsWith("'") || value.startsWith("`")) {
    return language === "json" && /^\s*:/.test(source.slice(index + value.length)) ? "property" : "string";
  }
  if (/^\d/.test(value)) return "number";
  if (keywordPattern.test(value) || literalPattern.test(value)) return "keyword";
  if (typePattern.test(value)) return "type";
  if (/^[{}[\]();,.<>:=+*/!?|&-]$/.test(value)) return "punctuation";

  const before = source.slice(0, index);
  const after = source.slice(index + value.length);
  if ((language === "tsx" || language === "jsx" || language === "html" || language === "vue") && /<\/?$/.test(before)) return "tag";
  if (/^\s*\(/.test(after) && language !== "json") return "function";
  if ((language === "css" || language === "tsx" || language === "jsx") && /^\s*[:=]/.test(after)) return "property";
  return undefined;
}

function highlight(code: string, language: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let cursor = 0;

  for (const match of code.matchAll(tokenPattern)) {
    const value = match[0];
    const index = match.index ?? 0;
    if (cursor < index) parts.push(code.slice(cursor, index));

    const kind = tokenKind(value, code, index, language);
    parts.push(kind ? <span className={styles[kind]} key={`${index}-${value}`}>{value}</span> : <Fragment key={`${index}-${value}`}>{value}</Fragment>);
    cursor = index + value.length;
  }

  if (cursor < code.length) parts.push(code.slice(cursor));
  return parts;
}

const textEnter = { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] } as const;
const textExit = { duration: motionTokens.duration.instant, ease: [...motionTokens.ease.standard] } as const;

/** Text that changes in place: the new words rise in with a soft blur while the old ones leave upward, faster. */
function SwapText({ value, reduced }: { value: string; reduced: boolean }) {
  return <AnimatePresence initial={false}>
    <motion.span key={value} className={styles.swapText} initial={reduced ? false : { opacity: 0, y: "0.3em", filter: `blur(${motionTokens.blur.soft}px)` }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: "-0.3em", filter: `blur(${motionTokens.blur.subtle}px)`, transition: textExit }} transition={reduced ? { duration: 0 } : textEnter}>{value}</motion.span>
  </AnimatePresence>;
}

/** A new file name swaps in while its box follows the new width on a spring, then returns to auto so it can still truncate. */
function FileName({ name, reduced }: { name: string; reduced: boolean }) {
  const sizer = useRef<HTMLSpanElement>(null);
  const rest = useRef(0);
  const width = useMotionValue<number | "auto">("auto");
  useEffect(() => {
    const node = sizer.current;
    if (!node) return;
    const observer = new ResizeObserver(() => { rest.current = node.offsetWidth; });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => {
    const moving = width.get(), to = sizer.current?.offsetWidth ?? 0;
    const from = typeof moving === "number" ? moving : rest.current;
    rest.current = to;
    if (reduced || !from || !to || Math.abs(from - to) < 1) { width.jump("auto"); return; }
    width.jump(from);
    const controls = animate(width, to, { ...motionTokens.spring.morph, onComplete: () => width.jump("auto") });
    return () => controls.stop();
  }, [name, reduced, width]);
  return <motion.span className={`${styles.swap} ${styles.filename}`} style={{ width }}>
    <span ref={sizer} className={styles.sizer} aria-hidden="true">{name}</span>
    <span className={styles.swapStack} aria-hidden="true"><SwapText value={name} reduced={reduced} /></span>
    <span className={styles.srOnly}>{name}</span>
  </motion.span>;
}

export function CodeBlock({ code, filename, language = "tsx", maxLines }: CodeBlockProps) {
  const displayLanguage = normaliseLanguage(language);
  const reduced = useReducedMotion() ?? false;
  const preId = useId();
  const lineCount = code.split("\n").length;
  const collapsible = maxLines != null && maxLines > 0 && lineCount > maxLines;
  const [expanded, setExpanded] = useState(false);
  const open = !collapsible || expanded;
  const preRef = useRef<HTMLPreElement>(null);
  const measured = useRef<{ full: number; collapsed: number } | null>(null);
  // Before the first measurement the clip height comes from CSS, so the server render is already collapsed.
  const height = useMotionValue<number | string>(open ? "auto" : "var(--code-collapsed)");
  const target = useRef({ open, reduced });
  const settleRef = useRef<(instant: boolean) => void>(() => {});

  // The source area follows its content on a spring: expanding, collapsing, and new code all resize smoothly.
  useLayoutEffect(() => {
    const pre = preRef.current;
    if (!pre) return;
    const settle = (instant: boolean) => {
      const sizes = measured.current;
      if (!sizes) return;
      const next = target.current.open ? sizes.full : sizes.collapsed;
      if (instant || target.current.reduced || typeof height.get() !== "number") height.jump(next);
      else animate(height, next, motionTokens.spring.smooth);
    };
    const observer = new ResizeObserver(() => {
      const style = getComputedStyle(pre);
      const full = pre.offsetHeight;
      const collapsed = maxLines ? Math.min(full, Math.round(maxLines * parseFloat(style.lineHeight) + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom))) : full;
      const first = !measured.current;
      measured.current = { full, collapsed };
      settle(first);
    });
    observer.observe(pre);
    settleRef.current = settle;
    return () => observer.disconnect();
  }, [height, maxLines]);
  useLayoutEffect(() => { target.current = { open, reduced }; settleRef.current(false); }, [open, reduced]);
  const expandLabels = [`Show all ${lineCount} lines`, "Show fewer lines"];

  return (
    <section className={styles.block} aria-label={filename ? `${filename} source code` : `${displayLanguage} source code`} style={maxLines ? { "--code-lines": maxLines } as CSSProperties : undefined}>
      <header className={styles.header}>
        <div className={styles.file}>
          <FileCode2 size={16} strokeWidth={1.75} aria-hidden="true" />
          <FileName name={filename ?? "Source code"} reduced={reduced} />
          <span className={styles.language}>{displayLanguage}</span>
        </div>
        <CopyButton value={code} label="Copy code" />
      </header>
      <motion.div className={styles.viewport} style={{ height }}>
        <pre ref={preRef} id={preId} className={styles.pre} tabIndex={0} aria-label="Selectable source code">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.code key={code} className={styles.code} initial={reduced ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, transition: textExit }} transition={reduced ? { duration: 0 } : textEnter}>{highlight(code, displayLanguage)}</motion.code>
          </AnimatePresence>
        </pre>
      </motion.div>
      {collapsible && <button type="button" className={styles.expand} aria-expanded={expanded} aria-controls={preId} onClick={() => setExpanded(value => !value)}>
        {/* Both labels reserve the cell, so the chevron never moves when the words change. */}
        <span className={styles.swap} aria-hidden="true">{expandLabels.map(text => <span key={text} className={styles.reserve}>{text}</span>)}<span className={styles.swapStack}><SwapText value={expandLabels[expanded ? 1 : 0]} reduced={reduced} /></span></span>
        <span className={styles.srOnly}>{expandLabels[expanded ? 1 : 0]}</span>
        <motion.span className={styles.chevron} aria-hidden="true" initial={false} animate={{ rotate: expanded ? 180 : 0 }} transition={reduced ? { duration: 0 } : motionTokens.spring.snappy}><ChevronDown size={16} strokeWidth={1.8} /></motion.span>
      </button>}
    </section>
  );
}
