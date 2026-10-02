"use client";

import * as React from "react";
import { Brain, ChevronDown, Square } from "lucide-react";
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


/**
 * @file reasoning.tsx
 * @description The model's own thinking tokens (DeepSeek-R1 style), in a
 * collapsible region. `Reasoning` auto-expands while thinking tokens stream and
 * auto-collapses when the final answer arrives, showing an elapsed timer.
 * `ThinkingBar` is a compact one-line status strip with inline stop/expand.
 *
 * Tier of the thinking taxonomy: `ThinkingBar` (compact) → `Reasoning`
 * (free-text) → `ChainOfThought` (itemized). Distinct from `Tool` / `Task`.
 */

/** Reasoning open/streaming context shared with its sub-parts. */
interface ReasoningContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  streaming: boolean;
  elapsedMs: number;
}
const ReasoningContext = React.createContext<ReasoningContextValue | null>(null);
function useReasoning() {
  const ctx = React.useContext(ReasoningContext);
  if (!ctx)
    throw new Error('Reasoning sub-parts must be used within <Reasoning>');
  return ctx;
}

/** Format a millisecond duration as a short "Xs" / "Xm Ys" label. */
function formatElapsed(ms: number) {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

/** Props for {@link Reasoning}. */
export interface ReasoningProps extends React.ComponentProps<'div'> {
  /** Whether reasoning tokens are still streaming. Drives auto-expand/collapse. */
  streaming?: boolean;
  /** Controlled open state (optional). */
  open?: boolean;
  /** Reports open changes. */
  onOpenChange?: (open: boolean) => void;
  /** Provide a fixed elapsed time (ms) instead of the internal timer. */
  durationMs?: number;
}

/**
 * Collapsible reasoning block.
 *
 * @example
 * ```tsx
 * <Reasoning streaming={isThinking}>
 *   <ReasoningTrigger />
 *   <ReasoningContent>{thinkTokens}</ReasoningContent>
 * </Reasoning>
 * ```
 */
export function Reasoning({
  streaming = false,
  open: openProp,
  onOpenChange,
  durationMs,
  className,
  children,
  ...props
}: ReasoningProps) {
  const [internalOpen, setInternalOpen] = React.useState(streaming);
  const [elapsedMs, setElapsedMs] = React.useState(durationMs ?? 0);
  const startRef = React.useRef<number | null>(null);

  const open = openProp ?? internalOpen;
  const setOpen = (next: boolean) => {
    onOpenChange?.(next);
    if (openProp == null) setInternalOpen(next);
  };

  // Auto-expand while streaming; auto-collapse once it stops (unless controlled).
  React.useEffect(() => {
    if (openProp != null) return;
    if (streaming) setInternalOpen(true);
    else setInternalOpen(false);
  }, [streaming, openProp]);

  // Elapsed timer while streaming.
  React.useEffect(() => {
    if (durationMs != null) {
      setElapsedMs(durationMs);
      return;
    }
    if (!streaming) return;
    startRef.current = performance.now();
    const id = window.setInterval(() => {
      if (startRef.current != null) {
        setElapsedMs(performance.now() - startRef.current);
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [streaming, durationMs]);

  const ctx: ReasoningContextValue = { open, setOpen, streaming, elapsedMs };

  return (
    <ReasoningContext.Provider value={ctx}>
      <Collapsible
        open={open}
        onOpenChange={setOpen}
        data-slot="reasoning"
        data-streaming={streaming || undefined}
        className={cn(
          'rounded-lg border border-border bg-muted/30 text-sm',
          className,
        )}
        {...props}
      >
        {children}
      </Collapsible>
    </ReasoningContext.Provider>
  );
}

/** Props for {@link ReasoningTrigger}. */
export interface ReasoningTriggerProps extends React.ComponentProps<'button'> {
  /** Label override. Defaults to "Thinking…" while streaming, else "Reasoning". */
  label?: string;
}

/** The collapsible header showing a thinking indicator + elapsed time. */
export function ReasoningTrigger({
  label,
  className,
  ...props
}: ReasoningTriggerProps) {
  const { open, streaming, elapsedMs } = useReasoning();
  return (
    <CollapsibleTrigger
      data-slot="reasoning-trigger"
      className={cn(
        'flex w-full items-center gap-2 px-3 py-2 text-left text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
        className,
      )}
      {...props}
    >
      <Brain className={cn('size-4 shrink-0', streaming && 'animate-pulse')} />
      <span className="min-w-0 truncate font-medium">
        {label ?? (streaming ? 'Thinking…' : 'Reasoning')}
      </span>
      {elapsedMs > 0 && (
        <span className="shrink-0 text-xs tabular-nums">{formatElapsed(elapsedMs)}</span>
      )}
      <ChevronDown
        className={cn(
          'ml-auto size-4 transition-transform',
          open && 'rotate-180',
        )}
      />
    </CollapsibleTrigger>
  );
}

/** Props for {@link ReasoningContent}. */
export type ReasoningContentProps = React.ComponentProps<'div'>;

/** The reasoning token body. */
export function ReasoningContent({
  className,
  children,
  ...props
}: ReasoningContentProps) {
  return (
    <CollapsibleContent data-slot="reasoning-content">
      <div
        className={cn(
          'whitespace-pre-wrap break-words px-3 pb-3 text-muted-foreground [overflow-wrap:anywhere]',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </CollapsibleContent>
  );
}

/** Props for {@link ThinkingBar}. */
export interface ThinkingBarProps extends React.ComponentProps<'div'> {
  /** Status text. @default "Thinking" */
  label?: string;
  /** Elapsed milliseconds to display. */
  elapsedMs?: number;
  /** Show the inline expand control. */
  onExpand?: () => void;
  /** Show the inline stop control. */
  onStop?: () => void;
}

/**
 * Compact one-line "thinking now" status strip with inline stop/expand —
 * the most condensed tier of the thinking taxonomy.
 */
export function ThinkingBar({
  label = 'Thinking',
  elapsedMs,
  onExpand,
  onStop,
  className,
  ...props
}: ThinkingBarProps) {
  return (
    <div
      data-slot="thinking-bar"
      role="status"
      aria-live="polite"
      className={cn(
        'inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground',
        className,
      )}
      {...props}
    >
      <Brain className="size-3.5 shrink-0 animate-pulse" />
      <span className="min-w-0 truncate font-medium">{label}</span>
      {elapsedMs != null && elapsedMs > 0 && (
        <span className="tabular-nums">{formatElapsed(elapsedMs)}</span>
      )}
      {onExpand && (
        <button
          type="button"
          onClick={onExpand}
          className="shrink-0 rounded-sm underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          expand
        </button>
      )}
      {onStop && (
        <button
          type="button"
          onClick={onStop}
          aria-label="Stop thinking"
          className="inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-destructive/30 text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-destructive/30"
        >
          <Square className="size-2.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export default Reasoning;
