import type { Metadata } from "next";

import ExpandableCard from "@/registry/default/example/expandable-card";

export const metadata: Metadata = {
  title: "Expandable Card",
  robots: { index: false, follow: false },
};

export default function ExpandableCardPreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <ExpandableCard />
    </main>
  );
}
