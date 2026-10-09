import type { Metadata } from "next";

import HorizontalMenu from "@/registry/default/example/horizontal-menu";

export const metadata: Metadata = {
  title: "Horizontal Menu",
  robots: { index: false, follow: false },
};

export default function HorizontalMenuPreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-3 py-8 md:px-10 md:py-12">
      <HorizontalMenu />
    </main>
  );
}
