import type { Metadata } from "next";

import EventCountdown from "@/registry/default/example/event-countdown";

export const metadata: Metadata = {
  title: "Event Countdown",
  robots: { index: false, follow: false },
};

export default function EventCountdownPreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f4f6fa] px-4">
      <EventCountdown />
    </main>
  );
}
