"use client";

import type { ReactNode } from "react";
import { useState } from "react";

// ── Scoped CSS & Styles Proxy ──
const ARC_HERO_SECTION_STYLES = `/* Shared shell for the three hero variants. Each variant adds its own module for its one idea. */
.arc-hero-section-hero { position: relative; container: hero / inline-size; overflow: clip; background: var(--background); color: var(--foreground); font-family: var(--font-body); letter-spacing: var(--tracking-body); }

.arc-hero-section-title { margin: 0; font-family: var(--font-display); font-size: clamp(2.25rem, 1.3rem + 4.4cqi, 4.5rem); font-weight: 500; letter-spacing: var(--tracking-display); line-height: var(--leading-display); text-wrap: balance; }
.arc-hero-section-description { margin: 0; color: var(--text-secondary); font-size: var(--text-lg); line-height: 1.5; text-wrap: pretty; }

@container hero (max-width: 560px) {
  .arc-hero-section-description { font-size: var(--text-base); }
}

/* The designed variants are one full screen each, edge to edge, like Hero signup. The small viewport unit keeps them from
   hiding under mobile browser bars. Your own content (HeroContent) keeps its natural height inside your page. */
.arc-hero-section-screen { width: 100%; min-height: 100vh; min-height: 100svh; }

/* Preview: the hero owns the whole frame; the design switch floats over its top edge as a small glass pill. */
.arc-hero-section-preview { position: relative; display: grid; width: 100%; min-height: 100vh; min-height: 100svh; }
.arc-hero-section-preview > .arc-hero-section-hero { min-height: inherit; }
.arc-hero-section-switcher {
  position: absolute; z-index: 20; top: var(--space-4); left: 50%; translate: -50% 0;
  display: flex; max-width: calc(100% - 2 * var(--space-4));
  border: 1px solid color-mix(in oklch, var(--foreground) 10%, transparent); border-radius: var(--radius-pill);
  background: color-mix(in oklch, var(--surface) 64%, transparent);
  -webkit-backdrop-filter: blur(18px) saturate(1.5); backdrop-filter: blur(18px) saturate(1.5);
  box-shadow: 0 1px 1px rgb(20 24 40 / .04), 0 10px 30px -12px rgb(20 24 40 / .22);
}
:global(:root[data-theme="dark"]) .arc-hero-section-switcher { border-color: color-mix(in oklch, var(--foreground) 14%, transparent); background: color-mix(in oklch, var(--surface) 58%, transparent); box-shadow: inset 0 1px 0 color-mix(in oklch, var(--foreground) 8%, transparent), 0 10px 30px -12px rgb(0 0 0 / .6); }
/* The segmented control drops its own well; the glass is its surface. */
.arc-hero-section-switcher .arc-hero-section-switch { border: 0; border-radius: var(--radius-pill); background: transparent; }
.arc-hero-section-switcher .arc-hero-section-switch :global(button) { border-radius: var(--radius-pill); }

.arc-hero-section-srOnly { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.arc-hero-section-inner { display: grid; max-width: 1200px; margin: 0 auto; padding: var(--space-24) var(--space-10); }
.arc-hero-section-copy { display: grid; grid-template-columns: minmax(0, 1fr); justify-items: center; gap: var(--space-5); max-width: 760px; margin: 0 auto; text-align: center; }
.arc-hero-section-title { max-width: 16ch; }
.arc-hero-section-description { max-width: 560px; }

.arc-hero-section-announcement { display: inline-flex; max-width: 100%; min-height: 32px; align-items: center; gap: 6px; border: 1px solid var(--border); border-radius: var(--radius-pill); padding: 4px var(--space-3); background: var(--surface); color: var(--text-secondary); font: inherit; font-size: var(--text-sm); text-align: left; text-decoration: none; cursor: pointer; transition: color var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard); }
.arc-hero-section-arrow { flex: none; transition: transform var(--duration-fast) var(--ease-standard); }

.arc-hero-section-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--space-3); margin-top: var(--space-3); }
.arc-hero-section-action { display: inline-flex; height: var(--control-height-md); align-items: center; justify-content: center; gap: var(--space-2); border: 1px solid transparent; border-radius: var(--radius-control); padding: 0 var(--space-5); font: inherit; font-size: var(--text-sm); font-weight: 500; text-decoration: none; white-space: nowrap; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: transform var(--duration-fast) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard), opacity var(--duration-fast) var(--ease-standard); }
.arc-hero-section-action:active { transform: scale(.97); }
.arc-hero-section-primary { background: var(--foreground); color: var(--background); }
.arc-hero-section-secondary { border-color: var(--border); background: var(--surface); color: var(--foreground); }
@media (hover: hover) and (pointer: fine) {
  .arc-hero-section-primary:hover { opacity: .9; }
  .arc-hero-section-secondary:hover { background: var(--surface-muted); }
  .arc-hero-section-announcement:hover { border-color: var(--border-strong); color: var(--foreground); }
  :is(.arc-hero-section-action, .arc-hero-section-announcement):hover .arc-hero-section-arrow { transform: translateX(2px); }
}

.arc-hero-section-install { display: flex; width: min(100%, 440px); height: var(--control-height-md); align-items: center; gap: var(--space-2); margin-top: var(--space-2); border: 1px solid var(--border); border-radius: var(--radius-control); padding: 0 var(--space-1) 0 var(--space-4); background: var(--surface); font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 13px; text-align: left; }
.arc-hero-section-prompt { color: var(--text-muted); }
.arc-hero-section-command { flex: 1; overflow: hidden; color: var(--foreground); font: inherit; text-overflow: ellipsis; white-space: nowrap; }

.arc-hero-section-meta { display: flex; flex-wrap: wrap; gap: var(--space-2) var(--space-5); margin: var(--space-4) 0 0; border-top: 1px solid var(--border-subtle); padding: var(--space-5) 0 0; color: var(--text-muted); font-size: var(--text-sm); list-style: none; }

.arc-hero-section-media { min-width: 0; }

.arc-hero-section-split .arc-hero-section-inner { grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr); align-items: center; gap: var(--space-12); }
.arc-hero-section-split .arc-hero-section-copy, .arc-hero-section-minimal .arc-hero-section-copy { justify-items: start; margin: 0; text-align: left; }
.arc-hero-section-split .arc-hero-section-actions, .arc-hero-section-minimal .arc-hero-section-actions { justify-content: flex-start; }
.arc-hero-section-minimal .arc-hero-section-copy { max-width: 860px; }

@container hero (max-width: 800px) {
  .arc-hero-section-split .arc-hero-section-inner { grid-template-columns: minmax(0, 1fr); gap: var(--space-10); }
}
@container hero (max-width: 560px) {
  .arc-hero-section-inner { padding: var(--space-16) var(--space-4); }
  .arc-hero-section-actions { width: 100%; }
  .arc-hero-section-action { flex: 1 1 auto; }
}

@media (prefers-reduced-motion: reduce) {
  .arc-hero-section-action, .arc-hero-section-announcement, .arc-hero-section-arrow { transition: none; }
  .arc-hero-section-action:active { transform: none; }
}

/* Buttons are Arc buttons; this only keeps them the height of the link actions beside them. */
.arc-hero-section-button { height: var(--control-height-md); min-height: var(--control-height-md); border-radius: var(--radius-control); font-size: var(--text-sm); }

/* The canvas fades in over its own CSS render once it has painted, so the first frame never flashes. */
.arc-hero-section-mesh { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.arc-hero-section-canvas { display: block; width: 100%; height: 100%; opacity: 0; transition: opacity var(--duration-considered, .48s) var(--ease-standard); }
.arc-hero-section-mesh[data-painted] .arc-hero-section-canvas { opacity: 1; }
@media (prefers-reduced-motion: reduce) { .arc-hero-section-canvas { transition: none; } }

/* Minimal: the mesh is the whole screen, and type does the rest. The copy sits in the optical centre; customers hold the bottom edge. */
.arc-hero-section-hero { isolation: isolate; display: grid; }
.arc-hero-section-mesh {
  --mesh-base: #f2ede7;
  --mesh-1: #bdd3ec; --mesh-2: #c3c6ff; --mesh-3: #ffd0b0; --mesh-4: #f6bfd6; --mesh-5: #cfe8dc; --mesh-6: #fff3dc;
  z-index: -1;
}
:global(:root[data-theme="dark"]) .arc-hero-section-mesh {
  --mesh-base: #09090f;
  --mesh-1: #0d3a47; --mesh-2: #2a2f86; --mesh-3: #5a2a3c; --mesh-4: #3a1f5a; --mesh-5: #7a3a22; --mesh-6: #12142c;
}
/* A theme-aware scrim keeps body text above 4.5:1 wherever the mesh drifts. */
.arc-hero-section-hero::after { content: ""; position: absolute; z-index: -1; inset: 0; background: linear-gradient(to bottom, transparent 40%, color-mix(in oklch, var(--background) 22%, transparent)); pointer-events: none; }

.arc-hero-section-inner { display: grid; box-sizing: border-box; width: 100%; max-width: 1320px; grid-template-rows: 1fr auto auto 1fr auto; gap: var(--space-10); margin: 0 auto; padding: clamp(88px, 12svh, 128px) var(--space-10) var(--space-10); }
.arc-hero-section-title { grid-row: 2; }
.arc-hero-section-row { grid-row: 3; }
.arc-hero-section-brands { grid-row: 5; }
.arc-hero-section-title { max-width: 14ch; font-size: clamp(2.75rem, 1rem + 7cqi, 7rem); letter-spacing: -.045em; line-height: 1; }
.arc-hero-section-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: var(--space-8) var(--space-16); }
.arc-hero-section-description { max-width: 520px; color: color-mix(in oklch, var(--foreground) 76%, transparent); }
.arc-hero-section-cta { display: grid; justify-items: end; gap: var(--space-3); }
.arc-hero-section-actions { display: flex; flex-wrap: wrap; gap: var(--space-3); }
.arc-hero-section-fine { margin: 0; color: color-mix(in oklch, var(--foreground) 62%, transparent); font-size: var(--text-sm); }

.arc-hero-section-brands { display: grid; gap: var(--space-5); border-top: 1px solid color-mix(in oklch, var(--foreground) 14%, transparent); padding-top: var(--space-6); }
.arc-hero-section-brands p { margin: 0; color: color-mix(in oklch, var(--foreground) 62%, transparent); font-size: var(--text-sm); }
.arc-hero-section-brands ul { display: flex; flex-wrap: wrap; justify-content: space-between; gap: var(--space-5) var(--space-8); margin: 0; padding: 0; list-style: none; }
.arc-hero-section-brands li { display: inline-flex; align-items: center; gap: 9px; color: color-mix(in oklch, var(--foreground) 78%, transparent); font-size: var(--text-lg); font-weight: 500; letter-spacing: -.02em; }
.arc-hero-section-brands i { width: 22px; height: 22px; background: currentColor; -webkit-mask-position: center; mask-position: center; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-size: contain; mask-size: contain; }

@container hero (max-width: 800px) {
  .arc-hero-section-row { grid-template-columns: minmax(0, 1fr); align-items: start; }
  .arc-hero-section-cta { justify-items: start; }
  .arc-hero-section-brands ul { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
@container hero (max-width: 560px) {
  .arc-hero-section-inner { gap: var(--space-6); padding: 80px var(--space-4) var(--space-6); }
  .arc-hero-section-actions { width: 100%; }
  .arc-hero-section-actions > * { flex: 1 1 auto; }
  .arc-hero-section-cta { width: 100%; }
  .arc-hero-section-brands ul { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-4) var(--space-3); }
  .arc-hero-section-brands li:nth-child(n + 7) { display: none; }
  .arc-hero-section-brands li { font-size: var(--text-base); }
  .arc-hero-section-brands i { width: 18px; height: 18px; }
}

/* Split, one full screen: the whole hero is a workflow canvas. A dot grid fills the screen, strongest behind the graph, and the
   copy sits on the quiet side of it. */
.arc-hero-section-hero {
  --dot: color-mix(in oklch, var(--foreground) 13%, transparent);
  --wire: color-mix(in oklch, var(--foreground) 17%, transparent);
  --node-shadow: 0 1px 1px rgb(20 24 40 / .04), 0 8px 24px -12px rgb(20 24 40 / .14);
  isolation: isolate;
  display: grid;
  align-items: center;
  background: color-mix(in oklch, var(--accent) 2%, var(--background));
}
:global(:root[data-theme="dark"]) .arc-hero-section-hero {
  --dot: color-mix(in oklch, var(--foreground) 17%, transparent);
  --wire: color-mix(in oklch, var(--foreground) 20%, transparent);
  --node-shadow: inset 0 1px 0 color-mix(in oklch, var(--foreground) 7%, transparent), 0 12px 32px -14px rgb(0 0 0 / .7);
}
.arc-hero-section-hero::before {
  content: ""; position: absolute; z-index: -1; inset: 0; pointer-events: none;
  background-image: radial-gradient(circle at 1px 1px, var(--dot) 1px, transparent 1.5px);
  background-size: 22px 22px;
  -webkit-mask-image: radial-gradient(70% 80% at 72% 52%, #000 30%, transparent 85%);
  mask-image: radial-gradient(70% 80% at 72% 52%, #000 30%, transparent 85%);
}

.arc-hero-section-inner { display: grid; box-sizing: border-box; width: 100%; max-width: 1320px; grid-template-columns: minmax(0, .92fr) minmax(0, 1fr); align-items: center; gap: var(--space-16); margin: 0 auto; padding: clamp(88px, 12svh, 120px) var(--space-10) var(--space-12); }

.arc-hero-section-copy { display: grid; justify-items: start; gap: var(--space-5); text-align: left; }
.arc-hero-section-title { max-width: 12ch; font-size: clamp(2.5rem, 1.2rem + 4.6cqi, 4.5rem); }
.arc-hero-section-description { max-width: 500px; }
.arc-hero-section-actions { display: flex; flex-wrap: wrap; gap: var(--space-3); margin-top: var(--space-3); }
.arc-hero-section-fine { margin: 0; color: var(--text-muted); font-size: var(--text-sm); }

/* The graph column: a small toolbar and the scaled graph under it. */
.arc-hero-section-canvas { display: grid; justify-items: center; gap: var(--space-4); min-width: 0; }
.arc-hero-section-toolbar { display: flex; width: min(100%, 640px); align-items: center; justify-content: space-between; gap: var(--space-3); }
.arc-hero-section-file { display: inline-flex; min-width: 0; align-items: center; gap: 8px; color: var(--text-secondary); font-family: var(--font-mono, ui-monospace, "SF Mono", Menlo, monospace); font-size: 13px; }
.arc-hero-section-live { width: 7px; height: 7px; flex: none; border-radius: 50%; background: var(--text-muted); transition: background-color var(--duration-standard) var(--ease-standard); }
.arc-hero-section-live[data-on] { background: var(--success); }

.arc-hero-section-stage { position: relative; width: min(100%, 640px); }
.arc-hero-section-graph { position: absolute; top: 0; left: 50%; translate: -50% 0; transform-origin: 50% 0; }
.arc-hero-section-edges { position: absolute; inset: 0; overflow: visible; }
.arc-hero-section-wire { fill: none; stroke: var(--wire); stroke-width: 1.25; }
.arc-hero-section-wire[data-skipped] { stroke-dasharray: 3 4; opacity: .7; }
.arc-hero-section-flow { fill: none; stroke: var(--accent); stroke-width: 1.75; stroke-linecap: round; }

/* A node: what the step is, what it found, and its state. The running step takes the accent. */
.arc-hero-section-node {
  position: absolute; display: flex; align-items: center; gap: 12px;
  border: 1px solid var(--border); border-radius: 14px; padding: 0 14px;
  background: var(--surface); box-shadow: var(--node-shadow);
  font-size: 13px; line-height: 1.3;
  transition: border-color var(--duration-standard) var(--ease-standard), opacity var(--duration-standard) var(--ease-standard), background-color var(--duration-standard) var(--ease-standard);
}
.arc-hero-section-node[data-status="running"] { border-color: color-mix(in oklch, var(--accent) 70%, var(--border)); background: color-mix(in oklch, var(--accent) 4%, var(--surface)); }
.arc-hero-section-node[data-status="skipped"] { opacity: .5; box-shadow: none; }
.arc-hero-section-icon { display: grid; width: 20px; height: 20px; flex: none; place-items: center; }
.arc-hero-section-logo { width: 18px; height: 18px; background: center / contain no-repeat; }
.arc-hero-section-glyph { color: var(--text-secondary); }
.arc-hero-section-text { display: grid; flex: 1; min-width: 0; }
.arc-hero-section-text strong { overflow: hidden; font-weight: 500; text-overflow: ellipsis; white-space: nowrap; }
.arc-hero-section-text small { overflow: hidden; color: var(--text-muted); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.arc-hero-section-state { display: grid; flex: none; justify-items: end; }
.arc-hero-section-stateInner { display: inline-flex; align-items: center; gap: 6px; }
.arc-hero-section-meta { color: var(--text-muted); font-size: 12px; font-variant-numeric: tabular-nums; }
.arc-hero-section-check { color: var(--success); }
.arc-hero-section-skip { color: var(--text-muted); }
.arc-hero-section-pending { display: block; width: 10px; height: 10px; border: 1.5px solid var(--wire); border-radius: 50%; }
.arc-hero-section-spinner { display: block; width: 13px; height: 13px; flex: none; border: 1.5px solid color-mix(in oklch, var(--accent) 22%, transparent); border-top-color: var(--accent); border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { rotate: 360deg; } }

/* Compact nodes on a phone: icon and state on top, the name and its result under them. */
.arc-hero-section-node[data-compact] { display: grid; grid-template-columns: 1fr auto; grid-template-rows: auto auto; align-content: center; gap: 8px 4px; padding: 0 14px; }
@container hero (max-width: 560px) { .arc-hero-section-node[data-compact] { gap: 6px 4px; padding: 0 10px; } }
.arc-hero-section-node[data-compact] .arc-hero-section-text { grid-column: 1 / -1; }
.arc-hero-section-node[data-compact] .arc-hero-section-state { grid-column: 2; grid-row: 1; }

/* The run summary under the graph. */
.arc-hero-section-summary { position: absolute; left: 0; display: flex; height: 44px; align-items: center; justify-content: space-between; gap: 12px; border-top: 1px solid var(--border-subtle); padding: 0 2px; color: var(--text-muted); font-size: 13px; }
.arc-hero-section-event { display: inline-flex; align-items: center; gap: 12px; }
.arc-hero-section-event code { border: 1px solid var(--border-subtle); border-radius: 6px; padding: 1px 7px; background: var(--surface); color: var(--text-secondary); font-family: var(--font-mono, ui-monospace, "SF Mono", Menlo, monospace); font-size: 12px; }
.arc-hero-section-num { font-variant-numeric: tabular-nums; }
.arc-hero-section-result { display: inline-flex; align-items: center; gap: 7px; }
.arc-hero-section-result[data-done] { color: var(--foreground); }
.arc-hero-section-result[data-done] svg { color: var(--success); }

@container hero (max-width: 900px) {
  .arc-hero-section-inner { grid-template-columns: minmax(0, 1fr); gap: var(--space-10); }
  .arc-hero-section-hero::before { -webkit-mask-image: radial-gradient(90% 60% at 50% 78%, #000 30%, transparent 85%); mask-image: radial-gradient(90% 60% at 50% 78%, #000 30%, transparent 85%); }
}
@container hero (max-width: 560px) {
  .arc-hero-section-inner { gap: var(--space-8); padding: 80px var(--space-4) var(--space-6); }
  .arc-hero-section-copy { gap: var(--space-4); }
  .arc-hero-section-actions { width: 100%; margin-top: var(--space-1); }
  .arc-hero-section-actions > * { flex: 1 1 auto; }
  .arc-hero-section-canvas { gap: var(--space-3); }
}

@media (prefers-reduced-motion: reduce) {
  .arc-hero-section-spinner { animation: none; }
  .arc-hero-section-node, .arc-hero-section-live { transition: none; }
}

/* Centered, one full screen: copy over a drifting mesh, and a product window that rises from the bottom edge and runs off it.
   The hero is exactly one screen tall (never shorter than 600px); the window takes whatever height the copy leaves. */
/* The section is the container, so its children carry the side gutters and the queries below can change them. */
.arc-hero-section-hero { isolation: isolate; display: flex; height: 100vh; height: 100svh; min-height: 600px; flex-direction: column; padding-top: clamp(88px, 14svh, 144px); text-align: center; }

/* The mesh fills the screen. It is authored per theme: tints a few steps off the page, so it reads as light rather than color. */
.arc-hero-section-mesh {
  --mesh-base: var(--background);
  --mesh-1: #ffe6d8; --mesh-2: #e3dcff; --mesh-3: #dbe4ff; --mesh-4: #f0e0ff; --mesh-5: #e0eefc;
  z-index: -1;
}
:global(:root[data-theme="dark"]) .arc-hero-section-mesh { --mesh-1: #2a1822; --mesh-2: #1c1a44; --mesh-3: #141c40; --mesh-4: #231842; --mesh-5: #0e2133; }

.arc-hero-section-copy { position: relative; display: grid; justify-items: center; gap: var(--space-5); max-width: 900px; margin: 0 auto; padding-inline: var(--space-10); }
.arc-hero-section-title { max-width: 14ch; font-size: clamp(2.5rem, 1.2rem + 5cqi, var(--text-5xl)); }
.arc-hero-section-description { max-width: 590px; }
.arc-hero-section-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--space-3); margin-top: var(--space-3); }
.arc-hero-section-fine { margin: 0; color: var(--text-muted); font-size: var(--text-sm); }

/* Stage: fills the rest of the screen and is the visible crop. The window runs past its bottom edge; the mask fades it into the
   mesh, so there is no hard edge. The halo above leaves room for the light behind the window. */
.arc-hero-section-stage { --halo: 96px; position: relative; flex: 1 1 0; box-sizing: border-box; width: 100%; min-height: 0; max-width: calc(1200px + 2 * var(--space-10)); margin: calc(var(--space-12) - var(--halo)) auto 0; overflow: hidden; padding: var(--halo) var(--space-10) 0; -webkit-mask-image: linear-gradient(to bottom, #000 62%, transparent 100%); mask-image: linear-gradient(to bottom, #000 62%, transparent 100%); }
.arc-hero-section-glow {
  position: absolute; z-index: -1; top: calc(var(--halo) - 110px); left: 10%; right: 10%; height: 240px;
  background: radial-gradient(50% 50% at 50% 50%, var(--hero-glow), transparent 72%);
  filter: blur(36px);
  --hero-glow: color-mix(in oklch, color-mix(in oklch, var(--accent) 35%, #7d8cff) 36%, transparent);
}
:global(:root[data-theme="dark"]) .arc-hero-section-glow { --hero-glow: color-mix(in oklch, color-mix(in oklch, var(--accent) 30%, #6e7cff) 58%, transparent); }
.arc-hero-section-window { position: relative; }
/* A thin light catches the top edge, the way a real display does in a dark room. */
:global(:root[data-theme="dark"]) .arc-hero-section-window::after { content: ""; position: absolute; top: 0; left: 12%; right: 12%; height: 1px; background: linear-gradient(to right, transparent, color-mix(in oklch, #b9c2ff 70%, transparent), transparent); pointer-events: none; }
.arc-hero-section-perspective { display: flex; justify-content: center; perspective: 2200px; perspective-origin: 50% 0%; }
.arc-hero-section-tilt { position: relative; flex: none; transform-origin: 50% 0%; will-change: transform; }
.arc-hero-section-scaler { position: absolute; top: 0; left: 0; transform-origin: 0 0; }

/* The window. */
.arc-hero-section-window {
  display: grid; grid-template-rows: auto minmax(0, 1fr); height: 100%; overflow: hidden;
  border: 1px solid var(--border); border-radius: 16px; background: var(--surface); color: var(--foreground);
  text-align: left; font-size: var(--text-sm);
  box-shadow: 0 1px 1px rgb(20 24 40 / .04), 0 24px 48px -16px rgb(20 24 40 / .16), 0 60px 120px -40px rgb(40 48 110 / .22);
}
:global(:root[data-theme="dark"]) .arc-hero-section-window {
  border-color: color-mix(in oklch, var(--foreground) 14%, transparent);
  box-shadow: inset 0 1px 0 color-mix(in oklch, var(--foreground) 9%, transparent), 0 24px 48px -16px rgb(0 0 0 / .6), 0 60px 140px -40px rgb(40 50 140 / .35);
}
.arc-hero-section-chrome { position: relative; display: flex; height: 40px; align-items: center; justify-content: center; border-bottom: 1px solid var(--border-subtle); background: color-mix(in oklch, var(--surface-muted) 55%, var(--surface)); }
.arc-hero-section-lights { position: absolute; left: 16px; display: flex; gap: 7px; }
.arc-hero-section-lights i { width: 11px; height: 11px; border-radius: 50%; background: color-mix(in oklch, var(--foreground) 14%, transparent); }
.arc-hero-section-url { border-radius: 8px; padding: 3px 14px; background: var(--surface); color: var(--text-muted); font-size: var(--text-xs); box-shadow: inset 0 0 0 1px var(--border-subtle); }

.arc-hero-section-app { display: grid; grid-template-columns: 224px minmax(0, 1fr); min-height: 0; }
.arc-hero-section-window[data-narrow] .arc-hero-section-app { grid-template-columns: minmax(0, 1fr); }

.arc-hero-section-sidebar { display: flex; flex-direction: column; gap: 2px; border-right: 1px solid var(--border-subtle); padding: 14px 12px; background: color-mix(in oklch, var(--surface-muted) 40%, var(--surface)); }
.arc-hero-section-workspace { display: flex; align-items: center; gap: 10px; padding: 6px 8px 10px; }
.arc-hero-section-wsMark { display: grid; width: 22px; height: 22px; place-items: center; border-radius: 6px; background: var(--foreground); color: var(--background); font-size: 12px; font-weight: 500; }
.arc-hero-section-wsName { flex: 1; font-weight: 500; }
.arc-hero-section-dim { color: var(--text-muted); }
.arc-hero-section-search { display: flex; align-items: center; gap: 8px; margin: 0 0 10px; border: 1px solid var(--border-subtle); border-radius: 9px; padding: 6px 8px; background: var(--surface); color: var(--text-muted); }
.arc-hero-section-search kbd { margin-left: auto; font: inherit; font-size: var(--text-xs); }
.arc-hero-section-nav { display: grid; gap: 1px; }
.arc-hero-section-navItem { display: flex; align-items: center; gap: 10px; border-radius: 8px; padding: 6px 8px; color: var(--text-secondary); }
.arc-hero-section-navItem svg { color: var(--text-muted); }
.arc-hero-section-navItem[data-active] { background: var(--accent-subtle); color: var(--foreground); font-weight: 500; }
.arc-hero-section-navItem[data-active] svg { color: var(--accent); }
.arc-hero-section-groupLabel { margin: 18px 8px 6px; color: var(--text-muted); font-size: var(--text-xs); }
.arc-hero-section-dot { width: 8px; height: 8px; margin: 0 3px; border-radius: 50%; background: var(--text-muted); }
.arc-hero-section-dot[data-tone="accent"] { background: var(--accent); }
.arc-hero-section-dot[data-tone="danger"] { background: var(--danger); }
.arc-hero-section-me { display: flex; align-items: center; gap: 10px; margin-top: auto; border-top: 1px solid var(--border-subtle); padding: 12px 6px 2px; }
.arc-hero-section-me span:not([role]) { display: grid; flex: 1; line-height: 1.3; }
.arc-hero-section-me strong { font-weight: 500; }
.arc-hero-section-me small { color: var(--text-muted); font-size: var(--text-xs); }

.arc-hero-section-main { display: grid; align-content: start; gap: 16px; min-width: 0; padding: 22px 24px; }
.arc-hero-section-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.arc-hero-section-h2 { margin: 0; font-size: var(--text-lg); font-weight: 500; letter-spacing: var(--tracking-body); }
.arc-hero-section-sub { margin: 2px 0 0; color: var(--text-muted); font-size: var(--text-xs); }
.arc-hero-section-range { flex: none; }

.arc-hero-section-kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.arc-hero-section-window[data-narrow] .arc-hero-section-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.arc-hero-section-kpi { min-width: 0; border: 1px solid var(--border-subtle); border-radius: 12px; padding: 14px 16px 12px; background: var(--surface); }

.arc-hero-section-grid { display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr); gap: 12px; }
.arc-hero-section-window[data-narrow] .arc-hero-section-grid { grid-template-columns: minmax(0, 1fr); }
.arc-hero-section-card { display: grid; align-content: start; gap: 14px; min-width: 0; border: 1px solid var(--border-subtle); border-radius: 12px; padding: 16px 18px; background: var(--surface); }
.arc-hero-section-cardHead { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.arc-hero-section-insight { display: flex; gap: 8px; max-width: 46ch; margin: 0; color: var(--text-secondary); line-height: 1.45; }
.arc-hero-section-insight strong { color: var(--foreground); font-weight: 500; }
.arc-hero-section-insightIcon { flex: none; margin-top: 2px; color: var(--accent); }
.arc-hero-section-legend { display: flex; flex: none; gap: 14px; color: var(--text-muted); font-size: var(--text-xs); }
.arc-hero-section-legend span { display: inline-flex; align-items: center; gap: 6px; }
.arc-hero-section-swatch { width: 14px; height: 2px; border-radius: 2px; background: var(--accent); }
.arc-hero-section-swatch[data-last] { background: repeating-linear-gradient(to right, color-mix(in oklch, var(--foreground) 46%, var(--surface)) 0 4px, transparent 4px 7px); }
.arc-hero-section-window[data-narrow] .arc-hero-section-legend { display: none; }

.arc-hero-section-cardTitle { display: flex; justify-content: space-between; font-weight: 500; }
.arc-hero-section-cardTitle span { color: var(--text-muted); font-size: var(--text-xs); font-weight: 400; }
.arc-hero-section-movers { display: grid; margin: 0; padding: 0; list-style: none; }
.arc-hero-section-movers li { display: flex; align-items: center; gap: 12px; border-top: 1px solid var(--border-subtle); padding: 10px 0; }
.arc-hero-section-movers li:first-child { border-top: 0; padding-top: 2px; }
.arc-hero-section-logo { flex: none; width: 20px; height: 20px; background: center / contain no-repeat; }
.arc-hero-section-logo[data-mono] { background: var(--foreground); -webkit-mask: center / contain no-repeat; mask: center / contain no-repeat; }
.arc-hero-section-who { display: grid; flex: 1; min-width: 0; line-height: 1.3; }
.arc-hero-section-who strong { font-weight: 500; }
.arc-hero-section-who small { overflow: hidden; color: var(--text-muted); font-size: var(--text-xs); text-overflow: ellipsis; white-space: nowrap; }
.arc-hero-section-amount { color: var(--success); font-variant-numeric: tabular-nums; font-weight: 500; }
.arc-hero-section-amount[data-down] { color: var(--danger); }

@container hero (max-width: 560px) {
  .arc-hero-section-hero { padding-top: 84px; }
  .arc-hero-section-copy { gap: var(--space-4); padding-inline: var(--space-4); }
  .arc-hero-section-actions { width: 100%; margin-top: var(--space-2); }
  .arc-hero-section-actions > * { flex: 1 1 auto; }
  .arc-hero-section-stage { --halo: 56px; margin-top: calc(var(--space-10) - var(--halo)); padding-inline: 0; }
}

/* KPI tiles reuse Arc Sparkline; its caption wraps so the label sits above a larger value. */
.arc-hero-section-kpi :global(figcaption) { flex-wrap: wrap; row-gap: 4px; }
.arc-hero-section-kpi :global(figcaption) > :first-child { flex-basis: 100%; font-size: var(--text-xs); color: var(--text-muted); }
.arc-hero-section-kpi :global(figcaption) strong { margin-left: 0; font-size: var(--text-2xl); letter-spacing: -.02em; }
.arc-hero-section-kpi :global(figcaption) small { align-self: center; }
`;

