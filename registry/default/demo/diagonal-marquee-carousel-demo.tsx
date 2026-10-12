"use client";

import DiagonalMarqueeCarousel from "@/registry/default/example/diagonal-marquee-carousel";
import { cn } from "@/lib/utils";

export default function DiagonalMarqueeCarouselDemo() {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center",
        // Clear open chrome header + hint; room for CLI bar.
        "px-3 pb-28 pt-24",
        "sm:px-8 sm:pb-12 sm:pt-28",
      )}
    >
      <div
        className={cn(
          "relative w-full max-w-[920px] overflow-hidden",
          // Mobile needs vertical room for the tilted strips; 16/10 is too short.
          "h-[min(560px,68dvh)] min-h-[440px]",
          "sm:h-auto sm:min-h-0 sm:aspect-[16/10] sm:max-h-[min(620px,78dvh)]",
          "rounded-2xl border border-black/10 bg-neutral-200/50 sm:rounded-[28px]",
          "shadow-[0_20px_50px_-28px_rgba(0,0,0,0.55)]",
          "dark:border-white/12 dark:bg-white/4",
        )}
      >
        <DiagonalMarqueeCarousel
          duration={130}
          className="absolute inset-0 size-full min-h-0"
        />
      </div>
    </div>
  );
}
