# Prompt Bar

**Category**: Input  
**Source**: https://www.beautifului.dev/#prompt-bar  
**Tags**: prompt, input, bar, ai-input, send, textarea

## Description
Prompt Bar is a floating, pill-shaped input bar designed for AI prompt entry. It features an auto-expanding textarea that grows with the user's text, a send button that activates only when content is present, and secondary action buttons for file attachment and voice input. The subtle rounded design blends cleanly into any chat or assistant interface.

## Dependencies
- `shared/base.css` — for CSS variables + animations
- Tailwind CSS v4

## Key Features
- Auto-expanding textarea (grows vertically as the user types)
- Send button transitions from disabled/muted to active when text is present
- Attach file button with icon affordance
- Voice input button with microphone icon
- Rounded pill design using `rounded-control` / `bg-field` tokens

## Customization
- **Send button activation**: toggle `opacity-40 pointer-events-none` on the send button via JS when the textarea is empty:
  ```js
  textarea.addEventListener('input', () => {
    sendBtn.classList.toggle('opacity-40', !textarea.value.trim());
  });
  ```
- **Placeholder text**: change the `placeholder` attribute to match your product's tone (e.g. `"Ask anything…"` vs `"Message AI…"`).
- **Button set**: add or remove icon buttons (e.g. emoji picker, image generation) by inserting additional `<button>` elements in the toolbar row.

## Use Cases
- Primary prompt input for AI chat assistants and copilots
- In-line query bar for search-augmented interfaces
- Command palette / slash-command entry field
