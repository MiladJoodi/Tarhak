import type { Metadata } from "next";

import UndoDelete from "@/registry/default/example/undo-delete";

export const metadata: Metadata = {
  title: "Undo Delete",
  robots: { index: false, follow: false },
};

export default function UndoDeletePreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <UndoDelete />
    </main>
  );
}
