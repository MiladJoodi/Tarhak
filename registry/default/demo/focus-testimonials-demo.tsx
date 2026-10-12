"use client";

import FocusTestimonials from "@/registry/default/example/focus-testimonials";
import { cn } from "@/lib/utils";

/**
 * Docs/preview stage only — gives the card room under the open chrome
 * and keeps the floating author tip from clipping. Does not change
 * FocusTestimonials itself beyond what the example already ships.
 */
export default function FocusTestimonialsDemo() {
  return (
    <div
      className={cn(
        "flex h-full w-full min-w-0 items-center justify-center overflow-x-hidden overflow-y-auto bg-background",
        "px-2",
        "md:overflow-hidden md:px-6",
      )}
    >
      {/* Mobile: drop the card so the quote block (not the empty footer) reads centered */}
      <div className="w-full max-w-[920px] translate-y-10 md:translate-y-0">
        <FocusTestimonials />
      </div>
    </div>
  );
}
