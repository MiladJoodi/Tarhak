"use client";

import AnimateSidebar from "@/registry/default/example/animate-sidebar";

export default function AnimateSidebarDemo() {
  return (
    <div className="flex w-full items-center justify-center px-5 pb-12 pt-24 sm:px-10">
      <div
        className={[
          "w-full max-w-[840px] overflow-hidden",
          "h-[min(480px,60dvh)]",
          "rounded-[28px] border border-black/12",
          "shadow-[0_24px_60px_-28px_rgba(0,0,0,0.55)]",
          "dark:border-white/14",
        ].join(" ")}
      >
        <AnimateSidebar className="h-full min-h-0" position="absolute" />
      </div>
    </div>
  );
}
