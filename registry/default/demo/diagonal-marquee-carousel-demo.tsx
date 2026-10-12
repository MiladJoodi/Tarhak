"use client";

import DiagonalMarqueeCarousel from "@/registry/default/example/diagonal-marquee-carousel";

export default function DiagonalMarqueeCarouselDemo() {
  return (
    <div className="flex h-full w-full items-center justify-center px-4 py-8 sm:px-8">
      <div
        className={[
          "relative w-full max-w-[920px] overflow-hidden",
          "aspect-[16/10] max-h-[min(620px,78dvh)]",
          "rounded-[28px] border border-black/10 bg-neutral-200/50",
          "shadow-[0_20px_50px_-28px_rgba(0,0,0,0.55)]",
          "dark:border-white/12 dark:bg-white/4",
        ].join(" ")}
      >
        <DiagonalMarqueeCarousel
          duration={130}
          className="absolute inset-0 size-full min-h-0"
        />
      </div>
    </div>
  );
}
