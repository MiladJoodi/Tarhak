"use client";

import ExpandableCard from "@/registry/default/example/expandable-card";

export default function ExpandableCardDemo() {
  return (
    <div className="flex h-full w-full min-w-0 items-center justify-center overflow-auto bg-background px-4 py-8">
      <ExpandableCard />
    </div>
  );
}
