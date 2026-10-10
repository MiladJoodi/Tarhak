import type { Metadata } from "next";

import TodoListExample from "@/registry/default/example/todo-list";

export const metadata: Metadata = {
  title: "Todo List",
  robots: { index: false, follow: false },
};

export default function TodoListPreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <TodoListExample />
    </main>
  );
}
