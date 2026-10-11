import type { Metadata } from "next";

import GlideSelectDemo from "@/registry/default/example/glide-select";

export const metadata: Metadata = {
  title: "Glide Select",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main className="flex min-h-dvh items-center justify-center overflow-visible bg-background">
      <GlideSelectDemo />
    </main>
  );
}
