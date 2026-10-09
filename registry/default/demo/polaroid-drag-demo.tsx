"use client";

import PolaroidDrag from "@/registry/default/example/polaroid-drag";

export default function PolaroidDragDemo() {
  return (
    <div className="flex h-full w-full min-w-0 items-center justify-center overflow-hidden">
      <div className="size-full origin-center scale-[0.78] sm:scale-[0.9] md:scale-100">
        <PolaroidDrag />
      </div>
    </div>
  );
}
