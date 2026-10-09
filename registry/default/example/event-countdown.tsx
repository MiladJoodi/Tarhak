"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

function toFaDigits(value: string | number) {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)] ?? d);
}

function pad2(n: number) {
  return String(Math.max(0, Math.floor(n))).padStart(2, "0");
}

type Parts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
};

function diffParts(targetMs: number, nowMs: number): Parts {
  const totalMs = Math.max(0, targetMs - nowMs);
  const totalSec = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return { days, hours, minutes, seconds, totalMs };
}

/** Demo target: ~۲ روز و ۱ ساعت از لحظهٔ بارگذاری. */
function defaultTargetMs() {
  return Date.now() + (2 * 86400 + 1 * 3600 + 17 * 60 + 42) * 1000;
}

type UnitKey = "days" | "hours" | "minutes" | "seconds";

const UNITS: { key: UnitKey; label: string; max: number }[] = [
  { key: "days", label: "روز", max: 99 },
  { key: "hours", label: "ساعت", max: 23 },
  { key: "minutes", label: "دقیقه", max: 59 },
  { key: "seconds", label: "ثانیه", max: 59 },
];

function FlipDigit({
  value,
  reduceMotion,
  accent,
}: {
  value: string;
  reduceMotion: boolean;
  accent?: boolean;
}) {
  return (
    <span className="relative inline-flex h-[1.15em] w-[0.62em] items-center justify-center overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          className={
            accent
              ? "absolute inset-0 flex items-center justify-center tabular-nums text-teal-700 dark:text-teal-300"
              : "absolute inset-0 flex items-center justify-center tabular-nums text-slate-900 dark:text-slate-50"
          }
          initial={
            reduceMotion
              ? { opacity: 1 }
              : { y: "-85%", opacity: 0, filter: "blur(3px)" }
          }
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
          exit={
            reduceMotion
              ? { opacity: 0 }
              : { y: "85%", opacity: 0, filter: "blur(3px)" }
          }
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        >
          {toFaDigits(value)}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function UnitCard({
  value,
  label,
  max,
  reduceMotion,
  highlight,
}: {
  value: number;
  label: string;
  max: number;
  reduceMotion: boolean;
  highlight?: boolean;
}) {
  const text = pad2(value);
  const frac = max <= 0 ? 0 : value / max;

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2.5">
      <div
        className={
          highlight
            ? "relative w-full overflow-hidden rounded-[18px] bg-gradient-to-b from-white to-slate-50 px-2 py-4 shadow-sm ring-1 ring-teal-600/35 md:rounded-[22px] md:py-5 dark:from-zinc-800 dark:to-zinc-900 dark:ring-teal-400/40 dark:shadow-black/40"
            : "relative w-full overflow-hidden rounded-[18px] bg-gradient-to-b from-white to-slate-50 px-2 py-4 shadow-sm ring-1 ring-slate-900/8 md:rounded-[22px] md:py-5 dark:from-zinc-800 dark:to-zinc-900 dark:ring-white/10 dark:shadow-black/40"
        }
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/90 to-transparent dark:from-white/10"
        />

        <div
          dir="ltr"
          className="relative flex items-center justify-center text-[36px] font-bold leading-none tracking-tight md:text-[44px]"
          style={{ fontVariationSettings: "'wght' 750" }}
        >
          <FlipDigit
            value={text[0]!}
            reduceMotion={reduceMotion}
            accent={highlight}
          />
          <FlipDigit
            value={text[1]!}
            reduceMotion={reduceMotion}
            accent={highlight}
          />
        </div>

        <div
          className="relative mx-auto mt-3 h-[3px] w-[70%] overflow-hidden rounded-full bg-slate-900/8 dark:bg-white/10"
          aria-hidden
        >
          <motion.span
            className={
              highlight
                ? "absolute inset-y-0 start-0 rounded-full bg-gradient-to-l from-teal-500 to-teal-700 dark:from-teal-300 dark:to-teal-500"
                : "absolute inset-y-0 start-0 rounded-full bg-gradient-to-l from-slate-300 to-slate-400 dark:from-zinc-500 dark:to-zinc-600"
            }
            initial={false}
            animate={{ width: `${Math.max(4, frac * 100)}%` }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.85, ease: "easeOut" }
            }
          />
        </div>
      </div>

      <p className="text-[12px] font-medium text-slate-500 md:text-[13px] dark:text-zinc-400">
        {label}
      </p>
    </div>
  );
}

