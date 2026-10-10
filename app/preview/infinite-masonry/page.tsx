import type { Metadata } from "next";

import InfiniteMasonryExample from "@/registry/default/example/infinite-masonry";

export const metadata: Metadata = {
  title: "Infinite Masonry",
  robots: { index: false, follow: false },
};

export default function InfiniteMasonryPreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <InfiniteMasonryExample />
    </main>
  );
}
