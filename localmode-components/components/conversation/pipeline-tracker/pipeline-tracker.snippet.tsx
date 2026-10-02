"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
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
 * @file pipeline-tracker.tsx
 * @description Progress surfaces for multi-step local workflows. `MultiStepPipelineTracker`
 * is a horizontal numbered-step indicator (active / completed / pending) with an
 * optional stage+percentage variant for ingest pipelines; it maps directly to
 * `usePipeline`'s `onProgress` (`{ currentStep, completed, total }`). `StepsPlan`
 * is a vertical connector-bar variant with per-step title + expandable detail and
 * an editable plan outline. `InferenceQueueSurface` visualizes pending tasks
 * grouped by priority (interactive / background) over `useInferenceQueue`.
 */

/** Props for {@link MultiStepPipelineTracker}. */
export interface MultiStepPipelineTrackerProps
  extends React.ComponentProps<'div'> {
  /** Ordered step labels. */
  steps: string[];
  /** Number of completed steps (e.g. `progress.completed`). */
  completed: number;
  /** The currently active step label (e.g. `progress.currentStep`). */
  currentStep?: string;
}

/**
 * Horizontal numbered-step progress indicator.
 *
 * @example
 * ```tsx
 * const { progress } = usePipeline(steps);
 * <MultiStepPipelineTracker
 *   steps={['Chunk', 'Embed', 'Index']}
 *   completed={progress?.completed ?? 0}
 *   currentStep={progress?.currentStep}
 * />
 * ```
 */
export function MultiStepPipelineTracker({
  steps,
  completed,
  currentStep,
  className,
  ...props
}: MultiStepPipelineTrackerProps) {
  return (
    <div
      data-slot="pipeline-tracker"
      className={cn('flex w-full min-w-0 items-center overflow-x-auto pb-1', className)}
      {...props}
    >
      {steps.map((label, i) => {
        const isDone = i < completed;
        const isActive = currentStep ? label === currentStep : i === completed;
        const state = isDone ? 'completed' : isActive ? 'active' : 'pending';
        return (
          <React.Fragment key={label}>
            <div
              data-state={state}
              className="flex min-w-16 shrink-0 flex-col items-center gap-1 text-center"
            >
              <span
                className={cn(
                  'grid size-7 place-items-center rounded-full border text-xs font-medium tabular-nums',
                  state === 'completed' &&
                    'border-primary bg-primary text-primary-foreground',
                  state === 'active' &&
                    'border-primary bg-background text-primary',
                  state === 'pending' &&
                    'border-border bg-background text-muted-foreground',
                )}
              >
                {isDone ? <Check className="size-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  'max-w-20 truncate text-xs',
                  state === 'pending'
                    ? 'text-muted-foreground'
                    : 'text-foreground',
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span
                className={cn(
                  'mx-1 h-px flex-1 self-start',
                  i < completed ? 'bg-primary' : 'bg-border',
                )}
                style={{ marginTop: 14 }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/** Props for {@link StagePipelineTracker}. */
export interface StagePipelineTrackerProps extends React.ComponentProps<'div'> {
  /** Single-stage label. */
  stage: string;
  /** Percentage in [0, 100]. */
  percent: number;
}

/** Single-stage label + 0–100 bar variant for ingest pipelines. */
export function StagePipelineTracker({
  stage,
  percent,
  className,
  ...props
}: StagePipelineTrackerProps) {
  return (
    <div
      data-slot="stage-pipeline-tracker"
      className={cn('w-full space-y-1.5', className)}
      {...props}
    >
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="min-w-0 truncate font-medium text-foreground">{stage}</span>
        <span className="shrink-0 tabular-nums text-muted-foreground">
          {Math.round(percent)}%
        </span>
      </div>
      <Progress value={percent} />
    </div>
  );
}

/** A plan/step entry for {@link StepsPlan}. */
export interface PlanStep {
  /** Stable id. */
  id: string;
  /** Step title. */
  title: string;
  /** Optional expandable detail. */
  detail?: string;
  /** Step state. @default "pending" */
  status?: 'pending' | 'active' | 'completed';
}

/** Props for {@link StepsPlan}. */
export interface StepsPlanProps extends React.ComponentProps<'div'> {
  /** The plan steps. */
  steps: PlanStep[];
}

/** Vertical connector-bar plan outline with per-step expandable detail. */
export function StepsPlan({ steps, className, ...props }: StepsPlanProps) {
  return (
    <ol
      data-slot="steps-plan"
      className={cn('relative space-y-3 pl-7', className)}
      {...(props as React.ComponentProps<'ol'>)}
    >
      {/* Vertical connector — centered under the node dots (dot center sits at
          9px from the list's left edge for every status). */}
      <span
        aria-hidden="true"
        className="absolute left-[8.5px] top-1 bottom-1 w-px bg-border"
      />
      {steps.map((step) => {
        const status = step.status ?? 'pending';
        return (
          <li key={step.id} className="relative" data-status={status}>
            <span
              className={cn(
                'absolute -left-[26px] top-1 grid size-3.5 place-items-center rounded-full border bg-background',
                status === 'completed' && 'border-primary bg-primary',
                status === 'active' && 'border-primary',
                status === 'pending' && 'border-border',
              )}
            >
              {status === 'completed' && (
                <Check className="size-2.5 text-primary-foreground" />
              )}
            </span>
            {step.detail ? (
              <Collapsible>
                <CollapsibleTrigger className="flex max-w-full items-center gap-1 rounded-sm text-left text-sm font-medium focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                  <span className="min-w-0 truncate">{step.title}</span>
                  <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <p className="mt-1 break-words text-xs text-muted-foreground [overflow-wrap:anywhere]">
                    {step.detail}
                  </p>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <span className="block min-w-0 truncate text-sm font-medium">{step.title}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** A queued inference task. */
export interface QueuedTask {
  /** Stable id. */
  id: string;
  /** Human label. */
  label: string;
  /** Priority group. */
  priority: 'interactive' | 'background';
}

/** Props for {@link InferenceQueueSurface}. */
export interface InferenceQueueSurfaceProps extends React.ComponentProps<'div'> {
  /** Pending tasks (e.g. from `useInferenceQueue`). */
  tasks: QueuedTask[];
}

/** Collapsible queue view grouped by priority. */
export function InferenceQueueSurface({
  tasks,
  className,
  ...props
}: InferenceQueueSurfaceProps) {
  const groups: Record<QueuedTask['priority'], QueuedTask[]> = {
    interactive: tasks.filter((t) => t.priority === 'interactive'),
    background: tasks.filter((t) => t.priority === 'background'),
  };

  return (
    <div
      data-slot="inference-queue-surface"
      className={cn('space-y-2', className)}
      {...props}
    >
      {(['interactive', 'background'] as const).map((priority) => (
        <Collapsible key={priority} defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
            <span className="min-w-0 truncate font-medium capitalize">{priority}</span>
            <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-xs tabular-nums text-muted-foreground">
              {groups[priority].length}
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="mt-1 space-y-1 pl-3">
              {groups[priority].map((task) => (
                <li
                  key={task.id}
                  className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground"
                >
                  <span className="size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                  <span className="min-w-0 break-words [overflow-wrap:anywhere]">{task.label}</span>
                </li>
              ))}
              {groups[priority].length === 0 && (
                <li className="text-xs text-muted-foreground">No tasks</li>
              )}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}

export default MultiStepPipelineTracker;
