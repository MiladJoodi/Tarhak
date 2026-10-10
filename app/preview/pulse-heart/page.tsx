import type { Metadata } from "next";

import PulseHeartDemo from "@/registry/default/example/pulse-heart";

export const metadata: Metadata = {
  title: "Pulse Heart",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <PulseHeartDemo />
    </main>
  );
}
