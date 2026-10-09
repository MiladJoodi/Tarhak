import type { Metadata } from "next";

import KanbanBoard from "@/registry/default/example/kanban-board";

export const metadata: Metadata = {
  title: "Kanban Board",
  robots: { index: false, follow: false },
};

export default function KanbanBoardPreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-8">
      <KanbanBoard />
    </main>
  );
}
