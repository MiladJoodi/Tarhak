"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  content: string;
  color: string;
  textColor: string;
}

// Change Here
const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "مریم رضایی",
    role: "مدیر محصول، اکواستریم",
    avatar: "/ui/memoji/1.svg",
    content:
      "رابط آن‌قدر ساده است که تیممان ظرف چند ساعت راه افتاد. برای استارتاپ‌های تندکار عالی است.",
    color: "#E0F2FE",
    textColor: "#1E3A8A",
  },
  {
    id: 2,
    name: "سارا احمدی",
    role: "مدیر تجربه کاربری، کرییتیوفلو",
    avatar: "/ui/memoji/6.svg",
    content:
      "ده‌ها ابزار را امتحان کردیم؛ این یکی با طراحی تمیزش متمایز است. روند کارمان را عوض کرد.",
    color: "#F3E8FF",
    textColor: "#581C87",
  },
  {
    id: 3,
    name: "نیما کریمی",
    role: "مدیرعامل، تکنووا",
    avatar: "/ui/memoji/4.svg",
    content:
      "بزرگ‌کردن زیرساخت قبلاً کابوس بود. حالا می‌توانیم روی ساخت قابلیت تمرکز کنیم.",
    color: "#DCFCE7",
    textColor: "#064E3B",
  },
  {
    id: 4,
    name: "علی موسوی",
    role: "مدیر فنی، نکست‌جن",
    avatar: "/ui/memoji/6.svg",
    content:
      "فقط امنیتش ارزشش را دارد. مشتری‌ها با خیال راحت‌تری می‌دانند داده‌شان رمزنگاری شده است.",
    color: "#FEF9C3",
    textColor: "#713F12",
  },
];

export default function ShakeTestimonial() {
  const [cards, setCards] = useState(testimonials);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);

    setTimeout(() => {
      setCards((prev) => {
        const [first, ...rest] = prev;
        return [...rest, first];
      });
      setIsAnimating(false);
    }, 600);
  }, [isAnimating]);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 1500);
    return () => clearInterval(interval);
  }, [handleNext]);

  return (
    <div
      dir="rtl"
      lang="fa"
      className="flex min-h-[650px] w-full items-center justify-center overflow-hidden bg-transparent p-4 py-4 font-sans tracking-normal max-sm:min-h-[500px]"
    >
      <div
        className="relative h-[240px] w-full max-w-[370px] md:h-[320px] lg:h-[310px] lg:max-w-[440px]"
        style={{ perspective: "1200px" }}
      >
        <AnimatePresence mode="popLayout">
          {cards.map((card, index) => {
            const isTop = index === 0;

            return (
              <motion.div
                key={card.id}
                layout
                style={{
                  backgroundColor: card.color,
                  zIndex: testimonials.length - index,
                  position: "absolute",
                  top: 0,
                  insetInlineStart: 0,
                  transformOrigin: "center center",
                  borderColor: `${card.textColor}20`,
                }}
                initial={{
                  scale: 0.7,
                  opacity: 0,
                  y: 40,
                  rotateX: -20,
                }}
                animate={{
                  scale:
                    isTop && isAnimating
                      ? [1, 1.05, 1, 1.05, 1, 1, 0.9]
                      : 1 - index * 0.05,
                  y:
                    isTop && isAnimating
                      ? [0, 0, 0, 0, 0, 0, -300]
                      : index * 15,
                  rotateX:
                    isTop && isAnimating ? [0, 0, 0, 0, 0, 0, 15] : -index * 2,
                  x: isTop && isAnimating ? [0, -12, 12, -12, 12, 0, 0] : 0,
                  rotate: isTop && isAnimating ? [0, -2, 2, -2, 2, 0, -5] : 0,

                  opacity: index < 4 ? 1 : 0,

                  transition:
                    isTop && isAnimating
                      ? {
                          duration: 0.6,
                          times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 1],
                          ease: "easeOut",
                        }
                      : {
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                          mass: 0.6,
                        },
                }}
                className={cn(
                  "h-full w-full rounded-[48px] p-8 shadow-[0_12px_20px_rgba(0,0,0,0.03)] md:p-10",
                  "flex flex-col justify-between overflow-hidden border",
                  "cursor-pointer ring-1 ring-black/5 backdrop-blur-3xl select-none",
                  "preserve-3d transition-shadow duration-500 hover:shadow-[0_13px_60px_rgba(0,0,0,0.1)]",
                )}
                onClick={handleNext}
              >
                <div className="flex flex-col gap-4 md:gap-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-white/50 shadow-inner max-sm:rounded-xl lg:h-14 lg:w-14">
                      <img
                        src={card.avatar}
                        className="h-full w-full object-contain"
                        alt={card.name}
                      />
                    </div>

                    <div className="flex flex-col justify-center text-start">
                      <h3
                        className="!m-0 !p-0 text-lg leading-tight font-bold max-sm:text-base md:text-xl"
                        style={{ color: card.textColor }}
                      >
                        {card.name}
                      </h3>
                      <p
                        className="!m-0 !p-0 text-xs opacity-60 max-sm:text-xss lg:text-sm"
                        style={{ color: card.textColor }}
                      >
                        {card.role}
                      </p>
                    </div>
                  </div>
                  <p
                    className="!m-0 !p-0 text-xl leading-[1.5] font-medium max-sm:text-lg md:text-2xl lg:text-2xl"
                    style={{ color: card.textColor }}
                  >
                    «{card.content}»
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
