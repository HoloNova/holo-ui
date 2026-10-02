---
style_id: "localmode_edge_ai"
style_aliases: ["localmode-ui", "localmode", "local-first", "edge-ai", "on-device-ai"]
version: "1.0.0"
token_source: "./shared/base.css"
target_runtime: "agent-first"
primary_stack: "React + Tailwind CSS v4 + shadcn Tokens"
---

# Local-First & Edge AI Primitives Design Specification

> **AI Agent Context Guard**: High-density engineering contract for LocalMode components. Adhere strictly to the machine-checkable constraints below when generating DOM, state hooks, and CSS variables.

---

### 1. Hard Constraints (RFC 2119)

- **MUST** adopt standard shadcn / Tailwind CSS v4 CSS variables (`var(--background)`, `var(--foreground)`, `var(--card)`, `var(--border)`, `var(--primary)`, `var(--muted)`).
- **MUST** keep all presentational components stateless regarding model execution (render plain props, emit event callbacks).
- **MUST** gate local model downloads behind capability checks (`useCapabilities`, `device-badge`, `capability-gate`).
- **MUST** display token usage against explicit window boundaries (`context-usage-meter`) rather than unbounded progress.
- **MUST** isolate high-frequency audio or streaming state into dedicated visualizers (`waveform-activity-bars`, `response`) without full-page re-renders.
- **MUST** maintain accessible focus rings (`focus-visible:ring-1`) and semantic roles (`role="switch"`, `role="listbox"`).

---

### 2. Core Functional Pillars

1. **Hardware & Capability Awareness**:
   - WebGPU, WASM, OPFS, and IndexedDB capability probing without user prompts.
   - Storage quota and memory footprint meters.

2. **Edge Model Lifecycle**:
   - Model download progress, caching tables, and bandwidth estimates.
   - Provider fallback badges and local execution gates.

3. **Multimodal & Privacy-First Primitives**:
   - Real-time audio waveform activity bars and transcription cards.
   - Vision detection overlays, before/after image viewers, and mask canvases.
   - Differential privacy budget sliders and encrypted vault status badges.
