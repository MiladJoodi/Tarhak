"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "motion/react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Delete02Icon,
  File01Icon,
  Folder01Icon,
  Image01Icon,
  Mail01Icon,
  Undo03Icon,
} from "@hugeicons/core-free-icons";

export type UndoItem = {
  id: string;
  title: string;
  meta: string;
  icon: IconSvgElement;
};

type PendingUndo = {
  item: UndoItem;
  index: number;
};

const UNDO_MS = 5000;
const ACCENT = "#E11D48";

const spring: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 32,
  mass: 0.75,
};

const INITIAL: UndoItem[] = [
  {
    id: "brief",
    title: "بریف محصول",
    meta: "سند · دیروز",
    icon: File01Icon,
  },
  {
    id: "shots",
    title: "عکس‌های کمپین",
    meta: "۱۲ تصویر · این هفته",
    icon: Image01Icon,
  },
  {
    id: "inbox",
    title: "پیش‌نویس ایمیل",
    meta: "پیش‌نویس · امروز",
    icon: Mail01Icon,
  },
  {
    id: "assets",
    title: "پوشهٔ دارایی‌ها",
    meta: "۸ فایل · آرشیو",
    icon: Folder01Icon,
  },
];

/** Keep list box height fixed so centered previews do not shrink from the top. */
const LIST_GAP_PX = 8;
const ROW_H_PX = 66;
const LIST_H_PX =
  INITIAL.length * ROW_H_PX + (INITIAL.length - 1) * LIST_GAP_PX;

function UndoBar({
  pending,
  onUndo,
  onExpire,
  reduce,
}: {
  pending: PendingUndo;
  onUndo: () => void;
  onExpire: () => void;
  reduce: boolean;
}) {
  const [progress, setProgress] = useState(1);
  const expired = useRef(false);

  useEffect(() => {
    expired.current = false;
    setProgress(1);

    if (reduce) {
      const t = window.setTimeout(() => {
        if (!expired.current) {
          expired.current = true;
          onExpire();
        }
      }, UNDO_MS);
      return () => window.clearTimeout(t);
    }

    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / UNDO_MS);
      setProgress(1 - t);
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else if (!expired.current) {
        expired.current = true;
        onExpire();
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [pending.item.id, onExpire, reduce]);

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={reduce ? false : { opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.97 }}
      transition={spring}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      style={{ borderInlineStartWidth: 3, borderInlineStartColor: ACCENT }}
    >
      <div className="flex items-center gap-3 px-3.5 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            «{pending.item.title}» حذف شد
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            تا چند ثانیه می‌توانید بازگردانید
          </p>
        </div>
        <button
          type="button"
          onClick={onUndo}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: ACCENT }}
        >
          <HugeiconsIcon icon={Undo03Icon} size={16} />
          بازگردانی
        </button>
      </div>
      {!reduce ? (
        <div className="h-0.5 w-full bg-border/60">
          <div
            className="h-full origin-right"
            style={{
              width: `${progress * 100}%`,
              background: ACCENT,
            }}
          />
        </div>
      ) : null}
    </motion.div>
  );
}

function ListRow({
  item,
  onDelete,
  reduce,
}: {
  item: UndoItem;
  onDelete: (id: string) => void;
  reduce: boolean;
}) {
  return (
    <motion.li
      layout="position"
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, height: ROW_H_PX }}
      exit={
        reduce
          ? { opacity: 0, height: 0 }
          : {
              opacity: 0,
              x: 24,
              height: 0,
              marginBottom: 0,
              filter: "blur(3px)",
            }
      }
      transition={spring}
      style={{ marginBottom: 0 }}
      className="flex shrink-0 items-center gap-2.5 overflow-hidden rounded-2xl border border-border bg-card px-2.5"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground">
        <HugeiconsIcon icon={item.icon} size={22} />
      </span>
      <div className="min-w-0 flex-1 pe-1">
        <p className="truncate text-base font-medium text-foreground">
          {item.title}
        </p>
        <p className="truncate text-sm text-muted-foreground">{item.meta}</p>
      </div>
      <button
        type="button"
        aria-label={`حذف ${item.title}`}
        onClick={() => onDelete(item.id)}
        className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-600"
      >
        <HugeiconsIcon icon={Delete02Icon} size={18} />
      </button>
    </motion.li>
  );
}

export default function UndoDelete() {
  const reduce = useReducedMotion() ?? false;
  const [items, setItems] = useState<UndoItem[]>(INITIAL);
  const [pending, setPending] = useState<PendingUndo | null>(null);
  const pendingRef = useRef<PendingUndo | null>(null);

  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);

  const expire = useCallback(() => {
    setPending(null);
  }, []);

  const undo = useCallback(() => {
    const current = pendingRef.current;
    if (!current) return;
    setItems((prev) => {
      const next = [...prev];
      const at = Math.min(current.index, next.length);
      next.splice(at, 0, current.item);
      return next;
    });
    setPending(null);
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const index = prev.findIndex((item) => item.id === id);
      if (index < 0) return prev;
      const item = prev[index]!;
      setPending({ item, index });
      return prev.filter((row) => row.id !== id);
    });
  }, []);

  const reset = useCallback(() => {
    setPending(null);
    setItems(INITIAL);
  }, []);

  return (
    <section
      dir="rtl"
      lang="fa"
      aria-label="حذف با بازگردانی"
      className="relative flex w-full max-w-md flex-col font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <div className="overflow-hidden rounded-[24px] border border-border bg-card px-4 py-4 text-foreground">
        <header className="mb-4 flex items-start justify-between gap-3 px-1">
          <div>
            <h2 className="text-lg font-medium">فایل‌های اخیر</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              حذف کن؛ تا پنج ثانیه بازگردان
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            disabled={items.length === INITIAL.length}
            aria-hidden={items.length === INITIAL.length}
            tabIndex={items.length === INITIAL.length ? -1 : undefined}
            className={
              items.length === INITIAL.length
                ? "invisible shrink-0 rounded-xl border border-border px-2.5 py-1.5 text-xs"
                : "shrink-0 rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            }
          >
            بازنشانی
          </button>
        </header>

        <ul
          className="flex flex-col justify-start"
          style={{ height: LIST_H_PX, gap: LIST_GAP_PX }}
        >
          <AnimatePresence initial={false}>
            {items.length === 0 ? (
              <motion.li
                key="empty"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full list-none items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/30 px-4 text-center text-sm text-muted-foreground"
              >
                فهرستی خالی است — بازگردانی یا بازنشانی
              </motion.li>
            ) : (
              items.map((item) => (
                <ListRow
                  key={item.id}
                  item={item}
                  onDelete={remove}
                  reduce={reduce}
                />
              ))
            )}
          </AnimatePresence>
        </ul>

        <div className="mt-3 h-18">
          <AnimatePresence mode="wait" initial={false}>
            {pending ? (
              <UndoBar
                key={pending.item.id}
                pending={pending}
                onUndo={undo}
                onExpire={expire}
                reduce={reduce}
              />
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
