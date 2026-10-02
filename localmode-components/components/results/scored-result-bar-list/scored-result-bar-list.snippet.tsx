"use client";

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Inlined cn utility ---

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


// --- Inlined sibling: @/registry/localmode/results/confidence-score-badge/confidence-score-badge ---


/** A confidence tier: how a 0–1 score is bucketed for color + label. */
export type ConfidenceTier = 'high' | 'medium' | 'low';

/** Lower-bound thresholds (inclusive) for the `high` and `medium` tiers. */
export interface ConfidenceThresholds {
  /**
   * Scores at or above this map to the `high` tier.
   * @default 0.8
   */
  high?: number;
  /**
   * Scores at or above this (but below `high`) map to the `medium` tier.
   * Everything below it is `low`.
   * @default 0.5
   */
  medium?: number;
}

/** Props for {@link ConfidenceScoreBadge}. */
export interface ConfidenceScoreBadgeProps {
  /** Confidence/similarity score in the inclusive range 0–1. */
  score: number;
  /**
   * Render style. `flat` is a pill badge; `radial` is a circular dial that
   * fills proportionally to the score.
   * @default "flat"
   */
  variant?: 'flat' | 'radial';
  /**
   * Tier breakpoints. Tune these for distributions that differ from the
   * default (e.g. dot-product vs cosine similarity).
   * @default { high: 0.8, medium: 0.5 }
   */
  thresholds?: ConfidenceThresholds;
  /**
   * Optional label rendered before the percentage in the flat variant
   * (e.g. the predicted class name).
   */
  label?: string;
  /**
   * Diameter of the radial dial in pixels. Ignored by the flat variant.
   * @default 56
   */
  size?: number;
  /**
   * Number of fraction digits in the rendered percentage.
   * @default 0
   */
  precision?: number;
  /** Additional class names merged onto the root element. */
  className?: string;
}

const DEFAULT_THRESHOLDS = { high: 0.8, medium: 0.5 } as const;

/**
 * Resolve a 0–1 score to a confidence tier using the supplied (or default)
 * thresholds. Exported so consumers can reuse the exact tiering logic for
 * their own styling.
 */
export function resolveTier(
  score: number,
  thresholds: ConfidenceThresholds = DEFAULT_THRESHOLDS,
): ConfidenceTier {
  const high = thresholds.high ?? DEFAULT_THRESHOLDS.high;
  const medium = thresholds.medium ?? DEFAULT_THRESHOLDS.medium;
  if (score >= high) return 'high';
  if (score >= medium) return 'medium';
  return 'low';
}

/**
 * Per-tier color tokens. The ring/dot color is wired to a CSS variable so the
 * radial dial themes via the consumer's tokens (no daisyUI). `text`/`bg`/`ring`
 * use Tailwind palettes for the flat variant; swap them in the copied file to
 * match your design system.
 */
const TIER_STYLES: Record<
  ConfidenceTier,
  { color: string; flat: string; label: string }
> = {
  high: {
    color: 'var(--color-emerald-500, #10b981)',
    flat: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    label: 'High',
  },
  medium: {
    color: 'var(--color-amber-500, #f59e0b)',
    flat: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400',
    label: 'Medium',
  },
  low: {
    color: 'var(--color-muted-foreground, #6b7280)',
    flat: 'border-border bg-muted text-muted-foreground',
    label: 'Low',
  },
};

/** Format a 0–1 score as a percentage string. */
function formatPercent(score: number, precision: number) {
  const clamped = Math.min(1, Math.max(0, score));
  return `${(clamped * 100).toFixed(precision)}%`;
}

/**
 * Maps a 0–1 confidence/similarity score to a semantic color tier (configurable
 * thresholds; default high ≥ 0.8 → success, medium ≥ 0.5 → warning, low →
 * muted) and renders it as a formatted percentage — either a flat pill badge or
 * a radial dial.
 *
 * This is the shared scored-output atom across LocalMode Elements: it serves any
 * scalar score from `useClassify` / `useClassifyZeroShot` / `useSemanticSearch`
 * / `useAnswerQuestion` and is consumed cross-family (e.g. by media-vision's
 * `ImageResultGallery`). Styled with CSS-variable tokens so it inherits the
 * consumer's theme.
 *
 * @example
 * ```tsx
 * <ConfidenceScoreBadge score={0.92} />              // 92% — high tier
 * <ConfidenceScoreBadge score={0.41} variant="radial" />
 * <ConfidenceScoreBadge score={0.7} thresholds={{ high: 0.6, medium: 0.3 }} />
 * ```
 */
