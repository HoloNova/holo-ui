"use client";

import * as React from "react";
import { File as FileIcon, Film, Music, Paperclip, X } from "lucide-react";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Inlined cn utility ---

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


// --- Inlined browser-utils ---
/**
 * Generic, dependency-free browser utilities shared by LocalMode UI
 * components. These are plain DOM/File/FileReader helpers with no AI and no
 * `@localmode/*` dependency, so the components that use them install and
 * compile in any React app.
 *
 * Ported from the equivalent helpers in `@localmode/core` (`formatBytes`) and
 * `@localmode/react` (`useObjectUrl`, `validateFile`, `readFileAsDataUrl`,
 * `downloadBlob`); copy-owned here so the registry stays portable.
 */


/**
 * Format a byte count into a human-readable string (e.g. `1.5 MB`).
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`;
}

/** A recoverable file-validation failure. */
export interface FileValidationError {
  /** Human-readable message for display. */
  message: string;
  /** Always `true` — the user can pick a different file and retry. */
  recoverable?: boolean;
}

/** Options for {@link validateFile}. */
export interface ValidateFileOptions {
  /** The file to validate. */
  file: File;
  /** Accepted MIME types (e.g. `['image/png', 'image/jpeg']`). */
  accept?: string[];
  /** Maximum file size in bytes. */
  maxSize?: number;
}

/**
 * Validate a file against type and size constraints. Returns a
 * {@link FileValidationError} if invalid, or `null` if valid.
 */
export function validateFile(options: ValidateFileOptions): FileValidationError | null {
  const { file, accept, maxSize } = options;

  if (accept && !accept.includes(file.type)) {
    return {
      message: `Unsupported file type "${file.type}". Accepted types: ${accept.join(', ')}`,
      recoverable: true,
    };
  }

  if (maxSize !== undefined && file.size > maxSize) {
    const maxMB = (maxSize / 1_000_000).toFixed(0);
    return {
      message: `File too large (${(file.size / 1_000_000).toFixed(1)}MB). Maximum size: ${maxMB}MB`,
      recoverable: true,
    };
  }

  return null;
}

/**
 * Read a browser `File` as a base64 data URL string (e.g.
 * `data:image/png;base64,...`). Rejects with the `FileReader` error on failure.
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Trigger a file download from in-memory content. Creates a temporary object
 * URL, clicks a synthetic anchor, and revokes the URL.
 *
 * @param content - String or `Blob` to download.
 * @param filename - The download filename.
 * @param mimeType - MIME type when `content` is a string (default `text/plain`).
 */
export function downloadBlob(
  content: string | Blob,
  filename: string,
  mimeType = 'text/plain'
): void {
  const blob =
    content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/**
 * Derive a stable object URL from a `Blob`, revoking it automatically when the
 * blob changes or the component unmounts. Returns `null` for a null/undefined
 * blob, during SSR, and on the first render after a change (the URL is created
 * in an effect so server and client markup match).
 */
export function useObjectUrl(blob: Blob | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const supported = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function';
    const objectUrl = blob && supported ? URL.createObjectURL(blob) : null;

    // The object URL is an external resource created here rather than during
    // render, so SSR and the first client render both emit null. Reflecting it
    // back into React state is the only way to render it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrl(objectUrl);

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [blob]);

  return url;
}

/* Image / canvas helpers (transparent-background compositing, result → data URL). */

/** A plain RGBA / single-channel byte buffer — DOM-free so the kernel node-tests. */
type PixelBuffer = Uint8ClampedArray | Uint8Array;

/** Load an image element from a data URL / URL. */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

/** Resolve an image's natural width/height from a data URL / URL. */
export async function getImageDimensions(
  src: string
): Promise<{ width: number; height: number }> {
  const img = await loadImage(src);
  return { width: img.naturalWidth, height: img.naturalHeight };
}

/**
 * Nearest-neighbour mask → alpha compositing on plain typed arrays (no DOM):
 * writes each pixel's alpha from the nearest mask cell, RGB untouched. The mask
 * stride (RGBA vs single-channel) is inferred from its length, so `ImageData.data`
 * and flat masks map identically. Mutates and returns `pixels`.
 */
