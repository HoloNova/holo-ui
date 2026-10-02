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

// --- Inlined sibling: @/components/voice-picker ---


/**
 * The minimal voice shape every variant consumes. Matches the `KokoroVoice`
 * contract from `@localmode/transformers` (29 English voices) but stays generic
 * so future multi-voice providers fit.
 */
export interface VoiceOption {
  /** Voice ID used in synthesis (e.g. `af_heart`). */
  id: string;
  /** Display name (e.g. `Heart`). */
  name: string;
  /** Speaker gender, used for the color-coded badge. */
  gender: 'female' | 'male';
  /** Language display label used to group voices (e.g. `American English`). */
  languageLabel: string;
}

/** Group voices by their `languageLabel`, preserving first-seen order. */
function groupByLanguage(voices: VoiceOption[]) {
  const groups = new Map<string, VoiceOption[]>();
  for (const voice of voices) {
    const list = groups.get(voice.languageLabel) ?? [];
    list.push(voice);
    groups.set(voice.languageLabel, list);
  }
  return [...groups.entries()];
}

const GENDER_GLYPH: Record<VoiceOption['gender'], string> = {
  female: '♀', // ♀
  male: '♂', // ♂
};

/** Props for {@link VoicePicker}. */
export interface VoicePickerProps {
  /** The voices to choose from. */
  voices: VoiceOption[];
  /** Currently selected voice id. */
  value?: string;
  /** Fired with the chosen voice id. */
  onValueChange?: (voiceId: string) => void;
  /** Disable the control. */
  disabled?: boolean;
  /** Accessible label. @default "Voice" */
  label?: string;
  /** Additional class names merged onto the root element. */
  className?: string;
}

/**
 * Compact, language-grouped `<select>` for TTS voice selection. Voices are
 * partitioned into `<optgroup>` by language, each option showing the voice name
 * plus a gender glyph. Emits the chosen voice id.
 *
 * @example
 * ```tsx
 * <VoicePicker voices={KOKORO_VOICES} value={voice} onValueChange={setVoice} />
 * ```
 */
