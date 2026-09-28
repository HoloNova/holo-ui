"use client";

import type { ClipboardEvent as ReactClipboardEvent, DragEvent as ReactDragEvent, KeyboardEvent as ReactKeyboardEvent, RefObject } from "react";
import type { Transition } from "motion/react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowUp, FileText, Paperclip, RotateCw, SmilePlus, X } from "lucide-react";
import { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

// ── Motion Tokens Presets ──
export const motionTokens = {
  duration: { instant: 0.12, fast: 0.16, exit: 0.18, standard: 0.24, considered: 0.48 },
  ease: {
    enter: [0.16, 1, 0.3, 1],
    exit: [0.7, 0, 0.84, 0],
    standard: [0.22, 1, 0.36, 1],
    inOut: [0.65, 0, 0.35, 1],
  },
  spring: {
    responsive: { type: "spring", stiffness: 520, damping: 38 },
    gentle: { type: "spring", stiffness: 340, damping: 34 },
    snappy: { type: "spring", visualDuration: 0.26, bounce: 0.12 },
    smooth: { type: "spring", visualDuration: 0.4, bounce: 0 },
    morph: { type: "spring", visualDuration: 0.42, bounce: 0.16 },
  },
  stagger: { char: 0.016, word: 0.04, line: 0.08, item: 0.035 },
  blur: { subtle: 2, soft: 4, text: 8 },
} as const;

// ── Scoped CSS & Styles Proxy ──
const ARC_CHAT_THREAD_STYLES = `.arc-chat-thread-root {
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  color: var(--foreground);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  letter-spacing: var(--tracking-body);
  line-height: var(--leading-body);
}

.arc-chat-thread-viewport { position: relative; display: flex; min-height: 0; flex: 1; flex-direction: column; }
.arc-chat-thread-scroller { min-height: 0; flex: 1; overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin; }
/* The content springs up from where it was when the thread grows; the clip keeps that travel out of the scroll range. */
.arc-chat-thread-track { overflow: clip; }
.arc-chat-thread-content { padding: 12px 16px 14px; will-change: transform; }

.arc-chat-thread-list { display: flex; flex-direction: column; margin: 0; padding: 0; list-style: none; }

.arc-chat-thread-day { display: flex; align-items: center; gap: 12px; padding: 20px 4px 4px; color: var(--text-muted); font-size: var(--text-xs); font-weight: 500; }
.arc-chat-thread-day::before, .arc-chat-thread-day::after { height: 1px; flex: 1; background: var(--border-subtle); content: ""; }
.arc-chat-thread-day:first-child { padding-top: 4px; }
.arc-chat-thread-day > span:empty::before { content: "\00a0"; }

.arc-chat-thread-row { position: relative; display: flex; align-items: flex-end; gap: 8px; margin-top: 2px; }
.arc-chat-thread-row[data-first] { margin-top: 14px; }
.arc-chat-thread-day + .arc-chat-thread-row { margin-top: 10px; }
.arc-chat-thread-row[data-mine] { justify-content: flex-end; }

.arc-chat-thread-gutter { width: 28px; flex: none; align-self: flex-end; }
.arc-chat-thread-stack { display: flex; min-width: 0; max-width: min(78%, 34rem); flex-direction: column; align-items: flex-start; gap: 4px; }
.arc-chat-thread-row[data-mine] .arc-chat-thread-stack { align-items: flex-end; }

.arc-chat-thread-meta { display: flex; align-items: baseline; gap: 6px; margin: 0 0 2px; padding: 0 12px; color: var(--text-muted); font-size: var(--text-xs); font-variant-numeric: tabular-nums; }
.arc-chat-thread-author { color: var(--text-secondary); font-weight: 500; }

.arc-chat-thread-line { position: relative; display: flex; max-width: 100%; align-items: center; gap: 6px; }
/* The author's face sits in the gutter, level with the bottom of their last bubble rather than the reactions under it. */
.arc-chat-thread-face { position: absolute; bottom: 0; left: -36px; display: flex; }
.arc-chat-thread-row[data-mine] .arc-chat-thread-line { flex-direction: row-reverse; }
.arc-chat-thread-parts { display: flex; min-width: 0; flex-direction: column; align-items: flex-start; gap: 4px; }
.arc-chat-thread-row[data-mine] .arc-chat-thread-parts { align-items: flex-end; }

/* Bubbles in a group share a soft edge on the author's side, so a run of messages reads as one voice. */
.arc-chat-thread-bubble {
  --r: 18px;
  --tight: 6px;
  max-width: 100%;
  padding: 8px 13px 9px;
  border-radius: var(--r);
  background: var(--surface-muted);
  color: var(--foreground);
  font-size: var(--text-sm);
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}
.arc-chat-thread-row:not([data-mine]):not([data-first]) .arc-chat-thread-bubble { border-top-left-radius: var(--tight); }
.arc-chat-thread-row:not([data-mine]):not([data-last]) .arc-chat-thread-bubble { border-bottom-left-radius: var(--tight); }
.arc-chat-thread-row[data-mine] .arc-chat-thread-bubble { background: var(--accent); color: var(--accent-foreground); }
:global(:root[data-theme="dark"]) .arc-chat-thread-row:not([data-mine]) .arc-chat-thread-bubble { background: var(--surface-raised); }
.arc-chat-thread-row[data-mine]:not([data-first]) .arc-chat-thread-bubble { border-top-right-radius: var(--tight); }
.arc-chat-thread-row[data-mine]:not([data-last]) .arc-chat-thread-bubble { border-bottom-right-radius: var(--tight); }
.arc-chat-thread-row[data-failed] .arc-chat-thread-bubble { opacity: .6; }

.arc-chat-thread-gallery { display: grid; width: min(240px, 100%); gap: 3px; grid-template-columns: 1fr; }
.arc-chat-thread-gallery[data-count="2"],
.arc-chat-thread-gallery[data-count="3"],
.arc-chat-thread-gallery[data-count="4"] { grid-template-columns: 1fr 1fr; }
.arc-chat-thread-gallery[data-count="3"] > :first-child { grid-column: span 2; aspect-ratio: 2 / 1; }
.arc-chat-thread-image { position: relative; display: block; overflow: hidden; aspect-ratio: 1; border-radius: 16px; background: var(--surface-muted); }
.arc-chat-thread-gallery[data-count="1"] .arc-chat-thread-image { aspect-ratio: 4 / 3; }
.arc-chat-thread-gallery:not([data-count="1"]) .arc-chat-thread-image { border-radius: 6px; }
.arc-chat-thread-gallery:not([data-count="1"]) { overflow: hidden; border-radius: 16px; }
.arc-chat-thread-image img { display: block; width: 100%; height: 100%; object-fit: cover; }
.arc-chat-thread-more { position: absolute; inset: 0; display: grid; place-items: center; background: oklch(0% 0 0 / .45); color: #fff; font-size: var(--text-lg); font-weight: 500; }

.arc-chat-thread-file {
  display: flex; max-width: 100%; align-items: center; gap: 10px; padding: 9px 14px 9px 11px;
  border: 1px solid var(--border); border-radius: 16px; background: var(--surface); color: var(--foreground); text-decoration: none;
  transition: background-color var(--duration-fast) var(--ease-standard);
}
.arc-chat-thread-file > svg { flex: none; color: var(--text-secondary); }
.arc-chat-thread-fileText { display: grid; min-width: 0; }
.arc-chat-thread-fileName { overflow: hidden; font-weight: 500; text-overflow: ellipsis; white-space: nowrap; }
.arc-chat-thread-fileSize { color: var(--text-muted); font-size: var(--text-xs); font-variant-numeric: tabular-nums; }
@media (hover: hover) and (pointer: fine) { .arc-chat-thread-file:hover { background: var(--surface-muted); } }

/* The reaction button waits beside the bubble and shows on hover or keyboard focus. */
/* The picker positions against the whole line, so it opens over the bubble and stays inside the thread. */
.arc-chat-thread-pickerWrap { position: static; flex: none; }
.arc-chat-thread-reactButton {
  display: grid; width: 28px; height: 28px; place-items: center; padding: 0;
  border: 0; border-radius: var(--radius-pill); background: transparent; color: var(--text-muted); cursor: pointer; opacity: 0;
  -webkit-tap-highlight-color: transparent;
  transition: opacity var(--duration-fast) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard);
}
.arc-chat-thread-row:hover .arc-chat-thread-reactButton,
.arc-chat-thread-row:focus-within .arc-chat-thread-reactButton,
.arc-chat-thread-pickerWrap[data-open] .arc-chat-thread-reactButton { opacity: 1; }
.arc-chat-thread-pickerWrap[data-open] .arc-chat-thread-reactButton { background: var(--surface-muted); color: var(--foreground); }
@media (hover: hover) and (pointer: fine) { .arc-chat-thread-reactButton:hover { background: var(--surface-muted); color: var(--foreground); } }
@media (hover: none) { .arc-chat-thread-reactButton { opacity: .7; } }

.arc-chat-thread-picker {
  position: absolute; z-index: 5; bottom: calc(100% + 6px); right: -4px;
  display: flex; gap: 2px; padding: 4px;
  border: 1px solid var(--border); border-radius: var(--radius-pill); background: var(--surface-raised); box-shadow: var(--shadow-floating);
  transform-origin: calc(100% - 18px) 100%;
}
.arc-chat-thread-picker[data-mine] { right: auto; left: -4px; transform-origin: 18px 100%; }
.arc-chat-thread-pickerWrap[data-below] .arc-chat-thread-picker { top: calc(100% + 6px); bottom: auto; transform-origin: calc(100% - 18px) 0; }
.arc-chat-thread-pickerWrap[data-below] .arc-chat-thread-picker[data-mine] { transform-origin: 18px 0; }
.arc-chat-thread-emoji {
  display: grid; width: 34px; height: 34px; place-items: center; padding: 0;
  border: 0; border-radius: var(--radius-pill); background: transparent; cursor: pointer; font-size: 19px; line-height: 1;
  -webkit-tap-highlight-color: transparent;
  transition: background-color var(--duration-fast) var(--ease-standard), transform var(--duration-instant) var(--ease-standard);
}
.arc-chat-thread-emoji:focus-visible { background: var(--surface-muted); }
.arc-chat-thread-emoji:active { transform: scale(.9); }
@media (hover: hover) and (pointer: fine) { .arc-chat-thread-emoji:hover { background: var(--surface-muted); transform: scale(1.12); } }

.arc-chat-thread-reactionClip { overflow: hidden; margin: -2px -4px; padding: 2px 4px 2px 8px; }
.arc-chat-thread-row[data-mine] .arc-chat-thread-reactionClip { padding: 2px 8px 2px 4px; }
.arc-chat-thread-reactions { display: flex; flex-wrap: wrap; gap: 4px; margin: 0; padding: 0; list-style: none; }
.arc-chat-thread-row[data-mine] .arc-chat-thread-reactions { justify-content: flex-end; }
.arc-chat-thread-reaction {
  display: inline-flex; height: 26px; align-items: center; gap: 5px; padding: 0 9px 0 7px;
  border: 1px solid var(--border-subtle); border-radius: var(--radius-pill); background: var(--surface); color: var(--text-secondary); cursor: pointer;
  font: inherit; font-size: var(--text-xs); font-weight: 500; line-height: 1; font-variant-numeric: tabular-nums;
  -webkit-tap-highlight-color: transparent;
  transition: background-color var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard), transform var(--duration-instant) var(--ease-standard);
}
.arc-chat-thread-reaction > span:first-child { font-size: 14px; }
.arc-chat-thread-reaction[aria-pressed="true"] { border-color: color-mix(in oklch, var(--accent) 28%, transparent); background: color-mix(in oklch, var(--accent) 8%, var(--surface)); color: var(--foreground); }
@media (hover: hover) and (pointer: fine) { .arc-chat-thread-reaction:hover { border-color: var(--border-strong); } }
.arc-chat-thread-reaction:active { transform: scale(.95); }
.arc-chat-thread-countRoll { display: inline-grid; overflow: hidden; font-variant-numeric: tabular-nums; }
.arc-chat-thread-countRoll > span { grid-area: 1 / 1; }

.arc-chat-thread-receipts { display: flex; min-height: 16px; align-items: center; gap: 6px; padding: 1px 6px 0; color: var(--text-muted); font-size: var(--text-xs); }
.arc-chat-thread-readers { display: inline-flex; }
.arc-chat-thread-reader { display: inline-flex; border-radius: 50%; box-shadow: 0 0 0 2px var(--surface); }
.arc-chat-thread-reader + .arc-chat-thread-reader { margin-left: -4px; }
.arc-chat-thread-status[data-status="failed"] { display: inline-flex; align-items: center; gap: 8px; color: var(--danger); }
.arc-chat-thread-retry {
  display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px;
  border: 0; border-radius: var(--radius-pill); background: color-mix(in oklch, var(--danger) 12%, transparent); color: var(--danger); cursor: pointer;
  font: inherit; font-weight: 500;
}

.arc-chat-thread-avatar { display: inline-grid; flex: none; overflow: hidden; place-items: center; border-radius: 50%; background: var(--surface-muted); color: var(--text-secondary); font-weight: 500; }
.arc-chat-thread-avatar img { width: 100%; height: 100%; object-fit: cover; }

.arc-chat-thread-typing { display: grid; height: 36px; box-sizing: border-box; place-items: center; padding: 0 14px; }
.arc-chat-thread-dots { display: inline-flex; gap: 4px; }
.arc-chat-thread-dots i { width: 6px; height: 6px; border-radius: 50%; background: var(--text-muted); animation: breathe 1.2s var(--ease-in-out) infinite; }
.arc-chat-thread-dots i:nth-child(2) { animation-delay: .16s; }
.arc-chat-thread-dots i:nth-child(3) { animation-delay: .32s; }
@keyframes breathe {
  0%, 60%, 100% { opacity: .35; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-3px); }
}
@media (prefers-reduced-motion: reduce) { .arc-chat-thread-dots i { animation: none; opacity: .6; } }

.arc-chat-thread-pill {
  position: absolute; z-index: 6; bottom: 12px; left: 50%; translate: -50% 0;
  display: inline-flex; height: 32px; align-items: center; gap: 6px; padding: 0 14px 0 11px;
  border: 1px solid var(--border); border-radius: var(--radius-pill); background: var(--surface-raised); box-shadow: var(--shadow-floating); color: var(--foreground); cursor: pointer;
  font: inherit; font-size: var(--text-xs); font-weight: 500; white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
}
.arc-chat-thread-pill > span { display: inline-flex; gap: .3em; }
.arc-chat-thread-pill:active { scale: .97; }

/* Composer. */
.arc-chat-thread-composer { display: grid; padding: 10px 12px 12px; border-top: 1px solid var(--border-subtle); transition: background-color var(--duration-fast) var(--ease-standard); }
.arc-chat-thread-composer[data-dragging] { background: var(--accent-subtle); }
.arc-chat-thread-trayClip { overflow: hidden; }
.arc-chat-thread-tray { display: flex; gap: 8px; margin: 0; padding: 8px 8px 10px 4px; overflow-x: auto; list-style: none; scrollbar-width: none; }
.arc-chat-thread-pending { position: relative; flex: none; }
.arc-chat-thread-pendingImage { display: block; width: 56px; height: 56px; border-radius: 12px; object-fit: cover; }
.arc-chat-thread-pendingFile { display: grid; width: 168px; height: 56px; box-sizing: border-box; align-content: center; column-gap: 8px; padding: 0 12px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface); grid-template-columns: auto minmax(0, 1fr); }
.arc-chat-thread-pendingFile > svg { grid-row: span 2; align-self: center; color: var(--text-secondary); }
.arc-chat-thread-pendingName { overflow: hidden; font-size: var(--text-xs); font-weight: 500; text-overflow: ellipsis; white-space: nowrap; }
.arc-chat-thread-pendingSize { color: var(--text-muted); font-size: 11px; font-variant-numeric: tabular-nums; }
.arc-chat-thread-remove {
  position: absolute; top: -6px; right: -6px; display: grid; width: 20px; height: 20px; place-items: center; padding: 0;
  border: 2px solid var(--surface); border-radius: 50%; background: var(--foreground); color: var(--background); cursor: pointer;
}

.arc-chat-thread-inputRow { display: flex; align-items: flex-end; gap: 6px; }
.arc-chat-thread-attach {
  display: grid; width: 40px; height: 40px; flex: none; place-items: center; margin-bottom: 1px; padding: 0;
  border: 0; border-radius: var(--radius-pill); background: transparent; color: var(--text-secondary); cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard), transform var(--duration-instant) var(--ease-standard);
}
.arc-chat-thread-attach:active { transform: scale(.94); }
@media (hover: hover) and (pointer: fine) { .arc-chat-thread-attach:hover { background: var(--surface-muted); color: var(--foreground); } }

/* The field and the send button share one rounded box; the button rides the bottom edge as the text grows. */
.arc-chat-thread-box {
  position: relative; display: flex; min-width: 0; flex: 1; align-items: flex-end;
  border: 1px solid var(--border); border-radius: 21px; background: var(--surface);
  transition: border-color var(--duration-fast) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard);
}
.arc-chat-thread-box:focus-within { border-color: var(--border-strong); }
.arc-chat-thread-composer[data-dragging] .arc-chat-thread-box { border-color: var(--accent); border-style: dashed; }
.arc-chat-thread-field { position: relative; min-width: 0; flex: 1; overflow: hidden; border-radius: 20px; }
.arc-chat-thread-mirror,
.arc-chat-thread-textarea {
  box-sizing: border-box; width: 100%; margin: 0; padding: 9px 6px 9px 16px; border: 0;
  font: inherit; font-size: var(--text-base); letter-spacing: var(--tracking-body); line-height: 22px;
  overflow-wrap: break-word; white-space: pre-wrap; word-break: break-word;
}
.arc-chat-thread-mirror { position: absolute; top: 0; left: 0; visibility: hidden; pointer-events: none; }
.arc-chat-thread-textarea { position: absolute; inset: 0; height: 100%; display: block; resize: none; overflow-y: auto; background: transparent; color: var(--foreground); outline: none; scrollbar-width: none; }
.arc-chat-thread-textarea::placeholder { color: var(--text-muted); }

.arc-chat-thread-send {
  position: relative; display: grid; width: 32px; height: 32px; flex: none; place-items: center; margin: 0 4px 4px 0; overflow: hidden; padding: 0;
  border: 0; border-radius: 50%; background: var(--surface-muted); color: var(--text-muted); cursor: default;
  -webkit-tap-highlight-color: transparent;
  transition: background-color var(--duration-standard) var(--ease-standard), color var(--duration-standard) var(--ease-standard), transform var(--duration-instant) var(--ease-standard);
}
.arc-chat-thread-send { background: transparent; color: var(--text-muted); }
.arc-chat-thread-send[data-ready] { background: var(--accent); color: var(--accent-foreground); cursor: pointer; }
.arc-chat-thread-send[data-ready]:active { transform: scale(.92); }
.arc-chat-thread-sendIcon { display: grid; grid-area: 1 / 1; place-items: center; }

.arc-chat-thread-srOnly { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

@media (max-width: 420px) {
  .arc-chat-thread-content { padding-inline: 12px; }
  .arc-chat-thread-stack { max-width: 84%; }
}
`;

const styles: Record<string, string> = new Proxy({
  "attach": "arc-chat-thread-attach",
  "author": "arc-chat-thread-author",
  "avatar": "arc-chat-thread-avatar",
  "box": "arc-chat-thread-box",
  "bubble": "arc-chat-thread-bubble",
  "composer": "arc-chat-thread-composer",
  "content": "arc-chat-thread-content",
  "countRoll": "arc-chat-thread-countRoll",
  "day": "arc-chat-thread-day",
  "dots": "arc-chat-thread-dots",
  "emoji": "arc-chat-thread-emoji",
  "face": "arc-chat-thread-face",
  "field": "arc-chat-thread-field",
  "file": "arc-chat-thread-file",
  "fileName": "arc-chat-thread-fileName",
  "fileSize": "arc-chat-thread-fileSize",
  "fileText": "arc-chat-thread-fileText",
  "gallery": "arc-chat-thread-gallery",
  "gutter": "arc-chat-thread-gutter",
  "image": "arc-chat-thread-image",
  "inputRow": "arc-chat-thread-inputRow",
  "line": "arc-chat-thread-line",
  "list": "arc-chat-thread-list",
  "meta": "arc-chat-thread-meta",
  "mirror": "arc-chat-thread-mirror",
  "more": "arc-chat-thread-more",
  "parts": "arc-chat-thread-parts",
  "pending": "arc-chat-thread-pending",
  "pendingFile": "arc-chat-thread-pendingFile",
  "pendingImage": "arc-chat-thread-pendingImage",
  "pendingName": "arc-chat-thread-pendingName",
  "pendingSize": "arc-chat-thread-pendingSize",
  "picker": "arc-chat-thread-picker",
  "pickerWrap": "arc-chat-thread-pickerWrap",
  "pill": "arc-chat-thread-pill",
  "reactButton": "arc-chat-thread-reactButton",
  "reaction": "arc-chat-thread-reaction",
  "reactionClip": "arc-chat-thread-reactionClip",
  "reactions": "arc-chat-thread-reactions",
  "reader": "arc-chat-thread-reader",
  "readers": "arc-chat-thread-readers",
  "receipts": "arc-chat-thread-receipts",
  "remove": "arc-chat-thread-remove",
  "retry": "arc-chat-thread-retry",
  "root": "arc-chat-thread-root",
  "row": "arc-chat-thread-row",
  "scroller": "arc-chat-thread-scroller",
  "send": "arc-chat-thread-send",
  "sendIcon": "arc-chat-thread-sendIcon",
  "srOnly": "arc-chat-thread-srOnly",
  "stack": "arc-chat-thread-stack",
  "status": "arc-chat-thread-status",
  "textarea": "arc-chat-thread-textarea",
  "track": "arc-chat-thread-track",
  "tray": "arc-chat-thread-tray",
  "trayClip": "arc-chat-thread-trayClip",
  "typing": "arc-chat-thread-typing",
  "viewport": "arc-chat-thread-viewport"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-chat-thread-${prop}`,
});



export interface ChatParticipant {
  id: string;
  name: string;
  /** Portrait URL. Initials show when it is missing. */
  avatar?: string;
}

export interface ChatAttachment {
  id: string;
  name: string;
  kind: "image" | "file";
  url?: string;
  /** Bytes. */
  size?: number;
  /** Intrinsic image size, used to reserve space before the image loads. */
  width?: number;
  height?: number;
  alt?: string;
}

export interface ChatReaction {
  emoji: string;
  count: number;
  /** The current user reacted with this emoji. */
  mine?: boolean;
}

export type ChatMessageStatus = "sending" | "sent" | "delivered" | "read" | "failed";

export interface ChatMessage {
  id: string;
  authorId: string;
  text?: string;
  createdAt: Date | string | number;
  attachments?: ChatAttachment[];
  reactions?: ChatReaction[];
  /** Delivery state of the current user's own messages. */
  status?: ChatMessageStatus;
}

export interface ChatDraft {
  text: string;
  files: File[];
}

export interface ChatThreadHandle {
  scrollToBottom: (smooth?: boolean) => void;
  focusComposer: () => void;
}

export interface ChatThreadProps {
  participants: ChatParticipant[];
  currentUserId: string;
  /** Controlled messages, oldest first. Leave it out to let the thread keep its own list. */
  messages?: ChatMessage[];
  defaultMessages?: ChatMessage[];
  /** Participant ids currently typing. */
  typing?: string[];
  /** The last message each participant has read, by participant id. Their avatar sits under that message and glides as it moves. */
  readBy?: Record<string, string>;
  /** Called with the composer's text and files. Uncontrolled threads also append the message themselves. */
  onSend?: (draft: ChatDraft) => void | Promise<void>;
  onReact?: (messageId: string, emoji: string) => void;
  onRetry?: (messageId: string) => void;
  /** Emoji offered by the reaction picker. */
  reactions?: string[];
  placeholder?: string;
  /** Show the composer. Defaults to true. */
  composer?: boolean;
  allowAttachments?: boolean;
  /** File types the attach button offers, as for `<input accept>`. */
  accept?: string;
  /** Messages from one person closer together than this, in ms, share a group. Defaults to five minutes. */
  groupWindow?: number;
  locale?: string;
  /** Accessible name of the message log. */
  label?: string;
  className?: string;
}

type Row =
  | { type: "day"; key: string; label: string }
  | { type: "message"; key: string; message: ChatMessage; author: ChatParticipant; mine: boolean; first: boolean; last: boolean; index: number };

const { spring, duration, ease, blur } = motionTokens;
const enter = [...ease.enter] as [number, number, number, number];
const standard = [...ease.standard] as [number, number, number, number];
const physical = (visualDuration: number, bounce: number): Transition => {
  const root = 2 * Math.PI / (visualDuration * 1.2);
  return { type: "spring", stiffness: root * root, damping: 2 * (1 - bounce) * root, mass: 1 };
};
const SETTLE = physical(.44, 0), GROW = physical(spring.smooth.visualDuration, 0), POP = physical(.3, .22), ARRIVE = physical(.46, .12);
const DEFAULT_REACTIONS = ["👍", "❤️", "😂", "🎉", "👀", "🙏"];
const STICK_DISTANCE = 48, FAR_DISTANCE = 180;

const subscribe = () => () => {};
function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

const toDate = (value: ChatMessage["createdAt"]) => value instanceof Date ? value : new Date(value);
const dayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

function dayLabel(date: Date, locale: string) {
  const today = new Date();
  const start = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const days = Math.round((start(today) - start(date)) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days > 1 && days < 7) return date.toLocaleDateString(locale, { weekday: "long" });
  return date.toLocaleDateString(locale, { weekday: "short", month: "short", day: "numeric", year: date.getFullYear() === today.getFullYear() ? undefined : "numeric" });
}

export function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join("");
}

function Avatar({ person, size }: { person: ChatParticipant; size: number }) {
  return <span className={styles.avatar} style={{ width: size, height: size, fontSize: size * .38 }} aria-hidden="true">
    {person.avatar
      // eslint-disable-next-line @next/next/no-img-element -- registry components stay framework agnostic
      ? <img src={person.avatar} alt="" width={size} height={size} loading="lazy" />
      : initials(person.name)}
  </span>;
}

/** A count that rolls up or down when it changes. */
function Count({ value, reduced }: { value: number; reduced: boolean }) {
  const [last, setLast] = useState({ value, direction: 1 });
  if (last.value !== value) setLast({ value, direction: value > last.value ? 1 : -1 });
  const direction = last.value !== value ? (value > last.value ? 1 : -1) : last.direction;
  return <span className={styles.countRoll}>
    <AnimatePresence initial={false} mode="popLayout" custom={direction}>
      <motion.span key={value} custom={direction}
        variants={{ in: (dir: number) => ({ opacity: 0, y: reduced ? 0 : dir * 8 }), rest: { opacity: 1, y: 0 }, out: (dir: number) => ({ opacity: 0, y: reduced ? 0 : dir * -8 }) }}
        initial="in" animate="rest" exit="out" transition={reduced ? { duration: duration.fast } : spring.snappy}>{value}</motion.span>
    </AnimatePresence>
  </span>;
}

/** Three dots that breathe in sequence. Reduced motion shows them still. */
function TypingDots() {
  return <span className={styles.dots} aria-hidden="true"><i /><i /><i /></span>;
}

function useAutoHeight(mirror: RefObject<HTMLElement | null>, maxHeight: number, reduced: boolean) {
  const height = useMotionValue<number | "auto">("auto");
  const measured = useRef(false);
  useLayoutEffect(() => {
    const node = mirror.current;
    if (!node) return;
    const fit = () => {
      const target = Math.min(maxHeight, node.offsetHeight);
      if (!measured.current || reduced) { height.jump(target); measured.current = true; return; }
      animate(height, target, GROW);
    };
    fit();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(fit);
    observer.observe(node);
    return () => observer.disconnect();
  }, [height, maxHeight, mirror, reduced]);
  return height;
}

type Pending = { id: string; file: File; url?: string };

export interface ChatComposerProps {
  onSend: (draft: ChatDraft) => void;
  placeholder?: string;
  allowAttachments?: boolean;
  accept?: string;
  disabled?: boolean;
  className?: string;
}

export interface ChatComposerHandle { focus: () => void }

/** The message box on its own: autosizing text, attachments by button, paste, or drop, and a send button that morphs when there is something to send. */
export const ChatComposer = forwardRef<ChatComposerHandle, ChatComposerProps>(function ChatComposer({ onSend, placeholder = "Message", allowAttachments = true, accept, disabled, className }, ref) {
  const reduced = !!useReducedMotion();
  const [text, setText] = useState("");
  const [files, setFiles] = useState<Pending[]>([]);
  const [dragging, setDragging] = useState(false);
  const [sent, setSent] = useState(0);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const pickerRef = useRef<HTMLInputElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const height = useAutoHeight(mirrorRef, 6 * 22 + 18, reduced);
  const ready = !disabled && (text.trim().length > 0 || files.length > 0);
  const counter = useRef(0);

  useImperativeHandle(ref, () => ({ focus: () => areaRef.current?.focus() }), []);

  const filesRef = useRef(files);
  useEffect(() => { filesRef.current = files; }, [files]);
  useEffect(() => () => filesRef.current.forEach(entry => entry.url && URL.revokeObjectURL(entry.url)), []);

  const add = (list: FileList | File[] | null) => {
    if (!allowAttachments || !list) return;
    const next = Array.from(list).slice(0, 10).map(file => ({ id: `file-${++counter.current}`, file, url: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined }));
    if (next.length) setFiles(current => [...current, ...next]);
  };
  const remove = (id: string) => setFiles(current => current.filter(entry => {
    if (entry.id === id && entry.url) URL.revokeObjectURL(entry.url);
    return entry.id !== id;
  }));

  const send = () => {
    if (!ready) return;
    onSend({ text: text.trim(), files: files.map(entry => entry.file) });
    files.forEach(entry => entry.url && URL.revokeObjectURL(entry.url));
    setFiles([]);
    setText("");
    setSent(count => count + 1);
    areaRef.current?.focus();
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  };
  const onPaste = (event: ReactClipboardEvent<HTMLTextAreaElement>) => {
    if (!allowAttachments || !event.clipboardData.files.length) return;
    event.preventDefault();
    add(event.clipboardData.files);
  };
  const onDrop = (event: ReactDragEvent<HTMLDivElement>) => {
    if (!allowAttachments) return;
    event.preventDefault();
    setDragging(false);
    add(event.dataTransfer.files);
  };

  const tray = reduced ? { opacity: 0 } : { opacity: 0, scale: .9, filter: `blur(${blur.subtle}px)` };

  return <div className={[styles.composer, className].filter(Boolean).join(" ")} data-dragging={dragging || undefined}
    onDragOver={event => { if (allowAttachments && event.dataTransfer.types.includes("Files")) { event.preventDefault(); setDragging(true); } }}
    onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false); }}
    onDrop={onDrop}>
    <AnimatePresence initial={false}>
      {files.length > 0 && <motion.div key="tray" className={styles.trayClip}
        initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
        transition={reduced ? { duration: 0 } : { height: GROW, opacity: { duration: duration.fast } }}>
        <ul className={styles.tray} aria-label="Attachments">
          <AnimatePresence initial={false} mode="popLayout">
            {files.map(entry => <motion.li key={entry.id} className={styles.pending} layout={!reduced}
              initial={tray} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} exit={{ ...tray, transition: { duration: duration.exit, ease: standard } }} transition={POP}>
              {entry.url
                // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
                ? <img className={styles.pendingImage} src={entry.url} alt="" />
                : <span className={styles.pendingFile}><FileText size={16} strokeWidth={1.75} aria-hidden="true" /><span className={styles.pendingName}>{entry.file.name}</span><span className={styles.pendingSize}>{formatBytes(entry.file.size)}</span></span>}
              <button type="button" className={styles.remove} aria-label={`Remove ${entry.file.name}`} onClick={() => remove(entry.id)}><X size={12} strokeWidth={2.25} /></button>
            </motion.li>)}
          </AnimatePresence>
        </ul>
      </motion.div>}
    </AnimatePresence>
    <div className={styles.inputRow}>
      {allowAttachments && <>
        <button type="button" className={styles.attach} aria-label="Attach files" disabled={disabled} onClick={() => pickerRef.current?.click()}><Paperclip size={18} strokeWidth={1.75} /></button>
        <input ref={pickerRef} type="file" multiple accept={accept} hidden onChange={event => { add(event.target.files); event.target.value = ""; }} />
      </>}
      <div className={styles.box}>
      <motion.div className={styles.field} style={{ height }}>
        <div ref={mirrorRef} className={styles.mirror} aria-hidden="true">{text}{"\u200b"}</div>
        <textarea ref={areaRef} className={styles.textarea} value={text} rows={1} placeholder={placeholder} disabled={disabled} aria-label={placeholder}
          onChange={event => setText(event.target.value)} onKeyDown={onKeyDown} onPaste={onPaste} />
      </motion.div>
      <button type="button" className={styles.send} data-ready={ready || undefined} aria-label="Send" aria-disabled={!ready} onClick={send}>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span key={sent} className={styles.sendIcon}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? { opacity: 0 } : { opacity: 0, y: -18, transition: { duration: duration.fast, ease: standard } }}
            transition={reduced ? { duration: duration.fast } : spring.snappy}>
            <ArrowUp size={16} strokeWidth={2.25} />
          </motion.span>
        </AnimatePresence>
      </button>
      </div>
    </div>
  </div>;
});

/**
 * A chat or support thread: grouped messages with day separators, reactions, read receipts that glide to the latest read message,
 * a typing indicator, and a composer. The list stays pinned to the newest message and offers a pill when new messages land out of view.
 */
export const ChatThread = forwardRef<ChatThreadHandle, ChatThreadProps>(function ChatThread({
  participants, currentUserId, messages: messagesProp, defaultMessages, typing = [], readBy, onSend, onReact, onRetry,
  reactions = DEFAULT_REACTIONS, placeholder = "Message", composer = true, allowAttachments = true, accept,
  groupWindow = 5 * 60_000, locale = "en-US", label = "Conversation", className,
}, ref) {
  const reduced = !!useReducedMotion();
  const hydrated = useHydrated();
  const uid = useId();
  const [inner, setInner] = useState<ChatMessage[]>(defaultMessages ?? []);
  const messages = messagesProp ?? inner;
  const controlled = messagesProp !== undefined;
  const people = useMemo(() => new Map(participants.map(entry => [entry.id, entry])), [participants]);
  const composerRef = useRef<ChatComposerHandle>(null);

  const rows = useMemo<Row[]>(() => {
    const out: Row[] = [];
    let lastDay = "";
    messages.forEach((message, index) => {
      const date = toDate(message.createdAt);
      const key = dayKey(date);
      if (key !== lastDay) { out.push({ type: "day", key: `day-${key}`, label: hydrated ? dayLabel(date, locale) : "" }); lastDay = key; }
      const joins = (other: ChatMessage | undefined) => !!other && other.authorId === message.authorId && dayKey(toDate(other.createdAt)) === key && Math.abs(toDate(other.createdAt).getTime() - date.getTime()) <= groupWindow;
      out.push({
        type: "message", key: message.id, message, index,
        author: people.get(message.authorId) ?? { id: message.authorId, name: "Unknown" },
        mine: message.authorId === currentUserId,
        first: !joins(messages[index - 1]), last: !joins(messages[index + 1]),
      });
    });
    return out;
  }, [currentUserId, groupWindow, hydrated, locale, messages, people]);

  const receipts = useMemo(() => {
    const map = new Map<string, ChatParticipant[]>();
    for (const [personId, messageId] of Object.entries(readBy ?? {})) {
      const who = people.get(personId);
      const read = messages.find(message => message.id === messageId);
      // A reader's avatar under their own message says nothing new, so it stays hidden until they read past it.
      if (!who || personId === currentUserId || !read || read.authorId === personId) continue;
      map.set(messageId, [...(map.get(messageId) ?? []), who]);
    }
    return map;
  }, [currentUserId, messages, people, readBy]);
  const readIndex = useMemo(() => {
    let furthest = -1;
    receipts.forEach((_, messageId) => { furthest = Math.max(furthest, messages.findIndex(message => message.id === messageId)); });
    return furthest;
  }, [messages, receipts]);
  const lastMine = useMemo(() => { for (let index = messages.length - 1; index >= 0; index--) if (messages[index].authorId === currentUserId) return index; return -1; }, [currentUserId, messages]);

  const time = useMemo(() => new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }), [locale]);

  /* Pinning. While the reader is at the bottom, every growth of the content keeps the newest message in view:
     the scroll jumps to the end before paint and the content springs up from where it was, so nothing snaps. */
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const stick = useRef(true);
  const lastHeight = useRef(0);
  const reducedRef = useRef(reduced);
  useEffect(() => { reducedRef.current = reduced; }, [reduced]);
  const [atBottom, setAtBottom] = useState(true);
  const [far, setFar] = useState(false);
  const [seen, setSeen] = useState(() => messages.length);

  useLayoutEffect(() => {
    const scroller = scrollRef.current, content = contentRef.current;
    if (!scroller || !content) return;
    lastHeight.current = content.offsetHeight;
    scroller.scrollTop = scroller.scrollHeight;
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const height = content.offsetHeight, delta = height - lastHeight.current;
      lastHeight.current = height;
      if (!stick.current) return;
      scroller.scrollTop = scroller.scrollHeight;
      if (delta > 0 && delta < scroller.clientHeight && !reducedRef.current) {
        y.jump(y.get() + delta);
        animate(y, 0, SETTLE);
      }
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, [y]);

  // Your own message always brings the thread back to the bottom.
  const known = useRef(new Set(messages.map(message => message.id)));
  useLayoutEffect(() => {
    const fresh = messages.filter(message => !known.current.has(message.id));
    fresh.forEach(message => known.current.add(message.id));
    if (fresh.some(message => message.authorId === currentUserId)) stick.current = true;
  }, [currentUserId, messages]);

  const onScroll = () => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const distance = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
    stick.current = distance < STICK_DISTANCE;
    setAtBottom(stick.current);
    setFar(distance > FAR_DISTANCE);
    if (stick.current) setSeen(messages.length);
  };

  const scrollToBottom = useCallback((smooth = true) => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    stick.current = true;
    scroller.scrollTo({ top: scroller.scrollHeight, behavior: smooth && !reducedRef.current ? "smooth" : "auto" });
  }, []);

  useImperativeHandle(ref, () => ({ scrollToBottom, focusComposer: () => composerRef.current?.focus() }), [scrollToBottom]);

  const unread = atBottom ? 0 : messages.slice(seen).filter(message => message.authorId !== currentUserId).length;
  const pill = !atBottom && (unread > 0 || far);

  /* Reactions and the picker. */
  const [picker, setPicker] = useState<string | null>(null);
  const react = (messageId: string, emoji: string) => {
    setPicker(null);
    onReact?.(messageId, emoji);
    if (controlled) return;
    setInner(current => current.map(message => {
      if (message.id !== messageId) return message;
      const list = [...(message.reactions ?? [])];
      const at = list.findIndex(entry => entry.emoji === emoji);
      if (at < 0) list.push({ emoji, count: 1, mine: true });
      else if (list[at].mine) list[at] = { ...list[at], count: list[at].count - 1, mine: false };
      else list[at] = { ...list[at], count: list[at].count + 1, mine: true };
      return { ...message, reactions: list.filter(entry => entry.count > 0) };
    }));
  };

  const counter = useRef(0);
  const send = (draft: ChatDraft) => {
    stick.current = true;
    const result = onSend?.(draft);
    if (controlled) return result;
    const attachments: ChatAttachment[] = draft.files.map((file, index) => ({
      id: `local-file-${++counter.current}-${index}`, name: file.name, size: file.size,
      kind: file.type.startsWith("image/") ? "image" : "file",
      url: URL.createObjectURL(file),
    }));
    setInner(current => [...current, { id: `local-${Date.now()}-${++counter.current}`, authorId: currentUserId, text: draft.text || undefined, attachments, createdAt: new Date(), status: "sent" }]);
  };

  const typers = typing.map(id => people.get(id)).filter((entry): entry is ChatParticipant => !!entry && entry.id !== currentUserId);
  const typingLabel = typers.length === 0 ? "" : typers.length === 1 ? `${typers[0].name.split(" ")[0]} is typing` : typers.length === 2 ? `${typers[0].name.split(" ")[0]} and ${typers[1].name.split(" ")[0]} are typing` : "Several people are typing";

  const arrive = (mine: boolean) => reduced ? { opacity: 0 } : { opacity: 0, scale: .92, y: 14, x: mine ? 8 : -8, filter: `blur(${blur.subtle}px)` };

  return <div className={[styles.root, className].filter(Boolean).join(" ")}>
    <div className={styles.viewport}>
      <div ref={scrollRef} className={styles.scroller} onScroll={onScroll} data-chat-scroller="">
        <div className={styles.track}>
          <motion.div ref={contentRef} className={styles.content} style={{ y }}>
            <ol className={styles.list} role="log" aria-label={label} aria-live="polite" aria-relevant="additions">
              <AnimatePresence initial={false}>
                {rows.map(row => {
                  if (row.type === "day") return <li key={row.key} className={styles.day}><span suppressHydrationWarning>{row.label}</span></li>;
                  const { message, author, mine, first, last, index } = row;
                  const date = toDate(message.createdAt);
                  const seenBy = receipts.get(message.id) ?? [];
                  const showStatus = index === lastMine && mine;
                  const status = message.status === "failed" ? "failed" : message.status === "sending" ? "sending" : readIndex >= index ? "read" : message.status ?? "sent";
                  const images = message.attachments?.filter(entry => entry.kind === "image" && entry.url) ?? [];
                  const files = message.attachments?.filter(entry => entry.kind !== "image" || !entry.url) ?? [];
                  return <motion.li key={row.key} className={styles.row} data-mine={mine || undefined} data-first={first || undefined} data-last={last || undefined} data-failed={message.status === "failed" || undefined}
                    initial={arrive(mine)} animate={{ opacity: 1, scale: 1, y: 0, x: 0, filter: "blur(0px)" }} exit={{ opacity: 0, transition: { duration: duration.exit } }}
                    transition={reduced ? { duration: duration.fast } : { ...ARRIVE, opacity: { duration: duration.standard, ease: enter }, filter: { duration: duration.standard, ease: enter } }}
                    style={{ transformOrigin: mine ? "100% 100%" : "0 100%" }}>
                    {!mine && <div className={styles.gutter} />}
                    <div className={styles.stack}>
                      {first && <p className={styles.meta}>
                        {!mine && <span className={styles.author}>{author.name}</span>}
                        <time dateTime={date.toISOString()} suppressHydrationWarning>{hydrated ? time.format(date) : ""}</time>
                      </p>}
                      <div className={styles.line}>
                        {!mine && last && <span className={styles.face}><Avatar person={author} size={28} /></span>}
                        <div className={styles.parts}>
                          {images.length > 0 && <div className={styles.gallery} data-count={Math.min(images.length, 4)}>
                            {images.slice(0, 4).map((image, at) => <a key={image.id} className={styles.image} href={image.url} target="_blank" rel="noreferrer"
                              style={images.length === 1 && image.width && image.height ? { aspectRatio: `${image.width} / ${image.height}` } : undefined}>
                              {/* eslint-disable-next-line @next/next/no-img-element -- registry components stay framework agnostic */}
                              <img src={image.url} alt={image.alt ?? image.name} loading="lazy" />
                              {at === 3 && images.length > 4 && <span className={styles.more}>+{images.length - 4}</span>}
                            </a>)}
                          </div>}
                          {files.map(file => <a key={file.id} className={styles.file} href={file.url} download={file.name} target="_blank" rel="noreferrer">
                            <FileText size={18} strokeWidth={1.75} aria-hidden="true" />
                            <span className={styles.fileText}><span className={styles.fileName}>{file.name}</span>{file.size !== undefined && <span className={styles.fileSize}>{formatBytes(file.size)}</span>}</span>
                          </a>)}
                          {message.text && <div className={styles.bubble} title={hydrated ? date.toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" }) : undefined}>{message.text}</div>}
                        </div>
                        <ReactionPicker open={picker === message.id} mine={mine} reactions={reactions} reduced={reduced} id={`${uid}-picker-${message.id}`}
                          onToggle={() => setPicker(current => current === message.id ? null : message.id)} onClose={() => setPicker(null)} onPick={emoji => react(message.id, emoji)} />
                      </div>
                      <AnimatePresence initial={false}>
                        {!!message.reactions?.length && <motion.div key="reactions" className={styles.reactionClip}
                          initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={reduced ? { duration: 0 } : { height: GROW, opacity: { duration: duration.fast } }}>
                          <ul className={styles.reactions} aria-label="Reactions">
                            <AnimatePresence initial={false} mode="popLayout">
                              {message.reactions.map(reaction => <motion.li key={reaction.emoji} layout={!reduced}
                                initial={reduced ? { opacity: 0 } : { opacity: 0, scale: .6 }} animate={{ opacity: 1, scale: 1 }} exit={reduced ? { opacity: 0 } : { opacity: 0, scale: .6 }} transition={POP}>
                                <button type="button" className={styles.reaction} aria-pressed={!!reaction.mine} aria-label={`${reaction.emoji} ${reaction.count}${reaction.mine ? ", including you" : ""}`} onClick={() => react(message.id, reaction.emoji)}>
                                  <span aria-hidden="true">{reaction.emoji}</span><Count value={reaction.count} reduced={reduced} />
                                </button>
                              </motion.li>)}
                            </AnimatePresence>
                          </ul>
                        </motion.div>}
                      </AnimatePresence>
                      {(showStatus || seenBy.length > 0) && <div className={styles.receipts}>
                        {showStatus && <span className={styles.status} data-status={status}>
                          {status === "failed" ? <>Not delivered{onRetry && <button type="button" className={styles.retry} onClick={() => onRetry(message.id)}><RotateCw size={12} strokeWidth={2} aria-hidden="true" />Retry</button>}</>
                            : status === "sending" ? "Sending" : status === "read" ? "Read" : status === "delivered" ? "Delivered" : "Sent"}
                        </span>}
                        {seenBy.length > 0 && <span className={styles.readers} aria-label={`Read by ${seenBy.map(entry => entry.name).join(", ")}`}>
                          {seenBy.map(entry => <motion.span key={entry.id} layoutId={reduced ? undefined : `${uid}-receipt-${entry.id}`} className={styles.reader} transition={SETTLE}>
                            <Avatar person={entry} size={16} />
                          </motion.span>)}
                        </span>}
                      </div>}
                    </div>
                  </motion.li>;
                })}
                {typers.length > 0 && <motion.li key="typing" className={styles.row} data-first data-last aria-hidden="true"
                  initial={reduced ? { opacity: 0 } : { opacity: 0, scale: .9, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={reduced ? { opacity: 0 } : { opacity: 0, scale: .9, transition: { duration: duration.exit, ease: standard } }}
                  transition={reduced ? { duration: duration.fast } : spring.snappy} style={{ transformOrigin: "0 100%" }}>
                  <div className={styles.gutter} />
                  <div className={styles.stack}><div className={styles.line}><span className={styles.face}><Avatar person={typers[0]} size={28} /></span><div className={`${styles.bubble} ${styles.typing}`}><TypingDots /></div></div></div>
                </motion.li>}
              </AnimatePresence>
            </ol>
          </motion.div>
        </div>
      </div>
      <span className={styles.srOnly} role="status">{typingLabel}</span>
      <AnimatePresence>
        {pill && <motion.button key="pill" type="button" className={styles.pill} onClick={() => scrollToBottom()} layout={!reduced}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: .94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: .94, transition: { duration: duration.exit, ease: standard } }}
          transition={reduced ? { duration: duration.fast } : { ...spring.morph, opacity: { duration: duration.fast } }}>
          <ArrowDown size={14} strokeWidth={2} aria-hidden="true" />
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span key={unread > 0 ? "new" : "latest"} initial={{ opacity: 0, filter: `blur(${blur.subtle}px)` }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: `blur(${blur.subtle}px)` }} transition={{ duration: duration.fast }}>
              {unread > 0 ? <><Count value={unread} reduced={reduced} /> new {unread === 1 ? "message" : "messages"}</> : "Jump to latest"}
            </motion.span>
          </AnimatePresence>
        </motion.button>}
      </AnimatePresence>
    </div>
    {composer && <ChatComposer ref={composerRef} onSend={send} placeholder={placeholder} allowAttachments={allowAttachments} accept={accept} />}
  </div>;
});

function ReactionPicker({ open, mine, reactions, reduced, id, onToggle, onClose, onPick }: { open: boolean; mine: boolean; reactions: string[]; reduced: boolean; id: string; onToggle: () => void; onClose: () => void; onPick: (emoji: string) => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [active, setActive] = useState(0);
  const [below, setBelow] = useState(false);
  /** The picker opens above the bubble unless that would run past the top of the thread. */
  const toggle = () => {
    const wrap = wrapRef.current, scroller = wrap?.closest("[data-chat-scroller]");
    if (!open && wrap && scroller) setBelow(wrap.getBoundingClientRect().top - scroller.getBoundingClientRect().top < 56);
    onToggle();
  };

  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    if (!open) return;
    const down = (event: PointerEvent) => { if (!wrapRef.current?.contains(event.target as Node)) closeRef.current(); };
    document.addEventListener("pointerdown", down);
    const frame = requestAnimationFrame(() => wrapRef.current?.querySelector<HTMLElement>("[data-emoji-index='0']")?.focus({ preventScroll: true }));
    return () => { document.removeEventListener("pointerdown", down); cancelAnimationFrame(frame); };
  }, [open]);

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); onClose(); triggerRef.current?.focus(); return; }
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (active + step + reactions.length) % reactions.length;
    setActive(next);
    wrapRef.current?.querySelector<HTMLElement>(`[data-emoji-index='${next}']`)?.focus();
  };

  return <div ref={wrapRef} className={styles.pickerWrap} data-open={open || undefined} data-below={below || undefined}>
    <button ref={triggerRef} type="button" className={styles.reactButton} aria-label="Add reaction" aria-expanded={open} aria-controls={open ? id : undefined} onClick={toggle}>
      <SmilePlus size={16} strokeWidth={1.75} />
    </button>
    <AnimatePresence>
      {open && <motion.div id={id} role="group" aria-label="Reactions" className={styles.picker} data-mine={mine || undefined} onKeyDown={onKeyDown}
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: .85, y: below ? -6 : 6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={reduced ? { opacity: 0 } : { opacity: 0, scale: .9, y: below ? -4 : 4, transition: { duration: duration.exit, ease: standard } }}
        transition={reduced ? { duration: duration.fast } : POP}>
        {reactions.map((emoji, index) => <motion.button key={emoji} type="button" className={styles.emoji} aria-label={`React with ${emoji}`} data-emoji-index={index} tabIndex={index === active ? 0 : -1}
          initial={reduced ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ ...POP, delay: reduced ? 0 : index * .025 }}
          onFocus={() => setActive(index)} onClick={() => onPick(emoji)}>{emoji}</motion.button>)}
      </motion.div>}
    </AnimatePresence>
  </div>;
}

export default ChatThread;
