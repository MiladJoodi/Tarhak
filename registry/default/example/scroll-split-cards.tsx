"use client";

import React, { useEffect, useState, useRef, type RefObject } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export type SplitCard = {
  title: string;
  description: string;
  bgColor: string;
  textColor: string;
  kicker?: string;
};

export type ScrollSplitCardsProps = {
  items?: SplitCard[];
  imageSrc?: string;
  className?: string;
  /** Scrollport to track. Omit to follow the page. */
  containerRef?: RefObject<HTMLElement | null>;
};

export const DEFAULT_IMAGE =
  "/unsplash/1524504388940-b1c1722653e1-lg.webp";

export const DEFAULT_CARDS: SplitCard[] = [
  {
    title: "قلعهٔ فورت پوینت",
    kicker: "پرسیدیو",
    description:
      "باتری جنگ داخلی زیر برج جنوبی. مه قبل از شهر به آجر می‌خورد.",
    bgColor: "#ead9c4",
    textColor: "#2a1810",
  },
  {
    title: "دهانه",
    kicker: "۲٫۷ کیلومتر",
    description:
      "نارنجی بین‌المللی، مخلوط شده تا از مه رد شود. عرشه ۲۲۰ فوت بالای تنگه است.",
    bgColor: "#c4452d",
    textColor: "#fff4ec",
  },
  {
    title: "دماغهٔ مارین",
    kicker: "برج شمالی",
    description:
      "پیاده‌روی از باتری اسپنسر. در روز غلیظ، شهر فقط لکه‌ای از نور است.",
    bgColor: "#2c3033",
    textColor: "#e6e2da",
  },
];

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const MOBILE_MQ = "(max-width: 767px)";

function toFaDigits(value: string | number) {
  return String(value).replace(/\d/g, (digit) => FA_DIGITS[Number(digit)] ?? digit);
}

function useIsMobile() {
  const [mobile, setMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(MOBILE_MQ).matches : false,
  );
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return mobile;
}

export function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

export function remap(progress: number, from: number, to: number) {
  if (to === from) return progress >= to ? 1 : 0;
  return clamp01((progress - from) / (to - from));
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Left/right panels peak at `peak` px, then close in a little for the flip. */
export function panelShiftX(progress: number, index: number, peak = 48) {
  const dir = index === 0 ? -1 : index === 2 ? 1 : 0;
  const out = remap(progress, 0, 0.4);
  const settle = remap(progress, 0.4, 0.8);
  return dir * lerp(0, peak, out) * (1 - settle * 0.5) || 0;
}

/** Mobile: top/bottom bands peel apart vertically before the flip. */
export function panelShiftY(progress: number, index: number, peak = 28) {
  const dir = index === 0 ? -1 : index === 2 ? 1 : 0;
  const out = remap(progress, 0, 0.35);
  const settle = remap(progress, 0.35, 0.75);
  return dir * lerp(0, peak, out) * (1 - settle * 0.45) || 0;
}

export function panelRotateY(progress: number) {
  return lerp(0, 180, remap(progress, 0.4, 0.8));
}

/** Mobile: flip over the X axis — reads like pages peeling upward. */
export function panelRotateX(progress: number) {
  return lerp(0, -180, remap(progress, 0.35, 0.78));
}

export function panelScale(progress: number) {
  return lerp(1, 0.92, remap(progress, 0, 0.4));
}

export function panelScaleMobile(progress: number) {
  return lerp(1, 0.96, remap(progress, 0, 0.35));
}

export function panelRadius(progress: number, index: number) {
  const inner = lerp(0, 16, remap(progress, 0, 0.2));
  if (index === 0) return `16px ${inner}px ${inner}px 16px`;
  if (index === 2) return `${inner}px 16px 16px ${inner}px`;
  return `${inner}px`;
}

/** Stacked bands: outer corners stay round; seams soften as they peel. */
export function panelRadiusMobile(progress: number, index: number) {
  const seam = lerp(0, 14, remap(progress, 0, 0.25));
  if (index === 0) return `18px 18px ${seam}px ${seam}px`;
  if (index === 2) return `${seam}px ${seam}px 18px 18px`;
  return `${seam}px`;
}

function CardFace({
  card,
  index,
  compact,
}: {
  card: SplitCard;
  index: number;
  compact?: boolean;
}) {
  return (
    <div
      dir="rtl"
      lang="fa"
      className={`flex h-full flex-col justify-between overflow-hidden font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] antialiased ${
        compact ? "p-3.5 sm:p-4" : "p-5 sm:p-6"
      }`}
      style={{
        backgroundColor: card.bgColor,
        color: card.textColor,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.16)",
      }}
    >
      <div
        className={`flex items-center justify-between gap-2 font-medium tabular-nums opacity-55 ${
          compact ? "text-[10px]" : "text-[10px]"
        }`}
      >
        <span>{toFaDigits(String(index + 1).padStart(2, "0"))}</span>
        {card.kicker ? (
          <span className="min-w-0 truncate">{card.kicker}</span>
        ) : null}
      </div>
      <div className="text-start">
        <div
          className={`mb-2.5 h-px opacity-50 ${compact ? "w-5" : "mb-4 w-7"}`}
          style={{ backgroundColor: "currentColor" }}
        />
        <h3
          className={
            compact
              ? "text-[15px] font-semibold leading-snug text-balance"
              : "text-[22px] font-semibold leading-[1.25] text-balance sm:text-[26px]"
          }
        >
          {card.title}
        </h3>
        <p
          className={
            compact
              ? "mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-pretty opacity-80"
              : "mt-2.5 text-[13px] leading-relaxed text-pretty opacity-80 sm:text-sm"
          }
        >
          {card.description}
        </p>
      </div>
    </div>
  );
}

