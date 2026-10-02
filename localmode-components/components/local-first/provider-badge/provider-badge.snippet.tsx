"use client";

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Inlined cn utility ---

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


// --- Inlined sibling: @/components/provider-fallback-badge ---



/** Provider tier surfaced by the badge. */
export type ProviderTier = 'built-in' | 'download';

/** Props for {@link ProviderFallbackBadge}. */
export interface ProviderFallbackBadgeProps {
  /**
   * Active provider tier: a zero-download built-in (e.g. Chrome AI) vs a
   * model-download provider (e.g. Transformers.js).
   */
  tier: ProviderTier;
  /** Provider display name (e.g. "Chrome AI", "Transformers.js"). */
  providerName?: string;
  /**
   * Override the cross-origin-isolation flag. When omitted the badge reads
   * `useCapabilities` (and falls back to `globalThis.crossOriginIsolated`).
   */
  crossOriginIsolated?: boolean;
  /** Hide the threading sub-badge. @default false */
  hideThreading?: boolean;
  /** Additional class names merged onto the root element. */
  className?: string;
}

/**
 * Surfaces the active AI backend tier — a zero-download built-in (Chrome AI)
 * vs a model-download provider (Transformers.js) — plus a WASM threading variant
 * ("Multi-thread" when cross-origin isolated / SharedArrayBuffer is available,
 * else "Single-thread"). A software-side sibling to `DeviceBadge`.
 *
 * @example
 * ```tsx
 * <ProviderFallbackBadge tier="download" providerName="Transformers.js" />
 * ```
 */
export function ProviderFallbackBadge({
  tier,
  providerName,
  crossOriginIsolated,
  hideThreading = false,
  className,
}: ProviderFallbackBadgeProps) {
  const { capabilities } = useCapabilities();

  const coi =
    crossOriginIsolated ??
    (capabilities
      ? capabilities.features.crossOriginisolated
      : typeof globalThis !== 'undefined'
        ? Boolean((globalThis as { crossOriginIsolated?: boolean }).crossOriginIsolated)
        : false);

  const isBuiltIn = tier === 'built-in';
  const name = providerName ?? (isBuiltIn ? 'Built-in AI' : 'Download provider');

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
          isBuiltIn
            ? 'border-primary/40 bg-primary/5 text-primary'
            : 'border-border bg-card text-card-foreground',
        )}
      >
        {isBuiltIn ? (
          <Cloud className="size-3.5" aria-hidden="true" />
        ) : (
          <Download className="size-3.5" aria-hidden="true" />
        )}
        {name}
      </span>
      {!hideThreading && (
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
          <Cpu className="size-3.5" aria-hidden="true" />
          {coi ? 'Multi-thread' : 'Single-thread'}
        </span>
      )}
    </div>
  );
}

export default ProviderFallbackBadge;



/** Provider tier — a zero-download built-in vs a model-download provider. */
export type ProviderTier = 'built-in' | 'download';

/** Props for {@link ProviderBadge}. */
export interface ProviderBadgeProps {
  /** Resolved provider display name, or null while resolution is pending. */
  providerName: string | null;
  /** The resolved provider's tier (drives the composed fallback badge). */
  tier: ProviderTier;
  /** The model id that actually served the most recent result, if any. */
  modelId: string | null;
  /** Optional note rendered after the badge (e.g. a provider disclaimer). */
  note?: string;
}

/**
 * Displays the RESOLVED provider identity — composing `ProviderFallbackBadge`
 * for the tier and name — alongside the model id that actually served the
 * request. While `providerName` is null it shows a "Resolving provider…"
 * placeholder, so the badge never claims a provider before one has resolved.
 *
 * Presentational — pass in the resolved provenance (e.g. from a provider
 * fallback resolver). Styled with shadcn/ui CSS variables so it inherits the
 * consumer's theme.
 *
 * @example
 * ```tsx
 * <ProviderBadge providerName="Chrome AI" tier="built-in" modelId="gemini-nano" />
 * ```
 */
export function ProviderBadge({ providerName, tier, modelId, note }: ProviderBadgeProps) {
  return (
    <div role="status" className="flex flex-wrap items-center gap-2 text-xs">
      {providerName ? (
        <ProviderFallbackBadge tier={tier} providerName={providerName} hideThreading />
      ) : (
        <span className="text-muted-foreground">Resolving provider…</span>
      )}
      {note && <span className="text-muted-foreground">{note}</span>}
      {modelId && (
        <span className="min-w-0 break-all font-mono text-[11px] text-muted-foreground">
          {modelId}
        </span>
      )}
    </div>
  );
}

export default ProviderBadge;
