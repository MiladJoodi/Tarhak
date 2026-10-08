"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface CardStackItem {
  id?: string | number;
  color?: string;
  bg?: string;
  image?: string;
  content?: React.ReactNode;
}

export interface CardStackProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: CardStackItem[];
  cardWidth?: number | string;
  cardHeight?: number | string;
  sensitivity?: number;
  randomRotation?: boolean;
  sendToBackOnClick?: boolean;
  maxVisible?: number;
  cardClassName?: string;
  onSwipe?: (item: CardStackItem, index: number) => void;
}

const CARD_IMG =
  "auto=format&fit=crop&w=800&q=80";

export const DEFAULT_CARDS: CardStackItem[] = [
  {
    id: "card-0",
    color: "#2c2018",
    image: `/unsplash/1438761681033-6461ffad8d80.webp`,
  },
  {
    id: "card-1",
    color: "#2a2418",
    image: `/unsplash/1441974231531-c6227db76b6e.webp`,
  },
  {
    id: "card-2",
    color: "#3a2418",
    image: `/unsplash/1447752875215-b2761acb3c5d.webp`,
  },
  {
    id: "card-3",
    color: "#1c2a24",
    image: `/unsplash/1460925895917-afdab827c52f.webp`,
  },
  {
    id: "card-4",
    color: "#1a2e1a",
    image: `/unsplash/1463453091185-61582044d556.webp`,
  },
];

function getDeterministicRotation(index: number, id?: string | number): number {
  if (typeof id === "string") {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash << 5) - hash + id.charCodeAt(i);
      hash |= 0;
    }
    return ((Math.abs(hash) % 1000) / 100) - 5;
  }
  if (typeof id === "number") {
    return ((Math.abs(id * 9301 + 49297) % 1000) / 100) - 5;
  }
  const presets = [2.66, -1.05, -2.8, 1.93, -0.59, 3.12, -2.4];
  return presets[index % presets.length];
}

interface DraggableCardWrapperProps {
  children: React.ReactNode;
  onSendToBack: () => void;
  sensitivity: number;
}

const DraggableCardWrapper: React.FC<DraggableCardWrapperProps> = ({
  children,
  onSendToBack,
  sensitivity,
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [60, -60]);
  const rotateY = useTransform(x, [-100, 100], [-60, 60]);

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (
      Math.abs(info.offset.x) > sensitivity ||
      Math.abs(info.offset.y) > sensitivity
    ) {
      onSendToBack();
    } else {
      x.set(0);
      y.set(0);
    }
  };

  return (
    <motion.div
      className="absolute inset-0 cursor-grab select-none touch-none active:cursor-grabbing"
      style={{
        x,
        y,
        rotateX,
        rotateY,
      }}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.6}
      whileTap={{ cursor: "grabbing" }}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  );
};

export const CardStack = React.forwardRef<HTMLDivElement, CardStackProps>(
  (
    {
      items = DEFAULT_CARDS,
      cardWidth,
      cardHeight,
      sensitivity = 180,
      randomRotation = true,
      sendToBackOnClick = true,
      maxVisible = 5,
      cardClassName,
      className,
      onSwipe,
      ...props
    },
    ref
  ) => {
    const [deck, setDeck] = useState<CardStackItem[]>(items);

    useEffect(() => {
      setDeck(items);
    }, [items]);

    const rotationOffsets = useMemo(() => {
      return items.map((item, index) =>
        randomRotation ? getDeterministicRotation(index, item.id) : 0
      );
    }, [items, randomRotation]);

    const sendToBack = (index: number) => {
      const swipedItem = deck[index];
      onSwipe?.(swipedItem, index);

      setDeck((currentDeck) => {
        const nextDeck = [...currentDeck];
        const [removed] = nextDeck.splice(index, 1);
        nextDeck.unshift(removed);
        return nextDeck;
      });
    };

    const visibleDeck = deck.slice(0, maxVisible);
    const width =
      cardWidth == null
        ? undefined
        : typeof cardWidth === "number"
          ? `${cardWidth}px`
          : cardWidth;
    const height =
      cardHeight == null
        ? undefined
        : typeof cardHeight === "number"
          ? `${cardHeight}px`
          : cardHeight;

    return (
      <div
        ref={ref}
        className={cn(
          "relative aspect-square w-[min(18.75rem,100%)] [perspective:600px]",
          className
        )}
        style={{
          ...(width ? { width } : {}),
          ...(height ? { height } : width ? { height: width } : {}),
        }}
        {...props}
      >
        {visibleDeck.map((item, index) => {
            const offset = rotationOffsets[index] ?? 0;
            const rotateZ = (visibleDeck.length - index - 1) * 4 + offset;
            const scale = 1 + index * 0.06 - visibleDeck.length * 0.06;
            const cardBg = item.color || item.bg || "#000000";

            return (
              <DraggableCardWrapper
                key={item.id || index}
                onSendToBack={() => sendToBack(index)}
                sensitivity={sensitivity}
              >
                <motion.div
                  onClick={() => {
                    if (sendToBackOnClick) {
                      sendToBack(index);
                    }
                  }}
                  animate={{
                    rotateZ,
                    scale,
                    transformOrigin: "90% 90%",
                  }}
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  }}
                  style={{ background: cardBg }}
                  className={cn(
                    "relative size-full overflow-hidden rounded-[20px] border-4 border-white shadow-2xl max-sm:rounded-2xl max-sm:border-2",
                    cardClassName
                  )}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt=""
                      draggable={false}
                      className="pointer-events-none size-full object-cover"
                    />
                  ) : item.content ? (
                    item.content
                  ) : null}
                </motion.div>
              </DraggableCardWrapper>
            );
          })}
      </div>
    );
  }
);

CardStack.displayName = "CardStack";

/** Docs / CLI alias — same as CardStack with default cards. */
export const AccessibleAction = CardStack;

export default function AccessibleActionExample() {
  return (
    <div
      dir="rtl"
      lang="fa"
      className="flex h-full w-full min-w-0 items-center justify-center overflow-hidden font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <CardStack />
    </div>
  );
}