import type { Metadata } from "next";

import SwipeRowDemo from "@/registry/default/example/swipe-row";

export const metadata: Metadata = {
  title: "Swipe Row",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background">
      <SwipeRowDemo />
    </main>
  );
}
