# Flowchart

**Category**: Visualization  
**Source**: https://www.beautifului.dev/#flowchart  
**Tags**: flowchart, agent workflow, graph, nodes, edges, connectors, decision tree, canvas, diagram

## Description
Agent workflow diagram displaying sequential and branching execution paths. Features:
- Rounded card container with clean canvas grid
- Process nodes with status badges (active, completed, queued)
- Dynamic SVG connectors and directional arrows between nodes
- Floating zoom / pan toolbar controls
- Real-time step progress indicator

## Dependencies
- `shared/base.css` — CSS design variables and transition easings
- Tailwind CSS v4 — layout and typography

## Node Types
| Node Type | Style | Use Case |
|-----------|-------|----------|
| **Input / Trigger** | Outlined pill with icon | User prompt or event hook |
| **Agent Decision** | Card with status dot | Tool selection or LLM reasoning |
| **Tool Execution** | Inset card with mono label | External API or code execution |
| **Output / Result** | Filled accent card | Final synthesized response |

## Customization
- Replace static SVG connectors with dynamic paths calculated from DOM node bounding rects (`getBoundingClientRect`)
- Color active edges with `stroke: var(--accent)` and pulsing dashed line animation
