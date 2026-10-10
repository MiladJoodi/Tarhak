import type { Metadata } from "next";

import SwipeableListExample from "@/registry/default/example/swipeable-list";

export const metadata: Metadata = {
  title: "Swipeable List",
  robots: { index: false, follow: false },
};

export default function SwipeableListPreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <SwipeableListExample />
    </main>
  );
}
