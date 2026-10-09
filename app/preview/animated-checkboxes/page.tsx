import type { Metadata } from "next";

import AnimatedCheckboxes from "@/registry/default/example/animated-checkboxes";

export const metadata: Metadata = {
  title: "Animated Checkboxes",
  robots: { index: false, follow: false },
};

export default function AnimatedCheckboxesPreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <AnimatedCheckboxes />
    </main>
  );
}
