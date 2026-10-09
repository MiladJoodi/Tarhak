"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DragDropVerticalIcon,
  ZoomInAreaIcon,
  ZoomOutAreaIcon,
} from "@hugeicons/core-free-icons";
import clsx from "clsx";

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

function toFaDigits(value: string | number) {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)] ?? d);
}

/** Manual board zoom — lets you see more columns, then drag. */
const ZOOM_STEPS = [0.55, 0.7, 0.85, 1] as const;

export type KanbanColumnId = "todo" | "doing" | "done";

export type KanbanCard = {
  id: string;
  title: string;
  tag: string;
  assignee: string;
  priority: "low" | "mid" | "high";
};

export type KanbanBoardData = Record<KanbanColumnId, KanbanCard[]>;

const COLUMN_META: {
  id: KanbanColumnId;
  title: string;
  tint: string;
}[] = [
  { id: "todo", title: "انجام نشده", tint: "bg-sky-500" },
  { id: "doing", title: "در حال انجام", tint: "bg-amber-500" },
  { id: "done", title: "انجام‌شده", tint: "bg-emerald-500" },
];

const PRIORITY_DOT: Record<KanbanCard["priority"], string> = {
  low: "bg-muted-foreground/45",
  mid: "bg-amber-500",
  high: "bg-rose-500",
};

// Change Here
const INITIAL_BOARD: KanbanBoardData = {
  todo: [
    {
      id: "t1",
      title: "طراحی صفحهٔ قیمت‌گذاری",
      tag: "طراحی",
      assignee: "سارا",
      priority: "high",
    },
    {
      id: "t2",
      title: "نوشتن کپی هیرو",
      tag: "محتوا",
      assignee: "علی",
      priority: "mid",
    },
    {
      id: "t3",
      title: "بررسی دسترسی‌پذیری فرم",
      tag: "کیفیت",
      assignee: "نیکا",
      priority: "low",
    },
  ],
  doing: [
    {
      id: "d1",
      title: "اتصال درگاه پرداخت",
      tag: "بک‌اند",
      assignee: "رضا",
      priority: "high",
    },
    {
      id: "d2",
      title: "انیمیشن کارت محصول",
      tag: "فرانت",
      assignee: "سارا",
      priority: "mid",
    },
  ],
  done: [
    {
      id: "n1",
      title: "راه‌اندازی محیط استیجینگ",
      tag: "devops",
      assignee: "امیر",
      priority: "mid",
    },
    {
      id: "n2",
      title: "تعریف توکن‌های رنگ",
      tag: "طراحی",
      assignee: "نیکا",
      priority: "low",
    },
  ],
};

type DragState = {
  cardId: string;
  fromColumn: KanbanColumnId;
  fromIndex: number;
  overColumn: KanbanColumnId;
  overIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
};

function findCard(
  board: KanbanBoardData,
  cardId: string,
): { column: KanbanColumnId; index: number; card: KanbanCard } | null {
  for (const col of COLUMN_META) {
    const index = board[col.id].findIndex((c) => c.id === cardId);
    if (index >= 0) {
      return { column: col.id, index, card: board[col.id][index]! };
    }
  }
  return null;
}

function moveCard(
  board: KanbanBoardData,
  cardId: string,
  toColumn: KanbanColumnId,
  toIndex: number,
): KanbanBoardData {
  const found = findCard(board, cardId);
  if (!found) return board;

  const next: KanbanBoardData = {
    todo: [...board.todo],
    doing: [...board.doing],
    done: [...board.done],
  };

  const [card] = next[found.column].splice(found.index, 1);
  if (!card) return board;

  let insertAt = toIndex;
  if (found.column === toColumn && found.index < toIndex) {
    insertAt = Math.max(0, toIndex - 1);
  }
  insertAt = Math.max(0, Math.min(insertAt, next[toColumn].length));
  next[toColumn].splice(insertAt, 0, card);
  return next;
}

function hitTestColumns(
  clientX: number,
  clientY: number,
  columnEls: Map<KanbanColumnId, HTMLElement | null>,
): KanbanColumnId | null {
  for (const col of COLUMN_META) {
    const el = columnEls.get(col.id);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (
      clientX >= r.left &&
      clientX <= r.right &&
      clientY >= r.top &&
      clientY <= r.bottom
    ) {
      return col.id;
    }
  }
  return null;
}

function hitTestIndex(
  clientY: number,
  column: KanbanColumnId,
  cardEls: Map<string, HTMLElement | null>,
  board: KanbanBoardData,
  draggingId: string,
): number {
  const cards = board[column].filter((c) => c.id !== draggingId);
  if (cards.length === 0) return 0;

  for (let i = 0; i < cards.length; i++) {
    const el = cardEls.get(cards[i]!.id);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    const mid = r.top + r.height / 2;
    if (clientY < mid) return i;
  }
  return cards.length;
}

