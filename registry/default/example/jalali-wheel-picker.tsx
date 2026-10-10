"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  addDays,
  format,
  getDate,
  isSameDay,
  setHours,
  setMinutes,
  startOfDay,
} from "date-fns-jalali";
import { faIR } from "date-fns-jalali/locale/fa-IR";
import { useReducedMotion } from "motion/react";
import clsx from "clsx";

const FA = "۰۱۲۳۴۵۶۷۸۹";
function toFa(n: number | string) {
  return String(n).replace(/\d/g, (d) => FA[Number(d)] ?? d);
}

function pad2(n: number) {
  return toFa(String(n).padStart(2, "0"));
}

const ITEM_H = 44;
const VISIBLE = 5;
const PAD = Math.floor(VISIBLE / 2);
const WHEEL_H = ITEM_H * VISIBLE;
const DAY_RANGE = 120;

export type JalaliWheelPickerProps = {
  value?: Date;
  defaultValue?: Date;
  onChange?: (next: Date) => void;
  className?: string;
};

type WheelColumnProps<T> = {
  items: T[];
  index: number;
  onIndexChange: (index: number) => void;
  getKey: (item: T, index: number) => string;
  renderLabel: (item: T, index: number, selected: boolean) => ReactNode;
  ariaLabel: string;
  className?: string;
  reduce: boolean;
};

function clampIndex(i: number, length: number) {
  return Math.min(length - 1, Math.max(0, i));
}

/** Soft iOS-like deceleration */
function easeOutQuint(t: number) {
  return 1 - Math.pow(1 - t, 5);
}

const STEP_MS = 420;

