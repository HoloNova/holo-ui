# Insight Cards

**Category**: Cards  
**Source**: https://www.beautifului.dev/#insight-cards  
**Tags**: insight, metric, chart, graph, sparkline, tooltip, crosshair, analytics, statistics, kpi

## Description
Interactive analytics insight card for tracking agent or business metrics over time. Features:
- Metric headline with percentage delta badge (+18% green pill)
- Responsive SVG line chart with gradient fill under curve
- Vertical crosshair cursor following pointer movements
- Floating tooltip bubble showing exact timestamp and metric value
- Time interval filter buttons (Day, Week, Month)

## Dependencies
- `shared/base.css` — `.insight-chart-stage`, `.insight-chart-cursor`, `.insight-chart-tooltip`
- Tailwind CSS v4 — typography and utility styles

## CSS Classes Used (in `base.css`)
- `.insight-chart-stage` — Relative container with hidden overflow
- `.insight-chart-cursor` — 1px vertical guide tracking pointer
- `.insight-chart-tooltip-anchor` — Centers tooltip above cursor
- `.insight-chart-tooltip` — Dark pill with tabular numerals

## JavaScript Crosshair Pattern
```javascript
const stage = document.querySelector('.insight-chart-stage');
const cursor = document.querySelector('.insight-chart-cursor');
const tipAnchor = document.querySelector('.insight-chart-tooltip-anchor');

stage.addEventListener('mousemove', (e) => {
  const rect = stage.getBoundingClientRect();
  const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
  cursor.style.left = `${x}px`;
  tipAnchor.style.left = `${x}px`;
});
```
