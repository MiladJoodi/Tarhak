"use client";

import AnimateSidebar from "@/registry/default/example/animate-sidebar";
import { cn } from "@/lib/utils";

export default function AnimateSidebarDemo() {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center",
        // Clear open chrome header + preview hint / tint; room for CLI bar.
        "px-3 pb-28 pt-24",
        "sm:px-10 sm:pb-12 sm:pt-28",
      )}
    >
      <div
        className={cn(
          "w-full max-w-[840px] overflow-hidden",
          "h-[min(400px,52dvh)] sm:h-[min(480px,60dvh)]",
          "rounded-2xl border border-black/12 sm:rounded-[28px]",
          "shadow-[0_24px_60px_-28px_rgba(0,0,0,0.55)]",
          "dark:border-white/14",
        )}
      >
        <AnimateSidebar className="h-full min-h-0" position="absolute" />
      </div>
    </div>
  );
}
