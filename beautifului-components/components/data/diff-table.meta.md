# Diff Table

**Category**: Data  
**Source**: https://www.beautifului.dev/#diff-table  
**Tags**: diff, table, comparison, code, changes, git

## Description
Diff Table renders a side-by-side or unified code diff view with clear visual distinction between added, removed, and unchanged lines. A filename header bar anchors the diff to its source file, and sequential line numbers aid navigation. The component is styled to match common code review conventions (green for additions, red for deletions).

## Dependencies
- `shared/base.css` — for CSS variables + animations
- Tailwind CSS v4

## Key Features
- Line numbers column with monospace font for easy reference
- Added lines highlighted with green background (`bg-green-tint`)
- Removed lines highlighted with red background (`bg-red-tint`)
- Unchanged context lines in neutral surface color
- Filename header bar identifying the diffed file

## Customization
- **Diff mode**: switch between unified (`+`/`-` prefixes in a single column) and split (two-column) layout by restructuring the table columns.
- **Line highlight intensity**: adjust opacity of `bg-green-tint` / `bg-red-tint` with Tailwind opacity modifiers (`bg-green-tint/60`) for a subtler look.
- **Syntax highlighting**: wrap line content in a `<code>` element and apply a highlight.js or Prism theme for colored tokens:
  ```html
  <code class="language-tsx">const x = 1;</code>
  ```

## Use Cases
- Code review interfaces showing AI-suggested edits
- Before/after comparison panels in refactoring or migration tools
- Git diff viewers embedded in developer dashboards
