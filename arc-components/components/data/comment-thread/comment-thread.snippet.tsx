"use client";

import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import type { Transition, Variants } from "motion/react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { Check, ChevronRight, CornerDownRight, RotateCcw, SmilePlus, X } from "lucide-react";
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
const ARC_COMMENT_THREAD_STYLES = `.arc-comment-thread-root {
  width: 100%;
  min-width: 0;
  border: 1px solid var(--border);
  border-radius: var(--radius-panel);
  background: var(--surface);
  color: var(--foreground);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  letter-spacing: var(--tracking-body);
  line-height: var(--leading-body);
  transition: border-radius var(--duration-spring) var(--ease-spring);
}
.arc-comment-thread-root *, .arc-comment-thread-root *::before, .arc-comment-thread-root *::after { box-sizing: border-box; }
.arc-comment-thread-root[data-resolved] { border-radius: 22px; }
.arc-comment-thread-autoHeight { overflow: hidden; border-radius: inherit; }
.arc-comment-thread-autoInner { position: relative; }

/* Header */
.arc-comment-thread-thread { display: grid; }
.arc-comment-thread-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 12px 8px 18px; }
.arc-comment-thread-heading { display: grid; min-width: 0; }
.arc-comment-thread-title { margin: 0; overflow: hidden; font-size: var(--text-sm); font-weight: 500; text-overflow: ellipsis; white-space: nowrap; }
.arc-comment-thread-subtitle { color: var(--text-muted); font-size: var(--text-xs); font-variant-numeric: tabular-nums; }
.arc-comment-thread-resolve,
.arc-comment-thread-reopen {
  display: inline-flex;
  height: 32px;
  flex: none;
  align-items: center;
  gap: 6px;
  padding: 0 12px 0 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  background: var(--surface);
  color: var(--foreground);
  cursor: pointer;
  font: inherit;
  font-size: var(--text-xs);
  font-weight: 500;
  transition: background-color var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard), transform var(--duration-instant) var(--ease-standard);
}
.arc-comment-thread-resolve > svg { color: var(--success); }
.arc-comment-thread-resolve:active:not(:disabled), .arc-comment-thread-reopen:active { transform: scale(.97); }
.arc-comment-thread-resolve:disabled { opacity: .45; cursor: default; }

/* Comments */
.arc-comment-thread-list, .arc-comment-thread-replies { display: grid; margin: 0; padding: 0; list-style: none; }
.arc-comment-thread-list { padding: 0 8px; }
.arc-comment-thread-item { overflow: clip; overflow-clip-margin: 4px; }
.arc-comment-thread-repliesWrap { overflow: clip; }
/* Replies hang from a quiet rail under their parent's avatar. */
.arc-comment-thread-replies { position: relative; margin-left: 24px; padding-left: 12px; }
.arc-comment-thread-replies::before { content: ""; position: absolute; top: 2px; bottom: 14px; left: 0; width: 1px; background: var(--border); }

.arc-comment-thread-comment { display: flex; gap: 10px; padding: 10px; border-radius: 16px; }
.arc-comment-thread-avatar { display: inline-grid; flex: none; place-items: center; overflow: hidden; border-radius: 50%; background: var(--surface-muted); color: var(--text-secondary); font-size: 10px; font-weight: 500; object-fit: cover; }
.arc-comment-thread-deletedDot { width: 28px; height: 28px; flex: none; border: 1px dashed var(--border-strong); border-radius: 50%; }
.arc-comment-thread-main { display: grid; min-width: 0; flex: 1; gap: 2px; }
.arc-comment-thread-meta { display: flex; min-width: 0; align-items: baseline; gap: 8px; }
.arc-comment-thread-name { overflow: hidden; font-weight: 500; text-overflow: ellipsis; white-space: nowrap; }
.arc-comment-thread-time { flex: none; color: var(--text-muted); font-size: var(--text-xs); }
.arc-comment-thread-body { margin: 0; color: var(--text-secondary); overflow-wrap: anywhere; white-space: pre-wrap; text-wrap: pretty; }
.arc-comment-thread-mention { color: var(--accent-strong); font-weight: 500; }
.arc-comment-thread-deleted { margin: 4px 0 0; color: var(--text-muted); font-style: italic; }

.arc-comment-thread-footer { display: flex; min-height: 30px; flex-wrap: wrap; align-items: center; gap: 4px 8px; margin-top: 4px; }
.arc-comment-thread-reactions { display: flex; flex-wrap: wrap; gap: 4px; }
.arc-comment-thread-reaction {
  display: inline-flex;
  height: 26px;
  align-items: center;
  gap: 5px;
  padding: 0 9px 0 7px;
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  background: var(--surface);
  color: var(--text-secondary);
  cursor: pointer;
  font: inherit;
  font-size: var(--text-xs);
  font-weight: 500;
  transition: background-color var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard);
}
.arc-comment-thread-reaction[aria-pressed="true"] { border-color: color-mix(in oklch, var(--accent) 45%, var(--border)); background: var(--accent-subtle); color: var(--foreground); }
.arc-comment-thread-reaction:active { transform: scale(.94); }
.arc-comment-thread-count { position: relative; display: inline-grid; min-width: 1ch; overflow: hidden; font-variant-numeric: tabular-nums; }
.arc-comment-thread-count > span { grid-area: 1 / 1; }

/* Actions sit quietly after the reactions and come forward on hover or focus; touch screens always show them. */
.arc-comment-thread-actions { display: flex; min-height: 28px; flex-wrap: wrap; align-items: center; gap: 2px; transition: opacity var(--duration-fast) var(--ease-standard); }
.arc-comment-thread-action,
.arc-comment-thread-iconAction {
  display: inline-flex;
  height: 28px;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  border: 0;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  font: inherit;
  font-size: var(--text-xs);
  font-weight: 500;
  -webkit-tap-highlight-color: transparent;
  transition: background-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard);
}
.arc-comment-thread-iconAction { width: 28px; padding: 0; }
.arc-comment-thread-action[data-tone="danger"] { color: var(--danger); }
.arc-comment-thread-prompt { margin-right: 4px; color: var(--foreground); font-size: var(--text-xs); }
.arc-comment-thread-emoji { display: grid; width: 32px; height: 32px; place-items: center; padding: 0; border: 0; border-radius: 50%; background: transparent; cursor: pointer; font-size: 17px; line-height: 1; transition: background-color var(--duration-fast) var(--ease-standard), transform var(--duration-instant) var(--ease-standard); }
.arc-comment-thread-emoji[aria-pressed="true"] { background: var(--accent-subtle); }
.arc-comment-thread-emoji:active { transform: scale(.88); }

.arc-comment-thread-toggle { display: inline-flex; width: fit-content; height: 28px; align-items: center; gap: 6px; margin: 2px 0 0 -6px; padding: 0 8px 0 6px; border: 0; border-radius: var(--radius-pill); background: transparent; color: var(--text-secondary); cursor: pointer; font: inherit; font-size: var(--text-xs); font-weight: 500; transition: background-color var(--duration-fast) var(--ease-standard); }
.arc-comment-thread-toggleIcon { display: grid; place-items: center; color: var(--text-muted); }
.arc-comment-thread-stack { display: inline-flex; flex: none; padding-left: 4px; }
.arc-comment-thread-stack > * { margin-left: -5px; box-shadow: 0 0 0 2px var(--surface); }

.arc-comment-thread-empty { margin: 0; padding: 8px 18px 16px; color: var(--text-muted); }

/* Composer */
.arc-comment-thread-composerArea { display: grid; margin-top: 4px; padding: 10px 12px 12px; border-top: 1px solid var(--border-subtle); }
.arc-comment-thread-replying { overflow: clip; }
.arc-comment-thread-replyingInner { display: flex; align-items: center; gap: 6px; padding: 0 2px 8px 38px; color: var(--text-secondary); font-size: var(--text-xs); }
.arc-comment-thread-replyingInner .arc-comment-thread-iconAction { width: 22px; height: 22px; margin-left: 2px; }
.arc-comment-thread-replyingName { color: var(--foreground); font-weight: 500; }

.arc-comment-thread-composer { display: grid; align-items: start; gap: 8px 10px; grid-template-columns: auto minmax(0, 1fr) auto; }
.arc-comment-thread-composer > .arc-comment-thread-avatar { margin-top: 5px; }
.arc-comment-thread-composer[data-compact] { grid-template-columns: minmax(0, 1fr); margin-top: 4px; }
.arc-comment-thread-fieldWrap { display: grid; min-width: 0; }
.arc-comment-thread-field {
  width: 100%;
  min-height: 38px;
  max-height: 160px;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--surface);
  color: var(--foreground);
  font: inherit;
  resize: none;
  field-sizing: content;
  transition: border-color var(--duration-fast) var(--ease-standard);
}
.arc-comment-thread-field::placeholder { color: var(--text-muted); }
.arc-comment-thread-field:focus { border-color: var(--border-strong); }
.arc-comment-thread-composerActions { display: flex; align-items: center; gap: 4px; }
.arc-comment-thread-composer[data-compact] .arc-comment-thread-composerActions { justify-content: flex-end; }
.arc-comment-thread-send,
.arc-comment-thread-ghost { height: 38px; padding: 0 14px; border: 0; border-radius: var(--radius-pill); cursor: pointer; font: inherit; font-weight: 500; transition: background-color var(--duration-fast) var(--ease-standard), opacity var(--duration-fast) var(--ease-standard), transform var(--duration-instant) var(--ease-standard); }
.arc-comment-thread-composer[data-compact] :is(.arc-comment-thread-send, .arc-comment-thread-ghost) { height: 32px; font-size: var(--text-xs); }
.arc-comment-thread-send { background: var(--foreground); color: var(--background); }
.arc-comment-thread-send:disabled { opacity: .35; cursor: default; }
.arc-comment-thread-send:active:not(:disabled), .arc-comment-thread-ghost:active { transform: scale(.97); }
.arc-comment-thread-ghost { background: transparent; color: var(--text-secondary); }

.arc-comment-thread-suggestions { display: grid; margin: 6px 0 0; padding: 4px; overflow: clip; border: 1px solid var(--border); border-radius: 14px; background: var(--surface-raised); list-style: none; }
.arc-comment-thread-suggestion { display: flex; align-items: center; gap: 8px; min-height: 32px; padding: 0 8px; border-radius: 10px; cursor: pointer; }
.arc-comment-thread-suggestion[aria-selected="true"] { background: var(--surface-muted); }

/* Resolved chip */
.arc-comment-thread-resolved { display: flex; align-items: center; gap: 12px; padding: 10px 10px 10px 14px; }
.arc-comment-thread-resolvedIcon { display: grid; width: 24px; height: 24px; flex: none; place-items: center; border-radius: 50%; background: color-mix(in oklch, var(--success) 14%, transparent); color: var(--success); }
.arc-comment-thread-resolvedText { display: grid; min-width: 0; flex: 1; }
.arc-comment-thread-resolvedTitle { overflow: hidden; font-weight: 500; text-overflow: ellipsis; white-space: nowrap; }
.arc-comment-thread-resolvedSubject { color: var(--text-secondary); font-weight: 400; }
.arc-comment-thread-resolvedMeta { color: var(--text-muted); font-size: var(--text-xs); font-variant-numeric: tabular-nums; }

@media (hover: hover) and (pointer: fine) {
  .arc-comment-thread-comment .arc-comment-thread-actions:not([data-open]) { opacity: 0; }
  .arc-comment-thread-comment:hover .arc-comment-thread-actions,
  .arc-comment-thread-comment:focus-within .arc-comment-thread-actions { opacity: 1; }
  .arc-comment-thread-action:hover, .arc-comment-thread-iconAction:hover, .arc-comment-thread-toggle:hover, .arc-comment-thread-ghost:hover { background: var(--surface-muted); color: var(--foreground); }
  .arc-comment-thread-action[data-tone="danger"]:hover { background: color-mix(in oklch, var(--danger) 9%, transparent); color: var(--danger); }
  .arc-comment-thread-reaction:hover { border-color: var(--border-strong); }
  .arc-comment-thread-emoji:hover { background: var(--surface-muted); }
  .arc-comment-thread-resolve:hover:not(:disabled), .arc-comment-thread-reopen:hover { border-color: var(--border-strong); background: var(--surface-muted); }
  .arc-comment-thread-send:hover:not(:disabled) { background: color-mix(in oklch, var(--foreground) 86%, var(--background)); }
}
.arc-comment-thread-action:focus-visible, .arc-comment-thread-iconAction:focus-visible, .arc-comment-thread-toggle:focus-visible, .arc-comment-thread-emoji:focus-visible { background: var(--surface-muted); color: var(--foreground); }

@media (max-width: 420px) {
  .arc-comment-thread-composer { grid-template-columns: minmax(0, 1fr) auto; }
  .arc-comment-thread-composer > .arc-comment-thread-avatar { display: none; }
  .arc-comment-thread-replyingInner { padding-left: 2px; }
  .arc-comment-thread-replies { margin-left: 12px; }
}

@media (prefers-reduced-motion: reduce) {
  .arc-comment-thread-root, .arc-comment-thread-actions, .arc-comment-thread-reaction, .arc-comment-thread-action, .arc-comment-thread-iconAction, .arc-comment-thread-emoji, .arc-comment-thread-send, .arc-comment-thread-ghost, .arc-comment-thread-resolve, .arc-comment-thread-reopen { transition: none; }
}
`;