export function compositeMaskAlpha(
  pixels: PixelBuffer,
  imgW: number,
  imgH: number,
  mask: PixelBuffer,
  maskW: number,
  maskH: number
): PixelBuffer {
  const stride = mask.length === maskW * maskH * 4 ? 4 : 1;
  for (let y = 0; y < imgH; y++) {
    for (let x = 0; x < imgW; x++) {
      const mx = Math.floor((x / imgW) * maskW);
      const my = Math.floor((y / imgH) * maskH);
      pixels[(y * imgW + x) * 4 + 3] = mask[(my * maskW + mx) * stride];
    }
  }
  return pixels;
}

/**
 * Composite a segmentation mask onto an image as its alpha channel, producing a
 * transparent-background PNG data URL (foreground opaque, background transparent).
 * Handles `ImageData` and flat `Uint8Array` masks, resampling via
 * {@link compositeMaskAlpha} when the mask resolution differs from the image.
 */
export async function applyMaskToImage(
  imageDataUrl: string,
  mask: ImageData | Uint8Array
): Promise<string> {
  const img = await loadImage(imageDataUrl);
  const w = img.naturalWidth;
  const h = img.naturalHeight;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create a 2D canvas context');
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, w, h);
  const isImageData = mask instanceof ImageData;
  compositeMaskAlpha(
    imageData.data,
    w,
    h,
    isImageData ? mask.data : mask,
    isImageData ? mask.width : w,
    isImageData ? mask.height : h
  );

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * Convert an image-to-image result (`ImageData` or `Blob`) to a PNG data URL.
 */
export async function imageResultToDataUrl(image: ImageData | Blob): Promise<string> {
  if (image instanceof Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to convert image blob'));
      reader.readAsDataURL(image);
    });
  }
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create a 2D canvas context');
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL('image/png');
}

/** Download a PNG data URL to disk via the copy-owned {@link downloadBlob} helper. */
export async function downloadDataUrl(dataUrl: string, filename: string): Promise<void> {
  const blob = await (await fetch(dataUrl)).blob();
  downloadBlob(blob, filename);
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

// --- Inlined sibling: @/components/prompt-input ---

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


/**
 * @file prompt-input-attachments.tsx
 * @description Attachment surface for the composer. Adds image/file attachments
 * via file picker, paste, and drag-and-drop; renders preview thumbnails with
 * per-item removal, a hovercard preview, media-category auto-detection, and
 * upload-state chips. Produced attachments match `@localmode/react`'s image
 * content model and reuse its `readFileAsDataUrl` helper.
 *
 * Pairs with `PromptInput`/`PromptInputProvider`: it reports attachments via
 * `onChange` (or writes through the provider when present).
 */

/** Coarse media category derived from a MIME type. */
export type MediaCategory = 'image' | 'video' | 'audio' | 'document';

/** Classify a MIME type into a coarse media category. */
export function mediaCategory(mimeType: string): MediaCategory {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'document';
}

/** Strip the `data:<mime>;base64,` prefix to match `@localmode/core`'s model. */
function stripDataUrl(dataUrl: string) {
  const comma = dataUrl.indexOf(',');
  return comma === -1 ? dataUrl : dataUrl.slice(comma + 1);
}

async function fileToAttachment(file: File): Promise<PromptAttachment> {
  const dataUrl = await readFileAsDataUrl(file);
  return {
    id: crypto.randomUUID(),
    data: stripDataUrl(dataUrl),
    mimeType: file.type || 'application/octet-stream',
    name: file.name,
    size: file.size,
  };
}

/** Props for {@link PromptInputAttachments}. */
export interface PromptInputAttachmentsProps
  extends Omit<React.ComponentProps<'div'>, 'onChange'> {
  /** Current attachments (controlled). Falls back to the provider when omitted. */
  value?: PromptAttachment[];
  /** Reports the new attachment list after add/remove (controlled). */
  onChange?: (attachments: PromptAttachment[]) => void;
  /** Accept filter for the picker / drop. @default "image/*" */
  accept?: string;
  /** Allow multiple files. @default true */
  multiple?: boolean;
}

/**
 * The attachment dropzone + preview strip.
 *
 * @example
 * ```tsx
 * <PromptInputProvider>
 *   <PromptInput onSubmit={send}>…</PromptInput>
 *   <PromptInputAttachments />
 * </PromptInputProvider>
 * ```
 */
export function PromptInputAttachments({
  value,
  onChange,
  accept = 'image/*',
  multiple = true,
  className,
  children,
  ...props
}: PromptInputAttachmentsProps) {
  const provider = usePromptInputContext();
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = React.useState(false);

  const attachments = value ?? provider?.attachments ?? [];

  const setAttachments = (next: PromptAttachment[]) => {
    onChange?.(next);
    provider?.setAttachments(next);
  };

  const addFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;
    const next = await Promise.all(list.map(fileToAttachment));
    setAttachments([...attachments, ...next]);
  };

  const remove = (id: string) =>
    setAttachments(attachments.filter((a) => a.id !== id));

  // Paste handler (image clipboard items anywhere within the dropzone).
  const onPaste = (e: React.ClipboardEvent) => {
    const files = Array.from(e.clipboardData.files);
    if (files.length) {
      e.preventDefault();
      void addFiles(files);
    }
  };

  return (
    <div
      data-slot="prompt-input-attachments"
      data-dragging={dragging || undefined}
      onPaste={onPaste}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        void addFiles(e.dataTransfer.files);
      }}
      className={cn(
        'rounded-lg border border-dashed border-border p-2 transition-colors',
        dragging && 'border-ring bg-accent/40',
        className,
      )}
      {...props}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => {
          if (e.target.files) void addFiles(e.target.files);
          e.target.value = '';
        }}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => inputRef.current?.click()}
          className="text-muted-foreground"
        >
          <Paperclip className="size-4" />
          Attach
        </Button>

        {attachments.length === 0 && !children && (
          <span className="min-w-0 break-words text-xs text-muted-foreground [overflow-wrap:anywhere]">
            {dragging ? 'Drop to attach' : 'Drop images here'}
          </span>
        )}

        {attachments.map((att) => (
          <AttachmentChip key={att.id} attachment={att} onRemove={() => remove(att.id)} />
        ))}

        {children}
      </div>
    </div>
  );
}

