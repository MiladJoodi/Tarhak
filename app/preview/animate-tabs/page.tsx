import type { Metadata } from "next";

import AnimateTabsDemo from "@/registry/default/example/animate-tabs";

export const metadata: Metadata = {
  title: "Animate Tabs",
  robots: { index: false, follow: false },
};

export default function AnimateTabsPreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <AnimateTabsDemo />
    </main>
  );
}
