"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "motion/react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Alert02Icon,
  CheckmarkCircle02Icon,
  File01Icon,
  Image01Icon,
  ReloadIcon,
  Upload04Icon,
} from "@hugeicons/core-free-icons";

export type UploadStatus = "idle" | "uploading" | "success" | "error";

export type UploadFile = {
  id: string;
  name: string;
  ext: string;
  bytes: number;
  icon: IconSvgElement;
  failOnce?: boolean;
};

type RowState = UploadFile & {
  status: UploadStatus;
  progress: number;
};

const FA = "۰۱۲۳۴۵۶۷۸۹";
function toFa(n: number | string) {
  return String(n).replace(/\d/g, (d) => FA[Number(d)] ?? d);
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${toFa(bytes)} بایت`;
  if (bytes < 1024 * 1024) {
    return `${toFa((bytes / 1024).toFixed(1))} کیلوبایت`;
  }
  return `${toFa((bytes / (1024 * 1024)).toFixed(1))} مگابایت`;
}

const SUCCESS = "#34C759";
const ERROR = "#E11D48";
const BRAND = "#3451e5";

const spring: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 34,
  mass: 0.8,
};

/** No overshoot — avoids a bounce/pulse look when progress hits 100%. */
const progressEase: Transition = {
  type: "tween",
  duration: 0.22,
  ease: [0.22, 1, 0.36, 1],
};

const SEEDS: UploadFile[] = [
  {
    id: "brief",
    name: "brief-final",
    ext: "pdf",
    bytes: 2.4 * 1024 * 1024,
    icon: File01Icon,
  },
  {
    id: "hero",
    name: "hero-cover",
    ext: "jpg",
    bytes: 4.1 * 1024 * 1024,
    icon: Image01Icon,
    failOnce: true,
  },
  {
    id: "notes",
    name: "meeting-notes",
    ext: "docx",
    bytes: 860 * 1024,
    icon: File01Icon,
  },
];

function makeRows(): RowState[] {
  return SEEDS.map((f) => ({
    ...f,
    status: "idle" as const,
    progress: 0,
  }));
}

function barColor(status: UploadStatus) {
  if (status === "success") return SUCCESS;
  if (status === "error") return ERROR;
  return BRAND;
}

function RingProgress({
  value,
  color,
  reduce,
  size = 44,
  stroke = 2.5,
}: {
  value: number;
  color: string;
  reduce: boolean;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  const offset = c * (1 - pct / 100);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
      aria-hidden
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-border/70"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        initial={false}
        animate={{ strokeDashoffset: offset }}
        transition={reduce ? { duration: 0.1 } : progressEase}
      />
    </svg>
  );
}

function UploadRow({
  row,
  onRetry,
  reduce,
}: {
  row: RowState;
  onRetry: (id: string) => void;
  reduce: boolean;
}) {
  const accent = barColor(row.status);
  const sent = Math.round((row.progress / 100) * row.bytes);
  const width =
    row.status === "idle"
      ? 0
      : Math.min(100, Math.max(0, row.progress));

  return (
    <li className="rounded-2xl border border-border bg-card px-3 py-3">
      <div className="flex items-start gap-3">
        <div className="relative size-11 shrink-0">
          <RingProgress
            value={row.status === "idle" ? 0 : row.progress}
            color={accent}
            reduce={reduce}
            size={44}
            stroke={2.5}
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <AnimatePresence mode="wait" initial={false}>
              {row.status === "success" ? (
                <motion.span
                  key="ok"
                  initial={reduce ? false : { opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={spring}
                  style={{ color: SUCCESS }}
                >
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} />
                </motion.span>
              ) : row.status === "error" ? (
                <motion.span
                  key="err"
                  initial={reduce ? false : { opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={spring}
                  style={{ color: ERROR }}
                >
                  <HugeiconsIcon icon={Alert02Icon} size={18} />
                </motion.span>
              ) : (
                <motion.span
                  key="file"
                  initial={false}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-muted-foreground"
                >
                  <HugeiconsIcon icon={row.icon} size={18} />
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-sm font-medium text-foreground">
              <span dir="ltr" className="inline-block max-w-full truncate">
                {row.name}
                <span className="text-muted-foreground">.{row.ext}</span>
              </span>
            </p>
            <span
              className="shrink-0 text-xs tabular-nums"
              style={{
                color:
                  row.status === "idle"
                    ? "var(--muted-foreground)"
                    : accent,
              }}
            >
              {row.status === "idle"
                ? "آماده"
                : row.status === "uploading"
                  ? `${toFa(Math.round(row.progress))}٪`
                  : row.status === "success"
                    ? "موفق"
                    : "خطا"}
            </span>
          </div>

          <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
            {row.status === "uploading"
              ? `${formatBytes(sent)} از ${formatBytes(row.bytes)}`
              : formatBytes(row.bytes)}
          </p>

          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-border/70">
            <motion.div
              className="h-full rounded-full"
              style={{ background: accent }}
              initial={false}
              animate={{ width: `${width}%` }}
              transition={reduce ? { duration: 0.1 } : progressEase}
            />
          </div>

          {row.status === "error" ? (
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-xs text-rose-600">
                اتصال قطع شد؛ دوباره تلاش کنید.
              </p>
              <button
                type="button"
                onClick={() => onRetry(row.id)}
                className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-accent"
              >
                <HugeiconsIcon icon={ReloadIcon} size={14} />
                تلاش دوباره
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export default function FileUploadProgress() {
  const reduce = useReducedMotion() ?? false;
  const [rows, setRows] = useState<RowState[]>(() => makeRows());
  const timers = useRef<Map<string, number>>(new Map());
  const failedOnce = useRef<Set<string>>(new Set());

  const clearTimer = useCallback((id: string) => {
    const t = timers.current.get(id);
    if (t) {
      window.clearInterval(t);
      timers.current.delete(id);
    }
  }, []);

  useEffect(() => {
    return () => {
      for (const t of timers.current.values()) window.clearInterval(t);
      timers.current.clear();
    };
  }, []);

  const startUpload = useCallback(
    (id: string) => {
      clearTimer(id);

      setRows((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "uploading", progress: 0 } : r,
        ),
      );

      const duration = reduce ? 900 : 2200 + Math.random() * 800;
      const started = performance.now();
      const seed = SEEDS.find((s) => s.id === id);
      const willFail =
        seed?.failOnce === true && !failedOnce.current.has(id);

      const tick = window.setInterval(() => {
        const elapsed = performance.now() - started;
        const t = Math.min(1, elapsed / duration);
        const eased = 1 - (1 - t) ** 2;
        const progress = Math.round(eased * 100);

        if (willFail && progress >= 68) {
          clearTimer(id);
          failedOnce.current.add(id);
          setRows((prev) =>
            prev.map((r) =>
              r.id === id ? { ...r, status: "error", progress: 68 } : r,
            ),
          );
          return;
        }

        if (t >= 1) {
          clearTimer(id);
          setRows((prev) =>
            prev.map((r) =>
              r.id === id ? { ...r, status: "success", progress: 100 } : r,
            ),
          );
          return;
        }

        setRows((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, status: "uploading", progress } : r,
          ),
        );
      }, reduce ? 40 : 32);

      timers.current.set(id, tick);
    },
    [clearTimer, reduce],
  );

  const startAll = useCallback(() => {
    const targets = rows.filter(
      (r) => r.status === "idle" || r.status === "error",
    );
    targets.forEach((file, i) => {
      window.setTimeout(
        () => startUpload(file.id),
        i * (reduce ? 60 : 180),
      );
    });
  }, [reduce, rows, startUpload]);

  const reset = useCallback(() => {
    for (const id of [...timers.current.keys()]) clearTimer(id);
    failedOnce.current.clear();
    setRows(makeRows());
  }, [clearTimer]);

  const busy = rows.some((r) => r.status === "uploading");
  const allDone =
    rows.length > 0 &&
    rows.every((r) => r.status === "success" || r.status === "error");
  const successCount = rows.filter((r) => r.status === "success").length;
  const errorCount = rows.filter((r) => r.status === "error").length;

  const overall = useMemo(() => {
    if (!rows.length) return 0;
    return Math.round(
      rows.reduce((sum, r) => sum + r.progress, 0) / rows.length,
    );
  }, [rows]);

  const overallAccent =
    errorCount > 0 && !busy
      ? ERROR
      : successCount === rows.length && allDone
        ? SUCCESS
        : BRAND;

  const started = rows.some((r) => r.status !== "idle");

  return (
    <section
      dir="rtl"
      lang="fa"
      aria-label="پیشرفت آپلود فایل"
      className="relative flex w-full max-w-md flex-col font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <div className="overflow-hidden rounded-[24px] border border-border bg-card px-4 py-4 text-foreground">
        <header className="mb-4 flex items-start justify-between gap-3 px-0.5">
          <div className="min-w-0">
            <h2 className="text-lg font-medium">آپلود فایل‌ها</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {busy
                ? `${toFa(overall)}٪ تکمیل شده`
                : allDone && errorCount === 0
                  ? `${toFa(successCount)} فایل آپلود شد`
                  : allDone
                    ? `${toFa(successCount)} موفق · ${toFa(errorCount)} ناموفق`
                    : "پیشرفت، موفقیت و خطا"}
            </p>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <button
              type="button"
              onClick={reset}
              disabled={!started || busy}
              className={
                !started
                  ? "invisible rounded-xl border border-border px-2.5 py-1.5 text-xs"
                  : "rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-45"
              }
            >
              بازنشانی
            </button>
            <button
              type="button"
              onClick={startAll}
              disabled={busy || (allDone && errorCount === 0)}
              className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-45"
              style={{ background: BRAND }}
            >
              <HugeiconsIcon icon={Upload04Icon} size={14} />
              {allDone && errorCount > 0 ? "تلاش مجدد" : "شروع آپلود"}
            </button>
          </div>
        </header>

        <div className="mb-3 h-1 overflow-hidden rounded-full bg-border/60">
          <motion.div
            className="h-full rounded-full"
            style={{ background: overallAccent }}
            initial={false}
            animate={{ width: `${overall}%` }}
            transition={reduce ? { duration: 0.1 } : progressEase}
          />
        </div>

        <ul className="flex flex-col gap-2">
          {rows.map((row) => (
            <UploadRow
              key={row.id}
              row={row}
              onRetry={(id) => startUpload(id)}
              reduce={reduce}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
