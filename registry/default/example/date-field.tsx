"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getMonth,
  getYear,
  isSameDay,
  isSameMonth,
  isToday,
  setMonth as setJalaliMonth,
  setYear as setJalaliYear,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns-jalali";
import { faIR } from "date-fns-jalali/locale/fa-IR";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Calendar03Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import clsx from "clsx";

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const WEEKDAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"] as const;
const ROW_EASE: [number, number, number, number] = [0.215, 0.61, 0.355, 1];
const YEAR_WINDOW_PAST = 80;
const YEAR_WINDOW_FUTURE = 20;
/** Fixed body height so day / month / year views never resize the shell. */
const PANEL_BODY_CLASS = "relative h-[20.5rem] w-full shrink-0";
const VIEW_SHELL_CLASS = "absolute inset-0";

type PanelView = "days" | "months" | "years";

function toFaDigits(value: string | number) {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)] ?? d);
}

function formatSelected(date: Date) {
  return toFaDigits(format(date, "d MMMM yyyy", { locale: faIR }));
}

function monthLabel(monthIndex: number, year: number) {
  return format(setJalaliMonth(setJalaliYear(new Date(), year), monthIndex), "MMMM", {
    locale: faIR,
  });
}

function DayCell(props: {
  date: Date;
  index: number;
  month: Date;
  selected: Date | null;
  dayPillId: string;
  onSelect: (date: Date) => void;
}) {
  const { date, index, month, selected, dayPillId, onSelect } = props;
  const inMonth = isSameMonth(date, month);
  const selectedDay = selected ? isSameDay(date, selected) : false;
  const today = isToday(date);
  const delay = (index % 7) * 0.016 + Math.floor(index / 7) * 0.028;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 8, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        bounce: 0.12,
        duration: 0.26,
        delay,
        ease: ROW_EASE,
      }}
      onClick={() => onSelect(date)}
      aria-label={toFaDigits(format(date, "EEEE d MMMM yyyy", { locale: faIR }))}
      aria-pressed={selectedDay}
      className={clsx(
        "relative flex h-full min-h-0 w-full items-center justify-center rounded-2xl text-[15px] tabular-nums transition-colors",
        inMonth
          ? "text-foreground hover:bg-accent"
          : "text-muted-foreground/35 hover:bg-accent/40",
        selectedDay && "text-primary-foreground hover:bg-primary",
        !selectedDay && today && "font-semibold"
      )}
    >
      {selectedDay ? (
        <motion.span
          layoutId={dayPillId}
          className="absolute inset-1 rounded-2xl bg-primary"
          transition={{ type: "spring", bounce: 0.28, duration: 0.45 }}
        />
      ) : null}
      {!selectedDay && today ? (
        <span className="absolute inset-1 rounded-2xl border border-border" />
      ) : null}
      <span className="relative z-10">{toFaDigits(format(date, "d"))}</span>
    </motion.button>
  );
}

function EmptyDayCell() {
  return <div aria-hidden className="h-full min-h-0 w-full" />;
}

function MonthGrid(props: {
  month: Date;
  onPick: (monthIndex: number) => void;
}) {
  const year = getYear(props.month);
  const active = getMonth(props.month);

  return (
    <div className="grid h-full grid-cols-3 grid-rows-4 gap-1.5 p-1">
      {Array.from({ length: 12 }, (_, index) => {
        const activeMonth = index === active;
        return (
          <motion.button
            key={index}
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              type: "spring",
              bounce: 0.12,
              duration: 0.28,
              delay: (index + 4) * 0.02,
              ease: ROW_EASE,
            }}
            onClick={() => props.onPick(index)}
            className={clsx(
              "relative flex h-full min-h-0 items-center justify-center rounded-2xl px-2 text-base transition-colors",
              activeMonth
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent"
            )}
          >
            {monthLabel(index, year)}
          </motion.button>
        );
      })}
    </div>
  );
}

