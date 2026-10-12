"use client";

import SmoothDropdown from "@/registry/default/example/smooth-dropdown";
import { cn } from "@/lib/utils";

/**
 * Docs/preview stage only — reserves the open shell footprint (248×~320)
 * and pins the 40×40 trigger at end (visual left in RTL) so the morph
 * expands in-frame on narrow phones. Does not change SmoothDropdown.
 */
export default function SmoothDropdownDemo() {
  return (
    <div
      className={cn(
        "flex h-full w-full min-w-0 items-center justify-center bg-background",
        "overflow-x-hidden overflow-y-visible",
        "px-4",
        "md:px-8",
      )}
    >
      {/*
        SmoothDropdown expands from its physical left (end in RTL). Pin the
        trigger to the left of this footprint so the 248px shell stays in-frame.
      */}
      <div
        dir="rtl"
        lang="fa"
        className="relative h-[min(340px,68dvh)] w-[min(100%,248px)]"
      >
        <div className="absolute top-0 end-0">
          <SmoothDropdown />
        </div>
      </div>
    </div>
  );
}
