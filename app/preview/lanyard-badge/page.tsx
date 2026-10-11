import type { Metadata } from "next";

import LanyardBadgeDemo from "@/registry/default/example/lanyard-badge";

export const metadata: Metadata = {
  title: "Lanyard Badge",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background">
      <LanyardBadgeDemo />
    </main>
  );
}
