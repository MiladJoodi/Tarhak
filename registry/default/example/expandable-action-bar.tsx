"use client";
// Adapted from beui.dev/components/blocks/expandable-action-bar

import {
  Archive,
  Bell,
  Copy,
  Download,
  Send,
  Settings,
} from "lucide-react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  type Transition,
  useReducedMotion,
} from "motion/react";
import {
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Inlined touch / gesture helpers (self-contained registry file)             */
/* -------------------------------------------------------------------------- */

const isHoveringPointer = (event: {
  pointerType: string;
  buttons: number;
}) => event.pointerType !== "touch" && event.buttons === 0;

type DismissBehavior = "pass-through" | "consume";

interface DismissOptions {
  behavior?: DismissBehavior;
  escape?: boolean;
  ignore?: (target: Element) => boolean;
}

const openScopes = new Set<(target: Element) => boolean>();

function claimedByAnotherScope(
  self: (target: Element) => boolean,
  target: Element,
) {
  for (const scope of openScopes) {
    if (scope !== self && scope(target)) return true;
  }
  return false;
}

function consumeActivation(source: Event) {
  const swallow = (event: globalThis.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    release();
  };
  const restart = (event: Event) => {
    if (event !== source) release();
  };
  const release = () => {
    window.removeEventListener("click", swallow, true);
    window.removeEventListener("pointerdown", restart, true);
    window.removeEventListener("pointercancel", restart, true);
    window.removeEventListener("keydown", release, true);
  };
  window.addEventListener("click", swallow, true);
  window.addEventListener("pointerdown", restart, true);
  window.addEventListener("pointercancel", restart, true);
  window.addEventListener("keydown", release, true);
}

function useDismiss(
  open: boolean,
  onDismiss: () => void,
  ref: RefObject<HTMLElement | SVGElement | null> | null,
  {
    behavior = "pass-through",
    escape: dismissOnEscape = true,
    ignore,
  }: DismissOptions = {},
) {
  useEffect(() => {
    if (!open) return;
    const inside = (target: Element) =>
      Boolean(ref?.current?.contains(target)) || Boolean(ignore?.(target));
    const onKey = (event: KeyboardEvent) => {
      if (dismissOnEscape && event.key === "Escape") onDismiss();
    };
    const onPointer = (event: globalThis.PointerEvent) => {
      const target = event.target as Element | null;
      if (!target || inside(target)) return;
      if (behavior === "consume" && !claimedByAnotherScope(inside, target)) {
        consumeActivation(event);
      }
      onDismiss();
    };
    openScopes.add(inside);
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer, true);
    return () => {
      openScopes.delete(inside);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer, true);
    };
  }, [open, onDismiss, ref, behavior, dismissOnEscape, ignore]);
}

interface BoundaryEvent {
  pointerId: number;
  pointerType: string;
  buttons: number;
}

interface HoverGesture {
  enter: (event: BoundaryEvent) => boolean;
  leave: (event: BoundaryEvent) => boolean;
}

function useHoverGesture(): HoverGesture {
  const contact = useRef(new Set<number>());

  return useMemo(
    () => ({
      enter: (event) => {
        if (isHoveringPointer(event)) {
          contact.current.delete(event.pointerId);
          return true;
        }
        contact.current.add(event.pointerId);
        return false;
      },
      leave: (event) => {
        const arrivedInContact = contact.current.delete(event.pointerId);
        return !arrivedInContact && event.pointerType !== "touch";
      },
    }),
    [],
  );
}

interface TapRecord<S> {
  pointerType: string;
  state: S;
}

interface TapGesture<S> {
  start: (event: { pointerType: string }, state: S) => void;
  take: () => TapRecord<S> | null;
  drop: () => void;
}

function useTapGesture<S>(): TapGesture<S> {
  const record = useRef<TapRecord<S> | null>(null);

  return useMemo(
    () => ({
      start: (event, state) => {
        record.current = { pointerType: event.pointerType, state };
      },
      take: () => {
        const spent = record.current;
        record.current = null;
        return spent;
      },
      drop: () => {
        record.current = null;
      },
    }),
    [],
  );
}

/* -------------------------------------------------------------------------- */
/* ExpandableActionBar                                                        */
/* -------------------------------------------------------------------------- */

