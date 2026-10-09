"use client";

import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type TearStatus = "idle" | "dragging" | "torn";

const TEAR_THRESHOLD = 72;
const SNAP_BACK = { type: "spring" as const, stiffness: 520, damping: 38, mass: 0.55 };
const RESET_DELAY_MS = 2600;
const REDUCED_RESET_MS = 800;

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const PAPER = {
  backgroundColor: "#f6efe4",
  backgroundImage: [
    "radial-gradient(circle at 18% 22%, rgba(120,113,108,0.07) 0.45px, transparent 0.55px)",
    "radial-gradient(circle at 72% 68%, rgba(168,162,158,0.06) 0.4px, transparent 0.5px)",
    "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 42%, rgba(120,113,108,0.04) 100%)",
  ].join(", "),
  backgroundSize: "7px 7px, 11px 11px, 100% 100%",
} as const;

function Perforation() {
  return (
    <div aria-hidden className="flex w-full items-center justify-between px-4">
      {Array.from({ length: 22 }, (_, i) => (
        <span
          key={i}
          className="size-[5px] shrink-0 rounded-full bg-[#efe6d8] shadow-[inset_0_0_0_1px_rgba(87,83,78,0.22)]"
        />
      ))}
    </div>
  );
}

function SideNotch({ side }: { side: "start" | "end" }) {
  return (
    <div
      aria-hidden
      className={`absolute top-1/2 z-30 size-[22px] -translate-y-1/2 rounded-full bg-background shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)] ${
        side === "start" ? "-start-[11px]" : "-end-[11px]"
      }`}
    />
  );
}

