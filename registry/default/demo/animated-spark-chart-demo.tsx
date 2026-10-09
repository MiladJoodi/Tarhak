"use client";

import AnimatedSparkChart from "@/registry/default/example/animated-spark-chart";

export default function AnimatedSparkChartDemo() {
  return (
    <div className="flex h-full w-full min-w-0 items-center justify-center overflow-auto px-4 py-8">
      <div className="grid w-full max-w-5xl grid-cols-1 gap-3 sm:grid-cols-3">
        <AnimatedSparkChart
          className="max-w-none"
          label="بازدید امروز"
          value={12840}
          delta={12.4}
          series={[42, 48, 45, 62, 58, 71, 68, 84, 79, 91, 88, 96]}
        />
        <AnimatedSparkChart
          className="max-w-none"
          label="سفارش‌ها"
          value={386}
          delta={-3.2}
          unit="عدد"
          series={[28, 32, 30, 41, 38, 45, 40, 36, 34, 39, 33, 31]}
        />
        <AnimatedSparkChart
          className="max-w-none"
          label="درآمد"
          value={94200000}
          delta={8.1}
          unit="تومان"
          series={[55, 52, 60, 58, 70, 68, 75, 80, 78, 88, 92, 90]}
        />
      </div>
    </div>
  );
}
