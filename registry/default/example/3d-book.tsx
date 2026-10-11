"use client";

import { cn } from "@/lib/utils";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import * as React from "react";

const TOTAL_PAGES = 14;
const COVER_OPEN = 168;
const PAGE_OPEN_MAX = 158;
const PAGE_OPEN_MIN = 18;

const SPRING_FOLLOW = { stiffness: 160, damping: 24, mass: 0.72 };
const SPRING_SNAP = { stiffness: 420, damping: 36, mass: 0.45 };

const PAGE_INK = [
  "از پنجرهٔ اتاق نور عصر می‌ریخت روی میز.",
  "یک خط کوتاه؛ بعد دوباره سکوت کاغذ.",
  "یادداشت‌هایی که هنوز جمع‌شان نکرده‌ام.",
  "تاریخ را با مداد نرم نوشتم تا بماند.",
  "صبح زود، قبل از اینکه شهر بیدار شود.",
  "لیست کارها: تمام‌نشده، ولی نزدیک.",
  "صدای ورق خوردن از همه چیز واضح‌تر بود.",
  "چیزی بین دو صفحه جا ماند و گم شد.",
];

function toFaDigits(n: number) {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]!);
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

export type Book3DProps = {
  title?: string;
  className?: string;
  /** Soft paper lines + short Persian snippets on alternate pages. */
  showPageContent?: boolean;
};

type BookPageProps = {
  index: number;
  progress: MotionValue<number>;
  showContent: boolean;
};

function BookPage({ index, progress, showContent }: BookPageProps) {
  const t = index / (TOTAL_PAGES - 1 || 1);
  const openAngle = PAGE_OPEN_MIN + t * (PAGE_OPEN_MAX - PAGE_OPEN_MIN);
  const rotateY = useTransform(progress, [0, 1], [0, openAngle]);
  const shade = useTransform(progress, [0, 0.35, 1], [0.02, 0.1, 0.04]);
  const shadeBg = useTransform(shade, (v) => `rgba(20, 16, 12, ${v})`);

  const paper =
    index % 3 === 0
      ? "rgb(252 248 241)"
      : index % 3 === 1
        ? "rgb(250 245 236)"
        : "rgb(248 243 232)";
  const snippet = PAGE_INK[index % PAGE_INK.length]!;

  return (
    <motion.div
      aria-hidden
      className="absolute inset-0 overflow-hidden rounded-s-[10px] rounded-e-[3px] md:rounded-s-[14px]"
      style={{
        rotateY,
        transformOrigin: "right center",
        transformStyle: "preserve-3d",
        zIndex: 40 + index,
        background: paper,
        boxShadow:
          "inset -1px 0 0 rgba(40, 28, 18, 0.08), inset 0 0 0 1px rgba(40, 28, 18, 0.04)",
      }}
    >
      {/* Ruled paper */}
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent 0 21px, rgba(120, 90, 70, 0.11) 21px 22px)",
          backgroundPosition: "0 18px",
        }}
      />
      <div
        className="absolute inset-y-0 end-[14%] w-px md:end-[16%]"
        style={{ background: "rgba(180, 60, 70, 0.22)" }}
      />

      {showContent && index % 2 === 1 ? (
        <div
          dir="rtl"
          className="absolute inset-x-3 top-5 bottom-4 flex flex-col justify-between md:inset-x-4 md:top-7"
        >
          <p className="line-clamp-4 text-[9px] leading-5 text-[rgb(70_55_42/0.55)] md:text-[11px] md:leading-6">
            {snippet}
          </p>
          <span
            dir="ltr"
            className="self-start text-[9px] tabular-nums text-[rgb(70_55_42/0.35)] md:text-[10px]"
          >
            {toFaDigits(index + 1)}
          </span>
        </div>
      ) : null}

      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundColor: shadeBg }}
      />
    </motion.div>
  );
}

