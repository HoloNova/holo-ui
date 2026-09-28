"use client";

import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronRight, File, Folder, FolderOpen } from "lucide-react";
import { useId, useRef, useState } from "react";

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
const ARC_TREE_VIEW_STYLES = `.arc-tree-view-tree { display: block; width: 100%; min-width: 0; box-sizing: border-box; padding: 6px 8px 8px; border: 1px solid var(--border); border-radius: 16px; background: var(--surface); color: var(--foreground); overflow: hidden; }
/* Rows clip only while their height animates (Motion sets overflow), so the selection can glide between them unclipped. */
.arc-tree-view-row { position: relative; display: flow-root; min-width: 0; height: 38px; }
.arc-tree-view-item { position: relative; display: flex; width: 100%; min-width: 0; height: 36px; margin-top: 2px; align-items: center; gap: 8px; padding: 0 10px; padding-left: calc(10px + (var(--tree-depth) - 1) * 18px); border: 0; border-radius: 10px; background: transparent; color: var(--text-secondary); font: inherit; font-size: var(--text-sm); line-height: 1; text-align: left; cursor: pointer; outline: none; transition: color var(--duration-fast) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard); }
/* Selection changes color only; a heavier weight would reflow the label. */
.arc-tree-view-item[aria-selected="true"] { color: var(--foreground); }
/* One ring drawn inside the row, so it clears the tree's clipped edge; the global button outline would add a second ring outside it. */
.arc-tree-view-item:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: -2px; }
.arc-tree-view-selection { position: absolute; inset: 0; z-index: 0; border-radius: 10px; background: var(--surface-muted); }
.arc-tree-view-branch { position: absolute; top: 4px; bottom: 4px; left: calc(18px + (var(--tree-depth) - 2) * 18px); z-index: 1; width: 1px; background: var(--border); transform-origin: top; pointer-events: none; }
.arc-tree-view-disclosure, .arc-tree-view-icon, .arc-tree-view-label { position: relative; z-index: 1; }
.arc-tree-view-disclosure { display: grid; width: 14px; height: 16px; flex: 0 0 14px; place-items: center; color: var(--text-muted); }
.arc-tree-view-icon { display: grid; width: 16px; height: 16px; flex: 0 0 16px; place-items: center; color: var(--text-muted); transition: color var(--duration-fast) var(--ease-standard); }
.arc-tree-view-folder { color: var(--text-secondary); }
.arc-tree-view-item[aria-expanded="true"] .arc-tree-view-folder, .arc-tree-view-item[aria-selected="true"] .arc-tree-view-folder { color: var(--foreground); }
.arc-tree-view-folderGlyph { position: absolute; inset: 0; display: grid; place-items: center; }
.arc-tree-view-typescript { color: color-mix(in oklch, #3178c6 78%, var(--foreground)); }
.arc-tree-view-stylesheet { color: color-mix(in oklch, #8b6ace 73%, var(--foreground)); }
.arc-tree-view-markdown { color: color-mix(in oklch, #38896b 74%, var(--foreground)); }
.arc-tree-view-json { color: color-mix(in oklch, #c48637 78%, var(--foreground)); }
.arc-tree-view-label { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
@media (hover: hover) and (pointer: fine) { .arc-tree-view-item:hover { background: var(--surface-muted); color: var(--foreground); } }
@media (prefers-reduced-motion: reduce) { .arc-tree-view-item, .arc-tree-view-icon { transition: none; } }
`;

