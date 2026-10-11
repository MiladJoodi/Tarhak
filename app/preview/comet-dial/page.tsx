import type { Metadata } from "next";

import CometDialDemo from "@/registry/default/example/comet-dial";

export const metadata: Metadata = {
  title: "Comet Dial",
  robots: { index: false, follow: false },
};

export default function CometDialPreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background">
      <CometDialDemo />
    </main>
  );
}
