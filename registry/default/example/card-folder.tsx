"use client";

import { cn } from "@/lib/utils";
import { motion, useReducedMotion, type Transition } from "motion/react";
import { useId, useState } from "react";

export type FolderCardItem = {
  id?: string | number;
  number: string;
  title: string;
  description: string;
  bgImage?: string;
  characterImage: string;
  folderColor: string;
  folderColorDeep?: string;
  borderColor: string;
  textColor?: string;
  subTextColor?: string;
  href?: string;
};

const OBJECT =
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis";

const DEMO_CARDS: FolderCardItem[] = [
  {
    id: "01",
    number: "۰۱",
    title: "آزمایشگاه پالت",
    description: "سامانهٔ رنگ نرم برای تیم‌های محصول.",
    folderColor: "#efe4d2",
    folderColorDeep: "#e2d2b8",
    borderColor: "#c9b79a",
    textColor: "#3a2a1c",
    subTextColor: "rgba(58, 42, 28, 0.62)",
    bgImage: "/unsplash/1473580044384-7ba9967e16a0.webp",
    characterImage: `${OBJECT}/Activities/Artist%20Palette.png`,
  },
  {
    id: "02",
    number: "۰۲",
    title: "فهرست شات",
    description: "عکس‌های کمپین، آمادهٔ بایگانی.",
    folderColor: "#edd6c6",
    folderColorDeep: "#dfc0ab",
    borderColor: "#c9a48e",
    textColor: "#4a2c22",
    subTextColor: "rgba(74, 44, 34, 0.62)",
    bgImage: "/unsplash/1486312338219-ce68d2c6f44d.webp",
    characterImage: `${OBJECT}/Objects/Camera.png`,
  },
  {
    id: "03",
    number: "۰۳",
    title: "رابط باغ",
    description: "کامپوننت‌هایی که با نقشهٔ راه رشد می‌کنند.",
    folderColor: "#dce8dc",
    folderColorDeep: "#c5d8c6",
    borderColor: "#9fb89f",
    textColor: "#1e3a2f",
    subTextColor: "rgba(30, 58, 47, 0.62)",
    bgImage: "/unsplash/1497366216548-37526070297c.webp",
    characterImage: `${OBJECT}/Animals/Potted%20Plant.png`,
  },
];

const gpuSpring: Transition = {
  type: "spring",
  stiffness: 280,
  damping: 26,
  mass: 0.7,
  restDelta: 0.0005,
  restSpeed: 0.0005,
};

function canHover() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover)").matches
  );
}

