"use client";

import { useId, useMemo, useRef, useState } from "react";
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

function formatCompact(value: number) {
  if (Math.abs(value) >= 1_000_000) {
    return `${toFaDigits((value / 1_000_000).toFixed(1))}م`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${toFaDigits((value / 1_000).toFixed(1))}ه`;
  }
  return toFaDigits(value);
}

/** Brand blue — not theme primary (dark mode primary is near-white). */
const SPARK_BLUE = "#3451e5";

const WIDTH = 120;
const HEIGHT = 40;
const PAD_Y = 4;

const springIn: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 30,
  mass: 0.75,
};

function buildSparkPath(values: number[]) {
  if (values.length === 0) return { line: "", area: "", points: [] as { x: number; y: number }[] };
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values.map((v, i) => {
    const x =
      values.length === 1
        ? WIDTH / 2
        : (i / (values.length - 1)) * WIDTH;
    const y = PAD_Y + (1 - (v - min) / span) * (HEIGHT - PAD_Y * 2);
    return { x, y };
  });

  let line = `M ${points[0]!.x} ${points[0]!.y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    line += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  const first = points[0]!;
  const last = points[points.length - 1]!;
  const area = `${line} L ${last.x} ${HEIGHT} L ${first.x} ${HEIGHT} Z`;
  return { line, area, points };
}

export type AnimatedSparkChartProps = {
  label?: string;
  value?: number;
  /** Percent change vs previous period; omit to hide. */
  delta?: number;
  series?: number[];
  unit?: string;
  className?: string;
};

export default function AnimatedSparkChart({
  label = "بازدید امروز",
  value = 12840,
  delta = 12.4,
  series = [42, 48, 45, 62, 58, 71, 68, 84, 79, 91, 88, 96],
  unit,
  className,
}: AnimatedSparkChartProps) {
  const reduce = useReducedMotion();
  const gradId = useId().replace(/:/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const [runKey, setRunKey] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const { line, area, points } = useMemo(
    () => buildSparkPath(series),
    [series],
  );

  const up = delta != null && delta >= 0;
  const active =
    hoverIndex != null
      ? { value: series[hoverIndex]!, x: points[hoverIndex]!.x, y: points[hoverIndex]!.y }
      : null;

  const pickNearest = (clientX: number) => {
    const el = svgRef.current;
    if (!el || points.length === 0) return;
    const rect = el.getBoundingClientRect();
    const xSvg = ((clientX - rect.left) / rect.width) * WIDTH;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < points.length; i++) {
      const dist = Math.abs(points[i]!.x - xSvg);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    setHoverIndex(best);
  };

  return (
    <article
      dir="rtl"
      lang="fa"
      aria-label={`${label}: ${toFaDigits(value)}`}
      className={clsx(
        "w-full font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal",
        !className?.includes("max-w-") && "max-w-[17.5rem]",
        className,
      )}
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-card p-4 text-foreground">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm text-muted-foreground">{label}</p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={active ? `h-${hoverIndex}` : "main"}
                  initial={reduce ? false : { opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -4 }}
                  transition={{ duration: 0.14 }}
                  className="text-2xl font-semibold tabular-nums leading-none"
                >
                  {active
                    ? toFaDigits(active.value)
                    : formatCompact(value)}
                </motion.span>
              </AnimatePresence>
              {unit ? (
                <span className="text-xs text-muted-foreground">{unit}</span>
              ) : null}
            </div>
            {delta != null ? (
              <p
                className={clsx(
                  "mt-1.5 inline-flex items-center gap-1 text-xs tabular-nums",
                  up ? "text-emerald-600" : "text-rose-600",
                )}
              >
                <span aria-hidden>{up ? "▲" : "▼"}</span>
                {toFaDigits(Math.abs(delta).toFixed(1))}٪
                <span className="text-muted-foreground">نسبت به دیروز</span>
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => {
              setHoverIndex(null);
              setRunKey((k) => k + 1);
            }}
            className="shrink-0 rounded-xl px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="پخش دوباره اسپارک"
          >
            دوباره
          </button>
        </div>

        <div className="relative mt-3">
          <svg
            key={runKey}
            ref={svgRef}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="block h-10 w-full select-none"
            role="img"
            aria-label={`روند ${label}`}
            onPointerLeave={() => setHoverIndex(null)}
          >
            <defs>
              <linearGradient id={`spark-${gradId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SPARK_BLUE} stopOpacity={0.32} />
                <stop offset="100%" stopColor={SPARK_BLUE} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <motion.path
              d={area}
              fill={`url(#spark-${gradId})`}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, delay: reduce ? 0 : 0.2 }}
            />
            <motion.path
              d={line}
              fill="none"
              stroke={SPARK_BLUE}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: reduce ? 0 : 0.85,
                ease: [0.22, 1, 0.36, 1],
              }}
            />

            {points.length > 0 ? (
              <motion.circle
                cx={points[points.length - 1]!.x}
                cy={points[points.length - 1]!.y}
                r={3}
                fill={SPARK_BLUE}
                initial={reduce ? false : { scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ ...springIn, delay: reduce ? 0 : 0.7 }}
                style={{
                  transformOrigin: `${points[points.length - 1]!.x}px ${points[points.length - 1]!.y}px`,
                }}
              />
            ) : null}

            {active ? (
              <g pointerEvents="none">
                <line
                  x1={active.x}
                  x2={active.x}
                  y1={0}
                  y2={HEIGHT}
                  stroke="currentColor"
                  className="text-foreground/30"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
                <circle
                  cx={active.x}
                  cy={active.y}
                  r={7}
                  fill={SPARK_BLUE}
                  fillOpacity={0.16}
                />
                <circle
                  cx={active.x}
                  cy={active.y}
                  r={3.5}
                  fill={SPARK_BLUE}
                  className="stroke-card"
                  strokeWidth={1.5}
                />
              </g>
            ) : null}

            <rect
              x={0}
              y={0}
              width={WIDTH}
              height={HEIGHT}
              fill="transparent"
              className="cursor-crosshair"
              onPointerMove={(e) => pickNearest(e.clientX)}
              onPointerEnter={(e) => pickNearest(e.clientX)}
            />
          </svg>
        </div>
      </div>
    </article>
  );
}
