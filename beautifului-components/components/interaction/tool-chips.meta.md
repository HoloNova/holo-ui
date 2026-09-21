# Tool Chips

**Category**: Interaction  
**Source**: https://www.beautifului.dev/#tool-chips  
**Tags**: chips, tool-calls, code, compact, agent, file-edit

## Description
Tool Chips display agent tool calls and code edits as compact, scannable chip rows. Each chip shows an action-type icon (edit, create, delete, search), a truncated file path or command in monospace, and a line-count or result badge. A collapsible expand/collapse toggle lets users hide or reveal the full chip list to keep the UI tidy.

## Dependencies
- `shared/base.css` — for CSS variables + animations
- Tailwind CSS v4

## Key Features
- Collapsible chip list with smooth grid-template-rows animation
- File path display in monospace with truncation for long paths
- Action type icon (edit / create / delete / search) per chip
- Line count / result count badge aligned to the right
- Expand/collapse toggle button with rotating chevron

## Customization
- **Chip background**: swap `bg-hover` with `bg-inset` or any surface token for a different chip fill.
- **Icon color**: the stroke uses `var(--ink-3)`; change to `var(--accent)` to highlight specific action types:
  ```html
  <svg stroke="var(--accent)" ...>
  ```
- **Animation speed**: adjust the `duration-300` on the grid wrapper to control how fast the list collapses.

## Use Cases
- Displaying the tool calls an AI agent made during a reasoning step
- Summarising file edits in a code-review or diff workflow
- Showing search / read operations alongside their results in a chat interface
