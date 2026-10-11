import type { Metadata } from "next";

import StatusMarkDemo from "@/registry/default/example/status-mark";

export const metadata: Metadata = {
  title: "Status Mark",
  robots: { index: false, follow: false },
};

export default function StatusMarkPreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <StatusMarkDemo />
    </main>
  );
}
