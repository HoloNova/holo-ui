# Sidebar Nav

**Category**: Navigation  
**Source**: https://www.beautifului.dev/#sidebar-nav  
**Tags**: sidebar, navigation, nav, menu, collapsible, icon

## Description
Sidebar Nav is a collapsible application sidebar that smoothly transitions between an expanded label+icon view (208 px) and a compact icon-only rail (36 px). A workspace switcher sits at the top, and tooltips appear over icon buttons in the collapsed state to preserve discoverability. The component is fully keyboard accessible.

## Dependencies
- `shared/base.css` — for CSS variables + animations
- Tailwind CSS v4

## Key Features
- Smooth width collapse animation between 208 px (expanded) and 36 px (collapsed)
- Icon + label nav rows that hide labels gracefully on collapse
- Workspace switcher / account avatar at the top of the sidebar
- Tooltip on each icon in collapsed state for accessibility
- Keyboard-accessible focus states on all interactive elements

## Customization
- **Collapsed width**: change `36px` to `48px` in the inline style/JS for larger icon targets on touch devices.
- **Active item highlight**: mark the current route with `bg-hover text-ink` vs the default `text-ink-2`:
  ```html
  <a class="flex items-center gap-2.5 rounded-control px-2 py-1.5 bg-hover text-ink" aria-current="page">
    <!-- icon + label -->
  </a>
  ```
- **Bottom section**: add a footer group (settings, profile, logout) by pinning a second nav group with `mt-auto` to the bottom of the sidebar flex column.

## Use Cases
- Primary app navigation in SaaS dashboards and admin panels
- IDE-style tool sidebars where screen real-estate is at a premium
- Multi-section agent UIs where the sidebar surfaces workspaces and tools
