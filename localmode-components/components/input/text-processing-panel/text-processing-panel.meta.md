# Text Processing Panel

### Description
A two-column (stacked on mobile) single-input → single-output NLP shell: labeled textarea + live word count + optional CharLimitIndicator on the left; a result pane (spinner / pre-wrap text / empty slot) with copy-with-feedback on the right; a run/cancel/clear toolbar; and an optional header slot. Layout-only — compatible with useSummarize/useTranslate/useFillMask/useAnswerQuestion/useGenerateText.

### Tokens
- scale: `region`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `content`
- runtime: `react`

### When to use
Use `text-processing-panel` when a two-column (stacked on mobile) single-input → single-output nlp shell: labeled textarea + live word count + optional charlimitindicator on the left; a result pane (spinner / pre-wrap text / empty slot) with copy-with-feedback on the right; a run/cancel/clear toolbar; and an optional header slot. layout-only — compatible with usesummarize/usetranslate/usefillmask/useanswerquestion/usegeneratetext.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
