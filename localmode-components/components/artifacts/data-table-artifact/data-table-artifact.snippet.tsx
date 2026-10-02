"use client";

import * as React from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Inlined cn utility ---

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


// --- Inlined UI primitives ---


// ── Button ──
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon" | "icon-xs" | "xs";
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";
    const variants: Record<string, string> = {
      default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
      destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
      outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
    };
    const sizes: Record<string, string> = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-10 rounded-md px-8",
      icon: "h-9 w-9",
      "icon-xs": "h-6 w-6 p-0",
      xs: "h-6 px-2 text-xs",
    };
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant] || variants.default, sizes[size] || sizes.default, className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// ── Badge ──
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const base = "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  const variants: Record<string, string> = {
    default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
    outline: "text-foreground",
  };
  return <div className={cn(base, variants[variant] || variants.default, className)} {...props} />;
}

// ── Avatar ──
export function Avatar({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("relative flex size-8 shrink-0 overflow-hidden rounded-full", className)} {...props} />;
}

export function AvatarImage({ className, ...props }: React.ComponentProps<"img">) {
  return <img className={cn("aspect-square size-full", className)} {...props} />;
}

export function AvatarFallback({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex size-full items-center justify-center rounded-full bg-muted", className)} {...props} />;
}

// ── Progress ──
export interface ProgressProps extends React.ComponentProps<"div"> {
  value?: number;
}

export function Progress({ className, value = 0, ...props }: ProgressProps) {
  return (
    <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-secondary", className)} {...props}>
      <div
        className="size-full flex-1 bg-primary transition-all duration-300"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  );
}

// ── Switch ──
export interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function Switch({ className, checked = false, onCheckedChange, ...props }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-input",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none block size-4 rounded-full bg-background shadow-lg ring-0 transition-transform",
          checked ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  );
}

// ── Dialog ──
export function Dialog({ children, open, onOpenChange }: { children?: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) {
  return <div data-slot="dialog" data-state={open ? "open" : "closed"}>{children}</div>;
}

export function DialogTrigger({ children, asChild }: { children?: React.ReactNode; asChild?: boolean }) {
  return <div data-slot="dialog-trigger">{children}</div>;
}

export function DialogContent({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4", className)} {...props}>
      <div className="relative w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg">{children}</div>
    </div>
  );
}

// ── DropdownMenu ──
export function DropdownMenu({ children }: { children?: React.ReactNode }) {
  return <div className="relative inline-block text-left" data-slot="dropdown-menu">{children}</div>;
}

export function DropdownMenuTrigger({ children, asChild }: { children?: React.ReactNode; asChild?: boolean }) {
  return <div data-slot="dropdown-menu-trigger">{children}</div>;
}

export function DropdownMenuContent({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "absolute right-0 z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ── HoverCard ──
export function HoverCard({ children }: { children?: React.ReactNode }) {
  return <div className="relative inline-block">{children}</div>;
}
export function HoverCardTrigger({ children }: { children?: React.ReactNode }) {
  return <span className="cursor-pointer">{children}</span>;
}
export function HoverCardContent({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("absolute z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none", className)} {...props}>
      {children}
    </div>
  );
}

// ── Collapsible ──
export function Collapsible({ children, open, onOpenChange, ...props }: React.ComponentProps<"div"> & { open?: boolean; onOpenChange?: (open: boolean) => void }) {
  return <div data-state={open ? "open" : "closed"} {...props}>{children}</div>;
}
export function CollapsibleTrigger({ children, ...props }: React.ComponentProps<"button">) {
  return <button type="button" {...props}>{children}</button>;
}
export function CollapsibleContent({ children, ...props }: React.ComponentProps<"div">) {
  return <div {...props}>{children}</div>;
}

// ── Tooltip ──
export function TooltipProvider({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
export function Tooltip({ children }: { children?: React.ReactNode }) {
  return <div className="relative inline-block group">{children}</div>;
}
export function TooltipTrigger({ children, asChild }: { children?: React.ReactNode; asChild?: boolean }) {
  return <span className="inline-flex">{children}</span>;
}
export function TooltipContent({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("hidden group-hover:block absolute z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground shadow-md animate-in fade-in-0 zoom-in-95", className)} {...props}>
      {children}
    </div>
  );
}

// ── Tabs ──
export function Tabs({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />;
}
export function TabsList({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className)} {...props} />;
}
export function TabsTrigger({ className, ...props }: React.ComponentProps<"button">) {
  return <button className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow", className)} {...props} />;
}
export function TabsContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)} {...props} />;
}

