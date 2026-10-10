import type { Metadata } from "next";

import SpotlightCardExample from "@/registry/default/example/spotlight-card";

export const metadata: Metadata = {
  title: "Spotlight Card",
  robots: { index: false, follow: false },
};

export default function SpotlightCardPreviewPage() {
  return (
    <main className="min-h-dvh bg-[#0a0a0b]">
      <SpotlightCardExample />
    </main>
  );
}
