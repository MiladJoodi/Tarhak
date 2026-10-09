"use client";

import { useCallback, useId, useMemo, useRef, useState } from "react";
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

export type LinePoint = {
  id: string;
  label: string;
  value: number;
};

// Change Here
const DEFAULT_SERIES: LinePoint[] = [
  { id: "far", label: "فرو", value: 42 },
  { id: "ord", label: "ارد", value: 55 },
  { id: "kho", label: "خرد", value: 48 },
  { id: "tir", label: "تیر", value: 71 },
  { id: "mor", label: "مرد", value: 64 },
  { id: "sha", label: "شهر", value: 82 },
  { id: "meh", label: "مهر", value: 76 },
  { id: "aba", label: "آبا", value: 91 },
  { id: "aza", label: "آذر", value: 68 },
  { id: "dey", label: "دی", value: 85 },
  { id: "bah", label: "به", value: 94 },
  { id: "esf", label: "اسف", value: 88 },
];

const WIDTH = 400;
const HEIGHT = 260;
const PAD_L = 40;
const PAD_R = 20;
const PAD_TOP = 24;
const PAD_BOTTOM = 36;
const CHART_W = WIDTH - PAD_L - PAD_R;
const CHART_H = HEIGHT - PAD_TOP - PAD_BOTTOM;

const springDot: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 28,
  mass: 0.7,
};

/** Brand blue — not theme primary (dark mode primary is near-white). */
const LINE_BLUE = "#3451e5";

function niceMax(value: number) {
  if (value <= 0) return 100;
  const raw = value * 1.12;
  const step = raw > 80 ? 20 : raw > 40 ? 10 : 5;
  return Math.ceil(raw / step) * step;
}

