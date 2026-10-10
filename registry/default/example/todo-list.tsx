"use client";

import {
  ArrowDown01Icon,
  RefreshIcon,
  TaskDaily01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

/** Motion tokens — inlined so the registry file stays self-contained. */
const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const SPRING_SWAP = {
  type: "spring" as const,
  stiffness: 460,
  damping: 30,
  mass: 0.55,
};
const SPRING_LAYOUT = {
  type: "spring" as const,
  stiffness: 360,
  damping: 32,
  mass: 0.6,
};

function faNum(n: number) {
  return n.toLocaleString("fa-IR");
}

export type TodoItemStatus =
  | "pending"
  | "in-progress"
  | "completed"
  | "cancelled";

export interface TodoItem {
  id: string;
  title: ReactNode;
  status?: TodoItemStatus;
  progress?: number;
  detail?: ReactNode;
}

export interface TodoListProps {
  items: TodoItem[];
  title?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  collapseOnComplete?: boolean;
  maxHeight?: number;
  className?: string;
}

function statusLabel(status: TodoItemStatus) {
  if (status === "in-progress") return "در حال انجام";
  if (status === "completed") return "انجام‌شده";
  if (status === "cancelled") return "لغوشده";
  return "در انتظار";
}

/** Rolling digit swap for the completion counter. */
function RollText({ value, children }: { value: string; children: ReactNode }) {
  const reduce = useReducedMotion() ?? false;

  return (
    <span
      className="relative -my-[0.08em] inline-block max-w-full whitespace-nowrap py-[0.08em] align-bottom"
      style={{ clipPath: "inset(0 -999px)" }}
    >
      <span aria-hidden className="invisible inline-block whitespace-nowrap">
        {children}
      </span>
      <AnimatePresence initial={false}>
        <motion.span
          key={value}
          initial={reduce ? false : { opacity: 0, y: "90%", filter: "blur(3px)" }}
          animate={{ opacity: 1, y: "0%", filter: "blur(0px)" }}
          exit={
            reduce
              ? undefined
              : {
                  opacity: 0,
                  y: "-90%",
                  filter: "blur(3px)",
                  transition: { duration: 0.14, ease: EASE_OUT },
                }
          }
          transition={reduce ? { duration: 0 } : SPRING_SWAP}
          className="absolute start-0 top-[0.08em] inline-block max-w-full truncate will-change-[opacity,filter,transform]"
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function AgentDisclosure({
  open,
  className,
  children,
  id,
  role,
  "aria-labelledby": ariaLabelledBy,
}: {
  open: boolean;
  className?: string;
  children?: ReactNode;
  id?: string;
  role?: string;
  "aria-labelledby"?: string;
}) {
  const reduce = useReducedMotion() ?? false;

  return (
    <motion.div
      id={id}
      role={role}
      aria-labelledby={ariaLabelledBy}
      aria-hidden={!open}
      initial={false}
      animate={
        reduce
          ? { opacity: open ? 1 : 0 }
          : {
              opacity: open ? 1 : 0,
              clipPath: open ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)",
              y: open ? 0 : -4,
            }
      }
      transition={{
        duration: reduce ? 0 : open ? 0.22 : 0.14,
        ease: EASE_OUT,
      }}
      className={cn("overflow-hidden", className)}
      style={{
        height: open ? "auto" : 0,
        pointerEvents: open ? undefined : "none",
        transformOrigin: "top",
      }}
    >
      {children}
    </motion.div>
  );
}

function TodoHeaderIcon({ complete }: { complete: boolean }) {
  const reduce = useReducedMotion() ?? false;

  return (
    <span
      aria-hidden="true"
      className="relative grid size-6 shrink-0 place-items-center"
    >
      <AnimatePresence initial={false} mode="popLayout">
        {complete ? (
          <motion.span
            key="complete"
            initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.72 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={reduce ? { duration: 0 } : SPRING_SWAP}
            className="absolute flex size-6 items-center justify-center rounded-full bg-emerald-500 text-white"
          >
            <motion.svg
              viewBox="0 0 24 24"
              className="size-3.5 overflow-visible"
              initial={false}
            >
              <motion.path
                d="M7.5 12.25 10.5 15.25 16.75 8.75"
                fill="none"
                stroke="white"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={
                  reduce ? { duration: 0 } : { duration: 0.24, ease: EASE_OUT }
                }
              />
            </motion.svg>
          </motion.span>
        ) : (
          <motion.span
            key="todo"
            initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.72 }}
            transition={reduce ? { duration: 0 } : SPRING_SWAP}
            className="absolute grid place-items-center text-muted-foreground"
          >
            <HugeiconsIcon icon={TaskDaily01Icon} size={18} />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

function TodoStatusIcon({
  status,
  progress,
}: {
  status: TodoItemStatus;
  progress?: number;
}) {
  const reduce = useReducedMotion() ?? false;
  const normalizedProgress =
    progress === undefined ? 0.68 : Math.min(100, Math.max(0, progress)) / 100;

  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      initial={false}
      className={cn(
        "size-6 shrink-0 overflow-visible text-muted-foreground",
        status === "in-progress" && "text-foreground",
        status === "completed" && "text-emerald-500",
        status === "cancelled" && "text-rose-600 dark:text-rose-400",
      )}
    >
      {/* Outer ring — pending / in-progress */}
      <motion.circle
        cx="12"
        cy="12"
        r="9"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeDasharray={status === "pending" ? "2 3" : undefined}
        strokeLinecap="round"
        initial={false}
        animate={{
          fillOpacity: status === "in-progress" ? 0.08 : 0,
          opacity: status === "completed" ? 0 : 1,
        }}
        transition={reduce ? { duration: 0 } : { duration: 0.18, ease: EASE_OUT }}
      />
      {/* Completed: solid green disc */}
      <motion.circle
        cx="12"
        cy="12"
        r="9"
        fill="#10b981"
        stroke="#10b981"
        strokeWidth="1.75"
        initial={false}
        animate={{
          opacity: status === "completed" ? 1 : 0,
          scale: status === "completed" ? 1 : 0.72,
        }}
        transition={reduce ? { duration: 0 } : SPRING_SWAP}
        style={{ transformOrigin: "12px 12px" }}
      />
      <motion.circle
        cx="12"
        cy="12"
        r="9"
        pathLength="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        initial={false}
        animate={{
          pathLength: status === "in-progress" ? normalizedProgress : 0,
          opacity: status === "in-progress" ? 1 : 0,
          rotate:
            status === "in-progress" && progress === undefined && !reduce
              ? 360
              : -90,
        }}
        transition={
          status === "in-progress" && progress === undefined && !reduce
            ? { rotate: { duration: 1.1, repeat: Infinity, ease: "linear" } }
            : reduce
              ? { duration: 0 }
              : SPRING_LAYOUT
        }
        style={{ transformOrigin: "12px 12px" }}
      />
      <motion.path
        d="M7.5 12.25 10.5 15.25 16.75 8.75"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{
          pathLength: status === "completed" ? 1 : 0,
          opacity: status === "completed" ? 1 : 0,
        }}
        transition={reduce ? { duration: 0 } : { duration: 0.24, ease: EASE_OUT }}
      />
      <motion.path
        d="M8.5 8.5 15.5 15.5M15.5 8.5 8.5 15.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        initial={false}
        animate={{
          pathLength: status === "cancelled" ? 1 : 0,
          opacity: status === "cancelled" ? 1 : 0,
        }}
        transition={reduce ? { duration: 0 } : { duration: 0.2, ease: EASE_OUT }}
      />
    </motion.svg>
  );
}

export function TodoList({
  items,
  title = "کارها",
  open,
  defaultOpen = true,
  onOpenChange,
  collapseOnComplete = true,
  maxHeight = 248,
  className,
}: TodoListProps) {
  const reduce = useReducedMotion() ?? false;
  const baseId = useId();
  const triggerId = `${baseId}-trigger`;
  const contentId = `${baseId}-content`;
  const viewportRef = useRef<HTMLDivElement>(null);
  const previousComplete = useRef(false);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const currentOpen = open ?? internalOpen;
  const completed = items.filter((item) => item.status === "completed").length;
  const allComplete = items.length > 0 && completed === items.length;
  const itemCount = items.length;

  const setOpen = useCallback(
    (next: boolean) => {
      if (open === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange, open],
  );

  useEffect(() => {
    if (previousComplete.current && !allComplete) {
      setOpen(true);
    }
    if (!previousComplete.current && allComplete && collapseOnComplete) {
      setOpen(false);
    }
    previousComplete.current = allComplete;
  }, [allComplete, collapseOnComplete, setOpen]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || itemCount === 0) return;

    const frame = requestAnimationFrame(() => {
      if (viewport.scrollHeight <= viewport.clientHeight) return;
      if (typeof viewport.scrollTo === "function") {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: reduce ? "auto" : "smooth",
        });
      } else {
        viewport.scrollTop = viewport.scrollHeight;
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [itemCount, reduce]);

  return (
    <section
      dir="rtl"
      lang="fa"
      aria-label="فهرست وظایف ایجنت"
      className={cn(
        "w-full overflow-hidden border border-border bg-card font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal text-foreground",
        className,
      )}
      style={{ borderRadius: 20 }}
    >
      <button
        id={triggerId}
        type="button"
        aria-expanded={currentOpen}
        aria-controls={contentId}
        onClick={() => setOpen(!currentOpen)}
        className="group flex h-12 w-full cursor-default items-center gap-3 rounded-[20px] px-3 text-start outline-none hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <TodoHeaderIcon complete={allComplete} />
        <h3 className="min-w-0 flex-1 truncate text-base font-medium text-foreground">
          {title}
        </h3>
        <span
          className={cn(
            "shrink-0 text-sm font-medium tabular-nums text-muted-foreground",
            allComplete && "text-foreground",
          )}
          dir="ltr"
        >
          <span className="sr-only">
            {faNum(completed)} از {faNum(items.length)} کار انجام شد
          </span>
          <span aria-hidden="true" className="inline-flex">
            <RollText value={String(completed)}>{faNum(completed)}</RollText>
            <span>/</span>
            <span>{faNum(items.length)}</span>
          </span>
        </span>
        <motion.span
          aria-hidden="true"
          animate={{ rotate: currentOpen ? 180 : 0 }}
          transition={reduce ? { duration: 0 } : SPRING_SWAP}
          className="text-muted-foreground transition-colors group-hover:text-foreground"
        >
          <HugeiconsIcon icon={ArrowDown01Icon} size={16} />
        </motion.span>
      </button>

      <AgentDisclosure
        id={contentId}
        role="region"
        aria-labelledby={triggerId}
        open={currentOpen}
      >
        <div
          ref={viewportRef}
          className="overflow-y-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ maxHeight }}
        >
          {items.length ? (
            <ol aria-live="polite" className="flex flex-col gap-1">
              <AnimatePresence initial={false} mode="popLayout">
                {items.map((item) => {
                  const status = item.status ?? "pending";
                  return (
                    <motion.li
                      layout="position"
                      key={item.id}
                      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -3 }}
                      transition={
                        reduce
                          ? { duration: 0 }
                          : {
                              type: "spring",
                              bounce: 0.1,
                              duration: 0.25,
                              ease: [0.215, 0.61, 0.355, 1],
                            }
                      }
                      className={cn(
                        "flex min-h-11 items-center justify-between gap-3 rounded-2xl px-3 py-2",
                        status === "in-progress" && "bg-accent/50",
                      )}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <TodoStatusIcon
                          status={status}
                          progress={item.progress}
                        />
                        <span className="sr-only">{statusLabel(status)}: </span>
                        <span
                          className={cn(
                            "min-w-0 flex-1 truncate text-base leading-6",
                            status === "pending" && "text-muted-foreground",
                            status === "in-progress" && "text-foreground",
                            status === "completed" && "text-muted-foreground",
                            status === "cancelled" && "text-muted-foreground/70",
                          )}
                        >
                          <span className="relative inline-block max-w-full">
                            {item.title}
                            <motion.span
                              aria-hidden="true"
                              initial={false}
                              animate={{
                                scaleX: status === "completed" ? 1 : 0,
                                opacity: status === "completed" ? 1 : 0,
                              }}
                              transition={
                                reduce
                                  ? { duration: 0 }
                                  : {
                                      duration: 0.28,
                                      ease: EASE_OUT,
                                      delay: 0.06,
                                    }
                              }
                              className="absolute inset-x-0 top-1/2 h-px origin-right bg-current"
                            />
                          </span>
                        </span>
                      </div>
                      {item.detail ? (
                        <span
                          className="shrink-0 text-sm text-muted-foreground"
                          dir="ltr"
                        >
                          {item.detail}
                        </span>
                      ) : null}
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ol>
          ) : (
            <p className="px-3 py-2 text-base text-muted-foreground">
              هنوز کاری نیست
            </p>
          )}
        </div>
      </AgentDisclosure>
    </section>
  );
}

const TASKS = [
  "بررسی جریان دادهٔ فعلی",
  "به‌روزرسانی اسکیمای پاسخ",
  "پوشش تست برای حالت‌های مرزی",
  "اجرای چک‌ها و آماده‌سازی نتیجه",
];

const TICKS_PER_TASK = 4;

function itemsAtStep(step: number): TodoItem[] {
  return TASKS.map((title, index) => ({
    id: `task-${index}`,
    title,
    status:
      step >= (index + 1) * TICKS_PER_TASK
        ? "completed"
        : step >= index * TICKS_PER_TASK
          ? "in-progress"
          : "pending",
    progress:
      step >= index * TICKS_PER_TASK && step < (index + 1) * TICKS_PER_TASK
        ? ((step % TICKS_PER_TASK) + 1) * 25
        : undefined,
    detail:
      step >= index * TICKS_PER_TASK && step < (index + 1) * TICKS_PER_TASK
        ? `${faNum(((step % TICKS_PER_TASK) + 1) * 25)}٪`
        : undefined,
  }));
}

function TodoRun() {
  const [step, setStep] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (step >= TASKS.length * TICKS_PER_TASK) return;
    timer.current = window.setTimeout(() => setStep((value) => value + 1), 280);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [step]);

  return <TodoList items={itemsAtStep(step)} title="نقشهٔ پیاده‌سازی" />;
}

/** پیش‌نمایش فارسی — همان زبان بصری filter-interaction. */
export default function TodoListExample() {
  const [run, setRun] = useState(0);

  return (
    <section
      dir="rtl"
      lang="fa"
      className="relative flex h-full min-h-88 w-full items-center justify-center fill-muted-foreground/70 bg-transparent px-4 py-10 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <div className="relative h-[330px] w-full max-w-sm">
        <TodoRun key={run} />
        <button
          type="button"
          onClick={() => setRun((value) => value + 1)}
          className="absolute bottom-0 start-0 inline-flex cursor-default items-center gap-1.5 rounded-2xl px-3 py-2 text-sm text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <HugeiconsIcon icon={RefreshIcon} size={16} />
          پخش دوباره
        </button>
      </div>
    </section>
  );
}