const styles: Record<string, string> = new Proxy({
  "action": "arc-hero-section-action",
  "actions": "arc-hero-section-actions",
  "amount": "arc-hero-section-amount",
  "announcement": "arc-hero-section-announcement",
  "app": "arc-hero-section-app",
  "arrow": "arc-hero-section-arrow",
  "brands": "arc-hero-section-brands",
  "button": "arc-hero-section-button",
  "canvas": "arc-hero-section-canvas",
  "card": "arc-hero-section-card",
  "cardHead": "arc-hero-section-cardHead",
  "cardTitle": "arc-hero-section-cardTitle",
  "check": "arc-hero-section-check",
  "chrome": "arc-hero-section-chrome",
  "command": "arc-hero-section-command",
  "copy": "arc-hero-section-copy",
  "cta": "arc-hero-section-cta",
  "description": "arc-hero-section-description",
  "dim": "arc-hero-section-dim",
  "dot": "arc-hero-section-dot",
  "edges": "arc-hero-section-edges",
  "event": "arc-hero-section-event",
  "file": "arc-hero-section-file",
  "fine": "arc-hero-section-fine",
  "flow": "arc-hero-section-flow",
  "glow": "arc-hero-section-glow",
  "glyph": "arc-hero-section-glyph",
  "graph": "arc-hero-section-graph",
  "grid": "arc-hero-section-grid",
  "groupLabel": "arc-hero-section-groupLabel",
  "h2": "arc-hero-section-h2",
  "head": "arc-hero-section-head",
  "hero": "arc-hero-section-hero",
  "icon": "arc-hero-section-icon",
  "inner": "arc-hero-section-inner",
  "insight": "arc-hero-section-insight",
  "insightIcon": "arc-hero-section-insightIcon",
  "install": "arc-hero-section-install",
  "kpi": "arc-hero-section-kpi",
  "kpis": "arc-hero-section-kpis",
  "legend": "arc-hero-section-legend",
  "lights": "arc-hero-section-lights",
  "live": "arc-hero-section-live",
  "logo": "arc-hero-section-logo",
  "main": "arc-hero-section-main",
  "me": "arc-hero-section-me",
  "media": "arc-hero-section-media",
  "mesh": "arc-hero-section-mesh",
  "meta": "arc-hero-section-meta",
  "minimal": "arc-hero-section-minimal",
  "movers": "arc-hero-section-movers",
  "nav": "arc-hero-section-nav",
  "navItem": "arc-hero-section-navItem",
  "node": "arc-hero-section-node",
  "num": "arc-hero-section-num",
  "pending": "arc-hero-section-pending",
  "perspective": "arc-hero-section-perspective",
  "preview": "arc-hero-section-preview",
  "primary": "arc-hero-section-primary",
  "prompt": "arc-hero-section-prompt",
  "range": "arc-hero-section-range",
  "result": "arc-hero-section-result",
  "row": "arc-hero-section-row",
  "scaler": "arc-hero-section-scaler",
  "screen": "arc-hero-section-screen",
  "search": "arc-hero-section-search",
  "secondary": "arc-hero-section-secondary",
  "sidebar": "arc-hero-section-sidebar",
  "skip": "arc-hero-section-skip",
  "spinner": "arc-hero-section-spinner",
  "split": "arc-hero-section-split",
  "srOnly": "arc-hero-section-srOnly",
  "stage": "arc-hero-section-stage",
  "state": "arc-hero-section-state",
  "stateInner": "arc-hero-section-stateInner",
  "sub": "arc-hero-section-sub",
  "summary": "arc-hero-section-summary",
  "swatch": "arc-hero-section-swatch",
  "switch": "arc-hero-section-switch",
  "switcher": "arc-hero-section-switcher",
  "text": "arc-hero-section-text",
  "tilt": "arc-hero-section-tilt",
  "title": "arc-hero-section-title",
  "toolbar": "arc-hero-section-toolbar",
  "url": "arc-hero-section-url",
  "who": "arc-hero-section-who",
  "window": "arc-hero-section-window",
  "wire": "arc-hero-section-wire",
  "workspace": "arc-hero-section-workspace",
  "wsMark": "arc-hero-section-wsMark",
  "wsName": "arc-hero-section-wsName"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-hero-section-${prop}`,
});


// ── Inlined Subcomponent Helpers for Standalone Execution ──
export const Button = forwardRef<HTMLButtonElement, any>(function Button({ className = "", children, ...props }, ref) {
  return <button ref={ref} className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity ${className}`} {...props}>{children}</button>;
});

