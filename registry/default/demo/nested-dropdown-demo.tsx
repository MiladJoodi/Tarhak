"use client";

import NestedDropdown from "@/registry/default/example/nested-dropdown";

export default function NestedDropdownDemo() {
  return (
    <div className="flex h-full w-full min-w-0 items-center justify-center overflow-hidden bg-background">
      <div className="flex h-[420px] w-full items-start justify-center pt-16">
        <NestedDropdown />
      </div>
    </div>
  );
}
