# Activity heatmap

**Category**: data  
**Source**: Docs and live preview: https://uiarc.dev/components/activity-heatmap  
**Component ID**: `activity-heatmap`  
**File**: `activity-heatmap.snippet.tsx`  

## Technical Overview
See a year of activity at a glance, one square per day.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Activityheatmap } from './activity-heatmap.snippet';

export function Demo() {
  return <Activityheatmap />;
}
```
