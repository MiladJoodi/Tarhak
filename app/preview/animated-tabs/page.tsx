import type { Metadata } from "next";

import AnimatedTabs from "@/registry/default/example/animated-tabs";

export const metadata: Metadata = {
  title: "Animated Tabs",
  robots: { index: false, follow: false },
};

export default function AnimatedTabsPreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f4f6fa] px-4 dark:bg-[#09090b]">
      <AnimatedTabs />
    </main>
  );
}
