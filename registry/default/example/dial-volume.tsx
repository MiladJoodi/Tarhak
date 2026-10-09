"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

const MIN_ANGLE = -135;
const MAX_ANGLE = 135;
const ANGLE_SPAN = MAX_ANGLE - MIN_ANGLE;
const START_VALUE = 48;
const SEGMENTS = 24;

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

function toFaDigits(value: string | number) {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)] ?? d);
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function valueToAngle(value: number) {
  return MIN_ANGLE + (clamp(value, 0, 100) / 100) * ANGLE_SPAN;
}

function angleToValue(angle: number) {
  return clamp(Math.round(((angle - MIN_ANGLE) / ANGLE_SPAN) * 100), 0, 100);
}

function pointerAngle(clientX: number, clientY: number, rect: DOMRect): number {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const rad = Math.atan2(clientY - cy, clientX - cx);
  let deg = (rad * 180) / Math.PI + 90;
  if (deg > 180) deg -= 360;
  if (deg < -180) deg += 360;
  return clamp(deg, MIN_ANGLE, MAX_ANGLE);
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(r: number, from: number, to: number) {
  const a = polar(100, 100, r, from);
  const b = polar(100, 100, r, to);
  const large = to - from > 180 ? 1 : 0;
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y}`;
}

function LightRing({ value, uid }: { value: number; uid: string }) {
  const lit = Math.round((value / 100) * SEGMENTS);
  const r = 86;
  const slot = ANGLE_SPAN / SEGMENTS;
  /** Equal LED block size (viewBox units). */
  const ledW = 4.2;
  const ledH = 8;
  const ledX = 100 - ledW / 2;
  const ledY = 100 - r - ledH / 2;

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full"
      viewBox="0 0 200 200"
    >
      <defs>
        <filter id={`${uid}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* recessed track */}
      <path
        d={arcPath(r, MIN_ANGLE, MAX_ANGLE)}
        fill="none"
        stroke="rgba(0,0,0,0.5)"
        strokeWidth="11"
        strokeLinecap="round"
      />

      {/* equal square LEDs — same size, same spacing */}
      {Array.from({ length: SEGMENTS }, (_, i) => {
        const mid = MIN_ANGLE + (i + 0.5) * slot;
        const on = i < lit;
        return (
          <rect
            key={i}
            x={ledX}
            y={ledY}
            width={ledW}
            height={ledH}
            rx={1.1}
            transform={`rotate(${mid} 100 100)`}
            fill={on ? "#f59e0b" : "rgba(68,64,60,0.85)"}
            opacity={on ? 1 : 0.7}
            filter={on ? `url(#${uid}-soft)` : undefined}
          />
        );
      })}
    </svg>
  );
}

