"use client";

import AnimatedSidebars from "@/registry/default/example/animated-sidebars";
import { cn } from "@/lib/utils";

export default function AnimatedSidebarsDemo() {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center",
        // Clear open chrome header + tint; room for CLI bar.
        "px-3 pb-28 pt-24",
        "sm:px-10 sm:pb-12 sm:pt-28",
      )}
    >
      <AnimatedSidebars className="h-[min(400px,52dvh)] sm:h-[min(480px,60dvh)]" />
    </div>
  );
}