// ── Table ──
export function Table({ className, ...props }: React.ComponentProps<"table">) {
  return <div className="relative w-full overflow-auto"><table className={cn("w-full caption-bottom text-sm", className)} {...props} /></div>;
}
export function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead className={cn("[&_tr]:border-b", className)} {...props} />;
}
export function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}
export function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return <tr className={cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className)} {...props} />;
}
export function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return <th className={cn("h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0", className)} {...props} />;
}
export function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td className={cn("p-2 align-middle [&:has([role=checkbox])]:pr-0", className)} {...props} />;
}
export function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return <caption className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />;
}

// ── Command (cmdk facade) ──
export function Command({ className, ...props }: React.ComponentProps<"div"> & { value?: string; shouldFilter?: boolean }) {
  return <div className={cn("flex size-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground", className)} {...props} />;
}
export function CommandInput({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn("flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />;
}
export function CommandList({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)} {...props} />;
}
export function CommandEmpty({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("py-6 text-center text-sm text-muted-foreground", className)} {...props} />;
}
export function CommandGroup({ className, heading, children, ...props }: React.ComponentProps<"div"> & { heading?: string }) {
  return (
    <div className={cn("overflow-hidden p-1 text-foreground", className)} {...props}>
      {heading && <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{heading}</div>}
      {children}
    </div>
  );
}
export function CommandItem({ className, onSelect, ...props }: React.ComponentProps<"div"> & { onSelect?: () => void }) {
  return (
    <div
      onClick={onSelect}
      className={cn("relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50", className)}
      {...props}
    />
  );
}


/**
 * @file data-table-artifact.tsx
 * @description Generic sortable data table for rendering LOCAL row data —
 * VectorDB search results, model-catalog rows, evaluation rows, or
 * `generateObject()` array output. Sorting is performed entirely client-side.
 * Distinct from the inline `ScoredResultBarList`: this is a docked-canvas table.
 */


/** A column definition for {@link DataTableArtifact}. */
export interface DataTableColumn<Row> {
  /** Key into the row object (used as the default accessor and sort key). */
  key: keyof Row & string;
  /** Header label. Defaults to `key`. */
  header?: string;
  /** Custom cell renderer. Defaults to `String(row[key])`. */
  cell?: (row: Row) => React.ReactNode;
  /** When false, the column header is not clickable to sort. @default true */
  sortable?: boolean;
  /** Align the column's text. @default "left" */
  align?: 'left' | 'right' | 'center';
}

/** Props for {@link DataTableArtifact}. */
export interface DataTableArtifactProps<Row extends Record<string, unknown>> {
  /** The rows to render. Sorting reorders a copy; the input array is untouched. */
  rows: Row[];
  /**
   * Column definitions. When omitted, columns are inferred from the keys of the
   * first row.
   */
  columns?: DataTableColumn<Row>[];
  /** Optional caption rendered under the table. */
  caption?: React.ReactNode;
  /** Initial sort column key. */
  initialSortKey?: keyof Row & string;
  /** Initial sort direction. @default "asc" */
  initialSortDirection?: 'asc' | 'desc';
  /** Message shown when `rows` is empty. @default "No data" */
  emptyMessage?: React.ReactNode;
  /** Additional class names merged onto the root wrapper. */
  className?: string;
}

type SortState<Row> = {
  key: keyof Row & string;
  direction: 'asc' | 'desc';
} | null;

/** Compare two arbitrary cell values for sorting (numbers, strings, dates, bools). */
function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean')
    return Number(a) - Number(b);
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  return String(a).localeCompare(String(b), undefined, { numeric: true });
}

/**
 * A docked-canvas sortable data table. Click a sortable column header to sort
 * the rows ascending → descending → unsorted, all client-side. Renders any
 * local row data (VectorDB results, model catalog, eval rows,
 * `generateObject()` arrays).
 *
 * Styled with shadcn/ui CSS variables so it inherits the consumer's theme.
 *
 * @example
 * ```tsx
 * <DataTableArtifact
 *   rows={results}
 *   columns={[
 *     { key: 'id', header: 'ID' },
 *     { key: 'score', header: 'Score', align: 'right' },
 *   ]}
 * />
 * ```
 */
