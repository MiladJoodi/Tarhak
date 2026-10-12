"use client";

/**
 * Adapted from Great UI — Diagonal Marquee Carousel
 * https://github.com/Saurabh-2607/GreatUI (MIT)
 * https://21st.dev/@saurabh-2607/components/great-ui-diagonal-marquee-carousel
 */

import type { CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type DiagonalMarqueeCard = {
  id: string | number;
  url: string;
  title: string;
};

export type DiagonalMarqueeCarouselProps = {
  cards?: DiagonalMarqueeCard[];
  /** Degrees of diagonal tilt. */
  angle?: number;
  /** Base loop duration in seconds (higher = slower). */
  duration?: number;
  alternateDirections?: boolean;
  className?: string;
  cardClassName?: string;
  fadeClassName?: string;
};

// Change Here
const DEFAULT_CARDS: DiagonalMarqueeCard[] = [
  {
    id: 1,
    url: "/unsplash/1501785888041-af3ef285b470.webp",
    title: "کوهستان",
  },
  {
    id: 2,
    url: "/unsplash/1476514525535-07fb3b4ae5f1.webp",
    title: "دریاچه",
  },
  {
    id: 3,
    url: "/unsplash/1469474968028-56623f02e42e.webp",
    title: "مه صبحگاهی",
  },
  {
    id: 4,
    url: "/unsplash/1447752875215-b2761acb3c5d.webp",
    title: "جنگل",
  },
  {
    id: 5,
    url: "/unsplash/1470770841072-f978cf4d019e.webp",
    title: "ساحل",
  },
  {
    id: 6,
    url: "/unsplash/1501854140801-50d01698950b.webp",
    title: "دره",
  },
];

function Card({
  card,
  className,
}: {
  card: DiagonalMarqueeCard;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative h-[160px] w-[230px] shrink-0 overflow-hidden rounded-xl shadow-2xl sm:h-[200px] sm:w-[280px] md:h-[240px] md:w-[340px]",
        className,
      )}
    >
      <img
        src={card.url}
        alt={card.title}
        className="size-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 bg-black/35" />
    </div>
  );
}

function MarqueeRow({
  cards,
  speed,
  direction,
  paused,
  cardClassName,
}: {
  cards: DiagonalMarqueeCard[];
  speed: number;
  direction: 1 | -1;
  paused: boolean;
  cardClassName?: string;
}) {
  const animationClass =
    direction === -1
      ? "diagonal-marquee-left"
      : "diagonal-marquee-right";

  return (
    <div className="flex w-max">
      <div
        className={cn(
          "flex w-max shrink-0",
          !paused && animationClass,
          !paused && "hover:[animation-play-state:paused]",
        )}
        style={{ ["--speed" as string]: `${speed}s` } as CSSProperties}
      >
        {/* Two identical tracks — translate -50% loops seamlessly */}
        {[0, 1].map((copy) => (
          <div key={copy} className="flex w-max shrink-0" aria-hidden={copy === 1}>
            {cards.map((card, idx) => (
              <div
                key={`${copy}-${card.id}-${idx}`}
                className="shrink-0 pe-5 sm:pe-6 md:pe-8"
              >
                <Card card={card} className={cardClassName} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DiagonalMarqueeCarousel({
  cards = DEFAULT_CARDS,
  angle = -22,
  duration = 120,
  alternateDirections = true,
  className,
  cardClassName,
  fadeClassName,
}: DiagonalMarqueeCarouselProps) {
  const reduceMotion = useReducedMotion() ?? false;
  // Dense strip so the loop never shows empty space
  const rowCards = [...cards, ...cards, ...cards];
  const rowCardsReverse = [...rowCards].reverse();
  const mid = Math.max(duration - 10, 48);
  const slow = duration + 18;

  return (
    <div
      dir="rtl"
      lang="fa"
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden bg-transparent",
        className,
      )}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes diagonal-marquee-left {
              0% { transform: translate3d(0, 0, 0); }
              100% { transform: translate3d(-50%, 0, 0); }
            }
            @keyframes diagonal-marquee-right {
              0% { transform: translate3d(-50%, 0, 0); }
              100% { transform: translate3d(0, 0, 0); }
            }
            .diagonal-marquee-left {
              animation: diagonal-marquee-left var(--speed) linear infinite;
              will-change: transform;
            }
            .diagonal-marquee-right {
              animation: diagonal-marquee-right var(--speed) linear infinite;
              will-change: transform;
            }
          `,
        }}
      />

      <div
        className="absolute z-0 flex w-max flex-col gap-5 sm:gap-6 md:gap-7"
        style={{ transform: `rotate(${angle}deg)` }}
      >
        <MarqueeRow
          cards={rowCards}
          speed={duration}
          direction={-1}
          paused={reduceMotion}
          cardClassName={cardClassName}
        />
        <MarqueeRow
          cards={rowCardsReverse}
          speed={mid}
          direction={alternateDirections ? 1 : -1}
          paused={reduceMotion}
          cardClassName={cardClassName}
        />
        <MarqueeRow
          cards={rowCards}
          speed={slow}
          direction={-1}
          paused={reduceMotion}
          cardClassName={cardClassName}
        />
      </div>

      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 z-10 h-[18%] bg-gradient-to-b from-background to-transparent",
          fadeClassName,
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[18%] bg-gradient-to-t from-background to-transparent",
          fadeClassName,
        )}
      />
    </div>
  );
}
