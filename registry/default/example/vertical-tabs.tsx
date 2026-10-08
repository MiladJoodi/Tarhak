"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

// Change Here
const SERVICES = [
  {
    id: "۰۱",
    title: "طراحی وب",
    description:
      "تجربه‌های دیجیتال زیبا، کاربردی و کاربرمحور می‌سازیم.",
    image:
      "/unsplash/1539571696357-5a69c17a67c6.webp",
  },
  {
    id: "۰۲",
    title: "توسعه با فریمر",
    description: "سایت‌های پربازده و متحرک با فریمر می‌سازیم.",
    image:
      "/unsplash/1541123603104-512919d6a96c.webp",
  },
  {
    id: "۰۳",
    title: "برندینگ",
    description:
      "هویت بصری و صدای برندتان را برای اثری ماندگار تعریف می‌کنیم.",
    image:
      "/unsplash/1541701494587-cb58502866ab.webp",
  },
];

const AUTO_PLAY_DURATION = 5000;

const slideTransition = {
  duration: 0.34,
  ease: [0.32, 0.72, 0, 1] as const,
};

const slideVariants = {
  enter: { y: "-100%" },
  center: { y: 0 },
  exit: { y: "100%" },
};

export default function VerticalTabs() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % SERVICES.length);
  }, []);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + SERVICES.length) % SERVICES.length);
  }, []);

  const handleTabClick = (index: number) => {
    if (index === activeIndex) return;
    setActiveIndex(index);
    setIsPaused(false);
  };

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      handleNext();
    }, AUTO_PLAY_DURATION);

    return () => clearInterval(interval);
  }, [activeIndex, isPaused, handleNext]);

  const active = SERVICES[activeIndex]!;

  return (
    <section
      dir="rtl"
      lang="fa"
      className="@container w-full bg-background py-8 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal md:py-16"
    >
      <div className="mx-auto w-full px-6 sm:px-10 md:px-16 lg:px-24 xl:px-28">
        <div className="grid grid-cols-1 items-start gap-10 @min-[720px]:grid-cols-12 @min-[720px]:gap-12">
          <div className="flex flex-col justify-center order-2 pt-4 @min-[720px]:col-span-5 @min-[720px]:order-1">
            <div className="mb-12 space-y-1">
              <h2 className="text-balance text-3xl font-medium tracking-normal text-foreground md:text-4xl lg:text-5xl">
                چطور می‌توانم کمکتان کنم
              </h2>
              <span className="ms-0.5 block text-[10px] font-medium tracking-normal text-muted-foreground">
                (خدمات)
              </span>
            </div>

            <div className="flex flex-col space-y-0">
              {SERVICES.map((service, index) => {
                const isActive = activeIndex === index;
                return (
                  <button
                    key={service.id}
                    onClick={() => handleTabClick(index)}
                    className={cn(
                      "group relative flex cursor-pointer items-start gap-4 border-t border-border/50 py-6 text-start transition-[color] duration-150 ease-out first:border-0 md:py-8",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground/60 hover:text-foreground"
                    )}
                  >
                    <div className="absolute inset-y-0 start-[-16px] w-[2px] bg-muted md:start-[-24px]">
                      {isActive && (
                        <motion.div
                          key={`progress-${index}-${isPaused}`}
                          className="absolute top-0 start-0 w-full origin-top bg-foreground"
                          initial={{ height: "0%" }}
                          animate={
                            isPaused ? { height: "0%" } : { height: "100%" }
                          }
                          transition={{
                            duration: AUTO_PLAY_DURATION / 1000,
                            ease: "linear",
                          }}
                        />
                      )}
                    </div>

                    <span className="mt-1 text-[9px] font-medium tabular-nums opacity-50 md:text-[10px]">
                      {service.id}/
                    </span>

                    <div className="flex flex-col gap-2 flex-1">
                      <span
                        className={cn(
                          "text-2xl font-normal tracking-normal transition-colors duration-150 ease-out md:text-3xl @min-[720px]:text-4xl",
                          isActive ? "text-foreground" : ""
                        )}
                      >
                        {service.title}
                      </span>

                      <AnimatePresence mode="wait">
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{
                              duration: 0.3,
                              ease: [0.23, 1, 0.32, 1],
                            }}
                            className="overflow-hidden"
                          >
                            <p className="text-muted-foreground text-sm md:text-base font-normal leading-relaxed max-w-sm pb-2">
                              {service.description}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex h-full flex-col justify-end order-1 @min-[720px]:col-span-7 @min-[720px]:order-2">
            <div
              className="relative group/gallery"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="relative aspect-4/5 overflow-hidden rounded-3xl border border-border/40 bg-muted/30 md:aspect-4/3 md:rounded-[2.5rem] @min-[720px]:aspect-16/11">
                <AnimatePresence initial={false}>
                  <GallerySlide
                    key={active.id}
                    service={active}
                    onClick={handleNext}
                  />
                </AnimatePresence>

                <div className="absolute bottom-6 end-6 z-20 flex gap-2 md:bottom-8 md:end-8 md:gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-background/80 text-foreground backdrop-blur-md transition-all hover:bg-background active:scale-90 md:h-12 md:w-12"
                    aria-label="قبلی"
                  >
                    <HugeiconsIcon icon={ArrowRight01Icon} size={20} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-background/80 text-foreground backdrop-blur-md transition-all hover:bg-background active:scale-90 md:h-12 md:w-12"
                    aria-label="بعدی"
                  >
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function GallerySlide({
  service,
  onClick,
}: {
  service: (typeof SERVICES)[number];
  onClick: () => void;
}) {
  return (
    <motion.div
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={slideTransition}
      className="absolute inset-0 h-full w-full cursor-pointer"
      onClick={onClick}
    >
      <img
        src={service.image}
        alt={service.title}
        className="m-0! block size-full object-cover p-0!"
      />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-60" />
    </motion.div>
  );
}
