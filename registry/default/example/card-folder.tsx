"use client";

import { useState } from "react";
import { motion, type Transition } from "motion/react";
import clsx from "clsx";

interface FolderCardItem {
  id?: string | number;
  number: string;
  title: string;
  description: string;
  bgImage?: string;
  characterImage: string;
  folderColor: string;
  borderColor: string;
  textColor?: string;
  subTextColor?: string;
  href?: string;
}

const OBJECT =
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis";

const DEMO_CARDS: FolderCardItem[] = [
  {
    id: "01",
    number: "۰۱",
    title: "آزمایشگاه پالت",
    description: "سامانهٔ رنگ نرم برای تیم‌های محصول.",
    folderColor: "#E8DFFB",
    borderColor: "#D4C4F5",
    textColor: "#3B2F63",
    subTextColor: "rgba(59, 47, 99, 0.65)",
    bgImage: "/unsplash/1473580044384-7ba9967e16a0.webp",
    characterImage: `${OBJECT}/Activities/Artist%20Palette.png`,
  },
  {
    id: "02",
    number: "۰۲",
    title: "فهرست شات",
    description: "عکس‌های کمپین، آمادهٔ بایگانی.",
    folderColor: "#FFE8D6",
    borderColor: "#FFD4B8",
    textColor: "#5C3D2E",
    subTextColor: "rgba(92, 61, 46, 0.65)",
    bgImage: "/unsplash/1486312338219-ce68d2c6f44d.webp",
    characterImage: `${OBJECT}/Objects/Camera.png`,
  },
  {
    id: "03",
    number: "۰۳",
    title: "رابط باغ",
    description: "کامپوننت‌هایی که با نقشهٔ راه رشد می‌کنند.",
    folderColor: "#D8F5E4",
    borderColor: "#B8EBCE",
    textColor: "#1F4D38",
    subTextColor: "rgba(31, 77, 56, 0.65)",
    bgImage: "/unsplash/1497366216548-37526070297c.webp",
    characterImage: `${OBJECT}/Animals/Potted%20Plant.png`,
  },
];

const gpuSpringTransition: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 28,
  mass: 0.75,
  restDelta: 0.0005,
  restSpeed: 0.0005,
};

function canHover() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover)").matches
  );
}

