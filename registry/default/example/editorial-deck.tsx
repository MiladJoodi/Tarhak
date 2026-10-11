"use client";

import { cn } from "@/lib/utils";
import { motion, useReducedMotion, type PanInfo } from "motion/react";
import { useRef, useState } from "react";

export type EditorialDeckCard = {
  id: string;
  date: string;
  title: string;
  image: string;
  /** Soft accent wash / edge color */
  tint: string;
  kicker?: string;
};

export const DEFAULT_CARDS: EditorialDeckCard[] = [
  {
    id: "ambient",
    date: "منتشرشده اخیراً",
    kicker: "تکنولوژی",
    title: "برآمدن رایانش محیطی",
    image: "/unsplash/1518770660439-4636190af475.webp",
    tint: "#7a9bb8",
  },
  {
    id: "human",
    date: "منتشرشده ۴ روز پیش",
    kicker: "طراحی",
    title: "طراحی رابط‌های هوش مصنوعی که انسانی حس شوند",
    image: "/unsplash/1487958449943-2429e8be8625.webp",
    tint: "#6a9a7c",
  },
  {
    id: "workflows",
    date: "منتشرشده اخیراً",
    kicker: "ابزار",
    title: "گردش‌کار خلاق با ابزارهای نرم",
    image: "/unsplash/1488590528505-98d2b5aba04b.webp",
    tint: "#b07a92",
  },
  {
    id: "systems",
    date: "منتشرشده اخیراً",
    kicker: "سیستم",
    title: "سیستم‌های طراحی مینیمال برای تیم‌های سریع",
    image: "/unsplash/1460925895917-afdab827c52f.webp",
    tint: "#b8925c",
  },
  {
    id: "intersect",
    date: "منتشرشده اخیراً",
    kicker: "محصول",
    title: "جایی که هوش با ساخت آرام محصول تلاقی می‌کند",
    image: "/unsplash/1488972685288-c3fd157d7c7a.webp",
    tint: "#8a7aad",
  },
];

const STACK_Y = 12;
const STACK_SCALE = 0.04;
const STACK_PEEK = 2;
const SWIPE = 90;
const LIFT_Y = -72;
const LIFT_SCALE = 0.9;
const SETTLE = {
  type: "spring" as const,
  duration: 0.4,
  bounce: 0,
};
const LIFT = {
  type: "spring" as const,
  duration: 0.32,
  bounce: 0.12,
};
const TUCK = {
  type: "spring" as const,
  duration: 0.38,
  bounce: 0,
};

type FlyPhase = "lift" | "tuck";

function rotateOrder(prev: number[], from: number) {
  return [...prev.slice(from), ...prev.slice(0, from)];
}

function toFaDigits(n: number) {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]!);
}

