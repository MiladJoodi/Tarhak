import type { Metadata } from "next";

import SortableList from "@/registry/default/example/sortable-list";

export const metadata: Metadata = {
  title: "Sortable List",
  robots: { index: false, follow: false },
};

export default function SortableListPreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <SortableList />
    </main>
  );
}
