"use client";

import type { MouseEvent } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
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
const ARC_BLOG_GRID_STYLES = `.arc-blog-grid-root { width: 100%; min-width: 0; container: blog / inline-size; background: var(--background); color: var(--foreground); font-family: var(--font-body); letter-spacing: var(--tracking-body); }
.arc-blog-grid-inner { position: relative; max-width: 1180px; margin: 0 auto; padding: var(--space-16) var(--space-6); }
.arc-blog-grid-index { display: grid; gap: var(--space-8); }

.arc-blog-grid-header { display: grid; gap: var(--space-3); max-width: 600px; }
.arc-blog-grid-title { margin: 0; font-family: var(--font-display); font-size: clamp(1.75rem, 1rem + 3cqi, var(--text-4xl)); font-weight: 500; letter-spacing: var(--tracking-display); line-height: var(--leading-display); }
.arc-blog-grid-description { margin: 0; color: var(--text-secondary); font-size: var(--text-base); line-height: var(--leading-body); text-wrap: pretty; }

.arc-blog-grid-filters { display: flex; gap: 2px; margin: 0 calc(var(--space-6) * -1); overflow-x: auto; padding: 0 var(--space-6); scrollbar-width: none; }
.arc-blog-grid-filters::-webkit-scrollbar { display: none; }
.arc-blog-grid-filter { position: relative; isolation: isolate; flex: none; height: 36px; border: 0; border-radius: var(--radius-pill); padding: 0 var(--space-4); background: none; color: var(--text-secondary); font: inherit; font-size: var(--text-sm); font-weight: 500; white-space: nowrap; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: color var(--duration-fast) var(--ease-standard); }
.arc-blog-grid-filter[aria-pressed="true"] { color: var(--background); }
@media (hover: hover) and (pointer: fine) { .arc-blog-grid-filter[aria-pressed="false"]:hover { color: var(--foreground); } }
.arc-blog-grid-filterHighlight { position: absolute; z-index: -1; inset: 0; border-radius: inherit; background: var(--foreground); }

.arc-blog-grid-page { display: grid; gap: var(--space-12); }
.arc-blog-grid-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-12) var(--space-6); }

.arc-blog-grid-card, .arc-blog-grid-featured { display: grid; align-content: start; gap: var(--space-4); border-radius: 22px; color: inherit; text-decoration: none; -webkit-tap-highlight-color: transparent; }
.arc-blog-grid-featured { grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr); align-items: center; gap: var(--space-10); }
.arc-blog-grid-imageFrame { position: relative; overflow: hidden; aspect-ratio: 3 / 2; border-radius: 20px; background: var(--surface-muted); }
.arc-blog-grid-featured .arc-blog-grid-imageFrame { aspect-ratio: 16 / 10; border-radius: 26px; }
.arc-blog-grid-image { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform var(--duration-considered) var(--ease-standard); }
.arc-blog-grid-cardBody { display: grid; align-content: start; gap: var(--space-2); }
.arc-blog-grid-featured .arc-blog-grid-cardBody { gap: var(--space-3); }
.arc-blog-grid-meta { display: flex; flex-wrap: wrap; gap: 6px; margin: 0; color: var(--text-muted); font-size: var(--text-xs); }
.arc-blog-grid-meta span:first-child { color: var(--foreground); font-weight: 500; }
.arc-blog-grid-cardTitle { margin: 0; font-size: var(--text-lg); font-weight: 500; line-height: 1.3; text-wrap: balance; transition: color var(--duration-fast) var(--ease-standard); }
.arc-blog-grid-featuredTitle { margin: 0; font-family: var(--font-display); font-size: clamp(var(--text-2xl), 1rem + 2.2cqi, var(--text-3xl)); font-weight: 500; letter-spacing: var(--tracking-display); line-height: var(--leading-display); text-wrap: balance; }
.arc-blog-grid-excerpt { display: -webkit-box; margin: 0; overflow: hidden; color: var(--text-secondary); font-size: var(--text-sm); line-height: 1.5; text-wrap: pretty; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.arc-blog-grid-featured .arc-blog-grid-excerpt { font-size: var(--text-base); -webkit-line-clamp: 3; }
.arc-blog-grid-byline { display: flex; min-width: 0; align-items: center; gap: var(--space-2); margin-top: var(--space-2); font-size: var(--text-sm); }
.arc-blog-grid-avatar { width: 24px; height: 24px; flex: none; border-radius: 50%; background: var(--surface-muted); object-fit: cover; }
.arc-blog-grid-authorName { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.arc-blog-grid-readTime { flex: none; color: var(--text-muted); }
.arc-blog-grid-readTime::before { content: "·"; margin-right: var(--space-2); }
.arc-blog-grid-card:active .arc-blog-grid-imageFrame, .arc-blog-grid-featured:active .arc-blog-grid-imageFrame { transform: scale(.99); }
.arc-blog-grid-imageFrame { transition: transform var(--duration-fast) var(--ease-standard); }
@media (hover: hover) and (pointer: fine) {
  .arc-blog-grid-card:hover .arc-blog-grid-image, .arc-blog-grid-featured:hover .arc-blog-grid-image { transform: scale(1.03); }
  .arc-blog-grid-card:hover .arc-blog-grid-cardTitle { color: var(--text-secondary); }
}
.arc-blog-grid-empty { margin: 0; padding: var(--space-16) 0; color: var(--text-secondary); text-align: center; }

.arc-blog-grid-pagination { position: relative; display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); padding-top: var(--space-6); }
.arc-blog-grid-pagination::before { content: ""; position: absolute; top: 0; right: 0; left: 0; height: 1px; background: var(--border); }
.arc-blog-grid-pageNumbers { display: flex; gap: 2px; }
.arc-blog-grid-pageNumber, .arc-blog-grid-pageStep { position: relative; isolation: isolate; display: inline-flex; height: 36px; min-width: 36px; align-items: center; justify-content: center; gap: 6px; border: 0; border-radius: var(--radius-pill); padding: 0 var(--space-3); background: none; color: var(--text-secondary); font: inherit; font-size: var(--text-sm); font-weight: 500; font-variant-numeric: tabular-nums; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: color var(--duration-fast) var(--ease-standard), transform var(--duration-instant) var(--ease-standard); }
.arc-blog-grid-pageNumber { padding: 0; }
.arc-blog-grid-pageNumber[aria-current="page"] { color: var(--foreground); }
.arc-blog-grid-pageHighlight { position: absolute; z-index: -1; inset: 0; border-radius: inherit; background: var(--surface-muted); }
.arc-blog-grid-pageStep:disabled { color: var(--text-muted); opacity: .5; cursor: default; }
.arc-blog-grid-pageStep:not(:disabled):active { transform: scale(.97); }
@media (hover: hover) and (pointer: fine) { .arc-blog-grid-pageNumber:hover, .arc-blog-grid-pageStep:not(:disabled):hover { color: var(--foreground); } }

.arc-blog-grid-reader { display: grid; max-width: 760px; gap: var(--space-8); margin: 0 auto; }
.arc-blog-grid-back { display: inline-flex; width: fit-content; height: 36px; align-items: center; gap: 6px; border: 0; border-radius: var(--radius-pill); padding: 0 var(--space-3) 0 var(--space-2); margin-left: calc(var(--space-2) * -1); background: none; color: var(--text-secondary); font: inherit; font-size: var(--text-sm); font-weight: 500; cursor: pointer; transition: color var(--duration-fast) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard); }
@media (hover: hover) and (pointer: fine) { .arc-blog-grid-back:hover { background: var(--surface-muted); color: var(--foreground); } }
.arc-blog-grid-readerHead { display: grid; gap: var(--space-3); }
.arc-blog-grid-readerTitle { margin: 0; font-family: var(--font-display); font-size: clamp(var(--text-2xl), 1rem + 3.4cqi, var(--text-4xl)); font-weight: 500; letter-spacing: var(--tracking-display); line-height: var(--leading-display); text-wrap: balance; }
.arc-blog-grid-readerImage { overflow: hidden; aspect-ratio: 16 / 9; border-radius: 26px; background: var(--surface-muted); }
.arc-blog-grid-readerBody { display: grid; gap: var(--space-5); }
.arc-blog-grid-readerBody p { margin: 0; color: var(--text-secondary); font-size: var(--text-lg); line-height: 1.65; text-wrap: pretty; }
.arc-blog-grid-readerBody .arc-blog-grid-lead { color: var(--foreground); font-size: var(--text-xl); line-height: 1.5; }

@container blog (max-width: 900px) {
  .arc-blog-grid-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .arc-blog-grid-featured { gap: var(--space-6); }
}
@container blog (max-width: 680px) {
  .arc-blog-grid-inner { padding: var(--space-12) var(--space-4); }
  .arc-blog-grid-filters { margin: 0 calc(var(--space-4) * -1); padding: 0 var(--space-4); }
  .arc-blog-grid-featured { grid-template-columns: minmax(0, 1fr); gap: var(--space-4); }
  .arc-blog-grid-featured .arc-blog-grid-imageFrame { aspect-ratio: 3 / 2; border-radius: 20px; }
  .arc-blog-grid-page { gap: var(--space-10); }
  .arc-blog-grid-grid { gap: var(--space-10) var(--space-4); }
  .arc-blog-grid-readerBody p { font-size: var(--text-base); }
  .arc-blog-grid-readerBody .arc-blog-grid-lead { font-size: var(--text-lg); }
}
@container blog (max-width: 540px) {
  .arc-blog-grid-grid { grid-template-columns: minmax(0, 1fr); }
  .arc-blog-grid-pageStep span { display: none; }
  .arc-blog-grid-pageStep { padding: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .arc-blog-grid-image, .arc-blog-grid-imageFrame { transition: none; }
  .arc-blog-grid-card:hover .arc-blog-grid-image, .arc-blog-grid-featured:hover .arc-blog-grid-image { transform: none; }
}
`;

