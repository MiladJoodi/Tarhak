"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import { cn } from "@/lib/utils";

type Testimonial = {
  id: number;
  name: string;
  role: string;
  avatar: string;
  content: string;
  /** Card surface */
  surface: string;
  /** Primary ink / type */
  ink: string;
  /** Soft secondary type */
  mute: string;
  /** Accent chip / quote mark */
  accent: string;
};

// Change Here
const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "مریم رضایی",
    role: "مدیر محصول، اکواستریم",
    avatar: "/unsplash/1494790108377-be9c29b29330.webp",
    content:
      "رابط آن‌قدر ساده است که تیممان ظرف چند ساعت راه افتاد. برای استارتاپ‌های تندکار عالی است.",
    surface: "#0c1f3d",
    ink: "#eaf1ff",
    mute: "#9bb0d4",
    accent: "#6ea8ff",
  },
  {
    id: 2,
    name: "سارا احمدی",
    role: "مدیر تجربه کاربری، کرییتیوفلو",
    avatar: "/unsplash/1438761681033-6461ffad8d80.webp",
    content:
      "ده‌ها ابزار را امتحان کردیم؛ این یکی با طراحی تمیزش متمایز است. روند کارمان را عوض کرد.",
    surface: "#211510",
    ink: "#fff0e4",
    mute: "#c9a690",
    accent: "#ff9a5c",
  },
  {
    id: 3,
    name: "نیما کریمی",
    role: "مدیرعامل، تکنووا",
    avatar: "/unsplash/1506794778202-cad84cf45f1d.webp",
    content:
      "بزرگ‌کردن زیرساخت قبلاً کابوس بود. حالا می‌توانیم روی ساخت قابلیت تمرکز کنیم.",
    surface: "#0f2419",
    ink: "#e5f7ec",
    mute: "#8fb89d",
    accent: "#45d18f",
  },
  {
    id: 4,
    name: "علی موسوی",
    role: "مدیر فنی، نکست‌جن",
    avatar: "/unsplash/1472099645785-5658abf4ff4e.webp",
    content:
      "فقط امنیتش ارزشش را دارد. مشتری‌ها با خیال راحت‌تری می‌دانند داده‌شان رمزنگاری شده است.",
    surface: "#18191c",
    ink: "#f4f4f2",
    mute: "#a8a8a2",
    accent: "#e2c15a",
  },
];

const AUTO_MS = 3400;
const SHAKE_MS = 420;
const EXIT_MS = 520;

function toFa(n: number) {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]!);
}

