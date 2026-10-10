import type { Metadata } from "next";

import MorphingTabsDemo from "@/registry/default/example/morphing-tabs";

export const metadata: Metadata = {
  title: "Morphing Tabs",
  robots: { index: false, follow: false },
};

export default function MorphingTabsPreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-3 py-8 md:px-8">
      <MorphingTabsDemo />
    </main>
  );
}
