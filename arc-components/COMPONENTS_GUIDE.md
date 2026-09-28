# Arc Components Composition & Selection Guide

### When to choose Arc (`arc_motion_primitives`)
- High-touch interactive web applications requiring tactile, physical spring feel.
- Interfaces that demand zero layout shift during asynchronous state changes (`useMorphWidth`).
- Modern AI agent dashboards and data visualizers that leverage OKLCH color palettes and accessible multi-series contrast.

### Cross-Style Harmonization
- **Pairing with Beautiful UI**: Use Arc's tactile buttons (`button`, `action-button`, `hold-to-confirm`) inside Beautiful UI data tables and prompt bars.
- **Pairing with Apple HIG**: Arc's spring physics (`bounce: 0.12`) naturally align with Apple HIG spring curves; map Arc surfaces to Apple Liquid Glass when embedding into macOS/iOS layouts.
- **Pairing with Rewamp UI**: Combine Arc's micro-controls (switches, segmented controls, number fields) with Rewamp UI's 3D fluid assistant orbs.
