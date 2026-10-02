"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Inlined cn utility ---

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
