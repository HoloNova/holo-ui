# Agent Screen

**Category**: Layout  
**Source**: https://www.beautifului.dev/#agent-screen  
**Tags**: agent screen, computer use, virtual desktop, browser sandbox, screen recording, gui agent

## Description
Simulated computer / browser viewport demonstrating an agent interacting with external web tools and apps. Features:
- Exact 2964 / 1856 aspect ratio container replicating standard retina displays
- Browser chrome toolbar: back/forward buttons, URL location bar, status indicator
- Inset screen area showing the webpage or application being manipulated
- Simulated agent mouse cursor overlay (`.agent-cursor`) showing click and scroll actions
- Hover zoom / lift elevation transition

## Dependencies
- `shared/base.css` — `.agent-cursor` styles and elevation shadows
- Tailwind CSS v4 — aspect ratio and container classes

## Customization
- Replace screenshot content inside the viewport with an `<iframe>` or dynamic canvas
- Animate cursor coordinates `(x, y)` using CSS translate or Web Animations API to simulate agent clicks
