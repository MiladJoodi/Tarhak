import type { Metadata } from "next";

import DialVolume from "@/registry/default/example/dial-volume";

export const metadata: Metadata = {
  title: "Dial Volume",
  robots: { index: false, follow: false },
};

export default function DialVolumePreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <DialVolume />
    </main>
  );
}
