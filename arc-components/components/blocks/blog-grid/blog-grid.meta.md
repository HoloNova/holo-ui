# Blog grid

**Category**: blocks  
**Source**: Use this as the index of a blog, journal or news page. Load posts from your CMS into blog-grid-data.ts or the posts prop, pass getHref to link each card to its article route, and keep category and page in your URL through the controlled props.  
**Component ID**: `blog-grid`  
**File**: `blog-grid.snippet.tsx`  

## Technical Overview
A blog index with a featured post, category filter, post cards, pagination and an in-place reader.
- Built with Framer Motion (`motion/react`) spring physics and OKLCH color dynamics.
- Zero layout shift during asynchronous status changes (`useMorphWidth`).
- Accessible touch boundaries, keyboard navigation, and prefers-reduced-motion fallback.

## Dependencies
- `motion`
- `react`

## Usage
```tsx
import { Bloggrid } from './blog-grid.snippet';

export function Demo() {
  return <Bloggrid />;
}
```
