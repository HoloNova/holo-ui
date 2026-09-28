# Hero section

**Category**: blocks  
**Source**: Use this as the first section of a landing page and replace the sample copy and data with your own. Events in the workflow preview are simulated.  
**Component ID**: `hero-section`  
**File**: `hero-section.snippet.tsx`  

## Technical Overview
Three full screen SaaS heroes: a live dashboard rising from the bottom edge over a drifting mesh, a workflow graph that routes sample events node by node, and editorial type over a mesh gradient.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Herosection } from './hero-section.snippet';

export function Demo() {
  return <Herosection />;
}
```
