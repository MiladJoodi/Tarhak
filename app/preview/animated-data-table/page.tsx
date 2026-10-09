import type { Metadata } from "next";

import AnimatedDataTable from "@/registry/default/example/animated-data-table";

export const metadata: Metadata = {
  title: "Animated Data Table",
  robots: { index: false, follow: false },
};

export default function AnimatedDataTablePreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <AnimatedDataTable />
    </main>
  );
}
