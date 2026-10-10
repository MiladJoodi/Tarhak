import type { Metadata } from "next";

import BloomMenuExample from "@/registry/default/example/bloom-menu";

export const metadata: Metadata = {
  title: "Bloom Menu",
  robots: { index: false, follow: false },
};

export default function BloomMenuPreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <BloomMenuExample />
    </main>
  );
}
