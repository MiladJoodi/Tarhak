import type { Metadata } from "next";

import NumberTickerDemo from "@/registry/default/example/number-ticker";

export const metadata: Metadata = {
  title: "Number Ticker",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <NumberTickerDemo />
    </main>
  );
}