export function Avatar({ src, alt = "", name = "", className = "" }: any) {
  return <span className={`relative inline-flex items-center justify-center overflow-hidden rounded-full bg-[var(--surface-muted)] text-[var(--foreground)] font-medium text-xs w-8 h-8 ${className}`}>{src ? <img src={src} alt={alt} className="w-full h-full object-cover" /> : (name ? name[0] : "")}</span>;
}

export function AvatarGroup({ children, className = "" }: any) {
  return <div className={`flex items-center -space-x-2 ${className}`}>{children}</div>;
}

export const Input = forwardRef<HTMLInputElement, any>(function Input({ className = "", ...props }, ref) {
  return <input ref={ref} className={`w-full px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] outline-none focus:border-[var(--accent)] ${className}`} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, any>(function Textarea({ className = "", ...props }, ref) {
  return <textarea ref={ref} className={`w-full px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] outline-none focus:border-[var(--accent)] ${className}`} {...props} />;
});

export const PasswordField = forwardRef<HTMLInputElement, any>(function PasswordField({ className = "", ...props }, ref) {
  return <input ref={ref} type="password" className={`w-full px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] outline-none focus:border-[var(--accent)] ${className}`} {...props} />;
});

export const SearchField = forwardRef<HTMLInputElement, any>(function SearchField({ className = "", ...props }, ref) {
  return <input ref={ref} type="search" placeholder="Search..." className={`w-full px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] outline-none focus:border-[var(--accent)] ${className}`} {...props} />;
});

export function OtpInput({ length = 6, value = "", onChange, className = "" }: any) {
  return <div className={`flex gap-2 ${className}`}>{[...Array(length)].map((_, i) => <input key={i} maxLength={1} value={value[i] || ""} className="w-10 h-12 text-center text-lg font-semibold rounded-xl border border-[var(--border)] bg-[var(--surface)]" readOnly />)}</div>;
}

export function Badge({ children, className = "" }: any) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--surface-muted)] text-[var(--text-secondary)] ${className}`}>{children}</span>;
}

export function Progress({ value = 0, className = "" }: any) {
  return <div className={`w-full h-2 rounded-full bg-[var(--surface-muted)] overflow-hidden ${className}`}><div className="h-full bg-[var(--foreground)] transition-all duration-300" style={{ width: `${value}%` }} /></div>;
}

export function Switch({ checked, onCheckedChange, className = "", ...props }: any) {
  return <button type="button" role="switch" aria-checked={checked} onClick={() => onCheckedChange?.(!checked)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${checked ? 'bg-[var(--control-on)]' : 'bg-[var(--control-track)]'} ${className}`} {...props}><span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transform transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} /></button>;
}

