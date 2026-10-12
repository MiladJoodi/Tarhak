"use client";

import { useState } from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

interface CardItem {
  id: string | number;
  title: string;
  caption: string;
  bgColor: string;
  textColor: string;
  accent: string;
}

/** Soft sample-deck swatches — vertical titles, physical fan. */
const CARDS: CardItem[] = [
  {
    id: "bloom",
    title: "شکوفه",
    caption: "آبی یخی",
    bgColor: "#BFD8F2",
    textColor: "#2F4F7A",
    accent: "rgba(255,255,255,0.55)",
  },
  {
    id: "mist",
    title: "مه",
    caption: "مه تابستانی",
    bgColor: "#C9E2EE",
    textColor: "#335F78",
    accent: "rgba(255,255,255,0.5)",
  },
  {
    id: "meadow",
    title: "چمنزار",
    caption: "سبز نرم",
    bgColor: "#B8E4CB",
    textColor: "#246B48",
    accent: "rgba(255,255,255,0.48)",
  },
  {
    id: "coral",
    title: "مرجان",
    caption: "گِـل رس",
    bgColor: "#F3C9BB",
    textColor: "#8F3F30",
    accent: "rgba(255,255,255,0.5)",
  },
  {
    id: "haze",
    title: "غبار",
    caption: "صورتی غبارآلود",
    bgColor: "#EBC8DA",
    textColor: "#7A3F64",
    accent: "rgba(255,255,255,0.5)",
  },
  {
    id: "dawn",
    title: "سپیده",
    caption: "کهربا",
    bgColor: "#F1D4B0",
    textColor: "#8A5724",
    accent: "rgba(255,255,255,0.48)",
  },
  {
    id: "lilac",
    title: "یاس",
    caption: "بنفش مهتابی",
    bgColor: "#D2C6EC",
    textColor: "#4F3C7E",
    accent: "rgba(255,255,255,0.5)",
  },
  {
    id: "studio",
    title: "استودیو",
    caption: "آسمان روشن",
    bgColor: "#C5DAF0",
    textColor: "#31527A",
    accent: "rgba(255,255,255,0.55)",
  },
];

const CARD_WIDTH = 232;
const CARD_HEIGHT = 352;
const CARD_OFFSET = 52;
const HOVER_SPREAD = 72;
const TILT_ANGLE = 22;
const POP_HEIGHT = 88;

const HOVER_SPRING = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34,
  mass: 0.85,
  bounce: 0,
};

const faIndex = (n: number) =>
  String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]!);