const styles: Record<string, string> = new Proxy({
  "branch": "arc-tree-view-branch",
  "disclosure": "arc-tree-view-disclosure",
  "folder": "arc-tree-view-folder",
  "folderGlyph": "arc-tree-view-folderGlyph",
  "icon": "arc-tree-view-icon",
  "item": "arc-tree-view-item",
  "json": "arc-tree-view-json",
  "label": "arc-tree-view-label",
  "markdown": "arc-tree-view-markdown",
  "row": "arc-tree-view-row",
  "selection": "arc-tree-view-selection",
  "stylesheet": "arc-tree-view-stylesheet",
  "tree": "arc-tree-view-tree",
  "typescript": "arc-tree-view-typescript"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-tree-view-${prop}`,
});



export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  icon?: ReactNode;
}

export interface TreeViewProps {
  nodes: TreeNode[];
  defaultExpandedIds?: string[];
  expandedIds?: string[];
  onExpandedChange?: (expandedIds: string[]) => void;
  onSelect?: (node: TreeNode) => void;
  "aria-label"?: string;
}

type VisibleNode = {
  node: TreeNode;
  depth: number;
  parentId?: string;
  position: number;
  setSize: number;
};

/** A row is 36px plus the 2px gap above it; both collapse together, so nothing snaps when a row leaves. */
const rowHeight = 38;
const still = { duration: 0 } as const;
const fadeIn = { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] } as const;
const fadeOut = { duration: motionTokens.duration.instant, ease: [...motionTokens.ease.standard] } as const;
const blur = (px: number) => `blur(${px}px)`;

function flatten(nodes: TreeNode[], expanded: ReadonlySet<string>, depth = 1, parentId?: string): VisibleNode[] {
  return nodes.flatMap((node, index) => [
    { node, depth, parentId, position: index + 1, setSize: nodes.length },
    ...(node.children && expanded.has(node.id) ? flatten(node.children, expanded, depth + 1, node.id) : []),
  ]);
}

function fileTone(label: string, classNames: Record<string, string>) {
  const name = label.toLowerCase();
  if (name.endsWith(".tsx") || name.endsWith(".ts")) return classNames.typescript;
  if (name.endsWith(".css")) return classNames.stylesheet;
  if (name.endsWith(".md")) return classNames.markdown;
  if (name.endsWith(".json")) return classNames.json;
  return classNames.file;
}

/** Same markup with or without reduced motion, so the server render always hydrates cleanly; only the transition changes. */
function FolderIcon({ open, reduced }: { open: boolean; reduced: boolean }) {
  return <AnimatePresence initial={false} mode="popLayout">
    <motion.span
      key={open ? "open" : "closed"}
      className={styles.folderGlyph}
      initial={reduced ? false : { opacity: 0, scale: .6, filter: blur(motionTokens.blur.subtle) }}
      animate={{ opacity: 1, scale: 1, filter: blur(0) }}
      exit={reduced ? { opacity: 0, transition: still } : { opacity: 0, scale: .6, filter: blur(motionTokens.blur.subtle), transition: fadeOut }}
      transition={reduced ? still : { ...motionTokens.spring.snappy, opacity: fadeIn, filter: fadeIn }}
    >{open ? <FolderOpen size={16} strokeWidth={1.7} /> : <Folder size={16} strokeWidth={1.7} />}</motion.span>
  </AnimatePresence>;
}

export function TreeView({ nodes, defaultExpandedIds = [], expandedIds, onExpandedChange, onSelect, "aria-label": ariaLabel = "File tree" }: TreeViewProps) {
  const reduced = useReducedMotion() ?? false;
  const selectionLayoutId = `tree-selection-${useId()}`;
  const [internalExpanded, setInternalExpanded] = useState(() => new Set(defaultExpandedIds));
  const [focusedId, setFocusedId] = useState<string | null>(nodes[0]?.id ?? null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  /** The folder that opened last; its new children fade in one after another, then everything else stays still. */
  const [openedId, setOpenedId] = useState<string | null>(null);
  const refs = useRef(new Map<string, HTMLButtonElement>());
  const expanded = expandedIds ? new Set(expandedIds) : internalExpanded;
  const visible = flatten(nodes, expanded);
  const focusableId = visible.some(({ node }) => node.id === focusedId) ? focusedId : (visible[0]?.node.id ?? null);
  const openedIndex = visible.findIndex(({ node }) => node.id === openedId);

  function setExpanded(next: Set<string>) {
    if (!expandedIds) setInternalExpanded(next);
    onExpandedChange?.([...next]);
  }

  function toggle(node: TreeNode) {
    if (!node.children?.length) return;
    const next = new Set(expanded);
    if (next.has(node.id)) next.delete(node.id); else { next.add(node.id); setOpenedId(node.id); }
    setExpanded(next);
  }

  function focus(id: string) {
    setFocusedId(id);
    const row = refs.current.get(id);
    if (row) row.focus();
    else requestAnimationFrame(() => refs.current.get(id)?.focus());
  }

  function select(node: TreeNode) {
    setSelectedId(node.id);
    onSelect?.(node);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, item: VisibleNode, index: number) {
    const { node } = item;
    if (event.key === "ArrowDown") { event.preventDefault(); focus(visible[Math.min(index + 1, visible.length - 1)].node.id); return; }
    if (event.key === "ArrowUp") { event.preventDefault(); focus(visible[Math.max(index - 1, 0)].node.id); return; }
    if (event.key === "Home") { event.preventDefault(); focus(visible[0].node.id); return; }
    if (event.key === "End") { event.preventDefault(); focus(visible[visible.length - 1].node.id); return; }
    if (event.key === "ArrowRight" && node.children?.length) {
      event.preventDefault();
      if (!expanded.has(node.id)) toggle(node);
      else if (visible[index + 1]?.parentId === node.id) focus(visible[index + 1].node.id);
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (node.children?.length && expanded.has(node.id)) toggle(node);
      else if (item.parentId) focus(item.parentId);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      select(node);
      if (node.children?.length) toggle(node);
    }
  }

  return <div className={styles.tree} role="tree" aria-label={ariaLabel} aria-multiselectable="false">
    <AnimatePresence initial={false} mode="sync">
      {visible.map((item, index) => {
        const hasChildren = Boolean(item.node.children?.length);
        const isExpanded = hasChildren && expanded.has(item.node.id);
        const isSelected = selectedId === item.node.id;
        // Only rows that mount use this delay: the space opens in one motion and the new children follow in order.
        const delay = openedIndex >= 0 && index > openedIndex ? Math.min(index - openedIndex - 1, 7) * motionTokens.stagger.item : 0;
        return <motion.div
          key={item.node.id}
          className={styles.row}
          layout={reduced ? false : "position"}
          initial={reduced ? false : { height: 0, opacity: 0, x: -6, overflow: "hidden" }}
          animate={{ height: rowHeight, opacity: 1, x: 0, transitionEnd: { overflow: "visible" }, transition: reduced ? still : { height: motionTokens.spring.smooth, opacity: { ...fadeIn, delay }, x: { ...motionTokens.spring.smooth, delay } } }}
          exit={reduced ? { opacity: 0, transition: still } : { height: 0, opacity: 0, x: -4, overflow: "hidden", pointerEvents: "none", transition: { height: motionTokens.spring.smooth, opacity: fadeOut, x: fadeOut } }}
          transition={reduced ? still : { layout: motionTokens.spring.smooth }}
        >
          <button
            ref={element => { if (element) refs.current.set(item.node.id, element); else refs.current.delete(item.node.id); }}
            type="button"
            className={styles.item}
            role="treeitem"
            aria-level={item.depth}
            aria-posinset={item.position}
            aria-setsize={item.setSize}
            aria-expanded={hasChildren ? isExpanded : undefined}
            aria-selected={isSelected}
            tabIndex={focusableId === item.node.id ? 0 : -1}
            style={{ "--tree-depth": item.depth } as CSSProperties}
            onFocus={() => setFocusedId(item.node.id)}
            onKeyDown={event => onKeyDown(event, item, index)}
            onClick={() => { setFocusedId(item.node.id); select(item.node); if (hasChildren) toggle(item.node); }}
          >
            {isSelected && <motion.span
              aria-hidden="true"
              layoutId={selectionLayoutId}
              className={styles.selection}
              transition={reduced ? still : motionTokens.spring.morph}
            />}
            {item.depth > 1 && <motion.span
              aria-hidden="true"
              className={styles.branch}
              initial={reduced ? false : { opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={reduced ? still : { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter], delay }}
            />}
            <motion.span
              className={styles.disclosure}
              aria-hidden="true"
              initial={false}
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={reduced ? still : motionTokens.spring.snappy}
            >{hasChildren ? <ChevronRight size={14} strokeWidth={1.9} /> : null}</motion.span>
            <span className={[styles.icon, hasChildren ? styles.folder : fileTone(item.node.label, styles)].join(" ")} aria-hidden="true">
              {item.node.icon ?? (hasChildren ? <FolderIcon open={isExpanded} reduced={reduced} /> : <File size={16} strokeWidth={1.7} />)}
            </span>
            <span className={styles.label}>{item.node.label}</span>
          </button>
        </motion.div>;
      })}
    </AnimatePresence>
  </div>;
}

export default TreeView;
