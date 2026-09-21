# Thinking State

**Category**: AI States  
**Source**: https://www.beautifului.dev/#thinking-state  
**Tags**: thinking, expandable, traces, collapsible, ai, reasoning, accordion

## Description
Expandable component that reveals AI thinking traces. Features:
- Star sparkle icon on the left
- Shimmer gradient animation on 'Thinking' label
- Animated chevron that rotates on expand
- Vertical timeline line that grows as content reveals
- Smooth grid-template-rows animation for expand/collapse

## Dependencies
- `shared/base.css` — for `shimmer-text` keyframe + CSS variables
- Tailwind CSS v4 — for utility classes

## Variants
| Variant | Description |
|---------|-------------|
| **Steps** | Shows sequential tool call steps |
| **Reasoning** | Raw reasoning text chain |
| **Search** | Web search queries and results |
| **Coding** | Code generation steps |

## Key Animation Technique
The expand/collapse uses CSS `grid-template-rows` from `0fr` → `1fr`:
```javascript
// Expand
panel.style.gridTemplateRows = '1fr';
panel.style.opacity = '1';

// Collapse
panel.style.gridTemplateRows = '0fr';
panel.style.opacity = '0';
```
This avoids `max-height` hacks and produces smoother animations.

## Adding Step Items
```html
<div class="flex flex-col gap-1 py-1">
  <div class="flex items-start gap-2 py-0.5">
    <span class="mt-0.5 text-[12px] text-ink-3">Searching database...</span>
  </div>
  <div class="flex items-start gap-2 py-0.5">
    <span class="mt-0.5 text-[12px] text-ink-3">Found 12 results</span>
  </div>
</div>
```

## Customization
- Replace 'Thinking' with any label: 'Searching', 'Reasoning', 'Coding'
- Swap the star SVG for any 16×16 icon
- Change shimmer speed: `animation:shimmer-text 2s linear infinite`
