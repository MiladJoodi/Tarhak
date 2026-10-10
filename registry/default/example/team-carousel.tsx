"use client";

import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
  type TouchEvent,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  AnimatePresence,
  motion,
  type TargetAndTransition,
} from "motion/react";
import { cn } from "@/lib/utils";

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  image: string;
  bio?: string;
};

export type TeamCarouselProps = {
  members: TeamMember[];
  title?: string;
  titleSize?: "sm" | "md" | "lg" | "xl" | "2xl";
  titleColor?: string;
  background?: string;
  cardWidth?: number;
  cardHeight?: number;
  cardRadius?: number;
  showArrows?: boolean;
  showDots?: boolean;
  keyboardNavigation?: boolean;
  touchNavigation?: boolean;
  animationDuration?: number;
  autoPlay?: number;
  pauseOnHover?: boolean;
  visibleCards?: number;
  sideCardScale?: number;
  sideCardOpacity?: number;
  grayscaleEffect?: boolean;
  className?: string;
  cardClassName?: string;
  titleClassName?: string;
  infoPosition?: "bottom" | "overlay" | "none";
  infoTextColor?: string;
  infoBackground?: string;
  onMemberChange?: (member: TeamMember, index: number) => void;
  onCardClick?: (member: TeamMember, index: number) => void;
  initialIndex?: number;
};

const TITLE_SIZE = {
  sm: "text-4xl",
  md: "text-5xl",
  lg: "text-6xl",
  xl: "text-7xl",
  "2xl": "text-8xl",
} as const;

