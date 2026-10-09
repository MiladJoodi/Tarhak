import type { Metadata } from "next";

import StampApprove from "@/registry/default/example/stamp-approve";

export const metadata: Metadata = {
  title: "Stamp Approve",
  robots: { index: false, follow: false },
};

export default function StampApprovePreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <StampApprove />
    </main>
  );
}
