import type { Metadata } from "next";

import LoadingStatesExample from "@/registry/default/example/loading-states";

export const metadata: Metadata = {
  title: "Agent Loading States",
  robots: { index: false, follow: false },
};

export default function LoadingStatesPreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <LoadingStatesExample />
    </main>
  );
}
