import type { Metadata } from "next";

import WakeSliderDemo from "@/registry/default/example/wake-slider";

export const metadata: Metadata = {
  title: "Wake Slider",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background">
      <WakeSliderDemo />
    </main>
  );
}