function FolderFace({
  color,
  deep,
}: {
  color: string;
  deep: string;
}) {
  const uid = useId().replace(/:/g, "");
  const bodyId = `folder-body-${uid}`;
  const sheenId = `folder-sheen-${uid}`;

  return (
    <svg
      viewBox="0 0 280 380"
      fill="none"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id={bodyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={deep} />
        </linearGradient>
        <linearGradient id={sheenId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="45%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      {/* Tab */}
      <path
        d="M18 30 C8 30 0 38 0 48 L0 56 L116 56 C126 56 133 50.5 136.5 41 C140 31.5 147 26 158 26 L260 26 C271 26 280 35 280 46 L280 56 L280 48 C280 38 271 30 260 30 L158 30 C147 30 140 35.5 136.5 45 C133 54.5 126 60 116 60 L18 60 Z"
        fill={color}
        opacity="0.95"
      />
      {/* Body */}
      <path
        d="M 280,48 C 280,37 271,28 260,28 L 158,28 C 147,28 140,33.5 136.5,43 C 133,52.5 126,58 116,58 L 18,58 C 8,58 0,66 0,76 L 0,380 L 280,380 Z"
        fill={`url(#${bodyId})`}
      />
      <path
        d="M 280,48 C 280,37 271,28 260,28 L 158,28 C 147,28 140,33.5 136.5,43 C 133,52.5 126,58 116,58 L 18,58 C 8,58 0,66 0,76 L 0,380 L 280,380 Z"
        fill={`url(#${sheenId})`}
      />
      {/* Inner lip */}
      <path
        d="M12 78 H268"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.2"
      />
      <path
        d="M12 80 H268"
        stroke="rgba(60,40,20,0.08)"
        strokeWidth="1"
      />
    </svg>
  );
}

export function FolderPeek({
  card,
  open,
  onOpenChange,
}: {
  card: FolderCardItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const reduce = useReducedMotion() ?? false;
  const textColor = card.textColor ?? "#1c1917";
  const subTextColor = card.subTextColor ?? "rgba(28, 25, 23, 0.62)";
  const deep = card.folderColorDeep ?? card.folderColor;
  const Component = card.href ? motion.a : motion.div;
  const variant = open ? "hover" : "initial";
  const spring = reduce ? { duration: 0.01 } : gpuSpring;

  return (
    <div className="relative isolate h-[320px] w-[240px] shrink-0 sm:h-[360px] sm:w-[270px] md:h-[400px] md:w-[300px]">
      {/* Soft stage glow under card */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 -bottom-2 h-8 rounded-[100%] bg-black/15 blur-xl transition-opacity duration-300 dark:bg-black/40"
        style={{ opacity: open ? 0.55 : 0.28 }}
      />

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
        className={cn(
          "group relative block size-full cursor-pointer select-none overflow-hidden rounded-[22px] sm:rounded-[26px] md:rounded-[28px]",
          "transform-gpu [backface-visibility:hidden] [contain:paint] [perspective:1200px]",
          "shadow-[0_18px_40px_-18px_rgba(28,20,12,0.45)]",
          "ring-1 ring-black/10 dark:ring-white/10",
        )}
        style={{
          boxSizing: "border-box",
          outline: `1px solid ${card.borderColor}`,
          outlineOffset: -1,
        }}
        initial="initial"
        animate={variant}
        whileTap={reduce ? undefined : { scale: 0.985 }}
      >
        {/* Photo plane */}
        <motion.div
          className="absolute inset-0 z-0 overflow-hidden transform-gpu will-change-transform"
          variants={{
            initial: { scale: 1 },
            hover: { scale: 1.1 },
          }}
          transition={spring}
        >
          {card.bgImage ? (
            <img
              src={card.bgImage}
              alt=""
              decoding="async"
              loading="eager"
              className="pointer-events-none h-full w-full select-none object-cover"
            />
          ) : (
            <div className="size-full bg-neutral-200 dark:bg-neutral-800" />
          )}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, transparent 35%, rgba(0,0,0,0.22) 100%)",
            }}
          />
        </motion.div>

        {/* Floating character */}
        <motion.div
          className="pointer-events-none absolute start-1/2 top-[96px] z-10 flex w-[180px] -translate-x-1/2 justify-center transform-gpu will-change-transform sm:top-[110px] sm:w-[210px] md:top-[124px] md:w-[230px]"
          variants={{
            initial: { y: 0, scale: 0.94, opacity: 0.96 },
            hover: { y: -64, scale: 1.1, opacity: 1 },
          }}
          transition={spring}
        >
          <div
            aria-hidden
            className="absolute top-1/2 size-24 -translate-y-1/2 rounded-full bg-white/25 blur-2xl sm:size-28"
          />
          <motion.div
            animate={
              reduce
                ? undefined
                : { y: [0, -7, 0], rotate: [0, 1.8, -1.4, 0] }
            }
            transition={{
              duration: 4.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative flex items-center justify-center"
          >
            <img
              src={card.characterImage}
              alt=""
              decoding="async"
              loading="eager"
              className="pointer-events-none h-32 w-auto max-w-[140px] transform-gpu select-none object-contain drop-shadow-[0_20px_28px_rgba(0,0,0,0.28)] sm:h-40 sm:max-w-[160px] md:h-44 md:max-w-[180px]"
            />
          </motion.div>
        </motion.div>

        {/* Folder body — slides down to reveal photo */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-[58px] z-20 h-[310px] transform-gpu will-change-transform sm:top-[66px] sm:h-[350px] md:top-[74px] md:h-[390px]"
          variants={{
            initial: { y: 0 },
            hover: { y: 92 },
          }}
          transition={spring}
          style={{
            filter: "drop-shadow(0 -12px 22px rgba(20,12,8,0.18))",
          }}
        >
          <FolderFace color={card.folderColor} deep={deep} />

          {/* Paper grain */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.22] mix-blend-multiply"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/%3E%3C/svg%3E\")",
            }}
          />

          <div
            className="absolute start-5 top-4 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] text-[2.75rem] font-bold tabular-nums leading-none tracking-tighter select-none sm:start-6 sm:top-5 sm:text-[3.25rem] md:text-[3.5rem]"
            style={{
              color: textColor,
              textShadow: "0 1px 0 rgba(255,255,255,0.35)",
            }}
          >
            {card.number}
          </div>

          <motion.div
            className="absolute end-5 top-10 flex size-6 transform-gpu items-center justify-center rounded-full will-change-transform sm:end-6 sm:top-11 sm:size-7"
            style={{
              background: "rgba(255,255,255,0.35)",
              boxShadow: "inset 0 0 0 1px rgba(60,40,20,0.08)",
            }}
            variants={{
              initial: { x: 0, scale: 1 },
              hover: { x: -5, scale: 1.12 },
            }}
            transition={spring}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke={textColor}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none size-3.5 sm:size-4"
              aria-hidden
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 5 5 12 12 19" />
            </svg>
          </motion.div>
        </motion.div>

        {/* Caption dock */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-col gap-1.5 p-4 pb-4 sm:gap-2 sm:p-5 sm:pb-[22px]"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(244,236,224,0.55) 28%, rgba(244,236,224,0.92) 100%)",
          }}
        >
          <h3
            className="select-none font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] text-sm font-semibold leading-6 tracking-normal sm:text-base sm:leading-7"
            style={{ color: textColor }}
          >
            {card.title}
          </h3>
          <p
            className="select-none font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] text-xs font-normal leading-relaxed sm:text-sm"
            style={{ color: subTextColor }}
          >
            {card.description}
          </p>
        </div>
      </Component>
    </div>
  );
}

export type CardFolderProps = {
  cards?: FolderCardItem[];
  className?: string;
};

export default function CardFolder({
  cards = DEMO_CARDS,
  className,
}: CardFolderProps) {
  const [openId, setOpenId] = useState<string | number | null>(null);

  return (
    <section
      dir="rtl"
      lang="fa"
      className={cn(
        "flex w-full items-center justify-center px-1 py-2 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal sm:px-2 sm:py-4",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6 md:gap-8">
        {cards.map((card) => (
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
