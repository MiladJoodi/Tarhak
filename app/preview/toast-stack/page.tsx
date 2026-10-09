import type { Metadata } from "next";

import ToastStack from "@/registry/default/example/toast-stack";

export const metadata: Metadata = {
  title: "Toast Stack",
  robots: { index: false, follow: false },
};

export default function ToastStackPreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <ToastStack />
    </main>
  );
}
