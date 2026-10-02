"use client";

import * as React from "react";
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



/** The explicit push-to-talk state machine. */
export type VoiceButtonState =
  | 'idle'
  | 'recording'
  | 'processing'
  | 'success'
  | 'error';

/** Props for {@link VoiceButton}. */
export interface VoiceButtonProps {
  /**
   * The current state in the push-to-talk machine. Controlled by the app:
   * `idle → recording` on press, `processing` while Whisper runs, then
   * `success`/`error`.
   */
  state: VoiceButtonState;
  /** Fired when the user presses to start recording (from `idle`). */
  onStart?: () => void;
  /** Fired when the user releases / clicks to stop recording. */
  onStop?: () => void;
  /**
   * Live mic volume in `[0, 1]` for the in-button waveform during recording.
   * Wire it to `useVoiceRecorder().getVolume()` sampled in a
   * `requestAnimationFrame` loop (or any local `AnalyserNode` source).
   */
  volume?: number;
  /** Label shown next to the icon. Defaults to a state-appropriate string. */
  label?: string;
  /** Diameter in pixels. @default 56 */
  size?: number;
  /** Additional class names merged onto the root element. */
  className?: string;
}

const STATE_LABEL: Record<VoiceButtonState, string> = {
  idle: 'Hold to talk',
  recording: 'Recording… release to send',
  processing: 'Transcribing…',
  success: 'Done',
  error: 'Try again',
};

/**
 * A press-to-record / release-to-transcribe push-to-talk button with an
 * explicit visual state machine: `idle → recording` (animated pulse rings +
 * live waveform) `→ processing` (loader) `→ success`/`error`. Recording is the
 * app's job (`useVoiceRecorder` → `getUserMedia`/`MediaRecorder`); transcription
 * routes to local Whisper (`useTranscribe`). This component renders the state
 * and emits press/release events.
 *
 * @example
 * ```tsx
 * const recorder = useVoiceRecorder();
 * const stt = useTranscribe({ model });
 * <VoiceButton
 *   state={state}
 *   onStart={() => { setState('recording'); recorder.startRecording(); }}
 *   onStop={async () => {
 *     setState('processing');
 *     const blob = await recorder.stopRecording();
 *     const res = await stt.execute(blob!);
 *     setState(res ? 'success' : 'error');
 *   }}
 *   volume={micVolume}
 * />
 * ```
 */
export function VoiceButton({
  state,
  onStart,
  onStop,
  volume,
  label,
  size = 56,
  className,
}: VoiceButtonProps) {
  const isRecording = state === 'recording';
  const isBusy = state === 'processing';

  const handlePointerDown = () => {
    if (state === 'idle' || state === 'success' || state === 'error') onStart?.();
  };
  const handlePointerUp = () => {
    if (state === 'recording') onStop?.();
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (event.repeat) return;
    if (state === 'idle' || state === 'success' || state === 'error') {
      event.preventDefault();
      onStart?.();
    }
  };
  const handleKeyUp = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (state === 'recording') {
      event.preventDefault();
      onStop?.();
    }
  };

  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        {/* Pulse rings while recording */}
        {isRecording && (
          <>
            <span
              className="absolute inset-0 animate-ping rounded-full bg-destructive/30 motion-reduce:animate-none"
              aria-hidden="true"
            />
            <span
              className="absolute inset-0 rounded-full bg-destructive/20"
              aria-hidden="true"
            />
          </>
        )}

        <button
          type="button"
          aria-label={STATE_LABEL[state]}
          aria-pressed={isRecording}
          disabled={isBusy}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          className={cn(
            'relative flex size-full items-center justify-center rounded-full text-white transition-colors outline-none',
            'focus-visible:ring-[3px] focus-visible:ring-ring/50',
            state === 'idle' && 'bg-primary hover:bg-primary/90 text-primary-foreground',
            isRecording && 'bg-destructive',
            isBusy && 'bg-muted text-muted-foreground',
            state === 'success' && 'bg-emerald-600',
            state === 'error' && 'bg-destructive',
          )}
        >
          {isRecording ? (
            <WaveformActivityBars
              state="record"
              volume={volume}
              height={Math.round(size * 0.4)}
              barCount={4}
              color="currentColor"
            />
          ) : isBusy ? (
            <span
              className="size-5 animate-spin rounded-full border-2 border-current/30 border-t-current"
              aria-hidden="true"
            />
          ) : state === 'success' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : state === 'error' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            // Mic glyph
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3" />
            </svg>
          )}
        </button>
      </div>

      <span className="text-sm text-muted-foreground">{label ?? STATE_LABEL[state]}</span>
    </div>
  );
}

export default VoiceButton;
