# Chat Composer

**Category**: Input  
**Source**: https://www.beautifului.dev/#chat-composer  
**Tags**: chat, composer, input, message, conversation, bubbles

## Description
Chat Composer is a full AI chat conversation interface combining a scrollable message thread with a sticky prompt input at the bottom. Messages are rendered as distinct bubbles — agent responses are left-aligned with an avatar indicator, while user messages are right-aligned with a contrasting background. The message area expands naturally as conversation grows.

## Dependencies
- `shared/base.css` — for CSS variables + animations
- Tailwind CSS v4

## Key Features
- Distinct agent vs. user message bubble styles with avatar indicators
- Scrollable conversation area with auto-scroll to latest message
- Expandable message content (long messages collapse with a "show more" toggle)
- Sticky prompt input bar pinned to the bottom of the container
- Clean timestamp and sender label rendering per bubble group

## Customization
- **Agent avatar**: replace the default icon placeholder with an `<img>` tag or custom SVG to match your brand:
  ```html
  <img src="/agent-avatar.png" class="size-7 rounded-full" alt="Agent" />
  ```
- **Bubble colors**: agent bubbles use `bg-surface` while user bubbles use `bg-accent`/`bg-inset`; swap these tokens to re-theme instantly.
- **Max width**: control bubble width with `max-w-[75%]` or `max-w-prose` on the bubble wrapper.

## Use Cases
- AI assistant chat interfaces embedded in web applications
- Customer support chat widgets with bot + human agents
- In-app pair-programming or code-review conversation threads
