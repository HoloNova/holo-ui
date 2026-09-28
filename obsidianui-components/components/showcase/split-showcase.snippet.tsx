"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface SplitShowcaseItem {
  id?: string;
  title?: React.ReactNode;
  tag?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  href?: string;
  target?: string;
  rel?: string;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
}

export interface SplitShowcaseProps {
  items?: [SplitShowcaseItem, SplitShowcaseItem] | SplitShowcaseItem[];
  className?: string;
  children?: React.ReactNode;
  compact?: boolean;
}

export function VercelLogo({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-6 sm:h-7 w-auto max-w-[140px] sm:max-w-[200px] text-foreground", className)}
      viewBox="0 0 261 52"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M59.8 52H0L29.9 0zm67.82-38.45q4.9 0 8.81 2.13a15.5 15.5 0 0 1 6.22 6.32q2.3 4.2 2.38 10.26v2.06h-26.35q.27 4.4 2.58 6.92 2.38 2.47 6.36 2.47a8.4 8.4 0 0 0 7.76-4.93l9.16.67q-1.68 4.98-6.29 7.99t-10.63 3q-5.53 0-9.64-2.27a16 16 0 0 1-6.43-6.46 20 20 0 0 1-2.31-9.72q0-5.52 2.3-9.72a16 16 0 0 1 6.44-6.46 20 20 0 0 1 9.64-2.26m62.55 0q4.47 0 8.18 1.66a15.3 15.3 0 0 1 6.15 4.6q2.38 3 2.87 7.05l-9.23.47a8 8 0 0 0-2.8-5 7.7 7.7 0 0 0-5.17-1.86q-4.33 0-6.7 3-2.4 3-2.39 8.52t2.38 8.52q2.37 3 6.71 3 3.15 0 5.39-1.87 2.24-1.92 2.72-5.46l9.3.4a14.7 14.7 0 0 1-2.87 7.33 16 16 0 0 1-6.15 4.86 21 21 0 0 1-8.39 1.66q-5.53 0-9.64-2.26a16 16 0 0 1-6.44-6.46 20 20 0 0 1-2.3-9.72q0-5.52 2.3-9.72a16 16 0 0 1 6.44-6.46 20 20 0 0 1 9.64-2.26m38.66 0q4.9 0 8.8 2.13a15.5 15.5 0 0 1 6.22 6.32q2.31 4.2 2.38 10.26v2.06h-26.35q.28 4.4 2.58 6.92 2.38 2.47 6.36 2.47a8.4 8.4 0 0 0 7.77-4.93l9.15.67q-1.68 5-6.29 7.99t-10.62 3q-5.53 0-9.65-2.27a16 16 0 0 1-6.43-6.46 20 20 0 0 1-2.31-9.72q0-5.52 2.3-9.72a16 16 0 0 1 6.44-6.46 20 20 0 0 1 9.64-2.26M86.9 36.69l17.24-34.33h10.8L89.96 49.63h-6.12L58.85 2.36h10.81zm71.62-15.55a11 11 0 0 1 2.47-4.48q2.28-2.31 6.38-2.31h3.4v7.26h-3.47q-2.91 0-4.79.8a5.8 5.8 0 0 0-2.77 2.5q-.9 1.72-.9 4.37v20.35h-8.89V14.35h8.33zm101.73 28.5h-8.95V2.35h8.95zM127.62 20.26q-3.7 0-6 2.2-2.32 2.2-2.87 6.2h17.05q-.48-4.34-2.72-6.33a7.8 7.8 0 0 0-5.46-2.07m101.2 0q-3.7 0-6 2.2-2.31 2.2-2.87 6.2H237q-.5-4.34-2.73-6.33a7.8 7.8 0 0 0-5.46-2.07"
      />
    </svg>
  );
}

export function TracwellLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 sm:gap-2 text-lg sm:text-2xl font-bold tracking-tight text-foreground",
        className
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 96 96" className="size-6 sm:size-8 shrink-0">
        <title>Tracwell</title>
        <g transform="translate(0 7)">
          <path d="M12 75c-5 0-8-5-5-10l19-35c3-6 10-8 16-5s8 10 5 16L29 72c-1 2-4 3-7 3H12Z" fill="#8CB4FF" />
          <path d="M43 75c-5 0-8-5-5-10L67 12c3-6 10-8 16-5s8 10 5 16L60 72c-1 2-4 3-7 3H43Z" fill="#357DFF" />
          <circle cx="82" cy="67" r="9" fill="#174EA6" />
        </g>
      </svg>
      <span>Tracwell</span>
    </span>
  );
}

const defaultItems: [SplitShowcaseItem, SplitShowcaseItem] = [
  {
    id: "vercel",
    title: <VercelLogo />,
    tag: "Hosting Sponsor",
    href: "http://vercel.com?utm_source=obsidianui.dev&utm_medium=web&utm_campaign=obsidianui-sponsor",
    ariaLabel: "Vercel — Hosting Sponsor",
  },
  {
    id: "tracwell",
    title: <TracwellLogo />,
    tag: "Analytics Sponsor",
    href: "https://tracwell.app?utm_source=obsidianui.dev&utm_medium=web&utm_campaign=obsidianui-sponsor",
    ariaLabel: "Tracwell — Analytics Sponsor",
  },
];

