"use client";

import * as React from "react";
import { ArrowUp, Mic, Plus, Square } from "lucide-react";
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
 * @file prompt-input.tsx
 * @description The chat composer. `PromptInput` is a form-based, auto-resizing
 * textarea that manages its own input state by default (Enter submits,
 * Shift+Enter inserts a newline) and swaps its submit control for a stop control
 * while streaming. It exposes `onSubmit(text, attachments?)` and optional
 * controlled `value`/`onValueChange`. Composer affordances: a voice/dictation
 * mic toggle (wire to local Whisper STT) and a slash-command / "+" picker.
 *
 * `PromptInputProvider` exposes the composer state (text + attachments) for
 * external control (clear-after-send, programmatic attach). Presentational —
 * the app owns send/stream state (`useChat`).
 */

/** An attachment carried by the composer (matches `@localmode/react` image model). */
export interface PromptAttachment {
  /** Stable id for list keys / removal. */
  id: string;
  /** Base64 data (no `data:` prefix). */
  data: string;
  /** MIME type. */
  mimeType: string;
  /** Original filename. */
  name?: string;
  /** Size in bytes. */
  size?: number;
}

/** Shared composer state surfaced by {@link PromptInputProvider}. */
export interface PromptInputContextValue {
  text: string;
  setText: (text: string) => void;
  attachments: PromptAttachment[];
  setAttachments: React.Dispatch<React.SetStateAction<PromptAttachment[]>>;
  addAttachments: (items: PromptAttachment[]) => void;
  removeAttachment: (id: string) => void;
  clear: () => void;
}

const PromptInputContext =
  React.createContext<PromptInputContextValue | null>(null);

/** Access composer state. Returns `null` when used outside a provider. */
export function usePromptInputContext() {
  return React.useContext(PromptInputContext);
}

/** Props for {@link PromptInputProvider}. */
export interface PromptInputProviderProps {
  children: React.ReactNode;
}

/**
 * Optional provider that hoists composer state (text + attachments) so external
 * components (e.g. an attachments dropzone, a clear-after-send effect) can read
 * and mutate it.
 */
export function PromptInputProvider({ children }: PromptInputProviderProps) {
  const [text, setText] = React.useState('');
  const [attachments, setAttachments] = React.useState<PromptAttachment[]>([]);

  const value = React.useMemo<PromptInputContextValue>(
    () => ({
      text,
      setText,
      attachments,
      setAttachments,
      addAttachments: (items) => setAttachments((prev) => [...prev, ...items]),
      removeAttachment: (id) =>
        setAttachments((prev) => prev.filter((a) => a.id !== id)),
      clear: () => {
        setText('');
        setAttachments([]);
      },
    }),
    [text, attachments],
  );

  return (
    <PromptInputContext.Provider value={value}>
      {children}
    </PromptInputContext.Provider>
  );
}

/** Internal form-state context shared by the sub-parts. */
interface PromptFormState {
  text: string;
  setText: (t: string) => void;
  streaming: boolean;
  attachments: PromptAttachment[];
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  submit: () => void;
  onStop?: () => void;
}
const PromptFormContext = React.createContext<PromptFormState | null>(null);
function usePromptForm() {
  const ctx = React.useContext(PromptFormContext);
  if (!ctx)
    throw new Error('PromptInput sub-parts must be used within <PromptInput>');
  return ctx;
}

/** Props for {@link PromptInput}. */
export interface PromptInputProps
  extends Omit<React.ComponentProps<'form'>, 'onSubmit'> {
  /** Fired with the trimmed text (and attachments) on submit. */
  onSubmit: (text: string, attachments: PromptAttachment[]) => void;
  /** Controlled value (optional). */
  value?: string;
  /** Reports edits in controlled mode. */
  onValueChange?: (value: string) => void;
  /** When true, the submit control becomes a stop control. @default false */
  streaming?: boolean;
  /** Fired when the user activates the stop control. */
  onStop?: () => void;
  /** Attachments to include in the next submit (from `PromptInputAttachments`). */
  attachments?: PromptAttachment[];
  /** Disable the whole composer. */
  disabled?: boolean;
}

/**
 * The composer form. Wraps `PromptInputTextarea`, `PromptInputTools`, and
 * `PromptInputSubmit`.
 *
 * @example
 * ```tsx
 * <PromptInput streaming={isStreaming} onStop={cancel} onSubmit={(t) => send(t)}>
 *   <PromptInputTextarea placeholder="Ask anything…" />
 *   <PromptInputTools>
 *     <PromptInputSubmit />
 *   </PromptInputTools>
 * </PromptInput>
 * ```
 */
export function PromptInput({
  onSubmit,
  value,
  onValueChange,
  streaming = false,
  onStop,
  attachments = [],
  disabled,
  className,
  children,
  ...props
}: PromptInputProps) {
  const provider = usePromptInputContext();
  const [internal, setInternal] = React.useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  // Resolve text from controlled prop → provider → internal state.
  const text = value ?? provider?.text ?? internal;
  const setText = React.useCallback(
    (t: string) => {
      onValueChange?.(t);
      provider?.setText(t);
      if (value == null && !provider) setInternal(t);
    },
    [onValueChange, provider, value],
  );

  const resolvedAttachments = provider?.attachments ?? attachments;

  const submit = React.useCallback(() => {
    const trimmed = text.trim();
    if ((!trimmed && resolvedAttachments.length === 0) || streaming || disabled)
      return;
    onSubmit(trimmed, resolvedAttachments);
    setText('');
    provider?.setAttachments([]);
  }, [text, resolvedAttachments, streaming, disabled, onSubmit, setText, provider]);

  const formState = React.useMemo<PromptFormState>(
    () => ({
      text,
      setText,
      streaming,
      attachments: resolvedAttachments,
      textareaRef,
      submit,
      onStop,
    }),
    [text, setText, streaming, resolvedAttachments, submit, onStop],
  );

  return (
    <PromptFormContext.Provider value={formState}>
      <form
        data-slot="prompt-input"
        data-streaming={streaming || undefined}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className={cn(
          'flex flex-col gap-1 rounded-xl border border-border bg-card p-2 shadow-sm focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/20',
          disabled && 'pointer-events-none opacity-60',
          className,
        )}
        {...props}
      >
        {children}
      </form>
    </PromptFormContext.Provider>
  );
}

