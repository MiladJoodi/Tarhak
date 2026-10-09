import type { Metadata } from "next";

import PrizeCoins from "@/registry/default/example/prize-coins";

export const metadata: Metadata = {
  title: "Prize Coins",
  robots: { index: false, follow: false },
};

export default function PrizeCoinsPreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f4f6fa] px-4 dark:bg-[#020617]">
      <PrizeCoins />
    </main>
  );
}
