import type { Metadata } from "next";

import DateField from "@/registry/default/example/date-field";

export const metadata: Metadata = {
  title: "Date Field",
  robots: { index: false, follow: false },
};

export default function DateFieldPreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <DateField />
    </main>
  );
}
