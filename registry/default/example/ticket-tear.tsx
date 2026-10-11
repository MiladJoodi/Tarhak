"use client";

import { cn } from "@/lib/utils";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type TearStatus = "idle" | "dragging" | "torn";

const TEAR_THRESHOLD = 78;
const SNAP_BACK = {
  type: "spring" as const,
  stiffness: 480,
  damping: 34,
  mass: 0.6,
};
const RESET_DELAY_MS = 2800;
const REDUCED_RESET_MS = 900;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const DOT_COUNT = 24;

const PAPER = {
  backgroundColor: "#f4ebe0",
  backgroundImage: [
    "radial-gradient(circle at 14% 18%, rgba(90,70,50,0.08) 0.5px, transparent 0.55px)",
    "radial-gradient(circle at 78% 72%, rgba(120,90,60,0.06) 0.4px, transparent 0.5px)",
    "linear-gradient(165deg, rgba(255,255,255,0.42) 0%, transparent 38%, rgba(90,70,50,0.05) 100%)",
  ].join(", "),
  backgroundSize: "6px 6px, 10px 10px, 100% 100%",
} as const;

function Perforation({ progress }: { progress: MotionValue<number> }) {
  const dots = useMemo(
    () =>
      Array.from({ length: DOT_COUNT }, (_, i) => ({
        i,
        delay: i / (DOT_COUNT - 1),
      })),
    [],
  );

  return (
    <div aria-hidden className="flex w-full items-center justify-between px-3.5 md:px-5">
      {dots.map(({ i, delay }) => (
        <PerforationDot key={i} progress={progress} delay={delay} />
      ))}
    </div>
  );
}

function PerforationDot({
  progress,
  delay,
}: {
  progress: MotionValue<number>;
  delay: number;
}) {
  const scale = useTransform(progress, [delay * 0.55, delay * 0.55 + 0.35, 1], [1, 1.35, 0.2]);
  const opacity = useTransform(progress, [delay * 0.55, delay * 0.55 + 0.4, 1], [1, 0.85, 0.05]);

  return (
    <motion.span
      className="size-[5px] shrink-0 rounded-full bg-[#ebe2d4] shadow-[inset_0_0_0_1px_rgba(70,50,35,0.28)] md:size-[5.5px]"
      style={{ scale, opacity }}
    />
  );
}

function SideNotch({ side }: { side: "start" | "end" }) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute top-1/2 z-30 size-[22px] -translate-y-1/2 rounded-full",
        "bg-background shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]",
        side === "start" ? "-start-[11px]" : "-end-[11px]",
      )}
    />
  );
}

function Barcode() {
  const widths = [
    1, 2, 1, 1, 3, 1, 2, 1, 1, 2, 3, 1, 1, 2, 1, 3, 1, 1, 2, 1, 2, 1, 1, 3, 1, 2, 1, 1,
  ];
  return (
    <div className="flex h-9 items-end gap-px" aria-hidden>
      {widths.map((w, i) => (
        <span
          key={i}
          className="rounded-[0.5px] bg-stone-900/90"
          style={{
            width: w,
            height: `${22 + ((i * 13) % 12)}px`,
            opacity: i % 7 === 0 ? 0.55 : 0.92,
          }}
        />
      ))}
    </div>
  );
}

function MiniQr() {
  return (
    <div
      aria-hidden
      className="grid size-10 grid-cols-7 gap-px rounded-[3px] bg-[#ebe2d4] p-[3px] shadow-[inset_0_0_0_1px_rgba(70,50,35,0.12)]"
    >
      {Array.from({ length: 49 }, (_, i) => {
        const row = Math.floor(i / 7);
        const col = i % 7;
        const corner =
          (row < 3 && col < 3) ||
          (row < 3 && col > 3) ||
          (row > 3 && col < 3);
        const on =
          corner ||
          ((i * 17 + row * 3) % 5 === 0 && !(row === 3 || col === 3));
        return (
          <span
            key={i}
            className="rounded-[0.5px] bg-stone-900"
            style={{ opacity: on ? 0.9 : 0.08 }}
          />
        );
      })}
    </div>
  );
}

