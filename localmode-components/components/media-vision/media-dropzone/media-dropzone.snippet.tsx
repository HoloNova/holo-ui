"use client";

import * as React from "react";
import { ImagePlus, Loader2, Plus, UploadCloud } from "lucide-react";
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



/** A file rejected by {@link MediaDropzone}'s accept-list / max-size validation. */
export interface MediaDropzoneRejection {
  /** The rejected file. */
  file: File;
  /** Human-readable reason from the `validateFile` helper. */
  reason: string;
}

/** Props for {@link MediaDropzone}. */
export interface MediaDropzoneProps {
  /**
   * Called with the files that pass the accept-list + max-size validation.
   * Always receives only valid files.
   */
  onFiles: (files: File[]) => void;
  /**
   * Called with files that fail validation, paired with the reason. Optional —
   * use it to surface an inline error.
   */
  onReject?: (rejections: MediaDropzoneRejection[]) => void;
  /**
   * Accepted MIME types, e.g. `['image/png', 'image/jpeg', 'image/webp']`.
   * When omitted, any file type is accepted.
   * @default ["image/png","image/jpeg","image/webp","image/gif"]
   */
  accept?: string[];
  /**
   * Maximum file size in bytes. When omitted, no size limit is enforced.
   * @default 10000000
   */
  maxSize?: number;
  /**
   * Allow selecting / dropping more than one file at a time.
   * @default true
   */
  multiple?: boolean;
  /**
   * When true, render a spinner + label overlay (e.g. while a model processes
   * the dropped image). The zone stops accepting input while processing.
   * @default false
   */
  processing?: boolean;
  /** Label shown while `processing` is true. @default "Processing…" */
  processingLabel?: string;
  /**
   * When true, render the compact "add another" variant — a short, inline tile
   * instead of the full hero zone. Use it once images already exist.
   * @default false
   */
  addAnother?: boolean;
  /** Title shown in the idle state. @default "Drop an image here" */
  title?: string;
  /** Subtitle shown in the idle state. @default "or click to browse" */
  subtitle?: string;
  /** Disable all interaction. @default false */
  disabled?: boolean;
  /** Additional class names merged onto the root element. */
  className?: string;
}

/** Proper-cased labels for common subtypes so "webp" renders "WebP", not "WEBP". */
const FORMAT_LABELS: Record<string, string> = {
  png: 'PNG',
  jpeg: 'JPEG',
  jpg: 'JPG',
  webp: 'WebP',
  gif: 'GIF',
  avif: 'AVIF',
  bmp: 'BMP',
  'svg+xml': 'SVG',
};

/** Pretty-print the accept-list (MIME types) as a formats hint, e.g. "PNG · JPEG · WebP". */
function formatAcceptHint(accept?: string[]) {
  if (!accept || accept.length === 0) return 'Any file type';
  return accept
    .map((type) => {
      const subtype = type.split('/')[1];
      if (!subtype) return type;
      return FORMAT_LABELS[subtype.toLowerCase()] ?? subtype.toUpperCase();
    })
    .join(' · ');
}

/**
 * A drag-and-drop + click-to-browse upload zone for image/media files.
 *
 * Renders idle (icon + title + subtitle + accepted-formats hint), drag-over
 * (highlight + tint + scale), and processing (spinner + label) states, plus a
 * compact `addAnother` variant for adding more files once some exist. Files are
 * validated with the copy-owned `validateFile` (from `@/lib/browser-utils`) against `accept` + `maxSize`;
 * valid files are emitted via `onFiles`, rejected ones via `onReject`.
 *
 * Presentational + stateless: it owns no async/model state — wire `processing`
 * to a vision hook's `isLoading` and read the emitted files yourself.
 *
 * @example
 * ```tsx
 * <MediaDropzone
 *   accept={['image/png', 'image/jpeg']}
 *   maxSize={5_000_000}
 *   onFiles={(files) => setImages(files)}
 * />
 * ```
 */
