import type { Metadata } from "next";

import ApprovalCardDemo from "@/registry/default/example/approval-card";

export const metadata: Metadata = {
  title: "Approval Card",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-8">
      <ApprovalCardDemo />
    </main>
  );
}
