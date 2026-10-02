"use client";

import { ChevronDown, Lock, ShieldCheck } from "lucide-react";
import { Slider as SliderPrimitive } from "radix-ui";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Inlined cn utility ---

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


// --- Inlined UI primitives ---


// ── Button ──
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon" | "icon-xs" | "xs";
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";
    const variants: Record<string, string> = {
      default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
      destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
      outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
    };
    const sizes: Record<string, string> = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-10 rounded-md px-8",
      icon: "h-9 w-9",
      "icon-xs": "h-6 w-6 p-0",
      xs: "h-6 px-2 text-xs",
    };
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant] || variants.default, sizes[size] || sizes.default, className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// ── Badge ──
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const base = "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  const variants: Record<string, string> = {
    default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
    outline: "text-foreground",
  };
  return <div className={cn(base, variants[variant] || variants.default, className)} {...props} />;
}

// ── Avatar ──
export function Avatar({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("relative flex size-8 shrink-0 overflow-hidden rounded-full", className)} {...props} />;
}

export function AvatarImage({ className, ...props }: React.ComponentProps<"img">) {
  return <img className={cn("aspect-square size-full", className)} {...props} />;
}

export function AvatarFallback({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex size-full items-center justify-center rounded-full bg-muted", className)} {...props} />;
}

// ── Progress ──
export interface ProgressProps extends React.ComponentProps<"div"> {
  value?: number;
}

export function Progress({ className, value = 0, ...props }: ProgressProps) {
  return (
    <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-secondary", className)} {...props}>
      <div
        className="size-full flex-1 bg-primary transition-all duration-300"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  );
}

// ── Switch ──
export interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function Switch({ className, checked = false, onCheckedChange, ...props }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-input",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none block size-4 rounded-full bg-background shadow-lg ring-0 transition-transform",
          checked ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  );
}

// ── Dialog ──
export function Dialog({ children, open, onOpenChange }: { children?: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) {
  return <div data-slot="dialog" data-state={open ? "open" : "closed"}>{children}</div>;
}

export function DialogTrigger({ children, asChild }: { children?: React.ReactNode; asChild?: boolean }) {
  return <div data-slot="dialog-trigger">{children}</div>;
}

export function DialogContent({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4", className)} {...props}>
      <div className="relative w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg">{children}</div>
    </div>
  );
}

// ── DropdownMenu ──
export function DropdownMenu({ children }: { children?: React.ReactNode }) {
  return <div className="relative inline-block text-left" data-slot="dropdown-menu">{children}</div>;
}

export function DropdownMenuTrigger({ children, asChild }: { children?: React.ReactNode; asChild?: boolean }) {
  return <div data-slot="dropdown-menu-trigger">{children}</div>;
}

export function DropdownMenuContent({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "absolute right-0 z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ── HoverCard ──
export function HoverCard({ children }: { children?: React.ReactNode }) {
  return <div className="relative inline-block">{children}</div>;
}
export function HoverCardTrigger({ children }: { children?: React.ReactNode }) {
  return <span className="cursor-pointer">{children}</span>;
}
export function HoverCardContent({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("absolute z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none", className)} {...props}>
      {children}
    </div>
  );
}

// ── Collapsible ──
export function Collapsible({ children, open, onOpenChange, ...props }: React.ComponentProps<"div"> & { open?: boolean; onOpenChange?: (open: boolean) => void }) {
  return <div data-state={open ? "open" : "closed"} {...props}>{children}</div>;
}
export function CollapsibleTrigger({ children, ...props }: React.ComponentProps<"button">) {
  return <button type="button" {...props}>{children}</button>;
}
export function CollapsibleContent({ children, ...props }: React.ComponentProps<"div">) {
  return <div {...props}>{children}</div>;
}

// ── Tooltip ──
export function TooltipProvider({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
export function Tooltip({ children }: { children?: React.ReactNode }) {
  return <div className="relative inline-block group">{children}</div>;
}
export function TooltipTrigger({ children, asChild }: { children?: React.ReactNode; asChild?: boolean }) {
  return <span className="inline-flex">{children}</span>;
}
export function TooltipContent({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("hidden group-hover:block absolute z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground shadow-md animate-in fade-in-0 zoom-in-95", className)} {...props}>
      {children}
    </div>
  );
}

// ── Tabs ──
export function Tabs({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />;
}
export function TabsList({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className)} {...props} />;
}
export function TabsTrigger({ className, ...props }: React.ComponentProps<"button">) {
  return <button className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow", className)} {...props} />;
}
export function TabsContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)} {...props} />;
}

