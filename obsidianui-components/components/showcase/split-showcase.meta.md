# Split Showcase

**Category**: showcase  
**Source**: https://www.obsidianui.dev/docs/split-showcase  
**Component ID**: `split-showcase`  
**File**: `split-showcase.snippet.tsx`  

## Technical Overview
Interactive partner/sponsor showcase component with two interactive partner cards separated by a dotted divider:
- Features outward spring shift on hover/focus (stiffness: 350, damping: 24, shift: -12px / +12px, scale: 0.98).
- Expanding rounded corners (transitions from joint half-rounded borders to full 32px squircle with elevation shadow).
- Apple-style transitions and smooth dotted divider fade-out when any card is active.
- Fully accessible with keyboard focus handlers, ARIA labels, and prefers-reduced-motion support.
- Tech Stack: React, Motion (motion/react), Tailwind CSS.

## Dependencies
- `motion`
- `clsx`
- `tailwind-merge`
- `react`

## Props
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| items | [SplitShowcaseItem, SplitShowcaseItem] \| SplitShowcaseItem[] | Vercel & Tracwell | Array of two items to display in the split showcase cards |
| className | string | - | Optional custom CSS class names for the showcase grid |
| children | ReactNode | - | Optional custom children to override the default split layout |
| compact | boolean | false | Compact mode with smaller padding and typography |

## Usage
```tsx
import { SplitShowcase } from './split-showcase.snippet';

export function Demo() {
  return (
    <SplitShowcase />
  );
}
```
