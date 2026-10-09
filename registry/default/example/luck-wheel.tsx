"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

function toFaDigits(value: string | number) {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)] ?? d);
}

type Slice = {
  id: string;
  label: string;
  color: string;
  ink: string;
  kind: "win" | "boost" | "miss";
};

type SpeedId = "slow" | "normal" | "fast";

type SpeedConfig = {
  label: string;
  spins: [number, number];
  duration: number;
};

/**
 * فیزیک طبیعی چرخ:
 * زمان کم → شتاب تا اوج سرعت
 * بیشترِ زمان → ترمز نرم و طولانی تا ایست کامل
 * (بخش زیادی از زاویه زود طی می‌شود؛ ته مسیر آروم سر می‌خورد)
 */
const SPEEDS: Record<SpeedId, SpeedConfig> = {
  slow: {
    label: "آرام",
    spins: [3, 4],
    duration: 15,
  },
  normal: {
    label: "عادی",
    spins: [8, 10],
    duration: 12,
  },
  fast: {
    label: "سریع",
    spins: [18, 22],
    duration: 10,
  },
};

/** گاز کوتاه */
const EASE_GAS: [number, number, number, number] = [0.4, 0.0, 0.75, 0.35];
/** ورود به ترمز */
const EASE_PEAK: [number, number, number, number] = [0.2, 0.15, 0.4, 0.8];
/** ترمز خیلی نرم — آروم‌آروم تا ایست کامل */
const EASE_BRAKE: [number, number, number, number] = [0.02, 0.96, 0.05, 1];

/** ۱۶ خانه — شلوغ مثل چرخ شرط‌بندی */
const SLICES: Slice[] = [
  { id: "x2", label: "×۲", color: "#9f1239", ink: "#ffe4e6", kind: "boost" },
  { id: "m1", label: "خالی", color: "#0a0a0c", ink: "#71717a", kind: "miss" },
  { id: "x5", label: "×۵", color: "#b45309", ink: "#fffbeb", kind: "boost" },
  { id: "x7", label: "×۷", color: "#881337", ink: "#fecdd3", kind: "boost" },
  { id: "jack", label: "جک‌پات", color: "#ca8a04", ink: "#1c1917", kind: "win" },
  { id: "m2", label: "خالی", color: "#111113", ink: "#52525b", kind: "miss" },
  { id: "x10", label: "×۱۰", color: "#be123c", ink: "#fff1f2", kind: "boost" },
  { id: "x3", label: "×۳", color: "#171717", ink: "#e4e4e7", kind: "boost" },
  { id: "x15", label: "×۱۵", color: "#a16207", ink: "#fef3c7", kind: "boost" },
  { id: "m3", label: "خالی", color: "#09090b", ink: "#52525b", kind: "miss" },
  { id: "x20", label: "×۲۰", color: "#e11d48", ink: "#fff1f2", kind: "boost" },
  { id: "x4", label: "×۴", color: "#1c1917", ink: "#d4d4d8", kind: "boost" },
  { id: "mega", label: "مگا", color: "#f59e0b", ink: "#422006", kind: "win" },
  { id: "m4", label: "خالی", color: "#0c0c0e", ink: "#71717a", kind: "miss" },
  { id: "x8", label: "×۸", color: "#9f1239", ink: "#fecdd3", kind: "boost" },
  { id: "x50", label: "×۵۰", color: "#fbbf24", ink: "#422006", kind: "win" },
];

const N = SLICES.length;
const SEG = 360 / N;
const CX = 180;
const CY = 180;
const R_OUTER = 170;
const R_LABEL = 112;
const R_INNER = 48;
const BULB_COUNT = 36;

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(i: number) {
  const a0 = i * SEG;
  const a1 = (i + 1) * SEG;
  const p0 = polar(CX, CY, R_OUTER, a0);
  const p1 = polar(CX, CY, R_OUTER, a1);
  return `M ${CX} ${CY} L ${p0.x} ${p0.y} A ${R_OUTER} ${R_OUTER} 0 0 1 ${p1.x} ${p1.y} Z`;
}

