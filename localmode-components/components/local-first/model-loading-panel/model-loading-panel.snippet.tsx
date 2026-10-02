"use client";

import { Cpu, Info } from "lucide-react";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Inlined cn utility ---

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


// --- Inlined sibling: @/registry/localmode/local-first/model-downloader/model-downloader ---



/** A normalized download progress snapshot, provider-agnostic. */
export interface DownloadProgressValue {
  /** Bytes loaded so far (optional — percent is used when absent). */
  loaded?: number;
  /** Total bytes to load (optional). */
  total?: number;
  /** Completion fraction in the 0–1 range. Derived from loaded/total when omitted. */
  percent?: number;
  /** True when the model is being read from cache rather than downloaded fresh. */
  cached?: boolean;
}

/** Props for {@link DownloadProgress}. */
export interface DownloadProgressProps {
  /** Progress value (a 0–1 fraction, or a {@link DownloadProgressValue}). */
  value: number | DownloadProgressValue;
  /**
   * Render the completed appearance: a full emerald bar with a "Ready" label
   * instead of a percentage. When omitted, completion is inferred at 100%.
   */
  complete?: boolean;
  /** Additional class names merged onto the root element. */
  className?: string;
}

/** Resolve a 0–100 integer percentage from a fraction or progress object. */
function resolvePercent(value: number | DownloadProgressValue): number {
  if (typeof value === 'number') return clampPercent(value * 100);
  if (typeof value.percent === 'number') return clampPercent(value.percent * 100);
  if (value.total && value.total > 0 && typeof value.loaded === 'number') {
    return clampPercent((value.loaded / value.total) * 100);
  }
  return 0;
}

function clampPercent(p: number): number {
  if (!Number.isFinite(p)) return 0;
  return Math.max(0, Math.min(100, Math.round(p)));
}

/**
 * The lowest-level download primitive: a labeled bar + percentage rendered from
 * a single progress value. Bind it to `useModelLoad`'s `progressValue` (which
 * matches {@link DownloadProgressValue}) or its 0–1 `progress` fraction — or
 * any provider `onProgress` callback. Presentational only.
 *
 * @example
 * ```tsx
 * <DownloadProgress value={0.42} />
 * ```
 */
export function DownloadProgress({
  value,
  complete,
  className,
}: DownloadProgressProps) {
  const percent = resolvePercent(value);
  const isComplete = complete ?? percent >= 100;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn(
          'relative h-2 w-full overflow-hidden rounded-full',
          isComplete ? 'bg-emerald-500/20' : 'bg-primary/20',
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            isComplete ? 'bg-emerald-500' : 'bg-primary',
          )}
          style={{ width: `${isComplete ? 100 : percent}%` }}
        />
      </div>
      <span
        className={cn(
          'text-right text-xs tabular-nums',
          isComplete ? 'text-emerald-500' : 'text-muted-foreground',
        )}
      >
        {isComplete ? 'Ready' : `${percent}%`}
      </span>
    </div>
  );
}

/** Props for {@link ModelDownloader}. */
export interface ModelDownloaderProps {
  /** Display name of the model (e.g. "Llama 3.2 1B Instruct"). */
  name: string;
  /** Human-readable download size (e.g. "1.2 GB"). */
  size?: string;
  /** Context window length in tokens (e.g. 8192). */
  contextLength?: number;
  /** Category / family label (e.g. "Chat", "Vision"). */
  category?: string;
  /**
   * Progress value (a 0–1 fraction, or a {@link DownloadProgressValue}).
   * When the value reports `cached`, the copy switches to a cache-load message.
   */
  progress: number | DownloadProgressValue;
  /**
   * Whether the model is being loaded from cache (first-time download vs cache).
   * Overrides `progress.cached` when set explicitly.
   */
  cached?: boolean;
  /** Whether the model has finished loading and is ready for inference. */
  ready?: boolean;
  /** Additional class names merged onto the root element. */
  className?: string;
}

/** Format a context-window token count as a short label (e.g. 4096 → "4K"). */
export function formatContext(tokens: number): string {
  if (tokens >= 1024 && tokens % 1024 === 0) return `${tokens / 1024}K`;
  if (tokens >= 1000) return `${Math.round(tokens / 1000)}K`;
  return String(tokens);
}

/**
 * The headline local-first primitive: the card a user sees while their model
 * loads on-device. Renders model name, size, context length, and category
 * alongside a live progress bar, distinguishing a first-time download
 * ("Downloading…") from a cache load ("Loading from cache…") and a ready state.
 *
 * Lifted out of a chat empty-state so any feature (search, QA, vision) can reuse
 * it. Presentational and hook-driven — bind `progress` to `useModelLoad`'s
 * `progressValue` and pass model metadata from `useModelRecommendations`/your
 * catalog. It does not initiate or own the download (`useModelLoad().load()` does).
 *
 * @example
 * ```tsx
 * <ModelDownloader name="Llama 3.2 1B" size="1.2 GB" contextLength={8192} progress={0.4} />
 * ```
 */
