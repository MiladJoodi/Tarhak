"use client";

import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import React, { useState, useId, useRef } from "react";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";

const shot = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;

const PHOTOS = [
  {
    id: "photo-1",
    src: shot("1517336714731-489689fd1ca8"),
    alt: "چیدمان فناوری",
    rotation: -15,
    x: -90,
    y: 10,
    zIndex: 10,
  },
  {
    id: "photo-2",
    src: shot("1581291518633-83b4ebd1d83e"),
    alt: "پژوهش طراحی",
    rotation: -3,
    x: -10,
    y: -15,
    zIndex: 20,
  },
  {
    id: "photo-3",
    src: shot("1498050108023-c5249f4df085"),
    alt: "کد و توسعه",
    rotation: 12,
    x: 75,
    y: 5,
    zIndex: 30,
  },
  {
    id: "photo-4",
    src: shot("1551288049-bebda4e38f71"),
    alt: "رابط داشبورد",
  },
  {
    id: "photo-5",
    src: shot("1561070791-2526d30994b5"),
    alt: "طراحی محصول",
  },
  {
    id: "photo-6",
    src: shot("1497366216548-37526070297c"),
    alt: "لپ‌تاپ روی میز",
  },
  {
    id: "photo-7",
    src: shot("1522071820081-009f0129c71c"),
    alt: "همکاری تیمی",
  },
  {
    id: "photo-8",
    src: shot("1586281380349-632531db7ed4"),
    alt: "وایرفریم تجربه کاربری",
  },
  {
    id: "photo-9",
    src: shot("1519389950473-47ba0277781c"),
    alt: "میز کار توسعه‌دهنده",
  },
];

const PHOTO_COUNT_FA = PHOTOS.length.toLocaleString("fa-IR");

const transition = {
  type: "spring",
  stiffness: 160,
  damping: 18,
  mass: 1,
} as const;

export default function ExpandableGallery() {
  const [isExpanded, setIsExpanded] = useState(false);
  const layoutGroupId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  useOutsideClick(containerRef, () => {
    if (isExpanded) {
      setIsExpanded(false);
    }
  });

  return (
    <section
      dir="rtl"
      lang="fa"
      className="relative flex min-h-[850px] w-full flex-col items-center justify-start overflow-hidden bg-background px-4 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal md:px-8"
    >
      <LayoutGroup id={layoutGroupId}>
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center">
          <div className="mb-2 flex h-12 w-full items-center justify-between px-4">
            <AnimatePresence>
              {isExpanded && (
                <motion.button
                  key="back-button"
                  type="button"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onClick={() => setIsExpanded(false)}
                  className="group z-50 flex items-center gap-2 text-muted-foreground transition-all hover:text-foreground"
                >
                  <div className="rounded-full bg-muted p-2 text-foreground transition-colors group-hover:bg-accent">
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      width={20}
                      height={20}
                    />
                  </div>
                  <span className="font-medium">بازگشت</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            ref={containerRef}
            layout
            className={cn(
              "relative w-full",
              isExpanded
                ? "grid grid-cols-2 gap-6 px-4 md:gap-8 lg:grid-cols-3"
                : "flex flex-col items-center justify-start pt-4"
            )}
            transition={transition}
          >
            <div
              className={cn(
                "relative",
                isExpanded
                  ? "contents"
                  : "mb-8 flex h-[450px] w-full items-center justify-center"
              )}
            >
              {PHOTOS.map((photo, index) => {
                const isPrimary = index < 3;
                if (!isPrimary && !isExpanded) return null;

                return (
                  <motion.div
                    key={`card-${photo.id}`}
                    layoutId={`card-container-${photo.id}`}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      rotate: !isExpanded ? photo.rotation || 0 : 0,
                      x: !isExpanded ? photo.x || 0 : 0,
                      y: !isExpanded ? photo.y || 0 : 0,
                      zIndex: !isExpanded ? photo.zIndex || index : 10,
                    }}
                    transition={transition}
                    whileHover={
                      !isExpanded
                        ? {
                            scale: 1.05,
                            y: (photo.y || 0) - 15,
                            rotate: (photo.rotation || 0) * 0.8,
                            zIndex: 50,
                            transition: {
                              type: "spring",
                              stiffness: 400,
                              damping: 25,
                            },
                          }
                        : { scale: 1.02 }
                    }
                    className={cn(
                      "cursor-pointer overflow-hidden bg-muted",
                      isExpanded
                        ? "relative aspect-square rounded-[2rem] border-4 border-background shadow-lg md:rounded-[3rem] md:border-[6px]"
                        : "absolute h-44 w-44 rounded-[2.5rem] border-[6px] border-background shadow-[0_20px_50px_rgba(0,0,0,0.15)] md:h-60 md:w-60 md:rounded-[3rem]"
                    )}
                    onClick={() => !isExpanded && setIsExpanded(true)}
                  >
                    <motion.div
                      layoutId={`image-inner-${photo.id}`}
                      layout="position"
                      className="relative h-full w-full"
                      transition={transition}
                    >
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        referrerPolicy="no-referrer"
                        draggable={false}
                        className="pointer-events-none absolute inset-0 size-full object-cover select-none"
                      />
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>

            <AnimatePresence>
              {!isExpanded && (
                <motion.div
                  key="stack-content"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="max-w-2xl space-y-8 text-center"
                >
                  <h2 className="text-balance text-2xl leading-tight font-normal text-foreground/90 md:text-4xl">
                    آدم‌ها عاشق کامپوننت نمی‌شوند.{" "}
                    <br className="hidden md:block" />
                    عاشق حس‌وحال محصول می‌شوند.
                  </h2>

                  <button
                    type="button"
                    onClick={() => setIsExpanded(true)}
                    className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-foreground px-5 text-[15px] font-medium text-background transition-[opacity,transform] duration-150 ease-out hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/25 active:scale-[0.96]"
                  >
                    دیدن همه {PHOTO_COUNT_FA}
                    <HugeiconsIcon
                      icon={ArrowLeft01Icon}
                      width={16}
                      height={16}
                    />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </LayoutGroup>
    </section>
  );
}
