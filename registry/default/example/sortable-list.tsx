"use client";

import { useState } from "react";
import {
  MotionConfig,
  Reorder,
  useDragControls,
  useReducedMotion,
  motion,
} from "motion/react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  DragDropVerticalIcon,
  Mail01Icon,
  Notification03Icon,
  PaintBoardIcon,
  TaskDaily01Icon,
} from "@hugeicons/core-free-icons";
import clsx from "clsx";

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

function toFaDigits(value: string | number) {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)]!);
}

const listSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 32,
  mass: 0.75,
};

export type SortableItem = {
  id: string;
  title: string;
  description: string;
  icon: IconSvgElement;
};

type SortableRowProps = {
  item: SortableItem;
  index: number;
  reduce: boolean;
};

function SortableRow({ item, index, reduce }: SortableRowProps) {
  const controls = useDragControls();
  const [dragging, setDragging] = useState(false);

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => setDragging(false)}
      whileDrag={
        reduce
          ? undefined
          : {
              scale: 1.02,
              boxShadow:
                "0 16px 40px -18px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)",
              zIndex: 20,
            }
      }
      transition={reduce ? { duration: 0.12 } : listSpring}
      className={clsx(
        "relative list-none rounded-2xl border border-border bg-card",
        dragging ? "cursor-grabbing" : "cursor-default",
      )}
      style={{ borderWidth: 1 }}
    >
      <div className="flex items-center gap-2.5 px-2.5 py-2.5">
        <button
          type="button"
          aria-label={`جابه‌جایی ${item.title}`}
          className={clsx(
            "flex size-10 shrink-0 cursor-grab items-center justify-center rounded-xl border border-border bg-background text-muted-foreground outline-none",
            "touch-none select-none",
            "focus-visible:ring-2 focus-visible:ring-ring",
            "active:cursor-grabbing",
          )}
          onPointerDown={(event) => controls.start(event)}
        >
          <HugeiconsIcon icon={DragDropVerticalIcon} size={20} />
        </button>

        <motion.span
          layout
          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-sm font-medium tabular-nums text-muted-foreground"
          transition={reduce ? { duration: 0.1 } : listSpring}
        >
          {toFaDigits(index + 1)}
        </motion.span>

        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground">
          <HugeiconsIcon icon={item.icon} size={22} />
        </span>

        <div className="min-w-0 flex-1 pe-1">
          <p className="truncate text-base font-medium text-foreground">
            {item.title}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {item.description}
          </p>
        </div>
      </div>
    </Reorder.Item>
  );
}

type SoftSortableListProps = {
  items: SortableItem[];
  onReorder: (next: SortableItem[]) => void;
  "aria-label"?: string;
};

/** Drag handle + spring reorder. Pass controlled items. */
export function SoftSortableList({
  items,
  onReorder,
  "aria-label": ariaLabel,
}: SoftSortableListProps) {
  const reduce = useReducedMotion() ?? false;

  return (
    <Reorder.Group
      axis="y"
      values={items}
      onReorder={onReorder}
      as="ul"
      aria-label={ariaLabel ?? "لیست قابل مرتب‌سازی"}
      className="flex flex-col gap-2 p-0"
    >
      {items.map((item, index) => (
        <SortableRow
          key={item.id}
          item={item}
          index={index}
          reduce={reduce}
        />
      ))}
    </Reorder.Group>
  );
}

const INITIAL_ITEMS: SortableItem[] = [
  {
    id: "mail",
    title: "پاسخ ایمیل‌ها",
    description: "صندوق ورودی امروز",
    icon: Mail01Icon,
  },
  {
    id: "design",
    title: "بازبینی طرح",
    description: "نسخهٔ موبایل صفحهٔ اصلی",
    icon: PaintBoardIcon,
  },
  {
    id: "notify",
    title: "اعلان‌های پروژه",
    description: "خلاصهٔ روزانه را بفرست",
    icon: Notification03Icon,
  },
  {
    id: "tasks",
    title: "بستن تسک‌های باز",
    description: "سه کار اولویت‌دار",
    icon: TaskDaily01Icon,
  },
];

export default function SortableList() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const reduce = useReducedMotion() ?? false;

  return (
    <section
      dir="rtl"
      lang="fa"
      aria-label="لیست مرتب‌سازی"
      className="flex w-full max-w-[380px] flex-col gap-4 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <MotionConfig transition={listSpring}>
        <div
          className="overflow-hidden border border-border bg-card p-3"
          style={{ borderRadius: 20, borderWidth: 1 }}
        >
          <div className="mb-3 flex items-end justify-between gap-3 px-1">
            <div>
              <p className="text-base font-medium text-foreground">
                اولویت امروز
              </p>
              <p className="text-sm text-muted-foreground">
                از دسته بکش و جابه‌جا کن
              </p>
            </div>
            <motion.span
              key={items.map((i) => i.id).join("-")}
              initial={reduce ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="shrink-0 text-sm text-muted-foreground tabular-nums"
            >
              {toFaDigits(items.length)} مورد
            </motion.span>
          </div>

          <SoftSortableList items={items} onReorder={setItems} />
        </div>
      </MotionConfig>
    </section>
  );
}
