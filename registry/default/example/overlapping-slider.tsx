"use client";

import React, {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function sliderStep(cardWidth: number, overlapFactor: number, cardGap: number) {
  return Math.round(cardWidth - cardWidth * overlapFactor + cardGap);
}

export function snapSliderIndex(
  offsetX: number,
  step: number,
  velocity: number,
  total: number,
) {
  if (total <= 1) return 0;
  let index = -offsetX / step;
  if (velocity < -350) index = Math.ceil(index);
  else if (velocity > 350) index = Math.floor(index);
  else index = Math.round(index);
  return Math.max(0, Math.min(index, total - 1));
}

/** diff = index − activeExact. Cards to the left recede; the rest stay put. */
export function cardLeave(diff: number) {
  const t = Math.min(1, Math.max(0, -diff));
  return {
    scale: 1 - t * 0.16,
    y: t * 36,
    rotate: 0,
  };
}

export type CardProfile = {
  id: string;
  name: string;
  handle: string;
  role: string;
  image: string;
  gradient?: string;
};

const shot = (id: string) =>
  `/unsplash/${id}.webp`;

export const DEFAULT_PROFILES: CardProfile[] = [
  {
    id: "1",
    name: "سارا محمدی",
    handle: "@sara.m",
    role: "طراح محصول",
    image: shot("1534528741775-53994a69daeb"),
    gradient: "linear-gradient(rgba(255, 252, 252, 0) 0%, rgb(212, 123, 91) 96.8%)",
  },
  {
    id: "2",
    name: "نیلوفر احمدی",
    handle: "@niloufar",
    role: "طراح رابط کاربری",
    image: shot("1511379938547-c1f69419868d"),
    gradient: "linear-gradient(rgba(255, 252, 252, 0) 0%, rgb(184, 212, 91) 96.8%)",
  },
  {
    id: "3",
    name: "مریم رضایی",
    handle: "@maryam.dev",
    role: "توسعه‌دهنده فرانت‌اند",
    image: shot("1494790108377-be9c29b29330"),
    gradient: "linear-gradient(rgba(255, 252, 252, 0) 0%, rgb(153, 209, 255) 96.8%)",
  },
  {
    id: "4",
    name: "زهرا کریمی",
    handle: "@zahra",
    role: "طراح محصول",
    image: shot("1438761681033-6461ffad8d80"),
    gradient: "linear-gradient(rgba(255, 252, 252, 0) 0%, rgb(156, 122, 214) 96.8%)",
  },
  {
    id: "5",
    name: "آتنا موسوی",
    handle: "@atena.ui",
    role: "طراح رابط کاربری",
    image: shot("1513519245088-0e12902e5a38"),
    gradient: "linear-gradient(rgba(255, 252, 252, 0) 0%, rgb(214, 176, 72) 96.8%)",
  },
  {
    id: "6",
    name: "النا حسینی",
    handle: "@elena.h",
    role: "طراح محصول",
    image: shot("1517841905240-472988babdf9"),
    gradient: "linear-gradient(rgba(255, 252, 252, 0) 0%, rgb(214, 132, 148) 96.8%)",
  },
];

export type OverlappingSliderProps<T> = {
  items?: T[];
  renderItem?: (item: T, index: number, isActive: boolean) => ReactNode;
  children?: ReactNode;
  cardWidth?: number;
  cardHeight?: number;
  overlapFactor?: number;
  cardGap?: number;
  maxRotation?: number;
  transformOrigin?: string;
  showDots?: boolean;
  showArrows?: boolean;
  className?: string;
  onActiveChange?: (index: number) => void;
};

export function OverlappingSlider<T = CardProfile>({
  items,
  renderItem,
  children,
  cardWidth = 340,
  cardHeight = 460,
  overlapFactor = 0.04,
  cardGap = 18,
  maxRotation = 0,
  transformOrigin = "50% 90%",
  showDots = false,
  showArrows = true,
  className = "",
  onActiveChange,
}: OverlappingSliderProps<T>) {
  const childArray = React.Children.toArray(children);
  // Docs call `<OverlappingSlider />` with no props — fall back to demo profiles.
  const usingDefaults = items == null && childArray.length === 0;
  const resolvedItems = usingDefaults
    ? (DEFAULT_PROFILES as unknown as T[])
    : items;
  const resolvedRenderItem = usingDefaults
    ? ((item: T) => <ProfileCard card={item as CardProfile} />)
    : renderItem;
  const total = resolvedItems ? resolvedItems.length : childArray.length;

  const [activeIndex, setActiveIndex] = useState(0);
  const [layoutWidth, setLayoutWidth] = useState(cardWidth);
  const shellRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const activeIndexRef = useRef(0);
  const stepRef = useRef(sliderStep(cardWidth, overlapFactor, cardGap));
  const totalRef = useRef(total);
  totalRef.current = total;
  const onActiveChangeRef = useRef(onActiveChange);
  onActiveChangeRef.current = onActiveChange;
  const dragRef = useRef({
    down: false,
    dragging: false,
    pointerId: -1,
    startX: 0,
    origin: 0,
    lastX: 0,
    lastT: 0,
    velocity: 0,
    moved: 0,
  });

  const layoutHeight = Math.round(cardHeight * (layoutWidth / cardWidth));
  const step = sliderStep(layoutWidth, overlapFactor, cardGap);
  stepRef.current = step;

  const apply = (x: number, animate: boolean) => {
    const currentStep = stepRef.current;
    const max = 0;
    const min = -Math.max(0, totalRef.current - 1) * currentStep;
    const clamped = Math.min(max + 28, Math.max(min - 28, x));
    offsetRef.current = clamped;
    const track = trackRef.current;
    if (!track) return;
    const transition = animate
      ? "transform 380ms cubic-bezier(0.22, 1, 0.36, 1)"
      : "none";
    track.style.transition = transition;
    track.style.setProperty("--ox", `${clamped}px`);
    const activeExact = -clamped / currentStep;
    for (let i = 0; i < track.children.length; i++) {
      const card = track.children[i] as HTMLElement;
      const diff = i - activeExact;
      const leave = cardLeave(diff);
      const rotate = maxRotation
        ? Math.min(Math.max(diff * 1.6, -maxRotation), maxRotation)
        : 0;
      card.style.transition = transition;
      card.style.zIndex = String(i);
      card.style.setProperty("--y", `${leave.y}px`);
      card.style.setProperty("--r", `${rotate}deg`);
      card.style.setProperty("--s", String(leave.scale));
    }
  };

  const goTo = (index: number) => {
    const next = Math.max(0, Math.min(index, totalRef.current - 1));
    activeIndexRef.current = next;
    setActiveIndex(next);
    apply(-next * stepRef.current, true);
    onActiveChangeRef.current?.(next);
  };

  useLayoutEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const updateWidth = () => {
      const max = Math.max(220, shell.clientWidth - 40);
      setLayoutWidth(Math.min(cardWidth, max));
    };

    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(shell);
    return () => ro.disconnect();
  }, [cardWidth]);

  useLayoutEffect(() => {
    apply(-activeIndexRef.current * stepRef.current, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- drag writes transforms on the track; this only re-paints when card metrics change
  }, [layoutWidth, layoutHeight, overlapFactor, cardGap, maxRotation, total]);

  // Own the gesture on the track (`touch-action: none`) so parent overflow-auto
  // cannot steal horizontal swipes on iOS/Android.
  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const paint = (x: number, animate: boolean) => {
      const currentStep = stepRef.current;
      const max = 0;
      const min = -Math.max(0, totalRef.current - 1) * currentStep;
      const clamped = Math.min(max + 28, Math.max(min - 28, x));
      offsetRef.current = clamped;
      const track = trackRef.current;
      if (!track) return;
      const transition = animate
        ? "transform 380ms cubic-bezier(0.22, 1, 0.36, 1)"
        : "none";
      track.style.transition = transition;
      track.style.setProperty("--ox", `${clamped}px`);
      const activeExact = -clamped / currentStep;
      for (let i = 0; i < track.children.length; i++) {
        const card = track.children[i] as HTMLElement;
        const diff = i - activeExact;
        const leave = cardLeave(diff);
        const rotate = maxRotation
          ? Math.min(Math.max(diff * 1.6, -maxRotation), maxRotation)
          : 0;
        card.style.transition = transition;
        card.style.zIndex = String(i);
        card.style.setProperty("--y", `${leave.y}px`);
        card.style.setProperty("--r", `${rotate}deg`);
        card.style.setProperty("--s", String(leave.scale));
      }
    };

    const snapTo = (index: number) => {
      const next = Math.max(0, Math.min(index, totalRef.current - 1));
      activeIndexRef.current = next;
      setActiveIndex(next);
      paint(-next * stepRef.current, true);
      onActiveChangeRef.current?.(next);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      const drag = dragRef.current;
      drag.down = true;
      drag.dragging = true;
      drag.pointerId = e.pointerId;
      drag.startX = e.clientX;
      drag.origin = offsetRef.current;
      drag.lastX = e.clientX;
      drag.lastT = performance.now();
      drag.velocity = 0;
      drag.moved = 0;
      el.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag.down || drag.pointerId !== e.pointerId) return;
      const dx = e.clientX - drag.startX;
      const now = performance.now();
      const dt = Math.max(1, now - drag.lastT);
      drag.velocity = ((e.clientX - drag.lastX) / dt) * 1000;
      drag.lastX = e.clientX;
      drag.lastT = now;
      drag.moved = Math.max(drag.moved, Math.abs(dx));
      if (drag.moved < 2) return;
      e.preventDefault();
      paint(drag.origin + dx, false);
      const predicted = Math.max(
        0,
        Math.min(
          Math.round(-offsetRef.current / stepRef.current),
          totalRef.current - 1,
        ),
      );
      if (predicted !== activeIndexRef.current) {
        activeIndexRef.current = predicted;
        setActiveIndex(predicted);
        onActiveChangeRef.current?.(predicted);
      }
    };

    const end = (e: PointerEvent, snap: boolean) => {
      const drag = dragRef.current;
      if (!drag.down || (drag.pointerId !== -1 && drag.pointerId !== e.pointerId))
        return;
      const wasDragging = drag.dragging && drag.moved >= 2;
      drag.down = false;
      drag.dragging = false;
      drag.pointerId = -1;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
      if (!wasDragging) return;
      if (snap) {
        snapTo(
          snapSliderIndex(
            offsetRef.current,
            stepRef.current,
            drag.velocity,
            totalRef.current,
          ),
        );
      } else {
        paint(-activeIndexRef.current * stepRef.current, true);
      }
    };

    const onPointerUp = (e: PointerEvent) => end(e, true);
    const onPointerCancel = (e: PointerEvent) => end(e, false);

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove, { passive: false });
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerCancel);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerCancel);
    };
  }, [maxRotation]);

  return (
    <div
      ref={shellRef}
      lang="fa"
      className={`relative flex w-full select-none flex-col font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal ${className}`}
    >
      {/* Track LTR for translateX; touch-action none so mobile swipe isn't stolen. */}
      <div
        ref={viewportRef}
        dir="ltr"
        className="flex w-full cursor-grab touch-none items-center overflow-hidden py-8 active:cursor-grabbing sm:py-10"
        style={{ minHeight: layoutHeight + 64, touchAction: "none" }}
      >
        <div
          ref={trackRef}
          className="flex items-end ps-5 sm:ps-12"
          style={{ transform: "translate3d(var(--ox, 0px), 0, 0)" }}
        >
          {Array.from({ length: total }, (_, index) => (
            <div
              key={
                resolvedItems
                  ? String((resolvedItems[index] as { id?: string }).id ?? index)
                  : index
              }
              dir="rtl"
              className="shrink-0"
              style={{
                width: layoutWidth,
                height: layoutHeight,
                marginInlineEnd: cardGap - layoutWidth * overlapFactor,
                zIndex: index,
                transformOrigin,
                transform:
                  "translateY(var(--y, 0px)) rotate(var(--r, 0deg)) scale(var(--s, 1))",
              }}
              onClick={() => {
                if (dragRef.current.moved < 8) goTo(index);
              }}
            >
              {resolvedItems && resolvedRenderItem
                ? resolvedRenderItem(
                    resolvedItems[index],
                    index,
                    activeIndex === index,
                  )
                : childArray[index]}
            </div>
          ))}
        </div>
      </div>

      {(showDots || showArrows) && (
        <div
          dir="rtl"
          className="mt-1 flex w-full items-center px-5 sm:px-12"
        >
          {showArrows && (
            <div className="flex items-center gap-2">
              <ArrowButton
                label="قبلی"
                disabled={activeIndex === 0}
                onClick={() => goTo(activeIndexRef.current - 1)}
              >
                <ChevronRight className="size-4" strokeWidth={2.25} />
              </ArrowButton>
              <ArrowButton
                label="بعدی"
                disabled={activeIndex === total - 1}
                onClick={() => goTo(activeIndexRef.current + 1)}
              >
                <ChevronLeft className="size-4" strokeWidth={2.25} />
              </ArrowButton>
            </div>
          )}
          {showDots && (
            <div className="ms-auto flex items-center gap-2">
              {Array.from({ length: total }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  className={`h-2 rounded-full transition-[width,background-color] duration-300 ${
                    activeIndex === i
                      ? "w-8 bg-neutral-900"
                      : "w-2 bg-neutral-300 hover:bg-neutral-400"
                  }`}
                  aria-label={`رفتن به اسلاید ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ArrowButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="relative z-10 flex size-9 items-center justify-center rounded-full bg-neutral-900 text-white transition enabled:hover:bg-neutral-800 enabled:active:scale-[0.96] disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500 dark:bg-white dark:text-neutral-900 dark:enabled:hover:bg-white/90 dark:disabled:bg-white/15 dark:disabled:text-white/35"
    >
      {children}
    </button>
  );
}

export function ProfileCard({ card }: { card: CardProfile }) {
  const [following, setFollowing] = useState(false);

  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[40px] bg-neutral-900 p-5">
      <img
        src={card.image}
        alt=""
        draggable={false}
        referrerPolicy="no-referrer"
        className="pointer-events-none absolute inset-0 size-full object-cover object-[50%_18%]"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-56"
        style={{ background: card.gradient }}
      />

      <div className="relative flex items-center justify-center gap-1.5">
        <h3 className="text-[22px] font-bold leading-tight tracking-normal text-white drop-shadow-md">
          {card.name}
        </h3>
        <svg className="size-5 shrink-0 text-white drop-shadow" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M10 0 12.3 2.1c.4.4.9.6 1.4.6h3c.7 0 1.3.6 1.3 1.3v3c0 .5.2 1 .6 1.4L20 10l-2.1 2.3c-.4.4-.6.9-.6 1.4v3c0 .7-.6 1.3-1.3 1.3h-3c-.5 0-1 .2-1.4.6L10 20l-2.3-2.1c-.4-.4-.9-.6-1.4-.6h-3C2.6 17.3 2 16.7 2 16v-3c0-.5-.2-1-.6-1.4L0 10l2.1-2.3c.4-.4.6-.9.6-1.4v-3C2.7 2.6 3.3 2 4 2h3c.5 0 1-.2 1.4-.6L10 0Z" />
          <path fill="#111" d="M8.7 13.2 5.9 10.4l1.1-1.1 1.7 1.7 4.3-4.3 1.1 1.1z" />
        </svg>
      </div>

      <div className="relative flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <img
            src={card.image}
            alt=""
            draggable={false}
            referrerPolicy="no-referrer"
            className="size-11 shrink-0 rounded-full object-cover object-[50%_18%] ring-2 ring-white/20"
          />
          <div className="min-w-0 text-start">
            <div className="truncate text-sm font-medium text-white drop-shadow" dir="ltr">
              {card.handle}
            </div>
            <div className="truncate text-xs text-white/90">{card.role}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setFollowing((v) => !v);
          }}
          className={`flex shrink-0 items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-medium shadow transition active:scale-[0.96] ${
            following ? "bg-white/30 text-white backdrop-blur-md" : "bg-white text-black"
          }`}
        >
          <svg className="size-3 fill-current" viewBox="0 0 12 12" aria-hidden>
            <path d="M7 0H5v5H0v2h5v5h2V7h5V5H7z" />
          </svg>
          {following ? "دنبال می‌کنید" : "دنبال کردن"}
        </button>
      </div>
    </div>
  );
}

export default function OverlappingSliderExample() {
  return (
    <div className="flex h-full w-full flex-col justify-center bg-white dark:bg-[hsl(225_7%_11%)]">
      <OverlappingSlider
        items={DEFAULT_PROFILES}
        renderItem={(card) => <ProfileCard card={card} />}
      />
    </div>
  );
}
