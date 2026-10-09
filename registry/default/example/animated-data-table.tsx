"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  MotionConfig,
  Reorder,
  motion,
  useDragControls,
  useReducedMotion,
} from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Cancel01Icon,
  Delete02Icon,
  DragDropVerticalIcon,
  MoreHorizontalCircle01Icon,
  PencilEdit02Icon,
  Search01Icon,
  ToggleOffIcon,
  UserBlock01Icon,
} from "@hugeicons/core-free-icons";
import clsx from "clsx";

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

function toFaDigits(value: string | number) {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)] ?? d);
}

/** Number then تومان — native RTL order (no dir=ltr flip). */
function formatAmount(n: number) {
  return `${toFaDigits(n.toLocaleString("en-US"))} تومان`;
}

const listSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34,
  mass: 0.75,
};

const ROW_EASE: [number, number, number, number] = [0.215, 0.61, 0.355, 1];

/**
 * Shared column template — header + rows stay aligned, no horizontal scroll.
 * RTL visual order (right → left): drag | name | role? | status | amount | actions
 * Amount stays near operations (left), never under the name.
 */
const GRID =
  "grid items-center gap-x-2.5 " +
  "grid-cols-[44px_minmax(0,1.15fr)_minmax(4.5rem,auto)_minmax(0,1.35fr)_44px] " +
  "sm:grid-cols-[44px_minmax(0,1.05fr)_minmax(0,0.85fr)_minmax(4.5rem,auto)_minmax(0,1.2fr)_52px]";

type Status = "active" | "pending" | "paused" | "blocked";

export type DataTableRow = {
  id: string;
  name: string;
  role: string;
  status: Status;
  amount: number;
};

type SortKey = "name" | "role" | "status" | "amount";
type SortDir = "asc" | "desc";
type SortState = { key: SortKey; dir: SortDir } | null;

type RowActionId = "edit" | "deactivate" | "block" | "delete";

const STATUS_LABEL: Record<Status, string> = {
  active: "فعال",
  pending: "در انتظار",
  paused: "غیرفعال",
  blocked: "مسدود",
};