export function Checkbox({ checked, onCheckedChange, className = "", ...props }: any) {
  return <input type="checkbox" checked={checked} onChange={e => onCheckedChange?.(e.target.checked)} className={`rounded border-[var(--border)] text-[var(--accent)] ${className}`} {...props} />;
}

export function SegmentedControl({ value, onChange, options = [], className = "" }: any) {
  return (
    <div className={`inline-flex p-1 rounded-xl bg-[var(--surface-muted)] text-sm ${className}`}>
      {options.map((opt: any) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const active = val === value;
        return (
          <button key={val} type="button" onClick={() => onChange?.(val)} className={`px-3 py-1 rounded-lg font-medium transition-all ${active ? 'bg-[var(--surface)] shadow-sm text-[var(--foreground)]' : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'}`}>{label}</button>
        );
      })}
    </div>
  );
}

export function CopyButton({ text, className = "" }: any) {
  return <button type="button" onClick={() => navigator.clipboard?.writeText(text || "")} className={`px-2.5 py-1 text-xs rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] ${className}`}>Copy</button>;
}

export function AnimatedCounter({ value, className = "" }: any) {
  return <span className={className}>{value}</span>;
}

export function TextMorph({ children, className = "" }: any) {
  return <span className={className}>{children}</span>;
}

