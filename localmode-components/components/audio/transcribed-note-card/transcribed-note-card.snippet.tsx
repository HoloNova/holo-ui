"use client";

import * as React from "react";
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

// --- Inlined sibling: @/components/waveform-activity-bars ---


/**
 * Discrete agent / processing states the bars can visualize. Each state maps to
 * an animation feel:
 *
 * Each state varies color, amplitude, speed, bar count, and animation pattern
 * so the modes are distinguishable at a glance:
 *
 * - `idle` — flat, short, very slow muted "breathing" (few bars).
 * - `connecting` — small low-amplitude muted blips (indeterminate session).
 * - `listening` — lively medium-high primary bars (live-mic volume source).
 * - `thinking` — a slower amber travelling "processing" pulse.
 * - `speaking` — full, fast, tall emerald bars (output volume source).
 * - `record` — recording-in-progress destructive-red pulse.
 * - `playback` — playback-scrub travelling pulse.
 */
export type WaveformState =
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'record'
  | 'playback';

/** Props for {@link WaveformActivityBars}. */
export interface WaveformActivityBarsProps {
  /**
   * Number of vertical bars to render. When a `state` is set and this is
   * omitted, each state picks a distinct count (e.g. fewer for `idle`, more for
   * `speaking`); an explicit value always wins.
   * @default 5
   */
  barCount?: number;
  /**
   * When true, bars animate with a staggered pulse; when false they render as a
   * static idle illustration. Ignored when an explicit `state` is set.
   * @default true
   */
  active?: boolean;
  /**
   * Explicit agent / processing state. Takes precedence over `active` and lets
   * the same component double as a voice-agent visualizer.
   */
  state?: WaveformState;
  /**
   * Bar color. Any CSS color. When a `state` is set and this is omitted, each
   * state uses a semantic color (muted for `idle`/`connecting`, primary for
   * `listening`, amber for `thinking`, emerald for `speaking`); an explicit
   * value always wins. Defaults to the theme's primary token when no `state`.
   * @default "var(--primary)"
   */
  color?: string;
  /**
   * Max bar height in pixels (the row height).
   * @default 24
   */
  height?: number;
  /**
   * Optional live volume in the `[0, 1]` range. When provided the bars scale to
   * the measured amplitude, decoupling the visual from any specific audio
   * source — feed it from a Web Audio `AnalyserNode` (`getInputVolume()` /
   * `getOutputVolume()`).
   */
  volume?: number;
  /** Accessible label for the row. @default "audio activity" */
  label?: string;
  /** Additional class names merged onto the root element. */
  className?: string;
}

/**
 * The shared keyframes are injected once per document so the component works
 * standalone after `shadcn add` (the showcase centralizes this in globals.css;
 * we bundle it here instead so the copied file is self-contained).
 *
 * Each state uses a different keyframe so the modes read distinctly at a glance:
 * - `lm-waveform-pulse` — the default symmetric pulse (listening / speaking).
 * - `lm-waveform-breathe` — a gentle, shallow swell (idle).
 * - `lm-waveform-blip` — a quick, low-amplitude on/off blip (connecting).
 * - `lm-waveform-travel` — a travelling "processing" pulse that stays mostly
 *   low and briefly spikes, so a staggered delay reads as a wave moving across
 *   the row (thinking).
 */
const KEYFRAME_ID = 'lm-waveform-activity-keyframes';
const KEYFRAME_CSS = `
@keyframes lm-waveform-pulse {
  0%, 100% { transform: scaleY(0.25); }
  50% { transform: scaleY(1); }
}
@keyframes lm-waveform-breathe {
  0%, 100% { transform: scaleY(0.18); }
  50% { transform: scaleY(0.45); }
}
@keyframes lm-waveform-blip {
  0%, 70%, 100% { transform: scaleY(0.2); }
  82% { transform: scaleY(0.6); }
}
@keyframes lm-waveform-travel {
  0%, 60%, 100% { transform: scaleY(0.2); }
  78% { transform: scaleY(1); }
}`;

function useWaveformKeyframes() {
  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById(KEYFRAME_ID)) return;
    const style = document.createElement('style');
    style.id = KEYFRAME_ID;
    style.textContent = KEYFRAME_CSS;
    document.head.appendChild(style);
  }, []);
}

function useReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

/**
 * Per-state visual tuning. Each state varies several dimensions at once so the
 * modes are distinguishable at a glance rather than only by speed:
 *
 * - `duration` — base animation duration in ms (lower = faster/livelier).
 * - `amplitude` — resting-height multiplier (lower = flatter/shorter bars).
 * - `keyframe` — which injected `@keyframes` animation to run.
 * - `color` — bar color (a semantic CSS-variable token per state).
 * - `barCount` — override for the rendered bar count (null = use the prop).
 * - `stagger` — per-bar animation-delay step in ms; `wave` makes the per-bar
 *   delay sweep across the row so `lm-waveform-travel` reads as a moving pulse.
 */
