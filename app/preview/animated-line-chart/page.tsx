import type { Metadata } from "next";

import AnimatedLineChart from "@/registry/default/example/animated-line-chart";

export const metadata: Metadata = {
  title: "Animated Line Chart",
  robots: { index: false, follow: false },
};

export default function AnimatedLineChartPreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <AnimatedLineChart />
    </main>
  );
}