/** Smooth cubic path through points (Catmull-Rom → Bezier). */
function buildSmoothPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return "";
  let d = `M ${points[0]!.x} ${points[0]!.y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export type AnimatedLineChartProps = {
  data?: LinePoint[];
  title?: string;
  subtitle?: string;
  unit?: string;
  className?: string;
};

export default function AnimatedLineChart({
  data = DEFAULT_SERIES,
  title = "درآمد ماهانه",
  subtitle = "هاور روی خط · راهنما و جزئیات نقطه",
  unit = "میلیون تومان",
  className,
}: AnimatedLineChartProps) {
  const reduce = useReducedMotion();
  const gradId = useId().replace(/:/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const [runKey, setRunKey] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const max = useMemo(
    () => niceMax(Math.max(...data.map((d) => d.value), 1)),
    [data],
  );

  const coords = useMemo(() => {
    if (data.length === 1) {
      return [
        {
          x: PAD_L + CHART_W / 2,
          y: PAD_TOP + CHART_H * (1 - data[0]!.value / max),
        },
      ];
    }
    return data.map((point, i) => ({
      x: PAD_L + (i / (data.length - 1)) * CHART_W,
      y: PAD_TOP + CHART_H * (1 - point.value / max),
    }));
  }, [data, max]);

  const linePath = useMemo(() => buildSmoothPath(coords), [coords]);
  const areaPath = useMemo(() => {
    if (!linePath || coords.length < 2) return "";
    const first = coords[0]!;
    const last = coords[coords.length - 1]!;
    const base = HEIGHT - PAD_BOTTOM;
    return `${linePath} L ${last.x} ${base} L ${first.x} ${base} Z`;
  }, [linePath, coords]);

  const gridValues = useMemo(() => {
    const steps = 4;
    return Array.from({ length: steps + 1 }, (_, i) =>
      Math.round((max * i) / steps),
    );
  }, [max]);

  const active = activeIndex != null ? data[activeIndex]! : null;
  const activeCoord = activeIndex != null ? coords[activeIndex]! : null;
  const prev = activeIndex != null && activeIndex > 0 ? data[activeIndex - 1]! : null;
  const delta =
    active && prev ? ((active.value - prev.value) / prev.value) * 100 : null;

  const pickNearest = useCallback(
    (clientX: number) => {
      const svg = svgRef.current;
      if (!svg || data.length === 0) return;
      const rect = svg.getBoundingClientRect();
      const xSvg = ((clientX - rect.left) / rect.width) * WIDTH;
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < coords.length; i++) {
        const dist = Math.abs(coords[i]!.x - xSvg);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      }
      setActiveIndex(best);
    },
    [coords, data.length],
  );

  const clearActive = () => setActiveIndex(null);

  /** Tooltip stays inside the chart card; flip near edges. */
  const tooltipStyle = useMemo(() => {
    if (!activeCoord) return null;
    const tipW = 176;
    const tipH = 78;
    let left = activeCoord.x + 14;
    let top = activeCoord.y - tipH - 10;
    if (left + tipW > WIDTH - 8) left = activeCoord.x - tipW - 14;
    if (left < 8) left = 8;
    if (top < 8) top = activeCoord.y + 16;
    return {
      left: `${(left / WIDTH) * 100}%`,
      top: `${(top / HEIGHT) * 100}%`,
    };
  }, [activeCoord]);

  return (
    <section
      dir="rtl"
      lang="fa"
      aria-label={title}
      className={clsx(
        "w-full max-w-lg font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal",
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
              key={active ? active.id : "peak"}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.16 }}
              className="shrink-0 text-end tabular-nums"
            >
              {active ? (
                <>
                  <span className="block text-2xl font-semibold leading-none">
                    {toFaDigits(active.value)}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {active.label}
                  </span>
                </>
              ) : (
                <>
                  <span className="block text-2xl font-semibold leading-none">
                    {toFaDigits(Math.max(...data.map((d) => d.value)))}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    اوج سال
                  </span>
                </>
              )}
            </motion.p>
          </AnimatePresence>
        </header>

        <div className="relative mt-1">
          <svg
            key={runKey}
            ref={svgRef}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="mx-auto block h-auto w-full select-none"
            role="img"
            aria-label={`${title}: ${data.map((d) => `${d.label} ${d.value}`).join("، ")}`}
            onPointerLeave={clearActive}
          >
            <defs>
              <linearGradient id={`area-${gradId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={LINE_BLUE} stopOpacity={0.35} />
                <stop offset="100%" stopColor={LINE_BLUE} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            {gridValues.map((v) => {
              const y = PAD_TOP + CHART_H * (1 - v / max);
              return (
                <g key={v}>
                  <line
                    x1={PAD_L}
                    x2={WIDTH - PAD_R}
                    y1={y}
                    y2={y}
                    stroke="currentColor"
                    className="text-border"
                    strokeWidth={1}
                    strokeDasharray={v === 0 ? undefined : "3 5"}
                    opacity={v === 0 ? 1 : 0.7}
                  />
                  <text
                    x={PAD_L - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-muted-foreground text-[10px] tabular-nums"
                    style={{ fontFamily: "inherit" }}
                  >
                    {toFaDigits(v)}
                  </text>
                </g>
              );
            })}

            <motion.path
              d={areaPath}
              fill={`url(#area-${gradId})`}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, delay: reduce ? 0 : 0.35 }}
            />

            <motion.path
              d={linePath}
              fill="none"
              stroke={LINE_BLUE}
              strokeWidth={2.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: reduce ? 0 : 1.05,
                ease: [0.22, 1, 0.36, 1],
              }}
            />

            {data.map((point, index) => {
              const c = coords[index]!;
              const isActive = activeIndex === index;
              return (
                <g key={point.id}>
                  <text
                    x={c.x}
                    y={HEIGHT - PAD_BOTTOM + 18}
                    textAnchor="middle"
                    className={clsx(
                      "text-[11px] tabular-nums",
                      isActive
                        ? "fill-foreground font-medium"
                        : "fill-muted-foreground",
                    )}
                    style={{ fontFamily: "inherit" }}
                  >
                    {point.label}
                  </text>
                  <motion.circle
                    cx={c.x}
                    cy={c.y}
                    r={isActive ? 5.5 : 3.5}
                    className="fill-card"
                    stroke={LINE_BLUE}
                    strokeWidth={isActive ? 2.5 : 2}
                    initial={reduce ? false : { scale: 0, opacity: 0 }}
                    animate={{
                      scale: 1,
                      opacity: activeIndex != null && !isActive ? 0.35 : 1,
                    }}
                    transition={{
                      ...springDot,
                      delay: reduce ? 0 : 0.55 + index * 0.04,
                      opacity: { duration: 0.18 },
                    }}
                    style={{ transformOrigin: `${c.x}px ${c.y}px` }}
                  />
                </g>
              );
            })}

            {activeCoord ? (
              <g pointerEvents="none">
                <line
                  x1={activeCoord.x}
                  x2={activeCoord.x}
                  y1={PAD_TOP}
                  y2={HEIGHT - PAD_BOTTOM}
                  stroke="currentColor"
                  className="text-foreground/35"
                  strokeWidth={1.25}
                  strokeDasharray="4 4"
                />
                <circle
                  cx={activeCoord.x}
                  cy={activeCoord.y}
                  r={10}
                  fill={LINE_BLUE}
                  fillOpacity={0.15}
                />
                <circle
                  cx={activeCoord.x}
                  cy={activeCoord.y}
                  r={5}
                  fill={LINE_BLUE}
                  className="stroke-card"
                  strokeWidth={2}
                />
              </g>
            ) : null}

            {/* Wide hit target for nearest-point guide */}
            <rect
              x={PAD_L}
              y={PAD_TOP}
              width={CHART_W}
              height={CHART_H}
              fill="transparent"
              className="cursor-crosshair"
              onPointerMove={(e) => pickNearest(e.clientX)}
              onPointerEnter={(e) => pickNearest(e.clientX)}
              onPointerLeave={clearActive}
            />
          </svg>

          <AnimatePresence>
            {active && activeCoord && tooltipStyle ? (
              <motion.div
                key={active.id}
                role="tooltip"
                initial={reduce ? false : { opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, y: 4, scale: 0.97 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-none absolute z-10 w-44 rounded-2xl border border-border bg-popover px-3 py-2.5 text-popover-foreground shadow-lg"
                style={tooltipStyle}
              >
                <p className="text-xs text-muted-foreground">
                  ماه {active.label}
                </p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums leading-tight">
                  {toFaDigits(active.value)}
                  <span className="ms-1 text-xs font-normal text-muted-foreground">
                    {unit}
                  </span>
                </p>
                {delta != null ? (
                  <p
                    className={clsx(
                      "mt-1 whitespace-nowrap text-xs tabular-nums",
                      delta >= 0 ? "text-emerald-600" : "text-rose-600",
                    )}
                  >
                    {delta >= 0 ? "▲" : "▼"}{" "}
                    {toFaDigits(Math.abs(delta).toFixed(1))}٪ نسبت به ماه قبل
                  </p>
                ) : (
                  <p className="mt-1 whitespace-nowrap text-xs text-muted-foreground">
                    اولین ماه دوره
                  </p>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="mt-1 flex items-center justify-between gap-2 px-1">
          <p className="text-xs text-muted-foreground">
            میانگین{" "}
            <span className="tabular-nums text-foreground">
              {toFaDigits(
                Math.round(
                  data.reduce((s, d) => s + d.value, 0) / Math.max(data.length, 1),
                ),
              )}
            </span>
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveIndex(null);
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
