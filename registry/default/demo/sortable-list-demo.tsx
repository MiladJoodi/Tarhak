"use client";

import SortableList from "@/registry/default/example/sortable-list";

export default function SortableListDemo() {
  return (
    <div className="flex h-full w-full min-w-0 items-center justify-center overflow-auto bg-background px-4 py-8">
      <SortableList />
    </div>
  );
}
