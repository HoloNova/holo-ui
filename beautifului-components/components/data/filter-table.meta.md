# Filter Table

**Category**: Data  
**Source**: https://www.beautifului.dev/#filter-table  
**Tags**: table, filter, search, status, badge, priority

## Description
Filter Table pairs a data table with a fully-featured toolbar for filtering and sorting records. The toolbar includes a text search input, filter dropdowns for status and priority, and a sort control. Status and priority values are rendered as color-coded badge pills, and rows highlight on hover for easy scanning.

## Dependencies
- `shared/base.css` — for CSS variables + animations
- Tailwind CSS v4

## Key Features
- Toolbar with filter dropdowns (status, priority) and a text search input
- Status badge pills: Todo (orange), In Progress (blue/accent), Done (green)
- Priority badge pills with distinct color coding per level
- Row hover states using `hover:bg-hover` for clear interactivity
- Sort control with ascending/descending column toggle

## Customization
- **Status color mapping**: adjust the badge color per status value:
  ```html
  <!-- Todo → orange, In Progress → accent, Done → green -->
  <span class="bg-orange-tint text-orange">Todo</span>
  <span class="bg-accent-tint text-accent">In Progress</span>
  <span class="bg-green-tint text-green">Done</span>
  ```
- **Filter logic**: hook the search input's `input` event and the dropdown `change` events to filter the underlying data array, then re-render rows.
- **Active filter count**: display a numeric badge on the Filter button when filters are applied to signal the current filter state to users.

## Use Cases
- Project or task management boards with status/priority filtering
- Issue trackers where users need to narrow down open bugs by priority
- Agent-generated data views that surface actionable items with status context