function KnurledKnob({
  angle,
  active,
  reduceMotion,
}: {
  angle: number;
  active: boolean;
  reduceMotion: boolean;
}) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 size-[52%] -translate-x-1/2 -translate-y-1/2"
      animate={{
        rotate: angle,
        scale: active && !reduceMotion ? 0.97 : 1,
      }}
      transition={
        reduceMotion
          ? { duration: 0.01 }
          : active
            ? { duration: 0 }
            : { type: "spring", stiffness: 420, damping: 34 }
      }
    >
      {/* side thickness */}
      <div
        aria-hidden
        className="absolute inset-[-3px] rounded-full"
        style={{
          background:
            "linear-gradient(160deg, #57534e 0%, #1c1917 45%, #0c0a09 100%)",
          boxShadow: "0 14px 28px rgba(0,0,0,0.45)",
        }}
      />

      <div
        className="relative size-full overflow-hidden rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, #d6d3d1 0deg, #78716c 28deg, #e7e5e4 55deg, #57534e 90deg, #a8a29e 130deg, #44403c 170deg, #f5f5f4 210deg, #78716c 250deg, #d6d3d1 290deg, #57534e 330deg, #d6d3d1 360deg)",
          boxShadow:
            "inset 0 3px 5px rgba(255,255,255,0.45), inset 0 -6px 12px rgba(0,0,0,0.4)",
        }}
      >
        {/* knurl lines */}
        <svg aria-hidden className="absolute inset-0 size-full" viewBox="0 0 100 100">
          {Array.from({ length: 36 }, (_, i) => (
            <line
              key={i}
              x1="50"
              y1="6"
              x2="50"
              y2="15"
              stroke="rgba(28,25,23,0.35)"
              strokeWidth="1.4"
              strokeLinecap="round"
              transform={`rotate(${i * 10} 50 50)`}
            />
          ))}
        </svg>

        {/* face disc */}
        <div
          className="absolute inset-[16%] rounded-full"
          style={{
            background:
              "radial-gradient(circle at 34% 28%, #fafaf9 0%, #a8a29e 38%, #57534e 72%, #292524 100%)",
            boxShadow:
              "inset 0 2px 3px rgba(255,255,255,0.5), inset 0 -4px 8px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.2)",
          }}
        />

        {/* pointer blade */}
        <div
          aria-hidden
          className="absolute left-1/2 top-[7%] z-10 h-[28%] w-[8px] -translate-x-1/2"
          style={{
            background:
              "linear-gradient(180deg, #fff7ed 0%, #fb923c 40%, #c2410c 100%)",
            borderRadius: "4px 4px 2px 2px",
            boxShadow:
              "0 0 14px rgba(251,146,60,0.75), 0 2px 3px rgba(0,0,0,0.4)",
            clipPath: "polygon(20% 0, 80% 0, 100% 100%, 0 100%)",
          }}
        />

        {/* center jewel */}
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 z-10 size-[22%] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, #ffedd5 0%, #ea580c 55%, #7c2d12 100%)",
            boxShadow:
              "0 0 10px rgba(234,88,12,0.45), inset 0 1px 2px rgba(255,255,255,0.45)",
          }}
        />
      </div>
    </motion.div>
  );
}

