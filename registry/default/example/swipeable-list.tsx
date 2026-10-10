"use client";
// Adapted from beui.dev/components/blocks/swipeable-list
// Visual language aligned with filter-interaction (Estedad, text-base rows, Hugeicons).

import {
  Clock01Icon,
  Delete02Icon,
  File01Icon,
  Flag01Icon,
  Mail01Icon,
  PinIcon,
  RefreshIcon,
  Tick02Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  type PanInfo,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

/** Selection opt-out on coarse pointers — inlined for a self-contained registry file. */
const TOUCH_GESTURE_CONTENT_CLASS =
  "[-webkit-touch-callout:none] pointer-coarse:select-none";

export type SwipeSide = "left" | "right";

export type SwipeableListValue = {
  id: string;
  side: SwipeSide;
};

export type SwipeActionTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger";

export type SwipeAction = {
  id: string;
  label: ReactNode;
  icon: ReactNode;
  tone?: SwipeActionTone;
  disabled?: boolean;
  onClick?: (item: SwipeableListItem) => void;
};

export type SwipeableListItem = {
  id: string;
  title?: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  leading?: ReactNode;
  content?: ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  disabled?: boolean;
};

export type SwipeableListClassNames = {
  root?: string;
  item?: string;
  rail?: string;
  action?: string;
  surface?: string;
  leading?: string;
  content?: string;
  title?: string;
  description?: string;
  meta?: string;
};

export interface SwipeableListProps {
  items: SwipeableListItem[];
  value?: SwipeableListValue | null;
  defaultValue?: SwipeableListValue | null;
  onValueChange?: (value: SwipeableListValue | null) => void;
  onAction?: (payload: {
    item: SwipeableListItem;
    action: SwipeAction;
    side: SwipeSide;
  }) => void;
  actionWidth?: number;
  revealThreshold?: number;
  closeOnAction?: boolean;
  className?: string;
  classNames?: SwipeableListClassNames;
  renderItem?: (item: SwipeableListItem) => ReactNode;
}

const ROW_SETTLE = {
  type: "spring" as const,
  stiffness: 560,
  damping: 48,
  mass: 0.82,
  restDelta: 0.5,
  restSpeed: 8,
};

const OPEN_DISTANCE_RATIO = 0.46;
const CLOSE_DISTANCE_RATIO = 0.72;
const OPEN_VELOCITY = 720;
const CLOSE_VELOCITY = 320;
const FLING_DISTANCE = 14;
const RELEASE_VELOCITY_LIMIT = 1500;

const ACTION_TONE_CLASS: Record<SwipeActionTone, string> = {
  neutral: "text-muted-foreground group-hover:text-foreground",
  primary: "text-foreground",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-destructive",
};

function useControllableSwipeValue({
  value,
  defaultValue,
  onValueChange,
}: {
  value?: SwipeableListValue | null;
  defaultValue?: SwipeableListValue | null;
  onValueChange?: (value: SwipeableListValue | null) => void;
}) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? null);
  const isControlled = value !== undefined;
  const currentValue = value ?? internalValue;

  const setValue = useCallback(
    (next: SwipeableListValue | null) => {
      if (!isControlled) {
        setInternalValue(next);
      }
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  return [currentValue, setValue] as const;
}

function isActionableSide(value: number, sideWidth: number) {
  return sideWidth > 0 && Math.abs(value) > 0;
}

function clampReleaseVelocity(velocity: number) {
  return Math.max(
    -RELEASE_VELOCITY_LIMIT,
    Math.min(RELEASE_VELOCITY_LIMIT, velocity),
  );
}

function SwipeActionButton({
  action,
  actionWidth,
  side,
  focusable,
  onAction,
  className,
}: {
  action: SwipeAction;
  actionWidth: number;
  side: SwipeSide;
  focusable: boolean;
  onAction: (action: SwipeAction, side: SwipeSide) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled={action.disabled}
      tabIndex={focusable ? 0 : -1}
      aria-label={typeof action.label === "string" ? action.label : undefined}
      onClick={() => onAction(action, side)}
      className={cn(
        "group flex h-full shrink-0 items-center justify-center outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      style={{ width: actionWidth }}
    >
      <span
        className={cn(
          "grid size-10 place-items-center rounded-2xl transition-[background-color,color,transform] duration-150 group-hover:bg-background group-active:scale-95",
          ACTION_TONE_CLASS[action.tone ?? "neutral"],
        )}
      >
        {action.icon}
      </span>
      <span className="sr-only">{action.label}</span>
    </button>
  );
}

function SwipeableListRow({
  item,
  actionWidth,
  revealThreshold,
  openValue,
  setOpenValue,
  closeOnAction,
  onAction,
  classNames,
  renderItem,
}: {
  item: SwipeableListItem;
  actionWidth: number;
  revealThreshold: number;
  openValue: SwipeableListValue | null;
  setOpenValue: (value: SwipeableListValue | null) => void;
  closeOnAction: boolean;
  onAction?: SwipeableListProps["onAction"];
  classNames?: SwipeableListClassNames;
  renderItem?: (item: SwipeableListItem) => ReactNode;
}) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const animationRef = useRef<{ stop: () => void } | null>(null);
  const commandedTargetRef = useRef(0);
  const leftActions = item.leftActions ?? [];
  const rightActions = item.rightActions ?? [];
  const leftWidth = leftActions.length * actionWidth;
  const rightWidth = rightActions.length * actionWidth;
  const openSide = openValue?.id === item.id ? openValue.side : null;
  const targetX =
    openSide === "left" ? leftWidth : openSide === "right" ? -rightWidth : 0;

  const settleX = useCallback(
    (nextX: number, velocity = 0) => {
      commandedTargetRef.current = nextX;
      animationRef.current?.stop();

      if (reduce) {
        x.set(nextX);
        return;
      }

      animationRef.current = animate(x, nextX, {
        ...ROW_SETTLE,
        velocity: clampReleaseVelocity(velocity),
        onComplete: () => x.set(nextX),
      });
    },
    [reduce, x],
  );

  useEffect(() => {
    return () => animationRef.current?.stop();
  }, []);

  useEffect(() => {
    if (commandedTargetRef.current === targetX) {
      return;
    }
    settleX(targetX);
  }, [settleX, targetX]);

  const getTargetX = useCallback(
    (side: SwipeSide | null) =>
      side === "left" ? leftWidth : side === "right" ? -rightWidth : 0,
    [leftWidth, rightWidth],
  );

  const snapTo = useCallback(
    (side: SwipeSide | null, velocity = 0) => {
      setOpenValue(side ? { id: item.id, side } : null);
      settleX(getTargetX(side), velocity);
    },
    [getTargetX, item.id, setOpenValue, settleX],
  );

  const onDragStart = useCallback(() => {
    animationRef.current?.stop();
    if (openValue && openValue.id !== item.id) {
      setOpenValue(null);
    }
  }, [item.id, openValue, setOpenValue]);

  const onDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const velocity = info.velocity.x;
      const latest = x.get();
      const leftOpenThreshold = Math.max(
        revealThreshold,
        leftWidth * OPEN_DISTANCE_RATIO,
      );
      const rightOpenThreshold = Math.max(
        revealThreshold,
        rightWidth * OPEN_DISTANCE_RATIO,
      );

      if (openSide === "left") {
        if (
          latest < leftWidth * CLOSE_DISTANCE_RATIO ||
          velocity < -CLOSE_VELOCITY
        ) {
          snapTo(null, velocity);
          return;
        }
        snapTo("left", velocity);
        return;
      }

      if (openSide === "right") {
        if (
          Math.abs(latest) < rightWidth * CLOSE_DISTANCE_RATIO ||
          velocity > CLOSE_VELOCITY
        ) {
          snapTo(null, velocity);
          return;
        }
        snapTo("right", velocity);
        return;
      }

      if (
        isActionableSide(latest, leftWidth) &&
        (latest > leftOpenThreshold ||
          (velocity > OPEN_VELOCITY && latest > FLING_DISTANCE))
      ) {
        snapTo("left", velocity);
        return;
      }

      if (
        isActionableSide(latest, rightWidth) &&
        (latest < -rightOpenThreshold ||
          (velocity < -OPEN_VELOCITY && latest < -FLING_DISTANCE))
      ) {
        snapTo("right", velocity);
        return;
      }

      snapTo(null, velocity);
    },
    [leftWidth, openSide, revealThreshold, rightWidth, snapTo, x],
  );

  const handleAction = useCallback(
    (action: SwipeAction, side: SwipeSide) => {
      action.onClick?.(item);
      onAction?.({ item, action, side });
      if (closeOnAction) {
        snapTo(null);
      }
    },
    [closeOnAction, item, onAction, snapTo],
  );

  const defaultContent = (
    <div className="flex min-w-0 items-center gap-3">
      {item.leading ? (
        <div
          className={cn(
            "shrink-0 text-muted-foreground",
            classNames?.leading,
          )}
        >
          {item.leading}
        </div>
      ) : null}
      <div className={cn("min-w-0 flex-1", classNames?.content)}>
        {item.title ? (
          <div
            className={cn(
              "truncate text-base leading-6 text-foreground",
              classNames?.title,
            )}
          >
            {item.title}
          </div>
        ) : null}
        {item.description ? (
          <div
            className={cn(
              "mt-0.5 truncate text-sm text-muted-foreground",
              classNames?.description,
            )}
          >
            {item.description}
          </div>
        ) : null}
      </div>
      {item.meta ? (
        <div
          className={cn(
            "shrink-0 text-sm text-muted-foreground",
            classNames?.meta,
          )}
          dir="ltr"
        >
          {item.meta}
        </div>
      ) : null}
    </div>
  );

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-2xl bg-muted",
        item.disabled && "opacity-60",
        classNames?.item,
      )}
    >
      {/* Physical L/R rails — swipe edges stay screen-absolute, not mirrored by RTL */}
      <div
        aria-hidden={!openSide}
        inert={!openSide}
        className={cn(
          "absolute inset-0 z-0 flex overflow-hidden rounded-2xl",
          classNames?.rail,
        )}
      >
        <div className="flex h-full overflow-hidden rounded-l-2xl">
          {leftActions.map((action) => (
            <SwipeActionButton
              key={action.id}
              action={action}
              actionWidth={actionWidth}
              className={classNames?.action}
              focusable={openSide === "left"}
              onAction={handleAction}
              side="left"
            />
          ))}
        </div>
        <div className="ml-auto flex h-full overflow-hidden rounded-r-2xl">
          {rightActions.map((action) => (
            <SwipeActionButton
              key={action.id}
              action={action}
              actionWidth={actionWidth}
              className={classNames?.action}
              focusable={openSide === "right"}
              onAction={handleAction}
              side="right"
            />
          ))}
        </div>
      </div>

      <motion.div
        drag={item.disabled ? false : "x"}
        dragConstraints={{ left: -rightWidth, right: leftWidth }}
        dragElastic={0.04}
        dragMomentum={false}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        style={{ x }}
        className={cn(
          "relative z-10 min-h-18 cursor-grab touch-pan-y rounded-2xl border border-border bg-card px-3 py-2 active:cursor-grabbing",
          TOUCH_GESTURE_CONTENT_CLASS,
          classNames?.surface,
        )}
      >
        {renderItem ? renderItem(item) : (item.content ?? defaultContent)}
      </motion.div>
    </div>
  );
}