export function Sparkline({ data = [], className = "" }: any) {
  return <svg className={`w-24 h-8 ${className}`}><path d="M0 16 L20 10 L40 18 L60 8 L80 12 L100 4" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>;
}

export function LineChart({ data = [], className = "" }: any) {
  return <svg className={`w-full h-32 ${className}`}><path d="M0 64 L50 40 L100 70 L150 30 L200 45 L250 15" fill="none" stroke="currentColor" strokeWidth="2" /></svg>;
}

export function Calendar(props: any) {
  return <div className="p-3 border border-[var(--border)] rounded-2xl bg-[var(--surface)]">Calendar</div>;
}


// ── Helper: hero-motion.ts ──

export type Bezier = [number, number, number, number];
export const ease = {
  enter: [...motionTokens.ease.enter] as Bezier,
  standard: [...motionTokens.ease.standard] as Bezier,
  inOut: [...motionTokens.ease.inOut] as Bezier,
};

/** The one entrance a hero plays: children rise in reading order, once. */
export const heroGroup: Variants = { hidden: {}, shown: { transition: { staggerChildren: motionTokens.stagger.line, delayChildren: .04 } } };
export const heroRise: Variants = {
  hidden: { opacity: 0, y: 12, filter: `blur(${motionTokens.blur.subtle}px)` },
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: .64, ease: ease.enter } },
};
export const heroFade: Variants = { hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: motionTokens.duration.standard } } };

