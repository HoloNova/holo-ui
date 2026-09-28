"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";

// ── Scoped CSS & Styles Proxy ──
const ARC_POPOVER_STYLES = `/* Press feedback on the anchor stays in color. Radix measures the trigger when the panel opens, so a scaled trigger would move the panel. */
.arc-popover-anchor:active:not(:disabled) { transform: none; }
.arc-popover-content {
  --popover-x: 0px;
  --popover-y: -5px;
  z-index: 80;
  min-width: 12rem;
  max-width: min(22rem, calc(100vw - 20px));
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-panel);
  background: var(--surface-raised);
  color: var(--foreground);
  box-shadow: var(--shadow-floating);
  transform-origin: var(--radix-popover-content-transform-origin);
  transition: opacity var(--duration-fast) var(--ease-enter), transform var(--duration-spring) var(--ease-spring);
}
/* The panel starts a few pixels toward its trigger and settles on a spring; it leaves faster than it arrives.
   Transitions instead of keyframes, so a close that interrupts the open, or a reopen during the close, reverses from where the panel is. */
.arc-popover-content[data-side="top"] { --popover-y: 5px; }
.arc-popover-content[data-side="left"] { --popover-x: 5px; --popover-y: 0px; }
.arc-popover-content[data-side="right"] { --popover-x: -5px; --popover-y: 0px; }
@starting-style {
  .arc-popover-content[data-state="open"] { opacity: 0; transform: translate(var(--popover-x), var(--popover-y)) scale(.97); }
}
/* Radix unmounts when the exit animation ends, so a no-op keyframe times the exit while the transition does the visual work. */
.arc-popover-content[data-state="closed"] { opacity: 0; transform: translate(calc(var(--popover-x) * .5), calc(var(--popover-y) * .5)) scale(.98); transition: opacity 140ms var(--ease-standard), transform 140ms var(--ease-standard); animation: popover-exit 140ms linear both; pointer-events: none; }
.arc-popover-content:focus { outline: none; }
.arc-popover-content:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 3px; }
@keyframes popover-exit { to { --popover-exit: 1; } }
@media (prefers-reduced-motion: reduce) {
  .arc-popover-content, .arc-popover-content[data-state="closed"] { transform: none; transition: opacity var(--duration-instant) linear; }
}
`;

const styles: Record<string, string> = new Proxy({
  "anchor": "arc-popover-anchor",
  "content": "arc-popover-content"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-popover-${prop}`,
});



export const Popover = PopoverPrimitive.Root;
export const PopoverClose = PopoverPrimitive.Close;

/** The trigger anchors the panel, so it opts out of press-scale: a scaled rect measured on open would shift the panel as the trigger springs back. */
export const PopoverTrigger = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>
>(function PopoverTrigger({ className, ...props }, ref) {
  return <PopoverPrimitive.Trigger {...props} ref={ref} className={[styles.anchor, className].filter(Boolean).join(" ")}/>;
});

PopoverTrigger.displayName = "PopoverTrigger";

export const PopoverContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(function PopoverContent({ className, align = "start", sideOffset = 6, collisionPadding = 10, ...props }, ref) {
  return <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      {...props}
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      className={[styles.content, className].filter(Boolean).join(" ")}
    />
  </PopoverPrimitive.Portal>;
});

PopoverContent.displayName = "PopoverContent";
