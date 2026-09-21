# Recommendation Card

**Category**: Cards  
**Source**: https://www.beautifului.dev/#recommendation-card  
**Tags**: recommendation, card, suggestion, next-action, cta

## Description
Recommendation Cards surface actionable suggestions from the agent as visually distinct cards. Each card combines a themed icon, a concise title, and a short description, with a clear CTA button that drives the user toward the next action. Cards are displayed in a responsive grid so multiple suggestions can be compared side-by-side.

## Dependencies
- `shared/base.css` — for CSS variables + animations
- Tailwind CSS v4

## Key Features
- Icon + title + description layout with consistent vertical rhythm
- CTA button with hover state, linked to the suggested action
- Grid layout supporting 2–3 cards per row on wider viewports
- Hover state on the card surface with `bg-hover` transition
- Compact card footprint suitable for inline use inside chat threads

## Customization
- **Icon theme**: replace the icon with any SVG or emoji; wrap in a colored `bg-accent-tint` circle for a branded feel:
  ```html
  <span class="flex size-9 items-center justify-center rounded-full bg-accent-tint text-accent">
    <!-- your icon here -->
  </span>
  ```
- **CTA label**: change the button text dynamically based on the action type (e.g. "Generate", "Review", "Schedule").
- **Card count**: add or remove cards in the grid; use `grid-cols-2` vs `grid-cols-3` depending on available width.

## Use Cases
- Post-response "next steps" suggestions from an AI assistant
- Onboarding screens offering common starting actions
- Feature discovery cards highlighting available agent capabilities