function WheelColumn<T>({
  items,
  index,
  onIndexChange,
  getKey,
  renderLabel,
  ariaLabel,
  className,
  reduce,
}: WheelColumnProps<T>) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const animating = useRef(false);
  const rafRef = useRef<number | null>(null);
  const settleTimer = useRef<number | null>(null);
  const indexRef = useRef(index);
  const onChangeRef = useRef(onIndexChange);
  indexRef.current = index;
  onChangeRef.current = onIndexChange;

  // Continuous offset (fractional) for soft fade/scale like iOS
  const [offset, setOffset] = useState(index);
  const selected = Math.round(offset);

  const stopAnim = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    animating.current = false;
  }, []);

  const animateTo = useCallback(
    (i: number, duration = STEP_MS) => {
      const el = scrollerRef.current;
      if (!el) return;
      const next = clampIndex(i, items.length);
      const target = next * ITEM_H;

      if (reduce) {
        stopAnim();
        el.style.scrollSnapType = "y mandatory";
        el.scrollTop = target;
        setOffset(next);
        return;
      }

      stopAnim();
      animating.current = true;
      el.style.scrollSnapType = "none";
      const from = el.scrollTop;
      const dist = target - from;
      if (Math.abs(dist) < 0.5) {
        el.scrollTop = target;
        setOffset(next);
        el.style.scrollSnapType = "y mandatory";
        animating.current = false;
        return;
      }

      const start = performance.now();
      const ms = Math.min(
        560,
        Math.max(280, duration * (0.7 + Math.abs(dist) / (ITEM_H * 4))),
      );

      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / ms);
        const y = from + dist * easeOutQuint(t);
        el.scrollTop = y;
        setOffset(y / ITEM_H);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          el.scrollTop = target;
          setOffset(next);
          el.style.scrollSnapType = "y mandatory";
          animating.current = false;
          rafRef.current = null;
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    },
    [items.length, reduce, stopAnim],
  );

  useEffect(() => () => stopAnim(), [stopAnim]);

  // Sync from controlled index only when idle
  useEffect(() => {
    if (dragging.current || animating.current) return;
    const el = scrollerRef.current;
    if (!el) return;
    if (Math.abs(el.scrollTop - index * ITEM_H) > 1.5) {
      el.scrollTop = index * ITEM_H;
      setOffset(index);
    } else {
      setOffset(index);
    }
  }, [index]);

  const commit = useCallback(
    (i: number) => {
      const next = clampIndex(i, items.length);
      indexRef.current = next;
      onChangeRef.current(next);
      animateTo(next);
    },
    [animateTo, items.length],
  );

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let wheelGate = 0;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const now = performance.now();
      // Soft gate: allow a new step before the glide fully ends
      if (now - wheelGate < 90) return;
      wheelGate = now;
      const delta =
        Math.abs(event.deltaY) >= Math.abs(event.deltaX)
          ? event.deltaY
          : event.deltaX;
      commit(indexRef.current + (delta > 0 ? 1 : -1));
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [commit]);

  const finishScroll = () => {
    const el = scrollerRef.current;
    if (!el || animating.current) return;
    const next = clampIndex(Math.round(el.scrollTop / ITEM_H), items.length);
    dragging.current = false;
    if (next !== indexRef.current) {
      indexRef.current = next;
      onChangeRef.current(next);
    }
    animateTo(next, 360);
  };

  const onScroll = () => {
    if (animating.current) return;
    const el = scrollerRef.current;
    if (!el) return;
    dragging.current = true;
    setOffset(el.scrollTop / ITEM_H);
    if (settleTimer.current) window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(finishScroll, 70);
  };

  return (
    <div
      className={clsx("relative min-w-0 flex-1", className)}
      style={{ height: WHEEL_H }}
    >
      <div
        ref={scrollerRef}
        role="listbox"
        aria-label={ariaLabel}
        tabIndex={0}
        onScroll={onScroll}
        onPointerDown={() => {
          stopAnim();
          dragging.current = true;
        }}
        onKeyDown={(event) => {
          if (
            event.key === "ArrowDown" ||
            event.key === "ArrowLeft" ||
            event.key === "PageDown"
          ) {
            event.preventDefault();
            const step = event.key === "PageDown" ? 5 : 1;
            commit(index + step);
          } else if (
            event.key === "ArrowUp" ||
            event.key === "ArrowRight" ||
            event.key === "PageUp"
          ) {
            event.preventDefault();
            const step = event.key === "PageUp" ? 5 : 1;
            commit(index - step);
          } else if (event.key === "Home") {
            event.preventDefault();
            commit(0);
          } else if (event.key === "End") {
            event.preventDefault();
            commit(items.length - 1);
          }
        }}
        className="h-full overflow-y-auto overscroll-contain [scrollbar-width:none] focus-visible:outline-none [&::-webkit-scrollbar]:hidden"
        style={{
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div style={{ height: PAD * ITEM_H }} aria-hidden />
        {items.map((item, i) => {
          const abs = Math.abs(i - offset);
          const isSelected = i === selected;
          const opacity = reduce
            ? isSelected
              ? 1
              : abs <= 1
                ? 0.4
                : 0.18
            : Math.max(0.12, 1 - abs * 0.42);
          const scale = reduce
            ? 1
            : Math.max(0.82, 1.06 - abs * 0.09);

          return (
            <button
              key={getKey(item, i)}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => {
                scrollerRef.current?.focus({ preventScroll: true });
                commit(i);
              }}
              className={clsx(
                "relative flex w-full shrink-0 cursor-pointer items-center justify-center px-1.5 text-center tabular-nums outline-none",
                isSelected
                  ? "font-semibold text-foreground"
                  : "font-normal text-muted-foreground",
              )}
              style={{
                height: ITEM_H,
                scrollSnapAlign: "center",
                opacity: isSelected ? 1 : opacity,
                transform: `scale(${scale})`,
              }}
            >
              <span className="whitespace-nowrap text-[15px] leading-none tracking-normal sm:text-[17px]">
                {renderLabel(item, i, isSelected)}
              </span>
            </button>
          );
        })}
        <div style={{ height: PAD * ITEM_H }} aria-hidden />
      </div>
    </div>
  );
}

function buildDayRange(center: Date) {
  const start = startOfDay(addDays(center, -DAY_RANGE));
  return Array.from({ length: DAY_RANGE * 2 + 1 }, (_, i) =>
    addDays(start, i),
  );
}