export function MediaDropzone({
  onFiles,
  onReject,
  accept = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
  maxSize = 10_000_000,
  multiple = true,
  processing = false,
  processingLabel = 'Processing…',
  addAnother = false,
  title = 'Drop an image here',
  subtitle = 'or click to browse',
  disabled = false,
  className,
}: MediaDropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const dragDepth = React.useRef(0);

  const interactive = !disabled && !processing;

  /** Validate a list of files, splitting into accepted / rejected. */
  function partition(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    const valid: File[] = [];
    const rejected: MediaDropzoneRejection[] = [];
    for (const file of files) {
      const error = validateFile({ file, accept, maxSize });
      if (error) rejected.push({ file, reason: error.message });
      else valid.push(file);
    }
    return { valid, rejected };
  }

  function emit(fileList: FileList | File[]) {
    const { valid, rejected } = partition(fileList);
    if (rejected.length > 0) onReject?.(rejected);
    if (valid.length > 0) onFiles(multiple ? valid : valid.slice(0, 1));
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    dragDepth.current = 0;
    setIsDragOver(false);
    if (!interactive) return;
    if (event.dataTransfer.files.length > 0) emit(event.dataTransfer.files);
  }

  function handleDragEnter(event: React.DragEvent) {
    event.preventDefault();
    if (!interactive) return;
    dragDepth.current += 1;
    setIsDragOver(true);
  }

  function handleDragLeave(event: React.DragEvent) {
    event.preventDefault();
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setIsDragOver(false);
    }
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
      emit(event.target.files);
    }
    // Reset so selecting the same file again re-fires onChange.
    event.target.value = '';
  }

  function openPicker() {
    if (interactive) inputRef.current?.click();
  }

  const hiddenInput = (
    <input
      ref={inputRef}
      type="file"
      accept={accept?.join(',')}
      multiple={multiple}
      disabled={!interactive}
      onChange={handleInputChange}
      className="sr-only"
      tabIndex={-1}
      aria-hidden="true"
    />
  );

  if (addAnother) {
    return (
      <>
        <button
          type="button"
          onClick={openPicker}
          disabled={!interactive}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          className={cn(
            'group flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card px-4 py-3 text-sm font-medium text-muted-foreground transition-colors',
            interactive && 'hover:border-primary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
            isDragOver && 'border-primary bg-primary/5 text-foreground',
            !interactive && 'cursor-not-allowed opacity-60',
            className,
          )}
        >
          {processing ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Plus className="size-4" aria-hidden="true" />
          )}
          {processing ? processingLabel : 'Add another'}
        </button>
        {hiddenInput}
      </>
    );
  }

  return (
    <div
      role="button"
      tabIndex={interactive ? 0 : -1}
      aria-disabled={!interactive}
      aria-label={title}
      onClick={openPicker}
      onKeyDown={(e) => {
        if (interactive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          openPicker();
        }
      }}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      className={cn(
        'relative flex min-h-48 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-card p-8 text-center outline-none transition-all',
        interactive &&
          'cursor-pointer hover:border-primary/50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        isDragOver && 'scale-[1.01] border-primary bg-primary/5',
        !interactive && 'cursor-not-allowed',
        className,
      )}
    >
      <div
        className={cn(
          'flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors',
          isDragOver && 'bg-primary/10 text-primary',
        )}
        aria-hidden="true"
      >
        {isDragOver ? (
          <ImagePlus className="size-6" />
        ) : (
          <UploadCloud className="size-6" />
        )}
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-foreground">
          {isDragOver ? 'Drop to upload' : title}
        </p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
        <p className="text-[0.6875rem] font-medium tracking-wide text-muted-foreground">
          {formatAcceptHint(accept)}
          {maxSize ? ` · up to ${(maxSize / 1_000_000).toFixed(0)} MB` : ''}
        </p>
      </div>

      {hiddenInput}

      {processing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-background/80 backdrop-blur-sm">
          <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
          <span className="text-sm font-medium text-foreground">
            {processingLabel}
          </span>
        </div>
      )}
    </div>
  );
}

export default MediaDropzone;
