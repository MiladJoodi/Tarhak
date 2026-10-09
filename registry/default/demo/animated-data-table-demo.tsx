"use client";

import AnimatedDataTable from "@/registry/default/example/animated-data-table";

export default function AnimatedDataTableDemo() {
  return (
    <div className="flex h-full w-full min-w-0 items-center justify-center overflow-auto bg-background px-4 py-8">
      <div className="w-full origin-center scale-[0.78] sm:scale-[0.9] md:scale-100">
        <AnimatedDataTable />
      </div>
    </div>
  );
}