function TicketShell({
  children,
  edge,
  className,
}: {
  children: ReactNode;
  edge: "top" | "bottom";
  className?: string;
}) {
  const round =
    edge === "top" ? "rounded-t-[14px] border-b-0" : "rounded-b-[14px] border-t-0";
  return (
    <div
      className={cn(
        "relative h-full overflow-hidden border border-[#d6cbb8]",
        round,
        className,
      )}
      style={PAPER}
    >
      {/* Ink rail */}
      <div
        aria-hidden
        className="absolute inset-y-0 start-0 w-[8px] bg-gradient-to-b from-[#8b1230] via-[#b91c3c] to-[#6b0f24]"
      />
      <div
        aria-hidden
        className="absolute inset-y-0 start-[8px] w-px bg-[rgba(232,196,140,0.35)]"
      />
      {/* Warm wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -end-12 size-40 rotate-12 rounded-full bg-[#b91c3c]/[0.06] blur-2xl"
      />
      {/* Foil shimmer strip */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-3 end-3 w-[3px] rounded-full opacity-70"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(212,175,100,0.55), transparent)",
        }}
      />
      {children}
    </div>
  );
}

function TornFibers({ side }: { side: "top" | "bottom" }) {
  return (
    <svg
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 z-20 h-2.5 w-full text-[#c4b8a4]",
        side === "top" ? "top-0" : "bottom-0 rotate-180",
      )}
      viewBox="0 0 320 10"
      preserveAspectRatio="none"
    >
      <path
        d="M0 6 Q8 1 16 5 T32 4 T48 7 T64 3 T80 6 T96 2 T112 5 T128 3 T144 7 T160 4 T176 6 T192 2 T208 5 T224 3 T240 7 T256 4 T272 6 T288 3 T304 5 T320 4 L320 10 L0 10 Z"
        fill="currentColor"
        opacity="0.55"
      />
    </svg>
  );
}

function MainTicket() {
  return (
    <TicketShell edge="top">
      <div className="relative flex h-full flex-col justify-between px-4 py-3.5 ps-5 md:px-5 md:py-4 md:ps-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-[3px] bg-[#9f1239] px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-[#fff7ed]">
                زنده
              </span>
              <span className="text-[10px] font-medium text-stone-500">
                شب موسیقی · بهار ۱۴۰۴
              </span>
            </div>
            <h2 className="mt-1.5 truncate text-[19px] font-bold leading-none tracking-tight text-[#1c1917] md:text-[22px]">
              سالن رودکی
            </h2>
            <p className="mt-1 text-[11px] text-stone-500 md:text-[12px]">
              تهران · خیابان حافظ
            </p>
          </div>

          <div
            aria-hidden
            className="relative mt-0.5 flex size-[54px] shrink-0 items-center justify-center md:size-[62px]"
          >
            <svg className="absolute inset-0 size-full" viewBox="0 0 52 52" fill="none">
              <circle
                cx="26"
                cy="26"
                r="23"
                stroke="#b45309"
                strokeOpacity="0.45"
                strokeWidth="1.4"
              />
              <circle
                cx="26"
                cy="26"
                r="18"
                stroke="#9f1239"
                strokeOpacity="0.35"
                strokeWidth="1"
                strokeDasharray="2 2.2"
              />
              <text
                x="26"
                y="29"
                textAnchor="middle"
                fill="#9f1239"
                fillOpacity="0.7"
                fontSize="8.5"
                fontWeight="700"
                style={{
                  fontFamily: "var(--font-estedad), Tahoma, Arial, sans-serif",
                }}
              >
                ورود
              </text>
            </svg>
          </div>
        </div>

        <div className="flex items-end justify-between gap-3 border-t border-dashed border-stone-300/80 pt-2.5 md:pt-3">
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <div>
              <p className="text-[9px] text-stone-400 md:text-[10px]">تاریخ</p>
              <p className="text-[12px] font-semibold text-stone-700 md:text-[13px]">
                ۲۲ فروردین
              </p>
            </div>
            <div>
              <p className="text-[9px] text-stone-400 md:text-[10px]">ساعت</p>
              <p className="text-[12px] font-semibold text-stone-700 md:text-[13px]">
                ۲۱:۰۰
              </p>
            </div>
            <div>
              <p className="text-[9px] text-stone-400 md:text-[10px]">در</p>
              <p className="text-[12px] font-semibold text-stone-700 md:text-[13px]">
                غربی
              </p>
            </div>
          </div>
          <div className="text-end">
            <p className="text-[9px] text-stone-400 md:text-[10px]">صندلی</p>
            <p className="text-[15px] font-bold tabular-nums text-[#9f1239] md:text-[17px]">
              B‑۱۲
            </p>
          </div>
        </div>

        <span
          aria-hidden
          className="pointer-events-none absolute bottom-2 start-5 text-[8px] tracking-wider text-stone-400/80"
        >
          TK‑۴۰۸۱۹‑۷۷
        </span>
      </div>
    </TicketShell>
  );
}