export type EventCountdownProps = {
  /** ISO string, timestamp, or Date — when the event starts. */
  target?: string | number | Date;
  title?: string;
  subtitle?: string;
};

export function EventCountdownForm({
  target,
  title = "تا شروع امتحان",
  subtitle = "۱۵ اردیبهشت · ساعت ۰۹:۰۰",
}: EventCountdownProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const fallbackTarget = useRef(defaultTargetMs());
  const targetMs = useMemo(() => {
    if (target == null) return fallbackTarget.current;
    if (target instanceof Date) return target.getTime();
    if (typeof target === "number") return target;
    const parsed = Date.parse(target);
    return Number.isFinite(parsed) ? parsed : fallbackTarget.current;
  }, [target]);

  const [now, setNow] = useState(() => Date.now());
  const parts = diffParts(targetMs, now);
  const ended = parts.totalMs <= 0;

  useEffect(() => {
    if (ended) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [ended]);

  return (
    <section
      aria-label={title}
      className="relative w-full max-w-[520px]"
      dir="rtl"
      lang="fa"
    >
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-b from-white via-slate-50 to-slate-100 px-5 py-8 shadow-[0_28px_56px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/6 md:rounded-[32px] md:px-8 md:py-10 dark:from-zinc-900 dark:via-zinc-950 dark:to-black dark:shadow-[0_28px_56px_rgba(0,0,0,0.45)] dark:ring-white/10">
        <span
          aria-hidden
          className="pointer-events-none absolute -start-16 top-0 size-48 rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.14)_0%,transparent_68%)] opacity-80 dark:opacity-50"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -end-10 bottom-0 size-40 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.12)_0%,transparent_70%)] opacity-70 dark:opacity-40"
        />

        <div className="relative" dir="rtl">
          <p className="text-start text-[12px] font-medium tracking-wide text-teal-700 dark:text-teal-300/90">
            شمارش معکوس
          </p>
          <div className="mt-1.5 flex flex-row items-baseline justify-between gap-3">
            <h2 className="min-w-0 text-start text-[22px] font-bold text-slate-900 md:text-[26px] dark:text-slate-50">
              {title}
            </h2>
            {subtitle ? (
              <p
                dir="rtl"
                className="shrink-0 text-end text-[13px] text-slate-500 md:text-[14px] dark:text-zinc-400"
              >
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>

        <div
          className="relative mt-8"
          role="timer"
          aria-live="polite"
          aria-atomic="true"
          aria-label={
            ended
              ? "زمان به پایان رسید"
              : `${toFaDigits(parts.days)} روز، ${toFaDigits(parts.hours)} ساعت، ${toFaDigits(parts.minutes)} دقیقه و ${toFaDigits(parts.seconds)} ثانیه مانده`
          }
        >
          {ended ? (
            <motion.div
              className="flex flex-col items-center py-6"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div
                className="flex size-16 items-center justify-center rounded-full bg-teal-500 shadow-[0_0_0_6px_rgba(20,184,166,0.18)] dark:bg-teal-500 dark:shadow-[0_0_0_6px_rgba(45,212,191,0.2)]"
                aria-hidden
              >
                <svg
                  viewBox="0 0 48 48"
                  className="size-9 text-white"
                  fill="none"
                >
                  <path
                    d="M12 24.5 L20.5 33 L36 15"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="mt-4 text-[20px] font-bold text-teal-700 dark:text-teal-300">
                شروع شد
              </p>
              <p className="mt-1 text-[13px] text-slate-500 dark:text-zinc-400">
                زمان رویداد فرا رسیده است
              </p>
            </motion.div>
          ) : (
            <div dir="ltr" className="flex items-stretch gap-2 md:gap-3">
              {UNITS.map((unit, i) => (
                <motion.div
                  key={unit.key}
                  className="min-w-0 flex-1"
                  initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.45,
                    delay: reduceMotion ? 0 : i * 0.06,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <UnitCard
                    value={parts[unit.key]}
                    label={unit.label}
                    max={
                      unit.key === "days"
                        ? Math.max(parts.days, 1)
                        : unit.max
                    }
                    reduceMotion={reduceMotion}
                    highlight={unit.key === "seconds"}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function EventCountdown(props: EventCountdownProps) {
  return (
    <div
      dir="rtl"
      lang="fa"
      className="flex h-full w-full items-center justify-center px-4 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <EventCountdownForm {...props} />
    </div>
  );
}
