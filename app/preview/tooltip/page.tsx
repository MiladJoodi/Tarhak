import type { Metadata } from "next";

import Tooltip from "@/registry/default/example/tooltip";

export const metadata: Metadata = {
  title: "Tooltip",
  robots: { index: false, follow: false },
};

export default function TooltipPreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <Tooltip />
    </main>
  );
}
