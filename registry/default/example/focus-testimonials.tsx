"use client";

import React, { useState, useRef, useCallback, memo } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { ChevronDown } from "lucide-react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Testimonial {
  id: number;
  author: string;
  role: string;
  company: string;
  avatar: string;
  quote: string;
}

const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 0,
    author: "کریستیانو رونالدو",
    role: "ورزشکار و کارآفرین",
    company: "برند CR7",
    avatar: "/unsplash/1539571696357-5a69c17a67c6.webp",
    quote:
      "این محصول کاملاً شیوهٔ کارمان را عوض کرد. رابطش شهودی است و دقیقاً همان قابلیت‌هایی را دارد که لازم داشتیم.",
  },
  {
    id: 1,
    author: "جنسن هوانگ",
    role: "مدیرعامل و بنیان‌گذار",
    company: "انویدیا",
    avatar: "/unsplash/1502920917128-1aa500764cbd.webp",
    quote:
      "راه‌حل‌های زیادی امتحان کردم؛ این یکی با سادگی و قدرتش متمایز است. جداً پیشنهاد می‌کنم.",
  },
  {
    id: 2,
    author: "آنتونی رافی",
    role: "طراح ارشد محصول",
    company: "استودیو کرافت",
    avatar: "/unsplash/1524504388940-b1c1722653e1.webp",
    quote:
      "تیم پشت محصول فوق‌العاده پاسخ‌گوست و با هر به‌روزرسانی بهتر می‌شود.",
  },
  {
    id: 3,
    author: "لئو داس",
    role: "مدیرعامل",
    company: "داس کپیتال",
    avatar: "/unsplash/1507591064344-4c6ce005b128.webp",
    quote:
      "بهترین سرمایه‌گذاری امسال‌مان بود. بازگشت سرمایه عالی بوده و تیم عاشق کار با آن است.",
  },
];

const ADDITIONAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 4,
    author: "سارا چن",
    role: "معاون محصول",
    company: "اپکس سیستمز",
    avatar: "/unsplash/1494790108377-be9c29b29330.webp",
    quote:
      "جابه‌جایی به این پلتفرم زمان آنبوردینگ تیم را نصف کرد. اعضای جدید از روز اول بهره می‌دهند.",
  },
  {
    id: 5,
    author: "مارکوس ویلیامز",
    role: "معمار اصلی",
    company: "هایپراسکیل",
    avatar: "/unsplash/1463453091185-61582044d556.webp",
    quote:
      "فقط موتور تحلیلش ارزشش را دارد. بالاخره دید لحظه‌ای روی کل معماری داریم.",
  },
  {
    id: 6,
    author: "پریا نایر",
    role: "سرپرست طراحی",
    company: "دیزاین لب",
    avatar: "/unsplash/1531123897727-8f129e1688ce.webp",
    quote:
      "پشتیبانی مشتری عالی است. هر سؤال ظرف چند دقیقه با دقت پاسخ داده می‌شود.",
  },
  {
    id: 7,
    author: "تام اریکسون",
    role: "بنیان‌گذار و مدیرعامل",
    company: "نورت‌تک",
    avatar: "/unsplash/1472099645785-5658abf4ff4e.webp",
    quote:
      "ده‌ها ابزار را قبل از این ارزیابی کردیم. هیچ‌کدام به صیقل و سرعتش نزدیک هم نیست.",
  },
  {
    id: 8,
    author: "عایشه اوکافور",
    role: "مدیر عملیات",
    company: "گلوبال‌سینک",
    avatar: "/unsplash/1487412720507-e7ab37603c6f.webp",
    quote:
      "گردش‌کارهای موبایل بی‌نقص‌اند. استقرارهای حیاتی را در حرکت مدیریت می‌کنم بدون اینکه چیزی از دست برود.",
  },
  {
    id: 9,
    author: "دیوید پارک",
    role: "مدیر محصول گروهی",
    company: "فلو‌استیت",
    avatar: "/unsplash/1506744038136-46273834b3fb.webp",
    quote:
      "کل تیم مهندسی و طراحی بدون اصطکاک پذیرفتندش. با ابزارهای قبلی هرگز چنین اتفاقی نیفتاده بود.",
  },
  {
    id: 10,
    author: "لنا مولر",
    role: "مدیر فناوری",
    company: "کوانتوم لب",
    avatar: "/unsplash/1438761681033-6461ffad8d80.webp",
    quote:
      "قابلیت‌های خودکارسازی بیش از ۲۵ ساعت در هفته صرفه‌جویی می‌کند. ظرف کمتر از یک ماه هزینه‌اش برگشت.",
  },
  {
    id: 11,
    author: "راوی شانکار",
    role: "مدیر خلاقیت",
    company: "لومینری",
    avatar: "/unsplash/1506794778202-cad84cf45f1d.webp",
    quote:
      "دقت به جزئیات باورنکردنی است. هر انتقال و ژستی نرم، روان و لذت‌بخش حس می‌شود.",
  },
];

