import type { Metadata } from "next";

import LuckWheel from "@/registry/default/example/luck-wheel";

export const metadata: Metadata = {
  title: "Luck Wheel",
  robots: { index: false, follow: false },
};

export default function LuckWheelPreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#020617] px-4">
      <LuckWheel />
    </main>
  );
}
