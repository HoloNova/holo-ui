"use client";

import * as React from "react";
import { Copy, Download, RefreshCw, X, Check } from "lucide-react";
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


/**
 * @file artifact.tsx
 * @description Docked side-panel/canvas shell that renders generated content
 * (code, markdown doc, SVG, HTML) beside the chat, separate from the message
 * stream. Purely presentational — a local model (via `useGenerateText` /
 * `useGenerateObject`) supplies the content; the shell never calls a server.
 */


/** Props for {@link Artifact}, the docked canvas root. */
export interface ArtifactProps extends React.ComponentProps<'section'> {
  /**
   * When false, the canvas is hidden (returns `null`). Lets the host toggle the
   * docked panel open/closed. Defaults to `true`.
   * @default true
   */
  open?: boolean;
}

/**
 * The docked artifact canvas. Renders a vertical panel with a header region and
 * a scrollable content surface. Compose it from {@link ArtifactHeader},
 * {@link ArtifactTitle}, {@link ArtifactDescription}, {@link ArtifactActions},
 * {@link ArtifactAction}, {@link ArtifactClose}, and {@link ArtifactContent}.
 *
 * Styled with shadcn/ui CSS variables so it inherits the consumer's theme.
 *
 * @example
 * ```tsx
 * <Artifact open={open} className="w-[28rem]">
 *   <ArtifactHeader>
 *     <div>
 *       <ArtifactTitle>generated.ts</ArtifactTitle>
 *       <ArtifactDescription>From a local model run</ArtifactDescription>
 *     </div>
 *     <ArtifactActions>
 *       <ArtifactAction content={code} label="Copy" tooltip="Copy to clipboard" />
 *       <ArtifactAction content={code} fileName="generated.ts" label="Download" />
 *       <ArtifactAction onClick={refresh} label="Refresh" />
 *       <ArtifactClose onClick={() => setOpen(false)} />
 *     </ArtifactActions>
 *   </ArtifactHeader>
 *   <ArtifactContent>
 *     <pre>{code}</pre>
 *   </ArtifactContent>
 * </Artifact>
 * ```
 */
export function Artifact({
  open = true,
  className,
  children,
  ...props
}: ArtifactProps) {
  if (!open) return null;

  return (
    <section
      data-slot="artifact"
      aria-label="Artifact canvas"
      className={cn(
        'flex h-full min-h-0 w-full min-w-0 max-w-full flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm',
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

/** The header band of an {@link Artifact}: holds title/description and actions. */
export function ArtifactHeader({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="artifact-header"
      className={cn(
        'flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-3 [&>*:first-child]:min-w-0',
        className,
      )}
      {...props}
    />
  );
}

/** The title of an {@link Artifact}. */
export function ArtifactTitle({
  className,
  ...props
}: React.ComponentProps<'h2'>) {
  return (
    <h2
      data-slot="artifact-title"
      className={cn(
        'truncate text-sm font-semibold leading-none text-foreground',
        className,
      )}
      {...props}
    />
  );
}

/** The secondary description line of an {@link Artifact}. */
export function ArtifactDescription({
  className,
  ...props
}: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="artifact-description"
      className={cn('mt-1 truncate text-xs text-muted-foreground', className)}
      {...props}
    />
  );
}

/** The action-toolbar container in an {@link ArtifactHeader}. */
export function ArtifactActions({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="artifact-actions"
      className={cn('flex shrink-0 items-center gap-1', className)}
      {...props}
    />
  );
}

/** Props for {@link ArtifactAction}, a single toolbar button. */
export interface ArtifactActionProps
  extends Omit<React.ComponentProps<'button'>, 'content'> {
  /** Accessible label for the icon button (also used as the tooltip). */
  label: string;
  /**
   * Icon to render. Defaults are wired by convention: pass `content` to make a
   * copy/download action, or `onClick` for a custom (e.g. refresh) action.
   */
  icon?: React.ReactNode;
  /**
   * String content the action operates on. When provided without `fileName`,
   * clicking copies it to the clipboard. When provided with `fileName`, clicking
   * downloads it as a real `Blob`. Both happen entirely client-side.
   */
  content?: string;
  /** When set (with `content`), the action downloads `content` as this file. */
  fileName?: string;
  /** MIME type for the downloaded blob. @default "text/plain" */
  mimeType?: string;
}

/**
 * A single artifact toolbar action. Three built-in behaviors, chosen by props:
 * - `content` only → copy to clipboard (shows a transient check on success).
 * - `content` + `fileName` → download as a client-side `Blob`.
 * - `onClick` (no `content`) → custom action (e.g. refresh re-runs generation).
 *
 * All behaviors are local; nothing is sent to a server.
 */
export function ArtifactAction({
  label,
  icon,
  content,
  fileName,
  mimeType = 'text/plain',
  onClick,
  className,
  children,
  ...props
}: ArtifactActionProps) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const isDownload = content != null && fileName != null;
  const isCopy = content != null && fileName == null;

  const resolvedIcon =
    icon ??
    (isDownload ? (
      <Download aria-hidden="true" />
    ) : isCopy ? (
      copied ? (
        <Check aria-hidden="true" />
      ) : (
        <Copy aria-hidden="true" />
      )
    ) : (
      <RefreshCw aria-hidden="true" />
    ));

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;

    if (isDownload) {
      downloadBlob(content, fileName, mimeType);
      return;
    }

    if (isCopy) {
      try {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), 1500);
      } catch {
        /* clipboard may be unavailable (e.g. insecure context) — no-op */
      }
    }
  };

  return (
    <button
      type="button"
      data-slot="artifact-action"
      title={label}
      aria-label={label}
      onClick={handleClick}
      className={cn(
        'inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4 [&_svg]:shrink-0',
        className,
      )}
      {...props}
    >
      {children ?? resolvedIcon}
    </button>
  );
}

/** Props for {@link ArtifactClose}. */
export interface ArtifactCloseProps
  extends React.ComponentProps<'button'> {
  /** Accessible label. @default "Close" */
  label?: string;
}

/** The close button for an {@link Artifact}. Fires its `onClick` to hide the panel. */
export function ArtifactClose({
  label = 'Close',
  className,
  children,
  ...props
}: ArtifactCloseProps) {
  return (
    <button
      type="button"
      data-slot="artifact-close"
      title={label}
      aria-label={label}
      className={cn(
        'inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4 [&_svg]:shrink-0',
        className,
      )}
      {...props}
    >
      {children ?? <X aria-hidden="true" />}
    </button>
  );
}

/**
 * The scrollable content surface of an {@link Artifact}. Render generated code
 * (`<pre>`), markdown, an SVG, or any other local content inside it.
 */
export function ArtifactContent({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="artifact-content"
      className={cn(
        'min-h-0 flex-1 overflow-auto break-words p-4 text-sm [overflow-wrap:anywhere] [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:font-mono [&_pre]:text-xs',
        className,
      )}
      {...props}
    />
  );
}

export default Artifact;
