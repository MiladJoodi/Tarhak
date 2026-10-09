import type { Metadata } from "next";

import AnimatedSparkChartDemo from "@/registry/default/demo/animated-spark-chart-demo";

export const metadata: Metadata = {
  title: "Animated Spark Chart",
  robots: { index: false, follow: false },
};

export default function AnimatedSparkChartPreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <AnimatedSparkChartDemo />
    </main>
  );
}
