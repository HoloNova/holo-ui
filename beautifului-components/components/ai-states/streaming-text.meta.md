# Streaming Text

**Category**: AI States  
**Source**: https://www.beautifului.dev/#streaming-text  
**Tags**: streaming, text, sources, follow-ups, chat, ai-response, cursor

## Description
Displays a streaming AI response with:
- Blinking cursor that disappears when done streaming
- Action toolbar (copy, retry, thumbs) revealed after streaming
- Collapsible sources list with site favicons
- Follow-up question suggestions

## Dependencies
- `shared/base.css` — for `caret-blink` and `fade-in` keyframes
- Tailwind CSS v4

## Streaming Implementation Pattern
```javascript
const textEl = document.querySelector('p.text-ink');
const cursor = document.querySelector('[style*="caret-blink"]');
const toolbar = document.querySelector('.mt-2.flex');

// During streaming: append text chunks
async function streamResponse(reader) {
  cursor.style.animation = 'none'; // disable blink while streaming
  for await (const chunk of reader) {
    textEl.insertBefore(document.createTextNode(chunk), cursor);
  }
  // Done streaming:
  cursor.remove();
  toolbar.style.opacity = '1';
  toolbar.style.pointerEvents = 'auto';
}
```

## Show/Hide Sections
```javascript
// Show action toolbar after streaming
toolbar.style.opacity = '1';
toolbar.style.pointerEvents = 'auto';

// Toggle sources list
const sourcesPanel = document.querySelector('.grid');
const isOpen = sourcesPanel.style.gridTemplateRows === '1fr';
sourcesPanel.style.gridTemplateRows = isOpen ? '0fr' : '1fr';
sourcesPanel.style.opacity = isOpen ? '0' : '1';
```

## Customization
- Replace follow-up button texts with relevant suggestions
- Add multiple source items in the sources list
- Show/hide the toolbar based on streaming state