export function Book3D({
  title = "دفترچه",
  className,
  showPageContent = true,
}: Book3DProps) {
  const reduce = useReducedMotion() ?? false;
  const rootRef = React.useRef<HTMLDivElement>(null);
  const dragging = React.useRef(false);
  const activePointer = React.useRef<number | null>(null);

  const target = useMotionValue(0);
  const progress = useSpring(target, reduce ? SPRING_SNAP : SPRING_FOLLOW);

  const coverRotate = useTransform(progress, [0, 1], [0, COVER_OPEN]);
  const coverShade = useTransform(
    progress,
    [0, 0.2, 0.55, 1],
    [0.08, 0.28, 0.12, 0.05],
  );
  const coverShadeBg = useTransform(
    coverShade,
    (v) => `rgba(0, 0, 0, ${v})`,
  );
  const groundScaleX = useTransform(progress, [0, 1], [0.72, 1.55]);
  const groundOpacity = useTransform(progress, [0, 1], [0.22, 0.38]);
  const stageTilt = useTransform(progress, [0, 1], [6, 2]);

  const setFromClientX = (clientX: number) => {
    const node = rootRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    if (rect.width <= 0) return;
    // Spine on the right (RTL): drag/hover left to open.
    const t = 1 - (clientX - rect.left) / rect.width;
    target.set(clamp01(t));
  };

  const closeBook = () => {
    dragging.current = false;
    activePointer.current = null;
    target.set(0);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    dragging.current = true;
    activePointer.current = event.pointerId;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
    setFromClientX(event.clientX);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragging.current) {
      if (event.pointerId !== activePointer.current) return;
      setFromClientX(event.clientX);
      return;
    }
    if (event.pointerType === "mouse") {
      setFromClientX(event.clientX);
    }
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (
      activePointer.current !== null &&
      event.pointerId !== activePointer.current
    ) {
      return;
    }
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    closeBook();
  };

  const onPointerLeave = () => {
    if (!dragging.current) target.set(0);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft" || event.key === "Home") {
      event.preventDefault();
      target.set(1);
    } else if (event.key === "ArrowRight" || event.key === "End" || event.key === "Escape") {
      event.preventDefault();
      target.set(0);
    }
  };

  return (
    <div
      dir="rtl"
      lang="fa"
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden",
        "font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal",
        className,
      )}
    >
      {/* Soft stage glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 40% at 50% 58%, rgba(120, 90, 60, 0.12), transparent 70%)",
        }}
      />

      <motion.div
        ref={rootRef}
        role="img"
        aria-label={`${title}. با کشیدن یا هاور باز می‌شود.`}
        tabIndex={0}
        className={cn(
          "relative h-52 w-36 touch-none select-none outline-none md:h-80 md:w-56",
          "cursor-grab active:cursor-grabbing",
          "focus-visible:ring-2 focus-visible:ring-foreground/25 focus-visible:ring-offset-4 focus-visible:ring-offset-background",
        )}
        style={{
          perspective: "1600px",
          transformStyle: "preserve-3d",
          rotateX: stageTilt,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerLeave}
        onKeyDown={onKeyDown}
      >
        {/* Ground shadow */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -bottom-6 left-1/2 h-6 w-[85%] rounded-[100%] bg-black blur-md md:-bottom-8 md:h-8"
          style={{
            x: "-50%",
            scaleX: groundScaleX,
            opacity: groundOpacity,
          }}
        />

        {/* Back cover / block */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-s-[10px] rounded-e-[4px] md:rounded-s-[14px]"
          style={{
            transformOrigin: "right center",
            transformStyle: "preserve-3d",
            zIndex: 1,
            background:
              "linear-gradient(180deg, rgb(236 230 220) 0%, rgb(224 216 204) 100%)",
            boxShadow:
              "0 10px 28px rgba(20, 14, 10, 0.18), inset 0 0 0 1px rgba(40, 28, 18, 0.08)",
          }}
        >
          <div
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "radial-gradient(rgba(70, 50, 30, 0.12) 0.7px, transparent 0.7px)",
              backgroundSize: "3px 3px",
            }}
          />
          <div className="absolute inset-y-3 end-0 w-[3px] rounded-s-full bg-[rgb(70_45_30_/_0.12)] md:inset-y-4" />
        </div>

        {Array.from({ length: TOTAL_PAGES }, (_, i) => (
          <BookPage
            key={i}
            index={i}
            progress={progress}
            showContent={showPageContent}
          />
        ))}

        {/* Front cover */}
        <motion.div
          className="absolute inset-0 rounded-s-[10px] rounded-e-[3px] md:rounded-s-[14px]"
          style={{
            rotateY: coverRotate,
            transformOrigin: "right center",
            transformStyle: "preserve-3d",
            zIndex: 200,
          }}
        >
          {/* Outside face */}
          <div
            className="absolute inset-0 overflow-hidden rounded-s-[10px] rounded-e-[3px] md:rounded-s-[14px]"
            style={{
              backfaceVisibility: "hidden",
              background:
                "linear-gradient(155deg, #7a1528 0%, #4e0e1c 42%, #2f0a14 100%)",
              boxShadow:
                "0 12px 30px rgba(20, 8, 12, 0.35), inset 0 1px 0 rgba(255,255,255,0.14)",
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-overlay"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")",
              }}
            />

            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-[38%]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%), #9b1832",
              }}
            />
            <div
              aria-hidden
              className="absolute inset-x-3 top-[38%] h-px md:inset-x-4"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(232, 196, 140, 0.55), transparent)",
              }}
            />

            <div
              aria-hidden
              className="absolute inset-y-0 end-0 z-20 flex w-2.5 flex-row md:w-3.5"
            >
              <div className="h-full w-px bg-black/25" />
              <div className="h-full w-px bg-white/15" />
              <div className="h-full w-px bg-black/20" />
            </div>

            <div className="absolute inset-x-3 bottom-3 z-10 md:inset-x-5 md:bottom-5">
              <div
                className="mb-2 h-px w-10 md:mb-3 md:w-14"
                style={{ background: "rgba(232, 196, 140, 0.45)" }}
              />
              <div
                className="text-lg font-medium tracking-wide text-[rgb(248_236_220)] md:text-2xl"
                style={{ textShadow: "0 1px 0 rgba(0,0,0,0.35)" }}
              >
                {title}
              </div>
              <p className="mt-1 text-[10px] text-[rgb(232_196_140/0.55)] md:text-xs">
                ورق بزن
              </p>
            </div>

            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-30"
              style={{ backgroundColor: coverShadeBg }}
            />

            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-40"
              style={{
                boxShadow:
                  "inset 0 0 0 1px rgba(255,255,255,0.08), inset -2px 0 3px rgba(0,0,0,0.25), inset 2px 0 2px rgba(255,255,255,0.06)",
              }}
            />
          </div>

          {/* Inside cover */}
          <div
            aria-hidden
            className="absolute inset-0 flex items-center justify-center rounded-s-[10px] md:rounded-s-[14px]"
            style={{
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
              background:
                "linear-gradient(180deg, rgb(245 238 226) 0%, rgb(232 222 206) 100%)",
              boxShadow: "inset 0 0 0 1px rgba(40, 28, 18, 0.08)",
            }}
          >
            <span className="text-xs font-medium text-[rgb(70_55_42/0.4)] md:text-sm">
              صفحهٔ پشت
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function Component3dBook() {
  return <Book3D />;
}
