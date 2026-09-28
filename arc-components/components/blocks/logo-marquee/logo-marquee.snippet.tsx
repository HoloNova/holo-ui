"use client";

import { Pause, Play } from "lucide-react";
import { useId, useState } from "react";

// ── Scoped CSS & Styles Proxy ──
const ARC_LOGO_MARQUEE_STYLES = `.arc-logo-marquee-section {
  container: logos / inline-size;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius-surface);
  background: var(--surface);
  color: var(--foreground);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  letter-spacing: var(--tracking-body);
  line-height: var(--leading-body);
}

.arc-logo-marquee-intro {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 0.72fr);
  align-items: end;
  gap: 48px;
  padding: 40px 40px 36px;
}

.arc-logo-marquee-intro h2 {
  max-width: 540px;
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 400;
  line-height: var(--leading-display);
  text-wrap: balance;
  letter-spacing: var(--tracking-display);
}

.arc-logo-marquee-intro p {
  max-width: 36ch;
  margin: 0 0 3px;
  color: var(--text-secondary);
  font-size: var(--text-base);
  line-height: 1.5;
  text-wrap: pretty;
}

.arc-logo-marquee-marquee {
  position: relative;
  overflow: hidden;
  border-top: 1px solid var(--border-subtle);
  border-bottom: 1px solid var(--border-subtle);
  padding-block: 32px;
  mask-image: linear-gradient(to right, transparent, #000 7%, #000 93%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, #000 7%, #000 93%, transparent);
}

.arc-logo-marquee-track {
  display: flex;
  width: max-content;
  animation: travel 39s linear infinite;
  will-change: transform;
}

.arc-logo-marquee-track.paused {
  animation-play-state: paused;
}

/* Hovering the row holds it still, so a logo can be read. */
@media (hover: hover) and (pointer: fine) {
  .arc-logo-marquee-marquee:hover .arc-logo-marquee-track { animation-play-state: paused; }
}

.arc-logo-marquee-brandList {
  display: flex;
  flex: none;
  align-items: center;
  gap: 56px;
  margin: 0;
  padding: 0 56px 0 0;
  list-style: none;
}

.arc-logo-marquee-brand {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 10px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.arc-logo-marquee-brandMark {
  display: block;
  width: 22px;
  height: 22px;
  flex: none;
  background: currentColor;
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: contain;
  -webkit-mask-position: center;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: contain;
}

img.brandMark { background: none; object-fit: contain; }

/* In color tone the marks carry the brand color and the names read at full contrast; black and white marks follow the text. */
.arc-logo-marquee-section[data-tone="color"] .arc-logo-marquee-brand { color: var(--foreground); }

.arc-logo-marquee-brandName {
  font-size: var(--text-lg);
  font-weight: 500;
  letter-spacing: -.02em;
}

.arc-logo-marquee-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  padding: 10px 16px;
}

.arc-logo-marquee-motionButton { color: var(--text-secondary); }
.arc-logo-marquee-motionStatus {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@keyframes travel {
  to { transform: translateX(-50%); }
}

@container logos (max-width: 639px) {
  .arc-logo-marquee-intro {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 28px 20px 24px;
  }

  .arc-logo-marquee-intro h2 { font-size: var(--text-2xl); }
  .arc-logo-marquee-intro p { font-size: var(--text-sm); }
  .arc-logo-marquee-marquee { padding-block: 24px; }
  .arc-logo-marquee-brandList { gap: 40px; padding-right: 40px; }
  img.brandMark { background: none; object-fit: contain; }

/* In color tone the marks carry the brand color and the names read at full contrast; black and white marks follow the text. */
.arc-logo-marquee-section[data-tone="color"] .arc-logo-marquee-brand { color: var(--foreground); }

.arc-logo-marquee-brandName { font-size: var(--text-base); }
  .arc-logo-marquee-brandMark { width: 20px; height: 20px; }
  .arc-logo-marquee-footer { padding-inline: 12px; }
}



@media (prefers-reduced-motion: reduce) {
  .arc-logo-marquee-track {
    animation: none;
    will-change: auto;
  }

  .arc-logo-marquee-track { width: auto; justify-content: center; }
  .arc-logo-marquee-brandList { flex-wrap: wrap; justify-content: center; row-gap: 20px; padding: 0 24px; }
  .arc-logo-marquee-brandList[aria-hidden="true"] { display: none; }
  .arc-logo-marquee-footer { display: none; }
}
`;