function Barcode() {
  const widths = [1, 2, 1, 1, 3, 1, 2, 1, 1, 2, 3, 1, 1, 2, 1, 3, 1, 1, 2, 1, 2, 1, 1, 3, 1, 2, 1, 1];
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

function TicketShell({
  children,
  edge,
}: {
  children: ReactNode;
  edge: "top" | "bottom";
}) {
  const round =
    edge === "top" ? "rounded-t-[12px] border-b-0" : "rounded-b-[12px] border-t-0";
  return (
    <div
      className={`relative h-full overflow-hidden border border-[#d9d0c2] ${round}`}
      style={PAPER}
    >
      {/* left ink rail */}
      <div
        aria-hidden
        className="absolute inset-y-0 start-0 w-[7px] bg-gradient-to-b from-[#9f1239] via-[#be123c] to-[#7f1d1d]"
      />
      {/* subtle diagonal wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-8 -end-10 size-36 rotate-12 rounded-full bg-[#9f1239]/[0.05] blur-2xl"
      />
      {children}
    </div>
  );
}

function MainTicket() {
  const uid = useId().replace(/:/g, "");

  return (
    <TicketShell edge="top">
      <div className="relative flex h-full flex-col justify-between px-4 py-3.5 ps-5 md:px-5 md:py-4 md:ps-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="rounded-[3px] bg-[#9f1239] px-1.5 py-0.5 text-[9px] font-bold text-[#fff7ed]">
                زنده
              </span>
              <span className="text-[10px] font-medium text-stone-500">
                شب موسیقی · بهار ۱۴۰۴
              </span>
            </div>
            <h2 className="mt-1.5 truncate text-[19px] font-bold leading-none tracking-tight text-[#1c1917] md:text-[22px]">
              سالن رودکی
            </h2>
            <p className="mt-1 text-[11px] text-stone-500 md:text-[12px]">تهران · خیابان حافظ</p>
          </div>

          {/* admission stamp */}
          <div
            aria-hidden
            className="relative mt-0.5 flex size-[52px] shrink-0 items-center justify-center md:size-[60px]"
          >
            <svg className="absolute inset-0 size-full" viewBox="0 0 52 52" fill="none">
              <circle
                cx="26"
                cy="26"
                r="23"
                stroke="#9f1239"
                strokeOpacity="0.35"
                strokeWidth="1.4"
              />
              <circle
                cx="26"
                cy="26"
                r="18"
                stroke="#9f1239"
                strokeOpacity="0.28"
                strokeWidth="1"
                strokeDasharray="2 2.2"
              />
              <text
                x="26"
                y="28"
                textAnchor="middle"
                fill="#9f1239"
                fillOpacity="0.55"
                fontSize="8"
                fontWeight="700"
                style={{ fontFamily: "var(--font-estedad), Tahoma, Arial, sans-serif" }}
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
              <p className="text-[12px] font-semibold text-stone-700 md:text-[13px]">۲۲ فروردین</p>
            </div>
            <div>
              <p className="text-[9px] text-stone-400 md:text-[10px]">ساعت</p>
              <p className="text-[12px] font-semibold text-stone-700 md:text-[13px]">۲۱:۰۰</p>
            </div>
            <div>
              <p className="text-[9px] text-stone-400 md:text-[10px]">در</p>
              <p className="text-[12px] font-semibold text-stone-700 md:text-[13px]">غربی</p>
            </div>
          </div>
          <div className="text-end">
            <p className="text-[9px] text-stone-400 md:text-[10px]">صندلی</p>
            <p className="text-[15px] font-bold tabular-nums text-[#9f1239] md:text-[17px]">B‑۱۲</p>
          </div>
        </div>

        {/* micro serial */}
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-2 start-5 text-[8px] tracking-wider text-stone-400/80"
          id={uid}
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
            <span className="text-[10px] font-semibold text-stone-600">نیمهٔ ورود</span>
            <span className="rounded-[3px] border border-[#9f1239]/30 bg-[#9f1239]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#9f1239]">
              نگه دارید
            </span>
          </div>
          <div>
            <p className="text-[12px] font-bold text-stone-800">سالن رودکی · B‑۱۲</p>
            <p className="mt-0.5 text-[10px] text-stone-500">۲۲ فروردین · ۲۱:۰۰</p>
          </div>
          <p className="text-[9px] text-stone-400">پس از پاره کردن نزد خود نگه دارید</p>
        </div>

        <div className="flex w-[92px] shrink-0 flex-col items-center justify-between border-s border-dashed border-stone-300/90 ps-2.5">
          <Barcode />
          <span className="text-[8px] tracking-widest text-stone-400">۴۰۸۱۹۷۷</span>
          {/* fake qr */}
          <div
            aria-hidden
            className="grid size-9 grid-cols-5 gap-px rounded-[2px] bg-stone-200/40 p-0.5"
          >
            {Array.from({ length: 25 }, (_, i) => (
              <span
                key={i}
                className="rounded-[0.5px] bg-stone-800"
                style={{
                  opacity: [0, 4, 5, 8, 9, 12, 16, 20, 24].includes(i)
                    ? 0.95
                    : (i * 7) % 3 === 0
                      ? 0.75
                      : 0.15,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </TicketShell>
  );
}

export function TicketTearCard() {
  const reduceMotion = useReducedMotion() ?? false;
  const [status, setStatus] = useState<TearStatus>("idle");
  const [hint, setHint] = useState(true);
  const statusRef = useRef<TearStatus>("idle");
  const resetRef = useRef<number | null>(null);
  const animRef = useRef<{ stop: () => void } | null>(null);

  const pull = useMotionValue(0);
  const fade = useMotionValue(1);
  const spin = useMotionValue(0);

  const seamOpacity = useTransform(pull, [0, TEAR_THRESHOLD], [1, 0.15]);
  const edgeOpacity = useTransform(pull, [0, 12, TEAR_THRESHOLD], [0, 0.55, 1]);

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
    [clearReset, stopAnim]
  );

  const resetTicket = useCallback(() => {
    clearReset();
    stopAnim();
    pull.set(0);
    fade.set(1);
    spin.set(0);
    setHint(true);
    setStatusSafe("idle");
  }, [clearReset, fade, pull, setStatusSafe, spin, stopAnim]);

  const completeTear = useCallback(
    (fromY?: number) => {
      if (statusRef.current === "torn") return;
      setStatusSafe("torn");
      setHint(false);
      stopAnim();

      const start = fromY ?? pull.get();
      pull.set(start);

      if (reduceMotion) {
        pull.set(start + 72);
        fade.set(0);
        spin.set(6);
      } else {
        animRef.current = animate(pull, start + 170, {
          duration: 0.55,
          ease: [0.45, 0.05, 0.7, 1],
        });
        animate(fade, 0, { duration: 0.5, ease: EASE_OUT, delay: 0.08 });
        animate(spin, 11, { duration: 0.55, ease: EASE_OUT });
      }

      clearReset();
      resetRef.current = window.setTimeout(
        () => resetTicket(),
        reduceMotion ? REDUCED_RESET_MS : RESET_DELAY_MS
      );
    },
    [clearReset, fade, pull, reduceMotion, resetTicket, setStatusSafe, spin, stopAnim]
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
    if (y >= TEAR_THRESHOLD * 0.92) {
      completeTear(y);
      return;
    }
    setStatusSafe("idle");
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
      duration: 0.32,
      ease: EASE_OUT,
      onComplete: () => completeTear(TEAR_THRESHOLD),
    });
  }, [completeTear, pull, reduceMotion, setStatusSafe, stopAnim]);

  const canDrag = status !== "torn" && !reduceMotion;

  return (
    <section
      aria-label="بلیط جداشدنی از پرفراژ"
      className="relative flex h-[360px] w-full max-w-[340px] flex-col items-center justify-center md:h-[440px] md:max-w-[420px]"
      dir="rtl"
      lang="fa"
    >
      <div className="relative h-[300px] w-[300px] md:h-[380px] md:w-[400px]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-2 bottom-6 h-12 rounded-[100%] bg-stone-900/12 blur-lg"
        />

        <div
          className="absolute top-7 left-0 h-[188px] w-full md:top-8 md:h-[236px]"
          style={{
            filter: "drop-shadow(0 14px 28px rgba(28,25,23,0.14))",
          }}
        >
          <div className="absolute inset-x-0 top-0 h-1/2 overflow-hidden">
            <MainTicket />
            <motion.div
              aria-hidden
              className="absolute inset-x-0 bottom-0 z-10 h-0.5 bg-stone-400/50"
              style={{ opacity: edgeOpacity }}
            />
          </div>

          <motion.div
            className="absolute inset-x-0 top-1/2 z-10 h-1/2 touch-none will-change-transform"
            style={{
              y: pull,
              rotate: spin,
              opacity: fade,
            }}
            drag={canDrag ? "y" : false}
            dragConstraints={{ top: 0, bottom: TEAR_THRESHOLD }}
            dragElastic={0}
            dragMomentum={false}
            dragTransition={{ bounceStiffness: 600, bounceDamping: 40 }}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          >
            <div className="h-full cursor-grab active:cursor-grabbing">
              <StubTicket />
              <motion.div
                aria-hidden
                className="absolute inset-x-0 top-0 z-10 h-0.5 bg-stone-400/50"
                style={{ opacity: edgeOpacity }}
              />
            </div>
          </motion.div>

          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-1/2 z-20 -translate-y-1/2"
            style={{ opacity: seamOpacity }}
          >
            <Perforation />
          </motion.div>
          <SideNotch side="start" />
          <SideNotch side="end" />
        </div>
      </div>

      <div className="mt-2 flex flex-col items-center gap-2">
        <p
          className={`text-center text-[12px] text-stone-500 transition-opacity duration-200 ${
            hint && status === "idle" ? "opacity-100" : "opacity-0"
          }`}
        >
          نیمهٔ پایین را صاف به پایین بکش
        </p>
        <button
          type="button"
          className="rounded-md border border-b-4 border-stone-800 bg-stone-900 px-4 py-1.5 text-sm font-medium text-white outline-none transition-[transform,opacity] duration-200 hover:bg-stone-800 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
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
