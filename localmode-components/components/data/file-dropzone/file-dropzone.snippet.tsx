"use client";

import * as React from "react";
import { UploadCloud, Loader2 } from "lucide-react";
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



/** A file that failed `validateFile`, paired with the reason. */
export interface RejectedFile {
  /** The rejected file. */
  file: File;
  /** Human-readable validation message from `validateFile`. */
  reason: string;
}

/** Props for {@link FileDropzone}. */
export interface FileDropzoneProps {
  /**
   * Called with the files that passed validation (accept-list + max-size).
   * Only valid files are included.
   */
  onUpload: (files: File[]) => void;
  /**
   * Called when one or more dropped/selected files fail validation. Optional —
   * use it to surface per-file errors.
   */
  onReject?: (rejected: RejectedFile[]) => void;
  /**
   * Accepted MIME types, e.g. `['application/pdf', 'text/csv', 'application/json']`.
   * Passed to the native input's `accept` attribute (as a comma-joined list)
   * and enforced by `validateFile`. When omitted, all types are accepted.
   */
  accept?: string[];
  /** Maximum file size in bytes. Files larger than this are rejected. */
  maxSize?: number;
  /**
   * Allow selecting more than one file at a time.
   * @default true
   */
  multiple?: boolean;
  /**
   * Disable the zone (blocks drag and click). Combine with `processing` for an
   * "uploading…" state.
   * @default false
   */
  disabled?: boolean;
  /**
   * Show the processing overlay and block input. Use while files are being
   * indexed/parsed.
   * @default false
   */
  processing?: boolean;
  /** Message shown in the processing overlay. @default "Processing…" */
  processingLabel?: string;
  /** Primary call-to-action text. @default "Drop files or click to browse" */
  label?: string;
  /**
   * Secondary hint line. Defaults to a human-readable summary of `accept` and
   * `maxSize`.
   */
  hint?: string;
  /** Additional class names merged onto the root element. */
  className?: string;
}

/** Format a byte count as a short human-readable string. */
function formatBytes(bytes: number) {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(0)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`;
  return `${bytes} B`;
}

/** Derive a default hint from the accept-list and max size. */
function defaultHint(accept?: string[], maxSize?: number) {
  const parts: string[] = [];
  if (accept && accept.length > 0) {
    const exts = accept
      .map((t) => t.split('/').pop()?.toUpperCase() ?? t)
      .join(', ');
    parts.push(exts);
  }
  if (maxSize !== undefined) parts.push(`up to ${formatBytes(maxSize)}`);
  return parts.join(' · ') || undefined;
}

/**
 * A generic, format-agnostic drag-and-drop + click-to-browse upload zone. Built
 * for non-image files (PDF, CSV, JSON, vector exports) — it has no image-preview
 * semantics (use `MediaDropzone` for thumbnails). Validates each file with
 * the copy-owned `validateFile` (from `@/lib/browser-utils`) against the
 * `accept` MIME list and `maxSize`, emitting only valid files via `onUpload`; rejected files go to
 * `onReject`.
 *
 * Styled with shadcn/ui CSS variables so it inherits the consumer's theme. The
 * `processing`/`disabled` overlay blocks further input.
 *
 * @example
 * ```tsx
 * <FileDropzone
 *   accept={['application/pdf', 'text/csv', 'application/json']}
 *   maxSize={10_000_000}
 *   onUpload={(files) => ingest(files)}
 *   onReject={(rejected) => setErrors(rejected)}
 * />
 * ```
 */
export function FileDropzone({
  onUpload,
  onReject,
  accept,
  maxSize,
  multiple = true,
  disabled = false,
  processing = false,
  processingLabel = 'Processing…',
  label = 'Drop files or click to browse',
  hint,
  className,
}: FileDropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const blocked = disabled || processing;
  const resolvedHint = hint ?? defaultHint(accept, maxSize);

  /** Validate a FileList, splitting into valid + rejected, then emit. */
  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const valid: File[] = [];
    const rejected: RejectedFile[] = [];

    for (const file of Array.from(fileList)) {
      const error = validateFile({ file, accept, maxSize });
      if (error) {
        rejected.push({ file, reason: error.message });
      } else {
        valid.push(file);
      }
    }

    if (rejected.length > 0) onReject?.(rejected);
    if (valid.length > 0) onUpload(multiple ? valid : valid.slice(0, 1));
  };

  const openPicker = () => {
    if (blocked) return;
    inputRef.current?.click();
  };

  return (
    <div
      role="button"
      tabIndex={blocked ? -1 : 0}
      aria-disabled={blocked}
      aria-busy={processing}
      onClick={openPicker}
      onKeyDown={(e) => {
        if (blocked) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openPicker();
        }
      }}
      onDragOver={(e) => {
        if (blocked) return;
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (blocked) return;
        handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        'relative flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-card px-6 py-10 text-center transition-colors outline-none',
        !blocked &&
          'cursor-pointer hover:border-primary/50 hover:bg-accent focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/50',
        isDragging && 'border-primary bg-primary/5',
        blocked && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={accept?.join(',')}
        multiple={multiple}
        disabled={blocked}
        onChange={(e) => {
          handleFiles(e.target.files);
          // Reset so selecting the same file again re-fires onChange.
          e.target.value = '';
        }}
      />

      <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <UploadCloud className="size-5" aria-hidden="true" />
      </span>

      <div className="max-w-full space-y-1">
        <p className="break-words text-sm font-medium text-card-foreground [overflow-wrap:anywhere]">{label}</p>
        {resolvedHint && (
          <p className="break-words text-xs text-muted-foreground [overflow-wrap:anywhere]">{resolvedHint}</p>
        )}
      </div>

      {processing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-background/80 backdrop-blur-sm">
          <Loader2
            className="size-5 animate-spin text-primary"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-foreground">
            {processingLabel}
          </p>
        </div>
      )}
    </div>
  );
}

export default FileDropzone;