export type ExpandableActionBarSize = "sm" | "md";

export type ExpandableActionBarItem = {
  id: string;
  label: ReactNode;
  icon: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  badge?: ReactNode;
  shortcut?: ReactNode;
};

export type ExpandableActionBarClassNames = {
  root?: string;
  track?: string;
  item?: string;
  activeItem?: string;
  icon?: string;
  label?: string;
  badge?: string;
  shortcut?: string;
};

export interface ExpandableActionBarProps {
  items: ExpandableActionBarItem[];
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  activeId?: string;
  onAction?: (item: ExpandableActionBarItem) => void;
  size?: ExpandableActionBarSize;
  /**
   * Expand when a hovering pointer rests on the bar. Default true.
   * On touch: first tap expands (no action), second tap acts.
   */
  expandOnHover?: boolean;
  expandOnFocus?: boolean;
  collapseDelay?: number;
  className?: string;
  classNames?: ExpandableActionBarClassNames;
  renderItem?: (
    item: ExpandableActionBarItem,
    state: { expanded: boolean; active: boolean },
  ) => ReactNode;
}

const ITEM_TRANSITION: Transition = {
  type: "spring",
  stiffness: 460,
  damping: 34,
  mass: 0.62,
};

const LABEL_TRANSITION: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 32,
  mass: 0.7,
};

const SIZE_CLASS: Record<ExpandableActionBarSize, string> = {
  sm: "min-h-9 gap-1 p-1 text-xs",
  md: "min-h-11 gap-1.5 p-1.5 text-sm",
};

const ITEM_SIZE_CLASS: Record<ExpandableActionBarSize, string> = {
  sm: "h-7 min-w-7 px-1.5",
  md: "h-8 min-w-8 px-2",
};

const ICON_SIZE_CLASS: Record<ExpandableActionBarSize, string> = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
};

function useControllableExpanded({
  expanded,
  defaultExpanded,
  onExpandedChange,
}: {
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}) {
  const [internalExpanded, setInternalExpanded] = useState(
    defaultExpanded ?? false,
  );
  const isControlled = expanded !== undefined;
  const value = expanded ?? internalExpanded;

  const setValue = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalExpanded(next);
      onExpandedChange?.(next);
    },
    [isControlled, onExpandedChange],
  );

  return [value, setValue] as const;
}