export const instant: Transition = { duration: 0 };

const noop = () => () => {};
/**
 * Reduced motion, read only after hydration. The server cannot know the preference, so the first client render matches the
 * server's full motion markup and the reduced branch takes over on the next render, before anything has moved.
 */
export function useHeroReducedMotion() {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  return !!useReducedMotion() && hydrated;
}

// ── Helper: hero-lumen-data.ts ──

/** Sample data for Lumen, a revenue analytics product. Replace it with your own product's numbers. */

export type LumenRange = "30d" | "90d" | "12m";

export const lumenRanges: { value: LumenRange; label: string }[] = [
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "12m", label: "12M" },
];

/** A smooth, deterministic walk: a trend, one slow wave, and a little noise that repeats for the same seed. */
function walk(count: number, start: number, end: number, wave: number, seed: number) {
  let s = seed;
  const rand = () => { s = (s * 16807) % 2147483647; return s / 2147483647 - .5; };
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    return Math.round(start + (end - start) * (t * t * .35 + t * .65) + Math.sin(t * Math.PI * 2.3) * wave + rand() * wave * .6);
  });
}

const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];

function series(range: LumenRange): LineChartDatum[] {
  if (range === "12m") {
    const now = walk(12, 9_800, 36_400, 2_600, 7), before = walk(12, 6_200, 21_900, 2_200, 19);
    return months.map((month, i) => ({ key: `m${i}`, label: `${month} ${i < 3 ? 2025 : 2026}`, axisLabel: i % 2 === 0 ? month : undefined, values: { mrr: now[i], last: before[i] } }));
  }
  const days = range === "30d" ? 30 : 13;
  const step = range === "30d" ? 1 : 7;
  const now = walk(days, range === "30d" ? 640 : 4_300, range === "30d" ? 1_960 : 9_800, range === "30d" ? 260 : 900, range === "30d" ? 3 : 11);
  const before = walk(days, range === "30d" ? 520 : 3_600, range === "30d" ? 1_180 : 6_100, range === "30d" ? 220 : 700, 29);
  const end = new Date(Date.UTC(2026, 8, 24));
  return now.map((value, i) => {
    const date = new Date(end.getTime() - (days - 1 - i) * step * 86_400_000);
    const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
    const every = range === "30d" ? 7 : 3;
    return { key: date.toISOString().slice(0, 10), label, axisLabel: (days - 1 - i) % every === 0 ? label : undefined, values: { mrr: value, last: before[i] } };
  });
}

export const lumenSeries: Record<LumenRange, LineChartDatum[]> = { "30d": series("30d"), "90d": series("90d"), "12m": series("12m") };