function YearGrid(props: {
  month: Date;
  onPick: (year: number) => void;
}) {
  const active = getYear(props.month);
  const years = useMemo(() => {
    const start = active - YEAR_WINDOW_PAST;
    const end = active + YEAR_WINDOW_FUTURE;
    return Array.from({ length: end - start + 1 }, (_, i) => start + i).reverse();
  }, [active]);

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = listRef.current;
    if (!root) return;
    const el = root.querySelector<HTMLElement>(`[data-year="${active}"]`);
    el?.scrollIntoView({ block: "center" });
  }, [active]);

  return (
    <div
      ref={listRef}
      className="grid h-full grid-cols-3 content-start gap-1.5 overflow-y-auto overscroll-contain p-1"
    >
      {years.map((year, index) => {
        const activeYear = year === active;
        return (
          <motion.button
            key={year}
            type="button"
            data-year={year}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              type: "spring",
              bounce: 0.1,
              duration: 0.24,
              delay: Math.min(index, 18) * 0.012,
              ease: ROW_EASE,
            }}
            onClick={() => props.onPick(year)}
            className={clsx(
              "relative flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-2xl text-base tabular-nums transition-colors",
              activeYear
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent"
            )}
          >
            <span>{toFaDigits(year)}</span>
            {activeYear ? (
              <HugeiconsIcon icon={Tick02Icon} size={16} />
            ) : null}
          </motion.button>
        );
      })}
    </div>
  );
}

function CaptionChip(props: {
  label: string;
  active: boolean;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      aria-label={props.ariaLabel}
      aria-expanded={props.active}
      onClick={props.onClick}
      className={clsx(
        "inline-flex items-center gap-1 rounded-2xl px-2.5 py-1.5 text-base font-medium transition-colors",
        props.active
          ? "bg-accent text-foreground"
          : "text-foreground hover:bg-accent"
      )}
    >
      <span>{props.label}</span>
      <HugeiconsIcon
        icon={ArrowDown01Icon}
        size={16}
        className={clsx(
          "text-muted-foreground transition-transform",
          props.active && "rotate-180"
        )}
      />
    </button>
  );
}