export function VoicePicker({
  voices,
  value,
  onValueChange,
  disabled,
  label = 'Voice',
  className,
}: VoicePickerProps) {
  const groups = groupByLanguage(voices);

  return (
    <div className="relative inline-flex max-w-full">
      <select
        aria-label={label}
        value={value ?? ''}
        disabled={disabled}
        onChange={(e) => onValueChange?.(e.target.value)}
        className={cn(
          'h-9 min-w-0 max-w-full appearance-none rounded-md border border-input bg-background pl-3 pr-8 text-sm text-foreground shadow-xs outline-none',
          'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
          'disabled:pointer-events-none disabled:opacity-50',
          className,
        )}
      >
        {groups.map(([language, list]) => (
          <optgroup key={language} label={language}>
            {list.map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.name} {GENDER_GLYPH[voice.gender]}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}

/** Props for {@link VoiceCard}. */
export interface VoiceCardProps {
  /** The voice this card represents. */
  voice: VoiceOption;
  /** Whether this card is the selected voice. */
  selected?: boolean;
  /** Fired when the card body is clicked (selection). */
  onSelect?: (voiceId: string) => void;
  /**
   * Fired when the preview button is pressed. Receives the voice id; the app
   * synthesizes a local sample (e.g. via `useSynthesizeSpeech`). Omit to hide
   * the preview button.
   */
  onPreview?: (voiceId: string) => void;
  /** True while this voice's preview is being synthesized. */
  loading?: boolean;
  /** True while this voice's preview is playing (toggles to a stop affordance). */
  playing?: boolean;
  /** Additional class names merged onto the root element. */
  className?: string;
}

const GENDER_BADGE: Record<VoiceOption['gender'], string> = {
  female:
    'bg-pink-500/10 text-pink-700 dark:text-pink-400 ring-1 ring-inset ring-pink-500/20',
  male: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 ring-1 ring-inset ring-sky-500/20',
};

/**
 * A rich voice card: name, color-coded gender badge, monospace voice id, and a
 * circular play/stop preview button with a loading state. The card is a
 * non-interactive container holding two **distinct sibling buttons** — a
 * circular preview button (plays a locally-synthesized sample; wire `onPreview`
 * to `useSynthesizeSpeech`) and a selection button covering the name/id — so
 * there is no invalid interactive-element-nested-in-interactive-element ARIA.
 * The selection button carries `aria-pressed` to announce the selected state.
 */
export function VoiceCard({
  voice,
  selected,
  onSelect,
  onPreview,
  loading,
  playing,
  className,
}: VoiceCardProps) {
  return (
    <div
      data-selected={selected || undefined}
      className={cn(
        'flex items-center gap-3 rounded-lg border bg-card p-3 text-card-foreground transition-colors',
        'has-[button:hover]:bg-accent/50',
        selected
          ? 'border-transparent ring-2 ring-primary ring-offset-1 ring-offset-background'
          : 'border-border',
        className,
      )}
    >
      {onPreview && (
        <button
          type="button"
          aria-label={playing ? `Stop ${voice.name} preview` : `Preview ${voice.name}`}
          onClick={() => onPreview(voice.id)}
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-full transition-colors',
            'bg-primary text-primary-foreground hover:bg-primary/90',
            'disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
          )}
          disabled={loading}
        >
          {loading ? (
            <WaveformActivityBars active barCount={3} height={14} color="currentColor" />
          ) : playing ? (
            // Stop glyph
            <span className="block size-3 rounded-[2px] bg-current" />
          ) : (
            // Play glyph
            <span className="ml-0.5 block size-0 border-y-[6px] border-l-[10px] border-y-transparent border-l-current" />
          )}
        </button>
      )}

      <button
        type="button"
        aria-pressed={selected}
        aria-label={`Select ${voice.name}`}
        onClick={() => onSelect?.(voice.id)}
        className="flex min-w-0 flex-1 flex-col items-start gap-0.5 rounded-md text-left transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <span className="flex min-w-0 max-w-full items-center gap-2">
          <span className="min-w-0 truncate text-sm font-medium">{voice.name}</span>
          <span
            className={cn(
              'shrink-0 rounded-md px-1.5 py-0.5 text-xs font-medium capitalize',
              GENDER_BADGE[voice.gender],
            )}
          >
            {voice.gender}
          </span>
        </span>
        <code className="block min-w-0 max-w-full truncate text-xs text-muted-foreground" title={voice.id}>
          {voice.id}
        </code>
      </button>
    </div>
  );
}

/** Props for {@link VoiceGrid}. */
export interface VoiceGridProps {
  /** The voices to render as cards. */
  voices: VoiceOption[];
  /** Currently selected voice id. */
  value?: string;
  /** Fired when a card is selected. */
  onValueChange?: (voiceId: string) => void;
  /** Fired when a card's preview is pressed. */
  onPreview?: (voiceId: string) => void;
  /** The voice id currently synthesizing a preview. */
  loadingVoiceId?: string | null;
  /** The voice id currently playing a preview. */
  playingVoiceId?: string | null;
  /** When true, show a search box that filters voices by name / id. @default true */
  filterable?: boolean;
  /** Additional class names merged onto the root element. */
  className?: string;
}

/**
 * A language-grouped grid of {@link VoiceCard}s with an optional search box.
 * Each group shows a count header. Consumes the same `VoiceOption[]` contract
 * as {@link VoicePicker}; wire `onPreview` to `useSynthesizeSpeech` to let users
 * hear a voice before selecting.
 */
export function VoiceGrid({
  voices,
  value,
  onValueChange,
  onPreview,
  loadingVoiceId,
  playingVoiceId,
  filterable = true,
  className,
}: VoiceGridProps) {
  const [query, setQuery] = React.useState('');

  const filtered = query.trim()
    ? voices.filter((v) => {
        const q = query.toLowerCase();
        return v.name.toLowerCase().includes(q) || v.id.toLowerCase().includes(q);
      })
    : voices;

  const groups = groupByLanguage(filtered);

  return (
    <div className={cn('@container flex w-full flex-col gap-4', className)}>
      {filterable && (
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search voices…"
          aria-label="Search voices"
          className={cn(
            'h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none',
            'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
          )}
        />
      )}

      {groups.length === 0 && (
        <p className="text-sm text-muted-foreground">No voices match “{query}”.</p>
      )}

      {groups.map(([language, list]) => (
        <div key={language} className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {language}
            </h4>
            <span className="text-xs text-muted-foreground">{list.length}</span>
          </div>
          <div className="grid grid-cols-1 gap-2 @sm:grid-cols-2 @xl:grid-cols-3">
            {list.map((voice) => (
              <VoiceCard
                key={voice.id}
                voice={voice}
                selected={value === voice.id}
                onSelect={onValueChange}
                onPreview={onPreview}
                loading={loadingVoiceId === voice.id}
                playing={playingVoiceId === voice.id}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default VoicePicker;



/** One side of the A/B comparison. */
export interface ComparisonColumn {
  /** Currently selected voice id for this column. */
  voiceId?: string;
  /**
   * Synthesized audio for this column, or `null` before Compare runs. Pass a
   * local `Blob` (e.g. from `useSynthesizeSpeech`) or an object URL string.
   */
  audio?: Blob | string | null;
}

/** Props for {@link VoiceComparisonPanel}. */
export interface VoiceComparisonPanelProps {
  /** The voices available in both column pickers. */
  voices: VoiceOption[];
  /** State for column A. */
  columnA: ComparisonColumn;
  /** State for column B. */
  columnB: ComparisonColumn;
  /** Fired when column A's voice changes. */
  onVoiceAChange?: (voiceId: string) => void;
  /** Fired when column B's voice changes. */
  onVoiceBChange?: (voiceId: string) => void;
  /** The shared comparison text. */
  text: string;
  /** Fired when the shared text changes. */
  onTextChange?: (text: string) => void;
  /** Fired when Compare is clicked — synthesize both columns from `text`. */
  onCompare?: () => void;
  /** True while a comparison is synthesizing (disables Compare, shows loader). */
  loading?: boolean;
  /** Labels for the two columns. @default ["Voice A", "Voice B"] */
  labels?: [string, string];
  /** Additional class names merged onto the root element. */
  className?: string;
}

/** Resolve a Blob | string | null audio source to a stable playable URL. */
function useAudioSrc(audio: Blob | string | null | undefined) {
  // useObjectUrl creates/revokes the object URL for Blobs; strings pass through.
  const objectUrl = useObjectUrl(typeof audio === 'string' ? null : audio);
  return typeof audio === 'string' ? audio : objectUrl;
}

/** A single labeled comparison column: picker + native audio player. */
function Column({
  label,
  voices,
  voiceId,
  onVoiceChange,
  audio,
}: {
  label: string;
  voices: VoiceOption[];
  voiceId?: string;
  onVoiceChange?: (id: string) => void;
  audio?: Blob | string | null;
}) {
  const src = useAudioSrc(audio);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2 rounded-lg border border-border bg-card p-3">
      <span className="min-w-0 truncate text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <VoicePicker
        voices={voices}
        value={voiceId}
        onValueChange={onVoiceChange}
        label={`${label} voice`}
        className="w-full"
      />
      {src ? (
         
        <audio src={src} controls className="w-full" />
      ) : (
        <div className="flex h-10 items-center rounded-md border border-dashed border-border px-3 text-xs text-muted-foreground">
          No audio yet - run Compare.
        </div>
      )}
    </div>
  );
}

/**
 * A/B voice comparison: two labeled columns, each with a language-grouped voice
 * select and a native `<audio>` player (shown once audio is set), a shared
 * comparison textarea, and a Compare button with a loading state.
 *
 * Wire `onCompare` to synthesize the shared text through both voices (e.g. two
 * `useSynthesizeSpeech` calls) and pass the resulting Blobs back via
 * `columnA.audio` / `columnB.audio`.
 *
 * @example
 * ```tsx
 * <VoiceComparisonPanel
 *   voices={KOKORO_VOICES}
 *   columnA={{ voiceId: a, audio: audioA }}
 *   columnB={{ voiceId: b, audio: audioB }}
 *   onVoiceAChange={setA}
 *   onVoiceBChange={setB}
 *   text={text}
 *   onTextChange={setText}
 *   onCompare={compare}
 * />
 * ```
 */
export function VoiceComparisonPanel({
  voices,
  columnA,
  columnB,
  onVoiceAChange,
  onVoiceBChange,
  text,
  onTextChange,
  onCompare,
  loading,
  labels = ['Voice A', 'Voice B'],
  className,
}: VoiceComparisonPanelProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Column
          label={labels[0]}
          voices={voices}
          voiceId={columnA.voiceId}
          onVoiceChange={onVoiceAChange}
          audio={columnA.audio}
        />
        <Column
          label={labels[1]}
          voices={voices}
          voiceId={columnB.voiceId}
          onVoiceChange={onVoiceBChange}
          audio={columnB.audio}
        />
      </div>

      <textarea
        value={text}
        onChange={(e) => onTextChange?.(e.target.value)}
        rows={3}
        placeholder="Enter text to synthesize with both voices…"
        aria-label="Comparison text"
        className={cn(
          'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none',
          'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        )}
      />

      <button
        type="button"
        onClick={onCompare}
        disabled={loading || !text.trim()}
        className={cn(
          'inline-flex h-9 w-fit items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors',
          'hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50',
        )}
      >
        {loading && (
          <span
            className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
            aria-hidden="true"
          />
        )}
        Compare
      </button>
    </div>
  );
}

export default VoiceComparisonPanel;