export interface LumenKpi {
  id: string;
  label: string;
  tone: "accent" | "success" | "warning" | "danger";
  byRange: Record<LumenRange, { value: string; change: string; data: number[] }>;
}

export const lumenKpis: LumenKpi[] = [
  { id: "mrr", label: "MRR", tone: "accent", byRange: {
    "30d": { value: "$482.9K", change: "+8.2%", data: walk(12, 446, 483, 4, 5) },
    "90d": { value: "$482.9K", change: "+19.9%", data: walk(12, 402, 483, 6, 9) },
    "12m": { value: "$482.9K", change: "+51.7%", data: walk(12, 318, 483, 8, 13) },
  } },
  { id: "nrr", label: "Net retention", tone: "success", byRange: {
    "30d": { value: "118%", change: "+3 pts", data: walk(12, 112, 118, 1.5, 17) },
    "90d": { value: "116%", change: "+5 pts", data: walk(12, 109, 116, 1.8, 21) },
    "12m": { value: "114%", change: "+9 pts", data: walk(12, 103, 114, 2.4, 23) },
  } },
  { id: "new", label: "New customers", tone: "success", byRange: {
    "30d": { value: "214", change: "+12%", data: walk(12, 5, 9, 2, 31) },
    "90d": { value: "602", change: "+18%", data: walk(12, 38, 56, 6, 37) },
    "12m": { value: "2,140", change: "+34%", data: walk(12, 120, 214, 16, 41) },
  } },
  { id: "churn", label: "Churned MRR", tone: "success", byRange: {
    "30d": { value: "$6.1K", change: "−14%", data: walk(12, 9, 6, 1.2, 43) },
    "90d": { value: "$21.4K", change: "−9%", data: walk(12, 26, 21, 2, 47) },
    "12m": { value: "$96.8K", change: "−22%", data: walk(12, 12, 7, 1.4, 53) },
  } },
];

export interface LumenMover {
  name: string;
  logo: string;
  /** Mono marks draw in the text color through a mask; color marks keep their own colors. */
  mono?: boolean;
  change: string;
  amount: number;
}

export const lumenMovers: LumenMover[] = [
  { name: "Linear", logo: "/block-logos/linear-color.svg", change: "Moved to Enterprise", amount: 4_200 },
  { name: "Raycast", logo: "/block-logos/raycast-color.svg", change: "Added 120 seats", amount: 2_850 },
  { name: "Vercel", logo: "/block-logos/vercel.svg", mono: true, change: "Annual prepay", amount: 1_900 },
  { name: "Loom", logo: "/block-logos/loom-color.svg", change: "Removed 40 seats", amount: -1_240 },
  { name: "Supabase", logo: "/block-logos/supabase-color.svg", change: "Added forecasting", amount: 980 },
  { name: "Framer", logo: "/block-logos/framer.svg", mono: true, change: "Upgraded to Scale", amount: 760 },
];

export const lumenInsight: Record<LumenRange, { lead: string; rest: string }> = {
  "30d": { lead: "MRR grew $36.4K this month.", rest: "62% came from 14 expansions on the Scale plan, led by Linear." },
  "90d": { lead: "MRR grew $80.6K this quarter.", rest: "Expansion outpaced new business for the first time since March." },
  "12m": { lead: "MRR grew $164.5K in twelve months.", rest: "Net retention above 110% did more than new logos did." },
};

// ── Helper: media.ts ──
/**
 * Shared demo media. Files live in `public/media/`, credits in `public/media/CREDITS.md`.
 * Portraits are 400 px squares; photos are 1600 px on the long side.
 */

export interface MediaPerson {
  id: string;
  name: string;
  role?: string;
  src: string;
}

export interface MediaPhoto {
  id: string;
  alt: string;
  src: string;
  width: number;
  height: number;
}

export const people = [
  { id: "emma-collins", name: "Emma Collins", role: "Product designer", src: "/media/people/emma-collins.jpg" },
  { id: "marcus-johnson", name: "Marcus Johnson", role: "Frontend engineer", src: "/media/people/marcus-johnson.jpg" },
  { id: "jasmine-brooks", name: "Jasmine Brooks", role: "Design lead", src: "/media/people/jasmine-brooks.jpg" },
  { id: "olivia-bennett", name: "Olivia Bennett", role: "Platform engineer", src: "/media/people/olivia-bennett.jpg" },
  { id: "sofia-ramirez", name: "Sofia Ramirez", role: "Operations lead", src: "/media/people/sofia-ramirez.jpg" },
  { id: "ryan-sullivan", name: "Ryan Sullivan", role: "Account executive", src: "/media/people/ryan-sullivan.jpg" },
  { id: "hannah-walsh", name: "Hannah Walsh", role: "Customer success", src: "/media/people/hannah-walsh.jpg" },
  { id: "chloe-nguyen", name: "Chloe Nguyen", role: "Data analyst", src: "/media/people/chloe-nguyen.jpg" },
  { id: "ava-mitchell", name: "Ava Mitchell", role: "Marketing manager", src: "/media/people/ava-mitchell.jpg" },
  { id: "daniel-kim", name: "Daniel Kim", role: "Backend engineer", src: "/media/people/daniel-kim.jpg" },
  { id: "jordan-reyes", name: "Jordan Reyes", role: "Support specialist", src: "/media/people/jordan-reyes.jpg" },
  { id: "mateo-alvarez", name: "Mateo Alvarez", role: "Mobile engineer", src: "/media/people/mateo-alvarez.jpg" },
  { id: "tyler-hayes", name: "Tyler Hayes", role: "Sales lead", src: "/media/people/tyler-hayes.jpg" },
  { id: "andre-williams", name: "Andre Williams", role: "Finance partner", src: "/media/people/andre-williams.jpg" },
  { id: "nathan-cole", name: "Nathan Cole", role: "Engineering manager", src: "/media/people/nathan-cole.jpg" },
  { id: "diane-foster", name: "Diane Foster", role: "Chief operating officer", src: "/media/people/diane-foster.jpg" },
] as const satisfies readonly MediaPerson[];

