"use client";

import VerticalTabs from "@/registry/default/example/vertical-tabs";

export default function VerticalTabsDemo() {
  return (
    <div className="flex h-full w-full min-w-0 items-center justify-center overflow-auto">
      <div className="w-full origin-center scale-[0.78] sm:scale-[0.9] md:scale-100">
        <VerticalTabs />
      </div>
    </div>
  );
}
