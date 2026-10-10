"use client";
// Adapted from beui.dev/components/blocks/morphing-tabs

import { X } from "lucide-react";
import {
  AnimatePresence,
  animate as animateValue,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export type MorphingTabsItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
  disabled?: boolean;
};

export type MorphingTabsClassNames = {
  root?: string;
  rail?: string;
  tab?: string;
  activeTab?: string;
  icon?: string;
  label?: string;
  close?: string;
  content?: string;
};

export type MorphingTabsProps = {
  items: MorphingTabsItem[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (id: string | null) => void;
  /** Called once after a pointer drag or keyboard reorder completes. */
  onOrderChange?: (ids: string[]) => void;
  /** Enables the close affordance on every tab when provided. */
  onClose?: (id: string) => void;
  ariaLabel?: string;
  /** Mirror the rail from the inline end (default true for Persian). */
  rtl?: boolean;
  className?: string;
  classNames?: MorphingTabsClassNames;
};

type DragSession = {
  id: string;
  pointerId: number;
  originX: number;
  startLeft: number;
  startIndex: number;
  targetIndex: number;
  moved: boolean;
  finishing: boolean;
  startOrder: string[];
  slotLefts: number[];
};

type SpringTabProps = {
  id: string;
  targetLeft: number;
  dragging: boolean;
  dragLeft: MotionValue<number>;
  surfaceLeft: MotionValue<number>;
  reduce: boolean;
  active: boolean;
  anyDragging: boolean;
  surfaceHost: HTMLDivElement | null;
  surfaceWidth: number;
  tabWidth: number;
  surfaceClassName?: string;
  zIndex: number;
  className: string;
  children: ReactNode;
  registerPosition: (id: string, position: MotionValue<number> | null) => void;
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onLostPointerCapture: (event: ReactPointerEvent<HTMLDivElement>) => void;
};

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const SPRING_PRESS = {
  type: "spring" as const,
  stiffness: 500,
  damping: 30,
  mass: 0.6,
};
const SPRING_GLIDE = {
  stiffness: 700,
  damping: 50,
  mass: 0.5,
} as const;

const TOUCH_GESTURE_CLASS = "select-none [-webkit-touch-callout:none]";

function capturePointer(element: Element, pointerId: number) {
  try {
    element.setPointerCapture(pointerId);
  } catch {
    // Pointer already gone — implicit capture still applies on touch.
  }
}

const DRAG_THRESHOLD = 5;
const MAX_TAB_WIDTH = 176;
const MIN_TAB_WIDTH = 96;
const TAB_HEIGHT = 56;
const TAB_TOP = 24;
const TAB_RADIUS = 24;
const RAIL_HEIGHT = 80;
const SURFACE_INSET = 16;
const LIQUID_JOIN = 24;
const PANEL_RADIUS = 28;

function sameOrder(a: string[], b: string[]) {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

function safeId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}

function moveItem(order: string[], from: number, to: number) {
  if (from === to) return order.slice();
  const next = order.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function slotLeftAt(
  index: number,
  count: number,
  surfaceWidth: number,
  tabWidth: number,
  slotGap: number,
  rtl: boolean,
) {
  if (rtl) {
    return (
      surfaceWidth -
      SURFACE_INSET -
      tabWidth -
      index * (tabWidth + slotGap)
    );
  }
  return SURFACE_INSET + index * (tabWidth + slotGap);
}

function liquidTabPath(
  tabLeft: number,
  surfaceWidth: number,
  tabWidth: number,
) {
  const panelLeft = SURFACE_INSET;
  const panelRight = surfaceWidth - SURFACE_INSET;
  const left = Math.max(
    panelLeft,
    Math.min(panelRight - tabWidth, tabLeft),
  );
  const right = left + tabWidth;
  const top = RAIL_HEIGHT - TAB_HEIGHT;
  const bottom = RAIL_HEIGHT;
  const leftJoin = Math.max(panelLeft, left - LIQUID_JOIN);
  const rightJoin = Math.min(panelRight, right + LIQUID_JOIN);
  const leftDepth = Math.min(LIQUID_JOIN, left - leftJoin);
  const rightDepth = Math.min(LIQUID_JOIN, rightJoin - right);
  const leftControl = leftDepth * 0.55;
  const rightControl = rightDepth * 0.55;
  const leftPanelRadius = Math.min(PANEL_RADIUS, leftJoin - panelLeft);
  const rightPanelRadius = Math.min(PANEL_RADIUS, panelRight - rightJoin);

  return [
    `M${panelLeft} ${bottom + PANEL_RADIUS}`,
    `V${bottom + leftPanelRadius}`,
    `Q${panelLeft} ${bottom} ${panelLeft + leftPanelRadius} ${bottom}`,
    `H${leftJoin}`,
    `C${leftJoin + leftControl} ${bottom} ${left} ${bottom - leftDepth + leftControl} ${left} ${bottom - leftDepth}`,
    `V${top + TAB_RADIUS}`,
    `Q${left} ${top} ${left + TAB_RADIUS} ${top}`,
    `H${right - TAB_RADIUS}`,
    `Q${right} ${top} ${right} ${top + TAB_RADIUS}`,
    `V${bottom - rightDepth}`,
    `C${right} ${bottom - rightDepth + rightControl} ${rightJoin - rightControl} ${bottom} ${rightJoin} ${bottom}`,
    `H${panelRight - rightPanelRadius}`,
    `Q${panelRight} ${bottom} ${panelRight} ${bottom + rightPanelRadius}`,
    `V${bottom + PANEL_RADIUS}`,
    "Z",
  ].join(" ");
}

function SpringTab({
  id,
  targetLeft,
  dragging,
  dragLeft,
  surfaceLeft,
  reduce,
  active,
  anyDragging,
  surfaceHost,
  surfaceWidth,
  tabWidth,
  surfaceClassName,
  zIndex,
  className,
  children,
  registerPosition,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onLostPointerCapture,
}: SpringTabProps) {
  const target = useMotionValue(targetLeft);
  const position = useSpring(target, SPRING_GLIDE);
  const settledTransform = useTransform(
    reduce ? target : position,
    (left) => `translate3d(${left}px, 0, 0)`,
  );
  const draggedTransform = useTransform(
    dragLeft,
    (left) => `translate3d(${left}px, 0, 0)`,
  );

  useLayoutEffect(() => {
    target.set(targetLeft);
    if (reduce) position.jump(targetLeft);
  }, [position, reduce, target, targetLeft]);

  useLayoutEffect(() => {
    registerPosition(id, position);
    return () => registerPosition(id, null);
  }, [id, position, registerPosition]);

  const liquidDriver = anyDragging
    ? dragging
      ? dragLeft
      : position
    : surfaceLeft;

  return (
    <>
      {active && surfaceHost && surfaceWidth > SURFACE_INSET * 2
        ? createPortal(
            <svg
              aria-hidden="true"
              focusable="false"
              viewBox={`0 0 ${surfaceWidth} ${RAIL_HEIGHT + PANEL_RADIUS}`}
              preserveAspectRatio="none"
              className={cn(
                "pointer-events-none absolute inset-x-0 top-0 h-[108px] w-full text-[var(--mt-surface)]",
                dragging ? "z-20" : "z-0",
                surfaceClassName,
              )}
            >
              <LiquidSurfacePath
                key={
                  anyDragging
                    ? dragging
                      ? "dragged"
                      : "displaced"
                    : "idle"
                }
                left={liquidDriver}
                surfaceWidth={surfaceWidth}
                tabWidth={tabWidth}
              />
            </svg>,
            surfaceHost,
          )
        : null}
      <motion.div
        style={{
          zIndex,
          transform: dragging ? draggedTransform : settledTransform,
        }}
        className={className}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onLostPointerCapture={onLostPointerCapture}
      >
        {children}
      </motion.div>
    </>
  );
}

function LiquidSurfacePath({
  left,
  surfaceWidth,
  tabWidth,
}: {
  left: MotionValue<number>;
  surfaceWidth: number;
  tabWidth: number;
}) {
  const path = useTransform(left, (value) =>
    liquidTabPath(value, surfaceWidth, tabWidth),
  );
  return <motion.path d={path} fill="currentColor" />;
}

/** Reorderable tabs whose selected item grows into a content surface. */
export function MorphingTabs({
  items,
  value,
  defaultValue,
  onValueChange,
  onOrderChange,
  onClose,
  ariaLabel = "تب‌ها",
  rtl = true,
  className,
  classNames,
}: MorphingTabsProps) {
  const reduce = Boolean(useReducedMotion());
  const uid = useId();
  const itemIds = useMemo(() => items.map((item) => item.id), [items]);
  const itemMap = useMemo(
    () => new Map(items.map((item) => [item.id, item])),
    [items],
  );
  const [order, setOrder] = useState(itemIds);
  const orderRef = useRef(order);
  orderRef.current = order;

  const [internalValue, setInternalValue] = useState<string | null>(
    defaultValue ?? itemIds[0] ?? null,
  );
  const controlled = value !== undefined;
  const currentValue = controlled ? (value ?? null) : internalValue;

  const rootRef = useRef<HTMLDivElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const tabButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const tabPositionRefs = useRef<Record<string, MotionValue<number> | null>>(
    {},
  );
  const dragRef = useRef<DragSession | null>(null);
  const dragAnimationRef = useRef<ReturnType<typeof animateValue> | null>(null);
  const surfaceAnimationRef = useRef<ReturnType<typeof animateValue> | null>(
    null,
  );
  const [surfaceWidth, setSurfaceWidth] = useState(0);
  const [tabGap, setTabGap] = useState(12);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragTargetIndex, setDragTargetIndex] = useState(-1);
  const dragLeft = useMotionValue(SURFACE_INSET);
  const surfaceLeft = useMotionValue(SURFACE_INSET);

  useEffect(() => {
    setOrder((current) => {
      const available = new Set(itemIds);
      const retained = current.filter((id) => available.has(id));
      const retainedSet = new Set(retained);
      const added = itemIds.filter((id) => !retainedSet.has(id));
      const next = [...retained, ...added];
      return sameOrder(current, next) ? current : next;
    });
  }, [itemIds]);

  const orderedItems = useMemo(
    () =>
      order.flatMap((id) => {
        const item = itemMap.get(id);
        return item ? [item] : [];
      }),
    [itemMap, order],
  );

  const firstEnabledItem =
    orderedItems.find((item) => !item.disabled) ?? orderedItems[0] ?? null;
  const activeItem =
    currentValue && itemMap.has(currentValue)
      ? (itemMap.get(currentValue) ?? null)
      : firstEnabledItem;
  const activeId = activeItem?.id ?? null;

  const { tabWidth, slotGap } = useMemo(() => {
    const count = order.length;
    if (!surfaceWidth || count === 0) {
      return { tabWidth: MAX_TAB_WIDTH, slotGap: tabGap };
    }
    const inner = surfaceWidth - SURFACE_INSET * 2;
    const widthAt = (gap: number) =>
      Math.floor((inner - gap * (count - 1)) / count);

    if (widthAt(tabGap) >= MIN_TAB_WIDTH) {
      return {
        tabWidth: Math.min(MAX_TAB_WIDTH, widthAt(tabGap)),
        slotGap: tabGap,
      };
    }
    if (count > 1 && widthAt(0) >= MIN_TAB_WIDTH) {
      const gap = Math.floor((inner - MIN_TAB_WIDTH * count) / (count - 1));
      return { tabWidth: MIN_TAB_WIDTH, slotGap: Math.max(0, gap) };
    }
    return { tabWidth: Math.max(0, widthAt(0)), slotGap: 0 };
  }, [order.length, surfaceWidth, tabGap]);

  const slotLefts = useMemo(
    () =>
      order.map((_, index) =>
        slotLeftAt(
          index,
          order.length,
          surfaceWidth,
          tabWidth,
          slotGap,
          rtl,
        ),
      ),
    [order, rtl, slotGap, surfaceWidth, tabWidth],
  );

  const dragStartIndex = draggingId ? order.indexOf(draggingId) : -1;

  const visualIndexFor = useCallback(
    (index: number) => {
      if (dragStartIndex < 0 || dragTargetIndex < 0) return index;
      if (index === dragStartIndex) return dragTargetIndex;

      if (
        dragTargetIndex > dragStartIndex &&
        index > dragStartIndex &&
        index <= dragTargetIndex
      ) {
        return index - 1;
      }
      if (
        dragTargetIndex < dragStartIndex &&
        index >= dragTargetIndex &&
        index < dragStartIndex
      ) {
        return index + 1;
      }
      return index;
    },
    [dragStartIndex, dragTargetIndex],
  );

  useLayoutEffect(() => {
    const root = rootRef.current;
    const rail = railRef.current;
    if (!root || !rail) return;

    const measure = () => {
      setSurfaceWidth(root.clientWidth);
      const nextGap = Number.parseFloat(getComputedStyle(rail).columnGap);
      if (Number.isFinite(nextGap)) setTabGap(nextGap);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const setActive = useCallback(
    (id: string | null) => {
      if (id && itemMap.get(id)?.disabled) return;
      if (!controlled) setInternalValue(id);
      onValueChange?.(id);
    },
    [controlled, itemMap, onValueChange],
  );

  useEffect(() => {
    if (currentValue && itemMap.has(currentValue)) return;
    if (firstEnabledItem && firstEnabledItem.id !== currentValue) {
      setActive(firstEnabledItem.id);
    }
  }, [currentValue, firstEnabledItem, itemMap, setActive]);

  const activeOrderIndex = activeId ? order.indexOf(activeId) : -1;
  const activeVisualIndex =
    activeOrderIndex < 0 ? -1 : visualIndexFor(activeOrderIndex);

  useLayoutEffect(() => {
    if (
      !activeId ||
      activeVisualIndex < 0 ||
      activeId === draggingId ||
      slotLefts[activeVisualIndex] === undefined
    ) {
      return;
    }

    surfaceAnimationRef.current?.stop();

    if (draggingId) return;

    surfaceAnimationRef.current = animateValue(
      surfaceLeft,
      slotLefts[activeVisualIndex],
      reduce ? { duration: 0 } : SPRING_GLIDE,
    );
  }, [
    activeId,
    activeVisualIndex,
    draggingId,
    reduce,
    slotLefts,
    surfaceLeft,
  ]);

  const commitOrder = useCallback(
    (next: string[], notify: boolean) => {
      orderRef.current = next;
      setOrder((current) => (sameOrder(current, next) ? current : next));
      if (notify) onOrderChange?.(next);
    },
    [onOrderChange],
  );

  const registerPosition = useCallback(
    (id: string, position: MotionValue<number> | null) => {
      tabPositionRefs.current[id] = position;
    },
    [],
  );

  const startDrag = useCallback(
    (id: string, event: ReactPointerEvent<HTMLDivElement>) => {
      if (
        event.button !== 0 ||
        itemMap.get(id)?.disabled ||
        dragRef.current
      ) {
        return;
      }

      const startIndex = orderRef.current.indexOf(id);
      if (startIndex < 0) return;
      const count = orderRef.current.length;
      const capturedSlots = orderRef.current.map((_, index) =>
        slotLeftAt(index, count, surfaceWidth, tabWidth, slotGap, rtl),
      );
      const startLeft = capturedSlots[startIndex];

      dragAnimationRef.current?.stop();
      dragAnimationRef.current = null;
      dragLeft.set(startLeft);
      dragRef.current = {
        id,
        pointerId: event.pointerId,
        originX: event.clientX,
        startLeft,
        startIndex,
        targetIndex: startIndex,
        moved: false,
        finishing: false,
        startOrder: orderRef.current.slice(),
        slotLefts: capturedSlots,
      };
    },
    [dragLeft, itemMap, rtl, slotGap, surfaceWidth, tabWidth],
  );

  const moveDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.finishing || drag.pointerId !== event.pointerId) return;

      const delta = event.clientX - drag.originX;
      if (!drag.moved && Math.abs(delta) < DRAG_THRESHOLD) return;
      event.preventDefault();

      if (!drag.moved) {
        drag.moved = true;
        capturePointer(event.currentTarget, event.pointerId);
        if (drag.id === activeId) {
          surfaceAnimationRef.current?.stop();
          surfaceLeft.set(drag.startLeft);
        }
        setDraggingId(drag.id);
        setDragTargetIndex(drag.startIndex);
      }

      const sortedSlots = [...drag.slotLefts].sort((a, b) => a - b);
      const minLeft = sortedSlots[0]!;
      const maxLeft = sortedSlots[sortedSlots.length - 1]!;
      const visualLeft = Math.max(
        minLeft,
        Math.min(maxLeft, drag.startLeft + delta),
      );
      let targetIndex = drag.startIndex;

      // Match index by nearest slot, so RTL mirrored slots still reorder correctly.
      let bestDistance = Number.POSITIVE_INFINITY;
      drag.slotLefts.forEach((slot, index) => {
        const distance = Math.abs(visualLeft - slot);
        if (distance < bestDistance) {
          bestDistance = distance;
          targetIndex = index;
        }
      });

      dragLeft.set(visualLeft);
      if (targetIndex !== drag.targetIndex) {
        drag.targetIndex = targetIndex;
        setDragTargetIndex(targetIndex);
      }
    },
    [activeId, dragLeft, surfaceLeft],
  );

  const finishDrag = useCallback(
    (pointerId: number) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== pointerId || drag.finishing) return;

      if (!drag.moved) {
        dragRef.current = null;
        return;
      }

      drag.finishing = true;
      const targetLeft = drag.slotLefts[drag.targetIndex]!;
      const controls = animateValue(
        dragLeft,
        targetLeft,
        reduce ? { duration: 0 } : SPRING_GLIDE,
      );
      dragAnimationRef.current = controls;

      controls.then(async () => {
        if (dragAnimationRef.current !== controls) return;
        const next = moveItem(
          drag.startOrder,
          drag.startIndex,
          drag.targetIndex,
        );

        if (!reduce) {
          await new Promise<void>((resolve) => {
            const startedAt = performance.now();
            const check = () => {
              const settled = next.every((id, index) => {
                if (id === drag.id) return true;
                const position = tabPositionRefs.current[id];
                if (!position) return true;
                return (
                  Math.abs(position.get() - drag.slotLefts[index]!) < 0.5 &&
                  Math.abs(position.getVelocity()) < 10
                );
              });

              if (settled || performance.now() - startedAt > 500) {
                resolve();
                return;
              }
              requestAnimationFrame(check);
            };
            check();
          });
        }

        if (dragAnimationRef.current !== controls) return;
        if (drag.id === activeId) {
          surfaceLeft.set(targetLeft);
        } else if (activeId) {
          const activePosition = tabPositionRefs.current[activeId];
          if (activePosition) surfaceLeft.set(activePosition.get());
        }
        tabPositionRefs.current[drag.id]?.jump(targetLeft);
        dragAnimationRef.current = null;
        dragRef.current = null;
        commitOrder(next, !sameOrder(drag.startOrder, next));
        setDraggingId(null);
        setDragTargetIndex(-1);
      });
    },
    [activeId, commitOrder, dragLeft, reduce, surfaceLeft],
  );

  useEffect(() => {
    const finishFromWindow = (event: PointerEvent) => {
      finishDrag(event.pointerId);
    };
    window.addEventListener("pointerup", finishFromWindow, true);
    window.addEventListener("pointercancel", finishFromWindow, true);
    return () => {
      window.removeEventListener("pointerup", finishFromWindow, true);
      window.removeEventListener("pointercancel", finishFromWindow, true);
    };
  }, [finishDrag]);

  const moveBy = useCallback(
    (id: string, direction: -1 | 1) => {
      const current = orderRef.current;
      const index = current.indexOf(id);
      const nextIndex = index + direction;
      if (
        index < 0 ||
        nextIndex < 0 ||
        nextIndex >= current.length ||
        itemMap.get(id)?.disabled
      ) {
        return;
      }
      commitOrder(moveItem(current, index, nextIndex), true);
    },
    [commitOrder, itemMap],
  );

  const handleTabKeyDown = useCallback(
    (id: string, event: ReactKeyboardEvent<HTMLButtonElement>) => {
      const index = orderRef.current.indexOf(id);
      if (index < 0) return;

      const forwardKey = rtl ? "ArrowLeft" : "ArrowRight";
      const backwardKey = rtl ? "ArrowRight" : "ArrowLeft";

      if (
        event.altKey &&
        (event.key === "ArrowLeft" || event.key === "ArrowRight")
      ) {
        event.preventDefault();
        moveBy(id, event.key === forwardKey ? 1 : -1);
        return;
      }
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

      event.preventDefault();
      const direction = event.key === forwardKey ? 1 : -1;
      const nextIndex =
        (index + direction + orderRef.current.length) %
        orderRef.current.length;
      const nextId = orderRef.current[nextIndex]!;
      setActive(nextId);
      requestAnimationFrame(() => tabButtonRefs.current[nextId]?.focus());
    },
    [moveBy, rtl, setActive],
  );

  if (!orderedItems.length) return null;

  return (
    <div
      ref={rootRef}
      dir={rtl ? "rtl" : "ltr"}
      data-slot="morphing-tabs"
      className={cn(
        "relative isolate min-w-0 overflow-hidden rounded-[2rem]",
        // Theme tokens — follow OpenPreview `.light` / `.dark` (and html.dark).
        "[--mt-chrome:#e8e8ea] [--mt-ink:#18181b] [--mt-muted:#52525b] [--mt-surface:#fafaf8] [--mt-hover:rgba(0,0,0,0.06)] [--mt-idle-bg:#d4d4d8]",
        "dark:[--mt-chrome:#292929] dark:[--mt-ink:#fafafa] dark:[--mt-muted:rgba(255,255,255,0.7)] dark:[--mt-surface:#fafaf8] dark:[--mt-hover:rgba(255,255,255,0.06)] dark:[--mt-idle-bg:#3a3a3a]",
        "[.light_&]:![--mt-chrome:#e8e8ea] [.light_&]:![--mt-ink:#18181b] [.light_&]:![--mt-muted:#52525b] [.light_&]:![--mt-surface:#fafaf8] [.light_&]:![--mt-hover:rgba(0,0,0,0.06)] [.light_&]:![--mt-idle-bg:#d4d4d8]",
        "[.dark_&]:![--mt-chrome:#292929] [.dark_&]:![--mt-ink:#fafafa] [.dark_&]:![--mt-muted:rgba(255,255,255,0.7)] [.dark_&]:![--mt-surface:#fafaf8] [.dark_&]:![--mt-hover:rgba(255,255,255,0.06)] [.dark_&]:![--mt-idle-bg:#3a3a3a]",
        "bg-[var(--mt-chrome)] text-[var(--mt-ink)]",
        classNames?.root,
        className,
      )}
    >
      <div className="relative h-20">
        <div
          ref={railRef}
          role="tablist"
          aria-label={ariaLabel}
          aria-orientation="horizontal"
          className={cn(
            "relative z-30 flex h-full gap-3 md:gap-4",
            classNames?.rail,
          )}
        >
          {orderedItems.map((item, index) => {
            const isActive = item.id === activeId;
            const isDragging = item.id === draggingId;
            const visualIndex = visualIndexFor(index);
            const targetLeft = slotLefts[visualIndex] ?? SURFACE_INSET;
            const tabId = `${uid}-tab-${safeId(item.id)}`;

            return (
              <SpringTab
                key={item.id}
                id={item.id}
                targetLeft={targetLeft}
                dragging={isDragging}
                dragLeft={dragLeft}
                surfaceLeft={surfaceLeft}
                reduce={reduce}
                active={isActive}
                anyDragging={Boolean(draggingId)}
                surfaceHost={rootRef.current}
                surfaceWidth={surfaceWidth}
                tabWidth={tabWidth}
                surfaceClassName={classNames?.activeTab}
                zIndex={isDragging ? 30 : isActive ? 20 : 1}
                className={cn(
                  // Physical `left` — slot math and liquid path use CSS left pixels.
                  "group absolute left-0 top-0 flex touch-pan-y items-stretch",
                  TOUCH_GESTURE_CLASS,
                  item.disabled && "cursor-not-allowed",
                  isDragging ? "cursor-grabbing" : "cursor-grab",
                )}
                registerPosition={registerPosition}
                onPointerDown={(event) => startDrag(item.id, event)}
                onPointerMove={moveDrag}
                onPointerUp={(event) => finishDrag(event.pointerId)}
                onPointerCancel={(event) => finishDrag(event.pointerId)}
                onLostPointerCapture={(event) => {
                  if (event.target !== event.currentTarget) return;
                  finishDrag(event.pointerId);
                }}
              >
                <div
                  style={{
                    width: tabWidth,
                    height: TAB_HEIGHT,
                    marginTop: TAB_TOP,
                  }}
                  className="relative flex items-stretch"
                >
                  {!isActive ? (
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-x-0 bottom-2 top-0 rounded-[1.25rem] transition-colors duration-200",
                        isDragging
                          ? "bg-[var(--mt-idle-bg)]"
                          : "bg-transparent group-hover:bg-[var(--mt-hover)]",
                      )}
                    />
                  ) : null}

                  <button
                    ref={(node) => {
                      tabButtonRefs.current[item.id] = node;
                    }}
                    id={tabId}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`${uid}-panel`}
                    aria-disabled={item.disabled || undefined}
                    tabIndex={isActive ? 0 : -1}
                    disabled={item.disabled}
                    onClick={() => {
                      const drag = dragRef.current;
                      if (drag?.id === item.id && drag.moved) return;
                      setActive(item.id);
                    }}
                    onKeyDown={(event) => handleTabKeyDown(item.id, event)}
                    className={cn(
                      "group relative z-10 flex h-full w-full min-w-0 items-center gap-2 overflow-hidden rounded-t-[1.5rem] px-3 text-start outline-none transition-colors",
                      isActive
                        ? "text-[#181818]"
                        : "pb-2 text-[var(--mt-muted)] hover:text-[var(--mt-ink)]",
                      classNames?.tab,
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "pointer-events-none absolute inset-x-1 top-1 opacity-0 transition-opacity group-focus-visible:opacity-100",
                        isActive
                          ? "bottom-0 rounded-t-[1.25rem] border-x-2 border-t-2 border-black/20"
                          : "bottom-2 rounded-[1rem] border-2 border-current/40",
                      )}
                    />
                    {item.icon ? (
                      <span
                        aria-hidden
                        className={cn(
                          "grid size-8 shrink-0 place-items-center",
                          classNames?.icon,
                        )}
                      >
                        {item.icon}
                      </span>
                    ) : null}
                    <span
                      className={cn(
                        "min-w-0 truncate whitespace-nowrap text-base font-medium leading-none",
                        classNames?.label,
                      )}
                    >
                      {item.label}
                    </span>
                  </button>

                  {onClose ? (
                    <button
                      type="button"
                      aria-label={`بستن ${item.label}`}
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={(event) => {
                        event.stopPropagation();
                        onClose(item.id);
                      }}
                      className={cn(
                        "absolute end-2 top-1/2 z-20 grid size-6 -translate-y-1/2 place-items-center rounded-full text-[#9aa0a8] transition-colors hover:bg-black/[0.06] hover:text-[#4b5563] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current",
                        !isActive &&
                          "top-[calc(50%-4px)] text-[var(--mt-muted)] hover:bg-[var(--mt-hover)] hover:text-[var(--mt-ink)]",
                        classNames?.close,
                      )}
                    >
                      <X aria-hidden className="size-3.5 stroke-[1.5]" />
                    </button>
                  ) : null}
                </div>
              </SpringTab>
            );
          })}
        </div>
      </div>

      <div
        id={`${uid}-panel`}
        role="tabpanel"
        aria-labelledby={`${uid}-tab-${safeId(activeId ?? "empty")}`}
        className={cn(
          "relative z-20 mx-4 min-h-64 overflow-hidden rounded-[1.75rem] bg-[var(--mt-surface)] text-[#181818]",
          classNames?.content,
        )}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {activeItem ? (
            <motion.div
              key={activeItem.id}
              initial={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, y: 8, filter: "blur(6px)" }
              }
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={
                reduce
                  ? {
                      opacity: 0,
                      transition: { duration: 0.08, ease: EASE_OUT },
                    }
                  : {
                      opacity: 0,
                      y: -5,
                      filter: "blur(5px)",
                      transition: { duration: 0.12, ease: EASE_OUT },
                    }
              }
              transition={
                reduce
                  ? { duration: 0.12, ease: EASE_OUT }
                  : SPRING_PRESS
              }
              className="min-h-64"
            >
              {activeItem.content}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

const ROOM_CONTENT: Record<
  string,
  { eyebrow: string; title: string; detail: string; accent: string }
> = {
  "room-2": {
    eyebrow: "تمرکز آرام",
    title: "اتاق ۲",
    detail: "فضایی کوچک برای کاری که کمی هوای بیشتر لازم دارد.",
    accent: "#db5b2f",
  },
  general: {
    eyebrow: "فضای مشترک",
    title: "عمومی",
    detail: "اتاق مشترک برای یادداشت‌ها، لینک‌ها و ایده‌هایی که هنوز شکل نگرفته‌اند.",
    accent: "#1bb273",
  },
  archive: {
    eyebrow: "نزدیک نگه داشته",
    title: "آرشیو",
    detail: "اتاق‌های قبلی در دسترس می‌مانند بدون اینکه با گفتگوهای جاری رقابت کنند.",
    accent: "#7a6de2",
  },
};

function RoomPanel({ id }: { id: string }) {
  const room = ROOM_CONTENT[id]!;

  return (
    <div className="relative min-h-64 overflow-hidden bg-[radial-gradient(circle_at_1px_1px,#dfe2e3_1px,transparent_1.5px)] bg-[size:4.8rem_4.8rem] px-7 py-8 text-start md:px-12 md:py-10">
      <div className="relative max-w-xl">
        <p className="text-[0.68rem] font-semibold text-black/40">
          {room.eyebrow}
        </p>
        <h3 className="mt-3 text-3xl font-light text-[#151515] md:text-5xl">
          {room.title}
        </h3>
        <p className="mt-4 max-w-md text-sm leading-6 text-black/55 md:text-base">
          {room.detail}
        </p>
        <div className="mt-8 flex items-center gap-3 text-xs font-medium text-black/50">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: room.accent }}
          />
          هر اتاق را بکش تا جابه‌جا شود
        </div>
      </div>
    </div>
  );
}

export default function MorphingTabsDemo() {
  const initialItems = useMemo<MorphingTabsItem[]>(
    () =>
      Object.keys(ROOM_CONTENT).map((id) => ({
        id,
        label: ROOM_CONTENT[id]!.title,
        content: <RoomPanel id={id} />,
      })),
    [],
  );
  const [items, setItems] = useState(initialItems);
  const [value, setValue] = useState<string | null>("room-2");

  return (
    <div className="flex w-full min-w-0 items-center justify-center p-1 md:p-2">
      <MorphingTabs
        items={items}
        value={value}
        onValueChange={setValue}
        onOrderChange={(ids) => {
          setItems((current) => {
            const byId = new Map(current.map((item) => [item.id, item]));
            return ids.flatMap((id) => {
              const item = byId.get(id);
              return item ? [item] : [];
            });
          });
        }}
        onClose={(id) => {
          setItems((current) => {
            const next = current.filter((item) => item.id !== id);
            if (id === value) setValue(next[0]?.id ?? null);
            return next;
          });
        }}
        ariaLabel="اتاق‌ها"
        className="w-full max-w-5xl"
      />
    </div>
  );
}