export default function PopTiltCards() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const containerWidth =
    CARD_WIDTH + (CARDS.length - 1) * CARD_OFFSET + HOVER_SPREAD;
  const containerHeight = CARD_HEIGHT + POP_HEIGHT + 48;

  return (
    <section
      dir="rtl"
      lang="fa"
      aria-label="دسته کارت‌های کج‌شونده"
      className={cn(
        "flex h-full w-full min-w-0 flex-col items-center justify-center overflow-x-hidden",
        "bg-[#EEF1F4] px-3 pb-24 pt-24 dark:bg-[hsl(225_7%_11%)]",
        "font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal",
        "sm:px-6 sm:pb-12 sm:pt-28",
      )}
    >
      <div
        className="flex w-full min-w-0 justify-center [container-type:inline-size]"
        style={{ maxWidth: containerWidth }}
      >
        <div
          className="relative flex w-full justify-center"
          style={{
            height: `calc(${containerHeight}px * min(1, 100cqi / ${containerWidth}px))`,
          }}
        >
          <div
            className="relative flex shrink-0 select-none items-end justify-center [perspective:1400px] [transform-origin:top_center]"
            style={{
              width: `${containerWidth}px`,
              height: `${containerHeight}px`,
              transform: `scale(min(1, calc(100cqi / ${containerWidth}px)))`,
            }}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Soft ground under the fan */}
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-2 left-1/2 h-10 w-[78%] -translate-x-1/2 rounded-[100%] bg-black/18 blur-2xl dark:bg-black/45"
            />

            <div
              className="relative bottom-6"
              style={{
                width: `${containerWidth}px`,
                height: `${CARD_HEIGHT}px`,
              }}
            >
              {CARDS.map((card, index) => {
                let targetX = index * CARD_OFFSET;
                let targetY = 0;
                let targetRotate = 0;
                let targetScale = 1;
                let zIndex = index + 1;

                if (hoveredIndex !== null) {
                  if (index < hoveredIndex) {
                    targetRotate = TILT_ANGLE;
                    targetX = index * CARD_OFFSET;
                  } else if (index === hoveredIndex) {
                    targetRotate = 0;
                    targetY = -POP_HEIGHT;
                    targetScale = 1.035;
                    targetX = index * CARD_OFFSET;
                    zIndex = 50;
                  } else {
                    targetRotate = -TILT_ANGLE;
                    targetX = index * CARD_OFFSET + HOVER_SPREAD;
                  }
                }

                const isHovered = hoveredIndex === index;

                return (
                  // Hit target stays put; visual layer moves — avoids hover thrash on pop.
                  <div
                    key={card.id}
                    className="absolute left-0 top-0"
                    style={{
                      width: `${CARD_WIDTH}px`,
                      height: `${CARD_HEIGHT}px`,
                      transform: `translateX(${index * CARD_OFFSET}px)`,
                      zIndex,
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onFocus={() => setHoveredIndex(index)}
                    onClick={() => setHoveredIndex(index)}
                  >
                    <motion.div
                      role="button"
                      tabIndex={0}
                      aria-label={`${card.title} — ${card.caption}`}
                      aria-pressed={isHovered}
                      className={cn(
                        "absolute left-0 top-0 flex cursor-pointer flex-col overflow-hidden rounded-[1.15rem]",
                        "p-4 [transform-origin:50%_92%] will-change-transform",
                        "outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/25 focus-visible:ring-offset-2",
                      )}
                      style={{
                        width: `${CARD_WIDTH}px`,
                        height: `${CARD_HEIGHT}px`,
                        backgroundColor: card.bgColor,
                        boxShadow: isHovered
                          ? "0 28px 48px -24px rgba(0,0,0,0.42), 0 12px 20px -14px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.55)"
                          : "0 10px 22px -16px rgba(0,0,0,0.28), 0 2px 6px -2px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.4)",
                      }}
                      animate={{
                        x: targetX - index * CARD_OFFSET,
                        y: targetY,
                        rotate: targetRotate,
                        scale: targetScale,
                      }}
                      transition={HOVER_SPRING}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setHoveredIndex(index);
                        }
                      }}
                    >
                      {/* Top sheen */}
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-white/45 to-transparent"
                      />

                      {/* Quiet index */}
                      <span
                        className="relative z-[2] text-[0.7rem] font-medium tabular-nums tracking-wide opacity-55"
                        style={{ color: card.textColor }}
                        dir="ltr"
                      >
                        {faIndex(index + 1).padStart(2, "۰")}
                      </span>

                      <div className="relative z-[2] mt-3 flex min-h-0 flex-1 items-start justify-start pointer-events-none">
                        <span
                          className="inline-block whitespace-nowrap text-[1.85rem] font-semibold leading-none [text-orientation:mixed] [writing-mode:vertical-rl]"
                          style={{ color: card.textColor }}
                        >
                          {card.title}
                        </span>
                      </div>

                      <div className="relative z-[2] mt-auto flex items-end justify-between gap-2 pointer-events-none">
                        <span
                          className="max-w-[7.5rem] truncate text-[0.72rem] font-medium opacity-60"
                          style={{ color: card.textColor }}
                        >
                          {card.caption}
                        </span>
                        <span
                          aria-hidden
                          className="size-2 shrink-0 rounded-full"
                          style={{ backgroundColor: card.textColor, opacity: 0.35 }}
                        />
                      </div>

                      {/* Rim */}
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 z-[4] rounded-[inherit] border transition-[border-color,box-shadow] duration-200"
                        style={{
                          borderColor: isHovered
                            ? "rgba(255,255,255,0.62)"
                            : card.accent,
                          boxShadow: isHovered
                            ? "inset 0 0 0 1px rgba(255,255,255,0.2)"
                            : undefined,
                        }}
                      />
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