export function DialVolumeControl() {
  const uid = useId().replace(/:/g, "");
  const reduceMotion = useReducedMotion() ?? false;
  const dialRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [value, setValue] = useState(START_VALUE);
  const [active, setActive] = useState(false);

  const angle = valueToAngle(value);
  const bulge = 0.25 + (value / 100) * 0.85;

  const setFromPointer = useCallback((clientX: number, clientY: number) => {
    const el = dialRef.current;
    if (!el) return;
    setValue(angleToValue(pointerAngle(clientX, clientY, el.getBoundingClientRect())));
  }, []);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      dragging.current = true;
      setActive(true);
      setFromPointer(e.clientX, e.clientY);
    },
    [setFromPointer]
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragging.current) return;
      setFromPointer(e.clientX, e.clientY);
    },
    [setFromPointer]
  );

  const onPointerUp = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    setActive(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  }, []);

  const nudge = useCallback((delta: number) => {
    setValue((v) => clamp(v + delta, 0, 100));
  }, []);

  useEffect(() => {
    return () => {
      dragging.current = false;
    };
  }, []);

  return (
    <section
      aria-label="ولوم چرخشی"
      className="relative flex w-full max-w-[420px] flex-col items-center justify-center px-2 py-4 md:max-w-[460px]"
      dir="rtl"
      lang="fa"
    >
      {/* chassis plate */}
      <div
        className="relative w-full overflow-hidden rounded-[28px] px-5 pb-6 pt-5 md:px-7 md:pb-7 md:pt-6"
        style={{
          background:
            "linear-gradient(165deg, #3f3f46 0%, #27272a 38%, #18181b 100%)",
          boxShadow:
            "0 28px 50px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.4)",
        }}
      >
        {/* brushed metal lines */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0 1px, rgba(255,255,255,0.5) 1px 2px)",
            backgroundSize: "3px 100%",
            maskImage:
              "radial-gradient(ellipse at 50% 40%, black 20%, transparent 75%)",
          }}
        />

        {/* header row */}
        <div className="relative z-[1] mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold tracking-wide text-stone-400 md:text-[11px]">
              کانال اصلی
            </p>
            <h2 className="mt-0.5 text-[18px] font-bold text-stone-100 md:text-[20px]">
              ولوم
            </h2>
          </div>

          {/* analog readout window */}
          <div
            className="min-w-[92px] rounded-xl px-3 py-2 text-end md:min-w-[108px]"
            style={{
              background:
                "linear-gradient(180deg, #0c0a09 0%, #1c1917 100%)",
              boxShadow:
                "inset 0 2px 6px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            <p className="text-[9px] text-amber-700/90">سطح</p>
            <p
              className="mt-0.5 text-[26px] font-bold leading-none tabular-nums text-amber-300 md:text-[30px]"
              style={{
                textShadow: `0 0 ${6 + value * 0.08}px rgba(251,191,36,${0.25 + value * 0.004})`,
              }}
              aria-live="polite"
            >
              <span dir="ltr" data-fa-num className="fa-num">
                {toFaDigits(value)}
              </span>
              <span className="ms-0.5 text-[13px] font-semibold text-amber-600/90">
                ٪
              </span>
            </p>
          </div>
        </div>

        {/* recessed well */}
        <div
          className="relative mx-auto flex items-center justify-center rounded-full p-3 md:p-4"
          style={{
            width: "min(100%, 280px)",
            aspectRatio: "1",
            background:
              "radial-gradient(circle at 50% 42%, #1c1917 0%, #0c0a09 62%, #000 100%)",
            boxShadow:
              "inset 0 10px 24px rgba(0,0,0,0.75), inset 0 -2px 0 rgba(255,255,255,0.04), 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {/* light bulge behind the ring */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 size-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            animate={{
              opacity: reduceMotion ? bulge * 0.65 : bulge,
              scale: reduceMotion ? 1 : 0.92 + (value / 100) * 0.12,
            }}
            transition={
              reduceMotion
                ? { duration: 0.01 }
                : { type: "spring", stiffness: 260, damping: 22 }
            }
            style={{
              background:
                "radial-gradient(circle at 50% 48%, rgba(251,146,60,0.55) 0%, rgba(234,88,12,0.18) 38%, transparent 68%)",
              filter: "blur(2px)",
            }}
          />

          <div
            ref={dialRef}
            role="slider"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={value}
            aria-valuetext={`${toFaDigits(value)} درصد`}
            aria-label="ولوم"
            tabIndex={0}
            className="relative size-full touch-none select-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
            style={{ cursor: active ? "grabbing" : "grab" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                e.preventDefault();
                nudge(-e.shiftKey ? 10 : 2);
              } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                e.preventDefault();
                nudge(e.shiftKey ? 10 : 2);
              } else if (e.key === "Home") {
                e.preventDefault();
                setValue(0);
              } else if (e.key === "End") {
                e.preventDefault();
                setValue(100);
              }
            }}
          >
            <LightRing uid={uid} value={value} />
            <KnurledKnob
              active={active}
              angle={angle}
              reduceMotion={reduceMotion}
            />

            {/* 0 at -135° (left) · 100 at +135° (right); RTL start=right */}
            <span className="pointer-events-none absolute bottom-[11%] end-[10%] text-[10px] font-bold text-stone-500">
              کم
            </span>
            <span className="pointer-events-none absolute bottom-[11%] start-[10%] text-[10px] font-bold text-amber-600/80">
              زیاد
            </span>
          </div>
        </div>

        <p className="relative z-[1] mt-4 text-center text-[11px] text-stone-500 md:text-[12px]">
          بچرخان · کلیدهای جهت هم کار می‌کنند
        </p>
      </div>
    </section>
  );
}

export default function DialVolume() {
  return (
    <div
      dir="rtl"
      lang="fa"
      className="flex h-full w-full items-center justify-center font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <DialVolumeControl />
    </div>
  );
}
