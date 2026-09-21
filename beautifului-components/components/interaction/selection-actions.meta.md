# Selection Actions (Floating Toolbar)

**Category**: Interaction  
**Source**: https://www.beautifului.dev/#selection-actions  
**Tags**: selection, floating toolbar, context menu, text highlight, inline actions, tooltip, quick prompt

## Description
Floating toolbar that appears directly above selected text in a document or chat response. Features:
- Pill-shaped elevation shadow (`--shadow-overlay`)
- Action buttons: "Explain", "Rewrite", "Summarize", "Fix Grammar", "Copy"
- Animated entrance (`pop-in` animation)
- Arrow indicator pointing toward selected range

## Dependencies
- `shared/base.css` — `pop-in` animation, `--shadow-overlay`
- Tailwind CSS v4 — flex utilities, rounded pill styles

## Positioning Pattern with JavaScript
```javascript
document.addEventListener('selectionchange', () => {
  const selection = window.getSelection();
  const toolbar = document.querySelector('[data-selection-toolbar]');
  if (!selection || selection.isCollapsed) {
    toolbar.style.display = 'none';
    return;
  }
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  toolbar.style.display = 'flex';
  toolbar.style.top = `${window.scrollY + rect.top - toolbar.offsetHeight - 8}px`;
  toolbar.style.left = `${window.scrollX + rect.left + (rect.width - toolbar.offsetWidth) / 2}px`;
});
```