/** Props for {@link PromptInputTextarea}. */
export interface PromptInputTextareaProps
  extends Omit<React.ComponentProps<'textarea'>, 'value' | 'onChange'> {
  /** Max pixel height before the textarea scrolls. @default 200 */
  maxHeight?: number;
}

/** Auto-resizing textarea. Enter submits; Shift+Enter inserts a newline. */
export function PromptInputTextarea({
  maxHeight = 200,
  className,
  onKeyDown,
  placeholder = 'Send a message…',
  'aria-label': ariaLabel,
  ...props
}: PromptInputTextareaProps) {
  const { text, setText, textareaRef, submit, streaming } = usePromptForm();

  // Auto-resize to content up to maxHeight.
  React.useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [text, maxHeight, textareaRef]);

  return (
    <textarea
      ref={textareaRef}
      data-slot="prompt-input-textarea"
      value={text}
      placeholder={placeholder}
      aria-label={ariaLabel ?? 'Message'}
      rows={1}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.defaultPrevented) return;
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          if (!streaming) submit();
        }
      }}
      className={cn(
        'max-h-[50vh] w-full resize-none bg-transparent px-2 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

/** Props for {@link PromptInputTools}. */
export type PromptInputToolsProps = React.ComponentProps<'div'>;

/** Footer row for composer controls (tools on the left, submit on the right). */
export function PromptInputTools({
  className,
  ...props
}: PromptInputToolsProps) {
  return (
    <div
      data-slot="prompt-input-tools"
      className={cn('flex flex-wrap items-center justify-between gap-1', className)}
      {...props}
    />
  );
}

/** Props for {@link PromptInputSubmit}. */
export interface PromptInputSubmitProps
  extends React.ComponentProps<typeof Button> {
  /** Override the default submit/stop icons. */
  submitIcon?: React.ReactNode;
  stopIcon?: React.ReactNode;
}

/** Submit control that becomes a stop control while streaming. */
export function PromptInputSubmit({
  className,
  submitIcon,
  stopIcon,
  ...props
}: PromptInputSubmitProps) {
  const { streaming, onStop, text, attachments } = usePromptForm();
  const empty = text.trim().length === 0 && attachments.length === 0;

  if (streaming) {
    return (
      <Button
        type="button"
        size="icon"
        onClick={onStop}
        aria-label="Stop generating"
        data-slot="prompt-input-stop"
        className={cn('rounded-full', className)}
        {...props}
      >
        {stopIcon ?? <Square className="size-4 fill-current" />}
      </Button>
    );
  }

  return (
    <Button
      type="submit"
      size="icon"
      disabled={empty}
      aria-label="Send message"
      data-slot="prompt-input-submit"
      className={cn(
        'rounded-full transition-colors',
        empty &&
          'bg-muted text-muted-foreground disabled:opacity-100 hover:bg-muted',
        className,
      )}
      {...props}
    >
      {submitIcon ?? <ArrowUp className="size-4" />}
    </Button>
  );
}

/** Props for {@link PromptInputMic}. */
export interface PromptInputMicProps
  extends Omit<React.ComponentProps<typeof Button>, 'onToggle'> {
  /** Whether dictation is active (drives the recording style). */
  recording?: boolean;
  /** Toggle dictation — wire to local Whisper STT (`useVoiceRecorder`/`transcribe`). */
  onToggle?: (recording: boolean) => void;
}

/**
 * Voice/dictation mic toggle. Presentational: wire `onToggle` to start/stop a
 * local Whisper recording and write the transcript back via the controlled
 * `value`/provider. Real microphone capture is provided by the app.
 */
export function PromptInputMic({
  recording = false,
  onToggle,
  className,
  ...props
}: PromptInputMicProps) {
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      aria-pressed={recording}
      aria-label={recording ? 'Stop dictation' : 'Start dictation'}
      onClick={() => onToggle?.(!recording)}
      data-slot="prompt-input-mic"
      data-recording={recording || undefined}
      className={cn(
        'rounded-full text-muted-foreground',
        recording && 'animate-pulse text-destructive',
        className,
      )}
      {...props}
    >
      <Mic className="size-4" />
    </Button>
  );
}

/** Props for {@link PromptInputAddButton}. */
export type PromptInputAddButtonProps = React.ComponentProps<typeof Button>;

/**
 * The "+" trigger for a slash-command / attachment context menu. Compose it
 * with a Popover or DropdownMenu of tool/attachment entries.
 */
export function PromptInputAddButton({
  className,
  children,
  ...props
}: PromptInputAddButtonProps) {
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      aria-label="Add tool or attachment"
      data-slot="prompt-input-add"
      className={cn('rounded-full text-muted-foreground', className)}
      {...props}
    >
      {children ?? <Plus className="size-4" />}
    </Button>
  );
}

export default PromptInput;