const styles: Record<string, string> = new Proxy({
  "action": "arc-comment-thread-action",
  "actions": "arc-comment-thread-actions",
  "autoHeight": "arc-comment-thread-autoHeight",
  "autoInner": "arc-comment-thread-autoInner",
  "avatar": "arc-comment-thread-avatar",
  "body": "arc-comment-thread-body",
  "comment": "arc-comment-thread-comment",
  "composer": "arc-comment-thread-composer",
  "composerActions": "arc-comment-thread-composerActions",
  "composerArea": "arc-comment-thread-composerArea",
  "count": "arc-comment-thread-count",
  "deleted": "arc-comment-thread-deleted",
  "deletedDot": "arc-comment-thread-deletedDot",
  "emoji": "arc-comment-thread-emoji",
  "empty": "arc-comment-thread-empty",
  "field": "arc-comment-thread-field",
  "fieldWrap": "arc-comment-thread-fieldWrap",
  "footer": "arc-comment-thread-footer",
  "ghost": "arc-comment-thread-ghost",
  "header": "arc-comment-thread-header",
  "heading": "arc-comment-thread-heading",
  "iconAction": "arc-comment-thread-iconAction",
  "item": "arc-comment-thread-item",
  "list": "arc-comment-thread-list",
  "main": "arc-comment-thread-main",
  "mention": "arc-comment-thread-mention",
  "meta": "arc-comment-thread-meta",
  "name": "arc-comment-thread-name",
  "prompt": "arc-comment-thread-prompt",
  "reaction": "arc-comment-thread-reaction",
  "reactions": "arc-comment-thread-reactions",
  "reopen": "arc-comment-thread-reopen",
  "replies": "arc-comment-thread-replies",
  "repliesWrap": "arc-comment-thread-repliesWrap",
  "replying": "arc-comment-thread-replying",
  "replyingInner": "arc-comment-thread-replyingInner",
  "replyingName": "arc-comment-thread-replyingName",
  "resolve": "arc-comment-thread-resolve",
  "resolved": "arc-comment-thread-resolved",
  "resolvedIcon": "arc-comment-thread-resolvedIcon",
  "resolvedMeta": "arc-comment-thread-resolvedMeta",
  "resolvedSubject": "arc-comment-thread-resolvedSubject",
  "resolvedText": "arc-comment-thread-resolvedText",
  "resolvedTitle": "arc-comment-thread-resolvedTitle",
  "root": "arc-comment-thread-root",
  "send": "arc-comment-thread-send",
  "stack": "arc-comment-thread-stack",
  "subtitle": "arc-comment-thread-subtitle",
  "suggestion": "arc-comment-thread-suggestion",
  "suggestions": "arc-comment-thread-suggestions",
  "thread": "arc-comment-thread-thread",
  "time": "arc-comment-thread-time",
  "title": "arc-comment-thread-title",
  "toggle": "arc-comment-thread-toggle",
  "toggleIcon": "arc-comment-thread-toggleIcon"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-comment-thread-${prop}`,
});



export interface CommentAuthor {
  id: string;
  name: string;
  /** Square image URL. Initials are shown without one. */
  avatar?: string;
}

export interface CommentReaction {
  emoji: string;
  /** Ids of the people who reacted. */
  users: string[];
}

export interface ThreadComment {
  id: string;
  author: CommentAuthor;
  /** Plain text. "@Full Name" mentions of known people are highlighted. */
  body: string;
  /** Display label such as "2h" or "Sep 18". */
  createdAt: string;
  edited?: boolean;
  /** A deleted comment that still has replies keeps its place as a quiet placeholder. */
  deleted?: boolean;
  reactions?: CommentReaction[];
  replies?: ThreadComment[];
}

/** What changed, for syncing to a server. `comments` on `onCommentsChange` is always the full next tree. */
export type CommentThreadEvent =
  | { type: "reply"; comment: ThreadComment; parentId: string | null }
  | { type: "edit"; id: string; body: string }
  | { type: "delete"; id: string }
  | { type: "react"; id: string; emoji: string; added: boolean };

/**
 * A threaded discussion: replies nest under their comment and collapse, reactions toggle with a count that rolls,
 * authors edit and delete their own comments in place, mentions autocomplete in the composer, and resolving folds the
 * whole thread into a single chip that reopens it. Controlled with `comments` and `resolved`, or uncontrolled.
 */
export interface CommentThreadProps {
  comments?: ThreadComment[];
  defaultComments?: ThreadComment[];
  onCommentsChange?: (comments: ThreadComment[], event: CommentThreadEvent) => void;
  /** The person writing. Their comments can be edited and deleted. */
  currentUser: CommentAuthor;
  /** People who can be mentioned. Defaults to everyone in the thread. */
  people?: CommentAuthor[];
  resolved?: boolean;
  defaultResolved?: boolean;
  onResolvedChange?: (resolved: boolean) => void;
  /** What the thread is about, shown in its header, such as "Hero headline". */
  title?: ReactNode;
  /** Emoji offered by the reaction picker. */
  reactions?: string[];
  placeholder?: string;
  /** Replies deeper than this attach to the deepest allowed parent. Defaults to 2. */
  maxDepth?: number;
  /** Label for comments written now. */
  nowLabel?: string;
  className?: string;
}

type Bezier = [number, number, number, number];
const enter = [...motionTokens.ease.enter] as Bezier;
const standard = [...motionTokens.ease.standard] as Bezier;
const physical = (visualDuration: number, bounce: number): Transition => {
  const root = 2 * Math.PI / (visualDuration * 1.2);
  return { type: "spring", stiffness: root * root, damping: 2 * (1 - bounce) * root, mass: 1 };
};
const HEIGHT = physical(.42, 0);
const DEFAULT_REACTIONS = ["👍", "❤️", "🎉", "👀", "🚀", "✅"];

const subscribe = () => () => {};
function useReducedFlag() {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  return !!useReducedMotion() && hydrated;
}

/* Tree helpers. Every change returns a new tree so controlled parents can store it as is. */
const mapTree = (list: ThreadComment[], id: string, fn: (comment: ThreadComment) => ThreadComment | null): ThreadComment[] =>
  list.flatMap(comment => {
    if (comment.id === id) { const next = fn(comment); return next ? [next] : []; }
    return comment.replies?.length ? [{ ...comment, replies: mapTree(comment.replies, id, fn) }] : [comment];
  });
const countTree = (list: ThreadComment[]): number => list.reduce((sum, comment) => sum + (comment.deleted ? 0 : 1) + countTree(comment.replies ?? []), 0);
const authorsOf = (list: ThreadComment[], into = new Map<string, CommentAuthor>()) => {
  list.forEach(comment => { if (!comment.deleted) into.set(comment.author.id, comment.author); authorsOf(comment.replies ?? [], into); });
  return into;
};
/** Path of ids from the root to `id`. */
const pathTo = (list: ThreadComment[], id: string, trail: string[] = []): string[] | null => {
  for (const comment of list) {
    if (comment.id === id) return [...trail, id];
    const found = pathTo(comment.replies ?? [], id, [...trail, comment.id]);
    if (found) return found;
  }
  return null;
};
const find = (list: ThreadComment[], id: string): ThreadComment | null => {
  for (const comment of list) {
    if (comment.id === id) return comment;
    const found = find(comment.replies ?? [], id);
    if (found) return found;
  }
  return null;
};
const initials = (name: string) => name.split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase();
let serial = 0;
const newId = () => `c-${Date.now().toString(36)}-${(serial++).toString(36)}`;

function Avatar({ author, size = 28 }: { author: CommentAuthor; size?: number }) {
  return author.avatar
    // eslint-disable-next-line @next/next/no-img-element
    ? <img className={styles.avatar} src={author.avatar} alt="" width={size} height={size} style={{ width: size, height: size }} />
    : <span className={styles.avatar} style={{ width: size, height: size }} aria-hidden="true">{initials(author.name)}</span>;
}

/** Highlights "@Full Name" for known people. */
function Body({ text, people }: { text: string; people: CommentAuthor[] }) {
  const parts = useMemo(() => {
    const names = people.map(person => person.name).sort((a, b) => b.length - a.length).map(name => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    if (!names.length) return [text];
    return text.split(new RegExp(`(@(?:${names.join("|")}))`, "g"));
  }, [people, text]);
  return <p className={styles.body}>{parts.map((part, index) => index % 2 ? <span key={index} className={styles.mention}>{part}</span> : part)}</p>;
}

const roll: Variants = {
  hidden: (dir: number) => ({ y: `${dir * 70}%`, opacity: 0 }),
  shown: { y: 0, opacity: 1 },
  gone: (dir: number) => ({ y: `${dir * -70}%`, opacity: 0 }),
};
const rollReduced: Variants = { hidden: { opacity: 0 }, shown: { opacity: 1 }, gone: { opacity: 0 } };

/** Rolls a count up or down in place. */
function Count({ value, reduced }: { value: number; reduced: boolean }) {
  const [last, setLast] = useState(value);
  const [dir, setDir] = useState(1);
  if (value !== last) { setDir(value > last ? 1 : -1); setLast(value); }
  return <span className={styles.count}>
    <AnimatePresence mode="popLayout" initial={false} custom={dir}>
      <motion.span key={value} custom={dir} variants={reduced ? rollReduced : roll} initial="hidden" animate="shown" exit="gone"
        transition={reduced ? { duration: 0 } : motionTokens.spring.snappy}>{value}</motion.span>
    </AnimatePresence>
  </span>;
}

/** Follows its content's height exactly, except when `morphKey` changes: then it springs, so the thread and the resolved chip morph into each other. */
function AutoHeight({ children, reduced, morphKey }: { children: ReactNode; reduced: boolean; morphKey: string }) {
  const inner = useRef<HTMLDivElement>(null);
  const height = useMotionValue(0);
  const [measured, setMeasured] = useState(false);
  const morphing = useRef(false);
  const lastKey = useRef(morphKey);
  useLayoutEffect(() => {
    if (lastKey.current !== morphKey) { lastKey.current = morphKey; morphing.current = true; }
  }, [morphKey]);
  useLayoutEffect(() => {
    const node = inner.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const next = node.offsetHeight;
      if (morphing.current && !reduced) {
        morphing.current = false;
        animate(height, next, HEIGHT);
        return;
      }
      if (height.isAnimating()) { animate(height, next, HEIGHT); return; }
      height.jump(next);
      setMeasured(true);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [height, reduced]);
  return <motion.div className={styles.autoHeight} style={{ height: measured ? height : "auto" }}><div ref={inner} className={styles.autoInner}>{children}</div></motion.div>;
}

interface ComposerProps {
  people: CommentAuthor[];
  initial?: string;
  placeholder: string;
  submitLabel: string;
  autoFocus?: boolean;
  focusKey?: number;
  onSubmit: (body: string) => void;
  onCancel?: () => void;
  leading?: ReactNode;
  compact?: boolean;
}

/** A growing text field with @mention suggestions. ⌘ or Ctrl + Enter sends; Escape cancels. */
function Composer({ people, initial = "", placeholder, submitLabel, autoFocus, focusKey, onSubmit, onCancel, leading, compact }: ComposerProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const field = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState(initial);
  const [query, setQuery] = useState<{ start: number; term: string } | null>(null);
  const [active, setActive] = useState(0);
  const suggestions = useMemo(() => {
    if (!query) return [];
    const term = query.term.toLowerCase();
    return people.filter(person => person.name.toLowerCase().split(" ").some(part => part.startsWith(term)) || person.name.toLowerCase().startsWith(term)).slice(0, 5);
  }, [people, query]);
  const open = !!query && suggestions.length > 0;

  useEffect(() => {
    if (!autoFocus && !focusKey) return;
    const node = field.current;
    if (!node) return;
    node.focus({ preventScroll: true });
    node.setSelectionRange(node.value.length, node.value.length);
  }, [autoFocus, focusKey]);

  const readQuery = (value: string, caret: number) => {
    const match = /(^|\s)@([\p{L}]*)$/u.exec(value.slice(0, caret));
    setQuery(match ? { start: caret - match[2].length - 1, term: match[2] } : null);
    setActive(0);
  };

  const insert = (person: CommentAuthor) => {
    const node = field.current;
    if (!node || !query) return;
    const caret = node.selectionStart ?? text.length;
    const next = `${text.slice(0, query.start)}@${person.name} ${text.slice(caret)}`;
    const at = query.start + person.name.length + 2;
    setText(next);
    setQuery(null);
    requestAnimationFrame(() => { node.focus(); node.setSelectionRange(at, at); });
  };

  const send = () => {
    const body = text.trim();
    if (!body) return;
    onSubmit(body);
    setText("");
    setQuery(null);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (open) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setActive(index => (index + (event.key === "ArrowDown" ? 1 : -1) + suggestions.length) % suggestions.length); return; }
      if (event.key === "Enter" || event.key === "Tab") { event.preventDefault(); insert(suggestions[active]); return; }
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); setQuery(null); return; }
    }
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) { event.preventDefault(); send(); return; }
    if (event.key === "Escape" && onCancel) { event.preventDefault(); event.stopPropagation(); onCancel(); }
  };

  return <div className={styles.composer} data-compact={compact || undefined}>
    {leading}
    <div className={styles.fieldWrap}>
      <textarea ref={field} className={styles.field} value={text} placeholder={placeholder} rows={1} aria-label={placeholder}
        role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={`${uid}-people`} aria-activedescendant={open ? `${uid}-person-${active}` : undefined}
        onChange={event => { setText(event.target.value); readQuery(event.target.value, event.target.selectionStart); }}
        onSelect={event => readQuery(event.currentTarget.value, event.currentTarget.selectionStart)}
        onBlur={() => setQuery(null)} onKeyDown={onKeyDown} />
      <AnimatePresence>
        {open && <motion.ul key="people" id={`${uid}-people`} role="listbox" aria-label="People" className={styles.suggestions}
          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0, transition: { duration: .12, ease: standard } }} transition={{ height: HEIGHT, opacity: { duration: .16, ease: enter } }}>
          {suggestions.map((person, index) => <li key={person.id} id={`${uid}-person-${index}`} role="option" aria-selected={index === active} className={styles.suggestion}
            onPointerDown={event => event.preventDefault()} onPointerMove={() => setActive(index)} onClick={() => insert(person)}>
            <Avatar author={person} size={20} />{person.name}
          </li>)}
        </motion.ul>}
      </AnimatePresence>
    </div>
    <div className={styles.composerActions}>
      {onCancel && <button type="button" className={styles.ghost} onClick={onCancel}>Cancel</button>}
      <button type="button" className={styles.send} disabled={!text.trim() || text.trim() === initial.trim()} onClick={send}>{submitLabel}</button>
    </div>
  </div>;
}

type Ui = { editing: string | null; confirming: string | null; picker: string | null; collapsed: Record<string, boolean> };

export const CommentThread = forwardRef<HTMLElement, CommentThreadProps>(function CommentThread({
  comments, defaultComments = [], onCommentsChange, currentUser, people, resolved, defaultResolved = false, onResolvedChange,
  title, reactions = DEFAULT_REACTIONS, placeholder = "Reply, or @mention someone", maxDepth = 2, nowLabel = "Just now", className,
}, forwardedRef) {
  const reduced = useReducedFlag();
  const rootRef = useRef<HTMLElement>(null);
  useImperativeHandle(forwardedRef, () => rootRef.current as HTMLElement);
  const [internal, setInternal] = useState(defaultComments);
  const list = comments ?? internal;
  const [internalResolved, setInternalResolved] = useState(defaultResolved);
  const isResolved = resolved ?? internalResolved;
  const [ui, setUi] = useState<Ui>({ editing: null, confirming: null, picker: null, collapsed: {} });
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [focusKey, setFocusKey] = useState(0);

  const mentionable = useMemo(() => people ?? [...authorsOf(list, new Map([[currentUser.id, currentUser]])).values()], [currentUser, list, people]);
  const total = countTree(list);
  const participants = useMemo(() => [...authorsOf(list).values()], [list]);

  const commit = useCallback((next: ThreadComment[], event: CommentThreadEvent) => {
    if (comments === undefined) setInternal(next);
    onCommentsChange?.(next, event);
  }, [comments, onCommentsChange]);

  const setResolved = (next: boolean) => {
    if (resolved === undefined) setInternalResolved(next);
    onResolvedChange?.(next);
    setUi(current => ({ ...current, editing: null, confirming: null, picker: null }));
    setReplyTo(null);
    requestAnimationFrame(() => rootRef.current?.querySelector<HTMLElement>(next ? "[data-reopen]" : "[data-resolve]")?.focus({ preventScroll: true }));
  };

  const addReply = (body: string) => {
    const comment: ThreadComment = { id: newId(), author: currentUser, body, createdAt: nowLabel, reactions: [] };
    let parentId: string | null = null;
    if (replyTo) {
      const path = pathTo(list, replyTo.id) ?? [];
      parentId = path[Math.min(path.length, maxDepth) - 1] ?? null;
    }
    const next = parentId ? mapTree(list, parentId, parent => ({ ...parent, replies: [...(parent.replies ?? []), comment] })) : [...list, comment];
    if (parentId) setUi(current => ({ ...current, collapsed: { ...current.collapsed, [parentId!]: false } }));
    commit(next, { type: "reply", comment, parentId });
    setReplyTo(null);
  };

  const edit = (id: string, body: string) => {
    commit(mapTree(list, id, comment => ({ ...comment, body, edited: true })), { type: "edit", id, body });
    setUi(current => ({ ...current, editing: null }));
  };

  const remove = (id: string) => {
    commit(mapTree(list, id, comment => comment.replies?.length ? { ...comment, deleted: true, body: "", reactions: [] } : null), { type: "delete", id });
    setUi(current => ({ ...current, confirming: null }));
    if (replyTo?.id === id) setReplyTo(null);
  };

  const react = (id: string, emoji: string) => {
    const target = find(list, id);
    if (!target) return;
    const existing = target.reactions?.find(reaction => reaction.emoji === emoji);
    const added = !existing?.users.includes(currentUser.id);
    const nextReactions = existing
      ? (target.reactions ?? []).map(reaction => reaction.emoji !== emoji ? reaction : { ...reaction, users: added ? [...reaction.users, currentUser.id] : reaction.users.filter(user => user !== currentUser.id) }).filter(reaction => reaction.users.length)
      : [...(target.reactions ?? []), { emoji, users: [currentUser.id] }];
    commit(mapTree(list, id, comment => ({ ...comment, reactions: nextReactions })), { type: "react", id, emoji, added });
    setUi(current => ({ ...current, picker: null }));
  };

  const grow = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: .12 } }
    : { initial: { height: 0, opacity: 0 }, animate: { height: "auto", opacity: 1 }, exit: { height: 0, opacity: 0 }, transition: { height: HEIGHT, opacity: { duration: .2, ease: enter } } };

  const renderComment = (comment: ThreadComment, depth: number): ReactNode => {
    const mine = comment.author.id === currentUser.id;
    const replies = comment.replies ?? [];
    const collapsed = !!ui.collapsed[comment.id];
    const editing = ui.editing === comment.id, confirming = ui.confirming === comment.id, picking = ui.picker === comment.id;
    return <motion.li key={comment.id} className={styles.item} {...grow}>
      <article className={styles.comment} aria-label={comment.deleted ? "Deleted comment" : `${comment.author.name}, ${comment.createdAt}`}>
        {comment.deleted ? <span className={styles.deletedDot} aria-hidden="true" /> : <Avatar author={comment.author} />}
        <div className={styles.main}>
          {comment.deleted
            ? <p className={styles.deleted}>This comment was deleted</p>
            : <>
              <header className={styles.meta}>
                <span className={styles.name}>{comment.author.name}</span>
                <span className={styles.time}>{comment.createdAt}{comment.edited && " · edited"}</span>
              </header>
              {editing
                ? <Composer people={mentionable} initial={comment.body} placeholder="Edit comment" submitLabel="Save" autoFocus compact onSubmit={body => edit(comment.id, body)} onCancel={() => setUi(current => ({ ...current, editing: null }))} />
                : <Body text={comment.body} people={mentionable} />}

              {!editing && <div className={styles.footer}>
                {(comment.reactions ?? []).length > 0 && <div className={styles.reactions}>
                  <AnimatePresence initial={false} mode="popLayout">
                    {(comment.reactions ?? []).map(reaction => {
                      const pressed = reaction.users.includes(currentUser.id);
                      return <motion.button key={reaction.emoji} type="button" layout={!reduced} className={styles.reaction} aria-pressed={pressed}
                        aria-label={`${reaction.emoji} ${reaction.users.length}${pressed ? ", including you" : ""}`} onClick={() => react(comment.id, reaction.emoji)}
                        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: .7 }} animate={{ opacity: 1, scale: 1 }} exit={reduced ? { opacity: 0 } : { opacity: 0, scale: .7 }}
                        transition={reduced ? { duration: 0 } : motionTokens.spring.snappy}>
                        <span aria-hidden="true">{reaction.emoji}</span><Count value={reaction.users.length} reduced={reduced} />
                      </motion.button>;
                    })}
                  </AnimatePresence>
                </div>}

                <AnimatePresence mode="wait" initial={false}>
                  {confirming
                    ? <motion.div key="confirm" className={styles.actions} data-open="" initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: .16, ease: enter }}
                      onKeyDown={event => { if (event.key === "Escape") { event.stopPropagation(); setUi(current => ({ ...current, confirming: null })); } }}>
                      <span className={styles.prompt}>Delete this comment?</span>
                      <button type="button" className={styles.action} onClick={() => setUi(current => ({ ...current, confirming: null }))}>Cancel</button>
                      <button type="button" className={styles.action} data-tone="danger" autoFocus onClick={() => remove(comment.id)}>Delete</button>
                    </motion.div>
                    : picking
                    ? <motion.div key="picker" role="group" aria-label="Reactions" className={styles.actions} data-open=""
                      onKeyDown={event => { if (event.key === "Escape") { event.stopPropagation(); setUi(current => ({ ...current, picker: null })); } }}
                      initial={reduced ? { opacity: 0 } : { opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, transition: { duration: .1 } }} transition={{ duration: .16, ease: enter }}>
                      {reactions.map((emoji, index) => <motion.button key={emoji} type="button" className={styles.emoji} autoFocus={index === 0} aria-label={`React with ${emoji}`}
                        aria-pressed={!!comment.reactions?.find(reaction => reaction.emoji === emoji)?.users.includes(currentUser.id)} onClick={() => react(comment.id, emoji)}
                        initial={reduced ? false : { opacity: 0, scale: .6 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...motionTokens.spring.snappy, delay: index * motionTokens.stagger.item }}>{emoji}</motion.button>)}
                      <button type="button" className={styles.iconAction} aria-label="Close reactions" onClick={() => setUi(current => ({ ...current, picker: null }))}><X size={14} strokeWidth={1.75} aria-hidden="true" /></button>
                    </motion.div>
                    : <motion.div key="actions" className={styles.actions} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .12, ease: standard }}>
                      <button type="button" className={styles.iconAction} aria-label="Add reaction" onClick={() => setUi(current => ({ ...current, picker: comment.id, confirming: null }))}>
                        <SmilePlus size={15} strokeWidth={1.75} aria-hidden="true" />
                      </button>
                      <button type="button" className={styles.action} onClick={() => { setReplyTo({ id: comment.id, name: comment.author.name }); setFocusKey(key => key + 1); }}>Reply</button>
                      {mine && <button type="button" className={styles.action} onClick={() => setUi(current => ({ ...current, editing: comment.id, confirming: null, picker: null }))}>Edit</button>}
                      {mine && <button type="button" className={styles.action} onClick={() => setUi(current => ({ ...current, confirming: comment.id, editing: null, picker: null }))}>Delete</button>}
                    </motion.div>}
                </AnimatePresence>
              </div>}
            </>}

          {replies.length > 0 && <button type="button" className={styles.toggle} aria-expanded={!collapsed}
            onClick={() => setUi(current => ({ ...current, collapsed: { ...current.collapsed, [comment.id]: !collapsed } }))}>
            <motion.span className={styles.toggleIcon} initial={false} animate={{ rotate: collapsed ? 0 : 90 }} transition={reduced ? { duration: 0 } : motionTokens.spring.snappy} aria-hidden="true">
              <ChevronRight size={13} strokeWidth={1.75} />
            </motion.span>
            {collapsed ? `Show ${countTree(replies)} ${countTree(replies) === 1 ? "reply" : "replies"}` : "Hide replies"}
            {collapsed && <span className={styles.stack} aria-hidden="true">{[...authorsOf(replies).values()].slice(0, 3).map(author => <Avatar key={author.id} author={author} size={18} />)}</span>}
          </button>}
        </div>
      </article>

      <AnimatePresence initial={false}>
        {replies.length > 0 && !collapsed && <motion.div key="replies" className={styles.repliesWrap} {...grow}>
          <ul className={styles.replies} data-depth={depth + 1}>
            <AnimatePresence initial={false}>{replies.map(reply => renderComment(reply, depth + 1))}</AnimatePresence>
          </ul>
        </motion.div>}
      </AnimatePresence>
    </motion.li>;
  };

  const face = { initial: reduced ? { opacity: 0 } : { opacity: 0, filter: `blur(${motionTokens.blur.subtle}px)` }, animate: { opacity: 1, filter: "blur(0px)" }, exit: { opacity: 0, filter: reduced ? "blur(0px)" : `blur(${motionTokens.blur.subtle}px)` }, transition: { duration: .2, ease: enter } };

  return <section ref={rootRef} className={[styles.root, className].filter(Boolean).join(" ")} data-resolved={isResolved || undefined} aria-label="Comment thread">
    <AutoHeight reduced={reduced} morphKey={isResolved ? "resolved" : "thread"}>
      <AnimatePresence mode="popLayout" initial={false}>
        {isResolved
          ? <motion.div key="resolved" className={styles.resolved} {...face}>
            <span className={styles.resolvedIcon} aria-hidden="true"><Check size={14} strokeWidth={2} /></span>
            <span className={styles.resolvedText}>
              <span className={styles.resolvedTitle}>Resolved{title ? <> · <span className={styles.resolvedSubject}>{title}</span></> : null}</span>
              <span className={styles.resolvedMeta}>{total} {total === 1 ? "comment" : "comments"} · {participants.length} {participants.length === 1 ? "person" : "people"}</span>
            </span>
            <span className={styles.stack} aria-hidden="true">{participants.slice(0, 3).map(author => <Avatar key={author.id} author={author} size={22} />)}</span>
            <button type="button" className={styles.reopen} data-reopen onClick={() => setResolved(false)}><RotateCcw size={14} strokeWidth={1.75} aria-hidden="true" />Reopen</button>
          </motion.div>
          : <motion.div key="thread" className={styles.thread} {...face}>
            <header className={styles.header}>
              <div className={styles.heading}>
                {title && <h3 className={styles.title}>{title}</h3>}
                <span className={styles.subtitle}>{total} {total === 1 ? "comment" : "comments"}</span>
              </div>
              <button type="button" className={styles.resolve} data-resolve disabled={!total} onClick={() => setResolved(true)}><Check size={15} strokeWidth={1.75} aria-hidden="true" />Resolve</button>
            </header>

            {list.length > 0
              ? <ul className={styles.list}><AnimatePresence initial={false}>{list.map(comment => renderComment(comment, 0))}</AnimatePresence></ul>
              : <p className={styles.empty}>No comments yet. Start the conversation below.</p>}

            <div className={styles.composerArea}>
              <AnimatePresence initial={false}>
                {replyTo && <motion.div key="replying" className={styles.replying} {...grow}>
                  <span className={styles.replyingInner}>
                    <CornerDownRight size={13} strokeWidth={1.75} aria-hidden="true" />
                    <span>Replying to <span className={styles.replyingName}>{replyTo.name}</span></span>
                    <button type="button" className={styles.iconAction} aria-label="Cancel reply" onClick={() => setReplyTo(null)}><X size={14} strokeWidth={1.75} aria-hidden="true" /></button>
                  </span>
                </motion.div>}
              </AnimatePresence>
              <Composer people={mentionable} placeholder={placeholder} submitLabel="Send" focusKey={focusKey} onSubmit={addReply}
                onCancel={replyTo ? () => setReplyTo(null) : undefined} leading={<Avatar author={currentUser} />} />
            </div>
          </motion.div>}
      </AnimatePresence>
    </AutoHeight>
  </section>;
});

export default CommentThread;
