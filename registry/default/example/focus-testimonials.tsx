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
    avatar:
      "/unsplash/1539571696357-5a69c17a67c6.webp",
    quote:
      "این محصول کاملاً شیوهٔ کارمان را عوض کرد. رابطش شهودی است و دقیقاً همان قابلیت‌هایی را دارد که لازم داشتیم.",
  },
  {
    id: 1,
    author: "جنسن هوانگ",
    role: "مدیرعامل و بنیان‌گذار",
    company: "انویدیا",
    avatar:
      "/unsplash/1502920917128-1aa500764cbd.webp",
    quote:
      "راه‌حل‌های زیادی امتحان کردم؛ این یکی با سادگی و قدرتش متمایز است. جداً پیشنهاد می‌کنم.",
  },
  {
    id: 2,
    author: "آنتونی رافی",
    role: "طراح ارشد محصول",
    company: "استودیو کرافت",
    avatar:
      "/unsplash/1524504388940-b1c1722653e1.webp",
    quote:
      "تیم پشت محصول فوق‌العاده پاسخ‌گوست و با هر به‌روزرسانی بهتر می‌شود.",
  },
  {
    id: 3,
    author: "لئو داس",
    role: "مدیرعامل",
    company: "داس کپیتال",
    avatar:
      "/unsplash/1507591064344-4c6ce005b128.webp",
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
    avatar:
      "/unsplash/1494790108377-be9c29b29330.webp",
    quote:
      "جابه‌جایی به این پلتفرم زمان آنبوردینگ تیم را نصف کرد. اعضای جدید از روز اول بهره می‌دهند.",
  },
  {
    id: 5,
    author: "مارکوس ویلیامز",
    role: "معمار اصلی",
    company: "هایپراسکیل",
    avatar:
      "/unsplash/1463453091185-61582044d556.webp",
    quote:
      "فقط موتور تحلیلش ارزشش را دارد. بالاخره دید لحظه‌ای روی کل معماری داریم.",
  },
  {
    id: 6,
    author: "پریا نایر",
    role: "سرپرست طراحی",
    company: "دیزاین لب",
    avatar:
      "/unsplash/1531123897727-8f129e1688ce.webp",
    quote:
      "پشتیبانی مشتری عالی است. هر سؤال ظرف چند دقیقه با دقت پاسخ داده می‌شود.",
  },
  {
    id: 7,
    author: "تام اریکسون",
    role: "بنیان‌گذار و مدیرعامل",
    company: "نورت‌تک",
    avatar:
      "/unsplash/1472099645785-5658abf4ff4e.webp",
    quote:
      "ده‌ها ابزار را قبل از این ارزیابی کردیم. هیچ‌کدام به صیقل و سرعتش نزدیک هم نیست.",
  },
  {
    id: 8,
    author: "عایشه اوکافور",
    role: "مدیر عملیات",
    company: "گلوبال‌سینک",
    avatar:
      "/unsplash/1487412720507-e7ab37603c6f.webp",
    quote:
      "گردش‌کارهای موبایل بی‌نقص‌اند. استقرارهای حیاتی را در حرکت مدیریت می‌کنم بدون اینکه چیزی از دست برود.",
  },
  {
    id: 9,
    author: "دیوید پارک",
    role: "مدیر محصول گروهی",
    company: "فلو‌استیت",
    avatar:
      "/unsplash/1506744038136-46273834b3fb.webp",
    quote:
      "کل تیم مهندسی و طراحی بدون اصطکاک پذیرفتندش. با ابزارهای قبلی هرگز چنین اتفاقی نیفتاده بود.",
  },
  {
    id: 10,
    author: "لنا مولر",
    role: "مدیر فناوری",
    company: "کوانتوم لب",
    avatar:
      "/unsplash/1438761681033-6461ffad8d80.webp",
    quote:
      "قابلیت‌های خودکارسازی بیش از ۲۵ ساعت در هفته صرفه‌جویی می‌کند. ظرف کمتر از یک ماه هزینه‌اش برگشت.",
  },
  {
    id: 11,
    author: "راوی شانکار",
    role: "مدیر خلاقیت",
    company: "لومینری",
    avatar:
      "/unsplash/1506794778202-cad84cf45f1d.webp",
    quote:
      "دقت به جزئیات باورنکردنی است. هر انتقال و ژستی نرم، روان و لذت‌بخش حس می‌شود.",
  },
];

const ALL_ITEMS = [...INITIAL_TESTIMONIALS, ...ADDITIONAL_TESTIMONIALS];
const ALL_COUNT_FA = ALL_ITEMS.length.toLocaleString("fa-IR");

