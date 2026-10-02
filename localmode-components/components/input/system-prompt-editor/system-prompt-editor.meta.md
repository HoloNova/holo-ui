# System Prompt Editor

### Description
A controlled system-prompt editor (value in, onChange out) with quick-pick presets composed via the OptionList primitive: selecting a preset replaces the textarea value; free-form edits that match no preset deselect all presets. Exports SYSTEM_PROMPT_PRESETS and DEFAULT_SYSTEM_PROMPT. Presentational: persistence and model wiring stay in the consumer. Feeds useChat / useGenerateText systemPrompt.

### Tokens
- scale: `region`
- placement: `embedded`
- interaction: `input`
- lifecycle: `persistent`
- motion: `none`
- category: `composer`
- runtime: `react`

### When to use
Use `system-prompt-editor` when a controlled system-prompt editor (value in, onchange out) with quick-pick presets composed via the optionlist primitive: selecting a preset replaces the textarea value; free-form edits that match no preset deselect all presets. exports system_prompt_presets and default_system_prompt. presentational: persistence and model wiring stay in the consumer. feeds usechat / usegeneratetext systemprompt.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
