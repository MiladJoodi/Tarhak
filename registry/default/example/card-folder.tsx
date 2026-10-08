"use client";

import { motion, type Transition } from "motion/react";

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
    bgImage:
      "/unsplash/1473580044384-7ba9967e16a0.webp",
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
    bgImage:
      "/unsplash/1486312338219-ce68d2c6f44d.webp",
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
    bgImage:
      "/unsplash/1497366216548-37526070297c.webp",
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

function FolderPeek({ card }: { card: FolderCardItem }) {
  const textColor = card.textColor ?? "#09090b";
  const subTextColor = card.subTextColor ?? "rgba(9, 9, 11, 0.65)";
  const Component = card.href ? motion.a : motion.div;

  return (
    <div className="relative isolate h-[400px] w-[300px] shrink-0">
      <Component
        {...(card.href
          ? { href: card.href, target: "_blank", rel: "noopener noreferrer" }
          : {})}
        className="group relative block h-[400px] w-[300px] cursor-pointer select-none overflow-hidden rounded-[32px] shadow-lg transform-gpu [backface-visibility:hidden] [contain:paint] [perspective:1000px]"
        style={{
          border: `10px solid ${card.borderColor}`,
          boxSizing: "border-box",
        }}
        initial="initial"
        whileHover="hover"
        animate="initial"
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
          className="pointer-events-none absolute left-1/2 top-[130px] z-10 flex w-[230px] -translate-x-1/2 justify-center transform-gpu will-change-[transform]"
          variants={{
            initial: { y: 0, scale: 0.96 },
            hover: { y: -72, scale: 1.08 },
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
              className="pointer-events-none h-44 w-auto max-w-[180px] transform-gpu select-none object-contain drop-shadow-[0_18px_24px_rgba(0,0,0,0.2)]"
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="pointer-events-none absolute inset-x-0 top-[80px] z-20 h-[380px] transform-gpu will-change-[transform]"
          variants={{
            initial: { y: 0 },
            hover: { y: 100 },
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
            className="absolute start-6 top-4 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] text-[3.5rem] font-bold tabular-nums leading-none tracking-tighter select-none"
            style={{ color: textColor }}
          >
            {card.number}
          </div>

          <motion.div
            className="absolute end-6 top-[46px] flex h-6 w-6 transform-gpu items-center justify-center will-change-[transform]"
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
              className="pointer-events-none h-5 w-5"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 5 5 12 12 19" />
            </svg>
          </motion.div>
        </motion.div>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-col gap-2 p-5 pb-[22px]"
          style={{ color: textColor }}
        >
          <h3
            className="select-none font-sans text-base font-semibold leading-7 tracking-normal"
            style={{ color: textColor }}
          >
            {card.title}
          </h3>
          <p
            className="select-none font-sans text-sm font-normal leading-relaxed opacity-80"
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
  return (
    <section
      dir="rtl"
      lang="fa"
      className="flex h-full w-full items-center justify-center px-6 py-8 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <div className="flex flex-wrap items-center justify-center gap-8">
        {DEMO_CARDS.map((card) => (
          <FolderPeek key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
}