export const photos = [
  { id: "lounge-chair", alt: "A woven oak lounge chair with a sheepskin and linen cushion on a concrete floor", src: "/media/photos/lounge-chair.jpg", width: 1280, height: 1600 },
  { id: "table-lamp", alt: "A white mushroom table lamp glowing beside books and a small vase", src: "/media/photos/table-lamp.jpg", width: 1600, height: 900 },
  { id: "linen-throw", alt: "Folded natural linen throws with fringed edges in soft window light", src: "/media/photos/linen-throw.jpg", width: 1067, height: 1600 },
  { id: "glass-carafe", alt: "A hand pouring water from a ribbed glass carafe into tumblers", src: "/media/photos/glass-carafe.jpg", width: 1280, height: 1600 },
  { id: "stoneware-cups", alt: "Two speckled stoneware cups with a lid on a pale table", src: "/media/photos/stoneware-cups.jpg", width: 1067, height: 1600 },
  { id: "stacked-bowls", alt: "Two stacked speckled ceramic bowls against a dark wall", src: "/media/photos/stacked-bowls.jpg", width: 1600, height: 1067 },
  { id: "ceramic-lamp", alt: "A sculptural ceramic lamp with a linen shade on a walnut sideboard", src: "/media/photos/ceramic-lamp.jpg", width: 1067, height: 1600 },
  { id: "living-room", alt: "A bright living room with timber beams, arched windows, and cream sofas", src: "/media/photos/living-room.jpg", width: 1200, height: 1600 },
  { id: "sunroom", alt: "A sunroom with a round dining table, plants, and windows on three sides", src: "/media/photos/sunroom.jpg", width: 1600, height: 1067 },
  { id: "home-office", alt: "A home office with a wooden desk and deep green walls", src: "/media/photos/home-office.jpg", width: 1600, height: 1200 },
  { id: "reading-chair", alt: "A grey armchair and ottoman with a knit throw in a dark green room", src: "/media/photos/reading-chair.jpg", width: 1600, height: 900 },
  { id: "bedroom", alt: "A made bed with striped linen pillows against an oak headboard", src: "/media/photos/bedroom.jpg", width: 1067, height: 1600 },
  { id: "restaurant", alt: "A warm restaurant dining room with woven pendant lights and a tree", src: "/media/photos/restaurant.jpg", width: 1067, height: 1600 },
  { id: "wine-bar", alt: "A glass carafe of red wine on a bar table in low evening light", src: "/media/photos/wine-bar.jpg", width: 1600, height: 1067 },
  { id: "concert-hall", alt: "Curved stainless steel panels of the Walt Disney Concert Hall against a blue sky", src: "/media/photos/concert-hall.jpg", width: 1600, height: 1143 },
  { id: "curved-facade", alt: "A white tiled building facade with curved balconies", src: "/media/photos/curved-facade.jpg", width: 1600, height: 1067 },
  { id: "pool-house", alt: "A modern glass house beside a long pool under a clear sky", src: "/media/photos/pool-house.jpg", width: 1600, height: 900 },
  { id: "terracotta-waves", alt: "Wavy terracotta walls rising toward a blue sky", src: "/media/photos/terracotta-waves.jpg", width: 1067, height: 1600 },
  { id: "mountain-ridges", alt: "Layered mountain ridges under a warm evening sky", src: "/media/photos/mountain-ridges.jpg", width: 1600, height: 1068 },
  { id: "alpine-lake", alt: "A calm alpine lake reflecting a rocky peak at golden hour", src: "/media/photos/alpine-lake.jpg", width: 1067, height: 1600 },
  { id: "coastline", alt: "A long coastline with waves rolling onto a beach below green cliffs", src: "/media/photos/coastline.jpg", width: 1200, height: 1600 },
  { id: "sea-at-dusk", alt: "A calm sea at dusk with a low island on the horizon", src: "/media/photos/sea-at-dusk.jpg", width: 1067, height: 1600 },
  { id: "lisbon-tram", alt: "A yellow tram on a street lined with historic buildings in Lisbon", src: "/media/photos/lisbon-tram.jpg", width: 1600, height: 1064 },
  { id: "lisbon-bridge", alt: "The 25 de Abril Bridge crossing the Tagus in Lisbon", src: "/media/photos/lisbon-bridge.jpg", width: 1600, height: 1166 },
  { id: "lisbon-rooftops", alt: "Terracotta rooftops of Lisbon running down to the river", src: "/media/photos/lisbon-rooftops.jpg", width: 1280, height: 1600 },
  { id: "salmon-dinner", alt: "Seared salmon with a bright herb salsa and a glass of red wine", src: "/media/photos/salmon-dinner.jpg", width: 1067, height: 1600 },
  { id: "chef-plating", alt: "A chef spooning sauce onto a plated dish in a dark kitchen", src: "/media/photos/chef-plating.jpg", width: 1600, height: 1600 },
] as const satisfies readonly MediaPhoto[];

export type PersonId = (typeof people)[number]["id"];
export type PhotoId = (typeof photos)[number]["id"];

/** Looks up a person by id. */
export function person(id: PersonId): MediaPerson {
  return people.find(entry => entry.id === id)!;
}

/** Looks up a photo by id. */
export function photo(id: PhotoId): MediaPhoto {
  return photos.find(entry => entry.id === id)!;
}

/** Square 400 px avatar path for a person id, for `src` props. */
export const avatar = (id: PersonId) => person(id).src;

/** 800 × 1000 portrait crop of the same photo, for image-led layouts. */
export const portrait = (id: PersonId) => `/media/people/portrait/${id}.jpg`;

/** The first `count` people, for avatar stacks and lists. */
export const peopleSample = (count: number) => people.slice(0, count);



export { HeroCadence, HeroContent, HeroLumen, HeroMesh, HeroRelay };
export type { HeroAction, HeroInstallCommand, HeroMeshPoint };

export type HeroSectionVariant = "centered" | "split" | "minimal";

export interface HeroSectionProps {
  /**
   * `centered` is a headline over a drifting mesh with a live dashboard rising from the bottom edge, `split` sets the copy
   * beside a live workflow graph that runs sample events node by node, and `minimal` is large type over a mesh gradient.
   * Each design fills one full screen.
   */
  variant?: HeroSectionVariant;
  /** Plays the entrance once on mount. Defaults to true. */
  animateIn?: boolean;
  /** The main call to action. With `doneLabel` and no `href`, the button confirms in place. */
  primaryAction?: HeroAction | null;
  /** The second call to action. */
  secondaryAction?: HeroAction | null;
  /**
   * Your own headline. When set, the hero renders your content in the chosen layout (see `HeroContent`) instead of the
   * designed sample, together with the props below.
   */
  title?: string;
  description?: string;
  announcement?: HeroAction | null;
  /** Install commands for your own content; the first one is shown with a copy button. */
  install?: HeroInstallCommand[] | null;
  /** A visual beside your own content in the split layout. */
  media?: ReactNode;
  /** Small facts under your own content, such as the version and license. */
  meta?: string[];
  /** Kept for compatibility; highlighted phrases render as plain text. */
  highlight?: string;
  className?: string;
}

/**
 * A full screen landing page hero in three designs: a product screenshot in perspective over a drifting mesh, a live workflow
 * graph that routes sample events, and editorial type over a mesh gradient.
 */
export function HeroSection({ variant = "centered", animateIn = true, primaryAction, secondaryAction, title, description, announcement, install, media, meta, className }: HeroSectionProps) {
  if (title) return <HeroContent layout={variant} title={title} description={description} announcement={announcement} primaryAction={primaryAction} secondaryAction={secondaryAction} install={install} media={media} meta={meta} animateIn={animateIn} className={className} />;
  const actions = { primaryAction: primaryAction ?? undefined, secondaryAction: secondaryAction ?? undefined };
  if (variant === "split") return <HeroRelay animateIn={animateIn} className={className} {...actions} />;
  if (variant === "minimal") return <HeroCadence animateIn={animateIn} className={className} {...actions} />;
  return <HeroLumen animateIn={animateIn} className={className} {...actions} />;
}

const variantOptions = [
  { value: "centered", label: "Screenshot" },
  { value: "split", label: "Workflow" },
  { value: "minimal", label: "Mesh" },
];

/**
 * Preview: the hero, full screen, with a small glass switch floating over its top edge. The switch takes no space of its own,
 * so every design fills the screen exactly. Switching replays the entrance.
 */
export function HeroSectionBlock({ variant: initial = "centered" }: { variant?: HeroSectionVariant }) {
  const [variant, setVariant] = useState<HeroSectionVariant>(initial);
  return <div className={styles.preview}>
    <HeroSection key={variant} variant={variant} />
    <div className={styles.switcher}>
      <SegmentedControl label="Hero design" options={variantOptions} value={variant} onValueChange={value => setVariant(value as HeroSectionVariant)} className={styles.switch} />
    </div>
  </div>;
}

export default HeroSectionBlock;
