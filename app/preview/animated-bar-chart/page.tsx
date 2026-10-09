import type { Metadata } from "next";

import AnimatedBarChart from "@/registry/default/example/animated-bar-chart";

export const metadata: Metadata = {
  title: "Animated Bar Chart",
  robots: { index: false, follow: false },
};

export default function AnimatedBarChartPreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <AnimatedBarChart />
    </main>
  );
}