export function ConfidenceScoreBadge({
  score,
  variant = 'flat',
  thresholds = DEFAULT_THRESHOLDS,
  label,
  size = 56,
  precision = 0,
  className,
}: ConfidenceScoreBadgeProps) {
  const clamped = Math.min(1, Math.max(0, Number.isFinite(score) ? score : 0));
  const tier = resolveTier(clamped, thresholds);
  const styles = TIER_STYLES[tier];
  const percent = formatPercent(clamped, precision);

  if (variant === 'radial') {
    // Conic-gradient ring driven by CSS variables → themes via consumer tokens.
    const stroke = Math.max(3, Math.round(size * 0.1));
    const ringStyle = {
      width: size,
      height: size,
      background: `conic-gradient(${styles.color} ${clamped * 360}deg, var(--color-muted, #e5e7eb) 0deg)`,
    } as React.CSSProperties;

    return (
      <div
        role="meter"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={1}
        aria-label={`${label ? `${label}: ` : ''}${percent} confidence (${styles.label.toLowerCase()})`}
        className={cn('relative inline-grid place-items-center rounded-full', className)}
        style={ringStyle}
      >
        <div
          className="absolute inset-0 grid place-items-center rounded-full bg-card text-card-foreground"
          style={{ margin: stroke }}
        >
          <span
            className="text-sm font-semibold tabular-nums"
            style={{ color: styles.color }}
          >
            {percent}
          </span>
        </div>
      </div>
    );
  }

  return (
    <span
      role="meter"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={1}
      aria-label={`${label ? `${label}: ` : ''}${percent} confidence (${styles.label.toLowerCase()})`}
      className={cn(
        'inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        styles.flat,
        className,
      )}
    >
      <span
        className="inline-block size-2 shrink-0 rounded-full"
        style={{ backgroundColor: styles.color }}
        aria-hidden="true"
      />
      {label && <span className="min-w-0 truncate text-foreground/80">{label}</span>}
      <span className="shrink-0 tabular-nums">{percent}</span>
    </span>
  );
}

export default ConfidenceScoreBadge;



/** A single ranked, scored result. */
export interface ScoredResult {
  /** Human-readable label (class name, detected object, token, …). */
  label: string;
  /** Confidence/relevance score in the inclusive range 0–1. */
  score: number;
}

/** Props for {@link ScoredResultBarList}. */
export interface ScoredResultBarListProps {
  /**
   * The scored results to render. Any ranked-output hook fits this contract:
   * `useClassify` / `useClassifyZeroShot` / `useDetectObjects` / `useFillMask`
   * / `useSemanticSearch`.
   */
  results: ScoredResult[];
  /**
   * When true, render staggered skeleton rows instead of results.
   * @default false
   */
  isLoading?: boolean;
  /**
   * Number of skeleton rows shown while loading.
   * @default 4
   */
  skeletonRows?: number;
  /**
   * Whether to highlight the top-ranked (first) row.
   * @default true
   */
  highlightTop?: boolean;
  /**
   * Whether to sort results by score (descending) before rendering. Set false
   * if the input is already ranked and you want to preserve its order.
   * @default true
   */
  sort?: boolean;
  /**
   * Maximum number of rows to render after sorting.
   */
  limit?: number;
  /**
   * Rendered when there are no results and the list is not loading.
   * @default "No results"
   */
  emptyState?: React.ReactNode;
  /** Additional class names merged onto the root element. */
  className?: string;
}

/**
 * A ranked vertical list of `{label, score}` pairs. Each row shows the label, a
 * formatted confidence percentage, and an animated horizontal fill bar
 * proportional to the 0–1 score, highlighting the top-ranked row. Includes a
 * skeleton-loading state and an empty-state slot so it drops straight into async
 * hook flows.
 *
 * One data contract serves every ranked-output hook — classification, zero-shot,
 * object detection, fill-mask, and semantic search.
 *
 * @example
 * ```tsx
 * const { results, isLoading } = useClassifyZeroShot({ model });
 * <ScoredResultBarList results={results ?? []} isLoading={isLoading} />
 * ```
 */
export function ScoredResultBarList({
  results,
  isLoading = false,
  skeletonRows = 4,
  highlightTop = true,
  sort = true,
  limit,
  emptyState = 'No results',
  className,
}: ScoredResultBarListProps) {
  if (isLoading) {
    return (
      <div className={cn('flex flex-col gap-2', className)} aria-busy="true">
        {Array.from({ length: skeletonRows }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-md bg-muted"
            style={{
              height: 36,
              opacity: 1 - i * (0.6 / Math.max(1, skeletonRows)),
            }}
          />
        ))}
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div
        className={cn(
          'rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground',
          className,
        )}
      >
        {emptyState}
      </div>
    );
  }

  const ranked = sort
    ? [...results].sort((a, b) => b.score - a.score)
    : results;
  const rows = typeof limit === 'number' ? ranked.slice(0, limit) : ranked;
  const max = Math.max(...rows.map((r) => r.score), 0.0001);

  return (
    <ol className={cn('flex flex-col gap-2', className)}>
      {rows.map((result, i) => {
        const isTop = highlightTop && i === 0;
        const fill = Math.min(1, Math.max(0, result.score / max));
        return (
          <li
            key={`${result.label}-${i}`}
            className={cn(
              'group relative overflow-hidden rounded-md border px-3 py-2 transition-colors',
              isTop
                ? 'border-primary/40 bg-primary/5'
                : 'border-border bg-card',
            )}
          >
            {/* Proportional fill bar (background). */}
            <div
              aria-hidden="true"
              className={cn(
                'absolute inset-y-0 left-0 transition-[width] duration-500 ease-out',
                isTop ? 'bg-primary/15' : 'bg-muted',
              )}
              style={{ width: `${fill * 100}%` }}
            />
            <div className="relative flex items-center justify-between gap-3">
              <span
                className={cn(
                  'min-w-0 flex-1 truncate text-sm',
                  isTop ? 'font-semibold text-foreground' : 'text-foreground/90',
                )}
              >
                {result.label}
              </span>
              <ConfidenceScoreBadge score={result.score} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default ScoredResultBarList;