function CalendarPanel(props: {
  month: Date;
  setMonth: Dispatch<SetStateAction<Date>>;
  selected: Date | null;
  dayPillId: string;
  onSelect: (date: Date) => void;
  onClose: () => void;
}) {
  const { month, setMonth, selected, dayPillId, onSelect, onClose } = props;
  const [view, setView] = useState<PanelView>("days");

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 6 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 6 });
    const interval = eachDayOfInterval({ start, end });
    // Always fill 6 weeks so 5-week months do not shrink the panel.
    while (interval.length < 42) {
      interval.push(new Date(NaN));
    }
    return interval.slice(0, 42);
  }, [month]);

  const year = getYear(month);
  const monthName = format(month, "MMMM", { locale: faIR });

  const goPrev = () => setMonth((m) => subMonths(m, 1));
  const goNext = () => setMonth((m) => addMonths(m, 1));

  const viewTransition = {
    type: "tween" as const,
    duration: 0.18,
    ease: ROW_EASE,
  };

  return (
    <div className="flex flex-col gap-2.5 p-3">
      <div className="flex shrink-0 items-center gap-1">
        {/* In RTL flex: first item sits on the start (right). Previous = right + → */}
        <button
          type="button"
          aria-label="ماه قبل"
          disabled={view !== "days"}
          onClick={goPrev}
          className="flex size-10 shrink-0 items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
        >
          <HugeiconsIcon icon={ArrowRight01Icon} size={22} />
        </button>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-0.5">
          <CaptionChip
            label={monthName}
            active={view === "months"}
            ariaLabel="انتخاب ماه"
            onClick={() => setView((v) => (v === "months" ? "days" : "months"))}
          />
          <CaptionChip
            label={toFaDigits(year)}
            active={view === "years"}
            ariaLabel="انتخاب سال"
            onClick={() => setView((v) => (v === "years" ? "days" : "years"))}
          />
        </div>

        {/* Last item in RTL = end (left). Next = left + ← */}
        <button
          type="button"
          aria-label="ماه بعد"
          disabled={view !== "days"}
          onClick={goNext}
          className="flex size-10 shrink-0 items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={22} />
        </button>
      </div>

      <div className={PANEL_BODY_CLASS}>
        <AnimatePresence mode="wait" initial={false}>
          {view === "days" ? (
            <motion.div
              key="days"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={viewTransition}
              className={VIEW_SHELL_CLASS}
            >
              <div className="grid h-full grid-cols-7 grid-rows-[2rem_repeat(6,minmax(0,1fr))] gap-1 px-0.5">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="flex items-center justify-center text-sm text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}
                {days.map((date, index) => {
                  if (Number.isNaN(date.getTime())) {
                    return <EmptyDayCell key={`empty-${index}`} />;
                  }
                  return (
                    <DayCell
                      key={date.toISOString()}
                      date={date}
                      index={index}
                      month={month}
                      selected={selected}
                      dayPillId={dayPillId}
                      onSelect={onSelect}
                    />
                  );
                })}
              </div>
            </motion.div>
          ) : null}

          {view === "months" ? (
            <motion.div
              key="months"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={viewTransition}
              className={VIEW_SHELL_CLASS}
            >
              <MonthGrid
                month={month}
                onPick={(monthIndex) => {
                  setMonth((m) => startOfMonth(setJalaliMonth(m, monthIndex)));
                  setView("days");
                }}
              />
            </motion.div>
          ) : null}

          {view === "years" ? (
            <motion.div
              key="years"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={viewTransition}
              className={VIEW_SHELL_CLASS}
            >
              <YearGrid
                month={month}
                onPick={(nextYear) => {
                  setMonth((m) => startOfMonth(setJalaliYear(m, nextYear)));
                  setView("months");
                }}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border pt-2">
        <button
          type="button"
          onClick={() => {
            const today = new Date();
            setMonth(startOfMonth(today));
            setView("days");
            onSelect(today);
          }}
          className="rounded-2xl px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          امروز
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-2xl px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          بستن
        </button>
      </div>
    </div>
  );
}

export type DateFieldProps = {
  /** Controlled selected date. */
  value?: Date | null;
  /** Uncontrolled initial date. */
  defaultValue?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
};

export default function DateField({
  value,
  defaultValue = null,
  onChange,
  placeholder = "تاریخ را انتخاب کنید",
  className,
}: DateFieldProps) {
  const shellId = useId();
  const dayPillId = useId();
  const rootRef = useRef<HTMLElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [uncontrolled, setUncontrolled] = useState<Date | null>(defaultValue);
  const controlled = value !== undefined;
  const selected = controlled ? value : uncontrolled;
  const [month, setMonth] = useState(() =>
    startOfMonth(selected ?? new Date()),
  );

  const open = () => {
    if (selected) setMonth(startOfMonth(selected));
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const pick = (date: Date) => {
    if (!controlled) setUncontrolled(date);
    onChange?.(date);
    setMonth(startOfMonth(date));
    window.setTimeout(() => setIsOpen(false), 160);
  };

  return (
    <section
      ref={rootRef}
      dir="rtl"
      lang="fa"
      aria-label="انتخاب تاریخ"
      className={clsx(
        "relative flex w-full max-w-sm items-center justify-center fill-muted-foreground/70 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal",
        className,
      )}
    >
      <MotionConfig
        transition={{ type: "spring", duration: 0.85, bounce: 0.35 }}
      >
        {!isOpen ? (
          <div
            role="button"
            tabIndex={0}
            aria-label="باز کردن تقویم"
            aria-expanded={false}
            aria-haspopup="dialog"
            onClick={open}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                open();
              }
            }}
            className="relative flex h-16 w-full cursor-pointer items-center gap-3 px-4"
          >
            <span className="relative z-10 text-muted-foreground">
              <HugeiconsIcon icon={Calendar03Icon} size={26} />
            </span>
            <span
              className={clsx(
                "relative z-10 min-w-0 flex-1 truncate text-start text-lg",
                selected ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {selected ? formatSelected(selected) : placeholder}
            </span>
            <motion.div
              layoutId={shellId}
              className="absolute inset-0 z-[2] border-border bg-background"
              style={{ borderRadius: 20, borderWidth: 1 }}
            />
          </div>
        ) : (
          <motion.div
            layoutId={shellId}
            role="dialog"
            aria-label="تقویم شمسی"
            aria-modal="true"
            className="relative z-20 w-full overflow-hidden border border-border bg-card text-xl"
            style={{ borderRadius: 24, borderWidth: 1 }}
          >
            <CalendarPanel
              month={month}
              setMonth={setMonth}
              selected={selected}
              dayPillId={dayPillId}
              onSelect={pick}
              onClose={() => setIsOpen(false)}
            />
          </motion.div>
        )}
      </MotionConfig>
    </section>
  );
}
