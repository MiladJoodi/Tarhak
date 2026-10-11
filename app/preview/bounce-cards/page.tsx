import type { Metadata } from "next";

import BounceCardsDemo from "@/registry/default/example/bounce-cards";

export const metadata: Metadata = {
  title: "Bounce Cards",
  robots: { index: false, follow: false },
};

export default function BounceCardsPreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background">
      <BounceCardsDemo />
    </main>
  );
}
