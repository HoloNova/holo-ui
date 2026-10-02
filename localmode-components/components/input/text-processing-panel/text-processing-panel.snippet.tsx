"use client";

import { Copy, Check, Loader2, X, Eraser } from "lucide-react";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useState, type ReactNode } from "react";

// --- Inlined cn utility ---

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


// --- Inlined sibling: @/registry/localmode/input-controls/char-limit-indicator/char-limit-indicator ---


/** Props for {@link CharLimitIndicator}. */
export interface CharLimitIndicatorProps {
  /** Current number of characters in the bound input. */
  charCount: number;
  /** Maximum allowed characters. The ring fills as `charCount` approaches it. */
  maxLength: number;
  /**
   * Diameter of the ring in pixels.
   * @default 28
   */
  size?: number;
  /**
   * Stroke width of the ring in pixels.
   * @default 3
   */
  strokeWidth?: number;
  /**
   * When true, render only the ring (hide the `n/MAX` counter).
   * @default false
   */
  ringOnly?: boolean;
  /** Additional class names merged onto the root element. */
  className?: string;
}

/**
 * A compact character-count display: a radial progress ring (percentage of the
 * limit consumed) paired with an `n/MAX` monospace counter. When `charCount`
 * exceeds `maxLength`, the counter and ring switch to the error color and the
 * ring renders the over-limit percentage (clamped to a full circle).
 *
 * The ring is a pure SVG implementation driven by shadcn/ui CSS-variable
 * colors (`text-primary`, `text-destructive`, `text-border`), so it inherits the
 * consumer's theme — no daisyUI, no canvas. Self-contained: it takes only
 * `charCount` and `maxLength` and derives the percentage internally, which lets
 * it drop in beside any length-bounded textarea or `PromptInput`.
 *
 * @example
 * ```tsx
 * <CharLimitIndicator charCount={value.length} maxLength={280} />
 * ```
 */
export function CharLimitIndicator({
  charCount,
  maxLength,
  size = 28,
  strokeWidth = 3,
  ringOnly = false,
  className,
}: CharLimitIndicatorProps) {
  const safeMax = maxLength > 0 ? maxLength : 1;
  const ratio = charCount / safeMax;
  const overLimit = charCount > maxLength;

  // Geometry: the visible arc length is `ratio` of the circumference, clamped to
  // a full circle so the over-limit state shows a complete (error-colored) ring.
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedRatio = Math.min(Math.max(ratio, 0), 1);
  const dashOffset = circumference * (1 - clampedRatio);

  const percent = Math.round(ratio * 100);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`${charCount} of ${maxLength} characters used`}
      className={cn(
        'inline-flex items-center gap-2 text-xs',
        className,
      )}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="text-border"
          stroke="currentColor"
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          stroke="currentColor"
          className={cn(
            'transition-[stroke-dashoffset] duration-200',
            overLimit ? 'text-destructive' : 'text-primary',
          )}
        />
      </svg>
      {!ringOnly && (
        <span
          className={cn(
            'font-mono tabular-nums',
            overLimit ? 'text-destructive' : 'text-muted-foreground',
          )}
        >
          {charCount}
          <span className="opacity-60">/{maxLength}</span>
        </span>
      )}
      <span className="sr-only">{percent}% of limit</span>
    </div>
  );
}

export default CharLimitIndicator;



/** Props for {@link TextProcessingPanel}. */
export interface TextProcessingPanelProps {
  /** Input text (controlled). */
  value: string;
  /** Fired with the new input text on every edit. */
  onChange: (value: string) => void;
  /** The processed result text (rendered pre-wrap in the result pane). */
  result?: string;
  /** Whether a run is in progress (shows a spinner in the result pane). */
  isProcessing?: boolean;
  /** Error message to surface under the result pane. */
  error?: string;
  /** Fired when the user activates Run. */
  onRun: () => void;
  /** Fired when the user activates Cancel during processing. */
  onCancel?: () => void;
  /** Fired when the user activates Clear (reset input + result). */
  onClear?: () => void;
  /** Label above the input column. */
  inputLabel?: string;
  /** Label above the result column. */
  resultLabel?: string;
  /** Placeholder for the input textarea. */
  placeholder?: string;
  /** When set, shows a {@link CharLimitIndicator} under the input. */
  maxLength?: number;
  /** Run button text. */
  runLabel?: string;
  /** Optional header slot rendered above the two columns (tab bar, mode picker, language selector). */
  header?: ReactNode;
  /** Content shown in the result pane when there is no result yet. */
  emptyState?: ReactNode;
  /** Additional class names merged onto the root element. */
  className?: string;
}