interface StateTuning {
  duration: number;
  amplitude: number;
  keyframe: string;
  color: string;
  barCount: number | null;
  stagger: 'pulse' | 'wave';
}

const STATE_TUNING: Record<WaveformState, StateTuning> = {
  // Flat, short, very slow, muted — clearly "doing nothing".
  idle: {
    duration: 2600,
    amplitude: 0.3,
    keyframe: 'lm-waveform-breathe',
    color: 'var(--muted-foreground)',
    barCount: 3,
    stagger: 'pulse',
  },
  // Small indeterminate blips, low amplitude, muted — "establishing session".
  connecting: {
    duration: 900,
    amplitude: 0.55,
    keyframe: 'lm-waveform-blip',
    color: 'var(--muted-foreground)',
    barCount: 5,
    stagger: 'pulse',
  },
  // Lively, medium-high, primary — "I'm hearing you".
  listening: {
    duration: 760,
    amplitude: 1,
    keyframe: 'lm-waveform-pulse',
    color: 'var(--primary)',
    barCount: 7,
    stagger: 'pulse',
  },
  // Slower travelling pulse, amber accent — "processing".
  thinking: {
    duration: 1500,
    amplitude: 0.75,
    keyframe: 'lm-waveform-travel',
    color: '#f59e0b',
    barCount: 6,
    stagger: 'wave',
  },
  // Full, fast, tall, emerald — "talking back".
  speaking: {
    duration: 560,
    amplitude: 1,
    keyframe: 'lm-waveform-pulse',
    color: '#10b981',
    barCount: 9,
    stagger: 'pulse',
  },
  // Recording-in-progress pulse, destructive red.
  record: {
    duration: 900,
    amplitude: 0.95,
    keyframe: 'lm-waveform-pulse',
    color: 'var(--destructive)',
    barCount: 7,
    stagger: 'pulse',
  },
  // Playback-scrub travelling pulse, primary.
  playback: {
    duration: 1100,
    amplitude: 0.85,
    keyframe: 'lm-waveform-travel',
    color: 'var(--primary)',
    barCount: 7,
    stagger: 'wave',
  },
};

/**
 * A pure-CSS row of vertical bars with a staggered, sinusoid-derived pulse.
 * Doubles as an active audio-processing/synthesis indicator and an idle
 * empty-state illustration — it needs no audio data. For voice-agent UIs, pass
 * an explicit `state` and an optional `volume` (`0..1`) from a local
 * `AnalyserNode` to drive amplitude, keeping the visual decoupled from the
 * audio source.
 *
 * The required `@keyframes` ships with the component (injected once into
 * `document.head`), so it animates standalone after `shadcn add`.
 *
 * @example
 * ```tsx
 * // Active processing indicator
 * <WaveformActivityBars active />
 *
 * // Voice-agent listening state driven by live mic volume
 * <WaveformActivityBars state="listening" volume={inputVolume} />
 * ```
 */
export function WaveformActivityBars({
  barCount,
  active = true,
  state,
  color,
  height = 24,
  volume,
  label = 'audio activity',
  className,
}: WaveformActivityBarsProps) {
  useWaveformKeyframes();
  const reducedMotion = useReducedMotion();

  const isAnimating = state ? state !== 'idle' || active : active;
  const tuning = state ? STATE_TUNING[state] : STATE_TUNING.listening;

  // Resolve color and bar count: an explicit prop always wins; otherwise the
  // per-state tuning supplies a distinct value, falling back to the historic
  // defaults (primary, 5) when no state is set.
  const resolvedColor = color ?? (state ? tuning.color : 'var(--primary)');
  const resolvedBarCount = barCount ?? (state ? (tuning.barCount ?? 5) : 5);
  const count = Math.max(1, resolvedBarCount);

  // Sinusoid-derived resting heights give the row an organic waveform shape.
  const bars = Array.from({ length: count }, (_, i) => {
    const phase = (i / Math.max(1, count - 1)) * Math.PI;
    const base = 0.35 + Math.sin(phase) * 0.5; // 0.35..0.85
    return base;
  });

  return (
    <div
      role="img"
      aria-label={label}
      data-state={state ?? (active ? 'active' : 'idle')}
      className={cn('flex items-end gap-[3px]', className)}
      style={{ height }}
    >
      {bars.map((base, i) => {
        // Bake the per-state amplitude into the resting height so flatter
        // states (idle/connecting) read shorter even before animating.
        const restingHeight = volume == null ? Math.max(0.12, base * tuning.amplitude) : base;
        // When a live volume is supplied, scale the resting height by amplitude
        // so the visual tracks measured loudness rather than wall-clock time.
        const scaled =
          volume != null
            ? Math.max(0.12, Math.min(1, base * (0.4 + volume * tuning.amplitude * 1.4)))
            : restingHeight;
        const animDuration = tuning.duration + i * 80;
        // `wave` sweeps the delay across the row (left-to-right) so a travelling
        // keyframe reads as a moving pulse; `pulse` offsets each bar so the row
        // shimmers organically.
        const delay =
          tuning.stagger === 'wave'
            ? -(i * (tuning.duration / count))
            : -(i * (animDuration / count));

        return (
          <span
            key={i}
            aria-hidden="true"
            className="w-[3px] rounded-full"
            style={{
              height: '100%',
              backgroundColor: resolvedColor,
              transformOrigin: 'bottom',
              transform: `scaleY(${scaled})`,
              animation:
                isAnimating && volume == null && !reducedMotion
                  ? `${tuning.keyframe} ${animDuration}ms ease-in-out ${delay}ms infinite`
                  : undefined,
              transition: volume != null ? 'transform 80ms linear' : undefined,
            }}
          />
        );
      })}
    </div>
  );
}

