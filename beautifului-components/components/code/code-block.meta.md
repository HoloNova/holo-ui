# Code Block

**Category**: Code  
**Source**: https://www.beautifului.dev/#code-block  
**Tags**: code, syntax highlighting, snippet, dark theme, copy button, developer, terminal, pre

## Description
Polished dark-themed code viewer designed for code generation responses and developer tools. Features:
- Header bar with file path / language tag and one-click copy button
- Syntax token color highlights using inline OKLCH variables
- Fixed font styling with `JetBrains Mono` or monospace fallbacks
- Line numbers with muted colors
- Subtle hairline border with card elevation

## Dependencies
- `shared/base.css` — CSS color variables
- Tailwind CSS v4 — utility classes

## HTML Structure
```html
<div class="w-full max-w-105 overflow-hidden rounded-card bg-surface shadow-card">
  <!-- Header Bar -->
  <div class="flex items-center justify-between border-b border-line px-3 py-2">
    <span class="font-mono text-[12px] text-ink-2">example.ts</span>
    <button type="button" aria-label="Copy code" class="flex size-6 items-center justify-center rounded text-ink-3 hover:text-ink">
      <svg width="14" height="14">...</svg>
    </button>
  </div>
  <!-- Code Content -->
  <pre class="overflow-x-auto p-3 font-mono text-[12px] leading-relaxed"><code>...</code></pre>
</div>
```

## Integration with Shiki / Prism / Highlight.js
For live syntax highlighting, pass generated HTML directly into `<pre><code>` and preserve the container styling.