export default function ShakeTestimonial() {
  const reduceMotion = useReducedMotion() ?? false;
  const [cards, setCards] = useState(testimonials);
  const [phase, setPhase] = useState<"idle" | "shake" | "exit">("idle");
  const pausedRef = useRef(false);
  const busyRef = useRef(false);

  const advance = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;

    if (reduceMotion) {
      setCards((prev) => {
        const [first, ...rest] = prev;
        return [...rest, first];
      });
      busyRef.current = false;
      return;
    }

    setPhase("shake");
    window.setTimeout(() => setPhase("exit"), SHAKE_MS);
    window.setTimeout(() => {
      setCards((prev) => {
        const [first, ...rest] = prev;
        return [...rest, first];
      });
      setPhase("idle");
      busyRef.current = false;
    }, SHAKE_MS + EXIT_MS);
  }, [reduceMotion]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (!pausedRef.current) advance();
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [advance]);

  return (
    <div
      dir="rtl"
      lang="fa"
      className={cn(
        "flex min-h-[560px] w-full items-center justify-center overflow-hidden bg-transparent px-4 py-10",
        "font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal",
        "max-sm:min-h-[460px]",
      )}
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      <div className="flex w-full max-w-[420px] flex-col items-center gap-6">
        <div
          className="relative h-[280px] w-full max-sm:h-[250px] sm:h-[300px]"
          style={{ perspective: "1400px" }}
        >
          <AnimatePresence mode="popLayout">
            {cards.map((card, index) => {
              const isTop = index === 0;
              const shaking = isTop && phase === "shake";
              const exiting = isTop && phase === "exit";
              const depth = Math.min(index, 3);

              return (
                <motion.button
                  key={card.id}
                  type="button"
                  layout={!reduceMotion}
                  onClick={advance}
                  aria-label={`نظر ${card.name}. برای بعدی کلیک کنید.`}
                  style={{
                    backgroundColor: card.surface,
                    color: card.ink,
                    zIndex: testimonials.length - index,
                    position: "absolute",
                    insetInlineStart: 0,
                    top: 0,
                    transformOrigin: "50% 80%",
                  }}
                  initial={
                    reduceMotion
                      ? false
                      : { scale: 0.88, opacity: 0, y: 36, rotateX: -16 }
                  }
                  animate={
                    exiting
                      ? {
                          x: 0,
                          y: -320,
                          scale: 0.86,
                          rotate: -8,
                          rotateX: 18,
                          opacity: 0,
                          transition: {
                            duration: EXIT_MS / 1000,
                            ease: [0.22, 1, 0.36, 1],
                          },
                        }
                      : shaking
                        ? {
                            x: [0, -10, 10, -8, 8, -4, 0],
                            y: depth * 14,
                            scale: 1 - depth * 0.045,
                            rotate: [0, -2.2, 2.2, -1.4, 1.4, 0],
                            rotateX: -depth * 2.5,
                            opacity: 1,
                            transition: {
                              duration: SHAKE_MS / 1000,
                              ease: "easeInOut",
                            },
                          }
                        : {
                            x: 0,
                            y: depth * 14,
                            scale: 1 - depth * 0.045,
                            rotate: 0,
                            rotateX: -depth * 2.5,
                            opacity: depth < 4 ? 1 : 0,
                            transition: {
                              type: "spring",
                              stiffness: 380,
                              damping: 28,
                              mass: 0.7,
                            },
                          }
                  }
                  className={cn(
                    "group h-full w-full cursor-pointer overflow-hidden rounded-[28px] border border-white/10",
                    "flex flex-col justify-between p-7 text-start shadow-[0_24px_50px_-28px_rgba(0,0,0,0.55)]",
                    "select-none outline-none focus-visible:ring-2 focus-visible:ring-white/35",
                    "max-sm:rounded-[24px] max-sm:p-6",
                  )}
                >
                  {/* Soft radial wash */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -top-16 -end-10 size-56 rounded-full opacity-40 blur-3xl"
                    style={{ background: card.accent }}
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-soft-light"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")",
                    }}
                  />

                  <div className="relative z-[1] flex flex-col gap-5">
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className="inline-flex size-9 items-center justify-center rounded-2xl text-lg font-semibold leading-none"
                        style={{
                          backgroundColor: `${card.accent}22`,
                          color: card.accent,
                        }}
                        aria-hidden
                      >
                        «
                      </span>
                      <span
                        dir="ltr"
                        className="text-[11px] font-medium tracking-wide"
                        style={{ color: card.mute }}
                      >
                        {toFa(card.id)}/{toFa(testimonials.length)}
                      </span>
                    </div>

                    <p className="m-0 text-[19px] font-medium leading-[1.55] max-sm:text-[17px] sm:text-[21px]">
                      {card.content}
                    </p>
                  </div>

                  <div className="relative z-[1] mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
                    <div className="size-11 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/15 max-sm:size-10">
                      <img
                        src={card.avatar}
                        alt=""
                        className="size-full object-cover"
                        draggable={false}
                      />
                    </div>
                    <div className="min-w-0 flex flex-col text-start">
                      <span className="truncate text-[15px] font-semibold leading-tight">
                        {card.name}
                      </span>
                      <span
                        className="truncate text-[12px] leading-snug"
                        style={{ color: card.mute }}
                      >
                        {card.role}
                      </span>
                    </div>
                    <span
                      className="ms-auto text-[11px] font-medium opacity-70 transition-opacity group-hover:opacity-100"
                      style={{ color: card.accent }}
                    >
                      بعدی
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2" aria-hidden>
          {cards.map((card, i) => (
            <span
              key={card.id}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === 0 ? "w-5 bg-foreground/70" : "w-1.5 bg-foreground/20",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
