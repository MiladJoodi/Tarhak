import type { Metadata } from "next";

import AnimatedDonutChart from "@/registry/default/example/animated-donut-chart";

export const metadata: Metadata = {
  title: "Animated Donut Chart",
  robots: { index: false, follow: false },
};

export default function AnimatedDonutChartPreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <AnimatedDonutChart />
    </main>
  );
}
