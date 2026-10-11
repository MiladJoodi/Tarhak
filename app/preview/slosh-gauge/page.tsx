import type { Metadata } from "next";

import SloshGaugeDemo from "@/registry/default/example/slosh-gauge";

export const metadata: Metadata = {
  title: "Slosh Gauge",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background">
      <SloshGaugeDemo />
    </main>
  );
}