export function SplitShowcase({
  items = defaultItems,
  className,
  children,
  compact = false,
}: SplitShowcaseProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();

  const activeIndex = hoveredIndex ?? focusedIndex;
  const isAnyActive = activeIndex !== null;

  if (children) {
    return (
      <div className={cn("relative w-full max-w-5xl mx-auto", className)}>
        {children}
      </div>
    );
  }

  const [leftItem, rightItem] = items;

  const getSpringProps = (index: number) => {
    const isActive = activeIndex === index;
    const shift = index === 0 ? -12 : 12;

    if (reduceMotion) {
      return {};
    }

    return {
      animate: {
        x: isActive ? shift : 0,
        scale: isActive ? 0.98 : 1,
      },
      transition: {
        type: "spring" as const,
        stiffness: 350,
        damping: 24,
      },
    };
  };

  const renderCardContent = (item: SplitShowcaseItem) => (
    <>
      <div
        className={cn(
          "flex flex-col items-center justify-center text-center",
          compact ? "gap-2" : "gap-3"
        )}
      >
        {item.icon && <div className="shrink-0">{item.icon}</div>}
        {item.title}
        {item.description && (
          <p
            className={cn(
              "text-muted-foreground",
              compact ? "max-w-xs text-xs" : "max-w-xs text-sm"
            )}
          >
            {item.description}
          </p>
        )}
      </div>
      {item.tag && (
        <span
          className={cn(
            "relative font-semibold uppercase text-muted-foreground",
            compact
              ? "top-0 text-[10px] tracking-wider"
              : "top-2 text-xs tracking-widest"
          )}
        >
          {item.tag}
        </span>
      )}
    </>
  );

  return (
    <div
      className={cn(
        "relative grid w-full grid-cols-1 sm:grid-cols-2 gap-0 overflow-visible",
        className
      )}
    >
      {/* Card 1 (Left / Top) */}
      <div className="relative min-w-0">
        <motion.div
          {...getSpringProps(0)}
          className={cn(
            "flex h-full flex-col items-center justify-center text-foreground no-underline select-none",
            compact
              ? "min-h-[7.5rem] gap-3 p-4 sm:p-5"
              : "min-h-[11rem] gap-6 p-6 sm:p-8",
            "bg-zinc-200 dark:bg-zinc-800",
            "transition-[border-radius,box-shadow,border-color] duration-300",
            activeIndex === 0
              ? "rounded-[32px] sm:rounded-[32px] shadow-2xl shadow-black/10 dark:shadow-black/40 border border-border z-10"
              : "border border-border/40 sm:border-r-0 border-b-0 sm:border-b rounded-t-[32px] rounded-b-none sm:rounded-l-[32px] sm:rounded-r-none",
            leftItem?.className
          )}
          onMouseEnter={() => setHoveredIndex(0)}
          onMouseLeave={() => setHoveredIndex(null)}
          onFocus={() => setFocusedIndex(0)}
          onBlur={() => setFocusedIndex(null)}
        >
          {leftItem?.href ? (
            <a
              href={leftItem.href}
              target={leftItem.target ?? "_blank"}
              rel={leftItem.rel ?? "noreferrer"}
              aria-label={leftItem.ariaLabel}
              className="flex h-full w-full flex-col items-center justify-center gap-4 focus-visible:outline-none"
              onClick={leftItem.onClick}
            >
              {renderCardContent(leftItem)}
            </a>
          ) : (
            renderCardContent(leftItem)
          )}
        </motion.div>
      </div>

      {/* Dotted Divider - Desktop */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-1/2 z-10 hidden w-0 -translate-x-1/2 border-l-2 border-dotted border-zinc-400 dark:border-zinc-400 sm:block transition-opacity duration-250 ease-out",
          compact ? "inset-y-4" : "inset-y-8",
          isAnyActive ? "opacity-0" : "opacity-100"
        )}
      />

      {/* Dotted Divider - Mobile */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-1/2 z-10 block h-0 -translate-y-1/2 border-t-2 border-dotted border-zinc-400 dark:border-zinc-400 sm:hidden transition-opacity duration-250 ease-out",
          compact ? "inset-x-4" : "inset-x-8",
          isAnyActive ? "opacity-0" : "opacity-100"
        )}
      />

      {/* Card 2 (Right / Bottom) */}
      <div className="relative min-w-0">
        <motion.div
          {...getSpringProps(1)}
          className={cn(
            "flex h-full flex-col items-center justify-center text-foreground no-underline select-none",
            compact
              ? "min-h-[7.5rem] gap-3 p-4 sm:p-5"
              : "min-h-[11rem] gap-6 p-6 sm:p-8",
            "bg-zinc-200 dark:bg-zinc-800",
            "transition-[border-radius,box-shadow,border-color] duration-300",
            activeIndex === 1
              ? "rounded-[32px] sm:rounded-[32px] shadow-2xl shadow-black/10 dark:shadow-black/40 border border-border z-10"
              : "border border-border/40 sm:border-l-0 border-t-0 sm:border-t rounded-b-[32px] rounded-t-none sm:rounded-r-[32px] sm:rounded-l-none",
            rightItem?.className
          )}
          onMouseEnter={() => setHoveredIndex(1)}
          onMouseLeave={() => setHoveredIndex(null)}
          onFocus={() => setFocusedIndex(1)}
          onBlur={() => setFocusedIndex(null)}
        >
          {rightItem?.href ? (
            <a
              href={rightItem.href}
              target={rightItem.target ?? "_blank"}
              rel={rightItem.rel ?? "noreferrer"}
              aria-label={rightItem.ariaLabel}
              className="flex h-full w-full flex-col items-center justify-center gap-4 focus-visible:outline-none"
              onClick={rightItem.onClick}
            >
              {renderCardContent(rightItem)}
            </a>
          ) : (
            renderCardContent(rightItem)
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default SplitShowcase;