const ALL_ITEMS = [...INITIAL_TESTIMONIALS, ...ADDITIONAL_TESTIMONIALS];
const ALL_COUNT_FA = ALL_ITEMS.length.toLocaleString("fa-IR");

const TOOLTIP_PAD = 10;
/** Fallback until the tip mounts and can be measured. */
const TOOLTIP_FALLBACK_W = 200;
const TOOLTIP_FALLBACK_H = 44;

const TestimonialSpanItem = memo(function TestimonialSpanItem({
  item,
  isHovered,
  hasHover,
  onHover,
  onPointer,
}: {
  item: Testimonial;
  isHovered: boolean;
  hasHover: boolean;
  onHover: (id: number) => void;
  onPointer: (clientX: number, clientY: number) => void;
}) {
  // Theme-aware: hovered must stay readable on dark card (was hard-coded near-black).
  const stateClass = !hasHover
    ? "opacity-75 blur-0 text-slate-500 dark:text-slate-400"
    : isHovered
      ? "opacity-100 blur-0 text-slate-900 dark:text-slate-50"
      : "opacity-30 blur-[2.8px] text-slate-400 dark:text-slate-500";

  const avatarClass = !hasHover
    ? "grayscale-[25%] opacity-90 scale-100"
    : isHovered
      ? "grayscale-0 opacity-100 scale-110 shadow-none"
      : "grayscale-[70%] blur-[1.2px] opacity-35 scale-95 shadow-none";

  return (
    <span
      onMouseEnter={(e) => {
        onHover(item.id);
        onPointer(e.clientX, e.clientY);
      }}
      onMouseMove={(e) => onPointer(e.clientX, e.clientY)}
      onTouchStart={(e) => {
        const t = e.touches[0];
        if (!t) return;
        onHover(item.id);
        // Anchor near the avatar (inline-start in RTL) so the tip
        // stays close on narrow phones instead of chasing the finger.
        const box = e.currentTarget.getBoundingClientRect();
        onPointer(box.right - 12, box.top + 8);
      }}
      className={cn(
        "inline cursor-pointer select-none transition-[opacity,filter,color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[opacity,filter,color]",
        stateClass,
      )}
    >
      <span
        className={cn(
          "me-2 inline-block overflow-hidden rounded-full align-middle transition-[transform,filter,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[transform,filter,opacity]",
          avatarClass,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.avatar}
          alt={item.author}
          width={36}
          height={36}
          loading="eager"
          className="inline-block h-7 w-7 scale-110 rounded-full border-0 object-cover align-middle outline-none shadow-none ring-0 sm:h-9 sm:w-9 md:h-10 md:w-10"
        />
      </span>
      {item.quote}
      <span className="relative inline-block h-0 w-0 align-baseline" />{" "}
    </span>
  );
});

export default function FocusTestimonials() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [showMore, setShowMore] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  const rawMouseX = useMotionValue(0);
  const rawMouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 320, mass: 0.45 };
  const smoothX = useSpring(rawMouseX, springConfig);
  const smoothY = useSpring(rawMouseY, springConfig);

  const activeItem =
    hoveredId !== null ? ALL_ITEMS.find((t) => t.id === hoveredId) : null;

  const placeTooltip = useCallback(
    (clientX: number, clientY: number) => {
      const box = containerRef.current;
      if (!box) return;
      const rect = box.getBoundingClientRect();
      const tip = tipRef.current;
      const tipW = tip?.offsetWidth || TOOLTIP_FALLBACK_W;
      const tipH = tip?.offsetHeight || TOOLTIP_FALLBACK_H;

      // Physical left/top — mouse coords are viewport-absolute.
      const isNarrow = rect.width < 480;
      const offsetY = isNarrow ? -40 : -52;
      let x = clientX - rect.left - (isNarrow ? 8 : 16);
      let y = clientY - rect.top + offsetY;

      // Prefer above the pointer; if clipped, flip below.
      if (y < TOOLTIP_PAD) {
        y = clientY - rect.top + (isNarrow ? 14 : 18);
      }

      const maxX = Math.max(TOOLTIP_PAD, rect.width - tipW - TOOLTIP_PAD);
      const maxY = Math.max(TOOLTIP_PAD, rect.height - tipH - TOOLTIP_PAD);
      x = Math.min(Math.max(TOOLTIP_PAD, x), maxX);
      y = Math.min(Math.max(TOOLTIP_PAD, y), maxY);

      rawMouseX.set(x);
      rawMouseY.set(y);
    },
    [rawMouseX, rawMouseY],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (hoveredId === null) return;
      placeTooltip(e.clientX, e.clientY);
    },
    [hoveredId, placeTooltip],
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredId(null);
  }, []);

  const handleHover = useCallback((id: number) => {
    setHoveredId(id);
  }, []);

  const handleToggleShowMore = () => {
    setShowMore((prev) => {
      const nextState = !prev;
      if (
        !nextState &&
        hoveredId !== null &&
        hoveredId >= INITIAL_TESTIMONIALS.length
      ) {
        setHoveredId(null);
      }
      return nextState;
    });
  };

  const hasHover = hoveredId !== null;

  return (
    <div
      dir="rtl"
      lang="fa"
      className="relative flex w-full select-none flex-col items-center justify-center overflow-visible bg-transparent p-2 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal sm:p-6 md:p-10 lg:p-14"
    >
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative z-10 flex w-full max-w-[1400px] flex-col overflow-visible rounded-2xl border border-black/[0.06] bg-white p-4 text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] transition-all dark:border-white/10 dark:bg-[hsl(225_7%_14%)] dark:text-slate-100 dark:shadow-[0_1px_2px_rgba(0,0,0,0.2),0_8px_24px_rgba(0,0,0,0.25)] sm:rounded-3xl sm:p-8 md:p-12"
      >
        <AnimatePresence>
          {activeItem && (
            <motion.div
              ref={tipRef}
              key="author-tooltip"
              initial={{ opacity: 0, scale: 0.85, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{
                opacity: 0,
                scale: 0.85,
                y: 6,
                transition: { duration: 0.15, ease: "easeOut" },
              }}
              transition={{
                duration: 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                x: smoothX,
                y: smoothY,
              }}
              className="pointer-events-none absolute top-0 left-0 z-50 flex max-w-[min(100%,16rem)] items-center gap-2 rounded-full border border-white/20 bg-neutral-950/90 py-1.5 ps-1.5 pe-3 text-white shadow-2xl backdrop-blur-xl will-change-[transform,opacity] sm:gap-2.5 sm:py-2 sm:ps-2 sm:pe-4"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div className="h-6 w-6 flex-shrink-0 overflow-hidden rounded-full sm:h-7 sm:w-7">
                <img
                  src={activeItem.avatar}
                  alt={activeItem.author}
                  width={28}
                  height={28}
                  className="h-full w-full scale-110 border-0 object-cover outline-none shadow-none ring-0"
                />
              </div>
              <div className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-[11px] font-semibold text-white sm:text-sm">
                  {activeItem.author}
                </span>
                <span className="truncate text-[9px] font-normal text-slate-300 sm:text-xs">
                  {activeItem.role} ·{" "}
                  <span className="font-medium text-white">
                    {activeItem.company}
                  </span>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative flex-1 text-[15px] leading-[155%] font-medium text-slate-900 sm:text-xl sm:leading-[148%] md:text-3xl lg:text-[38px] dark:text-slate-100">
          {INITIAL_TESTIMONIALS.map((item) => (
            <TestimonialSpanItem
              key={item.id}
              item={item}
              isHovered={hoveredId === item.id}
              hasHover={hasHover}
              onHover={handleHover}
              onPointer={placeTooltip}
            />
          ))}

          <span
            className={cn(
              "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
              showMore ? "inline opacity-100" : "hidden opacity-0",
            )}
          >
            {ADDITIONAL_TESTIMONIALS.map((item) => (
              <TestimonialSpanItem
                key={item.id}
                item={item}
                isHovered={hoveredId === item.id}
                hasHover={hasHover}
                onHover={handleHover}
                onPointer={placeTooltip}
              />
            ))}
          </span>
        </div>

        <div className="mt-4 flex justify-center sm:mt-10">
          <button
            type="button"
            onClick={handleToggleShowMore}
            className="group inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900 focus-visible:underline focus-visible:outline-none active:scale-[0.98] dark:text-slate-400 dark:hover:text-slate-100"
          >
            <span>
              {showMore
                ? "کمتر نشان بده"
                : `همهٔ نظرات را بخوان (${ALL_COUNT_FA})`}
            </span>

            <motion.span
              animate={{ rotate: showMore ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 360, damping: 22 }}
              className="inline-flex"
            >
              <ChevronDown className="h-3.5 w-3.5 text-current" />
            </motion.span>
          </button>
        </div>
      </div>
    </div>
  );
}
