"use client";

import HorizontalMenu from "@/registry/default/example/horizontal-menu";

export default function HorizontalMenuDemo() {
  return (
    <div className="flex h-full w-full min-w-0 items-center justify-center overflow-visible bg-background px-3 py-6 md:px-8 md:py-10">
      <HorizontalMenu />
    </div>
  );
}
