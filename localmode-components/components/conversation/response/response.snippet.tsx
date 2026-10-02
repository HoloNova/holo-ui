"use client";

import * as React from "react";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Inlined cn utility ---

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


// --- Inlined markdown renderer ---

/**
 * @file markdown.tsx
 * @description Minimal, dependency-free, streaming-safe markdown renderer used by
 * `Response` and `Message`. It handles the common subset (headings, bold/italic,
 * inline code, fenced code blocks, links, lists, blockquotes) and — crucially —
 * tolerates *partial* markdown (an unterminated code fence during local token
 * streaming) without throwing or breaking layout.
 *
 * This keeps the copied component zero-extra-dependency. If you prefer a richer
 * renderer, swap `renderMarkdown` for `streamdown` or `react-markdown` +
 * `remark-gfm` in your copy — the call sites only depend on the
 * `(markdown: string) => ReactNode` shape.
 */

/** Escape inner HTML-special characters for safe text rendering. */
function escapeText(text: string) {
  return text;
}

/** Render inline markdown spans (bold, italic, inline code, links) into nodes. */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Combined tokenizer for `code`, **bold**, *italic*, [text](url).
  const pattern =
    /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(escapeText(text.slice(lastIndex, match.index)));
    }
    const token = match[0];
    const key = `${keyPrefix}-i${i++}`;
    if (token.startsWith('`')) {
      nodes.push(
        <code
          key={key}
          className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith('**')) {
      nodes.push(
        <strong key={key} className="font-semibold">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith('*')) {
      nodes.push(
        <em key={key} className="italic">
          {token.slice(1, -1)}
        </em>,
      );
    } else {
      // link [text](url)
      const m = /\[([^\]]+)\]\(([^)]+)\)/.exec(token);
      if (m) {
        nodes.push(
          <a
            key={key}
            href={m[2]}
            target="_blank"
            rel="noreferrer noopener"
            className="text-primary underline underline-offset-2"
          >
            {m[1]}
          </a>,
        );
      } else {
        nodes.push(token);
      }
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(escapeText(text.slice(lastIndex)));
  }
  return nodes;
}

/**
 * Render a markdown string to React nodes. Streaming-safe: an unterminated
 * code fence is rendered as an open code block rather than throwing.
 */
export function renderMarkdown(markdown: string): React.ReactNode {
  const lines = markdown.split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block (tolerates a missing closing fence at stream end).
    const fence = /^```(\w*)\s*$/.exec(line);
    if (fence) {
      const lang = fence[1];
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      // Skip the closing fence if present; if absent we've hit stream end.
      if (i < lines.length) i++;
      blocks.push(
        <pre
          key={`b${key++}`}
          className="my-2 overflow-x-auto rounded-md border border-border bg-muted/50 p-3 text-sm"
          data-language={lang || undefined}
        >
          <code className="font-mono">{codeLines.join('\n')}</code>
        </pre>,
      );
      continue;
    }

    // Heading
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const Tag = `h${Math.min(level + 2, 6)}` as keyof React.JSX.IntrinsicElements;
      blocks.push(
        <Tag key={`b${key++}`} className="mt-3 mb-1 font-semibold">
          {renderInline(heading[2], `h${key}`)}
        </Tag>,
      );
      i++;
      continue;
    }

    // Blockquote
    if (/^>\s?/.test(line)) {
      const quoteLines: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push(
        <blockquote
          key={`b${key++}`}
          className="my-2 border-l-2 border-border pl-3 text-muted-foreground italic"
        >
          {renderInline(quoteLines.join(' '), `q${key}`)}
        </blockquote>,
      );
      continue;
    }

    // Unordered / ordered list
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      const items: string[] = [];
      const ordered = /^\s*\d+\.\s+/.test(line);
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*([-*]|\d+\.)\s+/, ''));
        i++;
      }
      const ListTag = ordered ? 'ol' : 'ul';
      blocks.push(
        <ListTag
          key={`b${key++}`}
          className={cn(
            'my-2 ml-5 space-y-1',
            ordered ? 'list-decimal' : 'list-disc',
          )}
        >
          {items.map((it, idx) => (
            <li key={idx}>{renderInline(it, `li${key}-${idx}`)}</li>
          ))}
        </ListTag>,
      );
      continue;
    }

    // Blank line → spacing
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Paragraph (consume consecutive non-blank, non-block lines)
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^```/.test(lines[i]) &&
      !/^(#{1,6})\s/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !/^\s*([-*]|\d+\.)\s+/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={`b${key++}`} className="my-1 leading-relaxed">
        {renderInline(paraLines.join(' '), `p${key}`)}
      </p>,
    );
  }

  return blocks;
}

/** Props for {@link Markdown}. */
export interface MarkdownProps {
  /** The markdown source string (may be partial/streaming). */
  children: string;
  /** Additional class names merged onto the prose root. */
  className?: string;
}

