"use client";

import type { FormEvent, ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Check } from "lucide-react";
import { forwardRef, useId, useState } from "react";

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
const ARC_SITE_FOOTER_STYLES = `.arc-site-footer-footer { --footer-pad: var(--space-6); position: relative; container: site-footer / inline-size; overflow: hidden; border-top: 1px solid var(--border); padding: var(--space-12) var(--footer-pad) var(--space-6); background: var(--background); color: var(--foreground); font-family: var(--font-body); letter-spacing: var(--tracking-body); }
.arc-site-footer-srOnly { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.arc-site-footer-top { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr); gap: var(--space-12); }
.arc-site-footer-intro { display: grid; align-content: start; gap: var(--space-3); min-width: 0; }
.arc-site-footer-brandRow { display: inline-flex; align-items: center; gap: var(--space-2); }
.arc-site-footer-brandMark { width: 22px; height: 22px; flex: none; color: var(--foreground); }
.arc-site-footer-brand { border: 0; padding: 0; background: none; color: var(--foreground); font: inherit; font-size: var(--text-base); font-weight: 500; text-decoration: none; cursor: pointer; }
.arc-site-footer-tagline { max-width: 320px; margin: 0; color: var(--text-secondary); font-size: var(--text-sm); line-height: var(--leading-body); }

.arc-site-footer-columns { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-6); }
.arc-site-footer-column h2 { margin: 0 0 var(--space-3); font-size: var(--text-sm); font-weight: 500; }
.arc-site-footer-column ul, .arc-site-footer-inline { margin: 0; padding: 0; list-style: none; }
.arc-site-footer-column ul { display: grid; gap: var(--space-2); }
.arc-site-footer-link { display: inline-flex; align-items: center; gap: 3px; border: 0; padding: 2px 0; background: none; color: var(--text-secondary); font: inherit; font-size: var(--text-sm); text-align: left; text-decoration: none; cursor: pointer; transition: color var(--duration-fast) var(--ease-standard); }
.arc-site-footer-link:active, .arc-site-footer-link:focus-visible { color: var(--foreground); }
.arc-site-footer-external { color: var(--text-muted); transition: transform var(--duration-fast) var(--ease-standard); }
@media (hover: hover) and (pointer: fine) {
  .arc-site-footer-link:hover { color: var(--foreground); }
  .arc-site-footer-link:hover .arc-site-footer-external { transform: translate(1px, -1px); }
}

/* Newsletter: input and button share one shell; the shell carries validation state with its border only. */
.arc-site-footer-newsletter { display: grid; gap: var(--space-2); max-width: 400px; margin-top: var(--space-5); }
.arc-site-footer-newsletterTitle { margin: 0; font-size: var(--text-sm); font-weight: 500; }
.arc-site-footer-newsletterRow { display: flex; height: var(--control-height-md); align-items: center; gap: var(--space-2); border: 1px solid var(--border); border-radius: var(--radius-control); padding: 3px 3px 3px var(--space-4); background: var(--surface); transition: border-color var(--duration-fast) var(--ease-standard); }
.arc-site-footer-newsletterRow:focus-within { border-color: var(--border-strong); }
.arc-site-footer-newsletterRow[data-invalid] { border-color: var(--danger); }
.arc-site-footer-newsletterInput { width: 100%; min-width: 0; flex: 1; border: 0; padding: 0; background: none; color: var(--foreground); font: inherit; font-size: var(--text-sm); }
.arc-site-footer-newsletterInput::placeholder { color: var(--text-muted); }
.arc-site-footer-newsletterRow[data-done] .arc-site-footer-newsletterInput { color: var(--text-secondary); }
.arc-site-footer-newsletterButton { flex: none; border-radius: calc(var(--radius-control) - 3px); }
.arc-site-footer-messageSlot { position: relative; min-height: 20px; }
.arc-site-footer-message { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 20px; }
.arc-site-footer-message[data-tone="error"] { color: var(--danger); }
.arc-site-footer-message[data-tone="success"] { color: var(--success); }

.arc-site-footer-bottom { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-3) var(--space-6); margin-top: var(--space-12); border-top: 1px solid var(--border-subtle); padding-top: var(--space-5); }
.arc-site-footer-bottomStart, .arc-site-footer-bottomEnd { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2) var(--space-5); }
.arc-site-footer-inline { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-1) var(--space-4); }
.arc-site-footer-copyright { color: var(--text-muted); font-size: var(--text-sm); }
.arc-site-footer-status { display: inline-flex; align-items: center; gap: var(--space-2); border: 0; padding: 2px 0; background: none; color: var(--text-secondary); font: inherit; font-size: var(--text-sm); text-decoration: none; cursor: pointer; }
.arc-site-footer-statusDot { --tone: var(--success); width: 7px; height: 7px; border-radius: 50%; background: var(--tone); box-shadow: 0 0 0 3px color-mix(in oklch, var(--tone) 18%, transparent); }
.arc-site-footer-status[data-tone="warning"] .arc-site-footer-statusDot { --tone: var(--warning); }
.arc-site-footer-status[data-tone="danger"] .arc-site-footer-statusDot { --tone: var(--danger); }
@media (hover: hover) and (pointer: fine) { .arc-site-footer-status:hover { color: var(--foreground); } }

/* Minimal: two quiet rows. */
.arc-site-footer-minimal { padding-block: var(--space-8) var(--space-6); }
.arc-site-footer-minimalRow { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-3) var(--space-6); }
.arc-site-footer-minimalRow + .arc-site-footer-minimalRow { margin-top: var(--space-6); border-top: 1px solid var(--border-subtle); padding-top: var(--space-5); }

/* Logo: the arch closes the page, cropped by the bottom edge and fading out in the brand gradient. */
.arc-site-footer-logo { padding-bottom: 0; }
.arc-site-footer-markStage { margin: var(--space-10) calc(var(--footer-pad) * -1) 0; -webkit-mask-image: linear-gradient(to bottom, #000 18%, transparent 96%); mask-image: linear-gradient(to bottom, #000 18%, transparent 96%); pointer-events: none; }
.arc-site-footer-bigMark { display: block; width: 100%; height: auto; }

@container site-footer (max-width: 760px) {
  .arc-site-footer-top { grid-template-columns: minmax(0, 1fr); gap: var(--space-10); }
}
@container site-footer (max-width: 520px) {
  .arc-site-footer-columns { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-8) var(--space-4); }
  .arc-site-footer-newsletter { max-width: none; }
  .arc-site-footer-bottom { flex-direction: column; align-items: flex-start; }
}

.arc-site-footer-preview { display: grid; width: 100%; justify-items: center; gap: var(--space-4); }
.arc-site-footer-frame { width: 100%; overflow: hidden; border: 1px solid var(--border); border-radius: 20px; background: var(--background); }
.arc-site-footer-frame > .arc-site-footer-footer { border-top: 0; }
.arc-site-footer-previewNote { min-height: 20px; margin: 0; color: var(--text-muted); font-size: var(--text-xs); }

@media (prefers-reduced-motion: reduce) {
  .arc-site-footer-link, .arc-site-footer-external, .arc-site-footer-newsletterRow { transition: none; }
}
`;

