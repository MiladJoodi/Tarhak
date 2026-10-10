import type { Metadata } from "next";

import ExpandableActionBarExample from "@/registry/default/example/expandable-action-bar";

export const metadata: Metadata = {
  title: "Expandable Action Bar",
  robots: { index: false, follow: false },
};

export default function ExpandableActionBarPreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <ExpandableActionBarExample />
    </main>
  );
}