function StubTicket() {
  return (
    <TicketShell edge="bottom">
      <div className="relative flex h-full items-stretch gap-3 px-3.5 py-3 ps-5 md:gap-4 md:px-4 md:py-3.5 md:ps-6">
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold text-stone-600">
              نیمهٔ ورود
            </span>
            <span className="rounded-[3px] border border-[#9f1239]/30 bg-[#9f1239]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#9f1239]">
              نگه دارید
            </span>
          </div>
          <div>
            <p className="text-[12px] font-bold text-stone-800">
              سالن رودکی · B‑۱۲
            </p>
            <p className="mt-0.5 text-[10px] text-stone-500">۲۲ فروردین · ۲۱:۰۰</p>
          </div>
          <p className="text-[9px] text-stone-400">
            پس از پاره کردن نزد خود نگه دارید
          </p>
        </div>

        <div className="flex w-[96px] shrink-0 flex-col items-center justify-between border-s border-dashed border-stone-300/90 ps-2.5">
          <Barcode />
          <span className="text-[8px] tracking-widest text-stone-400">۴۰۸۱۹۷۷</span>
          <MiniQr />
        </div>
      </div>
    </TicketShell>
  );
}

type Dust = { id: number; x: number; drift: number; size: number; delay: number };

function TearDust({ active }: { active: boolean }) {
  const bits = useMemo<Dust[]>(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        x: 8 + ((i * 17) % 84),
        drift: ((i % 5) - 2) * 18,
        size: 2 + (i % 3),
        delay: (i % 6) * 0.03,
      })),
    [],
  );

  if (!active) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-1/2 z-40 h-0"
    >
      {bits.map((b) => (
        <motion.span
          key={b.id}
          className="absolute rounded-[1px] bg-[#c4b8a4]"
          style={{
            left: `${b.x}%`,
            width: b.size,
            height: b.size * 0.7,
          }}
          initial={{ y: 0, x: 0, opacity: 0.9, rotate: 0 }}
          animate={{
            y: 48 + (b.id % 4) * 12,
            x: b.drift,
            opacity: 0,
            rotate: b.drift * 2,
          }}
          transition={{
            duration: 0.7,
            delay: b.delay,
            ease: EASE_OUT,
          }}
        />
      ))}
    </div>
  );
}

export type TicketTearCardProps = {
  className?: string;
};

