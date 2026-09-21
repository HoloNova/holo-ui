# Apple Design System (HIG Core Guidelines and Tokens)

> **Official Authority**: [developer.apple.com/design](https://developer.apple.com/design/)  
> **Core Role**: Authoritative human-machine interaction specifications, spatial depth foundations, and parameterized token sets.  
> **Purpose in Vault**: Quantify the parameters behind Apple's design quality and provide them as anti-hallucination agent presets and production CSS tokens.

> [!CAUTION]
> **Agent Context Guard**  
> - **Code Generation Tasks**: Retrieve only [`PROMPT_PRESET.md`](./PROMPT_PRESET.md) (design constraints) or [`tokens/tokens.css`](./tokens/tokens.css) (CSS variables). Do not load `foundations/` or `resources/` in bulk into context.
> - **Knowledge Lookup Tasks**: Read only the specific topic file required.

---

## 1. Quick Navigation

| Target File | Purpose | Audience | Cost |
|:---|:---|:---:|:---:|
| [`PROMPT_PRESET.md`](./PROMPT_PRESET.md) | Agent Prompt Preset with non-negotiable HIG constraints | AI Agents | ~1.5KB |
| [`tokens/tokens.css`](./tokens/tokens.css) | Standalone CSS custom properties (colors, typography, radii, materials, spring physics) | Developers / Agents | ~4KB |
| [`foundations/typography.md`](./foundations/typography.md) | SF Pro type scale, tabular numbers, and semantic opacity levels | Reference | ~2KB |
| [`foundations/materials-and-vibrancy.md`](./foundations/materials-and-vibrancy.md) | Frosted glass blur, Liquid Glass, inner specular stroke, vibrancy | Reference | ~2KB |
| [`foundations/layout-and-touch.md`](./foundations/layout-and-touch.md) | 44pt hit target rule, 8pt spatial grid, continuous squircle geometry | Reference | ~2KB |
| [`foundations/motion-and-spring.md`](./foundations/motion-and-spring.md) | Physical spring curves, active scale-down feedback, reduced-motion rules | Reference | ~2KB |
| [`patterns/modals-and-sheets.md`](./patterns/modals-and-sheets.md) | Bottom sheet, action sheet, and alert decision trees | Reference | ~2KB |
| [`resources/official-downloads.md`](./resources/official-downloads.md) | Official Apple Figma/Sketch UI Kits, SF Symbols, and SF Fonts links | Reference | ~2KB |
| [`resources/wwdc-design-videos.md`](./resources/wwdc-design-videos.md) | Curated WWDC design sessions and core takeaways | Reference | ~2.5KB |
| [`resources/hig-component-index.md`](./resources/hig-component-index.md) | HIG 40+ component dictionary and interaction rules | Reference | ~3KB |

---

## 2. Core Tenets

```
                       +-------------------------+
                       |  Deference (Content)    |  -- UI recedes; content is hero
                       +------------+------------+
                                    |
                       +------------+------------+
                       |   Clarity (Legibility)  |  -- Strict scale; instant readability
                       +------------+------------+
                                    |
                       +------------+------------+
                       |    Depth (Spatial)      |  -- Translucent blur; physical springs
                       +-------------------------+
```

1. **Deference**:
   The interface never competes with content. Neutral backgrounds, translucent materials, and minimal decoration allow user data and tasks to take center stage.
2. **Clarity**:
   The system strictly enforces the San Francisco typography scale, 44pt minimum touch boundaries, and clear semantic opacity hierarchies (100%, 60%, 30%, 18%).
3. **Depth**:
   Carefully calibrated layer z-indices, frosted glass filters (`backdrop-filter`), inner specular highlights (`box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85)`), and damped spring physics bring tactile physical realism to digital interfaces.

---

## 3. Implementation Patterns

### Method A: Autonomous Agent Instruction
Inject [`PROMPT_PRESET.md`](./PROMPT_PRESET.md) into the agent's prompt to constrain code output to authentic Apple design standards.

### Method B: Standalone CSS Tokens
```html
<link rel="stylesheet" href="path/to/guidelines/apple-design/tokens/tokens.css">

<style>
  .apple-card {
    background: var(--apple-bg-primary);
    border-radius: var(--apple-radius-lg);
    box-shadow: var(--apple-shadow-md);
    padding: calc(var(--apple-spacing-unit) * 2);
    transition: transform var(--apple-duration-fast) var(--apple-ease-spring);
  }
  .apple-card:active {
    transform: scale(0.96);
  }
</style>
```