const TestimonialSpanItem = memo(function TestimonialSpanItem({
  item,
  isHovered,
  hasHover,
  onHover,
}: {
  item: Testimonial;
  isHovered: boolean;
  hasHover: boolean;
  onHover: (id: number) => void;
}) {
  const stateClass = !hasHover
    ? "opacity-75 blur-0 text-[rgb(115,115,122)]"
    : isHovered
      ? "opacity-100 blur-0 text-[rgb(10,10,14)]"
      : "opacity-30 blur-[2.8px] text-[rgb(175,175,175)]";

  const avatarClass = !hasHover
    ? "grayscale-[25%] opacity-90 scale-100"
    : isHovered
      ? "grayscale-0 opacity-100 scale-110 shadow-none"
      : "grayscale-[70%] blur-[1.2px] opacity-35 scale-95 shadow-none";

  return (
    <span
      onMouseEnter={() => onHover(item.id)}
      className={cn(
        "inline cursor-pointer select-none transition-[opacity,filter,color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[opacity,filter,color]",
        stateClass
      )}
    >
      <span
        className={cn(
          "me-2.5 inline-block overflow-hidden rounded-full align-middle transition-[transform,filter,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[transform,filter,opacity]",
          avatarClass
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.avatar}
          alt={item.author}
          width={44}
          height={44}
          loading="eager"
          className="inline-block h-8 w-8 scale-110 rounded-full border-0 object-cover align-middle outline-none shadow-none ring-0 sm:h-10 sm:w-10 md:h-11 md:w-11"
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

  const rawMouseX = useMotionValue(0);
  const rawMouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 320, mass: 0.45 };
  const smoothX = useSpring(rawMouseX, springConfig);
  const smoothY = useSpring(rawMouseY, springConfig);

  const activeItem =
    hoveredId !== null ? ALL_ITEMS.find((t) => t.id === hoveredId) : null;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      rawMouseX.set(e.clientX - rect.left);
      rawMouseY.set(e.clientY - rect.top);
    },
    [rawMouseX, rawMouseY]
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
      className="relative flex min-h-screen w-full select-none flex-col items-center justify-center overflow-hidden bg-transparent p-4 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal sm:p-8 md:p-14 lg:p-20"
    >
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative z-10 flex w-full max-w-[1400px] flex-col rounded-3xl border border-black/[0.06] bg-white p-6 text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] transition-all dark:border-white/10 dark:bg-[hsl(225_7%_14%)] dark:text-slate-100 dark:shadow-[0_1px_2px_rgba(0,0,0,0.2),0_8px_24px_rgba(0,0,0,0.25)] sm:p-10 md:p-14"
      >
        <AnimatePresence>
          {activeItem && (
            <motion.div
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
                translateX: -18,
                translateY: -56,
              }}
              className="pointer-events-none absolute top-0 start-0 z-50 flex items-center gap-2.5 rounded-full border border-white/20 bg-neutral-950/90 py-2 ps-2 pe-4 text-white shadow-2xl backdrop-blur-xl will-change-[transform,opacity]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-full">
                <img
                  src={activeItem.avatar}
                  alt={activeItem.author}
                  width={28}
                  height={28}
                  className="h-full w-full scale-110 border-0 object-cover outline-none shadow-none ring-0"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="whitespace-nowrap text-xs font-semibold text-white sm:text-sm">
                  {activeItem.author}
                </span>
                <span className="whitespace-nowrap text-[10px] font-normal text-slate-300 sm:text-xs">
                  {activeItem.role} ·{" "}
                  <span className="font-medium text-white">
                    {activeItem.company}
                  </span>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative flex-1 text-2xl leading-[148%] font-medium text-slate-900 sm:text-3xl md:text-4xl lg:text-[38px]">
          {INITIAL_TESTIMONIALS.map((item) => (
            <TestimonialSpanItem
              key={item.id}
              item={item}
              isHovered={hoveredId === item.id}
              hasHover={hasHover}
              onHover={handleHover}
            />
          ))}

          <span
            className={cn(
              "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
              showMore ? "inline opacity-100" : "hidden opacity-0"
            )}
          >
            {ADDITIONAL_TESTIMONIALS.map((item) => (
              <TestimonialSpanItem
                key={item.id}
                item={item}
                isHovered={hoveredId === item.id}
                hasHover={hasHover}
                onHover={handleHover}
              />
            ))}
          </span>
        </div>

        <div className="mt-8 flex justify-center sm:mt-10">
          <button
            type="button"
            onClick={handleToggleShowMore}
            className="group inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900 focus-visible:underline focus-visible:outline-none active:scale-[0.98]"
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
