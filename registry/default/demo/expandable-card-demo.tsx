"use client";

import ExpandableCard from "@/registry/default/example/expandable-card";

export default function ExpandableCardDemo() {
  return (
    <div className="flex h-full w-full min-w-0 items-start justify-center overflow-auto bg-background px-4 pb-8 pt-44 md:pt-48">
      <ExpandableCard />
    </div>
  );
}
