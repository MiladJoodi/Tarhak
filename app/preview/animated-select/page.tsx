import type { Metadata } from "next";

import AnimatedSelect from "@/registry/default/example/animated-select";

export const metadata: Metadata = {
  title: "Animated Select",
  robots: { index: false, follow: false },
};

export default function AnimatedSelectPreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <AnimatedSelect />
    </main>
  );
}
