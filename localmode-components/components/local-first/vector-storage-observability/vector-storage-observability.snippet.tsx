"use client";

import { Database, Gauge, Zap } from "lucide-react";
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




/** Compression stats (mirrors core `getCompressionStats()`). */
export interface CompressionStatsLike {
  /** Compression ratio (original / compressed). */
  ratio: number;
  /** Estimated uncompressed size in bytes. */
  originalSizeBytes: number;
  /** Estimated compressed size in bytes. */
  compressedSizeBytes: number;
  /** Number of stored vectors. */
  vectorCount?: number;
}

/** Active quantization tier. */
export type QuantizationTier = 'raw' | 'sq8' | 'pq';

/** Props for {@link VectorStorageObservability}. */
export interface VectorStorageObservabilityProps {
  /** Compression stats (from `getCompressionStats()`). */
  stats: CompressionStatsLike;
  /** The active quantization tier. */
  tier: QuantizationTier;
  /** Last search latency in milliseconds. */
  searchLatencyMs?: number;
  /** Whether search ran on a WebGPU-accelerated distance kernel. */
  webgpuAccelerated?: boolean;
  /** Additional class names merged onto the root element. */
  className?: string;
}

const TIERS: { key: QuantizationTier; label: string; factor: string }[] = [
  { key: 'raw', label: 'Raw F32', factor: '1×' },
  { key: 'sq8', label: 'SQ8', factor: '4×' },
  { key: 'pq', label: 'PQ', factor: '8-32×' },
];

/**
 * VectorDB-specific observability that complements `StorageMeter` (quota): a
 * compression-stats badge (SQ8 ratio + before/after size, e.g. "4.0× —
 * 15KB→3.7KB"), a three-tier storage estimate (Raw Float32 / SQ8 4× / PQ 8–32×
 * with the active tier highlighted), and a GPU-aware search-latency badge
 * (accented when WebGPU-accelerated). Values derive from `getCompressionStats()`
 * and search timing, passed in as props.
 *
 * @example
 * ```tsx
 * <VectorStorageObservability stats={getCompressionStats(db)} tier="sq8" searchLatencyMs={12} />
 * ```
 */
export function VectorStorageObservability({
  stats,
  tier,
  searchLatencyMs,
  webgpuAccelerated = false,
  className,
}: VectorStorageObservabilityProps) {
  return (
    <div
      className={cn(
        'flex w-full max-w-md flex-col gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">
          <Database className="size-3.5" aria-hidden="true" />
          {stats.ratio.toFixed(1)}× - {formatBytes(stats.originalSizeBytes)}→
          {formatBytes(stats.compressedSizeBytes)}
        </span>
        {searchLatencyMs != null && (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
              webgpuAccelerated
                ? 'border-violet-500/40 bg-violet-500/5 text-violet-600 dark:text-violet-400'
                : 'border-border bg-muted text-muted-foreground',
            )}
          >
            {webgpuAccelerated ? (
              <Zap className="size-3.5" aria-hidden="true" />
            ) : (
              <Gauge className="size-3.5" aria-hidden="true" />
            )}
            {Math.round(searchLatencyMs)}ms
            {webgpuAccelerated && ' · GPU'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {TIERS.map((t) => {
          const active = t.key === tier;
          return (
            <div
              key={t.key}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-lg border py-2.5 text-center',
                active
                  ? 'border-primary bg-accent'
                  : 'border-border bg-background opacity-60',
              )}
            >
              <span className="text-xs font-semibold">{t.label}</span>
              <span className="text-[11px] text-muted-foreground">{t.factor}</span>
              {active ? (
                <span className="rounded bg-primary px-1.5 text-[10px] font-medium uppercase tracking-wide text-primary-foreground">
                  Active
                </span>
              ) : (
                <span aria-hidden="true" className="text-[10px] uppercase tracking-wide">
                  &nbsp;
                </span>
              )}
            </div>
          );
        })}
      </div>

      {stats.vectorCount != null && (
        <p className="text-xs text-muted-foreground">
          {stats.vectorCount.toLocaleString()} vectors stored
        </p>
      )}
    </div>
  );
}

export default VectorStorageObservability;