const styles: Record<string, string> = new Proxy({
  "brand": "arc-logo-marquee-brand",
  "brandList": "arc-logo-marquee-brandList",
  "brandMark": "arc-logo-marquee-brandMark",
  "brandName": "arc-logo-marquee-brandName",
  "footer": "arc-logo-marquee-footer",
  "intro": "arc-logo-marquee-intro",
  "marquee": "arc-logo-marquee-marquee",
  "motionButton": "arc-logo-marquee-motionButton",
  "motionStatus": "arc-logo-marquee-motionStatus",
  "paused": "arc-logo-marquee-paused",
  "section": "arc-logo-marquee-section",
  "track": "arc-logo-marquee-track"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-logo-marquee-${prop}`,
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



export interface LogoMarqueeBrand {
  name: string;
  /** Monochrome SVG, drawn as a mask in the text color. */
  icon: string;
  /** Single brand color for the mark in color tone. Leave out for brands whose mark is black or white. */
  color?: string;
  /** Full color SVG for multicolor marks, used in color tone instead of `icon`. */
  colorIcon?: string;
}

export type LogoMarqueeTone = "color" | "mono";

export interface LogoMarqueeProps {
  title?: string;
  description?: string;
  brands?: LogoMarqueeBrand[];
  /** `color` shows each mark in its official colors; `mono` draws every mark in the text color. */
  tone?: LogoMarqueeTone;
}

const exampleBrands: LogoMarqueeBrand[] = [
  { name: "Figma", icon: "/block-logos/figma.svg", colorIcon: "/block-logos/figma-color.svg" },
  { name: "Linear", icon: "/block-logos/linear.svg", color: "#5E6AD2" },
  { name: "Notion", icon: "/block-logos/notion.svg" },
  { name: "Slack", icon: "/block-logos/slack.svg", colorIcon: "/block-logos/slack-color.svg" },
  { name: "GitHub", icon: "/block-logos/github.svg" },
  { name: "Stripe", icon: "/block-logos/stripe.svg", color: "#635BFF" },
  { name: "Vercel", icon: "/block-logos/vercel.svg" },
];

function BrandMark({ brand, tone }: { brand: LogoMarqueeBrand; tone: LogoMarqueeTone }) {
  if (tone === "color" && brand.colorIcon) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={styles.brandMark} src={brand.colorIcon} alt="" width={22} height={22} draggable={false} />;
  }
  return (
    <span
      className={styles.brandMark}
      style={{ maskImage: `url("${brand.icon}")`, WebkitMaskImage: `url("${brand.icon}")`, color: tone === "color" ? brand.color : undefined }}
      aria-hidden="true"
    />
  );
}

function BrandList({ brands, tone, duplicate = false }: { brands: LogoMarqueeBrand[]; tone: LogoMarqueeTone; duplicate?: boolean }) {
  return (
    <ul className={styles.brandList} aria-label={duplicate ? undefined : "Illustrative tool logos"} aria-hidden={duplicate || undefined}>
      {brands.map((brand, index) => (
        <li className={styles.brand} key={`${brand.name}-${index}`}>
          <BrandMark brand={brand} tone={tone} />
          <span className={styles.brandName}>{brand.name}</span>
        </li>
      ))}
    </ul>
  );
}

export function LogoMarquee({
  title = "Good work moves between tools",
  description = "From the first idea to the final handoff, a familiar set of tools stays close to the work.",
  brands = exampleBrands,
  tone = "color",
}: LogoMarqueeProps) {
  const titleId = useId();
  const [paused, setPaused] = useState(false);

  return (
    <section className={styles.section} data-tone={tone} aria-labelledby={titleId}>
      <div className={styles.intro}>
        <h2 id={titleId}>{title}</h2>
        <p>{description}</p>
      </div>

      <div className={styles.marquee} role="region" aria-label="Illustrative tool logos">
        <div className={`${styles.track}${paused ? ` ${styles.paused}` : ""}`}>
          <BrandList brands={brands} tone={tone} />
          <BrandList brands={brands} tone={tone} duplicate />
        </div>
      </div>

      <div className={styles.footer}>
        <Button
          variant="ghost"
          size="sm"
          className={styles.motionButton}
          aria-label={paused ? "Play logo motion" : "Pause logo motion"}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? <><Play size={16} strokeWidth={1.75} aria-hidden="true" />Play</> : <><Pause size={16} strokeWidth={1.75} aria-hidden="true" />Pause</>}
        </Button>
        <span className={styles.motionStatus} aria-live="polite">
          {paused ? "Motion paused" : ""}
        </span>
      </div>
    </section>
  );
}

export default LogoMarquee;
