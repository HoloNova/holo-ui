"use client";

import * as React from "react";
import { ArrowDown } from "lucide-react";
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
 * @file conversation.tsx
 * @description The scrollable message-display surface for a chat. `Conversation`
 * is a scroll container with first-class scroll-anchoring: it auto-pins to the
 * newest content while tokens stream, releases the pin when the user scrolls up,
 * surfaces a scroll-to-bottom control while released, and re-pins when the user
 * returns to the bottom. It is presentational — it renders the children/messages
 * passed in and owns no message state (that lives in `useChat`).
 *
 * Driven by `@localmode/react`'s `useChat().messages`.
 */

/** Context shared between `Conversation` and its scroll-button/anchor. */
interface ConversationContextValue {
  /** Ref to the scroll viewport. */
  viewportRef: React.RefObject<HTMLDivElement | null>;
  /** Whether the view is currently pinned to the bottom. */
  isPinned: boolean;
  /** Scroll to (and re-pin) the bottom. */
  scrollToBottom: (behavior?: ScrollBehavior) => void;
}

const ConversationContext =
  React.createContext<ConversationContextValue | null>(null);

/** Access the conversation scroll state (within a `Conversation`). */
export function useConversation() {
  const ctx = React.useContext(ConversationContext);
  if (!ctx) {
    throw new Error('useConversation must be used within <Conversation>');
  }
  return ctx;
}

/** Props for {@link Conversation}. */
export interface ConversationProps extends React.ComponentProps<'div'> {
  /**
   * When true (typically `useChat().isStreaming`), the view auto-pins to the
   * bottom as content grows — unless the user has scrolled up.
   * @default false
   */
  streaming?: boolean;
}

/**
 * Scrollable conversation container with auto-stick-to-bottom anchoring.
 *
 * @example
 * ```tsx
 * <Conversation streaming={isStreaming}>
 *   <ConversationContent>
 *     {messages.length === 0 && <ConversationEmptyState />}
 *     {messages.map((m) => <Message key={m.id} {...m} />)}
 *     <ConversationScrollAnchor />
 *   </ConversationContent>
 *   <ConversationScrollButton />
 * </Conversation>
 * ```
 */
export function Conversation({
  streaming = false,
  className,
  children,
  ...props
}: ConversationProps) {
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const [isPinned, setIsPinned] = React.useState(true);

  const scrollToBottom = React.useCallback((behavior: ScrollBehavior = 'smooth') => {
    const el = viewportRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
    setIsPinned(true);
  }, []);

  // Track whether the user is at the bottom; release the pin on scroll-up.
  const handleScroll = React.useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsPinned(distance < 24);
  }, []);

  // Auto-pin while streaming/growing, but only if the user hasn't scrolled up.
  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    if (!isPinned) return;
    el.scrollTop = el.scrollHeight;
  });

  const ctx = React.useMemo<ConversationContextValue>(
    () => ({ viewportRef, isPinned, scrollToBottom }),
    [isPinned, scrollToBottom],
  );

  return (
    <ConversationContext.Provider value={ctx}>
      <div
        className={cn('relative flex min-h-0 flex-1 flex-col', className)}
        data-streaming={streaming || undefined}
        {...props}
      >
        <div
          ref={viewportRef}
          onScroll={handleScroll}
          data-pinned={isPinned || undefined}
          className="flex-1 overflow-y-auto overscroll-contain"
          role="log"
          aria-live="polite"
        >
          {children}
        </div>
      </div>
    </ConversationContext.Provider>
  );
}

/** Props for {@link ConversationContent}. */
export type ConversationContentProps = React.ComponentProps<'div'>;

/** Inner padded column holding the message list. */
export function ConversationContent({
  className,
  ...props
}: ConversationContentProps) {
  return (
    <div
      data-slot="conversation-content"
      className={cn('mx-auto flex w-full max-w-3xl flex-col gap-4 p-4', className)}
      {...props}
    />
  );
}

/**
 * A zero-height anchor element placed at the end of the message list. Marks the
 * bottom of the conversation. The actual stick-to-bottom scrolling is done by
 * `Conversation` itself via the viewport's own `scrollTop` (container-scoped) —
 * this anchor must NOT call `scrollIntoView`, which would scroll the whole page
 * (the nearest scrollable ancestor *and* the window) and jump the viewport.
 */
export function ConversationScrollAnchor({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      aria-hidden="true"
      data-slot="conversation-scroll-anchor"
      className={cn('h-px w-full shrink-0', className)}
      {...props}
    />
  );
}

/** Props for {@link ConversationScrollButton}. */
export type ConversationScrollButtonProps = React.ComponentProps<typeof Button>;

/**
 * Floating scroll-to-bottom button. Appears only when the pin is released
 * (the user has scrolled up).
 */
export function ConversationScrollButton({
  className,
  ...props
}: ConversationScrollButtonProps) {
  const { isPinned, scrollToBottom } = useConversation();
  if (isPinned) return null;
  return (
    <Button
      type="button"
      size="icon"
      variant="secondary"
      onClick={() => scrollToBottom()}
      aria-label="Scroll to latest"
      className={cn(
        'absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full shadow-md',
        className,
      )}
      {...props}
    >
      <ArrowDown className="size-4" />
    </Button>
  );
}

/** Props for {@link ConversationEmptyState}. */
export interface ConversationEmptyStateProps
  extends React.ComponentProps<'div'> {
  /** Optional heading text. */
  title?: string;
  /** Optional supporting description. */
  description?: string;
  /** Optional leading icon node. */
  icon?: React.ReactNode;
}

/**
 * Empty-state slot rendered when there are no messages. Pass children to fully
 * customize, or use the `title`/`description`/`icon` props for the default.
 */
export function ConversationEmptyState({
  title = 'Start the conversation',
  description = 'Send a message to begin. Everything runs locally in your browser.',
  icon,
  className,
  children,
  ...props
}: ConversationEmptyStateProps) {
  return (
    <div
      data-slot="conversation-empty-state"
      className={cn(
        'flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center',
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          {icon && <div className="mb-2 text-muted-foreground">{icon}</div>}
          <p className="text-base font-medium text-foreground">{title}</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {description}
          </p>
        </>
      )}
    </div>
  );
}

export default Conversation;
