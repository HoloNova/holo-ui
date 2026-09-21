# Loading State

**Category**: AI States  
**Source**: https://www.beautifului.dev/#loading-state  
**Tags**: loading, animation, shimmer, pixel, status, spinner, ai

## Description
A pixel-grid loader that shows while the AI is processing. Features:
- 3×3 pixel grid with staggered `pixel-on` animation
- Shimmer text gradient animation on the status label
- Elapsed time counter (monospace, tabular nums)
- Multiple variants for different contexts

## Dependencies
- `shared/base.css` — for `pixel-on` and `shimmer-text` keyframes + CSS variables
- Tailwind CSS v4 — for utility classes

## Variants

| Variant | Description | Use when |
|---------|-------------|---------|
| **Drive** | 3×3 pixel grid (default) | General AI processing |
| **Dots** | 3 bouncing dots | Lighter, conversational contexts |
| **Orbit** | Circular orbit animation | Long-running tasks |
| **Surfer** | Wave-like animation | Streaming/search states |

## Code
See `loading-state.snippet.html` for the Drive variant (default).

## Customization

### Change the label text
```html
<!-- Replace "Churning" with any status text -->
<span ...>Thinking</span>
<span ...>Searching</span>
<span ...>Processing</span>
```

### Update elapsed time (JavaScript)
```javascript
const elapsed = document.querySelector('.loading-elapsed');
const start = Date.now();
const interval = setInterval(() => {
  const seconds = ((Date.now() - start) / 1000).toFixed(1);
  elapsed.textContent = `${seconds}s`;
}, 100);
// Stop: clearInterval(interval);
```

### Change animation speed
```html
<!-- Faster pixel animation -->
<span style="animation:pixel-on 400ms ease-in-out 90ms infinite">...</span>

<!-- Slower shimmer -->
<span style="...;animation:shimmer-text 2s linear infinite">...</span>
```

### Use without elapsed time
Simply remove the `<span class="font-mono ...">0.0s</span>` element.

## Accessibility
- `role="status"` on the container announces state changes to screen readers
- `aria-hidden="true"` on the visual pixel grid
- Consider adding `aria-label="Loading, 3 seconds elapsed"` for better a11y

## Dark Mode
Works automatically — pixel colors use `var(--ink)` which adapts to dark/light theme.