const styles: Record<string, string> = new Proxy({
  "authorName": "arc-blog-grid-authorName",
  "avatar": "arc-blog-grid-avatar",
  "back": "arc-blog-grid-back",
  "byline": "arc-blog-grid-byline",
  "card": "arc-blog-grid-card",
  "cardBody": "arc-blog-grid-cardBody",
  "cardTitle": "arc-blog-grid-cardTitle",
  "description": "arc-blog-grid-description",
  "empty": "arc-blog-grid-empty",
  "excerpt": "arc-blog-grid-excerpt",
  "featured": "arc-blog-grid-featured",
  "featuredTitle": "arc-blog-grid-featuredTitle",
  "filter": "arc-blog-grid-filter",
  "filterHighlight": "arc-blog-grid-filterHighlight",
  "filters": "arc-blog-grid-filters",
  "grid": "arc-blog-grid-grid",
  "header": "arc-blog-grid-header",
  "image": "arc-blog-grid-image",
  "imageFrame": "arc-blog-grid-imageFrame",
  "index": "arc-blog-grid-index",
  "inner": "arc-blog-grid-inner",
  "lead": "arc-blog-grid-lead",
  "meta": "arc-blog-grid-meta",
  "page": "arc-blog-grid-page",
  "pageHighlight": "arc-blog-grid-pageHighlight",
  "pageNumber": "arc-blog-grid-pageNumber",
  "pageNumbers": "arc-blog-grid-pageNumbers",
  "pageStep": "arc-blog-grid-pageStep",
  "pagination": "arc-blog-grid-pagination",
  "readTime": "arc-blog-grid-readTime",
  "reader": "arc-blog-grid-reader",
  "readerBody": "arc-blog-grid-readerBody",
  "readerHead": "arc-blog-grid-readerHead",
  "readerImage": "arc-blog-grid-readerImage",
  "readerTitle": "arc-blog-grid-readerTitle",
  "root": "arc-blog-grid-root",
  "title": "arc-blog-grid-title"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-blog-grid-${prop}`,
});


// ── Helper: blog-grid-data.ts ──
/** Sample posts for the blog grid. Photos and portraits live in public/media (credits in public/media/CREDITS.md). */

export type BlogAuthor = { name: string; avatar?: string; role?: string };

export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  /** ISO date, used for sorting and the visible date. */
  date: string;
  /** Minutes to read. */
  readTime: number;
  author: BlogAuthor;
  image?: { src: string; alt: string };
  /** Paragraphs for the in-place reader. Leave out when every post links out through getHref. */
  body?: string[];
  featured?: boolean;
};

const emma: BlogAuthor = { name: "Emma Collins", role: "Product designer", avatar: "/media/people/emma-collins.jpg" };
const marcus: BlogAuthor = { name: "Marcus Johnson", role: "Frontend engineer", avatar: "/media/people/marcus-johnson.jpg" };
const jasmine: BlogAuthor = { name: "Jasmine Brooks", role: "Design lead", avatar: "/media/people/jasmine-brooks.jpg" };
const daniel: BlogAuthor = { name: "Daniel Kim", role: "Backend engineer", avatar: "/media/people/daniel-kim.jpg" };
const sofia: BlogAuthor = { name: "Sofia Ramirez", role: "Operations lead", avatar: "/media/people/sofia-ramirez.jpg" };
const chloe: BlogAuthor = { name: "Chloe Nguyen", role: "Data analyst", avatar: "/media/people/chloe-nguyen.jpg" };
const nathan: BlogAuthor = { name: "Nathan Cole", role: "Engineering manager", avatar: "/media/people/nathan-cole.jpg" };

export const blogCategories = ["Product", "Design", "Engineering", "Company"];

export const blogPosts: BlogPost[] = [
  {
    id: "quiet-software", featured: true, category: "Design", date: "2026-09-18", readTime: 7, author: jasmine,
    title: "The case for quiet software",
    excerpt: "Why we removed half the colors from our interface and people started finishing work faster.",
    image: { src: "/media/photos/living-room.jpg", alt: "A bright living room with timber beams, arched windows, and cream sofas" },
    body: [
      "Last spring we ran an experiment. We took the busiest screen in the product and removed every color that did not carry meaning. Status stayed. Selection stayed. Everything else went neutral.",
      "Nobody asked for it, and almost nobody noticed the change directly. What they noticed was that the screen felt easier. Task completion went up eleven percent in the first month.",
      "Quiet does not mean empty. It means every element has a job, and the loud moments are saved for the things that need attention.",
    ],
  },
  {
    id: "offline-sync", category: "Engineering", date: "2026-09-12", readTime: 9, author: daniel,
    title: "How offline sync actually works",
    excerpt: "Conflict free replicated data, explained with the bugs we hit on the way to shipping it.",
    image: { src: "/media/photos/curved-facade.jpg", alt: "A white tiled building facade with curved balconies" },
    body: ["Every edit you make is stored locally first and sent to the server when a connection is available. The hard part is what happens when two people change the same thing while apart.", "We use a sequence CRDT for text and last writer wins for simple fields, with a few careful exceptions we cover here."],
  },
  {
    id: "lisbon-offsite", category: "Company", date: "2026-09-04", readTime: 4, author: sofia,
    title: "What we learned from a week in Lisbon",
    excerpt: "Forty people, one shared roadmap, and no slides allowed. Notes from our autumn offsite.",
    image: { src: "/media/photos/lisbon-rooftops.jpg", alt: "Terracotta rooftops of Lisbon running down to the river" },
    body: ["We banned slides for the week. Every session started with a written memo and ten minutes of silent reading.", "It was the most productive offsite we have run, and the roadmap we left with has held up better than any before it."],
  },
  {
    id: "shared-views", category: "Product", date: "2026-08-28", readTime: 3, author: emma,
    title: "Shared views are here",
    excerpt: "Save a filter, name it, and share it with your team. Everyone sees the same thing, always current.",
    image: { src: "/media/photos/home-office.jpg", alt: "A home office with a wooden desk and deep green walls" },
    body: ["Saved filters were the most requested feature of the year. Today they become shared views: name a view, pick who sees it, and it stays in sync as the data changes."],
  },
  {
    id: "type-scale", category: "Design", date: "2026-08-21", readTime: 6, author: jasmine,
    title: "Choosing a type scale you will not regret",
    excerpt: "Seven sizes, two weights, and the rules we use to keep them that way as the product grows.",
    image: { src: "/media/photos/concert-hall.jpg", alt: "Curved stainless steel panels of the Walt Disney Concert Hall against a blue sky" },
    body: ["A type scale is a promise. Every new size you add makes the next decision harder.", "We settled on seven sizes and two weights, and wrote down when each one is allowed."],
  },
  {
    id: "query-planner", category: "Engineering", date: "2026-08-14", readTime: 11, author: marcus,
    title: "Making search ten times faster",
    excerpt: "A new query planner, a smarter index, and one very embarrassing N plus one we found along the way.",
    image: { src: "/media/photos/mountain-ridges.jpg", alt: "Layered mountain ridges under a warm evening sky" },
    body: ["Search used to take around 400 milliseconds at the ninety fifth percentile. It now takes 38.", "Most of the gain came from the planner. The rest came from deleting code we should never have written."],
  },
  {
    id: "remote-rituals", category: "Company", date: "2026-08-06", readTime: 5, author: nathan,
    title: "The rituals that keep a remote team close",
    excerpt: "Written standups, demo Fridays and the one meeting we will never cancel.",
    image: { src: "/media/photos/sunroom.jpg", alt: "A sunroom with a round dining table, plants, and windows on three sides" },
    body: ["We work across nine time zones. The rituals that survive are the ones that respect that."],
  },
  {
    id: "usage-insights", category: "Product", date: "2026-07-30", readTime: 4, author: chloe,
    title: "Usage insights for every workspace",
    excerpt: "See which features your team relies on, where people get stuck, and what changed this week.",
    image: { src: "/media/photos/alpine-lake.jpg", alt: "A calm alpine lake reflecting a rocky peak at golden hour" },
    body: ["Admins can now open Insights from workspace settings. It shows adoption per feature, trends over time and a weekly summary by email."],
  },
  {
    id: "motion-rules", category: "Design", date: "2026-07-22", readTime: 8, author: emma,
    title: "Motion should explain, not decorate",
    excerpt: "Our rules for animation: every movement answers where something came from or where it went.",
    image: { src: "/media/photos/terracotta-waves.jpg", alt: "Wavy terracotta walls rising toward a blue sky" },
    body: ["If you cannot say what an animation explains, remove it. That single rule removed a third of our motion code."],
  },
  {
    id: "postgres-upgrade", category: "Engineering", date: "2026-07-15", readTime: 10, author: daniel,
    title: "Upgrading Postgres with zero downtime",
    excerpt: "Logical replication, a dry run on a copy of production, and a cutover that took four seconds.",
    image: { src: "/media/photos/coastline.jpg", alt: "A long coastline with waves rolling onto a beach below green cliffs" },
    body: ["We moved two terabytes to a new major version while customers kept working. Here is the runbook."],
  },
  {
    id: "series-b", category: "Company", date: "2026-07-08", readTime: 3, author: sofia,
    title: "Our next chapter",
    excerpt: "We raised a Series B to build the calmest tool for teams. Here is what changes and what does not.",
    image: { src: "/media/photos/sea-at-dusk.jpg", alt: "A calm sea at dusk with a low island on the horizon" },
    body: ["The product stays the same price. The team doubles. The roadmap gets faster."],
  },
  {
    id: "keyboard-first", category: "Product", date: "2026-06-30", readTime: 5, author: marcus,
    title: "A keyboard shortcut for everything",
    excerpt: "Press question mark anywhere to see every shortcut, then make your own.",
    image: { src: "/media/photos/reading-chair.jpg", alt: "A grey armchair and ottoman with a knit throw in a dark green room" },
    body: ["Every action in the product now has a shortcut, and you can remap any of them from settings."],
  },
  {
    id: "color-tokens", category: "Design", date: "2026-06-24", readTime: 6, author: jasmine,
    title: "Naming color tokens by job, not by hue",
    excerpt: "Why surface and border beat gray-100 and gray-200, and how we migrated four hundred files.",
    image: { src: "/media/photos/pool-house.jpg", alt: "A modern glass house beside a long pool under a clear sky" },
    body: ["Semantic tokens let dark mode, high contrast and brand themes share one component codebase."],
  },
];

/* eslint-disable @next/next/no-img-element -- plain images keep the block portable outside Next.js. */


// inlined:  BlogAuthor, BlogPost 

export interface BlogGridProps {
  title?: string;
  description?: string;
  posts?: BlogPost[];
  /** Category filter labels, in order. "All" is added in front. */
  categories?: string[];
  /** Active category, or "All" (controlled). */
  category?: string;
  defaultCategory?: string;
  onCategoryChange?: (category: string) => void;
  /** One based page (controlled). */
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** Cards per page below the featured post. Defaults to 6. */
  pageSize?: number;
  /** Shows the newest post of the current filter as a large card on page one. Defaults to true. */
  showFeatured?: boolean;
  /** Link for each post. When set, cards render as links and the in-place reader is off. */
  getHref?: (post: BlogPost) => string;
  /** Called when a post opens, from a link or the in-place reader. */
  onPostOpen?: (post: BlogPost) => void;
  className?: string;
}

const smooth = motionTokens.spring.smooth;
const morph = motionTokens.spring.morph;
const standard = [...motionTokens.ease.standard] as [number, number, number, number];
const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const formatDate = (iso: string) => dateFormat.format(new Date(`${iso}T00:00:00Z`));

function useControllable<T>(value: T | undefined, initial: T, onChange?: (next: T) => void) {
  const [inner, setInner] = useState(initial);
  const current = value !== undefined ? value : inner;
  const set = (next: T) => { if (value === undefined) setInner(next); onChange?.(next); };
  return [current, set] as const;
}

function Meta({ post }: { post: BlogPost }) {
  return <p className={styles.meta}><span>{post.category}</span><span aria-hidden="true">·</span><time dateTime={post.date}>{formatDate(post.date)}</time></p>;
}

function Byline({ post }: { post: BlogPost }) {
  return <div className={styles.byline}>
    {post.author.avatar ? <img className={styles.avatar} src={post.author.avatar} alt="" width={24} height={24} loading="lazy" /> : <span className={styles.avatar} aria-hidden="true" />}
    <span className={styles.authorName}>{post.author.name}</span>
    <span className={styles.readTime}>{post.readTime} min read</span>
  </div>;
}

export function BlogGrid({
  title = "Journal",
  description = "Product news, design notes and engineering deep dives from the team.",
  posts = blogPosts,
  categories = blogCategories,
  category: categoryProp,
  defaultCategory = "All",
  onCategoryChange,
  page: pageProp,
  defaultPage = 1,
  onPageChange,
  pageSize = 6,
  showFeatured = true,
  getHref,
  onPostOpen,
  className,
}: BlogGridProps) {
  const reduced = useReducedMotion();
  const uid = useId();
  const rootRef = useRef<HTMLElement>(null);
  const [category, setCategoryState] = useControllable(categoryProp, defaultCategory, onCategoryChange);
  const [page, setPageState] = useControllable(pageProp, defaultPage, onPageChange);
  const [direction, setDirection] = useState(0);
  const [reading, setReading] = useState<BlogPost | null>(null);
  const lastOpened = useRef<string | null>(null);

  const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));
  const filtered = category === "All" ? sorted : sorted.filter(post => post.category === category);
  const featured = showFeatured && filtered.length > 1 ? (filtered.find(post => post.featured) ?? filtered[0]) : null;
  const rest = featured ? filtered.filter(post => post !== featured) : filtered;
  const pageCount = Math.max(1, Math.ceil(rest.length / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const pagePosts = rest.slice((safePage - 1) * pageSize, safePage * pageSize);

  function scrollToTop() {
    const node = rootRef.current;
    if (node && node.getBoundingClientRect().top < 0) node.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }
  function setCategory(next: string) {
    if (next === category) return;
    setDirection(0);
    setCategoryState(next);
    setPageState(1);
  }
  function setPage(next: number) {
    if (next === safePage || next < 1 || next > pageCount) return;
    setDirection(next > safePage ? 1 : -1);
    setPageState(next);
    scrollToTop();
  }
  function open(post: BlogPost, event: MouseEvent) {
    onPostOpen?.(post);
    if (getHref) return;
    event.preventDefault();
    lastOpened.current = post.id;
    setReading(post);
    scrollToTop();
  }
  function close() {
    setReading(null);
    requestAnimationFrame(() => {
      const card = rootRef.current?.querySelector<HTMLElement>(`[data-post="${lastOpened.current}"]`);
      card?.focus({ preventScroll: true });
      card?.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
    });
  }

  const renderCard = (post: BlogPost, isFeatured = false) => {
    const href = getHref?.(post);
    const inner = <>
      {post.image && <motion.div layoutId={reduced ? undefined : `${uid}-image-${post.id}`} transition={morph} className={styles.imageFrame}>
        <img className={styles.image} src={post.image.src} alt={post.image.alt} loading={isFeatured ? "eager" : "lazy"} />
      </motion.div>}
      <div className={styles.cardBody}>
        <Meta post={post} />
        <h3 className={isFeatured ? styles.featuredTitle : styles.cardTitle}>{post.title}</h3>
        <p className={styles.excerpt}>{post.excerpt}</p>
        <Byline post={post} />
      </div>
    </>;
    const className = isFeatured ? styles.featured : styles.card;
    return <a key={post.id} className={className} href={href ?? `#${post.id}`} data-post={post.id} onClick={event => open(post, event)}>{inner}</a>;
  };

  const tabs = ["All", ...categories];
  const pageKey = `${category}-${safePage}`;

  return <section ref={rootRef} className={[styles.root, className].filter(Boolean).join(" ")} aria-label={title}>
    <LayoutGroup id={uid}>
      <div className={styles.inner}>
        <AnimatePresence mode="popLayout" initial={false}>
          {reading ? <motion.article key="reader" className={styles.reader} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: motionTokens.duration.exit } }} transition={{ duration: motionTokens.duration.standard, ease: standard }} aria-labelledby={`${uid}-reader-title`}>
            <button type="button" className={styles.back} onClick={close} autoFocus><ArrowLeft size={16} aria-hidden="true" />All posts</button>
            <header className={styles.readerHead}>
              <Meta post={reading} />
              <h2 id={`${uid}-reader-title`} className={styles.readerTitle}>{reading.title}</h2>
              <Byline post={reading} />
            </header>
            {reading.image && <motion.div layoutId={reduced ? undefined : `${uid}-image-${reading.id}`} transition={morph} className={styles.readerImage}>
              <img className={styles.image} src={reading.image.src} alt={reading.image.alt} />
            </motion.div>}
            <motion.div className={styles.readerBody} initial={{ opacity: 0, y: reduced ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...smooth, delay: reduced ? 0 : .12 }}>
              <p className={styles.lead}>{reading.excerpt}</p>
              {(reading.body ?? []).map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            </motion.div>
          </motion.article> : <motion.div key="index" className={styles.index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: motionTokens.duration.exit } }} transition={{ duration: motionTokens.duration.standard, ease: standard }}>
            <header className={styles.header}>
              <h2 className={styles.title}>{title}</h2>
              {description && <p className={styles.description}>{description}</p>}
            </header>

            <div className={styles.filters} role="group" aria-label="Filter by category">
              {tabs.map(tab => <button key={tab} type="button" className={styles.filter} aria-pressed={tab === category} onClick={() => setCategory(tab)}>
                {tab === category && <motion.span layoutId={`${uid}-filter`} className={styles.filterHighlight} transition={reduced ? { duration: 0 } : morph} />}
                <span>{tab}</span>
              </button>)}
            </div>

            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={pageKey}
                className={styles.page}
                initial={reduced ? { opacity: 0 } : { opacity: 0, x: direction * 24, y: direction ? 0 : 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, x: direction * -24, transition: { duration: motionTokens.duration.exit, ease: standard } }}
                transition={{ ...smooth, opacity: { duration: motionTokens.duration.standard } }}
              >
                {featured && safePage === 1 && renderCard(featured, true)}
                {pagePosts.length > 0 && <div className={styles.grid}>{pagePosts.map(post => renderCard(post))}</div>}
                {filtered.length === 0 && <p className={styles.empty}>No posts in {category} yet.</p>}
              </motion.div>
            </AnimatePresence>

            {pageCount > 1 && <nav className={styles.pagination} aria-label="Pagination">
              <button type="button" className={styles.pageStep} onClick={() => setPage(safePage - 1)} disabled={safePage === 1} aria-label="Previous page"><ChevronLeft size={16} aria-hidden="true" /><span>Previous</span></button>
              <div className={styles.pageNumbers}>
                {Array.from({ length: pageCount }, (_, index) => index + 1).map(number => <button key={number} type="button" className={styles.pageNumber} aria-current={number === safePage ? "page" : undefined} aria-label={`Page ${number}`} onClick={() => setPage(number)}>
                  {number === safePage && <motion.span layoutId={`${uid}-page`} className={styles.pageHighlight} transition={reduced ? { duration: 0 } : morph} />}
                  <span>{number}</span>
                </button>)}
              </div>
              <button type="button" className={styles.pageStep} onClick={() => setPage(safePage + 1)} disabled={safePage === pageCount} aria-label="Next page"><span>Next</span><ChevronRight size={16} aria-hidden="true" /></button>
            </nav>}
          </motion.div>}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  </section>;
}

/** Preview: the blog index with the in-place reader. */
export function BlogGridBlock() {
  return <BlogGrid />;
}

export default BlogGridBlock;
