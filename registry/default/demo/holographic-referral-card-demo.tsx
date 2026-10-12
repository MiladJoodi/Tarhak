"use client";

import HolographicReferralCard from "@/registry/default/example/holographic-referral-card";
import { cn } from "@/lib/utils";

export default function HolographicReferralCardDemo() {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center",
        "px-3 pb-28 pt-24",
        "sm:px-10 sm:pb-12 sm:pt-28",
      )}
    >
      <HolographicReferralCard />
    </div>
  );
}
