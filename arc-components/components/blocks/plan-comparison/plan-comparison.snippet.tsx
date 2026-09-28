"use client";

import { Check } from "lucide-react";
import { animate, AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

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
const ARC_PLAN_COMPARISON_STYLES = `.arc-plan-comparison-comparison { box-sizing: border-box; width: min(100%, 1060px); min-width: 0; margin-inline: auto; overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius-panel); background: var(--surface); color: var(--foreground); font-family: var(--font-body); font-size: var(--text-sm); letter-spacing: var(--tracking-body); line-height: var(--leading-body); }
.arc-plan-comparison-comparison *, .arc-plan-comparison-comparison *::before, .arc-plan-comparison-comparison *::after { box-sizing: border-box; }

/* Intro */
.arc-plan-comparison-intro { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px 32px; padding: 32px 32px 24px; }
.arc-plan-comparison-intro > div:first-child { min-width: 0; max-width: 560px; }
.arc-plan-comparison-intro h2 { margin: 0; font-family: var(--font-display); font-size: var(--text-3xl); font-weight: 400; letter-spacing: var(--tracking-display); line-height: var(--leading-display); text-wrap: balance; }
.arc-plan-comparison-intro p { max-width: 46ch; margin: 8px 0 0; color: var(--text-secondary); text-wrap: pretty; }
.arc-plan-comparison-billing { display: grid; flex: none; justify-items: end; gap: 6px; }
.arc-plan-comparison-billing small { min-height: 16px; color: var(--text-muted); font-size: var(--text-xs); font-variant-numeric: tabular-nums; }

/* Filter bar */
.arc-plan-comparison-filter { display: flex; min-height: 52px; align-items: center; justify-content: space-between; gap: 8px 16px; border-top: 1px solid var(--border); padding: 8px 32px; }
.arc-plan-comparison-filter > div:first-child { display: flex; align-items: baseline; gap: 10px; }
.arc-plan-comparison-filter h3 { margin: 0; font-size: var(--text-sm); font-weight: 500; }
.arc-plan-comparison-featureCount { min-width: 11ch; color: var(--text-muted); font-size: var(--text-xs); font-variant-numeric: tabular-nums; }
.arc-plan-comparison-filter > button { flex: none; }

/* Matrix */
.arc-plan-comparison-matrix { border-top: 1px solid var(--border); }
.arc-plan-comparison-planHeader, .arc-plan-comparison-featureRow { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr) minmax(0, 1fr); }
.arc-plan-comparison-featureHeader { display: flex; align-items: end; padding: 0 16px 20px 32px; color: var(--text-muted); font-size: var(--text-xs); }
.arc-plan-comparison-planCell { position: relative; display: grid; min-width: 0; align-content: start; border-left: 1px solid var(--border); padding: 20px 20px 20px; transition: background-color var(--duration-standard) var(--ease-standard); }
.arc-plan-comparison-planCell.planSelected, .arc-plan-comparison-featureValue.valueSelected { background: var(--surface-muted); }
.arc-plan-comparison-planTop h3 { margin: 0; font-size: var(--text-base); font-weight: 500; letter-spacing: -.01em; }
.arc-plan-comparison-planTop > span { display: block; margin-top: 2px; color: var(--text-muted); font-size: var(--text-xs); }
.arc-plan-comparison-price { display: flex; flex-wrap: wrap; align-items: baseline; gap: 2px 6px; margin: 16px 0 14px; }
.arc-plan-comparison-priceValue { display: inline-flex; min-width: 3ch; font-family: var(--font-display); font-size: var(--text-3xl); font-weight: 400; letter-spacing: var(--tracking-display); line-height: 1; font-variant-numeric: tabular-nums; }
.arc-plan-comparison-pricePeriod { color: var(--text-muted); font-size: var(--text-xs); white-space: nowrap; }
.arc-plan-comparison-selectButton { width: 100%; }
.arc-plan-comparison-selectedRail { position: absolute; right: 0; bottom: -1px; left: 0; height: 2px; background: var(--accent); }
.arc-plan-comparison-rows { border-top: 1px solid var(--border); }
.arc-plan-comparison-featureRow { overflow: hidden; border-bottom: 1px solid var(--border-subtle); }
.arc-plan-comparison-featureRow:last-child { border-bottom: 0; }
.arc-plan-comparison-featureName, .arc-plan-comparison-featureValue { display: flex; min-width: 0; min-height: 44px; align-items: center; padding: 10px 20px; }
.arc-plan-comparison-featureName { padding-left: 32px; color: var(--foreground); }
.arc-plan-comparison-featureValue { border-left: 1px solid var(--border); color: var(--text-secondary); transition: background-color var(--duration-standard) var(--ease-standard), color var(--duration-standard) var(--ease-standard); }
.arc-plan-comparison-featureValue.valueSelected { color: var(--foreground); }
.arc-plan-comparison-included { display: inline-flex; align-items: center; gap: 6px; color: var(--foreground); }
.arc-plan-comparison-included svg { color: var(--success); }
.arc-plan-comparison-unavailable { color: var(--text-muted); }
.arc-plan-comparison-mobilePlan { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.arc-plan-comparison-footer { display: flex; min-height: 48px; align-items: center; justify-content: space-between; gap: 8px 24px; border-top: 1px solid var(--border); padding: 12px 32px; color: var(--text-muted); font-size: var(--text-xs); }
.arc-plan-comparison-footer p { min-height: 1.4em; margin: 0; color: var(--text-secondary); text-align: right; }

@media (hover: hover) and (pointer: fine) {
  .arc-plan-comparison-featureRow:hover .arc-plan-comparison-featureName { color: var(--foreground); }
}

/* Layout follows the block width (data-size, measured in the component), not the viewport. */
/* Medium: keep three columns, tighten the gutters. */
.arc-plan-comparison-comparison:is([data-size="md"], [data-size="sm"], [data-size="xs"]) .arc-plan-comparison-intro { flex-direction: column; align-items: flex-start; padding: 24px 20px 20px; }
.arc-plan-comparison-comparison:is([data-size="md"], [data-size="sm"], [data-size="xs"]) .arc-plan-comparison-billing { justify-items: start; }
.arc-plan-comparison-comparison:is([data-size="md"], [data-size="sm"], [data-size="xs"]) .arc-plan-comparison-filter { padding-inline: 20px; }
.arc-plan-comparison-comparison:is([data-size="md"], [data-size="sm"], [data-size="xs"]) .arc-plan-comparison-featureHeader, .arc-plan-comparison-comparison:is([data-size="md"], [data-size="sm"], [data-size="xs"]) .arc-plan-comparison-featureName { padding-left: 20px; }
.arc-plan-comparison-comparison:is([data-size="md"], [data-size="sm"], [data-size="xs"]) .arc-plan-comparison-planCell { padding: 16px 14px; }
.arc-plan-comparison-comparison:is([data-size="md"], [data-size="sm"], [data-size="xs"]) .arc-plan-comparison-featureValue { padding-inline: 14px; }
.arc-plan-comparison-comparison:is([data-size="md"], [data-size="sm"], [data-size="xs"]) .arc-plan-comparison-footer { flex-direction: column; align-items: flex-start; padding-inline: 20px; }
.arc-plan-comparison-comparison:is([data-size="md"], [data-size="sm"], [data-size="xs"]) .arc-plan-comparison-footer p { text-align: left; }

/* Narrow: the feature name sits above its two values, which stay aligned under the plan columns. */
.arc-plan-comparison-comparison:is([data-size="sm"], [data-size="xs"]) .arc-plan-comparison-intro h2 { font-size: var(--text-2xl); }
.arc-plan-comparison-comparison:is([data-size="sm"], [data-size="xs"]) .arc-plan-comparison-filter { flex-wrap: wrap; }
.arc-plan-comparison-comparison:is([data-size="sm"], [data-size="xs"]) .arc-plan-comparison-planHeader, .arc-plan-comparison-comparison:is([data-size="sm"], [data-size="xs"]) .arc-plan-comparison-featureRow { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.arc-plan-comparison-comparison:is([data-size="sm"], [data-size="xs"]) .arc-plan-comparison-featureHeader { display: none; }
.arc-plan-comparison-comparison:is([data-size="sm"], [data-size="xs"]) .arc-plan-comparison-planCell { border-left: 0; }
.arc-plan-comparison-comparison:is([data-size="sm"], [data-size="xs"]) .arc-plan-comparison-planCell + .arc-plan-comparison-planCell { border-left: 1px solid var(--border); }
.arc-plan-comparison-comparison:is([data-size="sm"], [data-size="xs"]) .arc-plan-comparison-priceValue { font-size: var(--text-2xl); }
.arc-plan-comparison-comparison:is([data-size="sm"], [data-size="xs"]) .arc-plan-comparison-featureName { grid-column: 1 / -1; min-height: 0; padding: 10px 20px 0; color: var(--text-secondary); font-size: var(--text-xs); }
.arc-plan-comparison-comparison:is([data-size="sm"], [data-size="xs"]) .arc-plan-comparison-featureValue { min-height: 0; border-left: 0; padding: 4px 14px 10px; }
.arc-plan-comparison-comparison:is([data-size="sm"], [data-size="xs"]) .arc-plan-comparison-featureValue:nth-child(2) { padding-left: 20px; }
.arc-plan-comparison-comparison:is([data-size="sm"], [data-size="xs"]) .arc-plan-comparison-featureValue + .arc-plan-comparison-featureValue { border-left: 1px solid var(--border-subtle); }
.arc-plan-comparison-comparison[data-size="xs"] .arc-plan-comparison-planCell { padding-inline: 12px; }
.arc-plan-comparison-comparison[data-size="xs"] .arc-plan-comparison-featureValue { padding-inline: 12px; }
.arc-plan-comparison-comparison[data-size="xs"] .arc-plan-comparison-featureValue:nth-child(2) { padding-left: 16px; }
.arc-plan-comparison-comparison[data-size="xs"] .arc-plan-comparison-featureName { padding-inline: 16px; }
.arc-plan-comparison-comparison[data-size="xs"] .arc-plan-comparison-intro, .arc-plan-comparison-comparison[data-size="xs"] .arc-plan-comparison-filter, .arc-plan-comparison-comparison[data-size="xs"] .arc-plan-comparison-footer { padding-inline: 16px; }
@media (prefers-reduced-motion: reduce) {
  .arc-plan-comparison-planCell, .arc-plan-comparison-featureValue { transition: none; }
}

.arc-plan-comparison-srOnly { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
`;

const styles: Record<string, string> = new Proxy({
  "billing": "arc-plan-comparison-billing",
  "comparison": "arc-plan-comparison-comparison",
  "featureCount": "arc-plan-comparison-featureCount",
  "featureHeader": "arc-plan-comparison-featureHeader",
  "featureName": "arc-plan-comparison-featureName",
  "featureRow": "arc-plan-comparison-featureRow",
  "featureValue": "arc-plan-comparison-featureValue",
  "filter": "arc-plan-comparison-filter",
  "footer": "arc-plan-comparison-footer",
  "included": "arc-plan-comparison-included",
  "intro": "arc-plan-comparison-intro",
  "matrix": "arc-plan-comparison-matrix",
  "mobilePlan": "arc-plan-comparison-mobilePlan",
  "planCell": "arc-plan-comparison-planCell",
  "planHeader": "arc-plan-comparison-planHeader",
  "planSelected": "arc-plan-comparison-planSelected",
  "planTop": "arc-plan-comparison-planTop",
  "price": "arc-plan-comparison-price",
  "pricePeriod": "arc-plan-comparison-pricePeriod",
  "priceValue": "arc-plan-comparison-priceValue",
  "rows": "arc-plan-comparison-rows",
  "selectButton": "arc-plan-comparison-selectButton",
  "selectedRail": "arc-plan-comparison-selectedRail",
  "srOnly": "arc-plan-comparison-srOnly",
  "unavailable": "arc-plan-comparison-unavailable",
  "valueSelected": "arc-plan-comparison-valueSelected"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-plan-comparison-${prop}`,
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



type Plan = "team" | "studio";
type Billing = "monthly" | "yearly";
type Feature = { label: string; team: string; studio: string; shared?: boolean };

const features: Feature[] = [
  { label: "Active projects", team: "Unlimited", studio: "Unlimited", shared: true },
  { label: "Shared workspaces", team: "1 workspace", studio: "Unlimited" },
  { label: "Guest reviewers", team: "5 per project", studio: "Unlimited" },
  { label: "Version history", team: "30 days", studio: "Unlimited" },
  { label: "Approval flows", team: "Not included", studio: "Included" },
  { label: "Custom roles", team: "Not included", studio: "Included" },
  { label: "Source exports", team: "Included", studio: "Included", shared: true },
  { label: "Support", team: "Email", studio: "Priority email" },
];

const pricing: Record<Plan, Record<Billing, number>> = {
  team: { monthly: 13, yearly: 10 },
  studio: { monthly: 27, yearly: 22 },
};

function Value({ text }: { text: string }) {
  if (text === "Included") return <span className={styles.included}><Check size={16} strokeWidth={1.75} aria-hidden="true" />Included</span>;
  return <span className={text === "Not included" ? styles.unavailable : undefined}>{text}</span>;
}

function AnimatedNumber({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    if (reduce) {
      previousValue.current = value;
      return;
    }

    const controls = animate(previousValue.current, value, {
      duration: motionTokens.duration.standard,
      ease: [...motionTokens.ease.enter],
      onUpdate: (latest) => setDisplayValue(Math.round(latest)),
    });

    previousValue.current = value;
    return () => controls.stop();
  }, [reduce, value]);

  return <>{reduce ? value : displayValue}</>;
}

export function PlanComparison() {
  const id = useId();
  const reduce = useReducedMotion();
  const [billing, setBilling] = useState<Billing>("monthly");
  const [differencesOnly, setDifferencesOnly] = useState(false);
  const [selected, setSelected] = useState<Plan | null>(null);
  const rootRef = useRef<HTMLElement>(null);
  const [size, setSize] = useState<"lg" | "md" | "sm" | "xs">("lg");
  useLayoutEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const measure = (width: number) => setSize(width <= 340 ? "xs" : width <= 540 ? "sm" : width <= 720 ? "md" : "lg");
    measure(node.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) => measure(entry.contentRect.width));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const visibleFeatures = differencesOnly ? features.filter((feature) => !feature.shared) : features;

  return (
    <section ref={rootRef} className={styles.comparison} data-size={size} aria-labelledby={`${id}-title`}>
      <div className={styles.intro}>
        <div><h2 id={`${id}-title`}>Room for the way you work</h2><p>Only the details that change between plans. Switch billing to see what you would pay.</p></div>
        <div className={styles.billing}><SegmentedControl label="Billing period" value={billing} onValueChange={(value) => setBilling(value as Billing)} options={[{ value: "monthly", label: "Monthly" }, { value: "yearly", label: "Yearly" }]} /><small>{billing === "yearly" ? "Billed yearly, save up to 23%" : "Billed month to month"}</small></div>
      </div>

      <div className={styles.filter}><div><h3>Compare plans</h3><span className={styles.featureCount}><AnimatedNumber value={visibleFeatures.length} /> of {features.length} features</span></div><Switch checked={differencesOnly} onCheckedChange={setDifferencesOnly} label="Show differences only" /></div>

      <div className={styles.matrix} role="table" aria-label="Team and Studio plan comparison">
        <div className={styles.planHeader} role="row">
          <div className={styles.featureHeader} role="columnheader">What changes</div>
          {(["team", "studio"] as const).map((plan) => (
            <div key={plan} className={`${styles.planCell} ${selected === plan ? styles.planSelected : ""}`} role="columnheader" aria-label={`${plan === "team" ? "Team" : "Studio"} plan`}>
              <div className={styles.planTop}><h3>{plan === "team" ? "Team" : "Studio"}</h3><span>{plan === "team" ? "For smaller teams" : "For work across teams"}</span></div>
              <div className={styles.price}><span className={styles.priceValue} aria-live="polite" aria-atomic="true">$<AnimatedNumber value={pricing[plan][billing]} /></span><span className={styles.pricePeriod}>per seat / month</span></div>
              <Button type="button" variant={selected === plan ? "primary" : "secondary"} className={styles.selectButton} aria-pressed={selected === plan} onClick={() => setSelected(current => current === plan ? null : plan)}>{selected === plan ? "Selected" : `Select ${plan === "team" ? "Team" : "Studio"}`}</Button>
              {selected === plan && <motion.span className={styles.selectedRail} layoutId={`${id}-selected-rail`} transition={reduce ? { duration: 0 } : motionTokens.spring.responsive} aria-hidden="true" />}
            </div>
          ))}
        </div>

        <div className={styles.rows} role="rowgroup">
          <AnimatePresence initial={false}>
            {visibleFeatures.map((feature) => (
              <motion.div key={feature.label} className={styles.featureRow} role="row" initial={reduce ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={reduce ? undefined : { height: 0, opacity: 0, transition: { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast } } }} transition={reduce ? { duration: 0 } : { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter], delay: .04 } }}>
                <div className={styles.featureName} role="rowheader">{feature.label}</div>
                <div className={`${styles.featureValue} ${selected === "team" ? styles.valueSelected : ""}`} role="cell"><span className={styles.mobilePlan}>Team</span><Value text={feature.team} /></div>
                <div className={`${styles.featureValue} ${selected === "studio" ? styles.valueSelected : ""}`} role="cell"><span className={styles.mobilePlan}>Studio</span><Value text={feature.studio} /></div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className={styles.footer}><span>Prices in USD per seat. Yearly plans are billed annually.</span><p className={styles.srOnly} role="status" aria-live="polite">{selected ? `${selected === "team" ? "Team" : "Studio"} selected` : ""}</p></div>
    </section>
  );
}

export default PlanComparison;