export interface EditorialDeckProps {
  cards?: EditorialDeckCard[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export function EditorialDeck({
  cards = DEFAULT_CARDS,
  title = "دک تحریریه",
  subtitle = "بکشید تا داستان‌ها ورق بخورند",
  className = "",
}: EditorialDeckProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [order, setOrder] = useState(() => cards.map((_, i) => i));
  const [fly, setFly] = useState<FlyPhase | false>(false);
  const [peel, setPeel] = useState(0);
  const flying = useRef(false);
  const flyPhase = useRef<FlyPhase | "idle">("idle");
  const flyStarted = useRef(0);
  const releaseVx = useRef(0);

  const lastDepth = cards.length - 1;
  const showIntro = Boolean(title || subtitle);
  const peek = Math.min(lastDepth, STACK_PEEK);

  const commitBack = () => {
    if (!flying.current) return;
    if (Date.now() - flyStarted.current < 180) return;
    flying.current = false;
    flyPhase.current = "idle";
    releaseVx.current = 0;
    setOrder((prev) => rotateOrder(prev, 1));
    setFly(false);
  };

  const sendToBack = () => {
    if (flying.current) return;
    if (reduceMotion) {
      setOrder((prev) => rotateOrder(prev, 1));
      return;
    }
    flying.current = true;
    flyPhase.current = "lift";
    flyStarted.current = Date.now();
    setFly("lift");
    window.setTimeout(() => {
      if (flyPhase.current !== "lift") return;
      flyPhase.current = "tuck";
      setFly("tuck");
    }, 300);
    window.setTimeout(commitBack, 720);
  };

  const onDrag = (_: unknown, info: PanInfo) => {
    setPeel(info.offset.x);
    releaseVx.current = info.velocity.x;
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    releaseVx.current = info.velocity.x;
    const commit =
      Math.abs(info.offset.x) > SWIPE || Math.abs(info.velocity.x) > 450;
    setPeel(0);
    if (commit) sendToBack();
  };

  return (
    <section
      dir="rtl"
      lang="fa"
      className={cn(
        "flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center",
        "bg-transparent px-5 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal sm:px-6",
        className,
      )}
    >
      {showIntro ? (
        <div className="mb-7 text-center md:mb-9">
          {title ? (
            <p className="text-[11px] font-medium tracking-[0.14em] text-neutral-500 uppercase dark:text-neutral-400">
              {title}
            </p>
          ) : null}
          {subtitle ? (
            <h2 className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-50 sm:text-3xl">
              {subtitle}
            </h2>
          ) : null}
        </div>
      ) : null}

      <div
        className="relative w-full max-w-2xl"
        style={{ height: `calc(21rem + ${peek * STACK_Y}px)` }}
      >
        {/* Soft stage glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-8 bottom-2 h-10 rounded-[100%] bg-black/10 blur-2xl dark:bg-black/45"
        />

        {order
          .slice()
          .reverse()
          .map((cardIndex, revI) => {
            const restDepth = lastDepth - revI;
            const isFront = restDepth === 0;
            const isFlying = isFront && Boolean(fly);
            const lifting = isFront && fly === "lift";
            const tucking = isFront && fly === "tuck";
            const depth = isFlying
              ? lastDepth
              : fly && restDepth > 0
                ? restDepth - 1
                : restDepth;
            const vis = Math.min(depth, STACK_PEEK);
            const c = cards[cardIndex]!;
            const canDrag = isFront && !fly;
            const peeling = canDrag && peel !== 0;
            const peelX = canDrag && !reduceMotion ? peel : 0;
            const dragShrink = Math.min(Math.abs(peelX) / 280, 0.12);
            const issue = toFaDigits(cardIndex + 1);

            return (
              <motion.article
                key={c.id}
                drag={canDrag ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={reduceMotion ? 0.12 : 0.52}
                onDrag={canDrag ? onDrag : undefined}
                onDragEnd={canDrag ? onDragEnd : undefined}
                initial={false}
                animate={{
                  x: 0,
                  y: lifting ? LIFT_Y : vis * STACK_Y,
                  scale: lifting
                    ? LIFT_SCALE - dragShrink * 0.25
                    : 1 - vis * STACK_SCALE - dragShrink,
                  rotate: peelX * 0.055,
                }}
                transition={
                  peeling
                    ? { duration: 0, x: SETTLE }
                    : lifting
                      ? { ...LIFT, x: { ...LIFT, velocity: releaseVx.current } }
                      : tucking
                        ? TUCK
                        : SETTLE
                }
                onAnimationComplete={() => {
                  if (!isFront) return;
                  if (flyPhase.current === "lift") {
                    flyPhase.current = "tuck";
                    setFly("tuck");
                    return;
                  }
                  if (flyPhase.current === "tuck") commitBack();
                }}
                className={cn(
                  "absolute inset-x-0 top-0 flex h-[19.5rem] flex-col touch-none overflow-hidden rounded-[1.35rem] md:h-[21rem] md:flex-row",
                  "bg-[#f4efe8] dark:bg-[hsl(225_8%_13%)]",
                  "ring-1 ring-black/8 dark:ring-white/10",
                  canDrag
                    ? "cursor-grab active:cursor-grabbing"
                    : "pointer-events-none",
                )}
                style={{
                  zIndex: canDrag || lifting ? 40 : isFlying ? 1 : 20 - depth,
                  transition: tucking ? "z-index 0s linear" : undefined,
                  boxShadow: isFront
                    ? "0 22px 44px -18px rgba(0,0,0,0.28), 0 4px 12px -4px rgba(0,0,0,0.12)"
                    : "0 8px 20px -12px rgba(0,0,0,0.18)",
                }}
              >
                {/* Accent edge */}
                <div
                  aria-hidden
                  className="absolute inset-y-0 start-0 z-20 w-[3px] md:w-1"
                  style={{ backgroundColor: c.tint }}
                />

                {/* Image */}
                <div className="relative h-40 w-full shrink-0 md:h-auto md:w-[48%]">
                  <div className="absolute inset-3 overflow-hidden rounded-[1.05rem] md:inset-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.image}
                      alt={c.title}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, transparent 40%, rgba(0,0,0,0.28) 100%)",
                      }}
                    />
                    <span
                      className="absolute start-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white backdrop-blur-sm"
                      style={{ backgroundColor: `${c.tint}cc` }}
                    >
                      {c.kicker ?? "داستان"}
                    </span>
                    <span className="absolute end-3 bottom-3 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] text-2xl font-bold tabular-nums text-white/35">
                      {issue.padStart(2, "۰")}
                    </span>
                  </div>
                </div>

                {/* Copy */}
                <div className="relative flex flex-1 flex-col justify-center gap-3 px-6 py-5 md:px-9 md:py-8">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -end-6 top-1/2 size-36 -translate-y-1/2 rounded-full opacity-30 blur-3xl dark:opacity-25"
                    style={{ backgroundColor: c.tint }}
                  />
                  <p className="text-[12px] font-medium text-neutral-500 dark:text-neutral-400">
                    {c.date}
                  </p>
                  <h3 className="text-[1.35rem] font-semibold leading-snug text-neutral-900 dark:text-neutral-50 sm:text-[1.7rem]">
                    {c.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className="h-px w-8"
                      style={{ backgroundColor: c.tint }}
                    />
                    <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                      بکشید تا ورق بخورد
                    </span>
                  </div>
                </div>
              </motion.article>
            );
          })}
      </div>

      <div className="mt-8 flex items-center gap-2">
        {cards.map((c, i) => (
          <button
            key={c.id}
            type="button"
            aria-label={`رفتن به کارت ${toFaDigits(i + 1)}`}
            onClick={() => {
              if (flying.current) return;
              const pos = order.indexOf(i);
              if (pos <= 0) return;
              setOrder((prev) => rotateOrder(prev, pos));
            }}
            className={cn(
              "h-2 rounded-full transition-[width,background-color] duration-200",
              order[0] === i
                ? "w-6 bg-neutral-900 dark:bg-neutral-100"
                : "w-2 bg-neutral-300 dark:bg-neutral-600",
            )}
          />
        ))}
      </div>
    </section>
  );
}

export default EditorialDeck;
