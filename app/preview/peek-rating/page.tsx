import type { Metadata } from "next";

import PeekRatingDemo from "@/registry/default/example/peek-rating";

export const metadata: Metadata = {
  title: "Peek Rating",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <PeekRatingDemo />
    </main>
  );
}
