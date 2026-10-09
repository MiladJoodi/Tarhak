"use client";

import KanbanBoard from "@/registry/default/example/kanban-board";

export default function KanbanBoardDemo() {
  return (
    <div className="flex h-full w-full min-w-0 items-center justify-center overflow-auto px-4 py-8">
      <KanbanBoard />
    </div>
  );
}