function labelPos(i: number) {
  const mid = i * SEG + SEG / 2;
  const rot = mid > 90 && mid < 270 ? mid + 180 : mid;
  return { ...polar(CX, CY, R_LABEL, mid), rot };
}

function indexFromRotation(rotation: number) {
  const normalized = ((rotation % 360) + 360) % 360;
  const theta = (360 - normalized) % 360;
  return Math.floor(theta / SEG) % N;
}

function targetRotationForIndex(current: number, index: number, spins: number) {
  const sliceCenter = index * SEG + SEG / 2;
  const land = (360 - sliceCenter + 360) % 360;
  const jitter = (Math.random() - 0.5) * (SEG * 0.3);
  // Always move forward from current angle (no ceil jump).
  const currentMod = ((current % 360) + 360) % 360;
  let delta = (land - currentMod + 360) % 360;
  delta += spins * 360 + jitter;
  return current + delta;
}

function randInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

const SPARKS = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: 8 + ((i * 17) % 84),
  top: 6 + ((i * 23) % 78),
  delay: (i % 7) * 0.18,
  size: 3 + (i % 4),
}));

export function LuckWheelForm() {
  const uid = useId().replace(/:/g, "");
  const reduceMotion = useReducedMotion() ?? false;
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Slice | null>(null);
  const [speed, setSpeed] = useState<SpeedId>("normal");
  const [tick, setTick] = useState(0);
  /**
   * ۴ نقطهٔ مسیر:
   * from → گاز → اوج → ترمز طولانی تا land
   */
  const [rotateAnim, setRotateAnim] = useState<number | number[]>(0);
  const [spinTween, setSpinTween] = useState<{
    duration: number;
    times?: number[];
    ease:
      | "easeOut"
      | [number, number, number, number]
      | Array<[number, number, number, number] | "easeOut">;
  }>({ duration: 0, ease: "easeOut" });
  const rotRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!spinning || reduceMotion) return;
    const gap = speed === "fast" ? 40 : speed === "slow" ? 120 : 70;
    const id = window.setInterval(() => setTick((t) => t + 1), gap);
    return () => window.clearInterval(id);
  }, [spinning, reduceMotion, speed]);

  const spin = useCallback(() => {
    if (spinning) return;
    setResult(null);
    setSpinning(true);

    const cfg = SPEEDS[speed];
    const winIndex = Math.floor(Math.random() * N);
    const [sMin, sMax] = cfg.spins;
    const spins = reduceMotion ? 1 : randInt(sMin, sMax);
    const from = rotRef.current;
    const next = targetRotationForIndex(from, winIndex, spins);
    const duration = reduceMotion ? 0.9 : cfg.duration;
    const d = next - from;

    // زاویه: بیشترش زود؛ ته مسیر خیلی کم برای آروم‌آروم ایستادن
    const pGas = from + d * 0.22;
    const pPeak = from + d * 0.52;
    // زمان: گاز کوتاه، بیشترِ زمان فقط ترمز نرم
    const tGas = 0.07;
    const tPeak = 0.16;

    rotRef.current = next;
    setSpinTween({
      duration,
      times: reduceMotion ? [0, 0.4, 1] : [0, tGas, tPeak, 1],
      ease: reduceMotion
        ? ["easeOut", "easeOut"]
        : [EASE_GAS, EASE_PEAK, EASE_BRAKE],
    });
    setRotateAnim(
      reduceMotion ? [from, pPeak, next] : [from, pGas, pPeak, next]
    );
    setRotation(next);

    if (timerRef.current != null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setSpinning(false);
      setRotateAnim(next);
      setResult(SLICES[indexFromRotation(next)]!);
    }, duration * 1000 + 80);
  }, [reduceMotion, speed, spinning]);

  const bulbs = useMemo(
    () =>
      Array.from({ length: BULB_COUNT }, (_, i) => {
        const deg = (i / BULB_COUNT) * 360;
        return { i, ...polar(50, 50, 48.4, deg) };
      }),
    []
  );

  return (
    <section
      aria-label="چرخ شانس"
      className="relative flex w-full max-w-[560px] flex-col items-center"
      dir="rtl"
      lang="fa"
    >
      <div
        className="relative w-full overflow-hidden rounded-[36px] px-4 pb-8 pt-6 md:px-7 md:pb-9 md:pt-7"
        style={{
          background:
            "radial-gradient(130% 100% at 50% -10%, #166534 0%, #14532d 28%, #052e16 55%, #020617 100%)",
          boxShadow:
            "0 48px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -28px 50px rgba(0,0,0,0.4)",
        }}
      >
        {/* magical atmosphere */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 12%, rgba(250,204,21,0.22), transparent 32%), radial-gradient(circle at 88% 18%, rgba(244,63,94,0.18), transparent 36%), radial-gradient(circle at 50% 100%, rgba(52,211,153,0.12), transparent 40%)",
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent 0 2px, rgba(255,255,255,0.4) 2px 3px)",
          }}
        />

        {/* floating sparks */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          {SPARKS.map((s) => (
            <motion.span
              key={s.id}
              className="absolute rounded-full bg-amber-200"
              style={{
                left: `${s.left}%`,
                top: `${s.top}%`,
                width: s.size,
                height: s.size,
                boxShadow: "0 0 8px rgba(253,224,71,0.8)",
              }}
              animate={
                reduceMotion
                  ? { opacity: 0.35 }
                  : {
                      opacity: [0.15, 0.9, 0.2],
                      y: [0, -10, 0],
                      scale: [0.8, 1.25, 0.85],
                    }
              }
              transition={{
                duration: 2.4 + s.delay,
                repeat: Infinity,
                delay: s.delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* corner chips */}
        {(
          [
            "pointer-events-none absolute -start-3 top-4 size-10 rounded-full opacity-80 md:size-12",
            "pointer-events-none absolute -end-3 top-4 size-10 rounded-full opacity-80 md:size-12",
            "pointer-events-none absolute -start-2 bottom-10 size-10 rounded-full opacity-80 md:size-12",
            "pointer-events-none absolute -end-2 bottom-10 size-10 rounded-full opacity-80 md:size-12",
          ] as const
        ).map((cls, i) => (
          <span
            key={cls}
            aria-hidden
            className={cls}
            style={{
              background:
                i % 2 === 0
                  ? "radial-gradient(circle at 35% 30%, #fde68a, #b45309 60%, #713f12)"
                  : "radial-gradient(circle at 35% 30%, #fecdd3, #be123c 55%, #4c0519)",
              boxShadow:
                "0 6px 14px rgba(0,0,0,0.45), inset 0 1px 2px rgba(255,255,255,0.4)",
              transform: `rotate(${i * 18}deg)`,
            }}
          />
        ))}

        <div className="relative mb-4 flex flex-col items-center gap-3 text-center md:mb-5">
          <div>
            <p className="text-[11px] font-bold text-amber-200/85" style={{ letterSpacing: "0.22em" }}>
              CASINO SPIN
            </p>
            <h2 className="mt-1 text-[24px] font-black text-amber-50 drop-shadow md:text-[28px]">
              چرخ شانس
            </h2>
          </div>

          {/* speed picker */}
          <div
            role="group"
            aria-label="سرعت چرخش"
            className="flex items-center gap-1 rounded-full p-1"
            style={{
              background: "rgba(0,0,0,0.35)",
              boxShadow: "inset 0 0 0 1px rgba(250,204,21,0.2)",
            }}
          >
            {(Object.keys(SPEEDS) as SpeedId[]).map((id) => {
              const active = speed === id;
              return (
                <button
                  key={id}
                  type="button"
                  disabled={spinning}
                  onClick={() => setSpeed(id)}
                  className="rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-colors disabled:opacity-50 md:px-4"
                  style={
                    active
                      ? {
                          background:
                            "linear-gradient(180deg, #fde68a 0%, #d97706 100%)",
                          color: "#422006",
                          boxShadow: "0 2px 8px rgba(234,179,8,0.4)",
                        }
                      : { color: "rgba(254,243,199,0.65)" }
                  }
                >
                  {SPEEDS[id].label}
                </button>
              );
            })}
          </div>
        </div>

        {/* aura behind wheel */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[42%] size-[88%] -translate-x-1/2 -translate-y-1/2 rounded-full md:top-[44%]"
          style={{
            background:
              "radial-gradient(circle, rgba(250,204,21,0.28) 0%, rgba(244,63,94,0.12) 40%, transparent 68%)",
          }}
          animate={
            spinning && !reduceMotion
              ? { opacity: [0.45, 0.9, 0.5], scale: [0.96, 1.04, 0.98] }
              : { opacity: 0.4, scale: 1 }
          }
          transition={{ duration: 1.1, repeat: spinning ? Infinity : 0, ease: "easeInOut" }}
        />

        <div className="relative mx-auto aspect-square w-full max-w-[420px] md:max-w-[460px]">
          {/* bulb ring */}
          <div className="absolute inset-0" aria-hidden>
            {bulbs.map(({ i, x, y }) => {
              const lit = spinning
                ? (i + tick) % 4 !== 0
                : i % 3 === 0;
              const hot = spinning && (i + tick) % 6 === 0;
              return (
                <span
                  key={i}
                  className="absolute size-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full md:size-[8px]"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    background: hot ? "#fff7ed" : lit ? "#fde047" : "#78350f",
                    boxShadow: lit
                      ? "0 0 12px rgba(250,204,21,0.95), 0 0 3px #fff"
                      : "inset 0 1px 1px rgba(255,255,255,0.2)",
                    opacity: lit ? 1 : 0.55,
                  }}
                />
              );
            })}
          </div>

          {/* gold bezel */}
          <div
            className="absolute inset-[3.8%] rounded-full"
            style={{
              background:
                "conic-gradient(from 20deg, #713f12, #fef08a, #b45309, #fffbeb, #854d0e, #facc15, #78350f, #fde68a, #713f12)",
              boxShadow:
                "0 0 0 3px rgba(0,0,0,0.55), 0 22px 48px rgba(0,0,0,0.6), inset 0 3px 6px rgba(255,255,255,0.4)",
            }}
          />
          <div
            className="absolute inset-[7.2%] rounded-full"
            style={{
              background: "#030303",
              boxShadow: "inset 0 0 28px rgba(0,0,0,0.9)",
            }}
          />

          {/* spinning disc */}
          <motion.div
            className="absolute inset-[8.6%]"
            animate={{ rotate: rotateAnim }}
            transition={{
              duration: spinTween.duration,
              times: spinTween.times,
              ease: spinTween.ease,
            }}
            style={{ transformOrigin: "50% 50%" }}
          >
            <svg viewBox="0 0 360 360" className="size-full">
              <defs>
                <radialGradient id={`${uid}-shine`} cx="30%" cy="25%" r="75%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
                  <stop offset="45%" stopColor="rgba(255,255,255,0)" />
                </radialGradient>
                <filter id={`${uid}-glow`}>
                  <feGaussianBlur stdDeviation="1.2" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {SLICES.map((s, i) => (
                <path
                  key={s.id}
                  d={slicePath(i)}
                  fill={s.color}
                  stroke="rgba(250,204,21,0.4)"
                  strokeWidth="1.1"
                />
              ))}

              {/* gloss overlay */}
              <circle cx={CX} cy={CY} r={R_OUTER} fill={`url(#${uid}-shine)`} />

              {SLICES.map((_, i) => {
                const a = i * SEG;
                const outer = polar(CX, CY, R_OUTER, a);
                const inner = polar(CX, CY, R_INNER, a);
                return (
                  <line
                    key={`t-${i}`}
                    x1={inner.x}
                    y1={inner.y}
                    x2={outer.x}
                    y2={outer.y}
                    stroke="rgba(253,230,138,0.5)"
                    strokeWidth="1.6"
                  />
                );
              })}

              {/* decorative pips near rim */}
              {SLICES.map((_, i) => {
                const mid = i * SEG + SEG / 2;
                const p = polar(CX, CY, 156, mid);
                return (
                  <circle
                    key={`p-${i}`}
                    cx={p.x}
                    cy={p.y}
                    r="2.4"
                    fill="#fde68a"
                    opacity="0.75"
                  />
                );
              })}

              {SLICES.map((s, i) => {
                const p = labelPos(i);
                const big = s.kind === "win";
                return (
                  <g
                    key={`l-${s.id}`}
                    transform={`translate(${p.x}, ${p.y}) rotate(${p.rot})`}
                    filter={big ? `url(#${uid}-glow)` : undefined}
                  >
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={s.ink}
                      fontSize={big ? 13 : 15}
                      fontWeight={800}
                      style={{
                        fontFamily:
                          "var(--font-estedad), Tahoma, Arial, sans-serif",
                      }}
                    >
                      {toFaDigits(s.label)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </motion.div>

          {/* center hub */}
          <button
            type="button"
            onClick={spin}
            disabled={spinning}
            aria-label={spinning ? "در حال چرخش" : "چرخاندن چرخ شانس"}
            className="absolute left-1/2 top-1/2 z-20 flex size-[20%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full disabled:cursor-wait"
            style={{
              background:
                "radial-gradient(circle at 32% 28%, #fffbeb 0%, #facc15 38%, #a16207 78%, #713f12 100%)",
              boxShadow:
                "0 0 0 5px rgba(0,0,0,0.55), 0 0 0 8px rgba(250,204,21,0.4), 0 0 40px rgba(250,204,21,0.35), 0 12px 28px rgba(0,0,0,0.55), inset 0 2px 4px rgba(255,255,255,0.6)",
            }}
          >
            <span className="text-[12px] font-black leading-none text-amber-950 md:text-[13px]">
              {spinning ? "…" : "بچرخان"}
            </span>
          </button>

          {/* ornate pointer */}
          <div
            className="pointer-events-none absolute left-1/2 top-[-2%] z-30 -translate-x-1/2"
            aria-hidden
          >
            <div
              className="relative h-[52px] w-[44px]"
              style={{ filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.65))" }}
            >
              <svg viewBox="0 0 44 54" className="size-full">
                <defs>
                  <linearGradient id={`${uid}-needle`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fffbeb" />
                    <stop offset="40%" stopColor="#facc15" />
                    <stop offset="100%" stopColor="#92400e" />
                  </linearGradient>
                </defs>
                <path
                  d="M22 52 L4 10 Q22 18 40 10 Z"
                  fill={`url(#${uid}-needle)`}
                  stroke="#78350f"
                  strokeWidth="1.4"
                />
                <circle
                  cx="22"
                  cy="12"
                  r="7"
                  fill="#fef3c7"
                  stroke="#854d0e"
                  strokeWidth="2"
                />
                <circle cx="22" cy="12" r="2.5" fill="#b45309" />
              </svg>
            </div>
          </div>
        </div>

        {/* result */}
        <div className="relative mt-6 flex min-h-[56px] items-center justify-center">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key={result.id + String(rotation)}
                initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
                className="flex items-center gap-2 rounded-full px-6 py-2.5"
                style={{
                  background:
                    result.kind === "miss"
                      ? "linear-gradient(90deg, rgba(24,24,27,0.92), rgba(39,39,42,0.95))"
                      : "linear-gradient(90deg, #78350f, #eab308, #78350f)",
                  boxShadow:
                    result.kind === "miss"
                      ? "0 0 0 1px rgba(255,255,255,0.1)"
                      : "0 0 0 1px rgba(253,224,71,0.55), 0 0 36px rgba(234,179,8,0.45)",
                }}
              >
                <span
                  className={
                    result.kind === "miss"
                      ? "text-[15px] font-bold text-zinc-300"
                      : "text-[16px] font-black text-amber-50"
                  }
                >
                  {result.kind === "miss"
                    ? "این دور خالی بود"
                    : result.kind === "win"
                      ? `برد بزرگ — ${toFaDigits(result.label)}`
                      : `بردی — ${toFaDigits(result.label)}`}
                </span>
              </motion.div>
            ) : (
              <motion.p
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[13px] text-emerald-100/60"
              >
                {spinning
                  ? `چرخش ${SPEEDS[speed].label}…`
                  : "سرعت را بزن، بعد بچرخان"}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default function LuckWheel() {
  return (
    <div
      dir="rtl"
      lang="fa"
      className="flex h-full w-full items-center justify-center px-3 py-6 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal md:px-4"
    >
      <LuckWheelForm />
    </div>
  );
}