const STATUS_CLASS: Record<Status, string> = {
  active:
    "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  pending:
    "border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-200",
  paused: "border-border bg-muted text-muted-foreground",
  blocked:
    "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

const ROW_ACTIONS: {
  id: RowActionId;
  label: string;
  icon: typeof PencilEdit02Icon;
  danger?: boolean;
}[] = [
  { id: "edit", label: "ویرایش", icon: PencilEdit02Icon },
  { id: "deactivate", label: "غیرفعال کردن", icon: ToggleOffIcon },
  { id: "block", label: "مسدود کردن", icon: UserBlock01Icon },
  { id: "delete", label: "حذف", icon: Delete02Icon, danger: true },
];

const INITIAL_ROWS: DataTableRow[] = [
  {
    id: "1",
    name: "سارا کریمی",
    role: "طراح محصول",
    status: "active",
    amount: 18_500_000,
  },
  {
    id: "2",
    name: "امیر رضایی",
    role: "مهندس فرانت",
    status: "pending",
    amount: 22_000_000,
  },
  {
    id: "3",
    name: "نگار احمدی",
    role: "مدیر پروژه",
    status: "active",
    amount: 27_400_000,
  },
  {
    id: "4",
    name: "علی موسوی",
    role: "بک‌اند",
    status: "paused",
    amount: 19_200_000,
  },
  {
    id: "5",
    name: "مریم صالحی",
    role: "مارکتینگ",
    status: "active",
    amount: 15_800_000,
  },
  {
    id: "6",
    name: "پارسا نوری",
    role: "دیتا",
    status: "pending",
    amount: 21_100_000,
  },
];

function compareRows(a: DataTableRow, b: DataTableRow, sort: SortState) {
  if (!sort) return 0;
  const { key, dir } = sort;
  const mul = dir === "asc" ? 1 : -1;
  if (key === "amount") return (a.amount - b.amount) * mul;
  if (key === "status") {
    return (
      STATUS_LABEL[a.status].localeCompare(STATUS_LABEL[b.status], "fa") * mul
    );
  }
  return String(a[key]).localeCompare(String(b[key]), "fa") * mul;
}

function StatusPill({ status }: { status: Status }) {
  return (
    <span
      className={clsx(
        "inline-flex max-w-full truncate items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        STATUS_CLASS[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function SortIcon({
  active,
  dir,
}: {
  active: boolean;
  dir: SortDir | null;
}) {
  if (!active || !dir) {
    return (
      <span className="inline-flex size-4 opacity-35">
        <HugeiconsIcon icon={ArrowDown01Icon} size={14} />
      </span>
    );
  }
  return (
    <motion.span
      key={dir}
      initial={{ opacity: 0, y: dir === "asc" ? 4 : -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex size-4 text-foreground"
    >
      <HugeiconsIcon
        icon={dir === "asc" ? ArrowUp01Icon : ArrowDown01Icon}
        size={14}
      />
    </motion.span>
  );
}

function RowActionsMenu({
  row,
  open,
  onOpenChange,
  onAction,
}: {
  row: DataTableRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (id: RowActionId, row: DataTableRow) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        onOpenChange(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={rootRef} className="relative flex justify-center">
      <button
        type="button"
        aria-label={`عملیات ${row.name}`}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => onOpenChange(!open)}
        className={clsx(
          "flex size-9 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground outline-none",
          "hover:bg-accent hover:text-foreground",
          "focus-visible:ring-2 focus-visible:ring-ring",
          open && "border-foreground/20 bg-accent text-foreground",
        )}
      >
        <HugeiconsIcon icon={MoreHorizontalCircle01Icon} size={20} />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            aria-label={`عملیات ${row.name}`}
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
            className="absolute top-[calc(100%+6px)] end-0 z-40 w-48 overflow-hidden border border-border bg-card p-1.5 shadow-lg"
            style={{ borderRadius: 16, borderWidth: 1 }}
          >
            {ROW_ACTIONS.map((action, index) => (
              <motion.button
                key={action.id}
                type="button"
                role="menuitem"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  bounce: 0.1,
                  duration: 0.25,
                  delay: 0.03 + index * 0.03,
                  ease: ROW_EASE,
                }}
                onClick={() => {
                  onAction(action.id, row);
                  onOpenChange(false);
                }}
                className={clsx(
                  "flex w-full cursor-default items-center gap-2.5 rounded-xl px-3 py-2 text-sm outline-none",
                  action.danger
                    ? "text-destructive hover:bg-destructive/10"
                    : "text-foreground hover:bg-accent",
                )}
              >
                <span
                  className={clsx(
                    "shrink-0",
                    action.danger
                      ? "text-destructive"
                      : "text-muted-foreground",
                  )}
                >
                  <HugeiconsIcon icon={action.icon} size={18} />
                </span>
                <span>{action.label}</span>
              </motion.button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function TableRow({
  row,
  reduce,
  dragEnabled,
  menuOpen,
  onMenuOpenChange,
  onAction,
}: {
  row: DataTableRow;
  reduce: boolean;
  dragEnabled: boolean;
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
  onAction: (id: RowActionId, row: DataTableRow) => void;
}) {
  const controls = useDragControls();
  const [dragging, setDragging] = useState(false);

  return (
    <Reorder.Item
      value={row}
      dragListener={false}
      dragControls={controls}
      onDragStart={() => {
        setDragging(true);
        onMenuOpenChange(false);
      }}
      onDragEnd={() => setDragging(false)}
      whileDrag={
        reduce
          ? undefined
          : {
              scale: 1.01,
              boxShadow:
                "0 18px 40px -20px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06)",
              zIndex: 20,
              borderRadius: 14,
            }
      }
      transition={reduce ? { duration: 0.12 } : listSpring}
      className={clsx(
        GRID,
        "relative border-b border-border/70 bg-card px-3 py-2 last:border-b-0",
        dragging ? "cursor-grabbing bg-accent/40" : "cursor-default",
        menuOpen && "z-30",
      )}
    >
      <div className="flex justify-center">
        <button
          type="button"
          disabled={!dragEnabled}
          aria-label={`جابه‌جایی ${row.name}`}
          className={clsx(
            "flex size-9 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground outline-none",
            "touch-none select-none",
            "focus-visible:ring-2 focus-visible:ring-ring",
            dragEnabled
              ? "cursor-grab active:cursor-grabbing"
              : "cursor-not-allowed opacity-40",
          )}
          onPointerDown={(event) => {
            if (!dragEnabled) return;
            controls.start(event);
          }}
        >
          <HugeiconsIcon icon={DragDropVerticalIcon} size={18} />
        </button>
      </div>

      <p className="min-w-0 truncate text-sm font-medium text-foreground">
        {row.name}
      </p>
      <p className="hidden min-w-0 truncate text-sm text-muted-foreground sm:block">
        {row.role}
      </p>
      <div className="min-w-0 shrink-0 justify-self-start">
        <StatusPill status={row.status} />
      </div>
      <p className="min-w-0 truncate text-start text-sm tabular-nums text-foreground">
        {formatAmount(row.amount)}
      </p>
      <RowActionsMenu
        row={row}
        open={menuOpen}
        onOpenChange={onMenuOpenChange}
        onAction={onAction}
      />
    </Reorder.Item>
  );
}

type SoftDataTableProps = {
  rows: DataTableRow[];
  onReorder: (next: DataTableRow[]) => void;
  onAction: (id: RowActionId, row: DataTableRow) => void;
  query: string;
  sort: SortState;
  "aria-label"?: string;
};

/** Filter + sort + drag reorder with layout motion. */
export function SoftDataTable({
  rows,
  onReorder,
  onAction,
  query,
  sort,
  "aria-label": ariaLabel,
}: SoftDataTableProps) {
  const reduce = useReducedMotion() ?? false;
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const q = query.trim().toLowerCase();

  const visible = useMemo(() => {
    const filtered = q
      ? rows.filter((row) => {
          const hay =
            `${row.name} ${row.role} ${STATUS_LABEL[row.status]}`.toLowerCase();
          return hay.includes(q);
        })
      : rows;
    if (!sort) return filtered;
    return [...filtered].sort((a, b) => compareRows(a, b, sort));
  }, [rows, q, sort]);

  const dragEnabled = !q && !sort;

  return (
    <Reorder.Group
      axis="y"
      values={visible}
      onReorder={(next) => {
        if (!dragEnabled) return;
        const visibleIds = new Set(next.map((r) => r.id));
        const queue = [...next];
        const merged = rows.map((row) =>
          visibleIds.has(row.id) ? queue.shift()! : row,
        );
        onReorder(merged);
      }}
      as="div"
      aria-label={ariaLabel ?? "جدول داده"}
      className="relative flex flex-col"
    >
      <AnimatePresence initial={false}>
        {visible.map((row) => (
          <TableRow
            key={row.id}
            row={row}
            reduce={reduce}
            dragEnabled={dragEnabled}
            menuOpen={openMenuId === row.id}
            onMenuOpenChange={(open) =>
              setOpenMenuId(open ? row.id : null)
            }
            onAction={onAction}
          />
        ))}
      </AnimatePresence>
    </Reorder.Group>
  );
}

const COLUMNS: { key: SortKey; label: string; className?: string }[] = [
  { key: "name", label: "نام" },
  { key: "role", label: "نقش", className: "hidden sm:inline-flex" },
  { key: "status", label: "وضعیت" },
  { key: "amount", label: "مبلغ" },
];

const ROW_H = 56;

export default function AnimatedDataTable() {
  const reduce = useReducedMotion() ?? false;
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortState>(null);
  const [toast, setToast] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [bodyMinH, setBodyMinH] = useState(INITIAL_ROWS.length * ROW_H);

  const visibleCount = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows.length;
    return rows.filter((row) => {
      const hay =
        `${row.name} ${row.role} ${STATUS_LABEL[row.status]}`.toLowerCase();
      return hay.includes(q);
    }).length;
  }, [rows, query]);

  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el || visibleCount === 0) return;
    const next = Math.ceil(el.getBoundingClientRect().height);
    setBodyMinH((prev) => (next > prev ? next : prev));
  }, [visibleCount, rows, sort]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 1600);
    return () => window.clearTimeout(id);
  }, [toast]);

  function toggleSort(key: SortKey) {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  }

  function handleAction(id: RowActionId, row: DataTableRow) {
    if (id === "edit") {
      setToast(`ویرایش «${row.name}»`);
      return;
    }
    if (id === "deactivate") {
      setRows((prev) =>
        prev.map((item) =>
          item.id === row.id ? { ...item, status: "paused" } : item,
        ),
      );
      setToast(`${row.name} غیرفعال شد`);
      return;
    }
    if (id === "block") {
      setRows((prev) =>
        prev.map((item) =>
          item.id === row.id ? { ...item, status: "blocked" } : item,
        ),
      );
      setToast(`${row.name} مسدود شد`);
      return;
    }
    setRows((prev) => prev.filter((item) => item.id !== row.id));
    setToast(`«${row.name}» حذف شد`);
  }

  return (
    <section
      dir="rtl"
      lang="fa"
      aria-label="جدول داده انیمیشنی"
      className="relative flex w-full max-w-[760px] flex-col gap-4 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <MotionConfig transition={listSpring}>
        <div
          className="border border-border bg-card"
          style={{ borderRadius: 20, borderWidth: 1 }}
        >
          <div className="flex flex-col gap-3 border-b border-border px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 px-1">
              <p className="text-base font-medium text-foreground">اعضای تیم</p>
              <p className="text-sm text-muted-foreground">
                فیلتر، مرتب‌سازی، جابه‌جایی و عملیات ردیف
              </p>
            </div>

            <div className="flex items-center gap-2">
              <motion.span
                key={visibleCount}
                initial={reduce ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="shrink-0 text-sm text-muted-foreground tabular-nums"
              >
                {toFaDigits(visibleCount)} نفر
              </motion.span>

              <label className="relative flex min-w-0 flex-1 items-center sm:w-[200px] sm:flex-none">
                <span className="pointer-events-none absolute start-2.5 text-muted-foreground">
                  <HugeiconsIcon icon={Search01Icon} size={16} />
                </span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="جستجو…"
                  className="h-9 w-full rounded-xl border border-border bg-background pe-8 ps-8 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="فیلتر جدول"
                />
                {query ? (
                  <button
                    type="button"
                    aria-label="پاک کردن جستجو"
                    className="absolute end-1.5 flex size-6 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                    onClick={() => setQuery("")}
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={14} />
                  </button>
                ) : null}
              </label>
            </div>
          </div>

          <div
            className={clsx(
              GRID,
              "border-b border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground",
            )}
          >
            {/* Occupies the drag column so headers stay aligned with cells */}
            <span className="block size-9" aria-hidden />
            {COLUMNS.map((col) => {
              const active = sort?.key === col.key;
              return (
                <button
                  key={col.key}
                  type="button"
                  onClick={() => toggleSort(col.key)}
                  className={clsx(
                    "min-w-0 items-center gap-1 justify-self-start rounded-lg px-1 py-1 text-start outline-none transition-colors",
                    "hover:bg-accent hover:text-foreground",
                    "focus-visible:ring-2 focus-visible:ring-ring",
                    active && "text-foreground",
                    col.className ?? "inline-flex",
                  )}
                >
                  <span className="truncate">{col.label}</span>
                  <SortIcon
                    active={Boolean(active)}
                    dir={active ? sort!.dir : null}
                  />
                </button>
              );
            })}
            <span className="justify-self-center text-center text-[11px] font-medium sm:text-xs">
              عملیات
            </span>
          </div>

          <div
            ref={bodyRef}
            className="relative"
            style={{ minHeight: bodyMinH }}
          >
            <SoftDataTable
              rows={rows}
              onReorder={setRows}
              onAction={handleAction}
              query={query}
              sort={sort}
            />

            <AnimatePresence initial={false}>
              {visibleCount === 0 ? (
                <motion.p
                  key="empty"
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 text-sm text-muted-foreground"
                >
                  نتیجه‌ای پیدا نشد
                </motion.p>
              ) : null}
            </AnimatePresence>
          </div>

          <p className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
            {query || sort
              ? "برای درگ ردیف‌ها، فیلتر و مرتب‌سازی را خاموش کن"
              : "از دسته بکش · روی ستون بزن · از ⋯ برای عملیات"}
          </p>
        </div>
      </MotionConfig>

      <AnimatePresence>
        {toast ? (
          <motion.div
            key={toast}
            role="status"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="pointer-events-none absolute inset-x-0 -bottom-2 z-50 mx-auto w-fit -translate-y-full rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground shadow-md"
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
