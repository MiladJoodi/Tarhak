"use client";

import { useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "motion/react";
import clsx from "clsx";

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

function toFaDigits(value: string | number) {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)] ?? d);
}

export type DonutSlice = {
  id: string;
  label: string;
  value: number;
  color?: string;
};

// Change Here — palette with clear hue separation
const DEFAULT_SERIES: DonutSlice[] = [
  { id: "direct", label: "مستقیم", value: 38, color: "#3451e5" },
  { id: "search", label: "جستجو", value: 27, color: "#0d9488" },
  { id: "social", label: "شبکه", value: 18, color: "#d97706" },
  { id: "referral", label: "ارجاع", value: 12, color: "#e11d48" },
  { id: "other", label: "سایر", value: 5, color: "#64748b" },
];

const SIZE = 220;
const CX = SIZE / 2;
const CY = SIZE / 2;
const RADIUS = 72;
const STROKE = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 4;

const drawEase: Transition = {
  duration: 0.62,
  ease: [0.22, 1, 0.36, 1],
};

export type AnimatedDonutChartProps = {
  data?: DonutSlice[];
  title?: string;
  subtitle?: string;
  className?: string;
};

export default function AnimatedDonutChart({
  data = DEFAULT_SERIES,
  title = "منبع ترافیک",
  subtitle = "لمس هر بخش · سهم و مقدار",
  className,
}: AnimatedDonutChartProps) {
  const reduce = useReducedMotion();
  const [runKey, setRunKey] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);

  const total = useMemo(
    () => data.reduce((sum, d) => sum + Math.max(d.value, 0), 0) || 1,
    [data],
  );

  const slices = useMemo(() => {
    let offset = 0;
    const usable = Math.max(CIRCUMFERENCE - GAP * data.length, 1);
    return data.map((slice) => {
      const portion = Math.max(slice.value, 0) / total;
      const length = portion * usable;
      const start = offset;
      offset += length + GAP;
      return {
        ...slice,
        portion,
        length,
        start,
        percent: Math.round(portion * 100),
      };
    });
  }, [data, total]);

  const active = slices.find((s) => s.id === activeId) ?? null;

  return (
    <section
      dir="rtl"
      lang="fa"
      aria-label={title}
      className={clsx(
        "w-full max-w-md font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal",
        className,
      )}
    >
      <div className="overflow-hidden rounded-[24px] border border-border bg-card px-4 pb-3 pt-4 text-foreground">
        <header className="mb-2 px-1">
          <h2 className="truncate text-lg font-medium">{title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        </header>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-5">
          <div className="relative shrink-0">
            <svg
              key={runKey}
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              className="mx-auto block size-[200px] select-none sm:size-[210px]"
              role="img"
              aria-label={`${title}: ${slices.map((s) => `${s.label} ${s.percent}٪`).join("، ")}`}
            >
              {/* track */}
              <circle
                cx={CX}
                cy={CY}
                r={RADIUS}
                fill="none"
                stroke="currentColor"
                strokeWidth={STROKE}
                className="text-muted/25"
              />

              <g transform={`rotate(-90 ${CX} ${CY})`}>
                {slices.map((slice, index) => {
                  const isActive = activeId === slice.id;
                  // Sequential grow from each segment's own start angle
                  const delay = reduce ? 0 : 0.12 + index * 0.14;
                  const dashHidden = `0 ${CIRCUMFERENCE}`;
                  const dashShown = `${slice.length} ${CIRCUMFERENCE}`;

                  return (
                    <motion.circle
                      key={slice.id}
                      cx={CX}
                      cy={CY}
                      r={RADIUS}
                      fill="none"
                      stroke={slice.color ?? "#3451e5"}
                      strokeWidth={isActive ? STROKE + 3 : STROKE}
                      strokeLinecap="butt"
                      strokeDashoffset={-slice.start}
                      initial={
                        reduce
                          ? { strokeDasharray: dashShown, opacity: 1 }
                          : { strokeDasharray: dashHidden, opacity: 0 }
                      }
                      animate={{
                        strokeDasharray: dashShown,
                        opacity: activeId && !isActive ? 0.28 : 1,
                      }}
                      transition={{
                        strokeDasharray: { ...drawEase, delay },
                        opacity: {
                          duration: 0.28,
                          delay,
                          ease: "easeOut",
                        },
                      }}
                      className="cursor-pointer"
                      tabIndex={0}
                      role="button"
                      aria-label={`${slice.label}: ${toFaDigits(slice.percent)}٪، ${toFaDigits(slice.value)}`}
                      onPointerEnter={() => setActiveId(slice.id)}
                      onPointerLeave={() => setActiveId(null)}
                      onFocus={() => setActiveId(slice.id)}
                      onBlur={() => setActiveId(null)}
                    />
                  );
                })}
              </g>
            </svg>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active ? active.id : "total"}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <p className="text-2xl font-semibold tabular-nums leading-none">
                    {toFaDigits(active ? active.percent : 100)}
                    <span className="text-base font-medium">٪</span>
                  </p>
                  <p className="mt-1.5 max-w-[7rem] truncate text-xs text-muted-foreground">
                    {active ? active.label : "کل سهم"}
                  </p>
                  {active ? (
                    <p className="mt-0.5 text-[11px] tabular-nums text-muted-foreground">
                      {toFaDigits(active.value)}
                    </p>
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <ul className="flex w-full min-w-0 flex-1 flex-col gap-1.5 px-1">
            {slices.map((slice, index) => {
              const isActive = activeId === slice.id;
              return (
                <motion.li
                  key={slice.id}
                  initial={reduce ? false : { opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: reduce ? 0 : 0.2 + index * 0.12,
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <button
                    type="button"
                    onPointerEnter={() => setActiveId(slice.id)}
                    onPointerLeave={() => setActiveId(null)}
                    onFocus={() => setActiveId(slice.id)}
                    onBlur={() => setActiveId(null)}
                    className={clsx(
                      "flex w-full items-center gap-2.5 rounded-2xl px-2.5 py-2 text-start transition-colors",
                      isActive ? "bg-accent" : "hover:bg-accent/60",
                    )}
                  >
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: slice.color ?? "#3451e5" }}
                    />
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {slice.label}
                    </span>
                    <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                      {toFaDigits(slice.percent)}٪
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </ul>
        </div>

        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={() => {
              setActiveId(null);
              setRunKey((k) => k + 1);
            }}
            className="rounded-2xl px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            پخش دوباره
          </button>
        </div>
      </div>
    </section>
  );
}
