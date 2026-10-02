"use client";

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Inlined cn utility ---

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


// --- Inlined sibling: @/components/option-list ---


/** A single selectable option. */
export interface Option {
  /** Stable identifier emitted on select. */
  id: string;
  /** Visible label. */
  label: string;
  /** Optional secondary description. */
  description?: string;
}

/** Props for {@link OptionList}. */
export interface OptionListProps {
  /** The choices to present. Lists longer than `pageSize` paginate. */
  options: Option[];
  /** Fired with the chosen option when the user selects one. */
  onSelect: (option: Option) => void;
  /**
   * Maximum options shown per page before paginating.
   * @default 6
   */
  pageSize?: number;
  /** Optional prompt rendered above the choices. */
  prompt?: string;
  /** Currently selected option id (renders that option as active). */
  selectedId?: string;
  /** Disable interaction (e.g. while the agent is thinking). */
  disabled?: boolean;
  /** Additional class names merged onto the root element. */
  className?: string;
}

/**
 * An inline multi-choice selection list presented in a chat / agent turn for
 * the user to pick from — distinct from quick-reply suggestion chips. It shows
 * up to `pageSize` (5–7) options at a time and paginates longer lists. The
 * choice is meant to feed back into a local agent inquiry loop (e.g.
 * human-in-the-loop disambiguation in `useAgent`).
 *
 * Presentational only — styled with shadcn/ui CSS variables.
 *
 * @example
 * ```tsx
 * <OptionList
 *   prompt="Which file did you mean?"
 *   options={candidates}
 *   onSelect={(opt) => resumeAgent(opt.id)}
 * />
 * ```
 */
export function OptionList({
  options,
  onSelect,
  pageSize = 6,
  prompt,
  selectedId,
  disabled = false,
  className,
}: OptionListProps) {
  const [page, setPage] = useState(0);

  const pageCount = Math.max(1, Math.ceil(options.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const start = safePage * pageSize;
  const visible = options.slice(start, start + pageSize);

  return (
    <div
      role="group"
      aria-label={prompt ?? 'Options'}
      className={cn(
        'flex w-full flex-col gap-2 rounded-lg border border-border bg-card p-3',
        className,
      )}
    >
      {prompt && <p className="text-sm font-medium">{prompt}</p>}

      <ul className="flex flex-col gap-1.5">
        {visible.map((option, index) => {
          const active = option.id === selectedId;
          return (
            <li key={option.id}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelect(option)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-md border px-3 py-2 text-left text-sm transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50',
                  active
                    ? 'border-border border-l-2 border-l-primary bg-accent font-medium'
                    : 'border-border hover:bg-accent',
                )}
              >
                <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-border text-xs text-muted-foreground">
                  {start + index + 1}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="break-words font-medium [overflow-wrap:anywhere]">{option.label}</span>
                  {option.description && (
                    <span className="break-words text-xs text-muted-foreground [overflow-wrap:anywhere]">
                      {option.description}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {pageCount > 1 && (
        <div className="mt-1 flex items-center justify-between border-t border-border pt-2 text-xs text-muted-foreground">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:text-foreground disabled:opacity-40"
          >
            <ChevronLeft className="size-3.5" />
            Prev
          </button>
          <span>
            {safePage + 1} / {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={safePage === pageCount - 1}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:text-foreground disabled:opacity-40"
          >
            Next
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default OptionList;



/** The default assistant system prompt. */
export const DEFAULT_SYSTEM_PROMPT = 'You are a helpful assistant.';

/** One selectable system-prompt preset. */
export interface SystemPromptPreset {
  /** Stable preset identifier. */
  id: string;
  /** Short visible label. */
  label: string;
  /** One-line description shown under the label. */
  description: string;
  /** The full system prompt applied on selection. */
  prompt: string;
}

/** Built-in presets — the default assistant prompt plus three focused modes. */
export const SYSTEM_PROMPT_PRESETS: readonly SystemPromptPreset[] = [
  {
    id: 'default',
    label: 'Helpful assistant',
    description: 'Balanced, general-purpose default',
    prompt: DEFAULT_SYSTEM_PROMPT,
  },
  {
    id: 'concise',
    label: 'Concise answers',
    description: 'Short, direct replies, no filler',
    prompt:
      'You are a helpful assistant. Keep every answer short and direct, at most three sentences unless the user explicitly asks for more detail.',
  },
  {
    id: 'coding',
    label: 'Coding assistant',
    description: 'Code-first answers with working examples',
    prompt:
      'You are an expert programming assistant. Answer with working, runnable code examples first, then a brief explanation. Prefer modern idioms and point out pitfalls.',
  },
  {
    id: 'teacher',
    label: 'Step-by-step teacher',
    description: 'Patient explanations that build up from basics',
    prompt:
      'You are a patient teacher. Explain concepts step by step, starting from first principles, using simple language and one concrete example per concept. Check understanding before moving on.',
  },
];

/** Props for {@link SystemPromptEditor}. */
export interface SystemPromptEditorProps {
  /** The current system prompt (controlled). */
  value: string;
  /** Fired with the new prompt on every edit or preset selection. */
  onChange: (value: string) => void;
  /**
   * Accessible name for the textarea, applied as its `aria-label` so the
   * control has a programmatic name independent of the visible heading.
   * @default "System prompt"
   */
  ariaLabel?: string;
}

/**
 * A controlled system-prompt editor with quick-pick presets. Selecting a preset
 * replaces the textarea value; free-form edits that match no preset simply
 * deselect all presets. The exported {@link SYSTEM_PROMPT_PRESETS} and
 * {@link DEFAULT_SYSTEM_PROMPT} are the built-in quick-picks.
 *
 * Purely presentational (value in, `onChange` out) — persistence and model
 * wiring stay in the consumer. Composes the `option-list` primitive and is
 * styled with shadcn/ui CSS variables.
 *
 * @example
 * ```tsx
 * const [prompt, setPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
 * <SystemPromptEditor value={prompt} onChange={setPrompt} />
 * ```
 */
export function SystemPromptEditor({
  value,
  onChange,
  ariaLabel = 'System prompt',
}: SystemPromptEditorProps) {
  const presetOptions: Option[] = SYSTEM_PROMPT_PRESETS.map((preset) => ({
    id: preset.id,
    label: preset.label,
    description: preset.description,
  }));

  // A preset is "active" only while the textarea matches it exactly.
  const selectedId = SYSTEM_PROMPT_PRESETS.find((preset) => preset.prompt === value)?.id;

  const handlePresetSelect = (option: Option) => {
    const preset = SYSTEM_PROMPT_PRESETS.find((p) => p.id === option.id);
    if (preset) onChange(preset.prompt);
  };

  return (
    <div className="flex w-full flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">System prompt</span>
        <textarea
          value={value}
          aria-label={ariaLabel}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder={DEFAULT_SYSTEM_PROMPT}
          spellCheck={false}
          className="min-h-24 w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </label>
      <OptionList
        prompt="Presets"
        options={presetOptions}
        selectedId={selectedId}
        onSelect={handlePresetSelect}
      />
    </div>
  );
}

export default SystemPromptEditor;