export function TicketTearCard({ className }: TicketTearCardProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [status, setStatus] = useState<TearStatus>("idle");
  const [hint, setHint] = useState(true);
  const [showDust, setShowDust] = useState(false);
  const statusRef = useRef<TearStatus>("idle");
  const resetRef = useRef<number | null>(null);
  const animRef = useRef<{ stop: () => void } | null>(null);

  const pull = useMotionValue(0);
  const fade = useMotionValue(1);
  const spin = useMotionValue(0);
  const driftX = useMotionValue(0);
  const mainRecoil = useMotionValue(0);

  const progress = useTransform(pull, [0, TEAR_THRESHOLD], [0, 1]);
  const seamOpacity = useTransform(pull, [0, TEAR_THRESHOLD], [1, 0.08]);
  const edgeOpacity = useTransform(pull, [0, 10, TEAR_THRESHOLD], [0, 0.45, 1]);
  const stubRotate = useTransform(pull, [0, TEAR_THRESHOLD], [0, 2.2]);
  const stubSkew = useTransform(pull, [0, TEAR_THRESHOLD], [0, -1.2]);
  const mainLift = useTransform(
    [pull, mainRecoil],
    ([p, r]: number[]) => -Math.min(p, TEAR_THRESHOLD) * 0.04 + r,
  );
  const shadowGrow = useTransform(pull, [0, TEAR_THRESHOLD], [0.9, 1.25]);
  const shadowOpacity = useTransform(pull, [0, TEAR_THRESHOLD], [0.12, 0.22]);
  const gripHintY = useTransform(pull, [0, 24], [0, 6]);

  const setStatusSafe = useCallback((next: TearStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const stopAnim = useCallback(() => {
    animRef.current?.stop();
    animRef.current = null;
  }, []);

  const clearReset = useCallback(() => {
    if (resetRef.current !== null) {
      window.clearTimeout(resetRef.current);
      resetRef.current = null;
    }
  }, []);

  useEffect(
    () => () => {
      clearReset();
      stopAnim();
    },
    [clearReset, stopAnim],
  );

  const resetTicket = useCallback(() => {
    clearReset();
    stopAnim();
    pull.set(0);
    fade.set(1);
    spin.set(0);
    driftX.set(0);
    mainRecoil.set(0);
    setShowDust(false);
    setHint(true);
    setStatusSafe("idle");
  }, [
    clearReset,
    driftX,
    fade,
    mainRecoil,
    pull,
    setStatusSafe,
    spin,
    stopAnim,
  ]);

  const completeTear = useCallback(
    (fromY?: number) => {
      if (statusRef.current === "torn") return;
      setStatusSafe("torn");
      setHint(false);
      setShowDust(true);
      stopAnim();

      const start = fromY ?? pull.get();
      pull.set(start);

      if (reduceMotion) {
        pull.set(start + 80);
        fade.set(0);
        spin.set(8);
        driftX.set(16);
        mainRecoil.set(-4);
      } else {
        animRef.current = animate(pull, start + 210, {
          duration: 0.62,
          ease: [0.4, 0.02, 0.65, 1],
        });
        animate(fade, 0, { duration: 0.55, ease: EASE_OUT, delay: 0.1 });
        animate(spin, 14, { duration: 0.62, ease: EASE_OUT });
        animate(driftX, 28, { duration: 0.62, ease: EASE_OUT });
        animate(mainRecoil, [-6, 0], {
          duration: 0.45,
          ease: EASE_OUT,
        });
      }

      clearReset();
      resetRef.current = window.setTimeout(
        () => resetTicket(),
        reduceMotion ? REDUCED_RESET_MS : RESET_DELAY_MS,
      );
    },
    [
      clearReset,
      driftX,
      fade,
      mainRecoil,
      pull,
      reduceMotion,
      resetTicket,
      setStatusSafe,
      spin,
      stopAnim,
    ],
  );

  useMotionValueEvent(pull, "change", (y) => {
    if (statusRef.current !== "dragging") return;
    if (y >= TEAR_THRESHOLD) {
      completeTear(y);
    }
  });

  const onDragStart = useCallback(() => {
    if (statusRef.current === "torn") return;
    stopAnim();
    setHint(false);
    setStatusSafe("dragging");
  }, [setStatusSafe, stopAnim]);

  const onDragEnd = useCallback(() => {
    if (statusRef.current === "torn") return;
    const y = pull.get();
    if (y >= TEAR_THRESHOLD * 0.9) {
      completeTear(y);
      return;
    }
    setStatusSafe("idle");
    setHint(true);
    stopAnim();
    animRef.current = animate(pull, 0, SNAP_BACK);
  }, [completeTear, pull, setStatusSafe, stopAnim]);

  const tearWithClick = useCallback(() => {
    if (statusRef.current !== "idle") return;
    setHint(false);
    setStatusSafe("dragging");
    stopAnim();

    if (reduceMotion) {
      completeTear(TEAR_THRESHOLD);
      return;
    }

    animRef.current = animate(pull, TEAR_THRESHOLD, {
      duration: 0.34,
      ease: EASE_OUT,
      onComplete: () => completeTear(TEAR_THRESHOLD),
    });
  }, [completeTear, pull, reduceMotion, setStatusSafe, stopAnim]);

  const canDrag = status !== "torn" && !reduceMotion;

  const statusLabel =
    status === "torn"
      ? "جدا شد — چند لحظه بعد برمی‌گردد"
      : status === "dragging"
        ? "بیشتر بکش تا پاره شود"
        : "نیمهٔ پایین را صاف به پایین بکش";

  return (
    <section
      aria-label="بلیط جداشدنی از پرفراژ"
      className={cn(
        "relative flex h-[380px] w-full max-w-[360px] flex-col items-center justify-center md:h-[460px] md:max-w-[440px]",
        className,
      )}
      dir="rtl"
      lang="fa"
    >
      <div className="relative h-[310px] w-[300px] md:h-[390px] md:w-[400px]">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-4 bottom-5 h-11 rounded-[100%] bg-stone-900 blur-lg"
          style={{ scaleX: shadowGrow, opacity: shadowOpacity }}
        />

        <div className="absolute top-6 left-0 h-[200px] w-full md:top-7 md:h-[250px]">
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 overflow-hidden"
            style={{
              y: mainLift,
              filter: "drop-shadow(0 14px 28px rgba(28,25,23,0.14))",
            }}
          >
            <MainTicket />
            {status === "torn" ? <TornFibers side="bottom" /> : null}
            <motion.div
              aria-hidden
              className="absolute inset-x-0 bottom-0 z-10 h-px bg-stone-500/40"
              style={{ opacity: edgeOpacity }}
            />
          </motion.div>

          <motion.div
            className="absolute inset-x-0 top-1/2 z-10 h-1/2 touch-none will-change-transform"
            style={{
              y: pull,
              x: driftX,
              rotate: spin,
              opacity: fade,
              skewX: stubSkew,
            }}
            drag={canDrag ? "y" : false}
            dragConstraints={{ top: 0, bottom: TEAR_THRESHOLD }}
            dragElastic={0.04}
            dragMomentum={false}
            dragTransition={{ bounceStiffness: 600, bounceDamping: 40 }}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          >
            <div className="relative h-full cursor-grab active:cursor-grabbing">
              <motion.div
                className="h-full"
                style={{ rotate: status === "torn" ? 0 : stubRotate }}
              >
                {status === "torn" ? <TornFibers side="top" /> : null}
                <StubTicket />
              </motion.div>
              <motion.div
                aria-hidden
                className="absolute inset-x-0 top-0 z-10 h-px bg-stone-500/40"
                style={{ opacity: edgeOpacity }}
              />
              {/* Grip cue on stub */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center"
                style={{ y: gripHintY, opacity: seamOpacity }}
              >
                <span className="h-1 w-10 rounded-full bg-stone-400/35" />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-1/2 z-20 -translate-y-1/2"
            style={{ opacity: seamOpacity }}
          >
            <Perforation progress={progress} />
          </motion.div>

          <TearDust active={showDust && !reduceMotion} />

          <SideNotch side="start" />
          <SideNotch side="end" />
        </div>
      </div>

      <div className="mt-1 flex flex-col items-center gap-2.5">
        <p
          className={cn(
            "min-h-[1.25rem] text-center text-[12px] text-stone-500 transition-opacity duration-200",
            hint || status !== "idle" ? "opacity-100" : "opacity-0",
          )}
          aria-live="polite"
        >
          {statusLabel}
        </p>
        <button
          type="button"
          className={cn(
            "rounded-md border border-b-4 border-stone-800 bg-stone-900 px-4 py-1.5",
            "text-sm font-medium text-white outline-none",
            "transition-[transform,opacity] duration-200",
            "hover:bg-stone-800 active:scale-[0.97]",
            "focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
          disabled={status !== "idle"}
          onClick={tearWithClick}
          aria-label={
            status === "torn"
              ? "جدا شد"
              : status === "dragging"
                ? "در حال جدا شدن"
                : "جدا کردن بلیط"
          }
        >
          {status === "torn" ? "جدا شد" : "جدا کردن از پرفراژ"}
        </button>
      </div>
    </section>
  );
}

export default function TicketTear() {
  return (
    <div
      dir="rtl"
      lang="fa"
      className="flex h-full w-full items-center justify-center font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <TicketTearCard />
    </div>
  );
}
