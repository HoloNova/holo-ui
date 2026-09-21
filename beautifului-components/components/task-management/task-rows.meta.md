# Task Rows

**Category**: Task Management  
**Source**: https://www.beautifului.dev/#task-rows  
**Tags**: tasks, status, running, completed, failed, agent, progress

## Description
Task Rows present live agent task status as an accordion-style list. Each row animates in via `fade-up` and shows a status badge — a green checkmark for Completed, a spinning arc counter for Running, or a red icon for Failed. Rows are expandable to reveal sub-task details connected by a vertical line connector.

## Dependencies
- `shared/base.css` — for CSS variables + animations
- Tailwind CSS v4

## Key Features
- Expandable row accordion with smooth height transition
- Status badge variants: Completed (green fill + checkmark), Running (spinning SVG circle with step counter), Failed (red icon)
- Sub-task details panel with vertical line connector
- Staggered `fade-up` entrance animation with per-row delay
- `pop-in` animation on the completion checkmark icon

## Customization
- **Stagger delay**: increase the `animation` delay on each row (e.g. `80ms`, `160ms`) to widen the stagger effect.
- **Border radius**: the inline `border-radius:22px` can be changed per design — set to `12px` for a more rectangular card feel.
- **Status colors**: swap `bg-green` / `bg-green-tint` with `bg-accent` / `bg-accent-tint` tokens to re-theme the completed state:
  ```html
  <span class="bg-accent-tint text-accent">Completed</span>
  ```

## Use Cases
- Live task-progress panels in AI agent dashboards
- Step-by-step workflow trackers for data pipelines
- Background job monitors showing running vs. completed operations
