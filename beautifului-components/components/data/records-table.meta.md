# Records Table

**Category**: Data  
**Source**: https://www.beautifului.dev/#records-table  
**Tags**: table, records, data, sortable, selectable, airtable-like

## Description
Records Table is a full-featured, Airtable-style data grid designed for structured record management. It supports sticky headers, per-row checkbox selection, column sorting, and color-coded tag pills for categorical data. Company logo/name cells and footer aggregation rows (sum, average) make it suitable for rich business data displays.

## Dependencies
- `shared/base.css` — for CSS variables + animations
- Tailwind CSS v4

## Key Features
- Sticky header row that stays visible while scrolling vertically
- Row selection via checkboxes with "select all" in the header
- Column sorting with toggle indicators (asc/desc/none)
- Color-coded tag pills for categorical fields (status, priority, type)
- Footer row with aggregation calculations (sum, average, count)

## Customization
- **Column widths**: set fixed widths on `<th>` / `<td>` with `w-[120px]` or use `min-w-` utilities; add `resize-x overflow-auto` for drag-to-resize.
- **Tag pill colors**: map category values to token pairs:
  ```html
  <!-- active → green, inactive → red, pending → orange -->
  <span class="bg-green-tint text-green">Active</span>
  ```
- **Row density**: switch between compact (`py-1.5`), default (`py-2.5`), and comfortable (`py-4`) row padding to suit data density needs.

## Use Cases
- CRM or inventory dashboards displaying entity records
- AI-generated data tables surfaced inline in agent responses
- Admin panels for managing users, products, or orders with bulk-select actions
