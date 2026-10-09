import type { Metadata } from "next";

import AnimatedSidebars from "@/registry/default/example/animated-sidebars";

export const metadata: Metadata = {
  title: "Animated Sidebars",
  robots: { index: false, follow: false },
};

export default function AnimatedSidebarsPreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-8 md:px-10 md:py-12">
      <AnimatedSidebars />
    </main>
  );
}