function DayLabel({ date, selected }: { date: Date; selected: boolean }) {
  const weekday = format(date, "EEEE", { locale: faIR });
  const day = toFa(getDate(date));
  const month = format(date, "MMMM", { locale: faIR });
  const year = toFa(format(date, "yyyy", { locale: faIR }));

  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className={selected ? "text-foreground/65" : undefined}>
        {weekday}
      </span>
      <span
        className={clsx(
          "tabular-nums",
          selected && "text-[1.12em] font-bold text-foreground",
        )}
      >
        {day}
      </span>
      <span className={selected ? "text-foreground/65" : undefined}>
        {month}
      </span>
      <span
        className={clsx(
          "tabular-nums",
          selected ? "text-foreground/65" : undefined,
        )}
      >
        {year}
      </span>
    </span>
  );
}

function mergeDateTime(day: Date, hours: number, minutes: number) {
  return setMinutes(setHours(startOfDay(day), hours), minutes);
}

export function JalaliWheelPicker({
  value,
  defaultValue,
  onChange,
  className,
}: JalaliWheelPickerProps) {
  const reduce = useReducedMotion() ?? false;
  const [uncontrolled, setUncontrolled] = useState(
    () => defaultValue ?? new Date(),
  );
  const selected = value ?? uncontrolled;
  const dayCenterRef = useRef(startOfDay(defaultValue ?? value ?? new Date()));

  const setSelected = useCallback(
    (next: Date) => {
      if (value === undefined) setUncontrolled(next);
      onChange?.(next);
    },
    [onChange, value],
  );

  const days = useMemo(() => buildDayRange(dayCenterRef.current), []);
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

  const foundDay = days.findIndex((d) => isSameDay(d, selected));
  const dayIndex = foundDay < 0 ? DAY_RANGE : foundDay;
  const hourIndex = selected.getHours();

  const onDay = useCallback(
    (i: number) => {
      const day = days[i];
      if (!day) return;
      setSelected(mergeDateTime(day, selected.getHours(), 0));
    },
    [days, selected, setSelected],
  );

  const onHour = useCallback(
    (i: number) => {
      setSelected(mergeDateTime(selected, hours[i] ?? 0, 0));
    },
    [hours, selected, setSelected],
  );

  return (
    <div
      dir="rtl"
      lang="fa"
      className={clsx(
        "relative w-full max-w-md overflow-hidden rounded-[22px] border border-border bg-card text-foreground",
        "font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal",
        className,
      )}
      style={{ borderWidth: 1 }}
    >
      <div
        className="pointer-events-none absolute inset-x-3 z-[1] rounded-2xl bg-muted"
        style={{ top: PAD * ITEM_H, height: ITEM_H }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-16 bg-linear-to-b from-card via-card/90 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-16 bg-linear-to-t from-card via-card/90 to-transparent"
        aria-hidden
      />

      <div className="relative z-10 flex items-stretch gap-0 px-1.5">
        <WheelColumn
          items={days}
          index={dayIndex}
          onIndexChange={onDay}
          getKey={(d) => d.toISOString()}
          renderLabel={(d, _i, selectedRow) => (
            <DayLabel date={d} selected={selectedRow} />
          )}
          ariaLabel="روز"
          className="min-w-[78%] basis-[78%]"
          reduce={reduce}
        />
        <WheelColumn
          items={hours}
          index={hourIndex}
          onIndexChange={onHour}
          getKey={(h) => `h-${h}`}
          renderLabel={(h) => pad2(h)}
          ariaLabel="ساعت"
          className="basis-[22%]"
          reduce={reduce}
        />
      </div>
    </div>
  );
}

export default function JalaliWheelPickerDemo() {
  const [value, setValue] = useState(() => new Date());

  const summary = useMemo(() => {
    const day = toFa(format(value, "EEEE d MMMM yyyy", { locale: faIR }));
    const hour = pad2(value.getHours());
    return `${day} · ساعت ${hour}`;
  }, [value]);

  return (
    <section
      dir="rtl"
      lang="fa"
      aria-label="انتخابگر چرخان تاریخ شمسی"
      className="flex w-full max-w-md flex-col gap-3 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <JalaliWheelPicker value={value} onChange={setValue} />
      <p className="px-1 text-center text-sm text-muted-foreground tabular-nums">
        {summary}
      </p>
    </section>
  );
}
