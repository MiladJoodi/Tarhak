import type { Metadata } from "next";

import NestedDropdown from "@/registry/default/example/nested-dropdown";

export const metadata: Metadata = {
  title: "Nested Dropdown",
  robots: { index: false, follow: false },
};

export default function NestedDropdownPreviewPage() {
  return (
    <main className="flex min-h-dvh items-start justify-center bg-background px-4 pt-24">
      <NestedDropdown />
    </main>
  );
}