function PanelDesktop({
  card,
  index,
  progress,
  imageSrc,
}: {
  card: SplitCard;
  index: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  imageSrc: string;
}) {
  const x = useTransform(progress, (p) => panelShiftX(p, index));
  const rotateY = useTransform(progress, panelRotateY);
  const radius = useTransform(progress, (p) => panelRadius(p, index));

  return (
    <motion.div
      className={`relative h-full min-w-0 flex-[1_1_0] [transform-style:preserve-3d] ${
        index > 0 ? "-ml-px" : ""
      }`}
      style={{ x, rotateY, zIndex: index }}
    >
      <motion.div
        className="absolute inset-0 overflow-hidden [backface-visibility:hidden]"
        style={{ borderRadius: radius }}
      >
        <div
          className="absolute inset-0 h-full w-[300%]"
          style={{
            left: `${-100 * index}%`,
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      </motion.div>

      <motion.div
        className="absolute inset-0 overflow-hidden [backface-visibility:hidden]"
        style={{
          borderRadius: radius,
          transform: "rotateY(180deg)",
        }}
      >
        <CardFace card={card} index={index} />
      </motion.div>
    </motion.div>
  );
}

function PanelMobile({
  card,
  index,
  progress,
  imageSrc,
}: {
  card: SplitCard;
  index: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  imageSrc: string;
}) {
  const y = useTransform(progress, (p) => panelShiftY(p, index));
  const rotateX = useTransform(progress, panelRotateX);
  const radius = useTransform(progress, (p) => panelRadiusMobile(p, index));

  return (
    <motion.div
      className={`relative min-h-0 w-full flex-[1_1_0] [transform-style:preserve-3d] ${
        index > 0 ? "-mt-px" : ""
      }`}
      style={{ y, rotateX, zIndex: 3 - index }}
    >
      <motion.div
        className="absolute inset-0 overflow-hidden [backface-visibility:hidden]"
        style={{ borderRadius: radius }}
      >
        <div
          className="absolute inset-x-0 h-[300%] w-full"
          style={{
            top: `${-100 * index}%`,
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      </motion.div>

      <motion.div
        className="absolute inset-0 overflow-hidden [backface-visibility:hidden]"
        style={{
          borderRadius: radius,
          transform: "rotateX(180deg)",
        }}
      >
        <CardFace card={card} index={index} compact />
      </motion.div>
    </motion.div>
  );
}

export function ScrollSplitCards({
  items = DEFAULT_CARDS,
  imageSrc = DEFAULT_IMAGE,
  className = "",
  containerRef,
}: ScrollSplitCardsProps) {
  const cards = items.slice(0, 3);
  const mobile = useIsMobile();
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    ...(containerRef ? { container: containerRef } : {}),
    offset: ["start start", "end end"],
  });
  const scale = useTransform(
    scrollYProgress,
    mobile ? panelScaleMobile : panelScale,
  );
  const lift = useTransform(scrollYProgress, (p) =>
    lerp(0, mobile ? -36 : -72, remap(p, 0.85, 1)),
  );

  return (
    <div
      ref={trackRef}
      lang="fa"
      className={`relative h-[400vh] w-full bg-neutral-950 ${className}`}
    >
      <div
        className={`sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden ${
          mobile ? "[perspective:900px]" : "[perspective:1400px]"
        }`}
      >
        {mobile ? (
          <motion.div
            dir="ltr"
            className="flex h-[min(560px,72vh)] w-full max-w-md flex-col px-4 [transform-style:preserve-3d]"
            style={{ scale, y: lift }}
          >
            {cards.map((card, index) => (
              <PanelMobile
                key={card.title}
                card={card}
                index={index}
                progress={scrollYProgress}
                imageSrc={imageSrc}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            dir="ltr"
            className="flex h-[min(420px,56vh)] w-full max-w-4xl px-4 [transform-style:preserve-3d]"
            style={{ scale, y: lift }}
          >
            {cards.map((card, index) => (
              <PanelDesktop
                key={card.title}
                card={card}
                index={index}
                progress={scrollYProgress}
                imageSrc={imageSrc}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default ScrollSplitCards;