export default WaveformActivityBars;



/** Format a Date as a coarse relative time string (e.g. "3m ago"). */
function relativeTime(date: Date): string {
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

/** Resolve a Blob | string | null audio source to a stable playable URL. */
function useAudioSrc(audio: Blob | string | null | undefined) {
  // useObjectUrl creates/revokes the object URL for Blobs; strings pass through.
  const objectUrl = useObjectUrl(typeof audio === 'string' ? null : audio);
  return typeof audio === 'string' ? audio : objectUrl;
}

/** Props for {@link TranscribedNoteCard}. */
export interface TranscribedNoteCardProps {
  /**
   * When true, render the "transcribing…" placeholder (waveform + label) instead
   * of the populated card. Flip to false once `useTranscribe` resolves.
   */
  transcribing?: boolean;
  /** The transcribed text (shown once `transcribing` is false). */
  text?: string;
  /** When the note was created — shown as relative time, absolute on hover. */
  timestamp?: Date;
  /** Local audio for inline playback (a `Blob` or object URL). */
  audio?: Blob | string | null;
  /** Fired when the hover-revealed delete control is clicked. Omit to hide it. */
  onDelete?: () => void;
  /** Additional class names merged onto the root element. */
  className?: string;
}

/**
 * A transcription list item pairing transcribed text with inline audio
 * playback. It has two variants from one component:
 *
 * - **Placeholder** (`transcribing`) — a {@link WaveformActivityBars} row + a
 *   "Transcribing…" label, the canonical loading state for a
 *   `useOperationList`-backed STT list where items stream in.
 * - **Populated** — a relative timestamp (hover → absolute), the transcript
 *   body, a native `<audio>` footer, and a hover-revealed delete.
 *
 * @example
 * ```tsx
 * <TranscribedNoteCard transcribing /> // while useTranscribe runs
 * <TranscribedNoteCard text={result.text} audio={blob} timestamp={new Date()} onDelete={remove} />
 * ```
 */
export function TranscribedNoteCard({
  transcribing,
  text,
  timestamp,
  audio,
  onDelete,
  className,
}: TranscribedNoteCardProps) {
  const src = useAudioSrc(audio);

  if (transcribing) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-card-foreground',
          className,
        )}
      >
        <WaveformActivityBars active height={20} barCount={5} />
        <span className="text-sm text-muted-foreground">Transcribing…</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group flex flex-col gap-2 rounded-lg border border-border bg-card p-3 text-card-foreground',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        {timestamp && (
          <time
            dateTime={timestamp.toISOString()}
            title={timestamp.toLocaleString()}
            className="text-xs text-muted-foreground"
          >
            {relativeTime(timestamp)}
          </time>
        )}
        {onDelete && (
          <button
            type="button"
            aria-label="Delete note"
            onClick={onDelete}
            className={cn(
              'shrink-0 rounded-md p-1 text-muted-foreground transition-opacity',
              'opacity-60 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100',
              'hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
            )}
          >
            {/* Trash glyph */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
              aria-hidden="true"
            >
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            </svg>
          </button>
        )}
      </div>

      {text && <p className="whitespace-pre-wrap break-words text-sm text-foreground [overflow-wrap:anywhere]">{text}</p>}

      {src && (
         
        <audio src={src} controls className="mt-1 h-9 w-full" />
      )}
    </div>
  );
}

export default TranscribedNoteCard;