export function SwipeableList({
  items,
  value,
  defaultValue = null,
  onValueChange,
  onAction,
  actionWidth = 56,
  revealThreshold = 34,
  closeOnAction = true,
  className,
  classNames,
  renderItem,
}: SwipeableListProps) {
  const [openValue, setOpenValue] = useControllableSwipeValue({
    value,
    defaultValue,
    onValueChange,
  });

  return (
    <div
      className={cn("flex w-full flex-col gap-2", className, classNames?.root)}
    >
      {items.map((item) => (
        <SwipeableListRow
          key={item.id}
          item={item}
          actionWidth={actionWidth}
          revealThreshold={revealThreshold}
          openValue={openValue}
          setOpenValue={setOpenValue}
          closeOnAction={closeOnAction}
          onAction={onAction}
          classNames={classNames}
          renderItem={renderItem}
        />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Demo                                                                       */
/* -------------------------------------------------------------------------- */

function faNum(n: number) {
  return n.toLocaleString("fa-IR");
}

const leftActions: SwipeAction[] = [
  {
    id: "done",
    label: "انجام",
    icon: <HugeiconsIcon icon={Tick02Icon} size={20} />,
    tone: "success",
  },
  {
    id: "pin",
    label: "سنجاق",
    icon: <HugeiconsIcon icon={PinIcon} size={20} />,
    tone: "primary",
  },
];

const rightActions: SwipeAction[] = [
  {
    id: "later",
    label: "بعداً",
    icon: <HugeiconsIcon icon={Clock01Icon} size={20} />,
    tone: "warning",
  },
  {
    id: "trash",
    label: "حذف",
    icon: <HugeiconsIcon icon={Delete02Icon} size={20} />,
    tone: "danger",
  },
];

function LeadingIcon({
  icon,
}: {
  icon: Parameters<typeof HugeiconsIcon>[0]["icon"];
}) {
  return (
    <span className="grid size-6 place-items-center">
      <HugeiconsIcon icon={icon} size={24} />
    </span>
  );
}

const initialItems: SwipeableListItem[] = [
  {
    id: "brief",
    title: "خلاصهٔ انتشار",
    description: "متن اعلامیه را نهایی کن",
    meta: "۹:۴۱",
    leading: <LeadingIcon icon={File01Icon} />,
    leftActions,
    rightActions,
  },
  {
    id: "feedback",
    title: "بازخورد مشتری",
    description: "سه نظر منتظر پاسخ‌اند",
    meta: "۱۱:۰۸",
    leading: <LeadingIcon icon={Mail01Icon} />,
    leftActions,
    rightActions,
  },
  {
    id: "review",
    title: "بازبینی طراحی",
    description: "فاصله‌ها را قبل از تحویل چک کن",
    meta: "۱۳:۲۰",
    leading: <LeadingIcon icon={UserIcon} />,
    leftActions,
    rightActions,
  },
  {
    id: "incident",
    title: "اجرای علامت‌خورده",
    description: "صف تلاش مجدد یک کار ناموفق دارد",
    meta: "الان",
    leading: <LeadingIcon icon={Flag01Icon} />,
    leftActions,
    rightActions,
  },
];

/** پیش‌نمایش فارسی — زبان بصری filter-interaction. */
export default function SwipeableListExample() {
  const [items, setItems] = useState(initialItems);
  const [lastAction, setLastAction] = useState("آماده");

  return (
    <section
      dir="rtl"
      lang="fa"
      className="relative flex min-h-96 w-full items-center justify-center fill-muted-foreground/70 bg-transparent px-4 py-8 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <div className="w-full max-w-sm overflow-hidden border border-border bg-card px-1 py-1 text-foreground"
        style={{ borderRadius: 20 }}
      >
        <div className="mb-1 flex items-center justify-between gap-3 rounded-2xl px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-base leading-6 text-foreground">
              صف اولویت
            </p>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {lastAction}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setItems(initialItems);
              setLastAction("صف بازگردانی شد");
            }}
            className="inline-flex shrink-0 cursor-default items-center gap-1.5 rounded-2xl px-3 py-2 text-sm text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <HugeiconsIcon icon={RefreshIcon} size={16} />
            بازنشانی
          </button>
        </div>

        <div className="px-1 pb-1">
          <SwipeableList
            items={items}
            onAction={({ item, action }) => {
              const label =
                typeof action.label === "string" ? action.label : action.id;
              const title =
                typeof item.title === "string" ? item.title : item.id;
              setLastAction(`${label} · ${title}`);

              if (action.id === "trash") {
                setItems((current) =>
                  current.filter((entry) => entry.id !== item.id),
                );
              }
            }}
          />
        </div>

        <div className="flex items-center justify-between rounded-2xl px-3 py-2 text-sm text-muted-foreground">
          <span>{faNum(items.length)} باز</span>
          <span>امروز</span>
        </div>
      </div>
    </section>
  );
}