/** Count whitespace-delimited words in a string. */
function countWords(text: string) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/**
 * A two-column (stacked on mobile) single-input → single-output NLP shell. The
 * left column is a labeled textarea with a live word count and an optional
 * {@link CharLimitIndicator}; the right column is a result pane (spinner while
 * processing, pre-wrap text otherwise, or an empty slot) with a
 * copy-with-feedback button. A run / cancel / clear toolbar sits below, and an
 * optional `header` slot renders above both columns.
 *
 * Layout-only: own the inference in the consumer by wiring `onRun`/`onCancel`
 * to any text-in/text-out hook (`useSummarize` / `useTranslate` / `useFillMask`
 * / `useAnswerQuestion` / `useGenerateText`) and passing `result`/`isProcessing`
 * back in. Styled with shadcn/ui CSS variables.
 *
 * @example
 * ```tsx
 * const { data, isLoading, execute, cancel } = useSummarize({ model });
 * <TextProcessingPanel
 *   value={text}
 *   onChange={setText}
 *   result={data?.summary}
 *   isProcessing={isLoading}
 *   onRun={() => execute({ text })}
 *   onCancel={cancel}
 * />
 * ```
 */
export function TextProcessingPanel({
  value,
  onChange,
  result,
  isProcessing = false,
  error,
  onRun,
  onCancel,
  onClear,
  inputLabel = 'Input',
  resultLabel = 'Result',
  placeholder = 'Enter text to process…',
  maxLength,
  runLabel = 'Run',
  header,
  emptyState,
  className,
}: TextProcessingPanelProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const handleClear = () => {
    onChange('');
    onClear?.();
  };

  return (
    <div className={cn('@container flex w-full flex-col gap-4', className)}>
      {header && <div>{header}</div>}

      <div className="grid gap-4 @lg:grid-cols-2">
        {/* Input column */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{inputLabel}</span>
            <span className="text-xs text-muted-foreground">
              {countWords(value)} {countWords(value) === 1 ? 'word' : 'words'}
            </span>
          </div>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            aria-label={inputLabel}
            rows={8}
            className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
          {maxLength != null && (
            <div className="flex justify-end">
              <CharLimitIndicator charCount={value.length} maxLength={maxLength} />
            </div>
          )}
        </div>

        {/* Result column */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{resultLabel}</span>
            {result && !isProcessing && (
              <button
                type="button"
                onClick={copy}
                aria-label="Copy result"
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {copied ? (
                  <Check className="size-3.5 text-emerald-500" />
                ) : (
                  <Copy className="size-3.5" />
                )}
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>
          <div
            role="region"
            aria-live="polite"
            aria-busy={isProcessing}
            className="min-h-[12.5rem] rounded-md border border-border bg-muted/30 px-3 py-2 text-sm"
          >
            {isProcessing ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : result ? (
              <p className="whitespace-pre-wrap break-words">{result}</p>
            ) : (
              <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                {emptyState ?? 'Run to see the result here.'}
              </div>
            )}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        {isProcessing ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={!onCancel}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-4 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
          >
            <X className="size-4" />
            Cancel
          </button>
        ) : (
          <button
            type="button"
            onClick={onRun}
            disabled={!value.trim()}
            className="inline-flex h-8 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {runLabel}
          </button>
        )}
        <button
          type="button"
          onClick={handleClear}
          disabled={isProcessing || (!value && !result)}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          <Eraser className="size-4" />
          Clear
        </button>
      </div>
    </div>
  );
}

export default TextProcessingPanel;