export function DataTableArtifact<Row extends Record<string, unknown>>({
  rows,
  columns,
  caption,
  initialSortKey,
  initialSortDirection = 'asc',
  emptyMessage = 'No data',
  className,
}: DataTableArtifactProps<Row>) {
  const resolvedColumns: DataTableColumn<Row>[] = React.useMemo(() => {
    if (columns && columns.length > 0) return columns;
    const first = rows[0];
    if (!first) return [];
    return (Object.keys(first) as (keyof Row & string)[]).map((key) => ({
      key,
    }));
  }, [columns, rows]);

  const [sort, setSort] = React.useState<SortState<Row>>(
    initialSortKey
      ? { key: initialSortKey, direction: initialSortDirection }
      : null,
  );

  const sortedRows = React.useMemo(() => {
    if (!sort) return rows;
    const copy = [...rows];
    copy.sort((rowA, rowB) => {
      const result = compareValues(rowA[sort.key], rowB[sort.key]);
      return sort.direction === 'asc' ? result : -result;
    });
    return copy;
  }, [rows, sort]);

  const toggleSort = (key: keyof Row & string) => {
    setSort((current) => {
      if (!current || current.key !== key) return { key, direction: 'asc' };
      if (current.direction === 'asc') return { key, direction: 'desc' };
      return null; // third click clears the sort
    });
  };

  if (rows.length === 0) {
    return (
      <div
        data-slot="data-table-artifact"
        className={cn(
          'rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground',
          className,
        )}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      data-slot="data-table-artifact"
      className={cn(
        'overflow-hidden rounded-lg border border-border bg-card',
        className,
      )}
    >
      <div className="sm:hidden">
        <div className="divide-y divide-border">
          {sortedRows.map((row, rowIndex) => (
            <dl key={rowIndex} className="space-y-2 p-3">
              {resolvedColumns.map((column) => (
                <div
                  key={column.key}
                  className="grid grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)] gap-3 text-sm"
                >
                  <dt className="min-w-0 text-xs font-medium text-muted-foreground">
                    <span className="block truncate">
                      {column.header ?? column.key}
                    </span>
                  </dt>
                  <dd
                    className={cn(
                      'min-w-0 break-words text-foreground [overflow-wrap:anywhere]',
                      column.align === 'right' && 'text-right tabular-nums',
                      column.align === 'center' && 'text-center',
                    )}
                  >
                    {column.cell
                      ? column.cell(row)
                      : formatCell(row[column.key])}
                  </dd>
                </div>
              ))}
            </dl>
          ))}
        </div>
        {caption ? (
          <p className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
            {caption}
          </p>
        ) : null}
      </div>

      <div className="hidden overflow-x-auto sm:block">
        <Table className="table-fixed">
          {caption ? <TableCaption>{caption}</TableCaption> : null}
          <TableHeader>
            <TableRow>
              {resolvedColumns.map((column) => {
                const isSortable = column.sortable !== false;
                const isActive = sort?.key === column.key;
                const alignClass =
                  column.align === 'right'
                    ? 'text-right'
                    : column.align === 'center'
                      ? 'text-center'
                      : 'text-left';
                return (
                  <TableHead
                    key={column.key}
                    aria-sort={
                      isActive
                        ? sort.direction === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                    className={cn('min-w-0', alignClass)}
                  >
                    {isSortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        className={cn(
                          'inline-flex max-w-full min-w-0 items-center gap-1 rounded-sm font-medium transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          isActive ? 'text-foreground' : 'text-muted-foreground',
                          column.align === 'right' && 'flex-row-reverse',
                        )}
                      >
                        <span className="min-w-0 truncate">
                          {column.header ?? column.key}
                        </span>
                        {isActive ? (
                          sort.direction === 'asc' ? (
                            <ChevronUp className="size-3.5 shrink-0" aria-hidden="true" />
                          ) : (
                            <ChevronDown
                              className="size-3.5 shrink-0"
                              aria-hidden="true"
                            />
                          )
                        ) : (
                          <ChevronsUpDown
                            className="size-3.5 shrink-0 opacity-50"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    ) : (
                      (column.header ?? column.key)
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {resolvedColumns.map((column) => {
                  const alignClass =
                    column.align === 'right'
                      ? 'text-right'
                      : column.align === 'center'
                        ? 'text-center'
                        : 'text-left';
                  return (
                    <TableCell
                      key={column.key}
                      className={cn(
                        'min-w-0 max-w-[14rem] truncate',
                        alignClass,
                      )}
                      title={
                        column.cell ? undefined : String(row[column.key] ?? '')
                      }
                    >
                      {column.cell
                        ? column.cell(row)
                        : formatCell(row[column.key])}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/** Render a primitive cell value as text; objects fall back to JSON. */
function formatCell(value: unknown): React.ReactNode {
  if (value == null) return '';
  if (typeof value === 'number') return value.toLocaleString();
  if (value instanceof Date) return value.toLocaleString();
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export default DataTableArtifact;