/**
 * Renders a (possibly partial) markdown string as themed prose. Dependency-free
 * and streaming-safe.
 */
export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div
      className={cn(
        'text-sm break-words [&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
        className,
      )}
    >
      {renderMarkdown(children)}
    </div>
  );
}


/**
 * @file response.tsx
 * @description Streaming markdown renderer for assistant output. `Response`
 * renders streamed text as markdown, shows a blinking cursor while `streaming`
 * is true, and tolerates partial/incomplete markdown (an unterminated code
 * fence mid-stream) without breaking layout. It supports an optional client-side
 * typewriter reveal and swappable KaTeX/Mermaid renderers gated behind props.
 *
 * Driven by `@localmode/react`'s `useChat`/`useGenerateText` token streams.
 */

/** A swappable block renderer for math/diagrams. */
export type BlockRenderer = (source: string) => React.ReactNode;

/** Props for {@link Response}. */
export interface ResponseProps extends React.ComponentProps<'div'> {
  /** The (possibly partial) markdown content to render. */
  children: string;
  /**
   * Whether content is still arriving. When true a blinking cursor is shown
   * after the text and removed on completion.
   * @default false
   */
  streaming?: boolean;
  /**
   * Reveal already-resolved text one character at a time. Ignored while
   * `streaming` (live token streams reveal naturally).
   * @default false
   */
  typewriter?: boolean;
  /** Characters revealed per tick when `typewriter` is enabled. @default 2 */
  typewriterSpeed?: number;
  /**
   * Optional LaTeX/math block renderer (e.g. a KaTeX-backed function). When
   * provided, `$$…$$` blocks are routed to it. Declare `katex` in your project
   * if you supply one.
   */
  renderMath?: BlockRenderer;
  /**
   * Optional Mermaid diagram renderer. When provided, ```mermaid fences are
   * routed to it. Declare `mermaid` in your project if you supply one.
   */
  renderMermaid?: BlockRenderer;
}

/** Split content into (markdown | math | mermaid) segments for routing. */
interface Segment {
  kind: 'markdown' | 'math' | 'mermaid';
  source: string;
}

function segment(content: string, hasMath: boolean, hasMermaid: boolean): Segment[] {
  if (!hasMath && !hasMermaid) return [{ kind: 'markdown', source: content }];
  const segments: Segment[] = [];
  // Tokenize on ```mermaid fences and $$ math blocks.
  const re = /```mermaid\n([\s\S]*?)```|\$\$([\s\S]*?)\$\$/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    if (m.index > last) {
      segments.push({ kind: 'markdown', source: content.slice(last, m.index) });
    }
    if (m[1] != null && hasMermaid) {
      segments.push({ kind: 'mermaid', source: m[1] });
    } else if (m[2] != null && hasMath) {
      segments.push({ kind: 'math', source: m[2] });
    } else {
      segments.push({ kind: 'markdown', source: m[0] });
    }
    last = re.lastIndex;
  }
  if (last < content.length) {
    segments.push({ kind: 'markdown', source: content.slice(last) });
  }
  return segments;
}

/**
 * Streamed markdown response with a streaming cursor.
 *
 * @example
 * ```tsx
 * <Response streaming={isStreaming}>{assistantText}</Response>
 * ```
 */
export function Response({
  children,
  streaming = false,
  typewriter = false,
  typewriterSpeed = 2,
  renderMath,
  renderMermaid,
  className,
  ...props
}: ResponseProps) {
  const [revealed, setRevealed] = React.useState(
    typewriter && !streaming ? '' : children,
  );

  React.useEffect(() => {
    if (streaming || !typewriter) {
      setRevealed(children);
      return;
    }
    let i = 0;
    setRevealed('');
    const id = window.setInterval(() => {
      i += Math.max(1, typewriterSpeed);
      setRevealed(children.slice(0, i));
      if (i >= children.length) window.clearInterval(id);
    }, 16);
    return () => window.clearInterval(id);
  }, [children, streaming, typewriter, typewriterSpeed]);

  const content = streaming ? children : revealed;
  const segments = segment(content, Boolean(renderMath), Boolean(renderMermaid));

  return (
    <div
      data-slot="response"
      data-streaming={streaming || undefined}
      className={cn('text-sm', className)}
      {...props}
    >
      {segments.map((seg, i) => {
        if (seg.kind === 'math' && renderMath) {
          return (
            <div key={i} className="my-2 overflow-x-auto">
              {renderMath(seg.source)}
            </div>
          );
        }
        if (seg.kind === 'mermaid' && renderMermaid) {
          return (
            <div key={i} className="my-2 overflow-x-auto">
              {renderMermaid(seg.source)}
            </div>
          );
        }
        return <Markdown key={i}>{seg.source}</Markdown>;
      })}
      {streaming && (
        <span
          aria-hidden="true"
          data-slot="response-cursor"
          className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-foreground align-middle"
        />
      )}
    </div>
  );
}

export default Response;