const styles: Record<string, string> = new Proxy({
  "bigMark": "arc-site-footer-bigMark",
  "bottom": "arc-site-footer-bottom",
  "bottomEnd": "arc-site-footer-bottomEnd",
  "bottomStart": "arc-site-footer-bottomStart",
  "brand": "arc-site-footer-brand",
  "brandMark": "arc-site-footer-brandMark",
  "brandRow": "arc-site-footer-brandRow",
  "column": "arc-site-footer-column",
  "columns": "arc-site-footer-columns",
  "copyright": "arc-site-footer-copyright",
  "external": "arc-site-footer-external",
  "footer": "arc-site-footer-footer",
  "frame": "arc-site-footer-frame",
  "inline": "arc-site-footer-inline",
  "intro": "arc-site-footer-intro",
  "link": "arc-site-footer-link",
  "logo": "arc-site-footer-logo",
  "markStage": "arc-site-footer-markStage",
  "message": "arc-site-footer-message",
  "messageSlot": "arc-site-footer-messageSlot",
  "minimal": "arc-site-footer-minimal",
  "minimalRow": "arc-site-footer-minimalRow",
  "newsletter": "arc-site-footer-newsletter",
  "newsletterButton": "arc-site-footer-newsletterButton",
  "newsletterInput": "arc-site-footer-newsletterInput",
  "newsletterRow": "arc-site-footer-newsletterRow",
  "newsletterTitle": "arc-site-footer-newsletterTitle",
  "preview": "arc-site-footer-preview",
  "previewNote": "arc-site-footer-previewNote",
  "srOnly": "arc-site-footer-srOnly",
  "status": "arc-site-footer-status",
  "statusDot": "arc-site-footer-statusDot",
  "tagline": "arc-site-footer-tagline",
  "top": "arc-site-footer-top"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-site-footer-${prop}`,
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



export type SiteFooterVariant = "columns" | "minimal" | "logo";

export interface SiteFooterLink {
  label: string;
  href?: string;
  /** Opens in a new tab and shows an outward arrow. */
  external?: boolean;
}

export interface SiteFooterColumn {
  title: string;
  links: SiteFooterLink[];
}

export interface SiteFooterNewsletter {
  title?: string;
  description?: string;
  placeholder?: string;
  /** Called with a valid address. Throw or reject to show an error; resolve to show the subscribed state. */
  onSubscribe?: (email: string) => void | Promise<void>;
}

export interface SiteFooterProps {
  /** `columns` pairs a newsletter with link columns, `minimal` is one quiet row, `logo` ends in a large fading Arc mark. */
  variant?: SiteFooterVariant;
  brand?: { name: string; href?: string; mark?: ReactNode };
  /** One short line under the brand. */
  tagline?: string;
  columns?: SiteFooterColumn[];
  /** Links for the minimal variant. Defaults to the first link of each column. */
  links?: SiteFooterLink[];
  /** Small links beside the copyright, such as Privacy and Terms. */
  legal?: SiteFooterLink[];
  socials?: SiteFooterLink[];
  /** Newsletter signup. Pass null to hide it. */
  newsletter?: SiteFooterNewsletter | null;
  /** A system status link. Pass null to hide it. */
  status?: { label: string; tone?: "success" | "warning" | "danger"; href?: string } | null;
  /** Year in the copyright line. */
  year?: number;
  /** Called for every link that is pressed. Links without an href render as buttons and only call this. */
  onNavigate?: (link: SiteFooterLink) => void;
  className?: string;
}

type Bezier = [number, number, number, number];
const enter = [...motionTokens.ease.enter] as Bezier;

export const siteFooterExampleColumns: SiteFooterColumn[] = [
  { title: "Product", links: [{ label: "Components" }, { label: "Blocks" }, { label: "Templates" }, { label: "Pricing" }] },
  { title: "Resources", links: [{ label: "Documentation" }, { label: "Changelog" }, { label: "Guides" }, { label: "Figma kit", external: true }] },
  { title: "Company", links: [{ label: "About" }, { label: "Customers" }, { label: "Careers" }, { label: "Contact" }] },
];
const exampleLegal: SiteFooterLink[] = [{ label: "Privacy" }, { label: "Terms" }, { label: "Licenses" }];
const exampleSocials: SiteFooterLink[] = [{ label: "X", external: true }, { label: "GitHub", external: true }, { label: "LinkedIn", external: true }];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function FooterLink({ link, onNavigate, className }: { link: SiteFooterLink; onNavigate?: (link: SiteFooterLink) => void; className?: string }) {
  const content = <>{link.label}{link.external && <ArrowUpRight className={styles.external} size={13} strokeWidth={2} aria-hidden="true" />}</>;
  const onClick = () => onNavigate?.(link);
  if (link.href) return <a className={className ?? styles.link} href={link.href} onClick={onClick} {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{content}</a>;
  return <button type="button" className={className ?? styles.link} onClick={onClick}>{content}</button>;
}

function ArcMark({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 48V29C9 15 19 7 32 7s23 8 23 22v19" />
    <path d="M20 48V31c0-8 5-13 12-13s12 5 12 13v17" />
    <path d="M32 38v10" />
  </svg>;
}

/** Email signup that validates in place, keeps its width while the button morphs, and confirms without a toast. */
function Newsletter({ title, description, placeholder = "you@example.com", onSubscribe }: SiteFooterNewsletter) {
  const id = useId();
  const reduced = !!useReducedMotion();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const validate = (value: string) => !value.trim() ? "Enter your email address" : EMAIL.test(value.trim()) ? null : "That email doesn't look right";

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (state !== "idle") return;
    setTouched(true);
    const problem = validate(email);
    setError(problem);
    if (problem) return;
    setState("loading");
    try {
      await (onSubscribe ? onSubscribe(email.trim()) : new Promise(resolve => setTimeout(resolve, 900)));
      setState("done");
    } catch {
      setState("idle");
      setError("We couldn't subscribe you. Try again in a moment");
    }
  }

  const message = state === "done" ? `Check ${email.trim()} to confirm` : error ?? description;
  const tone = state === "done" ? "success" : error ? "error" : "hint";

  return <form className={styles.newsletter} onSubmit={submit} noValidate aria-labelledby={title ? `${id}-title` : undefined}>
    {title && <h2 id={`${id}-title`} className={styles.newsletterTitle}>{title}</h2>}
    <div className={styles.newsletterRow} data-invalid={error ? "" : undefined} data-done={state === "done" ? "" : undefined}>
      <label className={styles.srOnly} htmlFor={`${id}-email`}>Email address</label>
      <input
        id={`${id}-email`}
        className={styles.newsletterInput}
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder={placeholder}
        value={email}
        readOnly={state !== "idle"}
        aria-invalid={error ? true : undefined}
        aria-describedby={`${id}-message`}
        onChange={event => { setEmail(event.target.value); if (touched) setError(validate(event.target.value)); }}
        onBlur={() => { if (email) { setTouched(true); setError(validate(email)); } }}
      />
      <Button type="submit" size="sm" variant="primary" loading={state === "loading"} className={styles.newsletterButton} aria-disabled={state === "done" || undefined}>
        {state === "done" ? <><Check size={15} strokeWidth={2.25} aria-hidden="true" />Subscribed</> : "Subscribe"}
      </Button>
    </div>
    <div className={styles.messageSlot} id={`${id}-message`} aria-live="polite">
      <AnimatePresence initial={false} mode="popLayout">
        {message && <motion.p key={message} className={styles.message} data-tone={tone} role={tone === "error" ? "alert" : undefined}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 4, filter: `blur(${motionTokens.blur.subtle}px)` }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -4, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: .12 } }}
          transition={{ duration: reduced ? 0 : motionTokens.duration.standard, ease: enter }}>{message}</motion.p>}
      </AnimatePresence>
    </div>
  </form>;
}

/**
 * A website footer in three layouts: link columns with a newsletter signup, a single quiet row, and a closing
 * variant where the Arc arch rises in, oversized and cropped by the bottom edge, fading into the page.
 */
export const SiteFooter = forwardRef<HTMLElement, SiteFooterProps>(function SiteFooter({
  variant = "columns",
  brand = { name: "Arc" },
  tagline = "Interface components that move with intent.",
  columns = siteFooterExampleColumns,
  links,
  legal = exampleLegal,
  socials = exampleSocials,
  newsletter = { title: "Get the monthly release notes", description: "One email a month. Unsubscribe anytime." },
  status = { label: "All systems normal", tone: "success" },
  year = new Date().getFullYear(),
  onNavigate,
  className,
}, ref) {
  const reduced = !!useReducedMotion();
  const gradientId = useId().replace(/:/g, "");
  const brandNode = <FooterLink link={{ label: brand.name, href: brand.href }} onNavigate={onNavigate} className={styles.brand} />;
  const brandWithMark = <span className={styles.brandRow}>{brand.mark ?? <ArcMark className={styles.brandMark} />}{brandNode}</span>;
  const statusNode = status && (status.href
    ? <a className={styles.status} href={status.href} data-tone={status.tone ?? "success"} onClick={() => onNavigate?.({ label: status.label, href: status.href })}><span className={styles.statusDot} aria-hidden="true" />{status.label}</a>
    : <button type="button" className={styles.status} data-tone={status.tone ?? "success"} onClick={() => onNavigate?.({ label: status.label })}><span className={styles.statusDot} aria-hidden="true" />{status.label}</button>);
  const socialNode = socials.length > 0 && <ul className={styles.inline} aria-label="Social">{socials.map(link => <li key={link.label}><FooterLink link={link} onNavigate={onNavigate} /></li>)}</ul>;
  const legalRow = <div className={styles.bottom}>
    <div className={styles.bottomStart}>
      <span className={styles.copyright}>© {year} {brand.name}</span>
      {legal.length > 0 && <ul className={styles.inline} aria-label="Legal">{legal.map(link => <li key={link.label}><FooterLink link={link} onNavigate={onNavigate} /></li>)}</ul>}
    </div>
    <div className={styles.bottomEnd}>{statusNode}{socialNode}</div>
  </div>;
  const columnNav = <nav className={styles.columns} aria-label="Footer">
    {columns.map(column => <div key={column.title} className={styles.column}>
      <h2>{column.title}</h2>
      <ul>{column.links.map(link => <li key={link.label}><FooterLink link={link} onNavigate={onNavigate} /></li>)}</ul>
    </div>)}
  </nav>;

  if (variant === "minimal") {
    const rowLinks = links ?? columns.map(column => column.links[0]).filter(Boolean).concat(legal.slice(0, 2));
    return <footer ref={ref} className={[styles.footer, styles.minimal, className].filter(Boolean).join(" ")}>
      <div className={styles.minimalRow}>
        {brandWithMark}
        <nav aria-label="Footer"><ul className={styles.inline}>{rowLinks.map(link => <li key={link.label}><FooterLink link={link} onNavigate={onNavigate} /></li>)}</ul></nav>
      </div>
      <div className={styles.minimalRow}>
        <span className={styles.copyright}>© {year} {brand.name}. {tagline}</span>
        <div className={styles.bottomEnd}>{statusNode}{socialNode}</div>
      </div>
    </footer>;
  }

  return <footer ref={ref} className={[styles.footer, variant === "logo" ? styles.logo : "", className].filter(Boolean).join(" ")}>
    <div className={styles.top}>
      <div className={styles.intro}>
        {brandWithMark}
        {tagline && <p className={styles.tagline}>{tagline}</p>}
        {newsletter && variant === "columns" && <Newsletter {...newsletter} />}
      </div>
      {columnNav}
    </div>
    {legalRow}
    {variant === "logo" && <motion.div className={styles.markStage} aria-hidden="true"
      initial={reduced ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: .3 }}
      transition={{ duration: reduced ? 0 : .9, ease: enter }}>
      {/* The top of the arch, drawn oversized and cropped by its viewBox, in the brand gradient and fading toward the bottom edge. */}
      <svg className={styles.bigMark} viewBox="0 3.5 64 30" fill="none" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" preserveAspectRatio="xMidYMin meet">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" style={{ stopColor: "var(--arc-gradient-from)" }} />
            <stop offset="1" style={{ stopColor: "var(--arc-gradient-to)" }} />
          </linearGradient>
        </defs>
        <g stroke={`url(#${gradientId})`}>
          <path d="M9 48V29C9 15 19 7 32 7s23 8 23 22v19" />
          <path d="M20 48V31c0-8 5-13 12-13s12 5 12 13v17" />
          <path d="M32 38v10" />
        </g>
      </svg>
    </motion.div>}
  </footer>;
});

SiteFooter.displayName = "SiteFooter";

const variantOptions = [{ value: "columns", label: "Columns" }, { value: "minimal", label: "Minimal" }, { value: "logo", label: "Logo" }];

/** Preview: the footer with a switch between its three layouts and a note of the last link pressed. */
export function SiteFooterBlock({ variant: initial = "columns" }: { variant?: SiteFooterVariant }) {
  const [variant, setVariant] = useState<SiteFooterVariant>(initial);
  const [last, setLast] = useState<string | null>(null);
  return <div className={styles.preview}>
    <SegmentedControl label="Footer layout" options={variantOptions} value={variant} onValueChange={value => setVariant(value as SiteFooterVariant)} />
    <div className={styles.frame}>
      <SiteFooter key={variant} variant={variant} onNavigate={link => setLast(link.label)} />
    </div>
    <p className={styles.srOnly} aria-live="polite">{last ? `Opened ${last}` : ""}</p>
  </div>;
}

export default SiteFooterBlock;
