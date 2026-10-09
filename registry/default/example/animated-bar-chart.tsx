"use client";

import { useId, useMemo, useState } from "react";
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

export type BarPoint = {
  id: string;
  label: string;
  value: number;
};

// Change Here
const DEFAULT_SERIES: BarPoint[] = [
  { id: "sat", label: "ش", value: 42 },
  { id: "sun", label: "ی", value: 58 },
  { id: "mon", label: "د", value: 36 },
  { id: "tue", label: "س", value: 74 },
  { id: "wed", label: "چ", value: 63 },
  { id: "thu", label: "پ", value: 88 },
  { id: "fri", label: "ج", value: 51 },
];

const WIDTH = 360;
const HEIGHT = 220;
const PAD_X = 28;
const PAD_TOP = 28;
const PAD_BOTTOM = 36;
const CHART_H = HEIGHT - PAD_TOP - PAD_BOTTOM;
const CHART_W = WIDTH - PAD_X * 2;

const springRise: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 28,
  mass: 0.85,
};

/** Brand blue — not theme primary (dark mode primary is near-white). */
const BAR_BLUE = "#3451e5";
const BAR_BLUE_DEEP = "#2a41c4";

export type AnimatedBarChartProps = {
  data?: BarPoint[];
  title?: string;
  subtitle?: string;
  className?: string;
};

export default function AnimatedBarChart({
  data = DEFAULT_SERIES,
  title = "بازدید هفتگی",
  subtitle = "لمس هر میله · پخش دوباره از پایین",
  className,
}: AnimatedBarChartProps) {
  const reduce = useReducedMotion();
  const gradId = `bar-blue-${useId().replace(/:/g, "")}`;
  const [runKey, setRunKey] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);

  const max = useMemo(
    () => Math.max(...data.map((d) => d.value), 1),
    [data],
  );

  const gap = 10;
  const barW = (CHART_W - gap * (data.length - 1)) / data.length;
  const active = data.find((d) => d.id === activeId) ?? null;

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
        <header className="mb-1 flex items-start justify-between gap-3 px-1">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-medium">{title}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={active ? active.id : "idle"}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="shrink-0 text-end tabular-nums"
            >
              {active ? (
                <>
                  <span className="block text-2xl font-semibold leading-none">
                    {toFaDigits(active.value)}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    روز {active.label}
                  </span>
                </>
              ) : (
                <>
                  <span className="block text-2xl font-semibold leading-none">
                    {toFaDigits(data.reduce((s, d) => s + d.value, 0))}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    مجموع هفته
                  </span>
                </>
              )}
            </motion.p>
          </AnimatePresence>
        </header>

        <svg
          key={runKey}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="mx-auto mt-1 block h-auto w-full select-none"
          role="img"
          aria-label={`${title}: ${data.map((d) => `${d.label} ${d.value}`).join("، ")}`}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BAR_BLUE} />
              <stop offset="100%" stopColor={BAR_BLUE_DEEP} />
            </linearGradient>
          </defs>

          <line
            x1={PAD_X}
            x2={WIDTH - PAD_X}
            y1={HEIGHT - PAD_BOTTOM}
            y2={HEIGHT - PAD_BOTTOM}
            stroke="currentColor"
            className="text-border"
            strokeWidth={1}
          />

          {data.map((point, index) => {
            const h = Math.max((point.value / max) * CHART_H, 0);
            const x = PAD_X + index * (barW + gap);
            const y = HEIGHT - PAD_BOTTOM - h;
            const baseline = HEIGHT - PAD_BOTTOM;
            const isActive = activeId === point.id;
            const delay = reduce ? 0 : 0.05 + index * 0.06;

            return (
              <g key={point.id}>
                <motion.g
                  initial={reduce ? false : { scaleY: 0 }}
                  animate={{
                    scaleY: 1,
                    opacity: activeId && !isActive ? 0.38 : 1,
                  }}
                  transition={{
                    ...springRise,
                    delay,
                    opacity: { duration: 0.2 },
                  }}
                  style={{
                    transformBox: "view-box",
                    transformOrigin: `${x + barW / 2}px ${baseline}px`,
                  }}
                >
                  <rect
                    x={x}
                    y={y}
                    width={barW}
                    height={h}
                    rx={10}
                    ry={10}
                    fill={`url(#${gradId})`}
                    className="cursor-pointer"
                    tabIndex={0}
                    role="button"
                    aria-label={`${point.label}: ${toFaDigits(point.value)}`}
                    onPointerEnter={() => setActiveId(point.id)}
                    onPointerLeave={() => setActiveId(null)}
                    onFocus={() => setActiveId(point.id)}
                    onBlur={() => setActiveId(null)}
                  />
                </motion.g>
                <text
                  x={x + barW / 2}
                  y={baseline + 18}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[12px]"
                  style={{ fontFamily: "inherit" }}
                >
                  {point.label}
                </text>
                {isActive ? (
                  <text
                    x={x + barW / 2}
                    y={y - 8}
                    textAnchor="middle"
                    className="fill-foreground text-[11px] font-medium"
                    style={{ fontFamily: "inherit" }}
                  >
                    {toFaDigits(point.value)}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>

        <div className="mt-1 flex justify-center">
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
