# Search (Command Palette)

**Category**: Input  
**Source**: https://www.beautifului.dev/#search  
**Tags**: search, command palette, spotlight, dialog, quick search, autocomplete, modal, shortcut

## Description
A spotlight-style quick search modal and command palette. Features:
- Trigger button with keyboard shortcut badge (`Cmd+K` / `Ctrl+K`)
- Modal dialog with clean translucent backdrop
- Search input with search icon, live clear button, and category filters
- Categorized result sections (Actions, Documents, Components)
- Keyboard navigation indicator (`Up/Down to navigate, Enter to select, Esc to close`)

## Dependencies
- `shared/base.css` — for CSS custom properties (`--canvas`, `--surface`, `--line`, `--ink`)
- Tailwind CSS v4 — utility classes

## HTML Structure
```html
<!-- Trigger Button -->
<button type="button" class="flex h-9 items-center gap-2 rounded-control bg-field px-3 text-ink-3 shadow-btn hover:bg-hover">
  <svg width="14" height="14">...</svg>
  <span class="text-[13px]">Search...</span>
  <kbd class="ml-auto rounded bg-surface px-1.5 py-0.5 text-[11px] text-ink-3">Cmd+K</kbd>
</button>

<!-- Modal Container (toggle visibility on open) -->
<div role="dialog" aria-modal="true" class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
  <!-- Backdrop -->
  <div class="fixed inset-0 bg-black/40 backdrop-blur-xs"></div>
  <!-- Dialog box -->
  <div class="relative w-full max-w-lg rounded-card bg-surface shadow-overlay">
    <!-- Search bar -->
    <div class="flex items-center gap-3 border-b border-line px-4 py-3">...</div>
    <!-- Results list -->
    <div class="max-h-80 overflow-y-auto p-2">...</div>
    <!-- Footer hints -->
    <div class="border-t border-line px-4 py-2 text-[11.5px] text-ink-3">...</div>
  </div>
</div>
```

## JavaScript Integration Example
```javascript
// Toggle modal with Cmd+K / Ctrl+K
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    openSearchModal();
  }
});
```

## Customization Tips
- Adjust max height: `max-h-96` or `max-h-80`
- Group items dynamically by mapping JSON records
- Highlight matching substring with `<mark class="bg-accent-tint text-accent font-medium">`
