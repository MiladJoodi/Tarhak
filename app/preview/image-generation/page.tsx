import type { Metadata } from "next";

import ImageGenerationDemo from "@/registry/default/example/image-generation";

export const metadata: Metadata = {
  title: "Image Generation",
  robots: { index: false, follow: false },
};

export default function ImageGenerationPreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-8">
      <ImageGenerationDemo />
    </main>
  );
}
