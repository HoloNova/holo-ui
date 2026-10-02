"use client";

import * as React from "react";
import { ChevronDown, FileText, Globe } from "lucide-react";
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
 * @file sources.tsx
 * @description Retrieval citations from LOCAL RAG results (e.g.
 * `useSemanticSearch`). `Sources` is a collapsible container; each `Source`
 * renders a favicon/title/excerpt chip and a 0–1 relevance score. An optional
 * tabbed layout switches between Web/Images/News-style result variants. All
 * favicons/images come from already-stored local metadata — no remote unfurl.
 */

/** A retrieved source/citation (from local metadata only). */
export interface SourceItem {
  /** Stable id. */
  id: string;
  /** Display title. */
  title: string;
  /** Short excerpt / snippet. */
  excerpt?: string;
  /** Relevance score in [0, 1]. */
  score?: number;
  /** Optional link (may be a local/document URL). */
  url?: string;
  /** Optional favicon/image URL (from stored metadata; no network unfurl). */
  faviconUrl?: string;
  /**
   * Optional explicit leading icon, overriding the auto-picked one (favicon for
   * web sources, a document icon for local/RAG sources).
   */
  icon?: React.ReactNode;
  /** Result type for the tabbed layout. @default "web" */
  type?: 'web' | 'image' | 'news';
}

/** Props for {@link Sources}. */
export interface SourcesProps extends React.ComponentProps<'div'> {
  /** Default-collapsed. @default false */
  defaultOpen?: boolean;
}

const SourcesOpenContext = React.createContext(false);

/** Collapsible sources container. */
export function Sources({
  defaultOpen = false,
  className,
  children,
  ...props
}: SourcesProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <SourcesOpenContext.Provider value={open}>
      <Collapsible
        open={open}
        onOpenChange={setOpen}
        data-slot="sources"
        className={cn('rounded-lg border border-border', className)}
        {...props}
      >
        {children}
      </Collapsible>
    </SourcesOpenContext.Provider>
  );
}

/** Props for {@link SourcesTrigger}. */
export interface SourcesTriggerProps extends React.ComponentProps<'button'> {
  /** Number of sources, shown in the label. */
  count: number;
}

/** Collapsible trigger labeled with the source count. */
export function SourcesTrigger({
  count,
  className,
  children,
  ...props
}: SourcesTriggerProps) {
  const open = React.useContext(SourcesOpenContext);
  return (
    <CollapsibleTrigger
      data-slot="sources-trigger"
      className={cn(
        'flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
        className,
      )}
      {...props}
    >
      <FileText className="size-4 shrink-0" />
      <span className="min-w-0 truncate font-medium">
        {children ?? `${count} ${count === 1 ? 'source' : 'sources'}`}
      </span>
      <ChevronDown
        className={cn('ml-auto size-4 transition-transform', open && 'rotate-180')}
      />
    </CollapsibleTrigger>
  );
}

/** Props for {@link SourcesContent}. */
export interface SourcesContentProps extends React.ComponentProps<'div'> {
  /** When set, renders a Web/Images/News tabbed layout over these sources. */
  tabbed?: boolean;
  /** Sources, used to populate tabs when `tabbed`. */
  sources?: SourceItem[];
}

/** The expandable source list (or tabbed layout). */
export function SourcesContent({
  tabbed = false,
  sources = [],
  className,
  children,
  ...props
}: SourcesContentProps) {
  if (tabbed) {
    const groups = {
      web: sources.filter((s) => (s.type ?? 'web') === 'web'),
      image: sources.filter((s) => s.type === 'image'),
      news: sources.filter((s) => s.type === 'news'),
    };
    return (
      <CollapsibleContent data-slot="sources-content">
        <div className={cn('p-3', className)} {...props}>
          <Tabs defaultValue="web">
            <TabsList>
              <TabsTrigger value="web">Web ({groups.web.length})</TabsTrigger>
              <TabsTrigger value="image">Images ({groups.image.length})</TabsTrigger>
              <TabsTrigger value="news">News ({groups.news.length})</TabsTrigger>
            </TabsList>
            {(['web', 'image', 'news'] as const).map((k) => (
              <TabsContent key={k} value={k} className="space-y-2">
                {groups[k].map((s) => (
                  <Source key={s.id} source={s} />
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </CollapsibleContent>
    );
  }

  return (
    <CollapsibleContent data-slot="sources-content">
      <div className={cn('space-y-2 p-3', className)} {...props}>
        {children}
      </div>
    </CollapsibleContent>
  );
}

/** Props for {@link Source}. */
export interface SourceProps extends React.ComponentProps<'a'> {
  /** The source to render. */
  source: SourceItem;
}

/** A single favicon/title/excerpt/score chip. */
export function Source({ source, className, ...props }: SourceProps) {
  const { title, excerpt, score, url, faviconUrl, icon } = source;
  return (
    <a
      href={url ?? '#'}
      target={url ? '_blank' : undefined}
      rel="noreferrer noopener"
      data-slot="source"
      className={cn(
        'flex items-start gap-2 rounded-md border border-border bg-card p-2 text-left text-card-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
        className,
      )}
      {...props}
    >
      {icon != null ? (
        <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center text-muted-foreground">
          {icon}
        </span>
      ) : faviconUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={faviconUrl} alt="" className="mt-0.5 size-4 shrink-0 rounded-sm" />
      ) : url ? (
        <Globe className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      ) : (
        <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      )}
      <div className="min-w-0 flex-1">
        <div className="mt-0.5 flex items-center gap-2">
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{title}</span>
          {score != null && (
            <span className="ml-auto shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs tabular-nums text-muted-foreground">
              {(score * 100).toFixed(0)}%
            </span>
          )}
        </div>
        {excerpt && (
          <p className="mt-0.5 line-clamp-2 break-words text-xs text-muted-foreground [overflow-wrap:anywhere]">
            {excerpt}
          </p>
        )}
      </div>
    </a>
  );
}

export default Sources;