function CardFace({
  card,
  ghost,
}: {
  card: KanbanCard;
  ghost?: boolean;
}) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-border bg-card p-3 text-foreground shadow-sm",
        ghost && "shadow-xl ring-1 ring-border",
      )}
    >
      <div className="flex items-start gap-2">
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground">
          <HugeiconsIcon icon={DragDropVerticalIcon} size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug">{card.title}</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="rounded-lg bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
              {card.tag}
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className={clsx(
                  "size-1.5 rounded-full",
                  PRIORITY_DOT[card.priority],
                )}
                aria-hidden
              />
              <span className="text-[11px] text-muted-foreground">
                {card.assignee}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export type KanbanBoardProps = {
  initialBoard?: KanbanBoardData;
  className?: string;
  onChange?: (board: KanbanBoardData) => void;
};

export default function KanbanBoard({
  initialBoard = INITIAL_BOARD,
  className,
  onChange,
}: KanbanBoardProps) {
  const reduce = useReducedMotion();
  const [board, setBoard] = useState<KanbanBoardData>(initialBoard);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [zoomIndex, setZoomIndex] = useState(ZOOM_STEPS.length - 1);
  const rootRef = useRef<HTMLElement | null>(null);
  const columnRefs = useRef(new Map<KanbanColumnId, HTMLElement | null>());
  const cardRefs = useRef(new Map<string, HTMLElement | null>());
  const boardRef = useRef(board);
  const dragRef = useRef(drag);
  const zoom = ZOOM_STEPS[zoomIndex] ?? 1;

  const zoomOut = useCallback(() => {
    setZoomIndex((i) => Math.max(0, i - 1));
  }, []);

  const zoomIn = useCallback(() => {
    setZoomIndex((i) => Math.min(ZOOM_STEPS.length - 1, i + 1));
  }, []);

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  useEffect(() => {
    dragRef.current = drag;
  }, [drag]);

  const updateBoard = useCallback(
    (next: KanbanBoardData) => {
      setBoard(next);
      onChange?.(next);
    },
    [onChange],
  );

  const onPointerDownCard = (
    event: ReactPointerEvent<HTMLDivElement>,
    column: KanbanColumnId,
    index: number,
    card: KanbanCard,
  ) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();

    setDrag({
      cardId: card.id,
      fromColumn: column,
      fromIndex: index,
      overColumn: column,
      overIndex: index,
      x: event.clientX,
      y: event.clientY,
      width: rect.width,
      height: rect.height,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    });
  };

  const isDragging = Boolean(drag);

  useEffect(() => {
    if (!isDragging) return;

    const prevUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";

    const onMove = (event: PointerEvent) => {
      const current = dragRef.current;
      if (!current) return;

      const overColumn =
        hitTestColumns(event.clientX, event.clientY, columnRefs.current) ??
        current.overColumn;
      const overIndex = hitTestIndex(
        event.clientY,
        overColumn,
        cardRefs.current,
        boardRef.current,
        current.cardId,
      );

      setDrag({
        ...current,
        x: event.clientX,
        y: event.clientY,
        overColumn,
        overIndex,
      });
    };

    const onUp = () => {
      const current = dragRef.current;
      if (!current) return;
      const next = moveCard(
        boardRef.current,
        current.cardId,
        current.overColumn,
        current.overIndex,
      );
      updateBoard(next);
      setDrag(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      document.body.style.userSelect = prevUserSelect;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [isDragging, updateBoard]);

  const draggingCard = drag ? findCard(board, drag.cardId)?.card : null;
  const total = board.todo.length + board.doing.length + board.done.length;
  const canZoomOut = zoomIndex > 0;
  const canZoomIn = zoomIndex < ZOOM_STEPS.length - 1;

  /** Zoom is mobile-only — lock to 100% from `sm` up. */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const sync = () => {
      if (mq.matches) setZoomIndex(ZOOM_STEPS.length - 1);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <section
      ref={rootRef}
      dir="rtl"
      lang="fa"
      aria-label="برد کانبان"
      className={clsx(
        "w-full max-w-5xl font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal",
        className,
      )}
    >
      <div className="mb-3 flex items-end justify-between gap-3 px-1">
        <div className="min-w-0">
          <h2 className="text-lg font-medium text-foreground">برد تسک‌ها</h2>
          <p className="text-sm text-muted-foreground max-sm:hidden">
            کارت را بکش و بین ستون‌ها رها کن
          </p>
          <p className="text-sm text-muted-foreground sm:hidden">
            دورتر کن تا ستون‌ها را ببینی، بعد کارت را بکش
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <p className="text-sm tabular-nums text-muted-foreground">
            {toFaDigits(total)} کارت
          </p>
          <div
            className="flex items-center gap-0.5 rounded-xl border border-border bg-card p-0.5 sm:hidden"
            role="group"
            aria-label="بزرگ‌نمایی برد"
          >
            <button
              type="button"
              onClick={zoomOut}
              disabled={!canZoomOut}
              aria-label="دورتر"
              title="دورتر"
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-35"
            >
              <HugeiconsIcon icon={ZoomOutAreaIcon} size={16} />
            </button>
            <span className="min-w-10 text-center text-[11px] tabular-nums text-muted-foreground">
              {toFaDigits(Math.round(zoom * 100))}٪
            </span>
            <button
              type="button"
              onClick={zoomIn}
              disabled={!canZoomIn}
              aria-label="نزدیک‌تر"
              title="نزدیک‌تر"
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-35"
            >
              <HugeiconsIcon icon={ZoomInAreaIcon} size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div
          className="flex origin-top-right gap-3 transition-[zoom] duration-150"
          style={{ zoom }}
        >
        {COLUMN_META.map((col) => {
          const cards = board[col.id];
          const isOver = drag?.overColumn === col.id;
          const showPlaceholder = Boolean(drag && isOver);

          const visible = cards.filter((c) => c.id !== drag?.cardId);
          const insertAt = drag && isOver ? drag.overIndex : -1;

          return (
            <div
              key={col.id}
              ref={(el) => {
                columnRefs.current.set(col.id, el);
              }}
              className={clsx(
                "flex w-[min(100%,17.5rem)] shrink-0 flex-col rounded-[22px] border bg-muted/40 p-2 transition-colors",
                isOver ? "border-[#3451e5]/55 bg-[#3451e5]/8" : "border-border",
              )}
            >
              <header className="mb-2 flex items-center justify-between gap-2 px-2 pt-1">
                <div className="flex items-center gap-2">
                  <span
                    className={clsx("size-2 rounded-full", col.tint)}
                    aria-hidden
                  />
                  <h3 className="text-sm font-medium text-foreground">
                    {col.title}
                  </h3>
                </div>
                <span className="rounded-lg bg-background px-1.5 py-0.5 text-[11px] tabular-nums text-muted-foreground">
                  {toFaDigits(cards.length)}
                </span>
              </header>

              <div className="flex min-h-28 flex-1 flex-col gap-2">
                {visible.map((card, visualIndex) => {
                  const placeholderBefore =
                    showPlaceholder && insertAt === visualIndex;
                  return (
                    <div key={card.id}>
                      {placeholderBefore ? (
                        <div
                          className="mb-2 rounded-2xl border border-dashed border-[#3451e5]/50 bg-[#3451e5]/10"
                          style={{ height: drag?.height ?? 72 }}
                        />
                      ) : null}
                      <div
                        ref={(el) => {
                          cardRefs.current.set(card.id, el);
                        }}
                        role="button"
                        tabIndex={0}
                        aria-grabbed={false}
                        aria-label={`جابه‌جایی ${card.title}`}
                        onPointerDown={(e) =>
                          onPointerDownCard(
                            e,
                            col.id,
                            board[col.id].findIndex((c) => c.id === card.id),
                            card,
                          )
                        }
                        className="cursor-grab touch-none select-none outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <CardFace card={card} />
                      </div>
                    </div>
                  );
                })}

                {showPlaceholder && insertAt >= visible.length ? (
                  <div
                    className="rounded-2xl border border-dashed border-[#3451e5]/50 bg-[#3451e5]/10"
                    style={{ height: drag?.height ?? 72 }}
                  />
                ) : null}

                {visible.length === 0 && !showPlaceholder ? (
                  <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                    کارت را اینجا رها کن
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
        </div>
      </div>

      <AnimatePresence>
        {drag && draggingCard ? (
          <motion.div
            key={drag.cardId}
            aria-hidden
            className="pointer-events-none fixed z-50"
            style={{
              left: drag.x - drag.offsetX,
              top: drag.y - drag.offsetY,
              width: drag.width,
            }}
            initial={reduce ? false : { scale: 1.02, rotate: -1.5 }}
            animate={{ scale: 1.03, rotate: -1.5 }}
            exit={reduce ? undefined : { opacity: 0, scale: 0.98 }}
          >
            <CardFace card={draggingCard} ghost />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
