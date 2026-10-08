"use client";

import { useRef } from "react";

import StackScrollReveal from "@/registry/default/example/stack-scroll-reveal";

export default function StackScrollRevealDemo() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollerRef}
      className="absolute inset-0 overflow-y-auto overscroll-contain bg-[oklch(0.97_0.008_85)]"
    >
      <StackScrollReveal container={scrollerRef} enableLenis={false} />
    </div>
  );
}
