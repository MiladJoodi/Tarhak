import type { Metadata } from "next";

import AnimatedSwitches from "@/registry/default/example/animated-switches";

export const metadata: Metadata = {
  title: "Animated Switches",
  robots: { index: false, follow: false },
};

export default function AnimatedSwitchesPreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <AnimatedSwitches />
    </main>
  );
}