function FolderPeek({
  card,
  open,
  onOpenChange,
}: {
  card: FolderCardItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const textColor = card.textColor ?? "#09090b";
  const subTextColor = card.subTextColor ?? "rgba(9, 9, 11, 0.65)";
  const Component = card.href ? motion.a : motion.div;
  const variant = open ? "hover" : "initial";

  return (
    <div className="relative isolate h-[320px] w-[240px] shrink-0 sm:h-[360px] sm:w-[270px] md:h-[400px] md:w-[300px]">
      <Component
        {...(card.href
          ? { href: card.href, target: "_blank", rel: "noopener noreferrer" }
          : {})}
        role={card.href ? undefined : "button"}
        tabIndex={card.href ? undefined : 0}
        aria-expanded={card.href ? undefined : open}
        onClick={() => {
          if (card.href || canHover()) return;
          onOpenChange(!open);
        }}
        onKeyDown={(event) => {
          if (card.href) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpenChange(!open);
          }
        }}
        onHoverStart={() => {
          if (canHover()) onOpenChange(true);
        }}
        onHoverEnd={() => {
          if (canHover()) onOpenChange(false);
        }}
        className={clsx(
          "group relative block size-full cursor-pointer select-none overflow-hidden rounded-[24px] shadow-lg sm:rounded-[28px] md:rounded-[32px]",
          "transform-gpu [backface-visibility:hidden] [contain:paint] [perspective:1000px]",
        )}
        style={{
          border: `8px solid ${card.borderColor}`,
          boxSizing: "border-box",
        }}
        initial="initial"
        animate={variant}
      >
        <motion.div
          className="absolute inset-0 z-0 overflow-hidden transform-gpu will-change-[transform]"
          variants={{
            initial: { scale: 1 },
            hover: { scale: 1.09 },
          }}
          transition={gpuSpringTransition}
        >
          {card.bgImage ? (
            <img
              src={card.bgImage}
              alt=""
              decoding="async"
              loading="eager"
              className="pointer-events-none h-full w-full select-none object-cover"
            />
          ) : null}
        </motion.div>

        <motion.div
          className="pointer-events-none absolute left-1/2 top-[100px] z-10 flex w-[180px] -translate-x-1/2 justify-center transform-gpu will-change-[transform] sm:top-[115px] sm:w-[210px] md:top-[130px] md:w-[230px]"
          variants={{
            initial: { y: 0, scale: 0.96 },
            hover: { y: -56, scale: 1.08 },
          }}
          transition={gpuSpringTransition}
        >
          <motion.div
            animate={{ y: [0, -6, 0], rotate: [0, 1.5, -1.5, 0] }}
            transition={{
              duration: 4.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex items-center justify-center"
          >
            <img
              src={card.characterImage}
              alt=""
              decoding="async"
              loading="eager"
              className="pointer-events-none h-32 w-auto max-w-[140px] transform-gpu select-none object-contain drop-shadow-[0_18px_24px_rgba(0,0,0,0.2)] sm:h-40 sm:max-w-[160px] md:h-44 md:max-w-[180px]"
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="pointer-events-none absolute inset-x-0 top-[64px] z-20 h-[300px] transform-gpu will-change-[transform] sm:top-[72px] sm:h-[340px] md:top-[80px] md:h-[380px]"
          variants={{
            initial: { y: 0 },
            hover: { y: 80 },
          }}
          transition={gpuSpringTransition}
        >
          <svg
            viewBox="0 0 280 380"
            fill="none"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full drop-shadow-[0_-10px_20px_rgba(0,0,0,0.15)]"
          >
            <path
              d="M 280,20 C 280,9 271,0 260,0 L 158,0 C 147,0 140,5.5 136.5,15 C 133,24.5 126,30 116,30 L 18,30 C 8,30 0,38 0,48 L 0,380 L 280,380 Z"
              fill={card.folderColor}
            />
          </svg>

          <div
            className="absolute start-5 top-3 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] text-[2.75rem] font-bold tabular-nums leading-none tracking-tighter select-none sm:start-6 sm:top-4 sm:text-[3.25rem] md:text-[3.5rem]"
            style={{ color: textColor }}
          >
            {card.number}
          </div>

          <motion.div
            className="absolute end-5 top-9 flex size-5 transform-gpu items-center justify-center will-change-[transform] sm:end-6 sm:top-[46px] sm:size-6"
            variants={{
              initial: { x: 0, scale: 1 },
              hover: { x: -4, scale: 1.15 },
            }}
            transition={gpuSpringTransition}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke={textColor}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none size-4 sm:size-5"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 5 5 12 12 19" />
            </svg>
          </motion.div>
        </motion.div>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-col gap-1.5 p-4 pb-4 sm:gap-2 sm:p-5 sm:pb-[22px]"
          style={{ color: textColor }}
        >
          <h3
            className="select-none font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] text-sm font-semibold leading-6 tracking-normal sm:text-base sm:leading-7"
            style={{ color: textColor }}
          >
            {card.title}
          </h3>
          <p
            className="select-none font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] text-xs font-normal leading-relaxed opacity-80 sm:text-sm"
            style={{ color: subTextColor }}
          >
            {card.description}
          </p>
        </div>
      </Component>
    </div>
  );
}

export default function CardFolder() {
  const [openId, setOpenId] = useState<string | number | null>(null);

  return (
    <section
      dir="rtl"
      lang="fa"
      className="flex w-full items-center justify-center px-1 py-2 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal sm:px-2 sm:py-4"
    >
      <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6 md:gap-8">
        {DEMO_CARDS.map((card) => (
          <FolderPeek
            key={card.id}
            card={card}
            open={openId === card.id}
            onOpenChange={(next) =>
              setOpenId(next ? (card.id ?? null) : null)
            }
          />
        ))}
      </div>
    </section>
  );
}