export function TeamCarousel({
  members,
  title = "تیم ما",
  titleSize = "xl",
  titleColor,
  background,
  cardWidth = 260,
  cardHeight = 340,
  cardRadius = 20,
  showArrows = true,
  showDots = true,
  keyboardNavigation = true,
  touchNavigation = true,
  animationDuration = 800,
  autoPlay = 0,
  pauseOnHover = true,
  visibleCards = 2,
  sideCardScale = 0.9,
  sideCardOpacity = 0.8,
  grayscaleEffect = true,
  className,
  cardClassName,
  titleClassName,
  infoPosition = "bottom",
  infoTextColor,
  infoBackground = "transparent",
  onMemberChange,
  onCardClick,
  initialIndex = 0,
}: TeamCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const totalMembers = members.length;

  const resolvedTitleColor = titleColor ?? "hsl(var(--foreground))";
  const resolvedInfoColor = infoTextColor ?? "hsl(var(--foreground))";

  const paginate = useCallback(
    (newDirection: number) => {
      if (totalMembers === 0) return;
      setDirection(newDirection);
      const nextIndex =
        (currentIndex + newDirection + totalMembers) % totalMembers;
      setCurrentIndex(nextIndex);
      onMemberChange?.(members[nextIndex]!, nextIndex);
    },
    [currentIndex, totalMembers, members, onMemberChange],
  );

  const wrapIndex = (index: number) =>
    (index + totalMembers) % totalMembers;

  const calculatePosition = (index: number) => {
    const diff = wrapIndex(index - currentIndex);
    if (diff === 0) return "center";
    if (diff <= visibleCards) return `right-${diff}`;
    if (diff >= totalMembers - visibleCards)
      return `left-${totalMembers - diff}`;
    return "hidden";
  };

  const getVariantStyles = (position: string): TargetAndTransition => {
    const transition = {
      duration: animationDuration / 1000,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    };

    switch (position) {
      case "center":
        return {
          zIndex: 10,
          opacity: 1,
          scale: 1.1,
          x: 0,
          filter: "grayscale(0%)",
          pointerEvents: "auto",
          transition,
        };
      case "right-1":
        return {
          zIndex: 5,
          opacity: sideCardOpacity,
          scale: sideCardScale,
          x: cardWidth * 0.7,
          filter: grayscaleEffect ? "grayscale(100%)" : "grayscale(0%)",
          pointerEvents: "auto",
          transition,
        };
      case "right-2":
        return {
          zIndex: 1,
          opacity: sideCardOpacity * 0.7,
          scale: sideCardScale * 0.9,
          x: cardWidth * 1.4,
          filter: grayscaleEffect ? "grayscale(100%)" : "grayscale(0%)",
          pointerEvents: "auto",
          transition,
        };
      case "left-1":
        return {
          zIndex: 5,
          opacity: sideCardOpacity,
          scale: sideCardScale,
          x: -cardWidth * 0.7,
          filter: grayscaleEffect ? "grayscale(100%)" : "grayscale(0%)",
          pointerEvents: "auto",
          transition,
        };
      case "left-2":
        return {
          zIndex: 1,
          opacity: sideCardOpacity * 0.7,
          scale: sideCardScale * 0.9,
          x: -cardWidth * 1.4,
          filter: grayscaleEffect ? "grayscale(100%)" : "grayscale(0%)",
          pointerEvents: "auto",
          transition,
        };
      default:
        return {
          zIndex: 0,
          opacity: 0,
          scale: 0.8,
          x:
            direction > 0
              ? cardWidth * (visibleCards + 1)
              : -cardWidth * (visibleCards + 1),
          pointerEvents: "none",
          filter: grayscaleEffect ? "grayscale(100%)" : "grayscale(0%)",
          transition,
        };
    }
  };

  useEffect(() => {
    if (autoPlay <= 0) return;
    let interval = window.setInterval(() => paginate(1), autoPlay);
    const root = document.getElementById("team-carousel-container");

    const onEnter = () => {
      if (pauseOnHover) window.clearInterval(interval);
    };
    const onLeave = () => {
      if (pauseOnHover)
        interval = window.setInterval(() => paginate(1), autoPlay);
    };

    if (root && pauseOnHover) {
      root.addEventListener("mouseenter", onEnter);
      root.addEventListener("mouseleave", onLeave);
    }
    return () => {
      window.clearInterval(interval);
      if (root && pauseOnHover) {
        root.removeEventListener("mouseenter", onEnter);
        root.removeEventListener("mouseleave", onLeave);
      }
    };
  }, [autoPlay, paginate, pauseOnHover]);

  useEffect(() => {
    if (!keyboardNavigation) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") paginate(1);
      else if (e.key === "ArrowRight") paginate(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [keyboardNavigation, paginate]);

  const handleTouchStart = (e: TouchEvent) => {
    if (!touchNavigation) return;
    setTouchStart(e.targetTouches[0]?.clientX ?? 0);
  };
  const handleTouchMove = (e: TouchEvent) => {
    if (!touchNavigation) return;
    setTouchEnd(e.targetTouches[0]?.clientX ?? 0);
  };
  const handleTouchEnd = () => {
    if (!touchNavigation) return;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) paginate(diff > 0 ? -1 : 1);
  };

  const goTo = (index: number) => {
    if (index === currentIndex) return;
    const newDirection = index > currentIndex ? 1 : -1;
    setDirection(newDirection);
    setCurrentIndex(index);
    onMemberChange?.(members[index]!, index);
  };

  return (
    <div
      id="team-carousel-container"
      dir="rtl"
      lang="fa"
      className={cn(
        "relative flex min-h-[560px] w-full flex-col items-center justify-center overflow-hidden font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal",
        className,
      )}
      style={
        (background
          ? { background }
          : undefined) as CSSProperties | undefined
      }
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {title ? (
        <h2
          className={cn(
            "pointer-events-none absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-black tracking-tight",
            TITLE_SIZE[titleSize],
            titleClassName,
          )}
          style={{
            color: "transparent",
            background: `linear-gradient(to bottom, color-mix(in srgb, ${resolvedTitleColor} 55%, transparent) 40%, transparent 76%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
          }}
        >
          {title}
        </h2>
      ) : null}

      <div
        className="relative mt-16 w-full max-w-5xl"
        style={{ height: cardHeight + 100, perspective: "1000px" }}
      >
        {showArrows ? (
          <>
            <motion.button
              type="button"
              aria-label="قبلی"
              onClick={() => paginate(1)}
              className="absolute top-1/2 left-3 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-foreground/70 text-background transition-colors hover:bg-foreground sm:left-5"
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft className="size-5" />
            </motion.button>
            <motion.button
              type="button"
              aria-label="بعدی"
              onClick={() => paginate(-1)}
              className="absolute top-1/2 right-3 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-foreground/70 text-background transition-colors hover:bg-foreground sm:right-5"
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight className="size-5" />
            </motion.button>
          </>
        ) : null}

        <div
          className="relative flex size-full items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          <AnimatePresence initial={false} custom={direction}>
            {members.map((member, index) => {
              const position = calculatePosition(index);
              const isCurrent = index === currentIndex;
              if (position === "hidden" && !isCurrent) return null;

              return (
                <motion.div
                  key={member.id}
                  className={cn(
                    "absolute cursor-pointer overflow-hidden bg-card shadow-2xl",
                    cardClassName,
                  )}
                  style={{
                    width: cardWidth,
                    height: cardHeight,
                    borderRadius: cardRadius,
                    top: "50%",
                    left: "50%",
                    marginLeft: -cardWidth / 2,
                    marginTop: -cardHeight / 2,
                  }}
                  initial={getVariantStyles("hidden")}
                  animate={getVariantStyles(position)}
                  exit={getVariantStyles("hidden")}
                  onClick={() => {
                    if (!isCurrent) goTo(index);
                    onCardClick?.(member, index);
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.image}
                    alt={member.name}
                    className="size-full object-cover"
                  />
                  {infoPosition === "overlay" ? (
                    <div
                      className="absolute inset-x-0 bottom-0 p-4 text-center"
                      style={{
                        background:
                          infoBackground ||
                          "linear-gradient(transparent, rgba(0,0,0,0.8))",
                        color: infoTextColor ?? "#fff",
                      }}
                    >
                      <h3 className="text-lg font-bold">{member.name}</h3>
                      <p className="text-sm opacity-90">{member.role}</p>
                    </div>
                  ) : null}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {infoPosition === "bottom" && members[currentIndex] ? (
        <motion.div
          key={`${members[currentIndex].id}-info`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-8 px-4 text-center"
        >
          <h3
            className="relative mb-2 inline-block text-2xl font-bold sm:text-3xl"
            style={{ color: resolvedInfoColor }}
          >
            {members[currentIndex].name}
            <span
              className="absolute top-full left-0 mt-2 h-0.5 w-full"
              style={{ background: resolvedInfoColor }}
            />
          </h3>
          <p
            className="mt-3 text-base font-medium tracking-wide opacity-80 sm:text-lg"
            style={{ color: resolvedInfoColor }}
          >
            {members[currentIndex].role}
          </p>
          {members[currentIndex].bio ? (
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
              {members[currentIndex].bio}
            </p>
          ) : null}
        </motion.div>
      ) : null}

      {showDots ? (
        <div className="mt-8 flex justify-center gap-2.5">
          {members.map((member, index) => (
            <motion.button
              key={member.id}
              type="button"
              aria-label={`عضو ${index + 1}`}
              aria-current={index === currentIndex ? "true" : undefined}
              onClick={() => goTo(index)}
              className={cn(
                "size-2.5 rounded-full transition-transform",
                index === currentIndex ? "scale-125" : "hover:scale-110",
              )}
              style={{
                background:
                  index === currentIndex
                    ? resolvedInfoColor
                    : `color-mix(in srgb, ${resolvedInfoColor} 35%, transparent)`,
              }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

const DEMO_MEMBERS: TeamMember[] = [
  {
    id: "1",
    name: "سارا نوری",
    role: "بنیان‌گذار",
    image: "/unsplash/1534528741775-53994a69daeb.webp",
    bio: "طراح محصول با تمرکز روی تجربهٔ فارسی و تعامل نرم.",
  },
  {
    id: "2",
    name: "امیر رضایی",
    role: "مهندس فرانت",
    image: "/unsplash/1507003211169-0a1dd7228f2d.webp",
    bio: "علاقه‌مند به موشن و کامپوننت‌های دسترس‌پذیر.",
  },
  {
    id: "3",
    name: "نگار احمدی",
    role: "طراح رابط",
    image: "/unsplash/1438761681033-6461ffad8d80.webp",
    bio: "سیستم‌های بصری و تایپوگرافی فارسی.",
  },
  {
    id: "4",
    name: "کیان مرادی",
    role: "مدیر محصول",
    image: "/unsplash/1472099645785-5658abf4ff4e.webp",
    bio: "ساخت مسیرهای واضح برای تیم‌های کوچک.",
  },
  {
    id: "5",
    name: "مینا کاظمی",
    role: "مهندس موشن",
    image: "/unsplash/1494790108377-be9c29b29330.webp",
    bio: "انیمیشن‌هایی که حس می‌شوند، نه فقط دیده می‌شوند.",
  },
];

export default function TeamCarouselDemo() {
  return (
    <TeamCarousel
      members={DEMO_MEMBERS}
      title="تیم ما"
      autoPlay={4000}
      showArrows
      showDots
      cardWidth={240}
      cardHeight={320}
    />
  );
}