export function ExpandableActionBar({
  items,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  activeId,
  onAction,
  size = "md",
  expandOnHover = true,
  expandOnFocus = true,
  collapseDelay = 90,
  className,
  classNames,
  renderItem,
}: ExpandableActionBarProps) {
  const reduce = useReducedMotion();
  const layoutId = useId();
  const [isExpanded, setIsExpanded] = useControllableExpanded({
    expanded,
    defaultExpanded,
    onExpandedChange,
  });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tapExpanded, setTapExpanded] = useState(false);
  const collapseTimer = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const tap = useTapGesture<boolean>();
  const hover = useHoverGesture();

  const clearCollapseTimer = useCallback(() => {
    if (collapseTimer.current) window.clearTimeout(collapseTimer.current);
    collapseTimer.current = null;
  }, []);

  const open = useCallback(() => {
    clearCollapseTimer();
    setIsExpanded(true);
  }, [clearCollapseTimer, setIsExpanded]);

  const close = useCallback(() => {
    clearCollapseTimer();
    const timer = window.setTimeout(() => {
      setIsExpanded(false);
      setHoveredId(null);
      setTapExpanded(false);
    }, collapseDelay);
    collapseTimer.current = timer;
  }, [clearCollapseTimer, collapseDelay, setIsExpanded]);

  useEffect(() => clearCollapseTimer, [clearCollapseTimer]);

  const wasExpanded = useRef(isExpanded);
  useEffect(() => {
    if (wasExpanded.current && !isExpanded) setTapExpanded(false);
    wasExpanded.current = isExpanded;
  }, [isExpanded]);

  useDismiss(tapExpanded && isExpanded, close, trackRef, {
    behavior: "consume",
  });

  const onRootPointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (hover.enter(event) && expandOnHover) open();
  };

  const onRootPointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    if (!hover.leave(event)) return;
    setHoveredId(null);
    if (expandOnHover) close();
  };

  const onRootFocus = () => {
    if (expandOnFocus) open();
  };

  const onRootBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (
      !event.currentTarget.contains(event.relatedTarget as Node) &&
      expandOnFocus
    ) {
      close();
    }
  };

  const activeItemId = activeId ?? items.find((item) => item.active)?.id;
  const highlightId = hoveredId ?? activeItemId;

  return (
    <LayoutGroup id={layoutId}>
      <motion.div
        layout="size"
        onPointerEnter={onRootPointerEnter}
        onPointerLeave={onRootPointerLeave}
        onFocus={onRootFocus}
        onBlur={onRootBlur}
        transition={ITEM_TRANSITION}
        className={cn("inline-flex max-w-full", classNames?.root, className)}
      >
        <motion.div
          ref={trackRef}
          layout="size"
          className={cn(
            "relative inline-flex max-w-full items-center overflow-x-auto overflow-y-hidden rounded-full border border-border bg-card/90 shadow-2xl backdrop-blur-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            SIZE_CLASS[size],
            classNames?.track,
          )}
          transition={ITEM_TRANSITION}
        >
          {items.map((item) => {
            const isActive = item.active || activeId === item.id;
            const isHighlighted = highlightId === item.id;

            return (
              <motion.button
                key={item.id}
                layout="position"
                type="button"
                disabled={item.disabled}
                title={typeof item.label === "string" ? item.label : undefined}
                onPointerEnter={(event: PointerEvent<HTMLButtonElement>) => {
                  if (!hover.enter(event)) return;
                  clearCollapseTimer();
                  setHoveredId(item.id);
                }}
                onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
                  tap.start(event, isExpanded);
                }}
                onPointerCancel={tap.drop}
                onKeyDown={tap.drop}
                onClick={(event: MouseEvent<HTMLButtonElement>) => {
                  event.currentTarget.blur();
                  const gesture = tap.take();
                  const firstTap =
                    gesture !== null &&
                    gesture.pointerType !== "mouse" &&
                    !gesture.state &&
                    !tapExpanded;
                  if (firstTap && expandOnHover) {
                    setTapExpanded(true);
                    open();
                    setHoveredId(item.id);
                    return;
                  }
                  item.onClick?.();
                  onAction?.(item);
                }}
                whileTap={reduce || item.disabled ? undefined : { scale: 0.96 }}
                transition={ITEM_TRANSITION}
                className={cn(
                  "relative isolate inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-medium text-muted-foreground outline-none transition-[color,background-color] duration-150 ease-out",
                  "focus-visible:text-foreground disabled:pointer-events-none disabled:opacity-40",
                  isHighlighted && "text-foreground",
                  ITEM_SIZE_CLASS[size],
                  classNames?.item,
                  isActive && classNames?.activeItem,
                )}
              >
                {isHighlighted ? (
                  <motion.span
                    layoutId={`${layoutId}-highlight`}
                    className="absolute inset-0 -z-10 rounded-full bg-muted/80"
                    transition={ITEM_TRANSITION}
                  />
                ) : null}

                {renderItem ? (
                  renderItem(item, { expanded: isExpanded, active: isActive })
                ) : (
                  <>
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center justify-center",
                        ICON_SIZE_CLASS[size],
                        classNames?.icon,
                      )}
                    >
                      {item.icon}
                    </span>

                    <motion.span
                      aria-hidden={!isExpanded}
                      animate={
                        reduce
                          ? {
                              width: isExpanded ? "auto" : 0,
                              opacity: isExpanded ? 1 : 0,
                              marginInlineStart: isExpanded ? 8 : 0,
                              x: 0,
                              filter: "blur(0px)",
                            }
                          : {
                              width: isExpanded ? "auto" : 0,
                              opacity: isExpanded ? 1 : 0,
                              x: isExpanded ? 0 : 4,
                              marginInlineStart: isExpanded ? 8 : 0,
                              filter: isExpanded ? "blur(0px)" : "blur(3px)",
                            }
                      }
                      transition={reduce ? { duration: 0 } : LABEL_TRANSITION}
                      className={cn(
                        "inline-block overflow-hidden whitespace-nowrap",
                        classNames?.label,
                      )}
                    >
                      {item.label}
                    </motion.span>

                    {item.shortcut ? (
                      <motion.span
                        aria-hidden={!isExpanded}
                        animate={{
                          width: isExpanded ? "auto" : 0,
                          opacity: isExpanded ? 1 : 0,
                          marginInlineStart: isExpanded ? 4 : 0,
                        }}
                        transition={LABEL_TRANSITION}
                        className={cn(
                          "hidden overflow-hidden whitespace-nowrap text-[10px] text-muted-foreground sm:inline-block",
                          classNames?.shortcut,
                        )}
                      >
                        {item.shortcut}
                      </motion.span>
                    ) : null}

                    {item.badge ? (
                      <span
                        className={cn(
                          "ms-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none text-primary-foreground",
                          !isExpanded && "absolute end-0.5 top-0.5 ms-0",
                          classNames?.badge,
                        )}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </motion.div>
    </LayoutGroup>
  );
}

export function useExpandableActionBar(items: ExpandableActionBarItem[]) {
  const [expanded, setExpanded] = useState(false);
  const [activeId, setActiveId] = useState(items[0]?.id);

  const activeItem = useMemo(
    () => items.find((item) => item.id === activeId),
    [activeId, items],
  );

  return useMemo(
    () => ({ expanded, setExpanded, activeId, setActiveId, activeItem }),
    [activeId, activeItem, expanded],
  );
}

/* -------------------------------------------------------------------------- */
/* Demo                                                                       */
/* -------------------------------------------------------------------------- */

const ACTIONS: ExpandableActionBarItem[] = [
  {
    id: "send",
    label: "ارسال",
    icon: <Send className="h-4 w-4" />,
    shortcut: "S",
  },
  {
    id: "copy",
    label: "کپی",
    icon: <Copy className="h-4 w-4" />,
    shortcut: "C",
  },
  {
    id: "download",
    label: "خروجی",
    icon: <Download className="h-4 w-4" />,
    shortcut: "E",
  },
  {
    id: "archive",
    label: "بایگانی",
    icon: <Archive className="h-4 w-4" />,
  },
  {
    id: "alerts",
    label: "هشدارها",
    icon: <Bell className="h-4 w-4 origin-top" />,
    badge: "۳",
  },
  {
    id: "settings",
    label: "تنظیمات",
    icon: <Settings className="h-4 w-4" />,
  },
];

/** پیش‌نمایش فارسی — نوار اکشن جمع‌شونده با لیبل روی هاور/فوکوس. */
export default function ExpandableActionBarExample() {
  const [expanded, setExpanded] = useState(false);
  const [activeId, setActiveId] = useState("send");

  const items = useMemo(
    () =>
      ACTIONS.map((item) => ({
        ...item,
        active: item.id === activeId,
      })),
    [activeId],
  );

  return (
    <section
      dir="rtl"
      lang="fa"
      className="relative flex min-h-72 w-full flex-col items-center justify-center gap-6 bg-transparent px-4 py-10 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <div className="flex min-h-24 w-full items-center justify-center">
        <ExpandableActionBar
          items={items}
          expanded={expanded}
          onExpandedChange={setExpanded}
          activeId={activeId}
          onAction={(item) => setActiveId(item.id)}
          classNames={{
            item: "group",
          }}
        />
      </div>

      <motion.button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="relative flex h-9 w-30 items-center justify-center overflow-hidden rounded-full border border-border bg-card text-xs font-medium text-foreground transition-colors hover:bg-muted"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
      >
        <motion.div layout className="flex items-center gap-1.5">
          <motion.svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5 shrink-0"
          >
            <motion.path
              initial={false}
              animate={{
                d: expanded ? "M 10 20 L 10 14 L 4 14" : "M 9 21 L 3 21 L 3 15",
              }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            />
            <motion.path
              initial={false}
              animate={{
                d: expanded
                  ? "M 14 4 L 14 10 L 20 10"
                  : "M 15 3 L 21 3 L 21 9",
              }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            />
            <line x1="14" x2="21" y1="10" y2="3" />
            <line x1="3" x2="10" y1="21" y2="14" />
          </motion.svg>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={expanded ? "expanded" : "collapsed"}
              initial={{ opacity: 0, y: -25, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 25, filter: "blur(4px)" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            >
              {expanded ? "جمع کردن" : "باز کردن"}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </motion.button>
    </section>
  );
}
