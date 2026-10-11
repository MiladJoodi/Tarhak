import type { Metadata } from "next";

import LanyardDemo from "@/registry/default/example/lanyard";

export const metadata: Metadata = {
  title: "Lanyard",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-8">
      <LanyardDemo />
    </main>
  );
}
