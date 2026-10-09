import type { Metadata } from "next";

import TypedCode from "@/registry/default/example/typed-code";

export const metadata: Metadata = {
  title: "Typed Code",
  robots: { index: false, follow: false },
};

export default function TypedCodePreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <TypedCode />
    </main>
  );
}