export function ModelDownloader({
  name,
  size,
  contextLength,
  category,
  progress,
  cached,
  ready = false,
  className,
}: ModelDownloaderProps) {
  const isCached =
    cached ?? (typeof progress === 'object' ? Boolean(progress.cached) : false);
  const percent = resolvePercent(progress);
  const isComplete = ready || percent >= 100;

  const status: 'ready' | 'cache' | 'download' = isComplete
    ? 'ready'
    : isCached
      ? 'cache'
      : 'download';

  const Icon =
    status === 'ready'
      ? CheckCircle2
      : status === 'cache'
        ? HardDriveDownload
        : CloudDownload;

  const headline =
    status === 'ready'
      ? 'Model ready'
      : status === 'cache'
        ? 'Loading from cache…'
        : 'Downloading…';

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex w-full max-w-md flex-col gap-4 rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-lg',
            status === 'ready'
              ? 'bg-emerald-500/10 text-emerald-500'
              : 'bg-primary/10 text-primary',
          )}
        >
          <Icon
            className={cn('size-5', status === 'download' && 'animate-pulse')}
            aria-hidden="true"
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="text-xs text-muted-foreground">{headline}</p>
        </div>
      </div>

      {(size || contextLength != null || category) && (
        <div className="flex flex-wrap gap-1.5">
          {size && (
            <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {size}
            </span>
          )}
          {contextLength != null && (
            <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {formatContext(contextLength)} ctx
            </span>
          )}
          {category && (
            <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {category}
            </span>
          )}
        </div>
      )}

      <DownloadProgress value={progress} complete={isComplete} />
    </div>
  );
}

export default ModelDownloader;




/** Props for {@link ModelLoadingPanel}. */
export interface ModelLoadingPanelProps {
  /** Model display name. */
  name: string;
  /** Human-readable size. */
  size?: string;
  /** Context window in tokens. */
  contextLength?: number;
  /** Category / family label. */
  category?: string;
  /** Progress value (0–1 fraction or {@link DownloadProgressValue}). */
  progress: number | DownloadProgressValue;
  /** Whether the model is loading from cache rather than downloading fresh. */
  cached?: boolean;
  /** Additional class names merged onto the root element. */
  className?: string;
}

/**
 * A full-height "waiting for model" splash — the richer, blocking sibling of
 * `ModelDownloader`. Combines model metadata (size, context length, category,
 * a cached-vs-downloading badge) with a progress bar and a two-path help
 * message: a first-download note ("This is a one-time download — it'll be
 * instant next time") vs a cache-load note. Composes `DownloadProgress` and
 * binds to `useModelLoad` (`progressValue`, `cached`, `status`).
 *
 * @example
 * ```tsx
 * <ModelLoadingPanel name="Llama 3.2 1B" size="1.2 GB" progress={progressValue} />
 * ```
 */
export function ModelLoadingPanel({
  name,
  size,
  contextLength,
  category,
  progress,
  cached,
  className,
}: ModelLoadingPanelProps) {
  const isCached =
    cached ?? (typeof progress === 'object' ? Boolean(progress.cached) : false);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex min-h-64 w-full flex-col items-center justify-center gap-5 rounded-xl border border-border bg-card p-8 text-center text-card-foreground',
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Cpu className="size-6 animate-pulse" aria-hidden="true" />
      </span>

      <div className="flex flex-col items-center gap-1">
        <p className="text-base font-semibold">{name}</p>
        <span
          className={cn(
            'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
            isCached
              ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400'
              : 'border-primary/30 bg-primary/5 text-primary',
          )}
        >
          {isCached ? 'Loading from cache' : 'Downloading'}
        </span>
      </div>

      {(size || contextLength != null || category) && (
        <div className="flex flex-wrap justify-center gap-1.5">
          {size && (
            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {size}
            </span>
          )}
          {contextLength != null && (
            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {formatContext(contextLength)} ctx
            </span>
          )}
          {category && (
            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {category}
            </span>
          )}
        </div>
      )}

      <div className="w-full max-w-xs">
        <DownloadProgress value={progress} />
      </div>

      <p className="flex max-w-sm items-start gap-1.5 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        <span>
          {isCached
            ? 'Reading the model from your device - no network needed.'
            : 'This is a one-time download. It runs entirely on your device and will load instantly next time.'}
        </span>
      </p>
    </div>
  );
}

export default ModelLoadingPanel;