/** Props for {@link AttachmentChip}. */
interface AttachmentChipProps {
  attachment: PromptAttachment;
  onRemove: () => void;
}

/** A single attachment preview chip with hovercard + remove control. */
function AttachmentChip({ attachment, onRemove }: AttachmentChipProps) {
  const category = mediaCategory(attachment.mimeType);
  const url = `data:${attachment.mimeType};base64,${attachment.data}`;
  const CategoryIcon =
    category === 'video' ? Film : category === 'audio' ? Music : FileIcon;

  return (
    <div
      data-slot="attachment-chip"
      data-category={category}
      className="group relative inline-flex items-center"
    >
      <HoverCard openDelay={120}>
        <HoverCardTrigger asChild>
          <button
            type="button"
            className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-left text-xs focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {category === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt={attachment.name ?? 'image'} className="size-6 rounded object-cover" />
            ) : (
              <CategoryIcon className="size-4 text-muted-foreground" />
            )}
            <span className="max-w-28 truncate">{attachment.name ?? category}</span>
          </button>
        </HoverCardTrigger>
        <HoverCardContent className="w-auto p-2">
          {category === 'image' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={attachment.name ?? 'preview'} className="max-h-48 max-w-[calc(100vw-4rem)] rounded object-contain" />
          ) : (
            <div className="max-w-[min(20rem,calc(100vw-4rem))] break-words text-xs text-muted-foreground [overflow-wrap:anywhere]">
              {attachment.name} · {attachment.mimeType}
            </div>
          )}
        </HoverCardContent>
      </HoverCard>
      <button
        type="button"
        aria-label="Remove attachment"
        onClick={onRemove}
        className="absolute -right-1.5 -top-1.5 rounded-full bg-secondary p-0.5 text-secondary-foreground opacity-60 shadow transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:opacity-0"
      >
        <X className="size-3" />
      </button>
    </div>
  );
}

export default PromptInputAttachments;