// ── Table ──
export function Table({ className, ...props }: React.ComponentProps<"table">) {
  return <div className="relative w-full overflow-auto"><table className={cn("w-full caption-bottom text-sm", className)} {...props} /></div>;
}
export function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead className={cn("[&_tr]:border-b", className)} {...props} />;
}
export function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}
export function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return <tr className={cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className)} {...props} />;
}
export function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return <th className={cn("h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0", className)} {...props} />;
}
export function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td className={cn("p-2 align-middle [&:has([role=checkbox])]:pr-0", className)} {...props} />;
}
export function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return <caption className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />;
}

// ── Command (cmdk facade) ──
export function Command({ className, ...props }: React.ComponentProps<"div"> & { value?: string; shouldFilter?: boolean }) {
  return <div className={cn("flex size-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground", className)} {...props} />;
}
export function CommandInput({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn("flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />;
}
export function CommandList({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)} {...props} />;
}
export function CommandEmpty({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("py-6 text-center text-sm text-muted-foreground", className)} {...props} />;
}
export function CommandGroup({ className, heading, children, ...props }: React.ComponentProps<"div"> & { heading?: string }) {
  return (
    <div className={cn("overflow-hidden p-1 text-foreground", className)} {...props}>
      {heading && <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{heading}</div>}
      {children}
    </div>
  );
}
export function CommandItem({ className, onSelect, ...props }: React.ComponentProps<"div"> & { onSelect?: () => void }) {
  return (
    <div
      onClick={onSelect}
      className={cn("relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50", className)}
      {...props}
    />
  );
}




/** Derived privacy level from epsilon (lower epsilon → more privacy). */
export type PrivacyLevel = 'High' | 'Balanced' | 'Low';

/**
 * Privacy budget state, mirroring `@localmode/core` `createPrivacyBudget`
 * (`consumed()` / `maxEpsilon`). Drives the budget bar and its warning/error
 * transitions.
 */
export interface PrivacyBudgetState {
  /** Cumulative epsilon consumed so far. */
  consumed: number;
  /** Maximum cumulative epsilon allowed. */
  maxEpsilon: number;
}

/** Props for {@link DifferentialPrivacyControls}. */
export interface DifferentialPrivacyControlsProps {
  /**
   * Whether differential privacy is enabled. Controlled by the app's DP state
   * (typically whether `dpEmbeddingMiddleware` / `dpClassificationMiddleware`
   * is wired into the pipeline).
   */
  enabled: boolean;
  /** Called when the user toggles DP on or off. */
  onEnabledChange: (enabled: boolean) => void;
  /**
   * Privacy parameter epsilon (privacy budget per query). Lower epsilon = more
   * privacy, more noise. Matches `DPEmbeddingConfig.epsilon` /
   * `DPClassificationConfig.epsilon` in `@localmode/core`.
   */
  epsilon: number;
  /** Called when the user moves the epsilon slider. */
  onEpsilonChange: (epsilon: number) => void;
  /**
   * Minimum selectable epsilon.
   * @default 0.1
   */
  minEpsilon?: number;
  /**
   * Maximum selectable epsilon.
   * @default 10
   */
  maxEpsilon?: number;
  /**
   * Slider step.
   * @default 0.1
   */
  step?: number;
  /**
   * Live privacy budget from the app's tracker (`createPrivacyBudget`). When
   * provided, a budget bar is shown that turns warning then error as the
   * consumed epsilon approaches the maximum.
   */
  budget?: PrivacyBudgetState;
  /**
   * Open state of the collapsible panel. Controlled only when paired with
   * `onOpenChange`; without a handler it seeds the initial (uncontrolled) state
   * so the trigger still expands/collapses.
   * @default true
   */
  open?: boolean;
  /** Called when the panel is expanded or collapsed. */
  onOpenChange?: (open: boolean) => void;
  /** Additional class names merged onto the root element. */
  className?: string;
}

/** Threshold (fraction of budget consumed) at which the bar turns warning. */
const WARNING_THRESHOLD = 0.7;
/** Threshold at which the bar turns error. */
const ERROR_THRESHOLD = 0.9;

/** Derive a privacy level label from epsilon. Lower epsilon = more privacy. */
export function privacyLevelForEpsilon(epsilon: number): PrivacyLevel {
  if (epsilon <= 1) return 'High';
  if (epsilon <= 5) return 'Balanced';
  return 'Low';
}

/**
 * A presentational differential-privacy settings panel: an enable toggle, an
 * epsilon slider with a derived privacy-level label (High/Balanced/Low), and an
 * optional privacy-budget bar that turns warning then error as the budget is
 * consumed.
 *
 * It does **no** DP math. The app owns the DP state — wiring
 * `dpEmbeddingMiddleware` / `dpClassificationMiddleware` and a
 * `createPrivacyBudget` tracker from `@localmode/core` — and passes `enabled`,
 * `epsilon`, and the live `budget` in. There is no turnkey hook; the component
 * only renders and reports user intent through the change callbacks.
 *
 * Pair it with {@link DpAppliedBadge} beneath protected output as an audit chip.
 *
 * Styled with shadcn/ui CSS variables so it inherits the consumer's theme.
 *
 * @example
 * ```tsx
 * <DifferentialPrivacyControls
 *   enabled={dpEnabled}
 *   onEnabledChange={setDpEnabled}
 *   epsilon={epsilon}
 *   onEpsilonChange={setEpsilon}
 *   budget={{ consumed: budget.consumed(), maxEpsilon: 10 }}
 * />
 * ```
 */
export function DifferentialPrivacyControls({
  enabled,
  onEnabledChange,
  epsilon,
  onEpsilonChange,
  minEpsilon = 0.1,
  maxEpsilon = 10,
  step = 0.1,
  budget,
  open = true,
  onOpenChange,
  className,
}: DifferentialPrivacyControlsProps) {
  const level = privacyLevelForEpsilon(epsilon);

  const consumedFraction =
    budget && budget.maxEpsilon > 0
      ? Math.max(0, Math.min(1, budget.consumed / budget.maxEpsilon))
      : 0;
  const budgetState: 'ok' | 'warning' | 'error' =
    consumedFraction >= ERROR_THRESHOLD
      ? 'error'
      : consumedFraction >= WARNING_THRESHOLD
        ? 'warning'
        : 'ok';

  // Controlled only when the caller wires `onOpenChange`; otherwise run
  // uncontrolled (`defaultOpen`) so the trigger still collapses without a handler.
  const collapsibleProps = onOpenChange
    ? { open, onOpenChange }
    : { defaultOpen: open };

  return (
    <Collapsible
      {...collapsibleProps}
      className={cn(
        'w-full rounded-lg border border-border bg-card text-card-foreground',
        className,
      )}
    >
      <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 px-4 py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
        <span className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-muted-foreground" aria-hidden />
          Differential Privacy
        </span>
        <span className="flex items-center gap-2">
          <Badge variant={enabled ? 'default' : 'outline'}>
            {enabled ? 'On' : 'Off'}
          </Badge>
          <ChevronDown
            className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
            aria-hidden
          />
        </span>
      </CollapsibleTrigger>

      <CollapsibleContent className="flex flex-col gap-4 border-t border-border px-4 py-3">
        {/* Enable toggle */}
        <label className="flex items-center justify-between gap-3">
          <span className="flex flex-col">
            <span className="text-sm font-medium">Add privacy noise</span>
            <span className="text-xs text-muted-foreground">
              Perturb embeddings/results before they leave the model.
            </span>
          </span>
          <Switch checked={enabled} onCheckedChange={onEnabledChange} />
        </label>

        {/* Epsilon slider + derived level */}
        <div
          className={cn(
            'flex flex-col gap-2',
            !enabled && 'pointer-events-none opacity-50',
          )}
        >
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              Epsilon (ε){' '}
              <span className="font-mono text-xs font-medium tabular-nums text-foreground">
                {epsilon.toFixed(1)}
              </span>
            </span>
            <Badge variant="secondary">{level} privacy</Badge>
          </div>
          {/* Radix Slider primitive directly so the accessible name + formatted
              ε readout land on the Thumb (the focusable `role="slider"`); Radix
              ignores `aria-label` on the Root. */}
          <SliderPrimitive.Root
            data-slot="slider"
            value={[epsilon]}
            min={minEpsilon}
            max={maxEpsilon}
            step={step}
            disabled={!enabled}
            onValueChange={(v) => onEpsilonChange(v[0] ?? epsilon)}
            className="relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50"
          >
            <SliderPrimitive.Track
              data-slot="slider-track"
              className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted"
            >
              <SliderPrimitive.Range
                data-slot="slider-range"
                className="absolute h-full bg-primary"
              />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb
              data-slot="slider-thumb"
              aria-label="Epsilon (privacy budget per query)"
              aria-valuetext={`ε ${epsilon.toFixed(1)}, ${level} privacy`}
              className="block size-4 shrink-0 rounded-full border border-primary bg-background shadow-sm ring-ring/50 transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
            />
          </SliderPrimitive.Root>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>More privacy</span>
            <span>Less privacy</span>
          </div>
        </div>

        {/* Privacy budget bar */}
        {budget && (
          <div
            className={cn(
              'flex flex-col gap-1.5',
              !enabled && 'opacity-50',
            )}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">Privacy budget</span>
              <span
                className={cn(
                  'font-mono',
                  budgetState === 'warning' &&
                    'text-amber-600 dark:text-amber-400',
                  budgetState === 'error' && 'text-red-600 dark:text-red-400',
                  budgetState === 'ok' && 'text-muted-foreground',
                )}
              >
                {budget.consumed.toFixed(1)} / {budget.maxEpsilon.toFixed(1)} ε
              </span>
            </div>
            <div
              role="progressbar"
              aria-label="Privacy budget consumed"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(consumedFraction * 100)}
              className="h-2 w-full overflow-hidden rounded-full bg-muted"
            >
              <div
                className={cn(
                  'h-full rounded-full transition-[width]',
                  budgetState === 'ok' && 'bg-emerald-500',
                  budgetState === 'warning' && 'bg-amber-500',
                  budgetState === 'error' && 'bg-red-500',
                )}
                style={{ width: `${consumedFraction * 100}%` }}
              />
            </div>
            {budgetState === 'error' && (
              <span className="text-[10px] text-red-600 dark:text-red-400">
                Privacy budget nearly exhausted: further queries leak more
                information.
              </span>
            )}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

/** Props for {@link DpAppliedBadge}. */
export interface DpAppliedBadgeProps {
  /** Epsilon value applied to the protected output. */
  epsilon: number;
  /**
   * Embedding dimensionality the noise was applied across (e.g. the embedding
   * model's `dimensions`). Optional — omitted for non-vector outputs.
   */
  dimensions?: number;
  /** Additional class names merged onto the badge. */
  className?: string;
}

/**
 * A compact "DP Applied" provenance chip for rendering beneath
 * differential-privacy-protected output. Shows a lock icon, the epsilon used,
 * and (optionally) the embedding dimensionality the noise spanned.
 *
 * Render it only when DP was actually applied — the fields must match the real
 * values emitted by the DP middleware run (`DPEmbeddingConfig.epsilon`, the
 * embedding model's `dimensions`), never placeholders.
 *
 * @example
 * ```tsx
 * {dpEnabled && <DpAppliedBadge epsilon={1.0} dimensions={384} />}
 * ```
 */
export function DpAppliedBadge({
  epsilon,
  dimensions,
  className,
}: DpAppliedBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn('gap-1.5 font-normal', className)}
      title={`Differential privacy applied with ε=${epsilon}`}
    >
      <Lock className="size-3" aria-hidden />
      <span>DP applied</span>
      <span className="font-mono text-muted-foreground">ε={epsilon}</span>
      {dimensions != null && (
        <span className="font-mono text-muted-foreground">
          · {dimensions}d
        </span>
      )}
    </Badge>
  );
}

export default DifferentialPrivacyControls;
