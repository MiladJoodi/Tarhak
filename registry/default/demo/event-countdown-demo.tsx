"use client";

import EventCountdown from "@/registry/default/example/event-countdown";

export default function EventCountdownDemo() {
  return (
    <div className="flex h-full w-full min-w-0 items-center justify-center overflow-hidden bg-[#f4f6fa] dark:bg-[#09090b]">
      <EventCountdown />
    </div>
  );
}
